import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProducts, deleteProduct } from '../../api/product.api';
import { getCombos, deleteCombo } from '../../api/combo.api';
import authApi from '../../api/auth.api';
import orderApi from '../../api/order.api';
import discountApi from '../../api/discount.api';
import emailApi from '../../api/email.api';
import { formatCurrency } from '../../utils/currencyFormatter';
import { FiEdit, FiTrash2, FiPlus, FiBox, FiPackage, FiUsers, FiShoppingBag, FiAward, FiTag, FiMail, FiX, FiRefreshCw, FiSettings, FiPrinter } from 'react-icons/fi';
import settingsApi from '../../api/settings.api';
import { useCurrency } from '../../context/CurrencyContext';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.css';
import OrderTicket from '../../components/admin/OrderTicket';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [users, setUsers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [subscribers, setSubscribers] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [printingOrder, setPrintingOrder] = useState(null);

    // UI States for User management
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [couponData, setCouponData] = useState({
        code: '',
        type: 'percentage',
        value: 10,
        minPurchase: 0
    });
    const [couponAssignmentMode, setCouponAssignmentMode] = useState('new'); // 'new' or 'existing'
    const { suggestedPricePercentage, setSuggestedPricePercentage, refreshSettings } = useCurrency();
    const [settingsLoading, setSettingsLoading] = useState(false);
    const [localPercentage, setLocalPercentage] = useState(suggestedPricePercentage);

    const { isAdmin: authIsAdmin, loading: authLoading } = useAuth();

    const fetchData = async () => {
        if (!authIsAdmin || authLoading) return;
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                getProducts({ limit: 100, isAdmin: true }),
                getCombos(),
                authApi.getUsers(),
                orderApi.getAll(),
                emailApi.getAll(),
                discountApi.getAll()
            ]);

            // Assign results only if they were fulfilled
            if (results[0].status === 'fulfilled') setProducts(results[0].value.products || []);
            if (results[1].status === 'fulfilled') setCombos(results[1].value || []);
            if (results[2].status === 'fulfilled') setUsers(results[2].value.data || []);
            if (results[3].status === 'fulfilled') setOrders(results[3].value.data || []);
            if (results[4].status === 'fulfilled') setSubscribers(results[4].value.data || []);
            if (results[5].status === 'fulfilled') setDiscounts(results[5].value.data || []);

            // Log errors for debugging
            results.forEach((res, i) => {
                if (res.status === 'rejected') {
                    console.warn(`Admin Fetch Error [${i}]:`, res.reason);
                }
            });

        } catch (error) {
            console.error('Critical internal error during fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        setLocalPercentage(suggestedPricePercentage);
    }, [authIsAdmin, authLoading, suggestedPricePercentage]);

    const handleDeleteProduct = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await deleteProduct(id);
                fetchData();
            } catch (error) {
                alert('Error al eliminar producto');
            }
        }
    };

    const handleDeleteCombo = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este combo?')) {
            try {
                await deleteCombo(id);
                fetchData();
            } catch (error) {
                alert('Error al eliminar combo');
            }
        }
    };

    const generateCouponCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCouponData(prev => ({ ...prev, code }));
    };

    const handleAssignCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await discountApi.create({
                ...couponData,
                assignedTo: selectedUser._id,
                usageLimit: 1 // Generalmente cupones asignados son de un solo uso
            });
            alert(`Cupón ${couponData.code} asignado correctamente a ${selectedUser.nombre}`);
            setIsCouponModalOpen(false);
            setCouponData({
                code: '',
                type: 'percentage',
                value: 10,
                minPurchase: 0
            });
        } catch (error) {
            alert('Error al asignar cupón: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(true);
            fetchData(); // Refresh to show any changes if needed (though discounts aren't in this view)
        }
    };

    const handleUpdateStatus = async (orderId, status) => {
        try {
            await orderApi.updateStatus(orderId, status);
            fetchData();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const toggleOrder = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const handleAssignExistingCoupon = async (discountId) => {
        setLoading(true);
        try {
            await discountApi.update(discountId, { assignedTo: selectedUser._id });
            alert('Cupón asignado correctamente');
            setIsCouponModalOpen(false);
            fetchData();
        } catch (error) {
            alert('Error al asignar cupón: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteDiscount = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este cupón?')) {
            try {
                await discountApi.delete(id);
                fetchData();
            } catch (error) {
                alert('Error al eliminar cupón');
            }
        }
    };

    const [isGenericCouponModalOpen, setIsGenericCouponModalOpen] = useState(false);
    const handleCreateGenericCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await discountApi.create({
                ...couponData,
                usageLimit: couponData.usageLimit || null
            });
            alert('Cupón genérico creado correctamente');
            setIsGenericCouponModalOpen(false);
            setCouponData({
                code: '',
                type: 'percentage',
                value: 10,
                minPurchase: 0
            });
            fetchData();
        } catch (error) {
            alert('Error al crear cupón: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

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

    const handlePrintTicket = (order) => {
        setPrintingOrder(order);
        setTimeout(() => {
            window.print();
            // Optional: clear printing order after print dialog closes (though event is hard to catch across browsers)
            // For now, we keep it or clear it on a timeout? 
            // Better to keep it to ensure it renders during print dialog.
        }, 100);
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <div className={styles.header}>
                    <h1 className={styles.title}>Panel de Administración</h1>
                    <div className={styles.actions}>
                        <Link to="/admin/crear-producto" className="premium-btn">
                            <FiPlus /> Producto
                        </Link>
                        <Link to="/admin/crear-combo" className="outline-btn">
                            <FiPlus /> Combo
                        </Link>
                    </div>
                </div>

                <div className={styles.tabs}>
                    <button
                        className={`${styles.tab} ${activeTab === 'products' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        <FiBox /> Productos ({products.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'combos' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('combos')}
                    >
                        <FiPackage /> Combos ({combos.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'users' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <FiUsers /> Usuarios ({users.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'orders' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FiShoppingBag /> Pedidos ({orders.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'emails' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('emails')}
                    >
                        <FiMail /> Emails ({subscribers.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'discounts' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('discounts')}
                    >
                        <FiTag /> Cupones ({discounts.length})
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        <FiSettings /> Configuración
                    </button>
                </div>

                {loading ? (
                    <div className={styles.loader}>Cargando inventario...</div>
                ) : (
                    <div className={styles.tableContainer}>
                        {activeTab === 'products' && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Producto (SKU)</th>
                                        <th>Categoría</th>
                                        <th>P. Menor</th>
                                        <th>P. Mayor</th>
                                        <th>P. Lista</th>
                                        <th>Stock</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(product => (
                                        <tr key={product._id}>
                                            <td>
                                                <div className={styles.productInfo}>
                                                    <img src={product.imagenes?.[0] || ''} alt="" />
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span>{product.nombre}</span>
                                                        <small style={{ color: '#64748b' }}>#{product.sku}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{product.categoria}</td>
                                            <td>{formatCurrency(product.precioMenor)}</td>
                                            <td>{formatCurrency(product.precioMayor)}</td>
                                            <td>{formatCurrency(product.precioLista)}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <span className={product.isActive ? styles.activeStatus : styles.inactiveStatus}>
                                                    {product.isActive ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.tableActions}>
                                                    <Link to={`/admin/editar-producto/${product.slug}`} className={styles.editBtn}>
                                                        <FiEdit />
                                                    </Link>
                                                    <button onClick={() => handleDeleteProduct(product._id)} className={styles.deleteBtn}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'combos' && (
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
                                                    <button onClick={() => handleDeleteCombo(combo._id)} className={styles.deleteBtn}>
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'users' && (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Email</th>
                                        <th>Puntos</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user._id}>
                                            <td>{user.nombre}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <div className={styles.pointsCell}>
                                                    <FiAward /> {user.points}
                                                </div>
                                            </td>
                                            <td>{user.role}</td>
                                            <td>
                                                <button
                                                    className={styles.assignBtn}
                                                    onClick={() => { setSelectedUser(user); setIsCouponModalOpen(true); }}
                                                >
                                                    <FiTag /> Asignar Cupón
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'orders' && (
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
                                                            handleUpdateStatus(order._id, e.target.value);
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
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePrintTicket(order);
                                                            }}
                                                            title="Imprimir Ticket"
                                                            style={{
                                                                background: '#e2e8f0',
                                                                color: '#475569',
                                                                border: 'none',
                                                                padding: '6px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                marginRight: '5px'
                                                            }}
                                                        >
                                                            <FiPrinter size={16} />
                                                        </button>
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
                        )}

                        {activeTab === 'emails' && (
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
                        )}

                        {activeTab === 'discounts' && (
                            <>
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0 }}>Descuentos y Cupones</h3>
                                    <button
                                        className="premium-btn"
                                        style={{ padding: '0.6rem 1.2rem', fontSize: '0.75rem' }}
                                        onClick={() => {
                                            setCouponData({ code: '', type: 'percentage', value: 10, minPurchase: 0 });
                                            setIsGenericCouponModalOpen(true);
                                        }}
                                    >
                                        <FiPlus /> Crear Cupón Genérico
                                    </button>
                                </div>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Código</th>
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
                                                <td><strong>{discount.code}</strong></td>
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
                                                    <button onClick={() => handleDeleteDiscount(discount._id)} className={styles.deleteBtn}>
                                                        <FiTrash2 />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {activeTab === 'settings' && (
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
                        )}
                    </div>
                )}
            </div>

            {/* Modal de Cupón con Animaciones */}
            <AnimatePresence>
                {isCouponModalOpen && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3>Asignar Cupón</h3>
                                <button className={styles.closeModal} onClick={() => setIsCouponModalOpen(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <div className={styles.userCard}>
                                <div className={styles.userAvatar}>
                                    {selectedUser?.nombre.charAt(0)}
                                </div>
                                <div className={styles.userData}>
                                    <strong>{selectedUser?.nombre}</strong>
                                    <span>{selectedUser?.email}</span>
                                </div>
                            </div>

                            <div className={styles.modalSelector}>
                                <button
                                    type="button"
                                    className={couponAssignmentMode === 'new' ? styles.activeSelector : ''}
                                    onClick={() => setCouponAssignmentMode('new')}
                                >
                                    Crear Nuevo
                                </button>
                                <button
                                    type="button"
                                    className={couponAssignmentMode === 'existing' ? styles.activeSelector : ''}
                                    onClick={() => setCouponAssignmentMode('existing')}
                                >
                                    Elegir Existente
                                </button>
                            </div>

                            {couponAssignmentMode === 'new' ? (
                                <form onSubmit={handleAssignCoupon}>
                                    <div className={styles.formGroup}>
                                        <label>Código del Cupón</label>
                                        <div className={styles.inputWithAction}>
                                            <input
                                                type="text"
                                                value={couponData.code}
                                                onChange={e => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                                                placeholder="EJ: BIENVENIDO10"
                                                required
                                            />
                                            <button
                                                type="button"
                                                className={styles.actionBtn}
                                                onClick={generateCouponCode}
                                                title="Generar código aleatorio"
                                            >
                                                <FiRefreshCw />
                                            </button>
                                        </div>
                                    </div>

                                    <div className={styles.row}>
                                        <div className={styles.formGroup}>
                                            <label>Tipo</label>
                                            <select
                                                value={couponData.type}
                                                onChange={e => setCouponData({ ...couponData, type: e.target.value })}
                                            >
                                                <option value="percentage">Porcentaje (%)</option>
                                                <option value="fixed">Monto Fijo ($)</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Valor ({couponData.type === 'percentage' ? '%' : '$'})</label>
                                            <input
                                                type="number"
                                                value={couponData.value}
                                                onChange={e => setCouponData({ ...couponData, value: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Compra Mínima ($)</label>
                                        <input
                                            type="number"
                                            value={couponData.minPurchase}
                                            onChange={e => setCouponData({ ...couponData, minPurchase: Number(e.target.value) })}
                                        />
                                    </div>

                                    <div className={styles.modalActions}>
                                        <button type="button" onClick={() => setIsCouponModalOpen(false)}>Cancelar</button>
                                        <button type="submit" className="premium-btn">Crear y Asignar</button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.existingCoupons}>
                                    <label>Seleccionar un cupón existente:</label>
                                    <div className={styles.couponGrid}>
                                        {discounts.filter(d => !d.assignedTo && d.isActive).map(discount => (
                                            <div
                                                key={discount._id}
                                                className={styles.couponItem}
                                                onClick={() => handleAssignExistingCoupon(discount._id)}
                                            >
                                                <div className={styles.couponInfo}>
                                                    <strong>{discount.code}</strong>
                                                    <span>{discount.type === 'percentage' ? `${discount.value}%` : discount.type === 'fixed' ? `$${discount.value}` : 'Envío Gratis'}</span>
                                                </div>
                                                <FiPlus />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Cupón Genérico */}
            <AnimatePresence>
                {isGenericCouponModalOpen && (
                    <div className={styles.modalOverlay}>
                        <motion.div
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        >
                            <div className={styles.modalHeader}>
                                <h3>Crear Cupón Genérico</h3>
                                <button className={styles.closeModal} onClick={() => setIsGenericCouponModalOpen(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleCreateGenericCoupon}>
                                <div className={styles.formGroup}>
                                    <label>Código del Cupón</label>
                                    <div className={styles.inputWithAction}>
                                        <input
                                            type="text"
                                            value={couponData.code}
                                            onChange={e => setCouponData({ ...couponData, code: e.target.value.toUpperCase() })}
                                            placeholder="EJ: VERANO2026"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className={styles.actionBtn}
                                            onClick={generateCouponCode}
                                        >
                                            <FiRefreshCw />
                                        </button>
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Tipo</label>
                                        <select
                                            value={couponData.type}
                                            onChange={e => setCouponData({ ...couponData, type: e.target.value })}
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
                                            value={couponData.value}
                                            onChange={e => setCouponData({ ...couponData, value: Number(e.target.value) })}
                                            disabled={couponData.type === 'shipping'}
                                            required={couponData.type !== 'shipping'}
                                        />
                                    </div>
                                </div>

                                <div className={styles.row}>
                                    <div className={styles.formGroup}>
                                        <label>Compra Mínima ($)</label>
                                        <input
                                            type="number"
                                            value={couponData.minPurchase}
                                            onChange={e => setCouponData({ ...couponData, minPurchase: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Límite de Uso</label>
                                        <input
                                            type="number"
                                            value={couponData.usageLimit || ''}
                                            onChange={e => setCouponData({ ...couponData, usageLimit: e.target.value ? Number(e.target.value) : null })}
                                            placeholder="Vacío = Ilimitado"
                                        />
                                    </div>
                                </div>

                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setIsGenericCouponModalOpen(false)}>Cancelar</button>
                                    <button type="submit" className="premium-btn">Crear Cupón</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Hidden Printable Ticket */}
            <div style={{ display: 'none' }}>
                <OrderTicket order={printingOrder} />
            </div>
        </div >
    );
};

export default AdminDashboard;
