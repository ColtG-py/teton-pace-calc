import { motion } from "framer-motion"
import { FiArrowRight, FiActivity, FiTrendingUp, FiMap } from "react-icons/fi"
import React from "react"

interface NervCardProps {
  children: React.ReactNode
  className?: string
  hover3D?: boolean
}

export const NervCard: React.FC<NervCardProps> = ({ 
  children, 
  className = "", 
  hover3D = false 
}) => {
  if (hover3D) {
    return (
      <motion.div 
        whileHover="hovered" 
        className={`cursor-pointer ${className}`}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <div className={`eva-terminal p-4 ${className}`}>
      {children}
    </div>
  )
}

interface StatusCardProps {
  fatigueLevel: number
  currentMile: number
  elevation: number
  phase: 'Ascent' | 'Summit' | 'Descent'
  nextLocation?: string
}

export const StatusCard: React.FC<StatusCardProps> = ({ 
  fatigueLevel, 
  currentMile, 
  elevation,
  phase,
  nextLocation 
}) => {
  return (
    <NervCard hover3D className="h-full">
      <StatusCardContent 
        fatigueLevel={fatigueLevel}
        currentMile={currentMile}
        elevation={elevation}
        phase={phase}
        nextLocation={nextLocation}
      />
      <StatusCardCopy />
    </NervCard>
  )
}

const StatusCardContent: React.FC<StatusCardProps> = ({ 
  fatigueLevel, 
  currentMile, 
  elevation, 
  phase, 
  nextLocation 
}) => {
  const getStatusMetrics = () => {
    const progress = (currentMile / 6.5) * 100
    const elevationGain = elevation - 6732
    const remainingElevation = 12804 - elevation
    
    return {
      progress: Math.round(progress),
      elevationGain: Math.round(elevationGain),
      remainingElevation: Math.round(remainingElevation),
      fatigueStatus: fatigueLevel > 1.2 ? 'CRITICAL' : fatigueLevel > 1.1 ? 'ELEVATED' : fatigueLevel < 0.9 ? 'STRONG' : 'NORMAL'
    }
  }

  const metrics = getStatusMetrics()
  
  return (
    <motion.div
      variants={{
        hovered: {
          rotateY: "15deg",
          rotateX: "2.5deg",
          x: -10,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      transition={{
        duration: 0.35,
      }}
      className="w-full h-[32rem] rounded-xl p-4 bg-gradient-to-br from-green-300/20 to-orange-300/20 eva-border"
    >
      {/* Status Screen */}
      <div
        style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }}
        className="w-full h-full bg-black rounded-xl eva-border-green p-3 relative overflow-hidden"
      >
        {/* Header */}
        <div className="eva-status-bar mb-6 text-center">
          CLIMBER_STATUS_MONITOR
        </div>
        
        {/* Main Display */}
        <div
          style={{
            transformStyle: "preserve-3d",
          }}
          className="grid grid-rows-4 gap-3 h-full text-xs"
        >
          {/* Current Position */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="eva-border-green p-4 bg-green-500/10 flex items-center"
          >
            <div className="flex-1">
              <div className="eva-text-green text-xs mb-1">CURRENT_POSITION:</div>
              <div className="eva-text text-2xl font-bold">{currentMile.toFixed(1)} MI</div>
              <div className="eva-text text-xs">{phase.toUpperCase()}_PHASE</div>
            </div>
            <div className="text-right">
              <div className="eva-text-green text-xs">ELEVATION:</div>
              <div className="eva-text font-bold">{elevation.toLocaleString()}FT</div>
            </div>
          </div>

          {/* Progress Metrics */}
          <div
            style={{ transform: "translateZ(60px)" }}
            className="eva-border p-4 bg-orange-500/10"
          >
            <div className="eva-text-green text-xs mb-3">MISSION_PROGRESS:</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="eva-text">ROUTE_COMPLETE:</div>
                <div className="eva-text font-bold">{metrics.progress}%</div>
              </div>
              <div>
                <div className="eva-text">ELEVATION_GAINED:</div>
                <div className="eva-text font-bold">{metrics.elevationGain.toLocaleString()}FT</div>
              </div>
            </div>
          </div>

          {/* Performance Status */}
          <div
            style={{ transform: "translateZ(80px)" }}
            className="eva-border p-4 bg-orange-500/10 flex items-center justify-center"
          >
            <FiMap className="text-4xl eva-text-green mr-4" />
            <div>
              <div className="eva-text-green text-xs">PERFORMANCE_STATUS:</div>
              <div className={`text-xl font-bold ${
                metrics.fatigueStatus === 'CRITICAL' ? 'eva-text-red eva-warning' : 
                metrics.fatigueStatus === 'ELEVATED' ? 'text-yellow-400' : 
                metrics.fatigueStatus === 'STRONG' ? 'eva-text-green' : 'eva-text'
              }`}>
                {metrics.fatigueStatus}
              </div>
            </div>
          </div>

          {/* Next Objective */}
          <div
            style={{ transform: "translateZ(120px)" }}
            className="eva-border-red p-4 bg-red-500/10"
          >
            <div className="eva-text-green text-xs mb-2">NEXT_OBJECTIVE:</div>
            <div className="eva-text text-sm">
              {nextLocation || 'MISSION_COMPLETE'}
            </div>
            <div className="eva-text text-xs mt-2">
              REMAINING_ELEVATION: {metrics.remainingElevation.toLocaleString()}FT
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const StatusCardCopy = () => {
  return (
    <div className="flex items-center mt-6">
      <motion.div
        variants={{
          hovered: {
            x: 0,
            opacity: 1,
          },
        }}
        style={{
          x: -40,
          opacity: 0,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        <FiArrowRight className="text-2xl mr-4 eva-text" />
      </motion.div>
      <motion.div
        variants={{
          hovered: {
            x: 0,
          },
        }}
        style={{
          x: -40,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        <h4 className="text-xl font-bold mb-1 eva-text">
          Real-time Performance Monitoring
        </h4>
        <span className="eva-text text-sm opacity-70">
          Advanced biometric tracking with fatigue analysis and route optimization.
        </span>
      </motion.div>
    </div>
  )
}

// Analysis Card for Performance Data
interface AnalysisCardProps {
  adjustedPaces: { [key: string]: number }
  predictions: any[]
  startTime: string
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({ 
  adjustedPaces, 
  predictions, 
  startTime 
}) => {
  return (
    <NervCard hover3D className="h-full">
      <AnalysisCardContent 
        adjustedPaces={adjustedPaces}
        predictions={predictions}
        startTime={startTime}
      />
      <AnalysisCardCopy />
    </NervCard>
  )
}

const AnalysisCardContent: React.FC<AnalysisCardProps> = ({ 
  adjustedPaces, 
  predictions, 
  startTime 
}) => {
  const timeToMinutes = (timeStr: string): number => {
    const [hours, mins] = timeStr.split(':').map(Number)
    return hours * 60 + mins
  }

  const endTime = predictions[predictions.length - 1]?.predictedTime || startTime
  const totalMinutes = timeToMinutes(endTime) - timeToMinutes(startTime)
  const returnHour = parseInt(endTime.split(':')[0])
  const summitETA = predictions.find(r => r.mile === 6.5)?.predictedTime

  // Calculate terrain performance variance
  const getTerrainPerformance = () => {
    const terrainTypes = ['flat', 'steady', 'boulder', 'technical']
    return terrainTypes.map(terrain => ({
      terrain,
      adjustment: adjustedPaces[terrain] || 1.0,
      variance: Math.abs((adjustedPaces[terrain] || 1.0) - 1.0)
    }))
  }

  const terrainPerformance = getTerrainPerformance()
  const avgVariance = terrainPerformance.reduce((sum, t) => sum + t.variance, 0) / terrainPerformance.length

  return (
    <motion.div
      variants={{
        hovered: {
          rotateY: "-15deg",
          rotateX: "2.5deg",
          x: 10,
        },
      }}
      style={{
        transformStyle: "preserve-3d",
      }}
      transition={{
        duration: 0.35,
      }}
      className="w-full h-96 rounded-xl p-4 bg-gradient-to-br from-orange-300/20 to-red-300/20 eva-border"
    >
      {/* Analysis Screen */}
      <div
        style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }}
        className="w-full h-full bg-black rounded-xl eva-border p-4 relative"
      >
        {/* Header */}
        <div className="eva-status-bar mb-6 text-center">
          PERFORMANCE_ANALYSIS
        </div>
        
        {/* Main Display */}
        <div
          style={{
            transformStyle: "preserve-3d",
          }}
          className="grid grid-rows-4 gap-4 h-full"
        >
          {/* Mission Timeline */}
          <div
            style={{ transform: "translateZ(40px)" }}
            className="eva-border-green p-4 bg-green-500/10"
          >
            <div className="eva-text-green text-xs mb-2">MISSION_TIMELINE:</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="eva-text">TOTAL_TIME:</div>
                <div className="eva-text font-bold text-lg">
                  {Math.floor(totalMinutes / 60)}H {totalMinutes % 60}M
                </div>
              </div>
              <div>
                <div className="eva-text">SUMMIT_ETA:</div>
                <div className="eva-text font-bold">{summitETA || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div
            style={{ transform: "translateZ(60px)" }}
            className="eva-border p-4 bg-orange-500/10"
          >
            <div className="eva-text-green text-xs mb-2">PERFORMANCE_METRICS:</div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="eva-text">AVG_FATIGUE:</div>
                <div className={`font-bold ${
                  (adjustedPaces.fatigue || 1) > 1.1 ? 'eva-text-red' : 'eva-text-green'
                }`}>
                  {adjustedPaces.fatigue ? 
                    Math.round(((adjustedPaces.fatigue - 1) * 100)) + '%' : 
                    'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="eva-text">TERRAIN_VARIANCE:</div>
                <div className="eva-text font-bold">
                  {(avgVariance * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div
            style={{ transform: "translateZ(80px)" }}
            className="eva-border p-4 bg-orange-500/10 flex items-center justify-center"
          >
            <FiTrendingUp className="text-4xl eva-text mr-4" />
            <div className="flex-1">
              <div className="eva-text-green text-xs">RISK_ASSESSMENT:</div>
              <div className={`text-lg font-bold ${
                returnHour >= 17 ? 'eva-text-red' : 'eva-text-green'
              }`}>
                {returnHour >= 17 ? 'HIGH_RISK' : 'ACCEPTABLE'}
              </div>
            </div>
          </div>

          {/* Return Status */}
          <div
            style={{ transform: "translateZ(120px)" }}
            className={`eva-border p-4 flex items-center justify-center ${
              returnHour >= 17 ? 'eva-border-red bg-red-500/10 eva-warning' : 'bg-green-500/10'
            }`}
          >
            <div className="text-center flex-1">
              <div className="eva-text-green text-xs mb-1">RETURN_TIME:</div>
              <div className={`text-xl font-bold ${
                returnHour >= 17 ? 'eva-text-red' : 'eva-text-green'
              }`}>
                {endTime}
              </div>
              {returnHour >= 17 && (
                <div className="eva-text-red text-xs mt-1">LATE_RETURN_WARNING</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const AnalysisCardCopy = () => {
  return (
    <div className="flex items-center mt-6">
      <motion.div
        variants={{
          hovered: {
            x: 0,
            opacity: 1,
          },
        }}
        style={{
          x: -40,
          opacity: 0,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        <FiArrowRight className="text-2xl mr-4 eva-text" />
      </motion.div>
      <motion.div
        variants={{
          hovered: {
            x: 0,
          },
        }}
        style={{
          x: -40,
        }}
        transition={{
          duration: 0.35,
        }}
      >
        <h4 className="text-xl font-bold mb-1 eva-text">
          Advanced Mission Analysis
        </h4>
        <span className="eva-text text-sm opacity-70">
          Predictive modeling with fatigue coefficients and timeline optimization.
        </span>
      </motion.div>
    </div>
  )
}

// Simple Info Cards for Grid Layout
interface InfoCardProps {
  title: string
  value: string | number
  subtitle?: string
  color?: 'green' | 'orange' | 'red' | 'default'
  icon?: React.ReactNode
  className?: string
}

export const InfoCard: React.FC<InfoCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = 'default',
  icon,
  className = ""
}) => {
  const colorClasses = {
    green: 'eva-border-green bg-gradient-to-br from-green-500/10 to-green-500/5',
    orange: 'eva-border bg-gradient-to-br from-orange-500/10 to-orange-500/5',
    red: 'eva-border-red bg-gradient-to-br from-red-500/10 to-red-500/5',
    default: 'eva-border bg-gradient-to-br from-gray-500/10 to-gray-500/5'
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`eva-terminal p-4 ${colorClasses[color]} ${className}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`text-2xl ${
            color === 'green' ? 'eva-text-green' : 
            color === 'red' ? 'eva-text-red' : 
            color === 'orange' ? 'eva-text' : 'eva-text'
          }`}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="eva-text-green text-xs font-bold uppercase">{title}</div>
          <div className="eva-text text-xl font-bold">{value}</div>
          {subtitle && (
            <div className="eva-text text-xs opacity-70">{subtitle}</div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default { NervCard, StatusCard, AnalysisCard, InfoCard }