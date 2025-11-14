/**
 * Normalize Saudi phone numbers to a canonical format: +9665xxxxxxxx
 * Accepts formats:
 * - +966501234567
 * - 966501234567
 * - 0501234567
 * - 501234567
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all spaces, dashes, and parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading + if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 966, ensure it's formatted correctly
  if (cleaned.startsWith('966')) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, remove it and add +966
  if (cleaned.startsWith('0')) {
    return `+966${cleaned.substring(1)}`;
  }
  
  // If it's just the number (5xxxxxxxx), add +966
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return `+966${cleaned}`;
  }
  
  // Default: assume it needs +966 prefix
  return `+966${cleaned}`;
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
