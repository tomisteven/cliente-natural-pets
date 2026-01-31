import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { formatCurrency } from '../../../utils/currencyFormatter';
import styles from '../AdminDashboard.module.css';

const ProductsTab = () => {
    const { products, loading, onDeleteProduct } = useOutletContext();

    if (loading) {
        return <div className={styles.loader}>Cargando productos...</div>;
    }

    return (
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
    );
};

export default ProductsTab;
