// Base URL for the backend API.
// In production, set VITE_API_URL in the hosting environment (e.g. https://api.yoursite.com).
// Falls back to localhost for local development.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
