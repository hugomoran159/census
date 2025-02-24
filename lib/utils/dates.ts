export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

export const parseDate = (dateStr: string): Date => {
  if (!dateStr) throw new Error('Invalid date string: empty')
  
  // Handle both formats: dd/mm/yyyy and yyyy-mm-dd HH:mm:ss
  if (dateStr.includes('/')) {
    // dd/mm/yyyy format
    const [day, month, year] = dateStr.split('/')
    if (!day || !month || !year) {
      throw new Error(`Invalid date format: ${dateStr}`)
    }
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  } else {
    // yyyy-mm-dd HH:mm:ss format
    const [datePart] = dateStr.split(' ')
    const [year, month, day] = datePart.split('-')
    if (!year || !month || !day) {
      throw new Error(`Invalid date format: ${dateStr}`)
    }
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  }
}

export const dateToTimestamp = (date: Date): number => {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date object')
  }
  // Ensure we're getting the UTC timestamp for start of day
  return Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  )
}

export const timestampToDate = (timestamp: number): Date => {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    throw new Error('Invalid timestamp')
  }
  return new Date(timestamp)
}

export const getDateRange = (dates: string[]): { min: number; max: number } => {
  if (!Array.isArray(dates) || dates.length === 0) {
    throw new Error('Invalid dates array')
  }
  
  const timestamps = dates.map(date => dateToTimestamp(parseDate(date)))
  return {
    min: Math.min(...timestamps),
    max: Math.max(...timestamps)
  }
}

export const isDateInRange = (date: number, range: { start: number; end: number }): boolean => {
  if (typeof date !== 'number' || isNaN(date)) return false
  if (!range || typeof range.start !== 'number' || typeof range.end !== 'number') return false
  return date >= range.start && date <= range.end
} 