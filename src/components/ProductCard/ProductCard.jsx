import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiChevronDown, FiPercent, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import styles from './ProductCard.module.css';
import categoryImages from '../../utils/categoryImages';

const ProductCard = ({ product, viewMode = 'grid', isExpanded, onToggleAccordion }) => {
    const { addToCart } = useCart();
    const { convertToARS, calculateSuggestedPrice } = useCurrency();

    // Use internal state as fallback when external control is not provided
    const [internalExpanded, setInternalExpanded] = useState(false);
    const [purchaseMode, setPurchaseMode] = useState('bag'); // 'bag' or 'kilo'
    const [extraKilos, setExtraKilos] = useState(0);
    const [isWeightExpanded, setIsWeightExpanded] = useState(false);

    // Determine if using controlled or uncontrolled mode
    const isControlled = isExpanded !== undefined && onToggleAccordion !== undefined;
    const showBulkPrices = isControlled ? isExpanded : internalExpanded;

    const handleToggle = () => {
        if (isControlled) {
            onToggleAccordion();
        } else {
            setInternalExpanded(prev => !prev);
        }
    };

    // Use category-based image if available, otherwise look for product images
    const categoryUpper = product.categoria?.toUpperCase();
    const categoryImage = categoryImages[categoryUpper];

    const imageUrl = categoryImage || (Array.isArray(product.imagenes) && product.imagenes.length > 0
        ? product.imagenes[0]
        : (typeof product.imagenes === 'string' && product.imagenes.length > 0 ? product.imagenes : categoryImages['DEFAULT']));

    const isList = viewMode === 'list';
    const hasTiers = product.precioMenor || product.precioMayor || product.precioLista;

    // Calculate price per kilo to determine if loose weight purchase is allowed
    const precioPorKilo = product.kilos > 0 ? Math.round(product.precioLista / product.kilos) : 0;
    const canSellLoose = precioPorKilo > 0;

    return (
        <motion.div
            className={`${styles.card} ${isList ? styles.listCard : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            <div className={styles.imageWrapper}>
                <img
                    src={imageUrl}
                    alt={product.nombre}
                    className={styles.image}
                    loading="lazy"
                />
                {product.stock <= 0 && <div className={styles.outOfStock}>Agotado</div>}
                <div className={styles.skuBadge}>#{product.sku}</div>

                {/* Cart Button Overlay */}
                <div className={styles.imageOverlay}>
                    <button
                        className={styles.cartBtn}
                        onClick={() => addToCart(product, 'product', { purchaseMode, extraKilos })}
                        disabled={product.stock <= 0}
                        title="Agregar al carrito"
                    >
                        <FiShoppingCart />
                        <span>Agregar</span>
                    </button>
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.info}>
                    <p className={styles.brand}>{product.categoria}</p>
                    <h3 className={styles.name}>{product.nombre}</h3>
                </div>

                <div className={styles.priceContainer}>
                    <div className={styles.prices}>
                        {(product.precioMenor > 0 && purchaseMode === 'bag') && (
                            <div className={styles.priceRow}>
                                <span className={styles.priceLabel}>X MENOR:</span>
                                <span className={styles.price}>{formatCurrency(product.precioMenor)}</span>
                            </div>
                        )}
                        {(product.precioMayor > 0 && purchaseMode === 'bag') && (
                            <div className={styles.priceRow}>
                                <span className={styles.priceLabel}>X MAYOR:</span>
                                <span className={styles.price} style={{ color: 'var(--accent-color)' }}>{formatCurrency(product.precioMayor)}</span>
                            </div>
                        )}
                        {product.precioLista > 0 && (
                            <div className={styles.priceRow}>
                                <span className={styles.priceLabel}>
                                    {purchaseMode === 'kilo' ? '$ X KILO:' : 'LISTA:'}
                                </span>
                                <span className={styles.price} style={purchaseMode === 'kilo' ? { fontSize: '1.2rem' } : { fontSize: '0.9rem', opacity: 0.8 }}>
                                    {purchaseMode === 'kilo'
                                        ? formatCurrency(Math.round(product.precioLista / (product.kilos || 1)))
                                        : formatCurrency(product.precioLista)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Weight Selection UI - Refactored for Compactness */}
                {product.esAlimento && product.kilos > 0 && (
                    <div className={`${styles.weightSelector} ${isWeightExpanded ? styles.isExpanded : ''}`}>
                        <div className={styles.weightHeader}>


                            {canSellLoose ? (
                                <button
                                    className={`${styles.toggleWeightsBtn} ${isWeightExpanded ? styles.activeToggle : ''}`}
                                    onClick={() => setIsWeightExpanded(!isWeightExpanded)}
                                    type="button"
                                >
                                    {isWeightExpanded ? <FiMinus /> : <FiPlus />}
                                    <span>{isWeightExpanded ? 'Cerrar' : 'Agregar Kilos'}</span>
                                </button>
                            ) : (
                                <div className={styles.onlyBagLabel}>Bolsa Cerrada</div>
                            )}
                        </div>

                        <AnimatePresence>
                            {isWeightExpanded && canSellLoose && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className={styles.expandedContent}
                                >
                                    <div className={styles.modeTabs}>
                                        <button
                                            className={`${styles.modeTab} ${purchaseMode === 'bag' ? styles.activeTab : ''}`}
                                            onClick={() => setPurchaseMode('bag')}
                                            type="button"
                                        >
                                            Cerrada
                                        </button>
                                        <button
                                            className={`${styles.modeTab} ${purchaseMode === 'kilo' ? styles.activeTab : ''}`}
                                            onClick={() => {
                                                setPurchaseMode('kilo');
                                                setExtraKilos(1);
                                            }}
                                            type="button"
                                        >
                                            x Kilo
                                        </button>
                                    </div>

                                    <div className={styles.expandedRow}>
                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>$ x / Kg:</span>
                                            <span className={styles.statValueAccent}>
                                                {formatCurrency(precioPorKilo)}
                                            </span>
                                        </div>

                                        <div className={styles.qtySelectorCompact}>
                                            <button
                                                className={styles.qtyBtnSmall}
                                                onClick={() => setExtraKilos(Math.max(purchaseMode === 'bag' ? 0 : 1, extraKilos - 1))}
                                                type="button"
                                                disabled={purchaseMode === 'bag' ? extraKilos <= 0 : extraKilos <= 1}
                                            >
                                                <FiMinus />
                                            </button>
                                            <div className={styles.qtyInputWrapperCompact}>
                                                <input
                                                    type="number"
                                                    min={purchaseMode === 'bag' ? "0" : "1"}
                                                    value={extraKilos}
                                                    onChange={(e) => setExtraKilos(Number(e.target.value))}
                                                    className={styles.qtyInputCompact}
                                                />
                                                <span className={styles.qtyUnitCompact}>KG</span>
                                            </div>
                                            <button
                                                className={styles.qtyBtnSmall}
                                                onClick={() => setExtraKilos(extraKilos + 1)}
                                                type="button"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* List mode cart button */}
                {isList && (
                    <button
                        className={styles.listCartBtn}
                        onClick={() => addToCart(product, 'product')}
                        disabled={product.stock <= 0}
                    >
                        <FiShoppingCart />
                        <span>Agregar</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default ProductCard;
