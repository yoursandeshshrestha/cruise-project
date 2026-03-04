import { format, parse } from 'date-fns';

/**
 * Standard date format used throughout the application: DD-MMM-YYYY (e.g., 15-Jan-2024)
 */
export const DATE_FORMAT = 'dd-MMM-yyyy';

/**
 * Date format for display with month name: DD MMM YYYY (e.g., 15-Jan-2024)
 */
export const DATE_FORMAT_SHORT = 'dd-MMM-yyyy';

/**
 * Date format for display with full month name: DD MMMM YYYY (e.g., 15 January 2024)
 */
export const DATE_FORMAT_LONG = 'dd MMMM yyyy';

/**
 * Date format with time: DD-MMM-YYYY HH:mm (e.g., 15-Jan-2024 14:30)
 */
export const DATETIME_FORMAT = 'dd-MMM-yyyy HH:mm';

/**
 * Date format with full time and weekday: EEEE, DD MMMM YYYY - HH:mm
 */
export const DATETIME_FORMAT_FULL = 'EEEE, dd MMMM yyyy - HH:mm';

/**
 * Date format for database storage: YYYY-MM-DD
 */
export const DB_DATE_FORMAT = 'yyyy-MM-dd';

/**
 * Formats a date to DD-MMM-YYYY format (e.g., 15-Jan-2024)
 * @param date - Date object or date string
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date to DD-MM-YYYY with short month name
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., 15-Jan-2024)
 */
export const formatDateShort = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DATE_FORMAT_SHORT);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date to DD MMMM YYYY format
 * @param date - Date object or date string
 * @returns Formatted date string (e.g., 15 January 2024)
 */
export const formatDateLong = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DATE_FORMAT_LONG);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date and time to DD-MMM-YYYY HH:mm format (e.g., 15-Jan-2024 14:30)
 * @param date - Date object or date string
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DATETIME_FORMAT);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Formats a date and time with weekday to EEEE, DD MMMM YYYY - HH:mm format
 * @param date - Date object or date string
 * @returns Formatted datetime string (e.g., Monday, 15 January 2024 - 14:30)
 */
export const formatDateTimeFull = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DATETIME_FORMAT_FULL);
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '';
  }
};

/**
 * Formats a date for database storage (YYYY-MM-DD)
 * @param date - Date object or date string
 * @returns Formatted date string for database
 */
export const formatDateForDB = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, DB_DATE_FORMAT);
  } catch (error) {
    console.error('Error formatting date for DB:', error);
    return '';
  }
};

/**
 * Formats date with options for en-GB locale (DD/MM/YYYY)
 * Used for backward compatibility with toLocaleDateString
 * @param date - Date object or date string
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDateLocale = (
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-GB', options);
  } catch (error) {
    console.error('Error formatting date with locale:', error);
    return '';
  }
};

/**
 * Parses a DD-MM-YYYY date string to Date object
 * @param dateString - Date string in DD-MM-YYYY format
 * @returns Date object
 */
export const parseDate = (dateString: string): Date => {
  try {
    return parse(dateString, DATE_FORMAT, new Date());
  } catch (error) {
    console.error('Error parsing date:', error);
    return new Date();
  }
};
