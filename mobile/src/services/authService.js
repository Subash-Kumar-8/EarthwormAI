// Authentication Service Layer with backend integration specifications
import { USER_PROFILE } from '../constants/mockData';
import { fetchApi } from './api';

export const authService = {
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
  requestOTP: async (phoneNumber) => {
    console.log('[Backend Contract Point] Requesting OTP for:', phoneNumber);
    await fetchApi('/auth/request-otp', { method: 'POST', body: { phone: phoneNumber } });
    return { success: true, message: 'OTP sent to ' + phoneNumber };
  },
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
