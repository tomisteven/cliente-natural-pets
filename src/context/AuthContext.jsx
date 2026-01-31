import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadUser = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            if (response.success) {
                setUser(response.data);
            } else {
                localStorage.removeItem('token');
            }
        } catch (err) {
            console.error('Error loading user:', err);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = async (credentials) => {
        setError(null);
        try {
            const response = await authApi.login(credentials);
            if (response.success) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                return { success: true };
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al iniciar sesión';
            setError(msg);
            return { success: false, message: msg };
        }
    };

    const register = async (userData) => {
        setError(null);
        try {
            const response = await authApi.register(userData);
            if (response.success) {
                localStorage.setItem('token', response.token);
                setUser(response.user);
                return { success: true };
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrarse';
            setError(msg);
            return { success: false, message: msg };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
