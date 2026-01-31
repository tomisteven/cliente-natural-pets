# Frontend Perfumería Importadora - Oud & Essence

Frontend premium desarrollado con React y Vite, diseñado para ofrecer una experiencia de usuario de lujo en la compra de fragancias árabes y de nicho.

## ✨ Características
- **Estética Dark/Luxury**: Diseño minimalista y elegante en tonos oscuros y dorados.
- **Carrito de Compras**: Gestión de persistencia local y lógica de precios mayoristas integrada.
- **Integración con WhatsApp**: Cierre de venta directo mediante mensajes personalizados estructurados.
- **Panel Administrativo**: Interfaz completa para la gestión de productos, stocks y combos.
- **Responsive Design**: Optimizado al 100% para dispositivos móviles y escritorio.

## 🛠 Tecnologías
- **React 18** + **Vite**
- **Framer Motion**: Animaciones fluidas.
- **React Router DOM**: Navegación SPA.
- **Axios**: Comunicación con el backend.
- **Context API**: Manejo de estado global (Carrito).
- **CSS Modules**: Estilos encapsulados.

## 🚀 Instalación y Uso

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Configurar la URL del API en el `vite.config.js` (ya configurado para `localhost:5000` por defecto).
3. Ejecutar en modo desarrollo:
   ```bash
   npm run dev
   ```

## 📂 Organización
- `api/`: Llamadas al backend.
- `components/`: UI reutilizable (ProductCard, Header, etc.).
- `context/`: Carrito y estados globales.
- `pages/`: Vistas principales (Home, Products, Admin).
- `utils/`: Formateadores y constructores de mensajes.

## 🔐 Administración
Accede a `/admin` para gestionar el inventario. Puedes crear productos con "tramos de precios por mayor" y armar "combos" que se vinculan directamente con el stock de los productos.
