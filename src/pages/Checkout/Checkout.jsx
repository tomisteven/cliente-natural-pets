import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import { buildWhatsAppMessage } from '../../utils/whatsappMessageBuilder';
import orderApi from '../../api/order.api';
import styles from './Checkout.module.css';

const Checkout = () => {
    const { cart, cartTotal, getItemPrice, appliedDiscount, getDiscountedTotal } = useCart();
    const { user, isAuthenticated } = useAuth();
    const { convertToARS, exchangeRate } = useCurrency();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.nombre || '',
        phone: '',
        email: user?.email || '',
        city: '',
        paymentMethod: 'Efectivo',
        observations: ''
    });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'El nombre es obligatorio';
        if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio';
        if (!formData.city) newErrors.city = 'La ciudad/zona es obligatoria';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email no válido';
        }
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const discountedTotal = getDiscountedTotal();

        const getSurchargePercentage = (method) => {
            if (method.includes('Transferencia')) return 3.5;
            if (method.includes('Tarjeta')) return 10;
            return 0;
        };

        const surchargePercentage = getSurchargePercentage(formData.paymentMethod);
        const finalTotal = discountedTotal * (1 + surchargePercentage / 100);

        // Si el usuario está autenticado, guardamos el pedido en el servidor
        if (isAuthenticated) {
            try {
                await orderApi.create({
                    items: cart.map(item => ({
                        product: item._id,
                        nombre: item.nombre || item.name,
                        precio: getItemPrice(item),
                        quantity: item.quantity,
                        type: item.type
                    })),
                    subtotal: cartTotal,
                    discountCode: appliedDiscount?.code,
                    discountValue: cartTotal - discountedTotal,
                    total: discountedTotal,
                    shippingData: {
                        name: formData.name,
                        phone: formData.phone,
                        email: formData.email,
                        city: formData.city
                    },
                    paymentMethod: formData.paymentMethod,
                    observations: formData.observations,
                    surcharge: finalTotal - discountedTotal,
                    exchangeRate: exchangeRate,
                    subtotalARS: convertToARS(cartTotal),
                    totalARS: convertToARS(finalTotal)
                });
            } catch (error) {
                console.error('Error al guardar el pedido:', error);
                // Continuamos con el WhatsApp de todas formas para no bloquear la venta
            }
        }

        const whatsappUrl = buildWhatsAppMessage(formData, cart, formatCurrency(convertToARS(finalTotal)));
        window.open(whatsappUrl, '_blank');
    };

    if (cart.length === 0) {
        return (
            <div className={styles.page} style={{ textAlign: 'center' }}>
                <h2 className={styles.title}>Tu carrito está vacío</h2>
                <button onClick={() => navigate('/productos')} className="premium-btn">Ver productos</button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div className="container">
                <h1 className={styles.title}>Finalizar Compra</h1>

                <div className={styles.container}>
                    <form className={styles.checkoutForm} onSubmit={handleSubmit}>
                        <h2 className={styles.sectionTitle}>Tus Datos</h2>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Nombre y Apellido *</label>
                                <input
                                    type="text" name="name" value={formData.name} onChange={handleChange}
                                    className={styles.input} placeholder="Juan Perez"
                                />
                                {errors.name && <span className={styles.error}>{errors.name}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Teléfono *</label>
                                <input
                                    type="text" name="phone" value={formData.phone} onChange={handleChange}
                                    className={styles.input} placeholder="11 2345 6789"
                                />
                                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Email (Opcional)</label>
                                <input
                                    type="email" name="email" value={formData.email} onChange={handleChange}
                                    className={styles.input} placeholder="juan@ejemplo.com"
                                />
                                {errors.email && <span className={styles.error}>{errors.email}</span>}
                            </div>
                            <div className={styles.formGroup}>
                                <label className={styles.label}>Ciudad / Zona *</label>
                                <input
                                    type="text" name="city" value={formData.city} onChange={handleChange}
                                    className={styles.input} placeholder="Nordelta, Tigre"
                                />
                                {errors.city && <span className={styles.error}>{errors.city}</span>}
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Método de Pago</label>
                                <select
                                    name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia (+3.5%)">Transferencia (+3.5%)</option>

                                </select>
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label className={styles.label}>Observaciones</label>
                                <textarea
                                    name="observations" value={formData.observations} onChange={handleChange}
                                    className={styles.textarea} rows="4" placeholder="Alguna indicación especial..."
                                />
                            </div>
                        </div>
                    </form>

                    <aside className={styles.summary}>
                        <h2 className={styles.sectionTitle}>Resumen</h2>
                        <div className={styles.summaryItems}>
                            {cart.map(item => (
                                <div key={`${item._id}-${item.type}`} className={styles.summaryItem}>
                                    <span>{item.nombre || item.name} x{item.quantity}</span>
                                    <span>{formatCurrency(convertToARS(getItemPrice(item)) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryTotal}>
                            <div className={styles.summaryRow}>
                                <span>Subtotal</span>
                                <span>{formatCurrency(convertToARS(cartTotal))}</span>
                            </div>
                            {appliedDiscount && (
                                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                    <span>Descuento ({appliedDiscount.code})</span>
                                    <span>-{formatCurrency(convertToARS(cartTotal - getDiscountedTotal()))}</span>
                                </div>
                            )}
                            {formData.paymentMethod.includes('(+') && (
                                <div className={`${styles.summaryRow} ${styles.surchargeRow}`}>
                                    <span>Recargo por pago</span>
                                    <span>+{formatCurrency(convertToARS(getDiscountedTotal() * (formData.paymentMethod.includes('3.5') ? 0.035 : 0.1)))}</span>
                                </div>
                            )}

                            <div className={`${styles.summaryRow} ${styles.finalRow}`}>
                                <span>Total</span>
                                <span>{formatCurrency(convertToARS(getDiscountedTotal() * (1 + (formData.paymentMethod.includes('3.5') ? 0.035 : formData.paymentMethod.includes('10') ? 0.1 : 0))))}</span>
                            </div>
                        </div>

                        <button
                            className="premium-btn"
                            style={{ width: '100%', marginTop: '2rem' }}
                            onClick={handleSubmit}
                        >
                            Pedir por WhatsApp
                        </button>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
