// Base API Service configuration for Earthworm AI Backend

// BACKEND API CONNECTIVITY NOTE:
// Replace BASE_URL with production API URL (e.g., https://api.earthworm.ai/v1) when backend service goes live.
export const BASE_URL = 'https://api.earthworm.ai/v1';

/**
 * Generic API request wrapper with async fetch simulation & error handling.
 */
export const fetchApi = async (endpoint, options = {}) => {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Authorization token placeholder:
      // 'Authorization': `Bearer ${token}`
    };

    const config = {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    // NOTE: Backend logic integration placeholder.
    // For current frontend prototype UI, we simulate a fast network delay and return payload.
    await new Promise((resolve) => setTimeout(resolve, 600));

    /* 
    // REAL BACKEND CALL CODE:
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
    */

    return { success: true, message: 'Mock API Response' };
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error);
    throw error;
  }
};
