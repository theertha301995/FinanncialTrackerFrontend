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
