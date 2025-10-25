/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize string input to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize document title
 * @param title - The title to validate
 * @returns Sanitized title or null if invalid
 */
export function validateDocumentTitle(title: unknown): string | null {
  if (typeof title !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeString(title);
  
  if (sanitized.length === 0 || sanitized.length > 200) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate and sanitize search query
 * @param query - The query to validate
 * @returns Sanitized query or null if invalid
 */
export function validateSearchQuery(query: unknown): string | null {
  if (typeof query !== 'string') {
    return null;
  }
  
  const sanitized = sanitizeString(query);
  
  if (sanitized.length === 0 || sanitized.length > 500) {
    return null;
  }
  
  return sanitized;
}

/**
 * Validate document ID format
 * @param id - The ID to validate
 * @returns True if valid UUID format
 */
export function validateDocumentId(id: unknown): boolean {
  if (typeof id !== 'string') {
    return false;
  }
  
  // Check if it's a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Validate numeric limits
 * @param limit - The limit to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validated limit or null if invalid
 */
export function validateLimit(limit: unknown, min: number = 1, max: number = 100): number | null {
  if (typeof limit !== 'number' || !Number.isInteger(limit)) {
    return null;
  }
  
  if (limit < min || limit > max) {
    return null;
  }
  
  return limit;
}

/**
 * Validate boolean values
 * @param value - The value to validate
 * @returns Boolean value or null if invalid
 */
export function validateBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true') return true;
    if (lower === 'false') return false;
  }
  
  return null;
}

/**
 * Validate array of strings
 * @param arr - The array to validate
 * @param maxLength - Maximum length of array
 * @param maxItemLength - Maximum length of each item
 * @returns Validated array or null if invalid
 */
export function validateStringArray(
  arr: unknown, 
  maxLength: number = 10, 
  maxItemLength: number = 100
): string[] | null {
  if (!Array.isArray(arr)) {
    return null;
  }
  
  if (arr.length > maxLength) {
    return null;
  }
  
  const validated = arr
    .filter(item => typeof item === 'string')
    .map(item => sanitizeString(item))
    .filter(item => item.length > 0 && item.length <= maxItemLength);
  
  return validated.length === arr.length ? validated : null;
}

/**
 * Log security events
 * @param event - The security event type
 * @param details - Event details
 * @param userId - User ID if available
 * @param request - Request object for additional context
 */
export function logSecurityEvent(
  event: string, 
  details: any, 
  userId?: string, 
  request?: any
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    userId,
    details,
    ip: request?.ip || request?.headers?.get('x-forwarded-for') || 'unknown',
    userAgent: request?.headers?.get('user-agent') || 'unknown'
  };
  
  console.log(JSON.stringify(logEntry));
}

/**
 * Rate limiting helper (basic implementation)
 * In production, use a proper rate limiting service like Upstash Redis
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  limit: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);
  
  if (!current || now > current.resetTime) {
    // Reset or create new entry
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  
  if (current.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }
  
  // Increment count
  current.count++;
  rateLimitMap.set(key, current);
  
  return { 
    allowed: true, 
    remaining: limit - current.count, 
    resetTime: current.resetTime 
  };
}
