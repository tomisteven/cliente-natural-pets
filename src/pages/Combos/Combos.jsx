import React, { useState, useEffect } from 'react';
import { getCombos } from '../../api/combo.api';
import ComboCard from '../../components/ComboCard/ComboCard';
import styles from '../Products/Products.module.css';

const Combos = () => {
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const data = await getCombos();
                setCombos(data || []);
            } catch (error) {
                console.error('Error fetching combos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCombos();
    }, []);

    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Combos de Lujo</h1>
                    <p className={styles.subtitle}>Selecciones curadas para los amantes del buen gusto.</p>
                </header>

                {loading ? (
                    <div className={styles.loader}>Preparando selecciones...</div>
                ) : (
                    <div className={styles.grid}>
                        {combos.length > 0 ? (
                            combos.map(combo => (
                                <ComboCard key={combo._id} combo={combo} />
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <p>No hay combos disponibles actualmente.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Combos;
