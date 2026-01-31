import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMail, FiSend } from 'react-icons/fi';
import emailApi from '../../api/email.api';
import styles from './DiscountPopup.module.css';

const DiscountPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleOpen = () => setIsVisible(true);
        window.addEventListener('openDiscountPopup', handleOpen);

        const hasSeen = sessionStorage.getItem('hasSeenDiscountPopup');
        if (hasSeen) return;

        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 10000);

        return () => {
            window.removeEventListener('openDiscountPopup', handleOpen);
            clearTimeout(timer);
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenDiscountPopup', 'true');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await emailApi.subscribe({ email, source: 'popup' });
            if (response.success) {
                setStatus('success');
                setTimeout(handleClose, 3000);
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.response?.data?.message || 'Error al suscribirse');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className={styles.overlay}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className={styles.modal}
                    >
                        <button className={styles.closeBtn} onClick={handleClose}>
                            <FiX />
                        </button>

                        <div className={styles.imageSection} />

                        <div className={styles.content}>
                            <span className={styles.tag}>OFERTA EXCLUSIVA</span>
                            <h2 className={styles.title}>ENVÍO GRATIS EN TU PRIMER PEDIDO</h2>
                            <p className={styles.description}>
                                Únete a nuestro Círculo Mayorista y recibe las mejores ofertas en alimento para mascotas directamente en tu correo.
                            </p>

                            {status === 'error' && <div className={styles.errorMessage}>{message}</div>}

                            {status === 'success' ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={styles.success}
                                >
                                    ¡Gracias! Revisa tu bandeja de entrada.
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className={styles.form}>
                                    <div className={styles.inputWrapper}>
                                        <FiMail className={styles.mailIcon} />
                                        <input
                                            type="email"
                                            placeholder="Tu mejor email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={styles.input}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={status === 'loading'}
                                    >
                                        {status === 'loading' ? 'ENVIANDO...' : <>OBTENER CUPÓN <FiSend /></>}
                                    </button>
                                </form>
                            )}

                            <p className={styles.footerText}>
                                Solo ofertas relevantes para tu negocio.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DiscountPopup;
