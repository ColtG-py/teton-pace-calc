import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Additional utility functions for the NGE interface

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const timeToMinutes = (timeStr: string): number => {
  const [hours, mins] = timeStr.split(':').map(Number)
  return hours * 60 + mins
}

export const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
  const totalMinutes = timeToMinutes(timeStr) + minutesToAdd
  return formatTime(totalMinutes % (24 * 60)) // Handle day overflow
}

export const getFatigueStatusColor = (fatigueLevel: number): string => {
  if (fatigueLevel > 1.2) return 'eva-text-red eva-warning'
  if (fatigueLevel > 1.1) return 'text-yellow-400'
  if (fatigueLevel < 0.9) return 'eva-text-green'
  return 'eva-text'
}

export const getPhaseIcon = (phase: 'Ascent' | 'Summit' | 'Descent'): string => {
  switch (phase) {
    case 'Summit': return '★'
    case 'Descent': return '↓'
    case 'Ascent': return '↗'
    default: return '○'
  }
}

export const interpolateElevation = (
  mile: number,
  segments: Array<{ mile: number; elevation: number }>
): number => {
  // Find the two nearest segments
  let lowerSegment = segments[0]
  let upperSegment = segments[segments.length - 1]
  
  for (let i = 0; i < segments.length - 1; i++) {
    if (mile >= segments[i].mile && mile <= segments[i + 1].mile) {
      lowerSegment = segments[i]
      upperSegment = segments[i + 1]
      break
    }
  }
  
  // Linear interpolation
  const segmentRange = upperSegment.mile - lowerSegment.mile
  if (segmentRange === 0) return lowerSegment.elevation
  
  const positionInSegment = (mile - lowerSegment.mile) / segmentRange
  return lowerSegment.elevation + 
    (upperSegment.elevation - lowerSegment.elevation) * positionInSegment
}

export const generateNervId = (): string => {
  const chars = '0123456789ABCDEF'
  let result = 'NERV_'
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export const formatElevation = (elevation: number): string => {
  return `${elevation.toLocaleString()}FT`
}

export const calculateGrade = (
  startElevation: number,
  endElevation: number,
  distance: number
): number => {
  if (distance === 0) return 0
  const rise = endElevation - startElevation
  const run = distance * 5280 // Convert miles to feet
  return Math.round((rise / run) * 100)
}