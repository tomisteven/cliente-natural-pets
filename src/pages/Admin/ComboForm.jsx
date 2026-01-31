import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCombo, updateCombo, getComboById } from '../../api/combo.api';
import { getProducts } from '../../api/product.api';
import { FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import SearchableDropdown from '../../components/SearchableDropdown/SearchableDropdown';
import styles from '../Admin/ProductForm.module.css'; // Reuso los estilos

const ComboForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        products: [],
        discountPercentage: 0,
        isActive: true
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch up to 5000 products to ensure everything is covered
                const prodData = await getProducts({ limit: 5000 });
                setProducts(prodData.products || []);

                if (isEditing) {
                    const comboData = await getComboById(id);
                    setFormData({
                        ...comboData,
                        products: comboData.products.map(p => ({
                            product: p.product._id || p.product,
                            quantity: p.quantity
                        }))
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchInitialData();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;
        setFormData(prev => ({ ...prev, products: newProducts }));
    };

    const addProductToCombo = () => {
        setFormData(prev => ({
            ...prev,
            products: [...prev.products, { product: '', quantity: 1 }]
        }));
    };

    const removeProductFromCombo = (index) => {
        const newProducts = formData.products.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, products: newProducts }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discountPercentage: Number(formData.discountPercentage),
                products: formData.products.map(p => ({
                    product: p.product,
                    quantity: Number(p.quantity)
                }))
            };

            if (isEditing) {
                await updateCombo(id, payload);
                toast.success('Combo actualizado exitosamente');
            } else {
                await createCombo(payload);
                toast.success('Combo creado exitosamente');
            }
            navigate('/admin');
        } catch (error) {
            toast.error('Error al guardar combo: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate('/admin')} className={styles.backBtn}>
                    <FiArrowLeft /> Volver al Dashboard
                </button>

                <h1 className={styles.title}>{isEditing ? 'Editar Combo' : 'Crear Nuevo Combo'}</h1>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Información del Combo</h2>
                        <p className={styles.infoText}>Los precios de los productos seleccionados se basan en su precio base ($). El descuento se aplica sobre el total.</p>
                        <div className={styles.grid}>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Nombre del Combo</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Descripción</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Descuento (%)</label>
                                <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} id="isActive" />
                                <label htmlFor="isActive" style={{ margin: 0 }}>Combo Activo</label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Productos Incluidos</h2>
                            <button type="button" onClick={addProductToCombo} className={styles.addBtn}>
                                <FiPlus /> Producto
                            </button>
                        </div>
                        {formData.products.map((p, index) => (
                            <div key={index} className={styles.bulkRow}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ gridColumn: 'span 1' }}>
                                    <label>Seleccionar Producto</label>
                                    <SearchableDropdown
                                        options={products.map(prod => ({
                                            value: prod._id,
                                            label: prod.nombre,
                                            sublabel: `Stock: ${prod.stock} | SKU: ${prod.sku}`
                                        }))}
                                        value={p.product}
                                        onChange={(val) => handleProductChange(index, 'product', val)}
                                        placeholder="Busca un producto..."
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Cantidad</label>
                                    <input
                                        type="number" value={p.quantity}
                                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                        required min="1"
                                    />
                                </div>
                                <button type="button" onClick={() => removeProductFromCombo(index)} className={styles.removeBtn}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '2rem' }}>
                        {isEditing ? 'Actualizar Combo' : 'Crear Combo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ComboForm;
