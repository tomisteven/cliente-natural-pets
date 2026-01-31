import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import discountApi from '../../api/discount.api';
import styles from './CartDrawer.module.css';
import categoryImages from '../../utils/categoryImages';

const CartDrawer = ({ isOpen, onClose }) => {
    const {
        cart, removeFromCart, updateQuantity, cartTotal,
        getItemPrice, appliedDiscount, applyDiscount,
        removeDiscount, getDiscountedTotal
    } = useCart();
    const { isAuthenticated } = useAuth();
    const { convertToARS } = useCurrency();
    const [couponCode, setCouponCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setStatus('loading');
        setErrorMessage('');

        try {
            // Pasar isAuthenticated para validar cupones mayorista/minorista
            const response = await discountApi.validate(couponCode, cartTotal, isAuthenticated);
            if (response.success) {
                applyDiscount(response.data);
                setStatus('success');
                setCouponCode('');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage(err.response?.data?.message || 'Cupón inválido');
        } finally {
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.overlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.drawer}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.header}>
                            <h2 className={styles.title}>Tu Carrito</h2>
                            <button onClick={onClose} className={styles.closeBtn}>
                                <FiX />
                            </button>
                        </div>

                        <div className={styles.itemsList}>
                            {cart.length === 0 ? (
                                <div className={styles.emptyCart}>
                                    <FiShoppingBag size={50} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                    <p>Tu carrito está vacío</p>
                                    <button onClick={onClose} className="outline-btn" style={{ marginTop: '2rem' }}>
                                        Ir a comprar
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => {
                                    const nombre = item.nombre || item.name;
                                    const imagenes = item.imagenes || item.images;
                                    const categoria = item.categoria || item.category;

                                    // Use category-based image if available, otherwise look for product images
                                    const categoryUpper = categoria?.toUpperCase();
                                    const categoryImage = categoryImages[categoryUpper];

                                    const imageUrl = categoryImage || (Array.isArray(imagenes) && imagenes.length > 0
                                        ? imagenes[0]
                                        : (typeof imagenes === 'string' && imagenes.length > 0 ? imagenes : categoryImages['DEFAULT']));

                                    return (
                                        <div key={`${item._id}-${item.type}`} className={styles.cartItem}>
                                            <img
                                                src={imageUrl}
                                                alt={nombre}
                                                className={styles.itemImage}
                                            />
                                            <div className={styles.itemInfo}>
                                                <h4 className={styles.itemName}>{nombre}</h4>
                                                <p className={styles.itemPrice}>
                                                    {formatCurrency(convertToARS(getItemPrice(item)))}
                                                </p>
                                                {item.purchaseMode && (
                                                    <p className={styles.itemDetail}>
                                                        {item.purchaseMode === 'bag'
                                                            ? `Bolsa${item.extraKilos > 0 ? ` + ${item.extraKilos}kg extra` : ''}`
                                                            : `${item.extraKilos}kg`
                                                        }
                                                    </p>
                                                )}
                                                <div className={styles.itemActions}>
                                                    <div className={styles.qtyBtn} onClick={() => updateQuantity(item._id, item.type, item.quantity - 1)}>
                                                        <FiMinus />
                                                    </div>
                                                    <span>{item.quantity}</span>
                                                    <div className={styles.qtyBtn} onClick={() => updateQuantity(item._id, item.type, item.quantity + 1)}>
                                                        <FiPlus />
                                                    </div>
                                                    <button
                                                        className={styles.removeBtn}
                                                        onClick={() => removeFromCart(item._id, item.type)}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className={styles.footer}>
                                <div className={styles.discountSection}>
                                    {!appliedDiscount ? (
                                        <div className={styles.couponInput}>
                                            <input
                                                type="text"
                                                placeholder="Código de cupón"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={status === 'loading'}
                                            >
                                                {status === 'loading' ? '...' : <FiTag />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.appliedCoupon}>
                                            <div className={styles.couponLabel}>
                                                <FiCheck className={styles.checkIcon} />
                                                <span>{appliedDiscount.code} aplicado</span>
                                            </div>
                                            <button onClick={removeDiscount} className={styles.removeDiscount}>
                                                Eliminar
                                            </button>
                                        </div>
                                    )}
                                    {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
                                </div>

                                <div className={styles.summary}>
                                    <div className={styles.totalRow}>
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(convertToARS(cartTotal))}</span>
                                    </div>

                                    {appliedDiscount && (
                                        <div className={`${styles.totalRow} ${styles.discountRow}`}>
                                            <span>Descuento</span>
                                            <span>-{formatCurrency(convertToARS(cartTotal - getDiscountedTotal()))}</span>
                                        </div>
                                    )}

                                    <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                                        <span>Total</span>
                                        <span>{formatCurrency(convertToARS(getDiscountedTotal()))}</span>
                                    </div>
                                </div>

                                <button className="premium-btn" style={{ width: '100%' }} onClick={handleCheckout}>
                                    Finalizar Pedido
                                </button>

                                {!isAuthenticated && (
                                    <p className={styles.loyaltyTip}>
                                        <FiAlertCircle /> <span>Regístrate para acumular puntos de fidelidad.</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
