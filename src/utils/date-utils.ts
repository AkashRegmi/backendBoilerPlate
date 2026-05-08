// utils/date-utils.ts
import { isAfter, isBefore, isValid } from 'date-fns'

export class NepalDateUtils {
  // Nepal timezone offset: UTC+5:45 (5 hours 45 minutes = 345 minutes)
  static readonly NEPAL_OFFSET_MINUTES = 345
  static readonly NEPAL_TIMEZONE = 'Asia/Kathmandu'

  /**
   * Convert any date to Nepal time
   */
  static toNepalTime(date: Date | string): Date {
    const inputDate = new Date(date)
    const utcTime = inputDate.getTime()
    const nepalTime = utcTime + this.NEPAL_OFFSET_MINUTES * 60 * 1000
    return new Date(nepalTime)
  }

  /**
   * Get current Nepal time
   */
  static currentNepalTime(): Date {
    const now = new Date()
    return this.toNepalTime(now)
  }

  /**
   * Format date in Nepal time with custom format
   */
  static formatNepaliDate(
    date: Date | string,
    options: Intl.DateTimeFormatOptions = {},
  ): string {
    const nepalDate = this.toNepalTime(date)
    const defaultOptions: Intl.DateTimeFormatOptions = {
      timeZone: this.NEPAL_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      ...options,
    }
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(nepalDate)
  }

  /**
   * Validate date range for Nepal time
   */
  static validateDateRange(
    startDate: Date | string,
    endDate: Date | string,
  ): {
    isValid: boolean
    errors: string[]
    startNepal?: Date
    endNepal?: Date
  } {
    const errors: string[] = []

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check if dates are valid
    if (!isValid(start)) errors.push('Invalid start date')
    if (!isValid(end)) errors.push('Invalid end date')

    if (errors.length > 0) {
      return { isValid: false, errors }
    }

    const startNepal = this.toNepalTime(start)
    const endNepal = this.toNepalTime(end)
    const nowNepal = this.currentNepalTime()

    // Start date cannot be greater than end date
    if (isAfter(startNepal, endNepal)) {
      errors.push('Start date must be before or equal to end date')
    }

    // Additional validations
    if (isBefore(endNepal, nowNepal)) {
      errors.push('End date cannot be in the past')
    }

    if (isBefore(startNepal, nowNepal)) {
      errors.push('Start date cannot be in the past')
    }

    return {
      isValid: errors.length === 0,
      errors,
      startNepal,
      endNepal,
    }
  }

  /**
   * Convert local date to MongoDB UTC date
   */
  // utils/date-utils.ts

  static toMongoDBUTC(date?: Date | string): Date {
    // If no date provided, use current Nepal time
    if (!date) {
      const nowNepal = this.currentNepalTime()
      return new Date(
        nowNepal.getTime() - this.NEPAL_OFFSET_MINUTES * 60 * 1000,
      )
    }

    try {
      const localDate = new Date(date)

      // Check if date is valid
      if (isNaN(localDate.getTime())) {
        console.warn(
          `Invalid date provided: ${date}, using current date instead`,
        )
        const nowNepal = this.currentNepalTime()
        return new Date(
          nowNepal.getTime() - this.NEPAL_OFFSET_MINUTES * 60 * 1000,
        )
      }

      const nepalTime = this.toNepalTime(localDate)
      // Convert back to UTC for MongoDB storage
      return new Date(
        nepalTime.getTime() - this.NEPAL_OFFSET_MINUTES * 60 * 1000,
      )
    } catch (error) {
      console.error('Error converting to MongoDB UTC:', error)
      const nowNepal = this.currentNepalTime()
      return new Date(
        nowNepal.getTime() - this.NEPAL_OFFSET_MINUTES * 60 * 1000,
      )
    }
  }

  /**
   * Convert MongoDB UTC date to Nepal time
   */
  static fromMongoDBToNepal(utcDate: Date | string): Date {
    return this.toNepalTime(utcDate)
  }
}
