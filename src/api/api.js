import axios from 'axios';

const IS_DEV = import.meta.env.DEV; // Vite inyecta esta variable (true en `npm run dev`, false en `npm run build`)

const api = axios.create({
    baseURL: IS_DEV 
        ? 'http://localhost:5000/api' 
        : 'https://servidor-natural-pet.vercel.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
