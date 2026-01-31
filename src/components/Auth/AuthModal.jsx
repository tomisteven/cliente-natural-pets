import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login({ email: formData.email, password: formData.password });
            } else {
                result = await register(formData);
            }

            if (result.success) {
                onClose();
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Ocurrió un error inesperado');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className={styles.overlay} onClick={onClose}>
                <motion.div
                    className={styles.modal}
                    onClick={e => e.stopPropagation()}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX />
                    </button>

                    <div className={styles.content}>
                        <h2 className={styles.title}>
                            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                        </h2>
                        <p className={styles.subtitle}>
                            {isLogin ? 'Ingresa para gestionar tu perfil y puntos.' : 'Únete a Oud & Essence y comienza a sumar puntos.'}
                        </p>

                        {error && <div className={styles.error}>{error}</div>}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {!isLogin && (
                                <div className={styles.inputGroup}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre completo"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div className={styles.inputGroup}>
                                <FiMail className={styles.inputIcon} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Contraseña"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={loading}>
                                {loading ? (
                                    <div className={styles.spinner}></div>
                                ) : (
                                    <>
                                        {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta Gratis'}
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className={styles.footer}>
                            <span>
                                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                            </span>
                            <button className={styles.toggleBtn} onClick={() => setIsLogin(!isLogin)}>
                                {isLogin ? 'Regístrate aquí' : 'Inicia sesión aquí'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AuthModal;
