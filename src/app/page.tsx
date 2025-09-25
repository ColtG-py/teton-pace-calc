"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, RefreshCw, Trash2, Target, Calculator } from "lucide-react"

// Types
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

interface AdjustedPaces {
  [key: string]: number
  fatigue?: number
}

// Route segments with distances and terrain types
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

// Research-based descent speed multipliers
const descentMultipliers = {
  flat: 1.8,
  steady: 1.6,
  boulder: 1.3,
  technical: 1.1
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
  const [adjustedPaces, setAdjustedPaces] = useState<AdjustedPaces>({})
  const [progressCounter, setProgressCounter] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [showTracking, setShowTracking] = useState(false)

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

    // Calculate ascent from starting point
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
    
    // Add break time at summit
    cumulativeMinutes += breakTime
    currentTime = addMinutesToTime(startTimeParam, cumulativeMinutes)
    
    // Calculate descent
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

  const calculateInitialPacing = useCallback(() => {
    setAdjustedPaces({})
    setProgressInputs([])
    const predictions = generatePredictions(startTime)
    setCurrentPredictions(predictions)
    setShowResults(true)
    setShowTracking(true)
  }, [startTime, generatePredictions])

  const addProgressInput = useCallback(() => {
    const newCounter = progressCounter + 1
    setProgressCounter(newCounter)
    const newInput: ProgressInput = {
      id: newCounter,
      mile: '',
      time: ''
    }
    setProgressInputs(prev => [...prev, newInput])
  }, [progressCounter])

  const removeProgressInput = useCallback((id: number) => {
    setProgressInputs(prev => prev.filter(input => input.id !== id))
  }, [])

  const updateProgressInput = useCallback((id: number, field: 'mile' | 'time', value: string) => {
    setProgressInputs(prev => prev.map(input => 
      input.id === id ? { ...input, [field]: value } : input
    ))
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

  const calculatePaceAdjustments = useCallback(() => {
    const startMinutes = timeToMinutes(startTime)
    const newAdjustedPaces: AdjustedPaces = {}
    
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
      alert('Please add at least one progress input first.')
      return
    }

    calculatePaceAdjustments()
    
    const validInputs = progressInputs.filter(inp => inp.mile && inp.time)
    if (validInputs.length === 0) {
      alert('Please fill in both mile and time for at least one progress input.')
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

  const clearProgress = useCallback(() => {
    setProgressInputs([])
    setAdjustedPaces({})
    setProgressCounter(0)
    calculateInitialPacing()
  }, [calculateInitialPacing])

  const getFatigueRowClass = useCallback((result: PredictionResult, validInputs: ProgressInput[]) => {
    const isActualPoint = validInputs.some(p => Math.abs(parseFloat(p.mile) - result.mile) < 0.1)
    if (isActualPoint) {
      return 'bg-blue-50 dark:bg-blue-950 font-semibold'
    } else if (Object.keys(adjustedPaces).length > 0 && adjustedPaces[result.terrain]) {
      const fatigueLevel = adjustedPaces[result.terrain]
      if (fatigueLevel > 1.15) {
        return 'bg-red-50 dark:bg-red-950 border-l-4 border-red-500'
      } else if (fatigueLevel > 1.05) {
        return 'bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500'
      } else if (fatigueLevel < 0.95) {
        return 'bg-green-50 dark:bg-green-950 border-l-4 border-green-500'
      }
    }
    return ''
  }, [adjustedPaces])

  const isUpdated = Object.keys(adjustedPaces).length > 0
  const validInputs = progressInputs.filter(inp => inp.mile && inp.time)

  return (
    <div className="space-y-8">
      {/* Trip Planning Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Trip Planning Inputs
          </CardTitle>
          <CardDescription>
            Configure your expected pacing and start time for the Middle Teton Southwest Couloir route
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breakTime">Break Time at Summit (minutes)</Label>
              <Input
                id="breakTime"
                type="number"
                min="0"
                value={breakTime}
                onChange={(e) => setBreakTime(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">🚶 Ascent Pacing (minutes per mile)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flatPace">Flat/Slight Incline (Trail miles 0-3)</Label>
                <Input
                  id="flatPace"
                  type="number"
                  min="10"
                  max="60"
                  value={flatPace}
                  onChange={(e) => setFlatPace(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="steadyPace">Steady Incline (miles 3-4.7)</Label>
                <Input
                  id="steadyPace"
                  type="number"
                  min="15"
                  max="90"
                  value={steadyPace}
                  onChange={(e) => setSteadyPace(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="boulderPace">Boulder Scramble (miles 4.7-5.7)</Label>
                <Input
                  id="boulderPace"
                  type="number"
                  min="30"
                  max="120"
                  value={boulderPace}
                  onChange={(e) => setBoulderPace(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalPace">Grade 3-4 Ascent (miles 5.7-6.5)</Label>
                <Input
                  id="technicalPace"
                  type="number"
                  min="45"
                  max="150"
                  value={technicalPace}
                  onChange={(e) => setTechnicalPace(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground italic">
              🔄 Descent paces are auto-calculated based on mountaineering research:
              Flat terrain 1.8x faster, Steady 1.6x faster, Boulder 1.3x faster, Technical 1.1x faster
            </div>

            <Button onClick={calculateInitialPacing} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Calculate Initial Trip Pacing
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Progress Tracking Section */}
      {showTracking && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Real-Time Progress Tracking
            </CardTitle>
            <CardDescription>
              Input your current position and time to update all future predictions based on your actual performance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {progressInputs.map((input) => (
                <Card key={input.id} className="p-4 bg-muted/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Mile Position (0-6.5)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="6.5"
                        step="0.1"
                        value={input.mile}
                        onChange={(e) => updateProgressInput(input.id, 'mile', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Time</Label>
                      <Input
                        type="time"
                        value={input.time}
                        onChange={(e) => updateProgressInput(input.id, 'time', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2"
                    onClick={() => removeProgressInput(input.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </Card>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={addProgressInput}>
                <Plus className="mr-2 h-4 w-4" />
                Add Current Position
              </Button>
              <Button onClick={updateAllPredictions}>
                <Target className="mr-2 h-4 w-4" />
                Update All Predictions
              </Button>
              <Button variant="outline" onClick={clearProgress}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {showResults && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Your Pacing Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            {currentPredictions.length > 0 && (
              <div>
                {(() => {
                  const endTime = currentPredictions[currentPredictions.length - 1]?.predictedTime || startTime
                  const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime)
                  const totalHours = Math.floor(totalMinutes / 60)
                  const totalMins = totalMinutes % 60
                  const summitETA = currentPredictions.find(r => r.mile === 6.5)?.predictedTime

                  return (
                    <div className="bg-blue-600 text-white p-4 rounded-lg text-center">
                      <div className="text-lg font-semibold">
                        🕐 Trip Summary {isUpdated && validInputs.length > 0 ? `(Updated from Mile ${Math.max(...validInputs.map(p => parseFloat(p.mile)))})` : ''}: {startTime} start → {endTime} return
                      </div>
                      <div className="mt-2">
                        ⏱️ Total Time: {totalHours}h {totalMins}m | 🎯 Summit ETA: {summitETA}
                      </div>
                    </div>
                  )
                })()}

                {/* Late return warning */}
                {(() => {
                  const endTime = currentPredictions[currentPredictions.length - 1]?.predictedTime || startTime
                  const returnHour = parseInt(endTime.split(':')[0])
                  return returnHour >= 17 ? (
                    <div className="bg-red-600 text-white p-3 rounded-lg font-semibold">
                      ⚠️ WARNING: Late return time increases risk. Consider faster pacing or earlier start.
                    </div>
                  ) : null
                })()}

                {/* Performance analysis */}
                {isUpdated && Object.keys(adjustedPaces).length > 0 && (
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    {(() => {
                      const fatiguePercent = Math.round(((adjustedPaces.fatigue || 1) - 1) * 100)
                      const fatigueDesc = fatiguePercent > 15 ? " (High fatigue - affects all terrain)" : 
                                        fatiguePercent > 5 ? " (Moderate fatigue)" : 
                                        fatiguePercent < -5 ? " (Strong performance - ahead of schedule)" : " (On target)"
                      
                      return (
                        <div>
                          <div className="font-semibold">📊 Performance Analysis: Overall Fatigue: {fatiguePercent > 0 ? '+' : ''}{fatiguePercent}%{fatigueDesc}</div>
                          <div className="mt-1">
                            <span className="font-semibold">Terrain Adjustments:</span> {' '}
                            {['flat', 'steady', 'boulder', 'technical'].map(terrain => {
                              if (adjustedPaces[terrain]) {
                                const percentage = Math.round((adjustedPaces[terrain] - 1) * 100)
                                return `${terrain}: ${percentage > 0 ? '+' : ''}${percentage}% `
                              }
                              return null
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Main Results Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mile</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>{isUpdated ? 'Updated ETA' : 'Predicted ETA'}</TableHead>
                    <TableHead>Elevation</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Terrain</TableHead>
                    {isUpdated && <TableHead>Fatigue Impact</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPredictions.map((result, index) => (
                    <TableRow key={index} className={getFatigueRowClass(result, validInputs)}>
                      <TableCell>{result.mile}</TableCell>
                      <TableCell>{result.location}</TableCell>
                      <TableCell className="font-semibold">{result.predictedTime}</TableCell>
                      <TableCell>{result.elevation.toLocaleString()}ft</TableCell>
                      <TableCell>
                        <Badge variant={result.phase === 'Summit' ? 'default' : result.phase === 'Ascent' ? 'secondary' : 'outline'}>
                          {result.phase}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{result.terrain}</TableCell>
                      {isUpdated && (
                        <TableCell>
                          {adjustedPaces[result.terrain] && (
                            (() => {
                              const impact = Math.round(((adjustedPaces[result.terrain] || 1) - 1) * 100)
                              return (
                                <span className={`font-bold ${impact > 0 ? 'text-red-600' : impact < 0 ? 'text-green-600' : ''}`}>
                                  {impact > 0 ? '+' : ''}{impact}%
                                </span>
                              )
                            })()
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Adjusted Pacing Rates */}
            {isUpdated && Object.keys(adjustedPaces).length > 0 && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-xl font-semibold">📈 Adjusted Pacing Rates</h3>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm">
                  <span className="font-semibold">🧠 Fatigue Modeling:</span> Paces are adjusted using both terrain-specific performance (60%) and overall fatigue factor (40%). 
                  If you&apos;re consistently behind schedule, fatigue is applied to ALL terrain types, recognizing that tiredness affects performance across all conditions.
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Terrain Type</TableHead>
                        <TableHead>Original Pace (min/mile)</TableHead>
                        <TableHead>Adjusted Pace (min/mile)</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Ascent/Descent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {['flat', 'steady', 'boulder', 'technical'].map((terrain) => {
                        const originalAscent = getPaceForTerrainOriginal(terrain)
                        const adjustedAscent = Math.round(originalAscent * (adjustedPaces[terrain] || 1))
                        const originalDescent = Math.round(originalAscent / descentMultipliers[terrain as keyof typeof descentMultipliers])
                        const adjustedDescent = Math.round(adjustedAscent / descentMultipliers[terrain as keyof typeof descentMultipliers])
                        const change = Math.round(((adjustedPaces[terrain] || 1) - 1) * 100)

                        return (
                          <TableRow key={terrain}>
                            <TableCell className="capitalize font-semibold">{terrain}</TableCell>
                            <TableCell>{originalAscent} / {originalDescent}</TableCell>
                            <TableCell className="font-semibold">{adjustedAscent} / {adjustedDescent}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${change > 0 ? 'text-red-600' : change < 0 ? 'text-green-600' : ''}`}>
                                {change > 0 ? '+' : ''}{change}%
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">Up / Down</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="text-sm text-muted-foreground italic">
                  💡 Adjusted paces include both terrain-specific performance and cumulative fatigue effects.
                  Descent speeds calculated using research-based ratios.
                </div>

                {/* Fatigue Legend */}
                <div className="text-sm">
                  <span className="font-semibold">Fatigue Impact Legend:</span>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-4 bg-green-50 dark:bg-green-950 border-l-4 border-green-500"></div>
                      <span>Ahead of pace</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-4 bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500"></div>
                      <span>Moderate fatigue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-4 bg-red-50 dark:bg-red-950 border-l-4 border-red-500"></div>
                      <span>High fatigue impact</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mathematical Models Section */}
      <Card>
        <CardHeader>
          <CardTitle>🧮 Mathematical Models & Formulas</CardTitle>
          <CardDescription>Understanding the calculations behind your pacing predictions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">1. Basic Time Calculation</h3>
              <div className="bg-muted p-4 border-l-4 border-blue-500 space-y-2">
                <div><strong>Segment Time = Distance × Pace</strong></div>
                <code className="text-sm">time_minutes = (mile_end - mile_start) × pace_per_mile</code>
                <br />
                <div><strong>Cumulative Time = Start Time + Σ(Segment Times)</strong></div>
                <code className="text-sm">ETA = start_time + Σ(distance_i × pace_i) + break_time</code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">2. Research-Based Descent Speed Multipliers</h3>
              <div className="bg-muted p-4 border-l-4 border-green-500 space-y-2">
                <div>Based on mountaineering research (Naismith&apos;s Rule, Alpine Club standards):</div>
                <div><strong>Descent Pace = Ascent Pace ÷ Terrain Multiplier</strong></div>
                <div className="font-mono text-sm space-y-1">
                  <div>• Flat terrain: descent_pace = ascent_pace ÷ 1.8</div>
                  <div>• Steady inclines: descent_pace = ascent_pace ÷ 1.6</div>
                  <div>• Boulder scrambles: descent_pace = ascent_pace ÷ 1.3</div>
                  <div>• Technical (Class 3-4): descent_pace = ascent_pace ÷ 1.1</div>
                </div>
                <div className="text-sm italic">Rationale: Descent advantage decreases with terrain difficulty due to safety considerations and loose rock hazards.</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">3. Performance Ratio & Fatigue Calculation</h3>
              <div className="bg-muted p-4 border-l-4 border-yellow-500 space-y-2">
                <div><strong>Performance Ratio (for each progress input):</strong></div>
                <code className="text-sm">performance_ratio = actual_elapsed_time ÷ expected_elapsed_time</code>
                <br />
                <div><strong>Overall Fatigue Factor:</strong></div>
                <code className="text-sm">fatigue_factor = Σ(performance_ratios) ÷ number_of_inputs</code>
                <br />
                <div><strong>Terrain-Specific Performance:</strong></div>
                <code className="text-sm">terrain_performance[terrain] = average(performance_ratios_for_terrain)</code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">4. Blended Pace Adjustment Formula</h3>
              <div className="bg-muted p-4 border-l-4 border-red-500 space-y-2">
                <div><strong>For terrain with specific data:</strong></div>
                <code className="text-sm">adjusted_pace = original_pace × [(terrain_performance × 0.6) + (fatigue_factor × 0.4)]</code>
                <br />
                <div><strong>For terrain without specific data:</strong></div>
                <code className="text-sm">adjusted_pace = original_pace × fatigue_factor</code>
                <br />
                <div><strong>Final Segment Time:</strong></div>
                <code className="text-sm">updated_time = current_position_time + (remaining_distance × adjusted_pace)</code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">5. Expected Time Calculation (for comparison)</h3>
              <div className="bg-muted p-4 border-l-4 border-purple-500">
                <pre className="text-sm font-mono whitespace-pre-wrap">
{`expected_time_to_mile = 0
for each segment from start to target_mile:
    segment_distance = min(segment_end, target_mile) - segment_start
    if segment_distance > 0:
        expected_time_to_mile += segment_distance × original_pace[terrain]`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">6. Terrain Classification by Mile</h3>
              <div className="bg-muted p-4 border-l-4 border-cyan-500 space-y-2">
                <div><strong>Route Segments & Terrain Assignment:</strong></div>
                <div className="font-mono text-sm space-y-1">
                  <div>• Miles 0-3.0: &quot;flat&quot; terrain (forest trail, switchbacks)</div>
                  <div>• Miles 3.0-4.7: &quot;steady&quot; terrain (Garnet Canyon to Meadows)</div>
                  <div>• Miles 4.7-5.7: &quot;boulder&quot; terrain (boulder fields to saddle)</div>
                  <div>• Miles 5.7-6.5: &quot;technical&quot; terrain (Southwest Couloir, Class 3-4)</div>
                </div>
                <div>Function: <code className="text-sm">getTerrainForMile(mile) → terrain_type</code></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">7. Update Logic Flow</h3>
              <div className="bg-muted p-4 border-l-4 border-gray-500">
                <div><strong>Step-by-step process:</strong></div>
                <ol className="font-mono text-sm space-y-1 list-decimal list-inside mt-2">
                  <li>Calculate performance_ratio for each progress input</li>
                  <li>Compute overall fatigue_factor (average of all ratios)</li>
                  <li>Calculate terrain-specific adjustments where data exists</li>
                  <li>Blend terrain + fatigue using 60/40 weighting</li>
                  <li>Find furthest progress point</li>
                  <li>Generate new predictions from that point forward using adjusted paces</li>
                  <li>Apply break time at summit</li>
                  <li>Calculate descent using research-based multipliers</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">8. Example Calculation</h3>
              <div className="bg-green-50 dark:bg-green-950 p-4 border-l-4 border-green-500 space-y-2">
                <div><strong>Scenario:</strong> Predicted Boulder Midpoint (Mile 5.2) at 10:30, Actual arrival at 11:10</div>
                <div className="font-mono text-sm space-y-1">
                  <div>• Expected time to Mile 5.2: 390 minutes (6h 30m from 4:00 start)</div>
                  <div>• Actual time to Mile 5.2: 430 minutes (7h 10m from 4:00 start)</div>
                  <div>• Performance ratio: 430 ÷ 390 = 1.103 (10.3% slower)</div>
                  <div>• Boulder terrain adjustment: 1.103</div>
                  <div>• Overall fatigue factor: 1.103</div>
                  <div>• Adjusted boulder pace: 60 × 1.103 = 66 min/mile</div>
                  <div>• Time to saddle: 11:10 + (0.5 miles × 66 min/mile) = 11:43</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg text-sm">
              <div><strong>💡 Key Insights:</strong></div>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Fatigue affects ALL future terrain types, not just the one you&apos;re currently on</li>
                <li>Descent speeds are calculated dynamically based on adjusted ascent paces</li>
                <li>The 60/40 blend ensures terrain expertise is weighted more than general fatigue</li>
                <li>Break times and elevation changes are preserved in all calculations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}