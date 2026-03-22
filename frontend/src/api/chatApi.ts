import api from './axiosInstance';

export const getRooms = () => api.get('/chat/rooms').then(r => r.data);
export const createRoom = (name: string) =>
  api.post('/chat/rooms', { name, room_id: 0 }).then(r => r.data); // NOTE: we pass room_id as dummy or server ignores it. 
export const getRoomMessages = (roomId: number, skip = 0, limit = 50) =>
  api.get(`/chat/rooms/${roomId}/messages`, { params: { skip, limit } }).then(r => r.data);
