import { useCallback } from 'react';
import api from './api';

const setAuthTokens = (access, refresh) => {
  localStorage.setItem('token', access);
  localStorage.setItem('refreshToken', refresh);
};


// Login with phone and password
export const login = async ({ phone, password }) => {
  const response = await api.post('/phone-jwt-login/', { phone_number: phone, password });
  // Save tokens to localStorage
  return response.data;
};

// Login with phone and pin
export const pinLogin = async ({ pin }) => {
  const response = await api.post('/pin-login/', { pin: parseInt(pin) });
  return response.data;
};

// React hook for login
export function useLogin() {
  return useCallback(async (phone, password) => {
    const data = await login({ phone, password });
    setAuthTokens(data.access, data.refresh);
    return data;
  }, [setAuthTokens]);
}

// React hook for pin login
export function usePinLogin() {
  return useCallback(async (pin) => {
    const data = await pinLogin({ pin });
    setAuthTokens(data.access, data.refresh);
    return data;
  }, [setAuthTokens]);
}
