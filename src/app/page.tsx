"use client"

import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Target, Activity, TrendingUp, Clock, Mountain } from 'lucide-react'
import { DynamicAsciiMountain } from '@/components/ascii/DynamicAsciiMountain'
import { NervTabs, StatusTabContent, AnalysisTabContent } from '@/components/ui/NervTabs'
import { TripPlanningModal, CheckpointModal } from '@/components/ui/NervModals'
import { StatusCard, AnalysisCard, InfoCard } from '@/components/ui/NervCards'
import { RadarDisplay } from '@/components/terminal/TerminalInterface'
import { ResultsDisplay } from '@/components/results/ResultsDisplay'
import { PerformanceChart } from '@/components/analysis/PerformanceChart'
import { NervMap } from '@/components/map/NervMap'

// FIXED Types
interface RouteSegment {
  mile: number
  location: string
  terrain: 'start' | 'flat' | 'steady' | 'boulder' | 'technical'
  elevation: number
}

interface ProgressInput {
  id: number
  mile: string
  time: string
}

interface PredictionResult {
  mile: number
  location: string
  predictedTime: string
  elevation: number
  phase: 'Ascent' | 'Summit' | 'Descent'
  terrain: string
}

interface TerrainAdjustments {
  [key: string]: number
}

interface FatigueData extends TerrainAdjustments {
  fatigue?: number
}

const routeSegments: RouteSegment[] = [
  { mile: 0, location: "Lupine Meadows Trailhead", terrain: "start", elevation: 6732 },
  { mile: 1, location: "Forest Trail", terrain: "flat", elevation: 7332 },
  { mile: 2, location: "Switchbacks Begin", terrain: "flat", elevation: 7932 },
  { mile: 3, location: "Garnet Canyon Junction", terrain: "flat", elevation: 8532 },
  { mile: 3.5, location: "Enter Garnet Canyon", terrain: "steady", elevation: 8707 },
  { mile: 4, location: "Approaching Platforms", terrain: "steady", elevation: 8957 },
  { mile: 4.2, location: "The Platforms", terrain: "steady", elevation: 9200 },
  { mile: 4.7, location: "The Meadows", terrain: "steady", elevation: 9500 },
  { mile: 5.2, location: "Boulder Field Midpoint", terrain: "boulder", elevation: 10475 },
  { mile: 5.7, location: "Middle/South Teton Saddle", terrain: "boulder", elevation: 11450 },
  { mile: 6.1, location: "Lower Southwest Couloir", terrain: "technical", elevation: 12000 },
  { mile: 6.5, location: "Middle Teton Summit", terrain: "technical", elevation: 12804 }
]

const descentMultipliers = {
  flat: 1.8,
  steady: 1.6,
  boulder: 1.3,
  technical: 1.1
}

const Block = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      variants={{
        initial: { scale: 0.5, y: 50, opacity: 0 },
        animate: { scale: 1, y: 0, opacity: 1 }
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
      className={`eva-terminal ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default function PacingCalculator() {
  const [startTime, setStartTime] = useState('04:00')
  const [breakTime, setBreakTime] = useState(30)
  const [flatPace, setFlatPace] = useState(25)
  const [steadyPace, setSteadyPace] = useState(35)
  const [boulderPace, setBoulderPace] = useState(60)
  const [technicalPace, setTechnicalPace] = useState(75)
  
  const [progressInputs, setProgressInputs] = useState<ProgressInput[]>([])
  const [currentPredictions, setCurrentPredictions] = useState<PredictionResult[]>([])
  const [adjustedPaces, setAdjustedPaces] = useState<FatigueData>({})
  const [progressCounter, setProgressCounter] = useState(0)
  const [showResults, setShowResults] = useState(false)

  // Modal States
  const [planningModalOpen, setPlanningModalOpen] = useState(false)
  const [checkpointModalOpen, setCheckpointModalOpen] = useState(false)

  // Get current climber data
  const getCurrentClimberData = () => {
    const validInputs = progressInputs.filter(inp => inp.mile && inp.time)
    if (validInputs.length === 0) return { mile: 0, elevation: 6732, phase: 'Ascent' as const }
    
    const furthest = validInputs.reduce((max, current) => 
      parseFloat(current.mile) > parseFloat(max.mile) ? current : max
    )
    
    const mile = parseFloat(furthest.mile)
    const segment = routeSegments.find(s => s.mile <= mile) || routeSegments[0]
    const phase: 'Ascent' | 'Summit' | 'Descent' = 
      mile >= 6.5 ? 'Summit' : 
      currentPredictions.some(p => p.mile === mile && p.phase === 'Descent') ? 'Descent' : 
      'Ascent'
    
    return { mile, elevation: segment.elevation, phase }
  }

  const getPaceForTerrainOriginal = useCallback((terrain: string): number => {
    switch(terrain) {
      case 'flat': return flatPace
      case 'steady': return steadyPace
      case 'boulder': return boulderPace
      case 'technical': return technicalPace
      default: return 30
    }
  }, [flatPace, steadyPace, boulderPace, technicalPace])

  const getPaceForTerrain = useCallback((terrain: string, isAscent = true): number => {
    let basePace: number
    if (isAscent) {
      basePace = getPaceForTerrainOriginal(terrain)
      
      if (adjustedPaces[terrain] !== undefined) {
        basePace = Math.round(basePace * adjustedPaces[terrain])
      }
    } else {
      const ascentPace = getPaceForTerrain(terrain, true)
      basePace = Math.round(ascentPace / descentMultipliers[terrain as keyof typeof descentMultipliers])
    }
    
    return basePace
  }, [getPaceForTerrainOriginal, adjustedPaces])

  const addMinutesToTime = useCallback((timeStr: string, minutes: number): string => {
    const [hours, mins] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, mins, 0, 0)
    date.setMinutes(date.getMinutes() + minutes)
    return date.toTimeString().slice(0, 5)
  }, [])

  const timeToMinutes = useCallback((timeStr: string): number => {
    const [hours, mins] = timeStr.split(':').map(Number)
    return hours * 60 + mins
  }, [])

  const getTerrainForMile = useCallback((mile: number): string => {
    for (let i = routeSegments.length - 1; i >= 0; i--) {
      if (mile >= routeSegments[i].mile) {
        return routeSegments[i].terrain
      }
    }
    return 'flat'
  }, [])

  const calculateExpectedTime = useCallback((targetMile: number): number => {
    let cumulativeMinutes = 0
    
    for (let i = 0; i < routeSegments.length - 1; i++) {
      const segment = routeSegments[i]
      const nextSegment = routeSegments[i + 1]
      
      if (segment.mile >= targetMile) break
      
      const segmentEnd = Math.min(nextSegment.mile, targetMile)
      const distance = segmentEnd - segment.mile
      
      if (distance > 0) {
        const basePace = getPaceForTerrainOriginal(nextSegment.terrain)
        cumulativeMinutes += distance * basePace
      }
      
      if (nextSegment.mile >= targetMile) break
    }
    
    return cumulativeMinutes
  }, [getPaceForTerrainOriginal])

  const generatePredictions = useCallback((
    startTimeParam: string, 
    fromMile = 0, 
    fromTime: string | null = null
  ): PredictionResult[] => {
    let results: PredictionResult[] = []
    let currentTime = fromTime || startTimeParam
    let cumulativeMinutes = fromTime ? timeToMinutes(fromTime) - timeToMinutes(startTimeParam) : 0
    
    let startIndex = routeSegments.findIndex(seg => seg.mile >= fromMile)
    if (startIndex === -1) startIndex = routeSegments.length - 1

    for (let i = startIndex; i < routeSegments.length; i++) {
      const segment = routeSegments[i]
      
      if (i < routeSegments.length - 1) {
        const nextSegment = routeSegments[i + 1]
        const distance = nextSegment.mile - Math.max(segment.mile, fromMile)
        if (distance > 0) {
          const pace = getPaceForTerrain(nextSegment.terrain, true)
          const segmentTime = distance * pace
          cumulativeMinutes += segmentTime
          currentTime = addMinutesToTime(startTimeParam, cumulativeMinutes)
        }
      }
      
      if (segment.mile >= fromMile) {
        results.push({
          mile: segment.mile,
          location: segment.location,
          predictedTime: currentTime,
          elevation: segment.elevation,
          phase: segment.mile === 6.5 ? 'Summit' : 'Ascent',
          terrain: segment.terrain
        })
      }
    }
    
    cumulativeMinutes += breakTime
    currentTime = addMinutesToTime(startTimeParam, cumulativeMinutes)
    
    const descentSegments = [...routeSegments].reverse()
    for (let i = 1; i < descentSegments.length; i++) {
      const segment = descentSegments[i-1]
      const nextSegment = descentSegments[i]
      const distance = segment.mile - nextSegment.mile
      const pace = getPaceForTerrain(segment.terrain, false)
      const segmentTime = distance * pace
      
      cumulativeMinutes += segmentTime
      currentTime = addMinutesToTime(startTimeParam, cumulativeMinutes)
      
      results.push({
        mile: nextSegment.mile,
        location: nextSegment.location + " (Descent)",
        predictedTime: currentTime,
        elevation: nextSegment.elevation,
        phase: 'Descent',
        terrain: nextSegment.terrain
      })
    }
    
    return results
  }, [breakTime, getPaceForTerrain, addMinutesToTime, timeToMinutes])

  const calculatePaceAdjustments = useCallback(() => {
    const startMinutes = timeToMinutes(startTime)
    const newAdjustedPaces: FatigueData = {}
    
    const fatigueFactors: number[] = []
    const terrainPerformance: { [key: string]: number[] } = {}
    
    progressInputs.forEach(input => {
      if (!input.mile || !input.time) return
      
      const mile = parseFloat(input.mile)
      const actualMinutes = timeToMinutes(input.time)
      const elapsedMinutes = actualMinutes - startMinutes
      
      const expectedMinutes = calculateExpectedTime(mile)
      
      if (expectedMinutes > 0) {
        const performanceRatio = elapsedMinutes / expectedMinutes
        fatigueFactors.push(performanceRatio)
        
        const terrain = getTerrainForMile(mile)
        if (terrain && terrain !== 'start') {
          if (!terrainPerformance[terrain]) {
            terrainPerformance[terrain] = []
          }
          terrainPerformance[terrain].push(performanceRatio)
        }
      }
    })
    
    const overallFatigue = fatigueFactors.length > 0 ? 
      fatigueFactors.reduce((a, b) => a + b, 0) / fatigueFactors.length : 1.0
    
    const terrainAdjustments: { [key: string]: number } = {}
    Object.keys(terrainPerformance).forEach(terrain => {
      const ratios = terrainPerformance[terrain]
      terrainAdjustments[terrain] = ratios.reduce((a, b) => a + b, 0) / ratios.length
    })
    
    ;['flat', 'steady', 'boulder', 'technical'].forEach(terrain => {
      let adjustment = overallFatigue
      
      if (terrainAdjustments[terrain]) {
        adjustment = (terrainAdjustments[terrain] * 0.6) + (overallFatigue * 0.4)
      }
      
      newAdjustedPaces[terrain] = adjustment
    })
    
    newAdjustedPaces.fatigue = overallFatigue
    setAdjustedPaces(newAdjustedPaces)
  }, [startTime, timeToMinutes, progressInputs, calculateExpectedTime, getTerrainForMile])

  const updateAllPredictions = useCallback(() => {
    if (progressInputs.length === 0) {
      alert('ALERT: NO_TRACKING_DATA_AVAILABLE. ADD_CHECKPOINT_FIRST.')
      return
    }

    calculatePaceAdjustments()
    
    const validInputs = progressInputs.filter(inp => inp.mile && inp.time)
    if (validInputs.length === 0) {
      alert('ERROR: INCOMPLETE_DATA_DETECTED. VERIFY_ALL_CHECKPOINT_FIELDS.')
      return
    }
    
    const furthestProgress = validInputs.reduce((max, current) => 
      parseFloat(current.mile) > parseFloat(max.mile) ? current : max
    )
    
    let predictions: PredictionResult[]
    if (parseFloat(furthestProgress.mile) >= 6.5) {
      predictions = generatePredictions(startTime, 6.5, furthestProgress.time)
    } else {
      predictions = generatePredictions(startTime, parseFloat(furthestProgress.mile), furthestProgress.time)
    }
    
    setCurrentPredictions(predictions)
  }, [progressInputs, calculatePaceAdjustments, generatePredictions, startTime])

  const calculateInitialPacing = useCallback(() => {
    setAdjustedPaces({})
    setProgressInputs([])
    setProgressCounter(0)
    const predictions = generatePredictions(startTime)
    setCurrentPredictions(predictions)
    setShowResults(true)
  }, [startTime, generatePredictions])

  const handleCheckpointFromMountain = useCallback((mile: number) => {
    setCheckpointModalOpen(true)
  }, [])

  const handleCheckpointSet = useCallback((mile: number, time: string) => {
    const newCounter = progressCounter + 1
    setProgressCounter(newCounter)
    const newInput: ProgressInput = {
      id: newCounter,
      mile: mile.toString(),
      time: time
    }
    setProgressInputs(prev => [...prev, newInput])
    
    // Auto-update predictions when checkpoint is set
    setTimeout(() => {
      updateAllPredictions()
    }, 100)
  }, [progressCounter, updateAllPredictions])

  const isUpdated = Object.keys(adjustedPaces).length > 0
  const validInputs = progressInputs.filter(inp => inp.mile && inp.time)
  const currentClimber = getCurrentClimberData()
  const currentFatigueLevel = adjustedPaces.fatigue || 1.0

  // Calculate summary stats
  const endTime = currentPredictions[currentPredictions.length - 1]?.predictedTime || startTime
  const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime)
  const summitETA = currentPredictions.find(r => r.mile === 6.5)?.predictedTime
  const returnHour = parseInt(endTime.split(':')[0])

  const tabs = [
    {
      id: 'status',
      label: 'STATUS_MONITOR',
      icon: <Activity className="w-4 h-4" />,
      content: (
        <StatusTabContent>
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-12 gap-4"
          >
            {/* Main Mountain Display - Full Width */}
            <Block className="col-span-12 p-0">
              <DynamicAsciiMountain
                currentMile={currentClimber.mile}
                fatigueLevel={currentFatigueLevel}
                phase={currentClimber.phase}
                onPositionClick={handleCheckpointFromMountain}
                routeSegments={routeSegments}
              />
            </Block>

            {/* Status Cards Grid */}
            <Block className="col-span-12 md:col-span-8 p-4">
              <StatusCard
                fatigueLevel={currentFatigueLevel}
                currentMile={currentClimber.mile}
                elevation={currentClimber.elevation}
                phase={currentClimber.phase}
                nextLocation={
                  currentPredictions.find(p => p.mile > currentClimber.mile)?.location
                }
              />
            </Block>

            <Block className="col-span-6 md:col-span-2 p-0">
              <div className="h-full flex flex-col gap-4">
                <InfoCard
                  title="Current Mile"
                  value={currentClimber.mile.toFixed(1)}
                  subtitle="Position"
                  color="green"
                  icon={<Mountain />}
                  className="flex-1"
                />
                
                <InfoCard
                  title="Elevation"
                  value={`${currentClimber.elevation.toLocaleString()}ft`}
                  subtitle="Above Sea Level"
                  color="orange"
                  icon={<TrendingUp />}
                  className="flex-1"
                />
              </div>
            </Block>

            <Block className="col-span-6 md:col-span-2 p-0">
              <div className="h-full flex flex-col gap-4">
                <div className="eva-terminal p-4 text-center flex-1">
                  <RadarDisplay 
                    currentMile={currentClimber.mile}
                    targetMile={6.5}
                    size={120}
                  />
                </div>
                
                <InfoCard
                  title="Phase"
                  value={currentClimber.phase}
                  subtitle="Current Status"
                  color={currentClimber.phase === 'Summit' ? 'orange' : 'default'}
                  icon={<Target />}
                  className="flex-1"
                />
              </div>
            </Block>

            {/* Tactical Map */}
            <Block className="col-span-12 p-0">
              <NervMap 
                currentMile={currentClimber.mile}
                routeSegments={routeSegments}
              />
            </Block>
          </motion.div>
        </StatusTabContent>
      )
    },
    {
      id: 'analysis',
      label: 'PERFORMANCE_ANALYSIS',
      icon: <TrendingUp className="w-4 h-4" />,
      content: (
        <AnalysisTabContent>
          <motion.div
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.05 }}
            className="grid grid-cols-12 gap-4"
          >
            {/* Analysis Cards */}
            <Block className="col-span-12 md:col-span-8 p-4">
              <AnalysisCard
                adjustedPaces={adjustedPaces}
                predictions={currentPredictions}
                startTime={startTime}
              />
            </Block>

            {/* Summary Stats */}
            <Block className="col-span-12 md:col-span-4 p-0">
              <div className="grid grid-cols-1 gap-4 h-full">
                {showResults && (
                  <>
                    <InfoCard
                      title="Total Time"
                      value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`}
                      subtitle="Complete Mission"
                      color={returnHour >= 17 ? 'red' : 'green'}
                      icon={<Clock />}
                    />
                    
                    <InfoCard
                      title="Summit ETA"
                      value={summitETA || 'N/A'}
                      subtitle="Peak Arrival"
                      color="orange"
                      icon={<Mountain />}
                    />
                    
                    <InfoCard
                      title="Return Time"
                      value={endTime}
                      subtitle="Back to Trailhead"
                      color={returnHour >= 17 ? 'red' : 'green'}
                      icon={<Clock />}
                    />
                    
                    {isUpdated && adjustedPaces.fatigue && (
                      <InfoCard
                        title="Fatigue Factor"
                        value={`${Math.round(((adjustedPaces.fatigue - 1) * 100))}%`}
                        subtitle="Performance Impact"
                        color={adjustedPaces.fatigue > 1.1 ? 'red' : 'green'}
                        icon={<Activity />}
                      />
                    )}
                  </>
                )}
              </div>
            </Block>

            {/* Performance Chart */}
            {isUpdated && (
              <Block className="col-span-12 p-0">
                <PerformanceChart
                  adjustedPaces={adjustedPaces}
                  progressInputs={progressInputs}
                  startTime={startTime}
                  timeToMinutes={timeToMinutes}
                  calculateExpectedTime={calculateExpectedTime}
                />
              </Block>
            )}

            {/* Full Results Display */}
            {showResults && (
              <Block className="col-span-12 p-0">
                <ResultsDisplay
                  predictions={currentPredictions}
                  startTime={startTime}
                  adjustedPaces={adjustedPaces}
                  validInputs={validInputs}
                  isUpdated={isUpdated}
                  timeToMinutes={timeToMinutes}
                  getPaceForTerrainOriginal={getPaceForTerrainOriginal}
                />
              </Block>
            )}
          </motion.div>
        </AnalysisTabContent>
      )
    }
  ]

  return (
    <div className="space-y-8">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 justify-center mb-8"
      >
        <button
          onClick={() => setPlanningModalOpen(true)}
          className="eva-button px-6 py-3 flex items-center gap-2"
        >
          <Calculator className="w-4 h-4" />
          CONFIGURE_MISSION_PARAMETERS
        </button>
        
        <button
          onClick={() => setCheckpointModalOpen(true)}
          className="eva-button px-6 py-3 flex items-center gap-2"
          disabled={!showResults}
        >
          <Target className="w-4 h-4" />
          SET_CHECKPOINT
        </button>
      </motion.div>

      {/* Main Tab Interface */}
      {showResults ? (
        <NervTabs tabs={tabs} defaultTab="status" />
      ) : (
        <Block className="col-span-12 text-center py-20">
          <div className="eva-text-green text-xl mb-4">
            NERV MISSION CONTROL SYSTEM
          </div>
          <div className="eva-text mb-8">
            CONFIGURE_MISSION_PARAMETERS_TO_BEGIN_TACTICAL_ANALYSIS
          </div>
          <button
            onClick={() => setPlanningModalOpen(true)}
            className="eva-button px-8 py-4 text-lg"
          >
            INITIATE_MISSION_PLANNING
          </button>
        </Block>
      )}

      {/* Modals */}
      <TripPlanningModal
        isOpen={planningModalOpen}
        setIsOpen={setPlanningModalOpen}
        startTime={startTime}
        setStartTime={setStartTime}
        breakTime={breakTime}
        setBreakTime={setBreakTime}
        flatPace={flatPace}
        setFlatPace={setFlatPace}
        steadyPace={steadyPace}
        setSteadyPace={setSteadyPace}
        boulderPace={boulderPace}
        setBoulderPace={setBoulderPace}
        technicalPace={technicalPace}
        setTechnicalPace={setTechnicalPace}
        onCalculate={calculateInitialPacing}
      />

      <CheckpointModal
        isOpen={checkpointModalOpen}
        setIsOpen={setCheckpointModalOpen}
        routeSegments={routeSegments}
        onCheckpointSet={handleCheckpointSet}
      />
    </div>
  )
}