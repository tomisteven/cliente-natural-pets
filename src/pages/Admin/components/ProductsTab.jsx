import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const ProductsTab = () => {
    const {
        products,
        loading,
        onDeleteProduct,
        adminProductPage,
        adminTotalPages,
        adminTotalResults,
        setAdminProductPage
    } = useOutletContext();

    if (loading) {
        return <div className={styles.loader}>Cargando productos...</div>;
    }

    return (
        <>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Precio</th>
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
                                    <span>{product.nombre}</span>
                                </div>
                            </td>
                            <td>{product.categoria}</td>
                            <td>{formatCurrency(product.precio)}</td>
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
                                    <button onClick={() => onDeleteProduct(product._id)} className={styles.deleteBtn}>
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Controles de paginación */}
            {adminTotalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => setAdminProductPage(p => Math.max(1, p - 1))}
                        disabled={adminProductPage === 1}
                    >
                        ← Anterior
                    </button>

                    <div className={styles.pageNumbers}>
                        {Array.from({ length: adminTotalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === adminTotalPages || Math.abs(p - adminProductPage) <= 2)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, idx) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${idx}`} className={styles.ellipsis}>…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`${styles.pageBtn} ${adminProductPage === p ? styles.activePage : ''}`}
                                        onClick={() => setAdminProductPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }
                    </div>

                    <button
                        className={styles.pageBtn}
                        onClick={() => setAdminProductPage(p => Math.min(adminTotalPages, p + 1))}
                        disabled={adminProductPage === adminTotalPages}
                    >
                        Siguiente →
                    </button>
                </div>
            )}

            {adminTotalResults > 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', padding: '0.5rem 0 1rem' }}>
                    Mostrando <strong>{products.length}</strong> de <strong>{adminTotalResults}</strong> productos
                    — Página <strong>{adminProductPage}</strong> de <strong>{adminTotalPages}</strong>
                </p>
            )}
        </>
    );
};

export default ProductsTab;
