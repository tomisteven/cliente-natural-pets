import React from 'react';
import { useOutletContext } from 'react-router-dom';
import styles from '../AdminDashboard.module.css';

const EmailsTab = () => {
    const { subscribers, loading } = useOutletContext();

    if (loading) {
        return <div className={styles.loader}>Cargando emails...</div>;
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Fecha Suscripción</th>
                    <th>Origen</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {subscribers.map(sub => (
                    <tr key={sub._id}>
                        <td>{sub.email}</td>
                        <td>{new Date(sub.createdAt).toLocaleDateString()}</td>
                        <td>{sub.source}</td>
                        <td>
                            <span className={sub.isActive ? styles.activeStatus : styles.inactiveStatus}>
                                {sub.isActive ? 'Suscrito' : 'Desuscrito'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default EmailsTab;
