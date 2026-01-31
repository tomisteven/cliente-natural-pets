import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (item, type = 'product', options = {}) => {
        const { purchaseMode = 'bag', extraKilos = 0 } = options;
        let isUpdate = false;

        setCart(prevCart => {
            // Find item considering id, type AND purchaseMode
            const existingItemIndex = prevCart.findIndex(i =>
                i._id === item._id &&
                i.type === type &&
                i.purchaseMode === purchaseMode
            );

            if (existingItemIndex > -1) {
                isUpdate = true;
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += 1;
                return newCart;
            }

            return [...prevCart, { ...item, type, quantity: 1, purchaseMode, extraKilos }];
        });

        if (isUpdate) {
            toast.success(`${item.nombre} actualizado en el carrito`);
        } else {
            toast.success(`${item.nombre} agregado al carrito`);
        }
    };

    const removeFromCart = (id, type) => {
        let removedItemName = '';

        setCart(prevCart => {
            const item = prevCart.find(i => i._id === id && i.type === type);
            if (item) {
                removedItemName = item.nombre;
            }
            return prevCart.filter(item => !(item._id === id && item.type === type));
        });

        if (removedItemName) {
            toast.error(`${removedItemName} eliminado del carrito`);
        }
    };

    const updateQuantity = (id, type, quantity) => {
        if (quantity < 1) return removeFromCart(id, type);

        setCart(prevCart => prevCart.map(item =>
            (item._id === id && item.type === type) ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCart([]);
        setAppliedDiscount(null);
    };

    // Calcular el precio actual basado en la cantidad (lógica de niveles para productos)
    const getItemPrice = (item) => {
        if (item.type === 'combo') return item.finalPrice;

        if (item.purchaseMode === 'kilo') {
            // Price per kilo = List Price / bag weight
            const pricePerKilo = item.precioLista / (item.kilos || 1);
            return pricePerKilo * item.extraKilos; // extraKilos acts as the quantity of kilos here
        }

        // For bags
        let baseBagPrice = item.precio;
        if (item.quantity >= 10 && item.precioMayor > 0) {
            baseBagPrice = item.precioMayor;
        } else if (item.precioMenor > 0) {
            baseBagPrice = item.precioMenor;
        }

        // Add extra kilos price if applicable
        if (item.extraKilos > 0) {
            const pricePerKilo = item.precioLista / (item.kilos || 1);
            return baseBagPrice + (pricePerKilo * item.extraKilos);
        }

        return baseBagPrice;
    };

    const cartTotal = cart.reduce((total, item) => total + (getItemPrice(item) * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const getDiscountedTotal = () => {
        if (!appliedDiscount) return cartTotal;
        if (appliedDiscount.type === 'fixed') {
            return Math.max(0, cartTotal - appliedDiscount.value);
        } else if (appliedDiscount.type === 'percentage') {
            return cartTotal * (1 - appliedDiscount.value / 100);
        }
        return cartTotal;
    };

    const applyDiscount = (discountData) => setAppliedDiscount(discountData);
    const removeDiscount = () => setAppliedDiscount(null);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getItemPrice,
            cartTotal,
            cartCount,
            appliedDiscount,
            applyDiscount,
            removeDiscount,
            getDiscountedTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
