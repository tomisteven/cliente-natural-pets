import React, { useState, useEffect } from 'react';
import { useCurrency } from '../../../context/CurrencyContext';
import settingsApi from '../../../api/settings.api';
import styles from '../AdminDashboard.module.css';

const SettingsTab = () => {
    const { suggestedPricePercentage, refreshSettings } = useCurrency();
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [localPercentage, setLocalPercentage] = useState(suggestedPricePercentage);

    useEffect(() => {
        setLocalPercentage(suggestedPricePercentage);
    }, [suggestedPricePercentage]);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setSettingsLoading(true);
        try {
            await settingsApi.update({ suggestedPricePercentage: localPercentage });
            alert('Configuración actualizada correctamente');
            refreshSettings();
        } catch (error) {
            alert('Error al actualizar configuración');
        } finally {
            setSettingsLoading(false);
        }
    };

    return (
        <div className={styles.settingsPage}>
            <h3>Configuración del Sistema</h3>
            <div className={styles.settingsGrid}>
                <form onSubmit={handleUpdateSettings} className={styles.settingsCard}>
                    <div className={styles.cardHeader}>
                        <h4>🚀 Precios Sugeridos</h4>
                        <p>Define el porcentaje de ganancia sugerido que se aplicará sobre el precio mayorista de todos los productos.</p>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Porcentaje Sugerido (%)</label>
                        <div className={styles.inputWithAction}>
                            <input
                                type="number"
                                value={localPercentage}
                                onChange={(e) => setLocalPercentage(Number(e.target.value))}
                                min="0"
                                required
                            />
                            <span className={styles.percentSymbol}>%</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="premium-btn"
                        disabled={settingsLoading}
                    >
                        {settingsLoading ? 'Guardando...' : 'Actualizar Porcentaje'}
                    </button>
                </form>

                <div className={styles.settingsInfo}>
                    <h4>Información</h4>
                    <p>Este cambio afecta la visualización del "Precio Sugerido" en las tarjetas de productos para los clientes.</p>
                    <ul>
                        <li>Se calcula como: <code>Precio Base * (1 + Porcentaje / 100)</code></li>
                        <li>Actualmente: <strong>{suggestedPricePercentage}%</strong></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
