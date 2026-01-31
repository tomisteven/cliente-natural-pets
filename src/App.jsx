import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import CurrencyBanner from './components/CurrencyBanner/CurrencyBanner';
import { Toaster } from 'react-hot-toast';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import DiscountPopup from './components/DiscountPopup/DiscountPopup';

// Pages
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import Combos from './pages/Combos/Combos';
import Checkout from './pages/Checkout/Checkout';
import Profile from './pages/Profile/Profile';
import AdminLayout from './pages/Admin/AdminLayout';
import ProductForm from './pages/Admin/ProductForm';
import ComboForm from './pages/Admin/ComboForm';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Admin Tab Components
import ProductsTab from './pages/Admin/components/ProductsTab';
import CombosTab from './pages/Admin/components/CombosTab';
import UsersTab from './pages/Admin/components/UsersTab';
import OrdersTab from './pages/Admin/components/OrdersTab';
import EmailsTab from './pages/Admin/components/EmailsTab';
import DiscountsTab from './pages/Admin/components/DiscountsTab';
import SettingsTab from './pages/Admin/components/SettingsTab';

function App() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <AuthProvider>
            <CurrencyProvider>
                <ThemeProvider>
                    <CartProvider>
                        <Router>
                            <div className="app">

                                <Header toggleCart={() => setIsCartOpen(true)} />
                                <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

                                <main style={{ minHeight: '80vh' }}>
                                    <Routes>
                                        <Route path="/" element={<Home />} />
                                        <Route path="/productos" element={<Products />} />
                                        <Route path="/combos" element={<Combos />} />
                                        <Route path="/checkout" element={<Checkout />} />
                                        <Route path="/perfil" element={<Profile />} />

                                        {/* Admin Routes - Nested */}
                                        <Route path="/admin" element={
                                            <ProtectedRoute adminOnly>
                                                <AdminLayout />
                                            </ProtectedRoute>
                                        }>
                                            <Route index element={<Navigate to="/admin/productos" replace />} />
                                            <Route path="productos" element={<ProductsTab />} />
                                            <Route path="combos" element={<CombosTab />} />
                                            <Route path="usuarios" element={<UsersTab />} />
                                            <Route path="pedidos" element={<OrdersTab />} />
                                            <Route path="emails" element={<EmailsTab />} />
                                            <Route path="cupones" element={<DiscountsTab />} />
                                            <Route path="configuracion" element={<SettingsTab />} />
                                        </Route>

                                        {/* Admin Forms - Standalone */}
                                        <Route path="/admin/crear-producto" element={
                                            <ProtectedRoute adminOnly>
                                                <ProductForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/admin/editar-producto/:id" element={
                                            <ProtectedRoute adminOnly>
                                                <ProductForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/admin/crear-combo" element={
                                            <ProtectedRoute adminOnly>
                                                <ComboForm />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="/admin/editar-combo/:id" element={
                                            <ProtectedRoute adminOnly>
                                                <ComboForm />
                                            </ProtectedRoute>
                                        } />

                                        <Route path="*" element={
                                            <div style={{ padding: '200px 0', textAlign: 'center' }}>
                                                <h1>404</h1>
                                                <p>Página no encontrada</p>
                                            </div>
                                        } />
                                    </Routes>
                                </main>

                                <Footer />
                                <DiscountPopup />
                                <Toaster
                                    position="bottom-right"
                                    toastOptions={{
                                        style: {
                                            background: '#1e293b',
                                            color: '#fff',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            backdropFilter: 'blur(10px)',
                                            padding: '16px',
                                            fontSize: '14px',
                                            fontWeight: '600'
                                        },
                                        success: {
                                            iconTheme: {
                                                primary: 'var(--accent-color)',
                                                secondary: '#fff',
                                            },
                                        },
                                    }}
                                />
                            </div>
                        </Router>
                    </CartProvider>
                </ThemeProvider>
            </CurrencyProvider>
        </AuthProvider>
    );
}

export default App;
