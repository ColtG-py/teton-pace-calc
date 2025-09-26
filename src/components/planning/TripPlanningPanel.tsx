import React from 'react'
import { RefreshCw, Calculator } from 'lucide-react'

interface TripPlanningPanelProps {
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

export const TripPlanningPanel: React.FC<TripPlanningPanelProps> = ({
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
  return (
    <div className="eva-terminal p-6">
      <div className="eva-status-bar mb-6">
        MISSION_PLANNING_MODULE - ROUTE_CONFIGURATION
      </div>

      <div className="space-y-6">
        {/* Primary Configuration */}
        <div className="eva-border-green p-4">
          <div className="eva-text-green text-sm mb-4 font-bold">
            PRIMARY_PARAMETERS:
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="eva-text text-xs block">MISSION_START_TIME:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="eva-input w-full p-2"
              />
            </div>
            
            <div className="space-y-2">
              <label className="eva-text text-xs block">SUMMIT_REST_DURATION (MINUTES):</label>
              <input
                type="number"
                min="0"
                value={breakTime}
                onChange={(e) => setBreakTime(parseInt(e.target.value))}
                className="eva-input w-full p-2"
              />
            </div>
          </div>
        </div>

        {/* Pace Configuration */}
        <div className="eva-border p-4">
          <div className="eva-text text-sm mb-4 font-bold flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            PACE_MATRIX_CONFIGURATION (MIN/MILE):
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="eva-text-green text-xs block">
                  TERRAIN_TYPE_01: FLAT/SLIGHT_INCLINE
                </label>
                <div className="eva-text text-xs opacity-70 mb-1">
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
              
              <div className="space-y-2">
                <label className="eva-text-green text-xs block">
                  TERRAIN_TYPE_02: STEADY_INCLINE
                </label>
                <div className="eva-text text-xs opacity-70 mb-1">
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
              <div className="space-y-2">
                <label className="eva-text-green text-xs block">
                  TERRAIN_TYPE_03: BOULDER_SCRAMBLE
                </label>
                <div className="eva-text text-xs opacity-70 mb-1">
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
              
              <div className="space-y-2">
                <label className="eva-text-green text-xs block">
                  TERRAIN_TYPE_04: TECHNICAL_ASCENT
                </label>
                <div className="eva-text text-xs opacity-70 mb-1">
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
            <div className="space-y-1 pl-4">
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

        {/* Execute Button */}
        <button 
          onClick={onCalculate}
          className="eva-button w-full py-4 text-sm font-bold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          EXECUTE_ROUTE_CALCULATION
        </button>
      </div>
    </div>
  )
}

export default TripPlanningPanel