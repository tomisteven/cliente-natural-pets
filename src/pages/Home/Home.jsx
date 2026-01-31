import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProducts, getExclusiveProducts } from '../../api/product.api';
import { getCombos } from '../../api/combo.api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard/ProductCard';
import HeroCarousel from '../../components/HeroCarousel/HeroCarousel';
import DiscountPopup from '../../components/DiscountPopup/DiscountPopup';
import styles from '../Products/Products.module.css';
import homeStyles from './Home.module.css';
import essenceBg from '../../assets/essence_dog.png';
import { FiSearch, FiGrid, FiList, FiChevronDown, FiAward, FiTruck, FiShield, FiPackage, FiArrowRight, FiLock } from 'react-icons/fi';

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [exclusiveProducts, setExclusiveProducts] = useState([]);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [categories] = useState([
        'COOP.PERRO', 'PETTING', 'DOGCHOW', 'DOGUI', 'GANACAN', 'KONGO', 'VORAZ', 'OLD PRINCE', 'ROYAL', 'EUKANUBA', 'PEDIGREE', 'RAZA'
    ]);

    const fetchInitialProducts = useCallback(async () => {
        setLoading(true);
        setPage(1);
        try {
            const data = await getProducts({ search, categoria, limit: 20, page: 1 });
            setProducts(data.products || []);
            setHasMore(data.products?.length === 20);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    }, [search, categoria]);

    // Fetch combos for the banner
    useEffect(() => {
        const fetchCombos = async () => {
            try {
                const data = await getCombos();
                setCombos(data || []);
            } catch (error) {
                console.error('Error fetching combos:', error);
            }
        };
        fetchCombos();
    }, []);

    // Fetch exclusive products only for authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            const fetchExclusive = async () => {
                try {
                    const data = await getExclusiveProducts();
                    setExclusiveProducts(data.products || []);
                } catch (error) {
                    console.error('Error fetching exclusive products:', error);
                }
            };
            fetchExclusive();
        }
    }, [isAuthenticated]);


    const loadMoreProducts = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const data = await getProducts({ search, categoria, limit: 20, page: nextPage });
            const newProducts = data.products || [];
            if (newProducts.length === 0) {
                setHasMore(false);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
                setPage(nextPage);
                setHasMore(newProducts.length === 20);
            }
        } catch (error) {
            console.error('Error loading more products:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchInitialProducts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [fetchInitialProducts]);

    // Get combo preview images
    const getComboPreviewImages = () => {
        const images = [];
        combos.slice(0, 2).forEach(combo => {
            if (combo.products) {
                combo.products.slice(0, 2).forEach(item => {
                    if (item.product?.imagenes?.[0] && images.length < 3) {
                        images.push(item.product.imagenes[0]);
                    }
                });
            }
        });
        return images;
    };

    // Get max discount from combos
    const getMaxDiscount = () => {
        if (combos.length === 0) return 0;
        return Math.max(...combos.map(c => c.discountPercentage || 0));
    };

    const comboImages = getComboPreviewImages();
    const maxDiscount = getMaxDiscount();

    return (
        <div className={homeStyles.home}>
            <HeroCarousel />
            <DiscountPopup />

            <section className={styles.controlsSection}>
                <div className={styles.controlsContainer}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchBar}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="¿Qué marca estás buscando hoy?"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </div>

                    <div className={styles.viewToggle}>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <FiGrid />
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            <FiList />
                        </button>
                    </div>
                </div>
            </section>

            <div className="container">
                <div className={styles.categoriesSection}>
                    <div className={styles.horizontalCategories}>
                        <button
                            className={`${styles.catBtn} ${categoria === '' ? styles.catActive : ''}`}
                            onClick={() => setCategoria('')}
                        >
                            Todo el Catálogo
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`${styles.catBtn} ${categoria === cat ? styles.catActive : ''}`}
                                onClick={() => setCategoria(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <main className={styles.mainContent}>
                    <div className={homeStyles.catalogSection}>
                        <h2 className={homeStyles.sectionTitle}>Catálogo Mayorista</h2>
                        {loading ? (
                            <div className={styles.loader}>Actualizando stock...</div>
                        ) : (
                            <>
                                <div className={viewMode === 'grid' ? styles.grid : styles.list}>
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} viewMode={viewMode} />
                                    ))}
                                </div>

                                {hasMore && (
                                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                                        <button
                                            className="outline-btn"
                                            onClick={loadMoreProducts}
                                            disabled={loadingMore}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                                        >
                                            {loadingMore ? 'Cargando...' : <>Ver más productos <FiChevronDown /></>}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
            </div>

            {/* Exclusive Products Section - Only for authenticated users */}
            {isAuthenticated && exclusiveProducts.length > 0 && (
                <motion.section
                    className={homeStyles.exclusiveSection}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={homeStyles.exclusiveHeader}>
                        <div className={homeStyles.exclusiveBadge}>
                            <FiLock /> ZONA V.I.P
                        </div>
                        <h2 className={homeStyles.exclusiveTitle}>Ofertas de Liquidación</h2>
                        <p className={homeStyles.exclusiveSubtitle}>
                            Precios de costo por bulto cerrado y pallets. Solo para clientes registrados.
                        </p>
                    </div>
                    <div className={styles.grid} style={{ marginTop: '2rem' }}>
                        {exclusiveProducts.slice(0, 4).map(product => (
                            <ProductCard key={product._id} product={product} viewMode="grid" />
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Combo Promo Banner */}
            {combos.length > 0 && (
                <Link to="/combos" style={{ textDecoration: 'none' }}>
                    <motion.div
                        className={homeStyles.comboBanner}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className={homeStyles.comboBannerContent}>
                            <span className={homeStyles.comboBannerTag}>
                                <FiPackage /> PROMOCIONES DEL MES
                            </span>
                            <h3 className={homeStyles.comboBannerTitle}>
                                Combos <span>Solidarios</span>
                            </h3 >
                            <p className={homeStyles.comboBannerText}>
                                Ahorra hasta un 20% llevando nuestros combos prediseñados.
                                Ideal para stockear tu local con las marcas más vendidas.
                            </p >
                            <span className={homeStyles.comboBannerBtn}>
                                Ver Ofertas <FiArrowRight />
                            </span>
                        </div >

                        <div className={homeStyles.comboBannerVisual}>
                            <div className={homeStyles.comboBannerImages}>
                                {comboImages.map((img, idx) => (
                                    <div key={idx} className={homeStyles.comboBannerImage}>
                                        <img src={img} alt={`Producto ${idx + 1}`} />
                                    </div>
                                ))}
                            </div>
                            {maxDiscount > 0 && (
                                <div className={homeStyles.comboBannerDiscount}>
                                    <span className={homeStyles.comboBannerDiscountValue}>-{maxDiscount}%</span>
                                    <span className={homeStyles.comboBannerDiscountLabel}>Ahorro</span>
                                </div>
                            )}
                        </div>
                    </motion.div >
                </Link >
            )}

            {/* Nuestra Esencia Section */}
            <section className={homeStyles.essenceSection}>
                <div className={homeStyles.essenceContent}>
                    <span className={homeStyles.essenceTag}>NUESTRO COMPROMISO</span>
                    <h2 className={homeStyles.essenceTitle}>Bienestar para cada Mascota</h2>
                    <p className={homeStyles.essenceText}>
                        Somos especialistas en nutrición animal con más de 15 años abasteciendo a la región.
                        Nuestro objetivo es brindar productos de la más alta calidad con una logística eficiente y precios que potencien tu negocio.
                    </p>

                    <div className={homeStyles.features}>
                        <div className={homeStyles.featureItem}>
                            <div className={homeStyles.featureIcon}><FiAward /></div>
                            <h3>Calidad Certificada</h3>
                            <p>Solo trabajamos con laboratorios y marcas líderes en nutrición.</p>
                        </div>
                        <div className={homeStyles.featureItem}>
                            <div className={homeStyles.featureIcon}><FiTruck /></div>
                            <h3>Envío Mayorista</h3>
                            <p>Reparto propio sin cargo para pedidos grandes en toda la zona.</p>
                        </div>
                        <div className={homeStyles.featureItem}>
                            <div className={homeStyles.featureIcon}><FiShield /></div>
                            <h3>Asesoramiento</h3>
                            <p>Te ayudamos a elegir el mejor mix de productos para tu punto de venta.</p>
                        </div>
                    </div>
                </div>
                <div
                    className={homeStyles.essenceImage}
                    style={{ backgroundImage: `url(${essenceBg})` }}
                />
            </section>
        </div>
    );
};

export default Home;

