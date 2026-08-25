export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const fetchApi = async (endpoint, options = {}) => {
  try {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const config = {
      method: options.method || 'GET',
      headers: { ...defaultHeaders, ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    };

    await new Promise((resolve) => setTimeout(resolve, 600));

    return { success: true, message: 'Mock API Response' };
  } catch (error) {
    console.error(`API Error on [${endpoint}]:`, error);
    throw error;
  }
};
