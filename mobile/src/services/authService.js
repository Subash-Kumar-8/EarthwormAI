// Authentication Service Layer with backend integration specifications
import { USER_PROFILE } from '../constants/mockData';
import { fetchApi } from './api';

export const authService = {
  /**
   * TODO: BACKEND INTEGRATION POINT - Register Farmer
   * REST Endpoint: POST /api/v1/auth/register
   * Request Payload: { name, phone, email, password }
   * Response Contract: { success: boolean, token: string, user: object }
   */
  registerFarmer: async (farmerData) => {
    console.log('[Backend Contract Point] Register payload:', farmerData);
    
    // Simulate network latency when testing frontend
    await fetchApi('/auth/register', { method: 'POST', body: farmerData });
    
    return {
      success: true,
      token: 'jwt_mock_token_register_' + Date.now(),
      user: {
        ...USER_PROFILE,
        name: farmerData.name || 'Subash',
        phone: farmerData.phone || farmerData.mobileNo || '+91 98765 43210',
        email: farmerData.email || 'subash@earthworm.ai',
      },
    };
  },

  /**
   * TODO: BACKEND INTEGRATION POINT - Farmer Login
   * REST Endpoint: POST /api/v1/auth/login
   * Request Payload: { username, password }
   * Response Contract: { success: boolean, token: string, user: object }
   */
  loginWithPassword: async (username, password) => {
    console.log('[Backend Contract Point] Login username:', username);
    
    await fetchApi('/auth/login', { method: 'POST', body: { username, password } });
    
    return {
      success: true,
      token: 'jwt_mock_token_login_' + Date.now(),
      user: {
        ...USER_PROFILE,
        name: username || 'Subash',
      },
    };
  },

  /**
   * TODO: BACKEND INTEGRATION POINT - Phone OTP Login
   * REST Endpoint: POST /api/v1/auth/request-otp
   */
  requestOTP: async (phoneNumber) => {
    console.log('[Backend Contract Point] Requesting OTP for:', phoneNumber);
    await fetchApi('/auth/request-otp', { method: 'POST', body: { phone: phoneNumber } });
    return { success: true, message: 'OTP sent to ' + phoneNumber };
  },

  /**
   * TODO: BACKEND INTEGRATION POINT - Verify OTP
   * REST Endpoint: POST /api/v1/auth/verify-otp
   */
  verifyOTP: async (phoneNumber, otp) => {
    console.log('[Backend Contract Point] Verifying OTP:', otp);
    await fetchApi('/auth/verify-otp', { method: 'POST', body: { phone: phoneNumber, otp } });
    return {
      success: true,
      token: 'jwt_mock_token_otp_' + Date.now(),
      user: {
        ...USER_PROFILE,
        phone: phoneNumber,
      },
    };
  },
};
