import api from './api';

const authApi = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateProfile: async (userData) => {
        const response = await api.put('/auth/update-profile', userData);
        return response.data;
    },
    getUsers: async () => {
        const response = await api.get('/auth/users');
        return response.data;
    },
    createUser: async (userData) => {
        const response = await api.post('/auth/users', userData);
        return response.data;
    },
    updateUser: async (userId, userData) => {
        const response = await api.put(`/auth/users/${userId}`, userData);
        return response.data;
    },
    deleteUser: async (userId) => {
        const response = await api.delete(`/auth/users/${userId}`);
        return response.data;
    },
    toggleUserStatus: async (userId) => {
        const response = await api.patch(`/auth/users/${userId}/status`);
        return response.data;
    },
    updatePoints: async (userId, points) => {
        const response = await api.put(`/auth/users/${userId}/points`, { points });
        return response.data;
    }
};

export default authApi;

