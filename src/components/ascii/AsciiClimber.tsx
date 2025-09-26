import React from 'react'

interface AsciiClimberProps {
  fatigueLevel: number
  currentMile: number
  elevation: number
  phase: 'Ascent' | 'Summit' | 'Descent'
  nextLocation?: string
}

export const AsciiClimber: React.FC<AsciiClimberProps> = ({ 
  fatigueLevel, 
  currentMile, 
  elevation,
  phase,
  nextLocation 
}) => {
  
  const getFatigueStatus = (): string => {
    if (fatigueLevel > 1.2) return 'CRITICAL_FATIGUE'
    if (fatigueLevel > 1.1) return 'MODERATE_FATIGUE' 
    if (fatigueLevel < 0.9) return 'STRONG_PERFORMANCE'
    return 'NOMINAL_STATUS'
  }

  const getFatigueColor = (): string => {
    const status = getFatigueStatus()
    switch (status) {
      case 'CRITICAL_FATIGUE': return 'eva-text-red eva-warning'
      case 'MODERATE_FATIGUE': return 'text-yellow-400'
      case 'STRONG_PERFORMANCE': return 'eva-text-green'
      default: return 'eva-text'
    }
  }

  const getClimberArt = (): string => {
    const status = getFatigueStatus()
    
    if (phase === 'Summit') {
      return `
    \\o/
     |     ← SUMMIT ACHIEVED
    / \\
      `
    }
    
    if (phase === 'Descent') {
      return `
     o
    /|\\   ← DESCENDING
    / \\
      `
    }
    
    switch (status) {
      case 'CRITICAL_FATIGUE':
        return `
     x
    /|\\   ← HIGH FATIGUE
   _/ \\_
        `
      case 'MODERATE_FATIGUE':
        return `
     o
    /|\\   ← MODERATE FATIGUE  
    / \\
        `
      case 'STRONG_PERFORMANCE':
        return `
     O
    /|\\   ← STRONG PERFORMANCE
    /^\\
        `
      default:
        return `
     o
    /|\\   ← NORMAL PACE
    / \\
        `
    }
  }

  const getVitalSigns = () => {
    const baseRate = 70
    const fatigueMultiplier = Math.min(fatigueLevel * 1.3, 2.0)
    const elevationEffect = Math.floor(elevation / 1000) * 5
    const heartRate = Math.floor(baseRate * fatigueMultiplier + elevationEffect)
    
    return {
      heartRate,
      oxygenSat: Math.max(85, Math.floor(100 - (elevation - 6732) / 100)),
      pace: Math.floor(fatigueLevel * 100),
      stress: getFatigueStatus()
    }
  }

  const vitals = getVitalSigns()

  return (
    <div className="eva-terminal p-4 h-full">
      <div className="eva-status-bar mb-4">
        CLIMBER_STATUS_MONITOR - {phase.toUpperCase()}_PHASE
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        {/* Climber ASCII Art */}
        <div className="eva-border p-4 flex flex-col justify-center items-center">
          <div className="eva-text-green text-xs mb-2">VISUAL_STATUS:</div>
          <div className={`eva-ascii text-center ${getFatigueColor()}`}>
            {getClimberArt()}
          </div>
          <div className="eva-text-green text-xs mt-4">
            POSITION: MILE_{currentMile.toFixed(1)}
          </div>
        </div>

        {/* Vital Signs */}
        <div className="eva-border-green p-4">
          <div className="eva-text-green text-xs mb-3">PHYSIOLOGICAL_DATA:</div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="eva-text">HEART_RATE:</span>
              <span className={vitals.heartRate > 140 ? 'eva-text-red' : 'eva-text-green'}>
                {vitals.heartRate} BPM
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="eva-text">O2_SATURATION:</span>
              <span className={vitals.oxygenSat < 90 ? 'eva-text-red' : 'eva-text-green'}>
                {vitals.oxygenSat}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="eva-text">PACE_EFFICIENCY:</span>
              <span className={getFatigueColor()}>
                {vitals.pace}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="eva-text">STRESS_LEVEL:</span>
              <span className={getFatigueColor()}>
                {vitals.stress.replace('_', ' ')}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="eva-text">ELEVATION:</span>
              <span className="eva-text-green">
                {elevation.toLocaleString()}FT
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="eva-text-green text-xs mb-1">ROUTE_PROGRESS:</div>
            <div className="eva-border h-4 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-orange-500 transition-all duration-1000"
                style={{ width: `${(currentMile / 6.5) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="eva-text text-xs font-bold">
                  {Math.floor((currentMile / 6.5) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Next Objective */}
          {nextLocation && (
            <div className="mt-3">
              <div className="eva-text-green text-xs">NEXT_OBJECTIVE:</div>
              <div className="eva-text text-xs mt-1 eva-typewriter">
                {nextLocation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Warning System */}
      {getFatigueStatus() === 'CRITICAL_FATIGUE' && (
        <div className="eva-border-red p-2 mt-4 eva-warning">
          <div className="eva-text-red text-xs font-bold text-center">
            ⚠ WARNING: CRITICAL_FATIGUE_DETECTED ⚠
            <br />
            RECOMMEND: PACE_REDUCTION | REST_INTERVAL
          </div>
        </div>
      )}
    </div>
  )
}

export default AsciiClimber