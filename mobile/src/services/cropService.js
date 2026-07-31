// Crop AI & Disease Detection API Service (Placeholder for backend connection)
import { DISEASE_DETECTION_SAMPLE, SAMPLE_FERTILIZER_RESULT } from '../constants/mockData';
import { fetchApi } from './api';

export const cropService = {
  /**
   * Analyze leaf image for disease diagnosis using AI Computer Vision backend
   * @param {string} imageUri 
   */
  diagnoseDiseaseImage: async (imageUri) => {
    // BACKEND API ENDPOINT: POST /ai/crop-disease/diagnose
    console.log(`[Backend Integration Point] Uploading image for AI diagnosis: ${imageUri}`);
    // Backend API would process multipart/form-data upload to AI Computer Vision server
    await fetchApi('/ai/crop-disease/diagnose', { method: 'POST', body: { imageUri } });
    return DISEASE_DETECTION_SAMPLE;
  },

  /**
   * Generate customized fertilizer NPK recommendations based on soil & crop details
   * @param {object} soilAndCropParams 
   */
  getFertilizerRecommendation: async (soilAndCropParams) => {
    // BACKEND API ENDPOINT: POST /ai/fertilizer/recommend
    console.log('[Backend Integration Point] Calculating fertilizer schedule for:', soilAndCropParams);
    await fetchApi('/ai/fertilizer/recommend', { method: 'POST', body: soilAndCropParams });
    return SAMPLE_FERTILIZER_RESULT;
  },

  /**
   * Send question to Earthworm AI Assistant
   * @param {string} query 
   */
  queryAIAssistant: async (query) => {
    // BACKEND API ENDPOINT: POST /ai/assistant/chat
    console.log(`[Backend Integration Point] Querying AI Assistant: "${query}"`);
    await fetchApi('/ai/assistant/chat', { method: 'POST', body: { query } });
    return {
      id: `msg-${Date.now()}`,
      sender: 'ai',
      text: `Thank you for asking about "${query}". Based on current agricultural guidelines in your region, we recommend applying target treatment and keeping soil moisture consistent.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  },
};
