import React from 'react'

interface PredictionResult {
  mile: number
  location: string
  predictedTime: string
  elevation: number
  phase: 'Ascent' | 'Summit' | 'Descent'
  terrain: string
}

interface ProgressInput {
  id: number
  mile: string
  time: string
}

interface TerrainAdjustments {
  [key: string]: number
  fatigue?: number
}

interface ResultsDisplayProps {
  predictions: PredictionResult[]
  startTime: string
  adjustedPaces: TerrainAdjustments
  validInputs: ProgressInput[]
  isUpdated: boolean
  timeToMinutes: (timeStr: string) => number
  getPaceForTerrainOriginal: (terrain: string) => number
}

const descentMultipliers = {
  flat: 1.8,
  steady: 1.6,
  boulder: 1.3,
  technical: 1.1
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  predictions,
  startTime,
  adjustedPaces,
  validInputs,
  isUpdated,
  timeToMinutes,
  getPaceForTerrainOriginal
}) => {
  if (predictions.length === 0) return null

  const endTime = predictions[predictions.length - 1]?.predictedTime || startTime
  const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime)
  const totalHours = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const summitETA = predictions.find(r => r.mile === 6.5)?.predictedTime
  const returnHour = parseInt(endTime.split(':')[0])

  const getFatigueRowClass = (result: PredictionResult) => {
    const isActualPoint = validInputs.some(p => Math.abs(parseFloat(p.mile) - result.mile) < 0.1)
    if (isActualPoint) {
      return 'eva-border-green bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10'
    } else if (Object.keys(adjustedPaces).length > 0 && adjustedPaces[result.terrain]) {
      const fatigueLevel = adjustedPaces[result.terrain]
      if (fatigueLevel > 1.15) {
        return 'eva-border-red bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10'
      } else if (fatigueLevel > 1.05) {
        return 'bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-yellow-500/10 border-l-4 border-yellow-500'
      } else if (fatigueLevel < 0.95) {
        return 'eva-border-green bg-gradient-to-r from-green-500/10 via-green-500/5 to-green-500/10'
      }
    }
    return 'eva-border'
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Summit': return 'eva-text text-yellow-300'
      case 'Ascent': return 'eva-text-green'
      case 'Descent': return 'eva-text'
      default: return 'eva-text'
    }
  }

  return (
    <div className="eva-terminal p-6">
      <div className="eva-status-bar mb-6">
        MISSION_EXECUTION_PLAN - {isUpdated ? 'REAL_TIME_ADJUSTED' : 'INITIAL_CALCULATION'}
      </div>

      {/* Mission Summary */}
      <div className="eva-border-green p-4 mb-6 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10">
        <div className="eva-text-green text-sm font-bold mb-3">
          MISSION_SUMMARY:
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <div className="eva-text-green mb-1">TOTAL_MISSION_TIME:</div>
            <div className="eva-text font-bold text-lg">
              {totalHours}H {totalMins}M
            </div>
          </div>
          <div>
            <div className="eva-text-green mb-1">SUMMIT_ETA:</div>
            <div className="eva-text font-bold text-lg">
              {summitETA}
            </div>
          </div>
          <div>
            <div className="eva-text-green mb-1">RETURN_TIME:</div>
            <div className={`font-bold text-lg ${returnHour >= 17 ? 'eva-text-red eva-warning' : 'eva-text'}`}>
              {endTime}
            </div>
          </div>
        </div>

        {isUpdated && validInputs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-green-500/30">
            <div className="eva-text-green text-xs">
              LAST_UPDATE_FROM: MILE_{Math.max(...validInputs.map(p => parseFloat(p.mile))).toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Late Return Warning */}
      {returnHour >= 17 && (
        <div className="eva-border-red p-4 mb-6 eva-warning">
          <div className="eva-text-red text-sm font-bold text-center">
            ⚠ CRITICAL_WARNING: LATE_RETURN_DETECTED ⚠
            <br />
            RECOMMEND: INCREASE_PACE | EARLIER_START | ABORT_MISSION
          </div>
        </div>
      )}

      {/* Performance Analysis */}
      {isUpdated && Object.keys(adjustedPaces).length > 0 && (
        <div className="eva-border p-4 mb-6 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10">
          <div className="eva-text text-sm font-bold mb-3">
            PERFORMANCE_ANALYSIS:
          </div>
          
          {adjustedPaces.fatigue && (
            <div className="mb-3">
              <div className="eva-text-green text-xs">OVERALL_FATIGUE_COEFFICIENT:</div>
              <div className={`text-lg font-bold ${
                (adjustedPaces.fatigue - 1) * 100 > 15 ? 'eva-text-red eva-warning' :
                (adjustedPaces.fatigue - 1) * 100 > 5 ? 'text-yellow-400' :
                (adjustedPaces.fatigue - 1) * 100 < -5 ? 'eva-text-green' : 'eva-text'
              }`}>
                {((adjustedPaces.fatigue - 1) * 100) > 0 ? '+' : ''}{((adjustedPaces.fatigue - 1) * 100).toFixed(1)}%
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {['flat', 'steady', 'boulder', 'technical'].map(terrain => (
              adjustedPaces[terrain] && (
                <div key={terrain} className="eva-border p-2">
                  <div className="eva-text-green">{terrain.toUpperCase()}:</div>
                  <div className={`font-bold ${
                    (adjustedPaces[terrain] - 1) * 100 > 0 ? 'eva-text-red' : 'eva-text-green'
                  }`}>
                    {((adjustedPaces[terrain] - 1) * 100) > 0 ? '+' : ''}{((adjustedPaces[terrain] - 1) * 100).toFixed(0)}%
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Predictions Table */}
      <div className="eva-border">
        <div className="eva-status-bar text-center mb-0">
          WAYPOINT_PREDICTION_MATRIX
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="eva-border-green border-b">
                <th className="eva-text-green p-2 text-left">MILE</th>
                <th className="eva-text-green p-2 text-left">LOCATION</th>
                <th className="eva-text-green p-2 text-left">ETA</th>
                <th className="eva-text-green p-2 text-left">ELEVATION</th>
                <th className="eva-text-green p-2 text-left">PHASE</th>
                <th className="eva-text-green p-2 text-left">TERRAIN</th>
                {isUpdated && <th className="eva-text-green p-2 text-left">FATIGUE</th>}
              </tr>
            </thead>
            <tbody>
              {predictions.map((result, index) => (
                <tr key={index} className={`${getFatigueRowClass(result)} border-b border-orange-500/20`}>
                  <td className="eva-text p-2 font-mono">{result.mile}</td>
                  <td className="eva-text p-2">{result.location}</td>
                  <td className="eva-text p-2 font-mono font-bold">{result.predictedTime}</td>
                  <td className="eva-text p-2">{result.elevation.toLocaleString()}FT</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 eva-border text-xs ${getPhaseColor(result.phase)}`}>
                      {result.phase.toUpperCase()}
                    </span>
                  </td>
                  <td className="eva-text p-2 capitalize">{result.terrain}</td>
                  {isUpdated && (
                    <td className="p-2">
                      {adjustedPaces[result.terrain] && (
                        <span className={`font-bold ${
                          ((adjustedPaces[result.terrain] || 1) - 1) * 100 > 0 ? 'eva-text-red' : 'eva-text-green'
                        }`}>
                          {((adjustedPaces[result.terrain] || 1) - 1) * 100 > 0 ? '+' : ''}
                          {(((adjustedPaces[result.terrain] || 1) - 1) * 100).toFixed(0)}%
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjusted Paces Details */}
      {isUpdated && Object.keys(adjustedPaces).length > 0 && (
        <div className="mt-6 eva-border-green p-4">
          <div className="eva-text-green text-sm font-bold mb-4">
            RECALCULATED_PACE_MATRIX:
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="eva-border-green border-b">
                  <th className="eva-text-green p-2 text-left">TERRAIN</th>
                  <th className="eva-text-green p-2 text-left">ORIGINAL_PACE</th>
                  <th className="eva-text-green p-2 text-left">ADJUSTED_PACE</th>
                  <th className="eva-text-green p-2 text-left">CHANGE</th>
                  <th className="eva-text-green p-2 text-left">ASC/DESC</th>
                </tr>
              </thead>
              <tbody>
                {['flat', 'steady', 'boulder', 'technical'].map((terrain) => {
                  const originalAscent = getPaceForTerrainOriginal(terrain)
                  const adjustedAscent = Math.round(originalAscent * (adjustedPaces[terrain] || 1))
                  const originalDescent = Math.round(originalAscent / descentMultipliers[terrain as keyof typeof descentMultipliers])
                  const adjustedDescent = Math.round(adjustedAscent / descentMultipliers[terrain as keyof typeof descentMultipliers])
                  const change = Math.round(((adjustedPaces[terrain] || 1) - 1) * 100)

                  return (
                    <tr key={terrain} className="eva-border border-b border-orange-500/20">
                      <td className="eva-text p-2 font-bold uppercase">{terrain}</td>
                      <td className="eva-text p-2 font-mono">{originalAscent} / {originalDescent}</td>
                      <td className="eva-text p-2 font-mono font-bold">{adjustedAscent} / {adjustedDescent}</td>
                      <td className="p-2">
                        <span className={`font-bold ${change > 0 ? 'eva-text-red' : change < 0 ? 'eva-text-green' : 'eva-text'}`}>
                          {change > 0 ? '+' : ''}{change}%
                        </span>
                      </td>
                      <td className="eva-text-green p-2 text-xs">UP / DOWN</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 eva-text-green text-xs">
            ℹ DESCENT_RATES_CALCULATED_USING_RESEARCH_MULTIPLIERS
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 eva-border p-3">
        <div className="eva-text-green text-xs font-bold mb-2">STATUS_INDICATORS:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 eva-border-green bg-green-500/20"></div>
            <span className="eva-text">CHECKPOINT</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-yellow-500/20 border-l-2 border-yellow-500"></div>
            <span className="eva-text">MOD_FATIGUE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 eva-border-red bg-red-500/20"></div>
            <span className="eva-text">HIGH_FATIGUE</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 eva-border-green bg-green-500/20"></div>
            <span className="eva-text">AHEAD_PACE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsDisplay