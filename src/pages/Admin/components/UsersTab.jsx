import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiUser, FiMail, FiShield, FiSearch } from 'react-icons/fi';
import authApi from '../../../api/auth.api';
import styles from '../AdminDashboard.module.css';

const UsersTab = () => {
    const { users, loading, refreshData } = useOutletContext();
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        role: 'user'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update user (don't send password if empty)
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await authApi.updateUser(editingUser._id, updateData);
            } else {
                // Create new user
                await authApi.createUser(formData);
            }
            refreshData();
            closeModal();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };


    const handleDelete = async (userId) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await authApi.deleteUser(userId);
            refreshData();
        } catch (error) {
            alert('Error al eliminar usuario');
        }
    };

    const handleToggleStatus = async (userId) => {
        try {
            await authApi.toggleUserStatus(userId);
            refreshData();
        } catch (error) {
            alert('Error al cambiar estado');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ nombre: '', email: '', password: '', role: 'user' });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            nombre: user.nombre,
            email: user.email,
            password: '',
            role: user.role
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingUser(null);
        setFormData({ nombre: '', email: '', password: '', role: 'user' });
    };

    const filteredUsers = users.filter(user =>
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className={styles.loader}>Cargando usuarios...</div>;
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <div>
                    <h2>Gestión de Usuarios Mayoristas</h2>
                    <p className={styles.tabSubtitle}>Crea y administra cuentas para tus clientes mayoristas</p>
                </div>
                <button className="premium-btn" onClick={openCreateModal}>
                    <FiPlus /> Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className={styles.searchContainer} style={{ marginBottom: '2rem' }}>
                <FiSearch className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Stats */}
            <div className={styles.statsGrid} style={{ marginBottom: '2rem' }}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, var(--accent-color), #d4a855)' }}>
                        <FiUser />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.length}</span>
                        <span className={styles.statLabel}>Total Usuarios</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                        <FiCheck />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.filter(u => u.isActive).length}</span>
                        <span className={styles.statLabel}>Activos</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <FiX />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.filter(u => !u.isActive).length}</span>
                        <span className={styles.statLabel}>Inactivos</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                        <FiShield />
                    </div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{users.filter(u => u.role === 'admin').length}</span>
                        <span className={styles.statLabel}>Administradores</span>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Usuario</th>
                            <th>Email</th>
                            <th>Contraseña</th>
                            <th>Rol</th>
                            <th>Puntos</th>
                            <th>Estado</th>
                            <th>Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>

                                        <span style={{ fontWeight: '600' }}>{user.nombre}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {user.email}
                                    </span>
                                </td>
                                <td>
                                    <code style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '0.3rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        color: 'var(--accent-color)'
                                    }}>
                                        {user.plainPassword || '••••••'}
                                    </code>
                                </td>
                                <td>
                                    <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>
                                        {user.points || 0} pts
                                    </span>
                                </td>
                                <td>
                                    <button
                                        className={`${styles.statusBtn} ${user.isActive ? styles.statusActive : styles.statusInactive}`}
                                        onClick={() => handleToggleStatus(user._id)}
                                    >
                                        {user.isActive ? <><FiCheck /></> : <><FiX /></>}
                                    </button>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString('es-AR')}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionBtns}>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => openEditModal(user)}
                                            title="Editar"
                                        >
                                            <FiEdit2 />
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDelete(user._id)}
                                                title="Eliminar"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className={styles.emptyState}>
                        <FiUser style={{ fontSize: '3rem', opacity: 0.3 }} />
                        <p>No se encontraron usuarios</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario Mayorista'}</h3>
                            <button className={styles.closeBtn} onClick={closeModal}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.formGroup}>
                                <label>
                                    <FiUser style={{ marginRight: '0.5rem' }} />
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <FiMail style={{ marginRight: '0.5rem' }} />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    placeholder="ejemplo@email.com"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    🔐 Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    placeholder={editingUser ? '••••••' : 'Mínimo 6 caracteres'}
                                    minLength={editingUser ? 0 : 6}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>
                                    <FiShield style={{ marginRight: '0.5rem' }} />
                                    Rol
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="user">Usuario (Mayorista)</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className="outline-btn" onClick={closeModal}>
                                    Cancelar
                                </button>
                                <button type="submit" className="premium-btn">
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersTab;
