import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const OrdersTab = () => {
    const { orders, loading, onUpdateStatus } = useOutletContext();
    const [expandedOrder, setExpandedOrder] = useState(null);

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return <div className={styles.loader}>Cargando pedidos...</div>;
    }

    return (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID / Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {orders.map(order => (
                    <React.Fragment key={order._id}>
                        <tr
                            className={`${styles.orderRow} ${expandedOrder === order._id ? styles.expanded : ''}`}
                            onClick={() => toggleOrder(order._id)}
                        >
                            <td>
                                <div className={styles.idCell}>
                                    <span className={styles.idText}>#{order._id.slice(-6)}</span>
                                    <span className={styles.dateText}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                            </td>
                            <td>
                                <div className={styles.customerSummary}>
                                    <strong>{order.shippingData?.name}</strong>
                                    <span>{order.shippingData?.city}</span>
                                </div>
                            </td>
                            <td>
                                <div className={styles.totalCell}>
                                    {formatCurrency(order.total)}
                                    <span className={styles.paymentBadge}>{order.paymentMethod?.split(' (')[0]}</span>
                                </div>
                            </td>
                            <td>
                                <select
                                    className={styles.statusSelect}
                                    value={order.status}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        onUpdateStatus(order._id, e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    data-status={order.status}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="procesando">Procesando</option>
                                    <option value="enviado">Enviado</option>
                                    <option value="entregado">Entregado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </td>
                            <td>
                                <div className={styles.tableActions} onClick={(e) => e.stopPropagation()}>
                                    <a
                                        href={`https://wa.me/${order.shippingData?.phone.replace(/\D/g, '')}`}
                                        target="_blank"
                                        className={styles.waLink}
                                    >
                                        Contactar
                                    </a>
                                </div>
                            </td>
                        </tr>
                        <AnimatePresence>
                            {expandedOrder === order._id && (
                                <tr className={styles.detailRow}>
                                    <td colSpan="5">
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className={styles.detailsContent}
                                        >
                                            <div className={styles.detailsGrid}>
                                                <div className={styles.detailsSection}>
                                                    <h4>📦 Productos</h4>
                                                    <div className={styles.orderItems}>
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className={styles.orderItem}>
                                                                <span className={styles.itemQty}>{item.quantity}x</span>
                                                                <span className={styles.itemName}>{item.nombre}</span>
                                                                <span className={styles.itemPrice}>{formatCurrency(item.precio * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className={styles.detailsSection}>
                                                    <h4>📍 Envío y Cliente</h4>
                                                    <div className={styles.infoList}>
                                                        <p><strong>Nombre:</strong> {order.shippingData?.name}</p>
                                                        <p><strong>Teléfono:</strong> {order.shippingData?.phone}</p>
                                                        <p><strong>Email:</strong> {order.shippingData?.email || 'No proporcionado'}</p>
                                                        <p><strong>Zona/Ciudad:</strong> {order.shippingData?.city}</p>
                                                    </div>
                                                </div>

                                                <div className={styles.detailsSection}>
                                                    <h4>💳 Pago y Notas</h4>
                                                    <div className={styles.infoList}>
                                                        <p><strong>Método:</strong> {order.paymentMethod}</p>
                                                        {order.observations && (
                                                            <p className={styles.obsText}><strong>Notas:</strong> {order.observations}</p>
                                                        )}
                                                        <div className={styles.financials}>
                                                            <div className={styles.finRow}>
                                                                <span>Subtotal:</span>
                                                                <div className={styles.priceColumn}>
                                                                    <span>{formatCurrency(order.subtotal)} USD</span>
                                                                    {order.subtotalARS && <small>{formatCurrency(order.subtotalARS)} ARS</small>}
                                                                </div>
                                                            </div>
                                                            {order.discountValue > 0 && (
                                                                <div className={styles.finRow}>
                                                                    <span>Descuento ({order.discountCode}):</span>
                                                                    <span className={styles.discountText}>-{formatCurrency(order.discountValue)} USD</span>
                                                                </div>
                                                            )}
                                                            {order.surcharge > 0 && (
                                                                <div className={styles.finRow}>
                                                                    <span>Recargo:</span>
                                                                    <span className={styles.surchargeText}>+{formatCurrency(order.surcharge)} USD</span>
                                                                </div>
                                                            )}
                                                            <div className={`${styles.finRow} ${styles.totalFin}`}>
                                                                <span>Total:</span>
                                                                <div className={styles.priceColumn}>
                                                                    <span>{formatCurrency(order.total)} USD</span>
                                                                    {order.totalARS && <strong>{formatCurrency(order.totalARS)} ARS</strong>}
                                                                </div>
                                                            </div>
                                                            {order.exchangeRate && (
                                                                <div className={styles.exchangeNote}>
                                                                    Cotización: 1 USD = {formatCurrency(order.exchangeRate)} ARS (Dólar Blue + $10)
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </React.Fragment>
                ))}
            </tbody>
        </table>
    );
};

export default OrdersTab;
