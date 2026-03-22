import { useQuery } from '@tanstack/react-query';
import api from './client';

export const useChats = () => {
    return useQuery({
        queryKey: ['chats'],
        queryFn: async () => {
            // In a real app we'd have a specific endpoint for user's chats
            // For now we'll fetch all users to demo direct messages
            const response = await api.get('/online-users');
            // this is just returning IDs from the backend, we need the actual user details 
            return response.data;
        },
    });
};

export const usePrivateMessages = (otherUserId: number | null) => {
    return useQuery({
        queryKey: ['messages', otherUserId],
        queryFn: async () => {
            if (!otherUserId) return [];
            const response = await api.get(`/private/messages/${otherUserId}`);
            return response.data;
        },
        enabled: !!otherUserId, // Only fetch if we have a selected user
    });
};
