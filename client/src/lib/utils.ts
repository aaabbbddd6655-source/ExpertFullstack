import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a short order ID from the full order number
 * New format: "IV-2025-0001" (already short, returned as-is)
 * Old format: "IV-1763076259627-UX0QEH" => "IV-9627UH"
 */
export function generateShortOrderId(fullOrderId: string): string {
  try {
    // New format: IV-2025-0001 (already short and user-friendly)
    if (fullOrderId.match(/^IV-\d{4}-\d{4}$/)) {
      return fullOrderId;
    }
    
    // Old format: IV-{timestamp}-{random}
    const parts = fullOrderId.split('-');
    if (parts.length === 3 && parts[0] === 'IV') {
      const timestamp = parts[1];
      const random = parts[2];
      
      // Take last 4 digits of timestamp
      const shortTimestamp = timestamp.slice(-4);
      
      // Take last 2 characters of random suffix
      const shortRandom = random.slice(-2);
      
      return `IV-${shortTimestamp}${shortRandom}`;
    }
  } catch (error) {
    console.error('Error generating short order ID:', error);
  }
  
  // Fallback: just return the full order ID
  return fullOrderId;
}
