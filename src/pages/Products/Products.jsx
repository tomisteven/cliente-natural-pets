import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '../../api/product.api';
import { getCategories } from '../../api/category.api';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Products.module.css';
import { FiSearch, FiGrid, FiList, FiChevronDown } from 'react-icons/fi';

const LIMIT = 20;

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [search, setSearch] = useState('');
    const [categoria, setCategoria] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [expandedProductId, setExpandedProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);

    // Carga inicial / cuando cambian filtros (resetea la lista)
    const fetchProducts = useCallback(async (resetPage = false) => {
        const currentPage = resetPage ? 1 : page;
        if (resetPage) {
            setLoading(true);
            setProducts([]);
            setPage(1);
        } else {
            setLoadingMore(true);
        }

        try {
            const data = await getProducts({ search, categoria, page: currentPage, limit: LIMIT });
            if (resetPage) {
                setProducts(data.products || []);
            } else {
                setProducts(prev => [...prev, ...(data.products || [])]);
            }
            setTotalPages(data.totalPages || 1);
            setTotalResults(data.totalResults || 0);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [search, categoria, page]);

    // Cargar categorías una vez
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

    // Cuando cambian los filtros, resetear y cargar desde página 1
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(true);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [search, categoria]);

    // Cuando cambia la página (y no es reset), cargar más
    useEffect(() => {
        if (page === 1) return; // ya manejado por el efecto de arriba
        fetchProducts(false);
    }, [page]);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

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
                        <>
                            {totalResults > 0 && (
                                <p className={styles.resultsCount}>
                                    Mostrando <strong>{products.length}</strong> de <strong>{totalResults}</strong> productos
                                </p>
                            )}

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

                            {page < totalPages && (
                                <div className={styles.loadMoreContainer}>
                                    <button
                                        className={styles.loadMoreBtn}
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? (
                                            'Cargando...'
                                        ) : (
                                            <>
                                                <FiChevronDown />
                                                Cargar más productos
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Products;
