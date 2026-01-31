import React, { useState, useEffect } from 'react';
import { getProducts } from '../../api/product.api';
import { getCategories } from '../../api/category.api';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Products.module.css';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [expandedProductId, setExpandedProductId] = useState(null); // Track which accordion is open
    const [categories, setCategories] = useState([]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts({ search, categoria });
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats.map(c => c.name));
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCats();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [search, categoria]);

    // Handler to toggle accordion - only one open at a time
    const handleToggleAccordion = (productId) => {
        setExpandedProductId(prev => prev === productId ? null : productId);
    };

    return (
        <div className={styles.page}>
            <div className="container">
                <header className={styles.header}>
                    <h1 className={styles.title}>Nuestros Productos</h1>
                    <p className={styles.subtitle}>Calidad y nutrición para tus mascotas.</p>
                </header>
            </div>

            <section className={styles.controlsSection}>
                <div className={styles.controlsContainer}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchBar}>
                            <FiSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Buscar alimento o marca..."
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
                            title="Vista Cuadrícula"
                        >
                            <FiGrid />
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                            onClick={() => setViewMode('list')}
                            title="Vista Lista"
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
                            Todos
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
                    {loading ? (
                        <div className={styles.loader}>Cargando productos...</div>
                    ) : (
                        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
                            {products.length > 0 ? (
                                products.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        viewMode={viewMode}
                                        isExpanded={expandedProductId === product._id}
                                        onToggleAccordion={() => handleToggleAccordion(product._id)}
                                    />
                                ))
                            ) : (
                                <div className={styles.noResults}>
                                    <p>No se encontraron productos con estos criterios.</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;
