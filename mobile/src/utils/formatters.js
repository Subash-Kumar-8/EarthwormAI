// Utility formatting functions for Earthworm AI

/**
 * Format currency in Indian Rupees (₹)
 * @param {number} amount 
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
};

/**
 * Format price change with +/- symbol
 * @param {number} change 
 * @returns {string} Formatted change string
 */
export const formatPriceChange = (change) => {
  if (!change) return '₹0';
  const prefix = change > 0 ? '+₹' : '-₹';
  return `${prefix}${Math.abs(change)}`;
};

/**
 * Format percentage
 * @param {number} value 
 * @returns {string} Formatted percentage
 */
export const formatPercent = (value) => {
  if (typeof value !== 'number') return '0%';
  return `${value}%`;
};

/**
 * Get current formatted date string (e.g. "Friday, 31 July 2026")
 * @returns {string}
 */
export const getFormattedCurrentDate = () => {
  const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  return new Date().toLocaleDateString('en-IN', options);
};

/**
 * Capitalize first letter of string
 * @param {string} str 
 * @returns {string}
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
