/**
 * Utility functions for handling image URLs
 */

// Get API base URL from environment variables with fallback
// Using import.meta.env for Vite projects
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
// Remove console.log in production
if (process.env.NODE_ENV !== 'production') {
  console.log('Using API base URL for images:', API_BASE_URL);
}

/**
 * Checks if a URL already contains a domain to prevent duplication
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL already has a domain
 */
const hasProtocol = (url) => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Extracts the uploads path from any URL format
 * @param {string} url - The URL to extract from
 * @returns {string|null} - The extracted uploads path or null if not found
 */
const extractUploadsPath = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Find the uploads part in the URL
  const uploadsIndex = url.indexOf('uploads');
  if (uploadsIndex === -1) return null;
  
  // Extract everything from 'uploads' onwards
  return url.substring(uploadsIndex);
};

/**
 * Fixes image URLs to use the correct base path
 * @param {string} url - The original image URL
 * @returns {string} - The corrected image URL
 */
export const fixImageUrl = (url) => {
  // Define a reliable fallback image (base64 encoded small gray placeholder)
  const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  
  // If imageUrl is null or undefined, return fallback image
  if (!url) {
    return fallbackImage;
  }
  
  // If it's an imported image (webpack module), return the object itself
  if (typeof url === 'object') {
    return url;
  }
  
  // Check for problematic placeholder URLs
  if (typeof url === 'string' && (
    url.includes('via.placeholder.com') || 
    url.includes('placehold.co') ||
    (url.includes('placeholder') && !url.includes('uploads/'))
  )) {
    return fallbackImage;
  }
  
  // PRIORITY 1: Handle uploads path directly
  if (typeof url === 'string') {
    // Direct handling for uploads paths
    if (url.includes('uploads/')) {
      // If it already has the API base URL, return as is
      if (url.includes(API_BASE_URL)) {
        return url;
      }
      
      // If it's a relative path with uploads, ensure proper formatting
      if (url.startsWith('/uploads/')) {
        return `${API_BASE_URL}${url}`;
      }
      
      // If it's just 'uploads/something', add the API base URL and a slash
      if (url.startsWith('uploads/')) {
        return `${API_BASE_URL}/${url}`;
      }
      
      // Extract uploads path if it exists anywhere else in the URL
      const uploadsPath = extractUploadsPath(url);
      if (uploadsPath) {
        return `${API_BASE_URL}/${uploadsPath}`;
      }
    }
    
    // If the URL already contains the same API base URL, return as is
    if (url.includes(API_BASE_URL)) {
      return url;
    }
    
    // If the URL contains localhost with a different port, extract the path
    if (url.includes('localhost:') && !url.includes(API_BASE_URL)) {
      const pathMatch = url.match(/localhost:\d+\/(.+)/);
      if (pathMatch && pathMatch[1]) {
        return `${API_BASE_URL}/${pathMatch[1]}`;
      }
    }
    
    // If the path is relative with /api/ prefix, remove it
    if (url.startsWith('/api/')) {
      return `${API_BASE_URL}${url.replace('/api/', '/')}`;
    }
    
    // If the path is relative, prepend the API base URL
    if (url.startsWith('/')) {
      return `${API_BASE_URL}${url}`;
    }
    
    // If the path doesn't start with slash, add one
    if (!hasProtocol(url) && !url.startsWith('/')) {
      return `${API_BASE_URL}/${url}`;
    }
  }
  
  // For external URLs (not localhost), return as is
  if (typeof url === 'string' && hasProtocol(url) && !url.includes('localhost')) {
    return url;
  }
  
  // Fallback for any other case
  return url || fallbackImage;
};