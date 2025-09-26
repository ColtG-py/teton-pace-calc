import React from 'react'
import { Plus, Target, Trash2 } from 'lucide-react'

interface ProgressInput {
  id: number
  mile: string
  time: string
}

interface ProgressTrackingPanelProps {
  progressInputs: ProgressInput[]
  onAddProgress: () => void
  onUpdateProgress: (id: number, field: 'mile' | 'time', value: string) => void
  onRemoveProgress: (id: number) => void
  onUpdateAllPredictions: () => void
  onClearProgress: () => void
  isVisible: boolean
}

export const ProgressTrackingPanel: React.FC<ProgressTrackingPanelProps> = ({
  progressInputs,
  onAddProgress,
  onUpdateProgress,
  onRemoveProgress,
  onUpdateAllPredictions,
  onClearProgress,
  isVisible
}) => {
  if (!isVisible) return null

  const validInputs = progressInputs.filter(inp => inp.mile && inp.time)

  return (
    <div className="eva-terminal p-6">
      <div className="eva-status-bar mb-6">
        REAL_TIME_TRACKING_MODULE - PERFORMANCE_ANALYSIS
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="eva-border-green p-4">
          <div className="eva-text-green text-sm font-bold mb-2">
            MISSION_BRIEFING:
          </div>
          <div className="eva-text text-xs space-y-1">
            <div>• INPUT_CURRENT_POSITION_AND_TIME_FOR_PERFORMANCE_ANALYSIS</div>
            <div>• SYSTEM_WILL_RECALCULATE_ALL_FUTURE_PREDICTIONS</div>
            <div>• FATIGUE_MODELING_APPLIES_TO_ALL_TERRAIN_TYPES</div>
            <div>• REAL_TIME_ADJUSTMENT_BASED_ON_ACTUAL_VS_PREDICTED_TIMES</div>
          </div>
        </div>

        {/* Progress Input Cards */}
        <div className="space-y-4">
          {progressInputs.map((input, index) => (
            <div key={input.id} className="eva-border p-4 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent">
              <div className="flex justify-between items-start mb-3">
                <div className="eva-text-green text-xs font-bold">
                  CHECKPOINT_{String(index + 1).padStart(2, '0')}:
                </div>
                <button
                  onClick={() => onRemoveProgress(input.id)}
                  className="eva-text-red hover:eva-text-red text-xs p-1"
                  title="Remove checkpoint"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="eva-text text-xs block">
                    POSITION_COORDINATE (MILE):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="6.5"
                    step="0.1"
                    value={input.mile}
                    onChange={(e) => onUpdateProgress(input.id, 'mile', e.target.value)}
                    className="eva-input w-full p-2"
                    placeholder="0.0 - 6.5"
                  />
                  <div className="eva-text-green text-xs opacity-70">
                    RANGE: 0.0_TRAILHEAD → 6.5_SUMMIT
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="eva-text text-xs block">
                    TIMESTAMP_ACTUAL:
                  </label>
                  <input
                    type="time"
                    value={input.time}
                    onChange={(e) => onUpdateProgress(input.id, 'time', e.target.value)}
                    className="eva-input w-full p-2"
                  />
                  <div className="eva-text-green text-xs opacity-70">
                    24HR_FORMAT_REQUIRED
                  </div>
                </div>
              </div>
              
              {/* Validation Status */}
              <div className="mt-3 pt-3 border-t border-orange-500/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    input.mile && input.time 
                      ? 'bg-green-500 shadow-lg shadow-green-500/50' 
                      : 'bg-red-500 shadow-lg shadow-red-500/50'
                  }`} />
                  <span className="eva-text text-xs">
                    STATUS: {input.mile && input.time ? 'VALID_DATA' : 'INCOMPLETE_DATA'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Inputs State */}
        {progressInputs.length === 0 && (
          <div className="eva-border-red p-6 text-center">
            <div className="eva-text-red text-sm mb-2">NO_TRACKING_DATA_AVAILABLE</div>
            <div className="eva-text text-xs">
              ADD_CHECKPOINT_TO_BEGIN_PERFORMANCE_ANALYSIS
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="eva-border-green p-4">
          <div className="eva-text-green text-xs mb-3 font-bold">
            CONTROL_INTERFACE:
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={onAddProgress}
              className="eva-button px-4 py-2 text-xs"
            >
              <Plus className="w-3 h-3 mr-2" />
              ADD_CHECKPOINT
            </button>
            
            <button 
              onClick={onUpdateAllPredictions}
              className="eva-button px-4 py-2 text-xs"
              disabled={validInputs.length === 0}
            >
              <Target className="w-3 h-3 mr-2" />
              UPDATE_PREDICTIONS
            </button>
            
            <button 
              onClick={onClearProgress}
              className="eva-button px-4 py-2 text-xs opacity-70 hover:opacity-100"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              CLEAR_ALL_DATA
            </button>
          </div>

          {/* Status Display */}
          <div className="mt-4 pt-3 border-t border-green-500/30">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="eva-text-green">TOTAL_CHECKPOINTS:</div>
                <div className="eva-text font-bold">{progressInputs.length}</div>
              </div>
              <div>
                <div className="eva-text-green">VALID_ENTRIES:</div>
                <div className="eva-text font-bold">{validInputs.length}</div>
              </div>
              <div>
                <div className="eva-text-green">SYSTEM_STATUS:</div>
                <div className={`font-bold ${
                  validInputs.length > 0 ? 'eva-text-green' : 'eva-text-red'
                }`}>
                  {validInputs.length > 0 ? 'READY' : 'STANDBY'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for insufficient data */}
        {progressInputs.length > 0 && validInputs.length === 0 && (
          <div className="eva-border-red p-3 eva-warning">
            <div className="eva-text-red text-xs font-bold text-center">
              ⚠ WARNING: INCOMPLETE_CHECKPOINT_DATA ⚠
              <br />
              COMPLETE_ALL_FIELDS_TO_ENABLE_PREDICTION_UPDATE
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressTrackingPanel