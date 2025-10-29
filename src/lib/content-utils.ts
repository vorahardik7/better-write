/**
 * Content utilities for calculating page count, content size, and enforcing limits
 */

// Constants for page calculation
const WORDS_PER_PAGE = 500;
const AVERAGE_CHARACTERS_PER_WORD = 5;
const BYTES_PER_CHARACTER = 1; // For UTF-8, most characters are 1 byte

/**
 * Calculate the estimated page count from content text
 * @param contentText - The plain text content
 * @returns Estimated number of pages
 */
export function calculatePageCount(contentText: string | null | undefined): number {
  if (!contentText || contentText.trim().length === 0) {
    return 0;
  }

  // Count words by splitting on whitespace
  const words = contentText.trim().split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate pages (minimum 1 page if there's any content)
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
}

/**
 * Calculate the content size in bytes
 * @param content - The content (can be string or object)
 * @returns Size in bytes
 */
export function calculateContentSizeBytes(content: any): number {
  if (!content) return 0;

  let contentString: string;
  
  if (typeof content === 'string') {
    contentString = content;
  } else if (typeof content === 'object') {
    // For JSON content, stringify it
    contentString = JSON.stringify(content);
  } else {
    contentString = String(content);
  }

  // Calculate bytes (UTF-8 encoding)
  return new Blob([contentString]).size;
}

/**
 * Extract plain text from TipTap JSON content
 * @param jsonContent - The TipTap JSON content
 * @returns Plain text string
 */
export function extractTextFromJson(jsonContent: any): string {
  if (!jsonContent) return '';
  
  function extractText(node: any): string {
    if (typeof node === 'string') return node;
    if (typeof node !== 'object' || !node) return '';
    
    if (node.text) return node.text;
    
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractText).join('');
    }
    
    return '';
  }
  
  return extractText(jsonContent).trim();
}

/**
 * Calculate word count from content text
 * @param contentText - The plain text content
 * @returns Number of words
 */
export function calculateWordCount(contentText: string | null | undefined): number {
  if (!contentText || contentText.trim().length === 0) {
    return 0;
  }

  const words = contentText.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

/**
 * Calculate character count from content text
 * @param contentText - The plain text content
 * @returns Number of characters
 */
export function calculateCharacterCount(contentText: string | null | undefined): number {
  if (!contentText) return 0;
  return contentText.length;
}

/**
 * Calculate all content metrics from TipTap JSON content
 * @param jsonContent - The TipTap JSON content
 * @returns Object with all calculated metrics
 */
export function calculateContentMetrics(jsonContent: any) {
  const contentText = extractTextFromJson(jsonContent);
  const wordCount = calculateWordCount(contentText);
  const characterCount = calculateCharacterCount(contentText);
  const pageCount = calculatePageCount(contentText);
  const contentSizeBytes = calculateContentSizeBytes(jsonContent);

  return {
    contentText,
    wordCount,
    characterCount,
    pageCount,
    contentSizeBytes,
  };
}

/**
 * Check if content exceeds size limits
 * @param content - The content to check
 * @param maxSizeBytes - Maximum size in bytes
 * @param maxPages - Maximum number of pages
 * @returns Object with validation results
 */
export function validateContentLimits(
  content: any,
  maxSizeBytes: number = 1048576, // 1MB default
  maxPages: number = 10
) {
  const metrics = calculateContentMetrics(content);
  
  const isSizeValid = metrics.contentSizeBytes <= maxSizeBytes;
  const isPageCountValid = metrics.pageCount <= maxPages;
  
  return {
    isValid: isSizeValid && isPageCountValid,
    metrics,
    errors: [
      ...(isSizeValid ? [] : [`Content size (${Math.round(metrics.contentSizeBytes / 1024)}KB) exceeds limit (${Math.round(maxSizeBytes / 1024)}KB)`]),
      ...(isPageCountValid ? [] : [`Page count (${metrics.pageCount}) exceeds limit (${maxPages} pages)`]),
    ],
  };
}

/**
 * Format bytes to human readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.2 MB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format page count with proper pluralization
 * @param pageCount - Number of pages
 * @returns Formatted string (e.g., "1 page" or "5 pages")
 */
export function formatPageCount(pageCount: number): string {
  return pageCount === 1 ? '1 page' : `${pageCount} pages`;
}
