/**
 * Normalize phone numbers to canonical format
 * - If already in international format (+countrycode), returns as-is
 * - For Saudi local formats (0501234567 or 501234567), converts to +9665xxxxxxxx
 * Accepts formats:
 * - +966501234567 (any country code)
 * - +15551234567 (international format)
 * - 0501234567 (Saudi local with leading 0)
 * - 501234567 (Saudi local without leading 0)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // If already in international format (starts with +), return as-is
  if (cleaned.startsWith('+')) {
    return cleaned;
  }
  
  // If starts with 966 (Saudi country code without +), add +
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0 (local Saudi number with leading 0), convert to international
  if (cleaned.startsWith('0')) {
    return `+966${cleaned.substring(1)}`;
  }
  
  // If it's just the number (5xxxxxxxx or similar), assume Saudi and add +966
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return `+966${cleaned}`;
  }
  
  // If none of the above patterns match, return with + prefix (assume already has country code)
  return `+${cleaned}`;
}

/**
 * Generate a new order number in format: IV-YYYY-NNNN
 * Example: IV-2025-0001, IV-2025-0002, etc.
 * 
 * This function queries the database to find the highest sequence number
 * for the current year and increments it.
 */
export function generateOrderNumber(year: number, sequence: number): string {
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `IV-${year}-${paddedSequence}`;
}

/**
 * Get the current year for order number generation
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Extract year and sequence from an order number
 * Example: IV-2025-0042 => { year: 2025, sequence: 42 }
 */
export function parseOrderNumber(orderNumber: string): { year: number; sequence: number } | null {
  const match = orderNumber.match(/^IV-(\d{4})-(\d{4})$/);
  if (!match) return null;
  
  return {
    year: parseInt(match[1], 10),
    sequence: parseInt(match[2], 10)
  };
}
