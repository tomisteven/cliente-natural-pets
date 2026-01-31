import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const CombosTab = () => {
    const { combos, loading, onDeleteCombo } = useOutletContext();

    if (loading) {
        return <div className={styles.loader}>Cargando combos...</div>;
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Combo</th>
                    <th>Precio Base</th>
                    <th>Precio Final</th>
                    <th>Descuento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {combos.map(combo => (
                    <tr key={combo._id}>
                        <td>{combo.name}</td>
                        <td>{formatCurrency(combo.basePrice)}</td>
                        <td>{formatCurrency(combo.finalPrice)}</td>
                        <td>{combo.discountPercentage}%</td>
                        <td>
                            <span className={combo.isActive ? styles.activeStatus : styles.inactiveStatus}>
                                {combo.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        <td>
                            <div className={styles.tableActions}>
                                <Link to={`/admin/editar-combo/${combo._id}`} className={styles.editBtn}>
                                    <FiEdit />
                                </Link>
                                <button onClick={() => onDeleteCombo(combo._id)} className={styles.deleteBtn}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default CombosTab;
