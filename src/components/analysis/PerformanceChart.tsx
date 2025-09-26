import React from 'react'
import { motion } from 'framer-motion'

interface PerformanceChartProps {
  adjustedPaces: { [key: string]: number; fatigue?: number }
  progressInputs: Array<{ mile: string; time: string }>
  startTime: string
  timeToMinutes: (time: string) => number
  calculateExpectedTime?: (mile: number) => number
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  adjustedPaces,
  progressInputs,
  startTime,
  timeToMinutes,
  calculateExpectedTime
}) => {
  const terrainTypes = ['flat', 'steady', 'boulder', 'technical']
  const chartWidth = 800
  const chartHeight = 300
  const padding = 60

  // Generate chart data
  const chartData = terrainTypes.map((terrain, index) => ({
    terrain,
    x: (index / (terrainTypes.length - 1)) * (chartWidth - 2 * padding) + padding,
    fatigueLevel: adjustedPaces[terrain] || 1.0,
    overallFatigue: adjustedPaces.fatigue || 1.0
  }))

  // Calculate variance data points
  const varianceData = progressInputs
    .filter(inp => inp.mile && inp.time)
    .map(inp => {
      const mile = parseFloat(inp.mile)
      const actualMinutes = timeToMinutes(inp.time) - timeToMinutes(startTime)
      const expectedMinutes = calculateExpectedTime ? calculateExpectedTime(mile) : mile * 30
      const variance = actualMinutes / Math.max(expectedMinutes, 1)
      
      // Map mile to terrain type for x position
      let terrainIndex = 0
      if (mile >= 4.7) terrainIndex = 3      // technical
      else if (mile >= 3.5) terrainIndex = 2 // boulder  
      else if (mile >= 3.0) terrainIndex = 1 // steady
      else terrainIndex = 0                  // flat
      
      return {
        mile,
        x: (terrainIndex / (terrainTypes.length - 1)) * (chartWidth - 2 * padding) + padding,
        variance,
        terrain: terrainTypes[terrainIndex]
      }
    })

  // Convert values to chart coordinates
  const getYCoordinate = (value: number) => {
    const minValue = 0.5
    const maxValue = 2.0
    const normalizedValue = Math.max(minValue, Math.min(maxValue, value))
    return chartHeight - padding - ((normalizedValue - minValue) / (maxValue - minValue)) * (chartHeight - 2 * padding)
  }

  // Generate path strings
  const fatigueLinePath = chartData.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${getYCoordinate(point.fatigueLevel)}`
  ).join(' ')

  const overallFatigueLine = chartData.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${getYCoordinate(point.overallFatigue)}`
  ).join(' ')

  return (
    <div className="eva-terminal p-6">
      <div className="eva-status-bar mb-6">
        PERFORMANCE_ANALYSIS_CHART - FATIGUE_VS_TERRAIN_CORRELATION
      </div>

      <div className="eva-border-green p-4">
        <svg 
          width={chartWidth} 
          height={chartHeight} 
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 102, 0, 0.1)" strokeWidth="1"/>
            </pattern>
            
            {/* Glowing line effects */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid */}
          <rect x={padding} y={padding} width={chartWidth - 2 * padding} height={chartHeight - 2 * padding} fill="url(#grid)" />

          {/* Axes */}
          <line 
            x1={padding} y1={chartHeight - padding} 
            x2={chartWidth - padding} y2={chartHeight - padding} 
            stroke="rgba(0, 255, 65, 0.5)" 
            strokeWidth="2"
          />
          <line 
            x1={padding} y1={padding} 
            x2={padding} y2={chartHeight - padding} 
            stroke="rgba(0, 255, 65, 0.5)" 
            strokeWidth="2"
          />

          {/* Y-axis labels */}
          {[0.5, 1.0, 1.5, 2.0].map(value => (
            <g key={value}>
              <line 
                x1={padding - 5} 
                y1={getYCoordinate(value)} 
                x2={padding} 
                y2={getYCoordinate(value)} 
                stroke="rgba(0, 255, 65, 0.5)" 
                strokeWidth="1"
              />
              <text 
                x={padding - 10} 
                y={getYCoordinate(value)} 
                fill="rgba(0, 255, 65, 0.8)" 
                fontSize="10" 
                textAnchor="end" 
                dominantBaseline="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {value.toFixed(1)}x
              </text>
            </g>
          ))}

          {/* X-axis labels */}
          {chartData.map((point, index) => (
            <g key={point.terrain}>
              <line 
                x1={point.x} 
                y1={chartHeight - padding} 
                x2={point.x} 
                y2={chartHeight - padding + 5} 
                stroke="rgba(0, 255, 65, 0.5)" 
                strokeWidth="1"
              />
              <text 
                x={point.x} 
                y={chartHeight - padding + 15} 
                fill="rgba(0, 255, 65, 0.8)" 
                fontSize="10" 
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
              >
                {point.terrain.toUpperCase()}
              </text>
            </g>
          ))}

          {/* Terrain-specific fatigue line */}
          <motion.path
            d={fatigueLinePath}
            fill="none"
            stroke="rgba(255, 102, 0, 0.8)"
            strokeWidth="3"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />

          {/* Overall fatigue line */}
          <motion.path
            d={overallFatigueLine}
            fill="none"
            stroke="rgba(255, 255, 0, 0.8)"
            strokeWidth="2"
            strokeDasharray="5,5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />

          {/* Variance data points */}
          {varianceData.map((point, index) => (
            <motion.g key={`variance-${index}`}>
              <circle
                cx={point.x}
                cy={getYCoordinate(point.variance)}
                r="4"
                fill="rgba(255, 51, 51, 0.8)"
                stroke="rgba(255, 51, 51, 1)"
                strokeWidth="2"
                filter="url(#glow)"
              />
              <motion.circle
                cx={point.x}
                cy={getYCoordinate(point.variance)}
                r="8"
                fill="none"
                stroke="rgba(255, 51, 51, 0.3)"
                strokeWidth="1"
                initial={{ r: 4, opacity: 0 }}
                animate={{ r: 8, opacity: 0.5 }}
                transition={{ 
                  duration: 1,
                  delay: index * 0.2 + 1,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </motion.g>
          ))}

          {/* Data points for terrain fatigue */}
          {chartData.map((point, index) => (
            <motion.circle
              key={point.terrain}
              cx={point.x}
              cy={getYCoordinate(point.fatigueLevel)}
              r="6"
              fill="rgba(255, 102, 0, 1)"
              stroke="rgba(255, 102, 0, 0.5)"
              strokeWidth="3"
              initial={{ r: 0, opacity: 0 }}
              animate={{ r: 6, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 2 }}
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="mt-4 eva-border-green border-t-0 border-l-0 border-r-0 pt-4">
          <div className="eva-text-green text-xs mb-2 font-bold">LEGEND:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-orange-500" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 102, 0, 0.8))' }}></div>
              <span className="eva-text">TERRAIN_SPECIFIC_FATIGUE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-yellow-400 border-dashed border-t" style={{ borderWidth: '1px' }}></div>
              <span className="eva-text">OVERALL_FATIGUE_BASELINE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full" style={{ filter: 'drop-shadow(0 0 3px rgba(255, 51, 51, 0.8))' }}></div>
              <span className="eva-text">ACTUAL_VS_PREDICTED_VARIANCE</span>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-4 eva-border p-3 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5">
          <div className="eva-text text-xs">
            <div className="font-bold mb-2">PERFORMANCE_ANALYSIS_SUMMARY:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="eva-text-green">AVG_FATIGUE_FACTOR:</span> {' '}
                <span className={`${(adjustedPaces.fatigue || 1) > 1.1 ? 'eva-text-red' : 'eva-text-green'}`}>
                  {Math.round(((adjustedPaces.fatigue || 1) - 1) * 100)}%
                </span>
              </div>
              <div>
                <span className="eva-text-green">CHECKPOINT_VARIANCE:</span> {' '}
                <span className="eva-text">
                  {varianceData.length} DATA_POINTS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PerformanceChart