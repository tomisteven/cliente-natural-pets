import api from './api';

const settingsApi = {
    get: async () => {
        const response = await api.get('/settings');
        return response.data;
    },
    update: async (data) => {
        const response = await api.put('/settings', data);
        return response.data;
    }
};

export default settingsApi;
