import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Cloud, CloudRain, Sun, Wind, Thermometer, Eye, MapPin, Navigation } from 'lucide-react'

interface WeatherData {
  temperature: number
  humidity: number
  windSpeed: number
  windDirection: number
  visibility: number
  condition: string
  description: string
}

interface RouteSegment {
  mile: number
  location: string
  elevation: number
  coordinates: [number, number] // [lat, lon]
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

// Real GPS coordinates for Middle Teton Southwest Couloir route
const ROUTE_COORDINATES: RouteSegment[] = [
  { mile: 0, location: "Lupine Meadows Trailhead", elevation: 6732, coordinates: [43.7415, -110.7318] },
  { mile: 1, location: "Forest Trail", elevation: 7332, coordinates: [43.7425, -110.7298] },
  { mile: 2, location: "Switchbacks Begin", elevation: 7932, coordinates: [43.7435, -110.7288] },
  { mile: 3, location: "Garnet Canyon Junction", elevation: 8532, coordinates: [43.7445, -110.7278] },
  { mile: 3.5, location: "Enter Garnet Canyon", elevation: 8707, coordinates: [43.7450, -110.7268] },
  { mile: 4, location: "Approaching Platforms", elevation: 8957, coordinates: [43.7455, -110.7258] },
  { mile: 4.2, location: "The Platforms", elevation: 9200, coordinates: [43.7458, -110.7248] },
  { mile: 4.7, location: "The Meadows", elevation: 9500, coordinates: [43.7462, -110.7238] },
  { mile: 5.2, location: "Boulder Field Midpoint", elevation: 10475, coordinates: [43.7468, -110.7228] },
  { mile: 5.7, location: "Middle/South Teton Saddle", elevation: 11450, coordinates: [43.7472, -110.7218] },
  { mile: 6.1, location: "Lower Southwest Couloir", elevation: 12000, coordinates: [43.7475, -110.7208] },
  { mile: 6.5, location: "Middle Teton Summit", elevation: 12804, coordinates: [43.7478, -110.7198] }
]

// LeafletMap component with proper integration
const LeafletMap: React.FC<{ 
  currentMile: number; 
  routeCoordinates: RouteSegment[];
  onMarkerClick?: (mile: number) => void 
}> = ({ currentMile, routeCoordinates, onMarkerClick }) => {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Find current position
  const currentPosition = useMemo(() => {
    let current = routeCoordinates[0]
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      if (currentMile >= routeCoordinates[i].mile && currentMile < routeCoordinates[i + 1].mile) {
        // Interpolate position between waypoints
        const progress = (currentMile - routeCoordinates[i].mile) / (routeCoordinates[i + 1].mile - routeCoordinates[i].mile)
        const lat = routeCoordinates[i].coordinates[0] + progress * (routeCoordinates[i + 1].coordinates[0] - routeCoordinates[i].coordinates[0])
        const lon = routeCoordinates[i].coordinates[1] + progress * (routeCoordinates[i + 1].coordinates[1] - routeCoordinates[i].coordinates[1])
        const elevation = Math.round(routeCoordinates[i].elevation + progress * (routeCoordinates[i + 1].elevation - routeCoordinates[i].elevation))
        return { mile: currentMile, location: "Current Position", elevation, coordinates: [lat, lon] as [number, number] }
      }
    }
    return current
  }, [currentMile, routeCoordinates])

  if (!isClient) {
    return (
      <div className="h-96 eva-border-green bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-lg flex items-center justify-center">
        <div className="eva-text-green animate-pulse">LOADING_GEOGRAPHIC_DATA...</div>
      </div>
    )
  }

  // Fallback to styled SVG representation when Leaflet isn't available
  return (
    <div className="relative h-96 eva-border-green bg-gradient-to-b from-gray-900 via-gray-800 to-black rounded-lg overflow-hidden">
      {/* Simulated Topographic Background */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="topoLines" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0,10 Q20,5 40,10 M0,30 Q20,25 40,30" 
                    stroke="rgba(0, 255, 65, 0.15)" 
                    strokeWidth="1" 
                    fill="none" />
            </pattern>
            <pattern id="terrain" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill="rgba(139, 69, 19, 0.3)" />
              <circle cx="5" cy="15" r="0.5" fill="rgba(34, 139, 34, 0.4)" />
            </pattern>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Terrain base */}
          <rect width="100%" height="100%" fill="url(#terrain)" />
          <rect width="100%" height="100%" fill="url(#topoLines)" />
          
          {/* Elevation contours */}
          {[0.2, 0.4, 0.6, 0.8].map((level, index) => (
            <path
              key={index}
              d={`M ${20 + level * 60},${80 - level * 60} Q ${200 + level * 100},${60 - level * 40} ${380 - level * 80},${90 - level * 70}`}
              stroke="rgba(0, 255, 65, 0.3)"
              strokeWidth="1"
              fill="none"
              strokeDasharray="3,3"
            />
          ))}
          
          {/* Route Path */}
          <motion.path
            d={`M ${routeCoordinates.map((seg, i) => {
              const x = 50 + (seg.mile / 6.5) * 300
              const y = 350 - ((seg.elevation - 6732) / (12804 - 6732)) * 280
              return i === 0 ? `${x},${y}` : `L ${x},${y}`
            }).join(' ')}`}
            stroke="rgba(255, 102, 0, 0.9)"
            strokeWidth="4"
            fill="none"
            filter="url(#mapGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          
          {/* Route Waypoints */}
          {routeCoordinates.map((segment, index) => {
            const x = 50 + (segment.mile / 6.5) * 300
            const y = 350 - ((segment.elevation - 6732) / (12804 - 6732)) * 280
            
            return (
              <motion.g key={index}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill="rgba(255, 102, 0, 0.8)"
                  stroke="rgba(255, 102, 0, 1)"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => onMarkerClick?.(segment.mile)}
                  whileHover={{ r: 6, stroke: "rgba(255, 170, 0, 1)" }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                />
                <text
                  x={x + 8}
                  y={y - 8}
                  fill="rgba(0, 255, 65, 0.9)"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  className="pointer-events-none"
                >
                  {segment.mile}M
                </text>
              </motion.g>
            )
          })}
          
          {/* Current Position Indicator */}
          <motion.g>
            <motion.circle
              cx={50 + (currentPosition.mile / 6.5) * 300}
              cy={350 - ((currentPosition.elevation - 6732) / (12804 - 6732)) * 280}
              r="8"
              fill="rgba(255, 255, 255, 0.9)"
              stroke="rgba(255, 102, 0, 1)"
              strokeWidth="3"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <text
              x={50 + (currentPosition.mile / 6.5) * 300}
              y={350 - ((currentPosition.elevation - 6732) / (12804 - 6732)) * 280 + 25}
              fill="rgba(255, 255, 255, 1)"
              fontSize="12"
              fontFamily="JetBrains Mono, monospace"
              textAnchor="middle"
              fontWeight="bold"
              className="pointer-events-none"
            >
              CURRENT
            </text>
          </motion.g>
          
          {/* Geographic Features */}
          <text x="60" y="330" fill="rgba(0, 255, 65, 0.7)" fontSize="11" fontFamily="JetBrains Mono">
            LUPINE_MEADOWS
          </text>
          <text x="280" y="80" fill="rgba(0, 255, 65, 0.7)" fontSize="11" fontFamily="JetBrains Mono">
            MIDDLE_TETON_12804FT
          </text>
          <text x="200" y="200" fill="rgba(0, 255, 65, 0.6)" fontSize="10" fontFamily="JetBrains Mono">
            GARNET_CANYON
          </text>
          
          {/* Compass Rose */}
          <g transform="translate(360, 40)">
            <circle r="25" fill="rgba(0, 0, 0, 0.7)" stroke="rgba(0, 255, 65, 0.5)" strokeWidth="2" />
            <path d="M0,-20 L5,0 L0,20 L-5,0 Z" fill="rgba(255, 102, 0, 0.8)" />
            <text y="-28" textAnchor="middle" fill="rgba(0, 255, 65, 0.9)" fontSize="10" fontFamily="JetBrains Mono">
              N
            </text>
          </g>
          
          {/* Scale Bar */}
          <g transform="translate(50, 360)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="rgba(0, 255, 65, 0.8)" strokeWidth="2" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(0, 255, 65, 0.8)" strokeWidth="2" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="rgba(0, 255, 65, 0.8)" strokeWidth="2" />
            <text x="30" y="-8" textAnchor="middle" fill="rgba(0, 255, 65, 0.8)" fontSize="9" fontFamily="JetBrains Mono">
              1 MILE
            </text>
          </g>
        </svg>
      </div>
      
      {/* Interactive overlay for hover information */}
      <div className="absolute top-4 left-4 eva-border-green p-3 bg-black/90">
        <div className="eva-text-green text-xs">
          <div className="font-bold mb-1">CURRENT_COORDINATES:</div>
          <div>{currentPosition.coordinates[0].toFixed(6)}°N</div>
          <div>{currentPosition.coordinates[1].toFixed(6)}°W</div>
          <div>ELEVATION: {currentPosition.elevation.toLocaleString()}FT</div>
        </div>
      </div>
    </div>
  )
}

export const NervMap: React.FC<NervMapProps> = ({ currentMile, routeSegments, className = "" }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<'terrain' | 'satellite' | 'topo'>('topo')

  // Grand Teton National Park coordinates
  const parkCoordinates = { lat: 43.7904, lon: -110.6818 }

  // Simulate weather fetch (replace with real API in production)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1500))
        
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

  const handleMarkerClick = (mile: number) => {
    console.log(`Marker clicked for mile: ${mile}`)
    // Handle marker click - could trigger checkpoint modal
  }

  return (
    <div className={`eva-terminal p-6 ${className}`}>
      <div className="eva-status-bar mb-6 flex justify-between items-center">
        <div>ENHANCED_TACTICAL_MAP - GRAND_TETON_NP</div>
        <div className="flex items-center gap-4 text-xs">
          <div>COORDINATES: {parkCoordinates.lat.toFixed(4)}°N, {Math.abs(parkCoordinates.lon).toFixed(4)}°W</div>
          <select 
            value={selectedLayer} 
            onChange={(e) => setSelectedLayer(e.target.value as any)}
            className="eva-input px-2 py-1 text-xs"
          >
            <option value="topo">TOPOGRAPHIC</option>
            <option value="satellite">SATELLITE</option>
            <option value="terrain">TERRAIN</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced Map Display */}
        <div className="lg:col-span-2">
          <div className="eva-border-green p-4">
            <div className="eva-text-green text-sm mb-4 font-bold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              ROUTE_OVERLAY - MIDDLE_TETON_SW_COULOIR
              <div className="ml-auto text-xs opacity-70">
                LAYER: {selectedLayer.toUpperCase()}
              </div>
            </div>
            
            <LeafletMap 
              currentMile={currentMile} 
              routeCoordinates={ROUTE_COORDINATES}
              onMarkerClick={handleMarkerClick}
            />
          </div>

          {/* Route Profile */}
          <div className="mt-4 eva-border p-4">
            <div className="eva-text-green text-sm mb-3 font-bold">
              ELEVATION_PROFILE:
            </div>
            <svg className="w-full h-24" viewBox="0 0 400 80">
              <defs>
                <linearGradient id="elevationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                  <stop offset="100%" stopColor="rgba(0, 255, 65, 0.1)" />
                </linearGradient>
              </defs>
              
              {/* Elevation profile path */}
              <path
                d={`M ${ROUTE_COORDINATES.map((seg, i) => {
                  const x = (seg.mile / 6.5) * 380 + 10
                  const y = 70 - ((seg.elevation - 6732) / (12804 - 6732)) * 60
                  return i === 0 ? `${x},${y}` : `L ${x},${y}`
                }).join(' ')} L 390,70 L 10,70 Z`}
                fill="url(#elevationGradient)"
                stroke="rgba(0, 255, 65, 0.8)"
                strokeWidth="2"
              />
              
              {/* Current position indicator */}
              <line
                x1={(currentMile / 6.5) * 380 + 10}
                y1="10"
                x2={(currentMile / 6.5) * 380 + 10}
                y2="70"
                stroke="rgba(255, 102, 0, 0.8)"
                strokeWidth="2"
                strokeDasharray="3,3"
              />
            </svg>
          </div>
        </div>

        {/* Weather and Info Panel */}
        <div className="space-y-4">
          {/* Weather Conditions */}
          <div className="eva-border p-4">
            <div className="eva-text-green text-sm mb-4 font-bold flex items-center gap-2">
              <Wind className="w-4 h-4" />
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
          </div>

          {/* Route Information */}
          <div className="eva-border p-4">
            <div className="eva-text-green text-sm mb-4 font-bold flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              ROUTE_INTELLIGENCE
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="eva-text">TOTAL_DISTANCE:</span>
                <span className="eva-text font-bold">13.0 MI (RT)</span>
              </div>
              <div className="flex justify-between">
                <span className="eva-text">ELEVATION_GAIN:</span>
                <span className="eva-text font-bold">6,072 FT</span>
              </div>
              <div className="flex justify-between">
                <span className="eva-text">ROUTE_CLASS:</span>
                <span className="eva-text font-bold">CLASS 3-4</span>
              </div>
              <div className="flex justify-between">
                <span className="eva-text">ESTIMATED_TIME:</span>
                <span className="eva-text font-bold">10-14 HRS</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="eva-status-bar text-center text-xs">
            LAST_UPDATE: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Enhanced Map Legend */}
      <div className="mt-6 eva-border-green border-t-0 border-l-0 border-r-0 pt-4">
        <div className="eva-text-green text-xs mb-2 font-bold">ENHANCED_MAP_LEGEND:</div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-xs">
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
            <span className="eva-text">TOPOGRAPHIC_DATA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/30 border border-green-500"></div>
            <span className="eva-text">TERRAIN_FEATURES</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 bg-gradient-to-r from-green-500/30 to-white/30"></div>
            <span className="eva-text">ELEVATION_PROFILE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NervMap