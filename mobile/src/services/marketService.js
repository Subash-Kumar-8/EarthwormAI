import { MARKET_CROPS } from '../constants/mockData';
import { fetchApi } from './api';

export const marketService = {
  /**
   * Get all crop market prices with optional search or category filter
   * @param {string} query 
   * @param {string} category 
   */
  getMarketPrices: async (query = '', category = 'All') => {
    console.log(`[Backend Integration Point] Fetching Mandi prices query: "${query}", category: "${category}"`);
    await fetchApi(`/market/prices?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`);
    
    let results = MARKET_CROPS;
    if (category !== 'All') {
      results = results.filter((c) => c.category.toLowerCase() === category.toLowerCase());
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (c) => c.name.toLowerCase().includes(q) || c.mandi.toLowerCase().includes(q)
      );
    }
    return results;
  },

  /**
   * Fetch price comparison for a specific crop across nearby Mandis
   * @param {string} cropId 
   */
  getCropPriceComparison: async (cropId) => {
    console.log(`[Backend Integration Point] Comparing Mandi prices for crop ID: ${cropId}`);
    await fetchApi(`/market/compare?cropId=${cropId}`);
    const crop = MARKET_CROPS.find((c) => c.id === cropId) || MARKET_CROPS[0];
    return crop.nearbyMandis;
  },
};
