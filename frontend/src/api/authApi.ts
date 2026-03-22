import api from './axiosInstance';

export const register = (data: any) => api.post('/register', data).then(r => r.data);
export const login = (data: any) => api.post('/login', data).then(r => r.data);
export const getMe = () => api.get('/me').then(r => r.data);
