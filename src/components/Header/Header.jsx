import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiMenu, FiX, FiSun, FiMoon, FiUser, FiLogOut, FiAward } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import styles from './Header.module.css';
import Logo from '../Common/Logo';

const Header = ({ toggleCart }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { cartCount } = useCart();
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        // Abrir login si viene por redirect de ProtectedRoute
        const params = new URLSearchParams(location.search);
        if (params.get('openLogin') === 'true' && !isAuthenticated) {
            setIsAuthModalOpen(true);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.search, isAuthenticated]);

    const navLinks = [
        { name: 'Inicio', path: '/' },
        { name: 'Catálogo', path: '/productos' },
        { name: 'Combos Oferta', path: '/combos' },
        ...(user?.role === 'admin' ? [{ name: 'Panel Admin', path: '/admin' }] : []),
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <Link to="/" className={styles.logo}>
                <Logo className={styles.logoSvg} />
                <span className={styles.brandName}>Natural Pet S.R.L</span>
            </Link>

            <nav className={styles.nav}>
                {navLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={styles.navLink}
                        style={location.pathname === link.path ? { color: 'var(--accent-hover)', opacity: 1 } : {}}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className={styles.actions}>
                <button
                    className={styles.themeToggle}
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <FiSun /> : <FiMoon />}
                </button>

                <div className={styles.userSection}>
                    {isAuthenticated ? (
                        <div className={styles.userMenuContainer}>
                            <div
                                className={styles.userTrigger}
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            >
                                <FiUser />
                                <span className={styles.userName}>{user.nombre.split(' ')[0]}</span>
                            </div>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        className={styles.userDropdown}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className={styles.pointsBadge}>
                                            <FiAward />
                                            <span>{user.points} puntos</span>
                                        </div>
                                        <hr className={styles.divider} />
                                        <Link to="/perfil" className={styles.dropdownItem} onClick={() => setIsUserMenuOpen(false)}>
                                            <FiUser /> Mi Perfil
                                        </Link>
                                        <button className={styles.dropdownItem} onClick={() => { logout(); setIsUserMenuOpen(false); }}>
                                            <FiLogOut /> Cerrar Sesión
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <button
                            className={styles.loginBtn}
                            onClick={() => setIsAuthModalOpen(true)}
                        >
                            <FiUser />
                            <span>Login</span>
                        </button>
                    )}
                </div>

                <div className={styles.cartIcon} onClick={toggleCart}>
                    <FiShoppingBag />
                    {cartCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={styles.badge}
                        >
                            {cartCount}
                        </motion.span>
                    )}
                </div>
                <div className={styles.mobileMenuBtn} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </div>
            </div>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />

            {/* Mobile Menu logic would go here with AnimatePresence */}
        </header>
    );
};

export default Header;
