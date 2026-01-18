/**
 * Highlights occurrences of a search term in a text with a yellow background
 * @param text The text to search in
 * @param searchTerm The term to highlight
 * @returns HTML string with highlighted terms
 */
export const highlightText = (text: string, searchTerm: string): string => {
  if (!searchTerm || !text) return text || '';
  
  try {
    // Escape special regex characters
    const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded">$1</mark>');
  } catch (error) {
    // If regex fails for any reason, return the original text
    console.warn('Failed to highlight text:', error);
    return text;
  }
};