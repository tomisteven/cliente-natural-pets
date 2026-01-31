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
                        <h3>Contacto</h3>
                        <ul>
                            <li>Buenos Aires, Argentina</li>
                            <li>ventas@mayoristamascotas.com</li>
                            <li>+54 9 11 1234 5678</li>
                        </ul>
                        <div className={styles.whatsapp}>
                            <FiMessageCircle /> <span>WhatsApp Ventas</span>
                        </div>
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
