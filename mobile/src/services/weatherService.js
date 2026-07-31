// Weather & Hyper-local Rainfall Advisory Service (Placeholder for backend connection)
import { FARMING_RECOMMENDATIONS_WEATHER, HOME_WEATHER, HOURLY_RAINFALL, WEATHER_FORECAST } from '../constants/mockData';
import { fetchApi } from './api';

export const weatherService = {
  /**
   * Fetch current weather summary & advisory for farmer's location
   * @param {string} location 
   */
  getWeatherSummary: async (location = 'Ludhiana, Punjab') => {
    // BACKEND API ENDPOINT: GET /weather/current?location={location}
    console.log(`[Backend Integration Point] Fetching weather summary for ${location}`);
    await fetchApi(`/weather/current?location=${encodeURIComponent(location)}`);
    return HOME_WEATHER;
  },

  /**
   * Fetch 7-day forecast & hourly rainfall predictions
   * @param {string} location 
   */
  getWeatherForecast: async (location = 'Ludhiana, Punjab') => {
    // BACKEND API ENDPOINT: GET /weather/forecast?location={location}
    console.log(`[Backend Integration Point] Fetching 7-day forecast for ${location}`);
    await fetchApi(`/weather/forecast?location=${encodeURIComponent(location)}`);
    return {
      forecast: WEATHER_FORECAST,
      hourlyRainfall: HOURLY_RAINFALL,
      recommendations: FARMING_RECOMMENDATIONS_WEATHER,
    };
  },
};
