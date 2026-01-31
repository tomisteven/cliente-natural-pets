import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProduct, updateProduct, getProductBySlug } from '../../api/product.api';
import { getCategories, createCategory } from '../../api/category.api';
import { FiPlus, FiTrash2, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/currencyFormatter';
import styles from './ProductForm.module.css';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { calculateSuggestedPrice, convertToARS } = useCurrency();
    const isEditing = !!id;

    const [formData, setFormData] = useState({
        _id: '',
        nombre: '',
        sku: '',
        descripcion: '',
        precio: '',
        precioMenor: '',
        precioMayor: '',
        precioLista: '',
        precioCard: '',
        stock: 0,
        categoria: 'General',
        imagenes: [''],
        isExclusive: false,
        precioExclusivo: ''
    });

    const [categories, setCategories] = useState([]);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoadingCategories(true);
            try {
                const cats = await getCategories();
                setCategories(cats);

                if (isEditing) {
                    const data = await getProductBySlug(id);
                    setFormData({
                        ...data,
                        precio: data.precio.toString(),
                        precioMenor: data.precioMenor?.toString() || '',
                        precioMayor: data.precioMayor?.toString() || '',
                        precioLista: data.precioLista?.toString() || '',
                        precioCard: data.precioCard?.toString() || '',
                        imagenes: data.imagenes.length > 0 ? data.imagenes : [''],
                        isExclusive: data.isExclusive || false,
                        precioExclusivo: data.precioExclusivo?.toString() || ''
                    });
                } else if (cats.length > 0) {
                    setFormData(prev => ({ ...prev, categoria: cats[0].name }));
                }
            } catch (error) {
                console.error('Error fetching initial data:', error);
                toast.error('Error al cargar datos iniciales');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchInitialData();
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.imagenes];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, imagenes: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, imagenes: [...prev.imagenes, ''] }));
    };

    const removeImageField = (index) => {
        const newImages = formData.imagenes.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, imagenes: newImages.length > 0 ? newImages : [''] }));
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const newCat = await createCategory({ name: newCategoryName.trim() });
            setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
            setFormData(prev => ({ ...prev, categoria: newCat.name }));
            setNewCategoryName('');
            setIsAddingCategory(false);
            toast.success('Categoría creada');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al crear categoría');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { _id, ...restOfData } = formData;
            const payload = {
                ...restOfData,
                precio: Number(formData.precio) || 0,
                precioMenor: Number(formData.precioMenor) || 0,
                precioMayor: Number(formData.precioMayor) || 0,
                precioLista: Number(formData.precioLista) || 0,
                precioCard: formData.precioCard ? Number(formData.precioCard) : 0,
                stock: Number(formData.stock) || 0,
                imagenes: formData.imagenes.filter(img => img.trim() !== ''),
                isExclusive: formData.isExclusive,
                precioExclusivo: formData.precioExclusivo ? Number(formData.precioExclusivo) : null
            };

            if (isEditing) {
                // Usar el _id real para la actualización, no el slug
                await updateProduct(formData._id, payload);
                toast.success('Producto actualizado exitosamente');
            } else {
                await createProduct(payload);
                toast.success('Producto creado exitosamente');
            }
            navigate('/admin');
        } catch (error) {
            toast.error('Error al guardar producto: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className={styles.page}>
            <div className="container" style={{ maxWidth: '800px' }}>
                <button onClick={() => navigate('/admin')} className={styles.backBtn}>
                    <FiArrowLeft /> Volver al Dashboard
                </button>

                <h1 className={styles.title}>{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h1>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Información Básica</h2>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}>
                                <label>Nombre del Producto</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>SKU (Código)</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label>Descripción</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Categoría</label>
                                <div className={styles.categoryWrapper}>
                                    {!isAddingCategory ? (
                                        <div className={styles.categoryInputGroup}>
                                            <select
                                                name="categoria"
                                                value={formData.categoria}
                                                onChange={handleChange}
                                                disabled={loadingCategories}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat.name}>
                                                        {cat.name}
                                                    </option>
                                                ))}
                                                {categories.length === 0 && !loadingCategories && (
                                                    <option value="General">General</option>
                                                )}
                                            </select>
                                            <button
                                                type="button"
                                                className={styles.categoryActionBtn}
                                                onClick={() => setIsAddingCategory(true)}
                                                title="Nueva Categoría"
                                            >
                                                <FiPlus />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className={styles.categoryInputGroup}>
                                            <input
                                                type="text"
                                                placeholder="Nombre de categoría..."
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                className={`${styles.categoryActionBtn} ${styles.saveSmallBtn}`}
                                                onClick={handleCreateCategory}
                                            >
                                                <FiCheck />
                                            </button>
                                            <button
                                                type="button"
                                                className={styles.categoryActionBtn}
                                                onClick={() => setIsAddingCategory(false)}
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Stock Inicial</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Precios ($)</h2>
                        <p className={styles.infoText}>Ingresa los precios del producto para los diferentes niveles de venta.</p>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}>
                                <label>Precio Base ($)</label>
                                <input type="number" name="precio" value={formData.precio} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Precio X Menor ($)</label>
                                <input type="number" name="precioMenor" value={formData.precioMenor} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Precio X Mayor ($)</label>
                                <input type="number" name="precioMayor" value={formData.precioMayor} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Precio Lista ($)</label>
                                <input type="number" name="precioLista" value={formData.precioLista} onChange={handleChange} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Precio con Tarjeta ($)</label>
                                <input type="number" name="precioCard" value={formData.precioCard} onChange={handleChange} />
                            </div>
                        </div>
                    </div>

                    {/* Producto Exclusivo Mayorista */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>🔒 Exclusividad Mayorista</h2>
                        <p className={styles.infoText}>Los productos exclusivos solo serán visibles para usuarios registrados (mayoristas).</p>
                        <div className={styles.grid}>
                            <div className={styles.formGroup}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        name="isExclusive"
                                        checked={formData.isExclusive}
                                        onChange={(e) => setFormData(prev => ({ ...prev, isExclusive: e.target.checked }))}
                                        style={{ width: 'auto', accentColor: 'var(--accent-color)' }}
                                    />
                                    <span>Marcar como Producto Exclusivo</span>
                                </label>
                            </div>
                            {formData.isExclusive && (
                                <div className={styles.formGroup}>
                                    <label>Precio Exclusivo Mayorista ($)</label>
                                    <input
                                        type="number"
                                        name="precioExclusivo"
                                        value={formData.precioExclusivo}
                                        onChange={handleChange}
                                        placeholder="Precio especial para mayoristas"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Imágenes con soporte múltiple */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Imágenes (URLs)</h2>
                            <button type="button" onClick={addImageField} className={styles.addBtn}>
                                <FiPlus /> Imagen
                            </button>
                        </div>
                        {formData.imagenes.map((img, index) => (
                            <div key={index} className={styles.bulkRow}>
                                <div className={`${styles.formGroup} ${styles.fullWidth}`} style={{ gridColumn: 'span 2' }}>
                                    <input
                                        type="text" value={img}
                                        onChange={(e) => handleImageChange(index, e.target.value)}
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>
                                <button type="button" onClick={() => removeImageField(index)} className={styles.removeBtn}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="premium-btn" style={{ width: '100%', marginTop: '2rem' }}>
                        {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProductForm;
