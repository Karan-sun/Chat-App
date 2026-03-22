import api from './axiosInstance';

export const getDMHistory = (userId: number, skip = 0, limit = 50) =>
  api.get(`/private/messages/${userId}`, { params: { skip, limit } }).then(r => r.data);
export const getLastSeen = (userId: number) =>
  api.get(`/private/last-seen/${userId}`).then(r => r.data);
export const getContacts = () => api.get('/private/contacts').then(r => r.data);
export const searchUsers = (q: string) =>
  api.get('/users/search', { params: { q } }).then(r => r.data);
export const getOnlineUsers = () => api.get('/online-users').then(r => r.data);
