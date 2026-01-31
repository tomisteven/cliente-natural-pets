import api from './api';

const orderApi = {
    create: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },
    getMyOrders: async () => {
        const response = await api.get('/orders/my-orders');
        return response.data;
    },
    getAll: async () => {
        const response = await api.get('/orders');
        return response.data;
    },
    updateStatus: async (orderId, status) => {
        const response = await api.put(`/orders/${orderId}`, { status });
        return response.data;
    }
};

export default orderApi;
