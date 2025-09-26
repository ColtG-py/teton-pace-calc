import React from 'react'

interface AsciiMountainProps {
  currentMile?: number
  fatigueLevel?: number
  phase?: 'Ascent' | 'Summit' | 'Descent'
}

export const AsciiMountain: React.FC<AsciiMountainProps> = ({ 
  currentMile = 0, 
  fatigueLevel = 1.0, 
  phase = 'Ascent' 
}) => {
  
  const getClimberPosition = (mile: number): { row: number; col: number } => {
    // Map miles to ASCII art positions
    if (mile <= 1) return { row: 17, col: 5 } // Trailhead
    if (mile <= 2) return { row: 16, col: 15 } // Forest trail
    if (mile <= 3) return { row: 15, col: 25 } // Switchbacks
    if (mile <= 3.5) return { row: 14, col: 35 } // Garnet Canyon
    if (mile <= 4.2) return { row: 13, col: 45 } // Platforms
    if (mile <= 4.7) return { row: 11, col: 50 } // Meadows
    if (mile <= 5.2) return { row: 9, col: 55 } // Boulder field
    if (mile <= 5.7) return { row: 7, col: 60 } // Saddle
    if (mile <= 6.1) return { row: 5, col: 65 } // Lower couloir
    if (mile <= 6.5) return { row: 3, col: 68 } // Summit
    return { row: 17, col: 5 } // Default
  }

  const getClimberSymbol = (): string => {
    if (phase === 'Summit') return '★'
    if (phase === 'Descent') return '↓'
    if (fatigueLevel > 1.2) return '✗' // High fatigue
    if (fatigueLevel > 1.1) return '!' // Moderate fatigue  
    if (fatigueLevel < 0.9) return '↟' // Ahead of pace
    return '♦' // Normal pace
  }

  const getFatigueColor = (): string => {
    if (phase === 'Summit') return 'eva-text'
    if (fatigueLevel > 1.2) return 'eva-text-red'
    if (fatigueLevel > 1.1) return 'text-yellow-400'
    if (fatigueLevel < 0.9) return 'eva-text-green'
    return 'eva-text'
  }

  const climberPos = getClimberPosition(currentMile)
  const climberSymbol = getClimberSymbol()
  const climberColor = getFatigueColor()

  // ASCII art of Middle Teton with route markers
  const mountainArt = `
                              ★ 12,804ft SUMMIT
                           /\\    /\\
                        /\\/   \\/    \\/\\
                     /\\/              \\/\\        < 6.1 SW Couloir
                  /\\/                    \\/\\
               /\\/                          \\/\\   < 5.7 Saddle 
            /\\/                              \\/\\
         /\\/                                    \\/\\  < 5.2 Boulder Field
      /\\/                                        \\/\\
   /\\/                                              \\/\\ < 4.7 Meadows
/\\/                                                  \\/\\
|                                                      | < 4.2 Platforms
|                                                      |
|                                                      | < 3.5 Garnet Canyon
|                                                      |
|                                                      | < 3.0 Junction
|______________________________________________________|
                        LUPINE MEADOWS                   < 0.0 Trailhead
  `

  // Split into lines and insert climber symbol
  const lines = mountainArt.split('\n')
  const modifiedLines = lines.map((line, index) => {
    if (index === climberPos.row && line.length > climberPos.col) {
      return line.slice(0, climberPos.col) + climberSymbol + line.slice(climberPos.col + 1)
    }
    return line
  })

  return (
    <div className="eva-terminal p-6">
      <div className="eva-status-bar mb-4">
        MIDDLE TETON ROUTE VISUALIZATION - MILE: {currentMile.toFixed(1)} - PHASE: {phase}
      </div>
      <div className="eva-ascii text-center">
        {modifiedLines.map((line, index) => (
          <div key={index} className="leading-none">
            {line.split('').map((char, charIndex) => (
              <span 
                key={charIndex}
                className={
                  index === climberPos.row && charIndex === climberPos.col 
                    ? `${climberColor} animate-pulse text-lg font-bold`
                    : char === '★' ? 'eva-text text-yellow-300'
                    : char === '<' ? 'eva-text-green'
                    : 'eva-text-green'
                }
              >
                {char}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      <div className="eva-border mt-4 p-2 text-xs">
        <div className="eva-text-green">LEGEND:</div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
          <div className="eva-text">♦ Normal Pace</div>
          <div className="eva-text-green">↟ Ahead of Pace</div>
          <div className="text-yellow-400">! Moderate Fatigue</div>
          <div className="eva-text-red">✗ High Fatigue</div>
          <div className="eva-text text-yellow-300">★ Summit</div>
          <div className="eva-text">↓ Descent</div>
        </div>
      </div>
    </div>
  )
}

export default AsciiMountain