import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye } from 'lucide-react'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  visibility: number
  condition: string
  description: string
}

interface NervMapProps {
  currentMile: number
  routeSegments: Array<{
    mile: number
    location: string
    elevation: number
  }>
  className?: string
}

export const NervMap: React.FC<NervMapProps> = ({ currentMile, routeSegments, className = "" }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Grand Teton National Park coordinates (Jackson, WY area)
  const parkCoordinates = { lat: 43.7904, lon: -110.6818 }

  // Simulated weather fetch (replace with real API in production)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Mock weather data (replace with real API call)
        const mockWeather: WeatherData = {
          temperature: Math.round(Math.random() * 20 + 30), // 30-50°F
          humidity: Math.round(Math.random() * 30 + 40), // 40-70%
          windSpeed: Math.round(Math.random() * 15 + 5), // 5-20 mph
          windDirection: Math.round(Math.random() * 360), // 0-360°
          visibility: Math.round(Math.random() * 5 + 5), // 5-10 miles
          condition: ['clear', 'partly-cloudy', 'overcast', 'rain'][Math.floor(Math.random() * 4)],
          description: 'Partly cloudy with light winds'
        }
        
        setWeather(mockWeather)
        setError(null)
      } catch (err) {
        setError('WEATHER_DATA_UNAVAILABLE')
        console.error('Weather fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
    
    // Refresh every 15 minutes
    const interval = setInterval(fetchWeather, 15 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'clear': return <Sun className="w-6 h-6" />
      case 'partly-cloudy': return <Cloud className="w-6 h-6" />
      case 'overcast': return <Cloud className="w-6 h-6" />
      case 'rain': return <CloudRain className="w-6 h-6" />
      default: return <Cloud className="w-6 h-6" />
    }
  }

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  // Create stylized map representation
  const mapWidth = 400
  const mapHeight = 300

  // Route path coordinates (simplified representation)
  const routePoints = routeSegments.map((segment, index) => {
    const progress = segment.mile / 6.5
    const x = 50 + progress * (mapWidth - 100)
    const y = mapHeight - 50 - (progress * progress * (mapHeight - 100)) // Curved upward path
    return { x, y, segment }
  })

  const currentPosition = routePoints.find(p => Math.abs(p.segment.mile - currentMile) < 0.2) || routePoints[0]

  return (
    <div className={`eva-terminal p-6 ${className}`}>
      <div className="eva-status-bar mb-6 flex justify-between">
        <div>TACTICAL_MAP_DISPLAY - GRAND_TETON_NP</div>
        <div className="text-xs">
          COORDINATES: {parkCoordinates.lat.toFixed(4)}°N, {Math.abs(parkCoordinates.lon).toFixed(4)}°W
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Map Display */}
        <div className="lg:col-span-2 eva-border-green p-4">
          <div className="eva-text-green text-sm mb-4 font-bold">
            ROUTE_OVERLAY - MIDDLE_TETON_SW_COULOIR
          </div>
          
          <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden">
            <svg 
              width={mapWidth} 
              height={mapHeight} 
              className="w-full h-auto"
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            >
              <defs>
                {/* Topographic pattern */}
                <pattern id="topo" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="rgba(0, 255, 65, 0.1)" />
                  <path d="M 0 10 Q 10 5 20 10" stroke="rgba(0, 255, 65, 0.05)" strokeWidth="0.5" fill="none" />
                </pattern>
                
                {/* Glow effects */}
                <filter id="routeGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Background terrain */}
              <rect width={mapWidth} height={mapHeight} fill="url(#topo)" />
              
              {/* Elevation contours */}
              {[0.3, 0.5, 0.7, 0.9].map((level, index) => (
                <ellipse
                  key={index}
                  cx={mapWidth / 2}
                  cy={mapHeight * 0.8}
                  rx={mapWidth * (1 - level) * 0.4}
                  ry={mapHeight * (1 - level) * 0.3}
                  fill="none"
                  stroke="rgba(0, 255, 65, 0.2)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              ))}

              {/* Route path */}
              <motion.path
                d={`M ${routePoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="rgba(255, 102, 0, 0.8)"
                strokeWidth="3"
                filter="url(#routeGlow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
              />

              {/* Route waypoints */}
              {routePoints.map((point, index) => (
                <motion.g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill="rgba(255, 102, 0, 0.8)"
                    stroke="rgba(255, 102, 0, 1)"
                    strokeWidth="2"
                  />
                  <text
                    x={point.x + 8}
                    y={point.y - 8}
                    fill="rgba(0, 255, 65, 0.8)"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {point.segment.mile}M
                  </text>
                </motion.g>
              ))}

              {/* Current position indicator */}
              <motion.g>
                <motion.circle
                  cx={currentPosition.x}
                  cy={currentPosition.y}
                  r="8"
                  fill="rgba(255, 255, 255, 0.9)"
                  stroke="rgba(255, 102, 0, 1)"
                  strokeWidth="3"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <text
                  x={currentPosition.x}
                  y={currentPosition.y + 20}
                  fill="rgba(255, 255, 255, 1)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  CURRENT
                </text>
              </motion.g>

              {/* Terrain features */}
              <text x={50} y={mapHeight - 20} fill="rgba(0, 255, 65, 0.6)" fontSize="10" fontFamily="JetBrains Mono, monospace">
                LUPINE_MEADOWS
              </text>
              <text x={mapWidth - 100} y={40} fill="rgba(0, 255, 65, 0.6)" fontSize="10" fontFamily="JetBrains Mono, monospace">
                MIDDLE_TETON
              </text>
            </svg>
          </div>
        </div>

        {/* Weather Panel */}
        <div className="eva-border p-4">
          <div className="eva-text-green text-sm mb-4 font-bold">
            WEATHER_CONDITIONS
          </div>
          
          {loading ? (
            <div className="text-center py-8">
              <motion.div
                className="eva-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ACQUIRING_WEATHER_DATA...
              </motion.div>
            </div>
          ) : error ? (
            <div className="eva-border-red p-3 bg-red-500/10">
              <div className="eva-text-red text-xs text-center">
                {error}
              </div>
            </div>
          ) : weather ? (
            <div className="space-y-4">
              {/* Current Conditions */}
              <div className="eva-border-green p-3 bg-green-500/5 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <motion.div
                    className="eva-text-green"
                    animate={{ rotate: weather.condition === 'rain' ? [0, 5, -5, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: weather.condition === 'rain' ? Infinity : 0 }}
                  >
                    {getWeatherIcon(weather.condition)}
                  </motion.div>
                </div>
                <div className="eva-text text-lg font-bold">
                  {weather.temperature}°F
                </div>
                <div className="eva-text text-xs uppercase">
                  {weather.condition.replace('-', '_')}
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3">
                <div className="eva-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 eva-text-green" />
                    <span className="eva-text text-xs">WIND:</span>
                  </div>
                  <div className="eva-text text-xs font-bold">
                    {weather.windSpeed}MPH {getWindDirection(weather.windDirection)}
                  </div>
                </div>

                <div className="eva-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 eva-text-green" />
                    <span className="eva-text text-xs">HUMIDITY:</span>
                  </div>
                  <div className="eva-text text-xs font-bold">
                    {weather.humidity}%
                  </div>
                </div>

                <div className="eva-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 eva-text-green" />
                    <span className="eva-text text-xs">VISIBILITY:</span>
                  </div>
                  <div className="eva-text text-xs font-bold">
                    {weather.visibility}MI
                  </div>
                </div>
              </div>

              {/* Weather Advisory */}
              <div className="eva-border-green p-3 bg-gradient-to-r from-green-500/5 via-transparent to-green-500/5">
                <div className="eva-text-green text-xs font-bold mb-1">
                  ADVISORY:
                </div>
                <div className="eva-text text-xs">
                  {weather.condition === 'rain' ? 
                    'PRECIPITATION_DETECTED - EXERCISE_CAUTION' :
                    weather.windSpeed > 15 ?
                    'HIGH_WIND_CONDITIONS - MONITOR_EXPOSED_AREAS' :
                    'CONDITIONS_ACCEPTABLE_FOR_OPERATIONS'
                  }
                </div>
              </div>
            </div>
          ) : null}

          {/* Update Status */}
          <div className="mt-4 eva-status-bar text-center text-xs">
            LAST_UPDATE: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="mt-6 eva-border-green border-t-0 border-l-0 border-r-0 pt-4">
        <div className="eva-text-green text-xs mb-2 font-bold">MAP_LEGEND:</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 bg-orange-500" style={{ filter: 'drop-shadow(0 0 2px rgba(255, 102, 0, 0.8))' }}></div>
            <span className="eva-text">ROUTE_PATH</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-orange-400"></div>
            <span className="eva-text">WAYPOINTS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full border-2 border-orange-500"></div>
            <span className="eva-text">CURRENT_POSITION</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-dashed border-green-500"></div>
            <span className="eva-text">ELEVATION_CONTOURS</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NervMap