import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { FiTrendingUp, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import styles from './CurrencyBanner.module.css';

const CurrencyBanner = () => {
    const { exchangeRate, loading, error, refreshRate } = useCurrency();

    if (loading && !exchangeRate) return null;
    if (error && !exchangeRate) return null;

    return (
        <motion.div
            className={styles.banner}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className={`container ${styles.container}`}>
                <div className={styles.content}>
                    <FiTrendingUp className={styles.icon} />
                    <p className={styles.text}>
                        Cotización hoy: <strong>1 USD = ${exchangeRate?.toLocaleString('es-AR')} ARS</strong>

                    </p>
                </div>
                <button
                    onClick={refreshRate}
                    className={styles.refreshBtn}
                    title="Actualizar cotización"
                    disabled={loading}
                >
                    <FiRefreshCw className={loading ? styles.spinning : ''} />
                </button>
            </div>
        </motion.div>
    );
};

export default CurrencyBanner;
