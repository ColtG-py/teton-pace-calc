import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'

interface MountainProps {
  currentMile?: number
  fatigueLevel?: number
  phase?: 'Ascent' | 'Summit' | 'Descent'
  onPositionClick?: (mile: number) => void
  routeSegments: Array<{
    mile: number
    location: string
    terrain: string
    elevation: number
  }>
}

export const DynamicAsciiMountain: React.FC<MountainProps> = ({ 
  currentMile = 0, 
  fatigueLevel = 1.0, 
  phase = 'Ascent',
  onPositionClick,
  routeSegments
}) => {
  const [hoveredMile, setHoveredMile] = useState<number | null>(null)

  const mountainData = useMemo(() => {
    const width = 120 // Characters wide
    const height = 35 // Characters tall
    const maxElevation = Math.max(...routeSegments.map(s => s.elevation))
    const minElevation = Math.min(...routeSegments.map(s => s.elevation))
    const elevationRange = maxElevation - minElevation
    
    // Create elevation profile
    const profile: number[] = []
    for (let x = 0; x < width; x++) {
      const mile = (x / width) * 6.5
      
      // Find the two nearest route segments
      let lowerSegment = routeSegments[0]
      let upperSegment = routeSegments[routeSegments.length - 1]
      
      for (let i = 0; i < routeSegments.length - 1; i++) {
        if (mile >= routeSegments[i].mile && mile <= routeSegments[i + 1].mile) {
          lowerSegment = routeSegments[i]
          upperSegment = routeSegments[i + 1]
          break
        }
      }
      
      // Interpolate elevation
      const segmentRange = upperSegment.mile - lowerSegment.mile
      const positionInSegment = segmentRange > 0 ? (mile - lowerSegment.mile) / segmentRange : 0
      const interpolatedElevation = lowerSegment.elevation + 
        (upperSegment.elevation - lowerSegment.elevation) * positionInSegment
      
      // Convert to ASCII height (inverted because we're drawing from top)
      const normalizedHeight = (interpolatedElevation - minElevation) / elevationRange
      const asciiHeight = Math.floor(normalizedHeight * (height - 5)) + 2
      profile.push(height - asciiHeight)
    }
    
    return { profile, width, height, maxElevation, minElevation }
  }, [routeSegments])

  const getClimberSymbol = (): string => {
    if (phase === 'Summit') return '★'
    if (phase === 'Descent') return '↓'
    if (fatigueLevel > 1.2) return '✗'
    if (fatigueLevel > 1.1) return '!'
    if (fatigueLevel < 0.9) return '↟'
    return '♦'
  }

  const getFatigueColor = (): string => {
    if (phase === 'Summit') return 'eva-text text-yellow-300'
    if (fatigueLevel > 1.2) return 'eva-text-red eva-warning'
    if (fatigueLevel > 1.1) return 'text-yellow-400'
    if (fatigueLevel < 0.9) return 'eva-text-green'
    return 'eva-text'
  }

  const renderMountain = () => {
    const { profile, width, height } = mountainData
    const lines: string[] = []
    
    // Initialize empty grid
    for (let y = 0; y < height; y++) {
      lines.push(' '.repeat(width))
    }
    
    // Draw mountain profile
    for (let x = 0; x < width; x++) {
      const groundLevel = profile[x]
      for (let y = groundLevel; y < height; y++) {
        const line = lines[y]
        if (y === groundLevel) {
          // Mountain peak/surface
          lines[y] = line.substring(0, x) + '▲' + line.substring(x + 1)
        } else if (y === groundLevel + 1) {
          // Mountain body upper
          lines[y] = line.substring(0, x) + '█' + line.substring(x + 1)
        } else {
          // Mountain body
          lines[y] = line.substring(0, x) + '█' + line.substring(x + 1)
        }
      }
    }

    // Add route milestones
    routeSegments.forEach(segment => {
      const x = Math.floor((segment.mile / 6.5) * width)
      const y = profile[x] || height - 2
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const line = lines[Math.max(0, y - 1)]
        lines[Math.max(0, y - 1)] = line.substring(0, x) + '◆' + line.substring(x + 1)
      }
    })

    // Add climber position
    if (currentMile > 0) {
      const climberX = Math.floor((currentMile / 6.5) * width)
      const climberY = profile[climberX] || height - 2
      const symbol = getClimberSymbol()
      
      if (climberX >= 0 && climberX < width && climberY >= 0) {
        const line = lines[Math.max(0, climberY - 2)]
        lines[Math.max(0, climberY - 2)] = line.substring(0, climberX) + symbol + line.substring(climberX + 1)
      }
    }

    return lines
  }

  const mountainLines = renderMountain()
  const climberColor = getFatigueColor()

  return (
    <div className="eva-terminal p-6 w-full">
      <div className="eva-status-bar mb-4 flex justify-between">
        <div>MIDDLE_TETON_ROUTE_VISUALIZATION</div>
        <div>MILE: {currentMile.toFixed(1)} | PHASE: {phase} | ELEVATION: {
          routeSegments.find(s => s.mile <= currentMile)?.elevation.toLocaleString() || '6,732'
        }FT</div>
      </div>
      
      <div className="relative">
        {/* Mountain ASCII Display */}
        <div 
          className="eva-ascii text-center font-mono text-xs leading-none overflow-x-auto cursor-crosshair"
          onMouseLeave={() => setHoveredMile(null)}
        >
          {mountainLines.map((line, index) => (
            <div key={index} className="whitespace-nowrap">
              {line.split('').map((char, charIndex) => {
                const mile = (charIndex / mountainData.width) * 6.5
                const isClimber = char === getClimberSymbol()
                const isMilestone = char === '◆'
                const isHovered = hoveredMile !== null && Math.abs(mile - hoveredMile) < 0.1
                
                return (
                  <motion.span
                    key={charIndex}
                    className={
                      isClimber ? `${climberColor} animate-pulse text-lg font-bold`
                      : isMilestone ? 'eva-text text-orange-400 cursor-pointer hover:text-orange-200'
                      : char === '▲' ? 'eva-text-green'
                      : char === '█' ? 'eva-text-green opacity-70'
                      : isHovered ? 'eva-text bg-orange-500/20'
                      : 'eva-text-green'
                    }
                    onMouseEnter={() => setHoveredMile(mile)}
                    onClick={() => onPositionClick?.(mile)}
                    whileHover={isMilestone || isClimber ? { scale: 1.2 } : {}}
                    transition={{ duration: 0.1 }}
                  >
                    {char}
                  </motion.span>
                )
              })}
            </div>
          ))}
        </div>

        {/* Milestone Labels */}
        <div className="relative mt-2">
          {routeSegments.map((segment, index) => {
            const x = (segment.mile / 6.5) * 100
            return (
              <motion.div
                key={segment.mile}
                className="absolute eva-border-green bg-black/80 p-1 text-xs eva-text-green whitespace-nowrap"
                style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="font-bold">{segment.mile}M</div>
                <div className="text-xs opacity-70">{segment.location}</div>
                <div className="text-xs eva-text">{segment.elevation.toLocaleString()}FT</div>
              </motion.div>
            )
          })}
        </div>

        {/* Hover Information */}
        {hoveredMile !== null && (
          <motion.div
            className="absolute top-4 right-4 eva-border-green p-3 bg-black/90"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="eva-text-green text-xs">
              <div>POSITION: {hoveredMile.toFixed(2)} MILES</div>
              <div>CLICK_TO_SET_CHECKPOINT</div>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="eva-border mt-4 p-3 text-xs">
        <div className="eva-text-green font-bold mb-2">LEGEND:</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          <div className="eva-text">♦ Normal</div>
          <div className="eva-text-green">↟ Ahead</div>
          <div className="text-yellow-400">! Moderate Fatigue</div>
          <div className="eva-text-red">✗ High Fatigue</div>
          <div className="eva-text text-yellow-300">★ Summit</div>
          <div className="eva-text">↓ Descent</div>
        </div>
        <div className="mt-2 eva-text-green text-xs">
          INTERACTION: HOVER_TO_INSPECT | CLICK_MILESTONE_TO_SET_CHECKPOINT
        </div>
      </div>
    </div>
  )
}

export default DynamicAsciiMountain