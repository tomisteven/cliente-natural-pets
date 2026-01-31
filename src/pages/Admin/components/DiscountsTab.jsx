import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiTrash2, FiUsers, FiUser, FiX } from 'react-icons/fi';
import { createDiscount, deleteDiscount } from '../../../api/discount.api';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const DiscountsTab = () => {
    const { discounts, loading, onDeleteDiscount, refreshData } = useOutletContext();
    const [showModal, setShowModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage',
        value: '',
        minPurchase: 0,
        usageLimit: '',
        targetAudience: 'all'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createDiscount({
                ...formData,
                value: Number(formData.value),
                minPurchase: Number(formData.minPurchase) || 0,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null
            });
            refreshData();
            setShowModal(false);
            setFormData({ code: '', type: 'percentage', value: '', minPurchase: 0, usageLimit: '', targetAudience: 'all' });
        } catch (error) {
            alert(error.response?.data?.message || 'Error al crear cupón');
        } finally {
            setIsSubmitting(false);
        }
    };


    const getAudienceBadge = (audience) => {
        switch (audience) {
            case 'mayorista':
                return <span className={styles.badgeAdmin}>🔒 Mayorista</span>;
            case 'minorista':
                return <span className={styles.badgeUser}>🛒 Minorista</span>;
            default:
                return <span className={styles.badge} style={{ background: 'rgba(100,100,100,0.2)', color: 'var(--text-secondary)' }}>Todos</span>;
        }
    };

    if (loading) {
        return <div className={styles.loader}>Cargando cupones...</div>;
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <div>
                    <h2>Descuentos y Cupones</h2>
                    <p className={styles.tabSubtitle}>Gestiona cupones para mayoristas y minoristas</p>
                </div>
                <button className="premium-btn" onClick={() => setShowModal(true)}>
                    <FiPlus /> Nuevo Cupón
                </button>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, var(--accent-color), #d4a855)' }}>
                        <FiPlus />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{discounts.length}</span>
                        <span className={styles.statLabel}>Total Cupones</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <FiUsers />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{discounts.filter(d => d.targetAudience === 'mayorista').length}</span>
                        <span className={styles.statLabel}>Mayoristas</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                        <FiUser />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{discounts.filter(d => d.targetAudience === 'minorista').length}</span>
                        <span className={styles.statLabel}>Minoristas</span>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Audiencia</th>
                            <th>Tipo</th>
                            <th>Valor</th>
                            <th>Min. Compra</th>
                            <th>Uso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.map(discount => (
                            <tr key={discount._id}>
                                <td><strong style={{ color: 'var(--accent-color)' }}>{discount.code}</strong></td>
                                <td>{getAudienceBadge(discount.targetAudience)}</td>
                                <td>{discount.type === 'percentage' ? 'Porcentaje' : discount.type === 'fixed' ? 'Monto Fijo' : 'Envío Gratis'}</td>
                                <td>{discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}</td>
                                <td>{formatCurrency(discount.minPurchase)}</td>
                                <td>{discount.usageCount} / {discount.usageLimit || '∞'}</td>
                                <td>
                                    <span className={discount.isActive ? styles.activeStatus : styles.inactiveStatus}>
                                        {discount.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => onDeleteDiscount(discount._id)} className={styles.deleteBtn}>
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {discounts.length === 0 && (
                    <div className={styles.emptyState}>
                        <FiPlus style={{ fontSize: '3rem', opacity: 0.3 }} />
                        <p>No hay cupones creados</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Crear Nuevo Cupón</h3>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Código del Cupón</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    required
                                    placeholder="Ej: MAYO20"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>🎯 Audiencia del Cupón</label>
                                <select
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                >
                                    <option value="all">Todos (Mayoristas y Minoristas)</option>
                                    <option value="mayorista">🔒 Solo Mayoristas (Registrados)</option>
                                    <option value="minorista">🛒 Solo Minoristas (No registrados)</option>
                                </select>
                                <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.3rem', display: 'block' }}>
                                    {formData.targetAudience === 'mayorista' && 'Solo usuarios registrados podrán usar este cupón'}
                                    {formData.targetAudience === 'minorista' && 'Solo clientes sin registro podrán usar este cupón'}
                                    {formData.targetAudience === 'all' && 'Cualquier cliente puede usar este cupón'}
                                </small>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Tipo de Descuento</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Monto Fijo ($)</option>
                                        <option value="shipping">Envío Gratis</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Valor</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        required
                                        placeholder={formData.type === 'percentage' ? 'Ej: 15' : 'Ej: 5000'}
                                        disabled={formData.type === 'shipping'}
                                    />
                                </div>
                            </div>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Compra Mínima (ARS)</label>
                                    <input
                                        type="number"
                                        value={formData.minPurchase}
                                        onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Límite de Usos</label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="Ilimitado"
                                    />
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button type="button" className="outline-btn" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="premium-btn">
                                    Crear Cupón
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiscountsTab;
