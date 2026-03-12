import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiEdit, FiTrash2, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const ProductsTab = () => {
    const {
        products,
        categories,
        loading,
        onDeleteProduct,
        onBulkCategoryUpdate,
        adminProductPage,
        adminTotalPages,
        adminTotalResults,
        setAdminProductPage
    } = useOutletContext();

    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    if (loading) {
        return <div className={styles.loader}>Cargando productos...</div>;
    }

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedProductIds(products.map(p => p._id));
        } else {
            setSelectedProductIds([]);
        }
    };

    const handleSelectProduct = (id) => {
        setSelectedProductIds(prev => 
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
    };

    const handleApplyBulkCategory = async () => {
        if (!selectedCategory) {
            alert('Por favor selecciona una categoría');
            return;
        }
        setIsUpdating(true);
        await onBulkCategoryUpdate(selectedProductIds, selectedCategory);
        setSelectedProductIds([]);
        setSelectedCategory('');
        setIsUpdating(false);
    };

    return (
        <>
            {selectedProductIds.length > 0 && (
                <div style={{
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '15px', 
                    padding: '15px', 
                    backgroundColor: 'var(--surface-color)', 
                    borderBottom: '1px solid var(--border-color)',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                }}>
                    <span style={{ fontWeight: 600 }}>{selectedProductIds.length} seleccionados</span>
                    <select 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    >
                        <option value="">Seleccionar Categoría...</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleApplyBulkCategory}
                        disabled={isUpdating || !selectedCategory}
                        className="premium-btn"
                        style={{ padding: '8px 15px', opacity: (isUpdating || !selectedCategory) ? 0.5 : 1 }}
                    >
                        {isUpdating ? 'Aplicando...' : 'Aplicar Categoría'}
                    </button>
                    <button 
                        onClick={() => setSelectedProductIds([])}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Cancelar
                    </button>
                </div>
            )}
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                            <input 
                                type="checkbox" 
                                checked={products.length > 0 && selectedProductIds.length === products.length}
                                onChange={handleSelectAll}
                                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                            />
                        </th>
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
                        <tr key={product._id} style={{ backgroundColor: selectedProductIds.includes(product._id) ? 'var(--bg-color)' : 'transparent' }}>
                            <td style={{ textAlign: 'center' }}>
                                <input 
                                    type="checkbox" 
                                    checked={selectedProductIds.includes(product._id)}
                                    onChange={() => handleSelectProduct(product._id)}
                                    style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                                />
                            </td>
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
