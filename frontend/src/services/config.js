// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  UPLOAD_URL: import.meta.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
};

export default API_CONFIG;