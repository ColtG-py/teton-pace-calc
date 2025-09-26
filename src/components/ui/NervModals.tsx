import { AnimatePresence, motion } from "framer-motion"
import { Dispatch, SetStateAction, useState } from "react"
import { Calculator, Target, X } from "lucide-react"

interface NervModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  title: string
  children: React.ReactNode
  icon?: React.ReactNode
}

export const NervModal: React.FC<NervModalProps> = ({
  isOpen,
  setIsOpen,
  title,
  children,
  icon
}) => {
  console.log('NervModal render - isOpen:', isOpen, 'title:', title)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 grid place-items-center overflow-y-scroll cursor-pointer bg-black/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="eva-terminal w-full max-w-4xl shadow-2xl cursor-default relative overflow-hidden"
            style={{
              boxShadow: '0 0 50px rgba(255, 102, 0, 0.3), inset 0 0 50px rgba(255, 102, 0, 0.1)'
            }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 eva-grid opacity-20" />
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-20 eva-button p-2"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative z-10 p-6">
              {/* Header */}
              <div className="eva-border-green p-4 mb-6 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10">
                <div className="flex items-center gap-3">
                  {icon && (
                    <div className="eva-text-green text-2xl">
                      {icon}
                    </div>
                  )}
                  <div>
                    <h3 className="eva-title text-2xl mb-1">
                      {title}
                    </h3>
                    <div className="eva-text-green text-xs">
                      CLASSIFICATION: RESTRICTED | ACCESS_LEVEL: AUTHORIZED
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6">
                {children}
              </div>

              {/* Footer Status */}
              <div className="eva-status-bar mt-6 text-center">
                CONNECTION: SECURE | DATA_ENCRYPTED | STATUS: ACTIVE
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Trip Planning Modal
interface TripPlanningModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  startTime: string
  setStartTime: (time: string) => void
  breakTime: number
  setBreakTime: (time: number) => void
  flatPace: number
  setFlatPace: (pace: number) => void
  steadyPace: number
  setSteadyPace: (pace: number) => void
  boulderPace: number
  setBoulderPace: (pace: number) => void
  technicalPace: number
  setTechnicalPace: (pace: number) => void
  onCalculate: () => void
}

export const TripPlanningModal: React.FC<TripPlanningModalProps> = ({
  isOpen,
  setIsOpen,
  startTime,
  setStartTime,
  breakTime,
  setBreakTime,
  flatPace,
  setFlatPace,
  steadyPace,
  setSteadyPace,
  boulderPace,
  setBoulderPace,
  technicalPace,
  setTechnicalPace,
  onCalculate
}) => {
  const handleCalculate = () => {
    onCalculate()
    setIsOpen(false)
  }

  return (
    <NervModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="MISSION_PLANNING_PARAMETERS"
      icon={<Calculator />}
    >
      {/* Primary Configuration */}
      <div className="eva-border-green p-4">
        <div className="eva-text-green text-sm mb-4 font-bold">
          PRIMARY_MISSION_PARAMETERS:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="eva-text text-xs block">MISSION_START_TIME:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="eva-input w-full p-3"
            />
          </div>
          
          <div className="space-y-2">
            <label className="eva-text text-xs block">SUMMIT_REST_DURATION (MINUTES):</label>
            <input
              type="number"
              min="0"
              value={breakTime}
              onChange={(e) => setBreakTime(parseInt(e.target.value))}
              className="eva-input w-full p-3"
            />
          </div>
        </div>
      </div>

      {/* Pace Matrix */}
      <div className="eva-border p-4">
        <div className="eva-text text-sm mb-4 font-bold">
          PACE_MATRIX_CONFIGURATION (MIN/MILE):
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="eva-border-green p-3 space-y-2">
              <label className="eva-text-green text-xs block font-bold">
                TERRAIN_TYPE_01: FLAT/SLIGHT_INCLINE
              </label>
              <div className="eva-text text-xs opacity-70">
                → TRAIL_MILES: 0.0 - 3.0
              </div>
              <input
                type="number"
                min="10"
                max="60"
                value={flatPace}
                onChange={(e) => setFlatPace(parseInt(e.target.value))}
                className="eva-input w-full p-2"
              />
            </div>
            
            <div className="eva-border-green p-3 space-y-2">
              <label className="eva-text-green text-xs block font-bold">
                TERRAIN_TYPE_02: STEADY_INCLINE
              </label>
              <div className="eva-text text-xs opacity-70">
                → TRAIL_MILES: 3.0 - 4.7
              </div>
              <input
                type="number"
                min="15"
                max="90"
                value={steadyPace}
                onChange={(e) => setSteadyPace(parseInt(e.target.value))}
                className="eva-input w-full p-2"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="eva-border-green p-3 space-y-2">
              <label className="eva-text-green text-xs block font-bold">
                TERRAIN_TYPE_03: BOULDER_SCRAMBLE
              </label>
              <div className="eva-text text-xs opacity-70">
                → TRAIL_MILES: 4.7 - 5.7
              </div>
              <input
                type="number"
                min="30"
                max="120"
                value={boulderPace}
                onChange={(e) => setBoulderPace(parseInt(e.target.value))}
                className="eva-input w-full p-2"
              />
            </div>
            
            <div className="eva-border-green p-3 space-y-2">
              <label className="eva-text-green text-xs block font-bold">
                TERRAIN_TYPE_04: TECHNICAL_ASCENT
              </label>
              <div className="eva-text text-xs opacity-70">
                → TRAIL_MILES: 5.7 - 6.5 [CLASS_3-4]
              </div>
              <input
                type="number"
                min="45"
                max="150"
                value={technicalPace}
                onChange={(e) => setTechnicalPace(parseInt(e.target.value))}
                className="eva-input w-full p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Information Panel */}
      <div className="eva-border-green p-4 bg-gradient-to-r from-transparent via-green-500/5 to-transparent">
        <div className="eva-text-green text-xs">
          <div className="font-bold mb-2">DESCENT_CALCULATION_PROTOCOL:</div>
          <div className="grid grid-cols-2 gap-2 pl-4">
            <div>• TERRAIN_01 → DESCENT_MULTIPLIER: 1.8x</div>
            <div>• TERRAIN_02 → DESCENT_MULTIPLIER: 1.6x</div>
            <div>• TERRAIN_03 → DESCENT_MULTIPLIER: 1.3x</div>
            <div>• TERRAIN_04 → DESCENT_MULTIPLIER: 1.1x</div>
          </div>
          <div className="mt-3 text-xs italic opacity-80">
            ℹ DESCENT_RATES_AUTO_CALCULATED_FROM_MOUNTAINEERING_RESEARCH_DATA
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(false)}
          className="eva-button flex-1 py-3 opacity-70 hover:opacity-100"
        >
          CANCEL_OPERATION
        </button>
        <button
          onClick={handleCalculate}
          className="eva-button flex-1 py-3 bg-green-500/20 eva-border-green"
        >
          EXECUTE_ROUTE_CALCULATION
        </button>
      </div>
    </NervModal>
  )
}

// Checkpoint Modal with Interactive Mountain
interface CheckpointModalProps {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  routeSegments: Array<{
    mile: number
    location: string
    terrain: string
    elevation: number
  }>
  onCheckpointSet: (mile: number, time: string) => void
}

export const CheckpointModal: React.FC<CheckpointModalProps> = ({
  isOpen,
  setIsOpen,
  routeSegments,
  onCheckpointSet
}) => {
  const [selectedMile, setSelectedMile] = useState<number>(0)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [dragPosition, setDragPosition] = useState<number>(0)

  const handleDrag = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const mile = Math.max(0, Math.min(6.5, percentage * 6.5))
    setDragPosition(mile)
    setSelectedMile(mile)
  }

  const handleSetCheckpoint = () => {
    if (selectedTime) {
      onCheckpointSet(selectedMile, selectedTime)
      setIsOpen(false)
      setSelectedMile(0)
      setSelectedTime('')
      setDragPosition(0)
    }
  }

  // Create simplified mountain profile for dragging
  const createDragProfile = () => {
    const width = 100
    const points: string[] = []
    
    for (let i = 0; i <= width; i++) {
      const mile = (i / width) * 6.5
      const segment = routeSegments.find(s => s.mile <= mile) || routeSegments[0]
      const heightPercent = ((segment.elevation - 6732) / (12804 - 6732)) * 100
      points.push(`${i},${100 - heightPercent * 0.8}`)
    }
    
    return points.join(' ')
  }

  return (
    <NervModal
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      title="CHECKPOINT_CONFIGURATION_INTERFACE"
      icon={<Target />}
    >
      {/* Interactive Mountain Profile */}
      <div className="eva-border-green p-6">
        <div className="eva-text-green text-sm mb-4 font-bold">
          INTERACTIVE_ROUTE_SELECTION:
        </div>
        
        <div 
          className="relative h-48 eva-border cursor-crosshair bg-gradient-to-b from-black via-gray-900 to-black"
          onMouseMove={handleDrag}
          onClick={handleDrag}
        >
          {/* SVG Mountain Profile */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 255, 65, 0.3)" />
                <stop offset="100%" stopColor="rgba(0, 255, 65, 0.1)" />
              </linearGradient>
            </defs>
            
            {/* Mountain Fill */}
            <polygon
              points={`0,100 ${createDragProfile()} 100,100`}
              fill="url(#mountainGradient)"
              stroke="rgba(0, 255, 65, 0.5)"
              strokeWidth="0.2"
            />
            
            {/* Route Milestones */}
            {routeSegments.map((segment) => {
              const x = (segment.mile / 6.5) * 100
              const heightPercent = ((segment.elevation - 6732) / (12804 - 6732)) * 100
              const y = 100 - heightPercent * 0.8
              
              return (
                <circle
                  key={segment.mile}
                  cx={x}
                  cy={y}
                  r="1"
                  fill="rgba(255, 102, 0, 0.8)"
                  stroke="rgba(255, 102, 0, 1)"
                  strokeWidth="0.5"
                />
              )
            })}
            
            {/* Draggable Climber */}
            <motion.g
              animate={{ x: (dragPosition / 6.5) * 100 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <circle
                cx="0"
                cy={100 - ((routeSegments.find(s => s.mile <= dragPosition)?.elevation || 6732) - 6732) / (12804 - 6732) * 80}
                r="2"
                fill="rgba(255, 255, 255, 1)"
                stroke="rgba(255, 102, 0, 1)"
                strokeWidth="1"
              />
            </motion.g>
          </svg>
          
          {/* Position Indicator */}
          <div 
            className="absolute bottom-2 bg-black/80 eva-border-green p-2 text-xs"
            style={{ left: `${(dragPosition / 6.5) * 100}%`, transform: 'translateX(-50%)' }}
          >
            <div className="eva-text-green">MILE: {dragPosition.toFixed(2)}</div>
            <div className="eva-text">
              {(() => {
                // Find the closest segment for current position
                let closestSegment = routeSegments[0]
                let minDistance = Math.abs(dragPosition - routeSegments[0].mile)
                
                for (const segment of routeSegments) {
                  const distance = Math.abs(dragPosition - segment.mile)
                  if (distance < minDistance) {
                    minDistance = distance
                    closestSegment = segment
                  }
                }
                
                return closestSegment.location
              })()}
            </div>
          </div>
        </div>

        <div className="mt-4 eva-text-green text-xs">
          DRAG_CLIMBER_ICON_TO_SET_POSITION | CLICK_ANYWHERE_ON_ROUTE
        </div>
      </div>

      {/* Checkpoint Details */}
      <div className="eva-border p-4">
        <div className="eva-text text-sm mb-4 font-bold">
          CHECKPOINT_DETAILS:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="eva-text-green text-xs block">POSITION (MILES):</label>
            <input
              type="number"
              min="0"
              max="6.5"
              step="0.1"
              value={selectedMile.toFixed(1)}
              onChange={(e) => {
                const mile = parseFloat(e.target.value)
                setSelectedMile(mile)
                setDragPosition(mile)
              }}
              className="eva-input w-full p-3"
            />
          </div>
          
          <div className="space-y-2">
            <label className="eva-text-green text-xs block">ARRIVAL_TIME:</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="eva-input w-full p-3"
            />
          </div>
        </div>

        {/* Location Info */}
        {selectedMile > 0 && (
          <div className="mt-4 eva-border-green p-3 bg-green-500/5">
            <div className="eva-text-green text-xs">
              LOCATION: {routeSegments.find(s => s.mile <= selectedMile)?.location || 'Unknown'}
              <br />
              ELEVATION: {(routeSegments.find(s => s.mile <= selectedMile)?.elevation || 6732).toLocaleString()}FT
              <br />
              TERRAIN: {(routeSegments.find(s => s.mile <= selectedMile)?.terrain || 'unknown').toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsOpen(false)}
          className="eva-button flex-1 py-3 opacity-70 hover:opacity-100"
        >
          ABORT_CHECKPOINT
        </button>
        <button
          onClick={handleSetCheckpoint}
          disabled={!selectedTime || selectedMile <= 0}
          className={`eva-button flex-1 py-3 ${
            selectedTime && selectedMile > 0 
              ? 'bg-green-500/20 eva-border-green' 
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          SET_CHECKPOINT
        </button>
      </div>
    </NervModal>
  )
}