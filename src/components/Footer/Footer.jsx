import React from 'react';
import { FiInstagram, FiFacebook, FiYoutube, FiMessageCircle } from 'react-icons/fi';
import styles from './Footer.module.css';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Footer = () => {
    const { user } = useAuth();
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.grid}>
                    <div className={styles.brand}>
                        <h2 className={styles.logo}>MAYORISTA MASCOTAS</h2>
                        <p className={styles.desc}>
                            Distribución mayorista de alimentos premium y accesorios para mascotas. Abasteciendo a todo el país con calidad y compromiso.
                        </p>
                        <div className={styles.social}>
                            <a href="#"><FiInstagram /></a>
                            <a href="#"><FiFacebook /></a>
                            <a href="#"><FiYoutube /></a>
                        </div>
                    </div>

                    <div className={styles.links}>
                        <h3>Navegación</h3>
                        <ul>
                            <li><Link to="/">Inicio</Link></li>
                            <li><Link to="/productos">Catálogo</Link></li>
                            <li><Link to="/combos">Combos Oferta</Link></li>
                            {user?.role === 'admin' && <li><Link to="/admin">Panel Admin</Link></li>}
                        </ul>
                    </div>

                    <div className={styles.contact}>
                        <h3>Sucursales</h3>
                        <ul>
                            <li>Av. Hipólito Yrigoyen 22061 Glew</li>
                            <li>Mendez 108 Glew</li>
                            <li>Av. Pte Perón 4803- A. Korn</li>
                            <li>Alsina 494 Burzaco</li>
                            <li>E. Burgwardt 1074 Longchamps</li>
                        </ul>

                    </div>
                    <div className={styles.contact}>

                        <h3>WhatsApp Ventas</h3>
                        <ul>
                            <li>+54 11 6098 4948</li>
                            <li>+54 11 6384 6849</li>
                            <li>+54 11 2656 4050</li>
                            <li>naturalpetsrl@gmail.com
                            </li>
                        </ul>

                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} MAYORISTA MASCOTAS. Todos los derechos reservados.</p>
                    <div className={styles.dev}>
                        Portal exclusivo para <span className={styles.industrial}>Puntos de Venta</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
