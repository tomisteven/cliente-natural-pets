import api from './api';

export const validateDiscount = async (code, cartTotal, isAuthenticated = false) => {
    const response = await api.post('/discounts/validate', { code, cartTotal, isAuthenticated });
    return response.data;
};

export const getDiscounts = async () => {
    const response = await api.get('/discounts');
    return response.data;
};

export const createDiscount = async (data) => {
    const response = await api.post('/discounts', data);
    return response.data;
};

export const deleteDiscount = async (id) => {
    const response = await api.delete(`/discounts/${id}`);
    return response.data;
};

export const updateDiscount = async (id, data) => {
    const response = await api.put(`/discounts/${id}`, data);
    return response.data;
};

const discountApi = {
    validate: validateDiscount,
    getAll: getDiscounts,
    create: createDiscount,
    delete: deleteDiscount,
    update: updateDiscount
};

export default discountApi;
