import api from '../../utils/api';

export const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  family?: string;
}) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const login = async (credentials: { email: string; password: string }) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
export const forgotPassword = async (email: string) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

// NEW: Reset Password API
export const resetPassword = async (token: string, password: string) => {
  const response = await api.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};