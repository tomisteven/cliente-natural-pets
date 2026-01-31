import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading, isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div className="loader"></div>
                <p>Verificando acceso...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirigir a home y abrir el modal de login automáticamente
        return <Navigate to="/?openLogin=true" state={{ from: location }} replace />;
    }

    if (adminOnly && !isAdmin) {
        // Si es solo para admin y no lo es, volver a home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
