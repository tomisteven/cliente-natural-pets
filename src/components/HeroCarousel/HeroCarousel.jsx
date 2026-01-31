import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroCarousel.module.css';

import hero1 from '../../assets/hero_dog_food.png';
import hero2 from '../../assets/hero_dog_food_2.png';
import hero3 from '../../assets/hero_dog_food_3.png';

const images = [
    {
        url: hero1,
        title: 'Distribuidora Mayorista de Alimentos',
        subtitle: 'Nutrición premium para mascotas con los mejores precios del mercado'
    },
    {
        url: hero2,
        title: 'Stock Permanente y Logística Propia',
        subtitle: 'Abastecemos a pet shops, veterinarias y grandes criaderos'
    },
    {
        url: hero3,
        title: 'Las Mejores Marcas del Mercado',
        subtitle: 'Royal Canin, Eukanuba, Pro Plan y más en un solo lugar'
    }
];

const HeroCarousel = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.carousel}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    className={styles.slide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                >
                    <div
                        className={styles.image}
                        style={{ backgroundImage: `url(${images[index].url})` }}
                    />
                    <div className={styles.overlay} />
                    <div className={styles.content}>
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className={styles.tag}
                        >
                            DISTRIBUIDORA MAYORISTA
                        </motion.span>
                        <motion.h2
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className={styles.title}
                        >
                            {images[index].title}
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.9 }}
                            className={styles.subtitle}
                        >
                            {images[index].subtitle}
                        </motion.p>
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 1.1 }}
                            className={styles.ctaBtn}
                            onClick={() => window.dispatchEvent(new CustomEvent('openDiscountPopup'))}
                        >
                            Ver Catálogo Mayorista
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className={styles.indicators}>
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot} ${index === i ? styles.active : ''}`}
                        onClick={() => setIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
