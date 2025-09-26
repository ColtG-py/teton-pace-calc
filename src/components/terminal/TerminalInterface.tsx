import React, { useState, useEffect } from 'react'

interface DataStreamProps {
  predictions: any[]
  fatigueLevel?: number
  isActive?: boolean
}

export const DataStream: React.FC<DataStreamProps> = ({ 
  predictions, 
  fatigueLevel = 1.0, 
  isActive = true 
}) => {
  const [streamData, setStreamData] = useState<string>('')
  
  useEffect(() => {
    if (!isActive) return
    
    const generateDataStream = () => {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0]
      const dataPoints = [
        `[${timestamp}] ROUTE_ANALYSIS: ${predictions.length} WAYPOINTS_LOADED`,
        `[${timestamp}] FATIGUE_COEFFICIENT: ${(fatigueLevel - 1) * 100 > 0 ? '+' : ''}${((fatigueLevel - 1) * 100).toFixed(1)}%`,
        `[${timestamp}] TERRAIN_ASSESSMENT: ${predictions.length > 0 ? predictions[0].terrain?.toUpperCase() : 'LOADING'}`,
        `[${timestamp}] GPS_LOCK: ACQUIRED | ELEVATION_DATA: SYNCHRONIZED`,
        `[${timestamp}] WEATHER_STATUS: NOMINAL | VISIBILITY: CLEAR`,
        `[${timestamp}] ROUTE_INTEGRITY: 100% | NAVIGATION_ACTIVE`,
        `[${timestamp}] PHYSIOLOGICAL_MONITOR: ${fatigueLevel > 1.1 ? 'ALERT' : 'NORMAL'}`,
        `[${timestamp}] COMMUNICATIONS: NERV_HQ_LINK_ESTABLISHED`,
        `[${timestamp}] EMERGENCY_PROTOCOLS: STANDBY`,
        `[${timestamp}] DATA_SYNC: ${Math.floor(Math.random() * 100)}% COMPLETE`,
        ''
      ]
      return dataPoints.join('\n')
    }

    setStreamData(generateDataStream())
    const interval = setInterval(() => {
      setStreamData(generateDataStream())
    }, 3000)

    return () => clearInterval(interval)
  }, [predictions, fatigueLevel, isActive])

  return (
    <div className="eva-data-stream" data-stream={streamData}>
      <div className="eva-text-green text-xs p-2 border-b border-green-500">
        DATA_STREAM_MONITOR - STATUS: {isActive ? 'ACTIVE' : 'STANDBY'}
      </div>
    </div>
  )
}

interface TerminalInputProps {
  onCommand: (command: string) => void
  placeholder?: string
  disabled?: boolean
}

export const TerminalInput: React.FC<TerminalInputProps> = ({ 
  onCommand, 
  placeholder = "ENTER_COMMAND...", 
  disabled = false 
}) => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      setHistory(prev => [input, ...prev])
      onCommand(input)
      setInput('')
      setHistoryIndex(-1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[newIndex])
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="eva-border p-2">
      <div className="flex items-center gap-2">
        <span className="eva-text-green text-sm">NERV@TETON:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 bg-transparent eva-text text-sm border-none outline-none font-mono"
          autoComplete="off"
        />
        <span className="eva-text animate-pulse">_</span>
      </div>
    </form>
  )
}

interface TerminalHeaderProps {
  title: string
  subtitle?: string
  status?: 'OPERATIONAL' | 'WARNING' | 'CRITICAL' | 'STANDBY'
  systemTime?: boolean
}

export const TerminalHeader: React.FC<TerminalHeaderProps> = ({
  title,
  subtitle,
  status = 'OPERATIONAL',
  systemTime = true
}) => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (systemTime) {
      const timer = setInterval(() => setCurrentTime(new Date()), 1000)
      return () => clearInterval(timer)
    }
  }, [systemTime])

  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL': return 'eva-text-red'
      case 'WARNING': return 'text-yellow-400'
      case 'OPERATIONAL': return 'eva-text-green'
      default: return 'eva-text'
    }
  }

  return (
    <div className="eva-border-green p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="eva-title text-2xl mb-2">{title}</h1>
          {subtitle && <p className="eva-text text-sm">{subtitle}</p>}
        </div>
        <div className="text-right">
          {systemTime && (
            <div className="eva-text-green text-xs mb-1">
              {currentTime.toLocaleTimeString()}
            </div>
          )}
          <div className={`text-xs ${getStatusColor()} ${status === 'CRITICAL' ? 'eva-warning' : ''}`}>
            STATUS: {status}
          </div>
        </div>
      </div>
      
      <div className="mt-4 eva-border-green border-t-0 border-l-0 border-r-0 pt-2">
        <div className="eva-grid h-2"></div>
      </div>
    </div>
  )
}

interface RadarDisplayProps {
  currentMile: number
  targetMile: number
  size?: number
}

export const RadarDisplay: React.FC<RadarDisplayProps> = ({ 
  currentMile, 
  targetMile, 
  size = 200 
}) => {
  const progress = Math.min((currentMile / targetMile) * 100, 100)
  
  return (
    <div className="flex flex-col items-center">
      <div className="eva-text-green text-xs mb-2">TARGET_ACQUISITION</div>
      <div 
        className="eva-radar eva-crosshair" 
        style={{ width: size, height: size }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="eva-text text-lg font-bold">
              {currentMile.toFixed(1)}
            </div>
            <div className="eva-text-green text-xs">MILE</div>
          </div>
        </div>
        
        {/* Target markers */}
        <div 
          className="absolute w-2 h-2 bg-red-500 rounded-full"
          style={{
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          title="Target: Summit"
        />
        
        <div 
          className="absolute w-1 h-1 bg-orange-500 rounded-full"
          style={{
            top: '30%',
            left: '70%',
            transform: 'translate(-50%, -50%)'
          }}
          title="Waypoint"
        />
      </div>
      
      <div className="eva-text-green text-xs mt-2">
        PROGRESS: {progress.toFixed(1)}%
      </div>
    </div>
  )
}

export default { DataStream, TerminalInput, TerminalHeader, RadarDisplay }