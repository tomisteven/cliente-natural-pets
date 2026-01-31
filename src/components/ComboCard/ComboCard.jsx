import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiPackage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import styles from './ComboCard.module.css';
import categoryImages from '../../utils/categoryImages';

const ComboCard = ({ combo }) => {
    const { addToCart } = useCart();
    const { convertToARS } = useCurrency();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Get product images from populated products
    const getProductImages = () => {
        if (!combo.products || combo.products.length === 0) {
            return [];
        }

        return combo.products.map(item => {
            const product = item.product;
            if (!product) return null;

            // Use category-based image if available, otherwise look for product images
            const categoryUpper = product.categoria?.toUpperCase();
            const categoryImage = categoryImages[categoryUpper];

            const imageUrl = categoryImage || (Array.isArray(product.imagenes) && product.imagenes.length > 0
                ? product.imagenes[0]
                : (typeof product.imagenes === 'string' && product.imagenes.length > 0 ? product.imagenes : categoryImages['DEFAULT']));

            return {
                image: imageUrl,
                name: product.nombre || 'Producto',
                quantity: item.quantity || 1
            };
        }).filter(p => p !== null && p.image);
    };

    const productImages = getProductImages();
    const totalSlides = productImages.length;

    // Auto-play carousel
    useEffect(() => {
        if (!isAutoPlaying || totalSlides <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % totalSlides);
        }, 3000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, totalSlides]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const goToPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    const goToNext = (e) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev + 1) % totalSlides);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 5000);
    };

    // Get products list text
    const getProductsListText = () => {
        return productImages.map(p => `${p.quantity}x ${p.name}`).join(' • ');
    };

    // Calculate savings
    const savings = combo.basePrice - combo.finalPrice;
    const savingsPercentage = combo.discountPercentage || Math.round((savings / combo.basePrice) * 100);

    return (
        <motion.div
            className={styles.comboCard}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
        >
            {/* Image Carousel */}
            <div className={styles.carouselContainer}>
                <AnimatePresence mode="wait">
                    {productImages.length > 0 ? (
                        <motion.div
                            key={currentIndex}
                            className={styles.carouselSlide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <img
                                src={productImages[currentIndex].image}
                                alt={productImages[currentIndex].name}
                                className={styles.carouselImage}
                                loading="lazy"
                            />
                            {productImages[currentIndex].quantity > 1 && (
                                <span className={styles.productQty}>
                                    x{productImages[currentIndex].quantity}
                                </span>
                            )}
                        </motion.div>
                    ) : (
                        <div className={styles.carouselSlide}>
                            <FiPackage style={{ fontSize: '3rem', color: 'var(--text-secondary)' }} />
                        </div>
                    )}
                </AnimatePresence>

                {/* Navigation Arrows */}
                {totalSlides > 1 && (
                    <>
                        <button className={`${styles.carouselArrow} ${styles.arrowLeft}`} onClick={goToPrev}>
                            <FiChevronLeft />
                        </button>
                        <button className={`${styles.carouselArrow} ${styles.arrowRight}`} onClick={goToNext}>
                            <FiChevronRight />
                        </button>
                    </>
                )}

                {/* Dots */}
                {totalSlides > 1 && (
                    <div className={styles.carouselDots}>
                        {productImages.map((_, index) => (
                            <button
                                key={index}
                                className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>
                )}

                {/* Product Counter */}
                {totalSlides > 1 && (
                    <div className={styles.slideCounter}>
                        {currentIndex + 1}/{totalSlides}
                    </div>
                )}

                {/* Badges */}
                <div className={styles.comboBadge}>
                    <FiPackage /> COMBO
                </div>
                {savingsPercentage > 0 && (
                    <div className={styles.discountBadge}>
                        -{savingsPercentage}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={styles.content}>
                <h3 className={styles.comboName}>{combo.name}</h3>

                <p className={styles.productsList}>
                    {getProductsListText()}
                </p>

                <div className={styles.priceSection}>
                    <span className={styles.finalPrice}>
                        {formatCurrency(convertToARS(combo.finalPrice))}
                    </span>
                    {combo.basePrice > combo.finalPrice && (
                        <span className={styles.originalPrice}>
                            {formatCurrency(convertToARS(combo.basePrice))}
                        </span>
                    )}
                </div>

                {savingsPercentage > 0 && (
                    <p className={styles.savingsText}>
                        ¡Ahorrás {formatCurrency(convertToARS(savings))} en este pack!
                    </p>
                )}

                <button
                    className={styles.addBtn}
                    onClick={() => addToCart(combo, 'combo')}
                >
                    <FiShoppingBag /> Agregar Combo
                </button>
            </div>
        </motion.div>
    );
};

export default ComboCard;
