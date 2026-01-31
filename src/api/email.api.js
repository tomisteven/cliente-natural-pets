import api from './api';

const emailApi = {
    subscribe: async (data) => {
        const response = await api.post('/emails/subscribe', data);
        return response.data;
    },
    unsubscribe: async (email) => {
        const response = await api.post('/emails/unsubscribe', { email });
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/emails');
        return response.data;
    }
};

export default emailApi;
