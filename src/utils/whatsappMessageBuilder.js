export const buildWhatsAppMessage = (formData, cart, total) => {
    const phoneNumber = "5491122921805"; // Numero de la tienda (Hardcoded o del env)

    let message = `*NUEVO PEDIDO - Oud & Essence*\n\n`;
    message += `*Cliente:* ${formData.name}\n`;
    message += `*WhatsApp:* ${formData.phone}\n`;
    message += `*Ciudad/Zona:* ${formData.city}\n`;
    message += `*Pago:* ${formData.paymentMethod}\n`;

    if (formData.observations) {
        message += `*Observaciones:* ${formData.observations}\n`;
    }

    message += `\n*Detalle del pedido:*\n`;

    cart.forEach(item => {
        const nombre = item.nombre || item.name;
        const precio = item.precio || item.price || item.finalPrice;
        message += `- ${nombre} x${item.quantity} (${item.type === 'combo' ? 'Combo' : 'Producto'})\n`;
    });

    message += `\n*TOTAL:* ${total}\n\n`;
    message += `_Coordinar envío y pago por aquí._`;

    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
};
