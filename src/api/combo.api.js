import api from './api';

export const getCombos = async () => {
    const response = await api.get('/combos');
    return response.data;
};

export const getComboById = async (id) => {
    const response = await api.get(`/combos/${id}`);
    return response.data;
};

export const createCombo = async (comboData) => {
    const response = await api.post('/combos', comboData);
    return response.data;
};

export const updateCombo = async (id, comboData) => {
    const response = await api.put(`/combos/${id}`, comboData);
    return response.data;
};

export const deleteCombo = async (id) => {
    const response = await api.delete(`/combos/${id}`);
    return response.data;
};
