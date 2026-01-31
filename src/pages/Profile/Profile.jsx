import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiInfo, FiAward, FiShoppingBag, FiSettings, FiLogOut, FiChevronDown, FiChevronUp, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/order.api';
import { formatCurrency } from '../../utils/currencyFormatter';
import styles from './Profile.module.css';

const Profile = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
            const response = await orderApi.getMyOrders();
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (!user) return null;

    return (
        <div className={styles.page}>
            <div className="container">
                <motion.div
                    className={styles.profileGrid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <aside className={styles.sidebar}>
                        <div className={styles.userCard}>
                            <div className={styles.avatar}>
                                {user.nombre.charAt(0)}
                            </div>
                            <h2 className={styles.userName}>{user.nombre}</h2>
                            <p className={styles.userEmail}>{user.email}</p>
                        </div>

                        <nav className={styles.nav}>
                            <button
                                className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <FiUser /> Mi Perfil
                            </button>
                            <button
                                className={`${styles.navItem} ${activeTab === 'orders' ? styles.active : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <FiShoppingBag /> Mis Compras
                            </button>
                            <button
                                className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`}
                                onClick={() => setActiveTab('settings')}
                            >
                                <FiSettings /> Configuración
                            </button>
                            <button className={styles.logoutBtn} onClick={logout}>
                                <FiLogOut /> Cerrar Sesión
                            </button>
                        </nav>
                    </aside>

                    <main className={styles.content}>
                        {activeTab === 'profile' && (
                            <>
                                <div className={styles.loyaltySection}>
                                    <div className={styles.pointsCard}>
                                        <div className={styles.pointsHeader}>
                                            <FiAward size={32} />
                                            <span>Puntos Oud</span>
                                        </div>
                                        <div className={styles.pointsValue}>
                                            {user.points}
                                        </div>
                                        <p className={styles.pointsInfo}>
                                            ¡Gracias por tu lealtad! Sigue sumando puntos con cada compra.
                                        </p>
                                    </div>

                                    <div className={styles.infoCard}>
                                        <h3 className={styles.cardTitle}>Beneficios de Nivel</h3>
                                        <div className={styles.benefitsList}>
                                            <div className={styles.benefitItem}>
                                                <div className={styles.benefitDot} />
                                                <span>Descuentos exclusivos para miembros</span>
                                            </div>
                                            <div className={styles.benefitItem}>
                                                <div className={styles.benefitDot} />
                                                <span>Acceso anticipado a nuevos lanzamientos</span>
                                            </div>
                                            <div className={styles.benefitItem}>
                                                <div className={styles.benefitDot} />
                                                <span>Regalos especiales por puntos acumulados</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.detailsSection}>
                                    <h3 className={styles.sectionTitle}>Información de la Cuenta</h3>
                                    <div className={styles.detailsGrid}>
                                        <div className={styles.detailItem}>
                                            <label>Nombre Completo</label>
                                            <p>{user.nombre}</p>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Email</label>
                                            <p>{user.email}</p>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Miembro desde</label>
                                            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'orders' && (
                            <div className={styles.ordersSection}>
                                <h3 className={styles.sectionTitle}>Historial de Pedidos</h3>
                                {loadingOrders ? (
                                    <p>Cargando pedidos...</p>
                                ) : orders.length === 0 ? (
                                    <div className={styles.emptyOrders}>
                                        <FiShoppingBag size={40} />
                                        <p>Aún no has realizado ningún pedido.</p>
                                    </div>
                                ) : (
                                    <div className={styles.ordersList}>
                                        {orders.map(order => (
                                            <div key={order._id} className={styles.orderCard}>
                                                <div
                                                    className={styles.orderHeader}
                                                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                                >
                                                    <div className={styles.orderMainInfo}>
                                                        <FiClock />
                                                        <div>
                                                            <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                                            <span className={styles.orderStatus} data-status={order.status}>{order.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className={styles.orderTotalInfo}>
                                                        <span className={styles.orderTotal}>{formatCurrency(order.total)}</span>
                                                        {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {expandedOrder === order._id && (
                                                        <motion.div
                                                            className={styles.orderDetails}
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                        >
                                                            <div className={styles.itemsGrid}>
                                                                {order.items.map((item, idx) => (
                                                                    <div key={idx} className={styles.orderItem}>
                                                                        <span>{item.nombre} x{item.quantity}</span>
                                                                        <span>{formatCurrency(item.precio * item.quantity)}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className={styles.orderFooterInfo}>
                                                                <p><strong>Método de pago:</strong> {order.paymentMethod}</p>
                                                                <p><strong>Ciudad:</strong> {order.shippingData.city}</p>
                                                                {order.discountCode && (
                                                                    <p className={styles.discountUsed}>Cupón: {order.discountCode} (-{formatCurrency(order.discountValue)})</p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;
