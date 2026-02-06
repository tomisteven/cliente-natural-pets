import React from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import OrderTicket from './OrderTicket';
import styles from './TicketPreviewModal.module.css';
import toast from 'react-hot-toast';

const TicketPreviewModal = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        // Crear contenido HTML del ticket para impresión en ventana dedicada
        const ticketHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Ticket #${order._id.slice(-6).toUpperCase()}</title>
                <style>
                    @page { 
                        size: 80mm auto; 
                        margin: 0 !important; 
                    }
                    @media print {
                        html, body {
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 80mm !important;
                        }
                        body {
                            padding-left: 20px !important;
                            margin-top: 0 !important;
                        }
                    }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    html {
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        margin: 0;
                        padding: 1mm 2mm 1mm 20px;
                        width: 80mm;
                        max-width: 80mm;
                        font-family: 'Courier New', Courier, monospace;
                        font-size: 10px;
                        font-weight: 600;
                        color: #000;
                        background: #fff;
                        line-height: 1.25;
                    }
                    .header { text-align: center; margin-bottom: 6px; }
                    .store-name { font-size: 13px; font-weight: 800; display: block; margin-bottom: 3px; }
                    .header span { font-size: 9px; }
                    .separator { border-top: 1px dashed #000; margin: 4px 0; }
                    .order-id { text-align: center; font-size: 11px; font-weight: 900; background: #000; color: #fff; padding: 2px 4px; margin-bottom: 4px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .info { margin-bottom: 4px; font-size: 9px; }
                    .row { margin-bottom: 1px; }
                    .notes { font-size: 9px; margin-bottom: 3px; }
                    .notes-label { font-weight: bold; }
                    .notes-content { font-style: italic; }
                    .section-title { text-align: center; margin-bottom: 3px; font-weight: bold; font-size: 9px; }
                    .items-header { display: flex; font-weight: 800; border-bottom: 1px solid #000; padding-bottom: 1px; margin-bottom: 3px; font-size: 9px; }
                    .item-row { display: flex; margin-bottom: 2px; font-size: 9px; }
                    .col-qty { width: 12%; font-weight: bold; }
                    .col-desc { flex: 1; font-size: 8px; word-break: break-word; padding-right: 2px; }
                    .col-total { width: 25%; text-align: right; font-size: 9px; }
                    .totals { text-align: right; margin-top: 4px; font-size: 9px; }
                    .total-row { font-size: 12px; font-weight: 900; border-top: 1px solid #000; padding-top: 3px; margin-top: 4px; }
                    .footer { text-align: center; margin-top: 8px; font-size: 8px; font-weight: bold; }
                    .footer p { margin: 1px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <span class="store-name">MAYORISTA MASCOTAS</span>
                    <span>Don Torcuato, Buenos Aires</span><br/>
                    <span>admin@mayoristamascotas.com</span><br/>
                    <span>TEL: 011 3475-0981</span>
                </div>
                <div class="separator"></div>
                <div class="order-id">PEDIDO #${order._id.slice(-6).toUpperCase()}</div>
                <div class="info">
                    <div class="row">FECHA: ${new Date(order.createdAt).toLocaleDateString()}</div>
                    <div class="row">HORA: ${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div class="row">CLIENTE: ${order.shippingData?.name || ''}</div>
                    ${order.shippingData?.address ? `<div class="row">DIR: ${order.shippingData.address}</div>` : ''}
                    ${order.shippingData?.city ? `<div class="row">LOC: ${order.shippingData.city}</div>` : ''}
                    <div class="row">PAGO: ${order.paymentMethod?.split(' (')[0] || ''}</div>
                </div>
                ${order.observations ? `
                    <div class="separator"></div>
                    <div class="notes">
                        <span class="notes-label">NOTAS: </span>
                        <span class="notes-content">${order.observations}</span>
                    </div>
                ` : ''}
                <div class="separator"></div>
                <div class="section-title">PRODUCTOS</div>
                <div class="items-header">
                    <span class="col-qty">Ud</span>
                    <span class="col-desc">Descripción</span>
                    <span class="col-total">Total</span>
                </div>
                ${order.items.map(item => `
                    <div class="item-row">
                        <span class="col-qty">${item.quantity}</span>
                        <span class="col-desc">${item.nombre}</span>
                        <span class="col-total">$${(item.precio * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                `).join('')}
                <div class="separator"></div>
                <div class="totals">
                    ${order.discountValue > 0 ? `<div>Desc: -$${order.discountValue.toLocaleString('es-AR')}</div>` : ''}
                    ${order.surcharge > 0 ? `<div>Rec: +$${order.surcharge.toLocaleString('es-AR')}</div>` : ''}
                    <div class="total-row">TOTAL: $${order.total.toLocaleString('es-AR')}</div>
                </div>
                <div class="footer">
                    <p>¡Gracias por su compra!</p>
                    <p>Cambios con este ticket</p>
                    <p>#${order._id.slice(-6).toUpperCase()}</p>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(ticketHTML);
        printWindow.document.close();
    };

    const handleDownload = async () => {
        const element = document.getElementById('printable-ticket');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher resolution
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const image = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = image;
            link.download = `ticket-${order._id.slice(-6)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Ticket descargado como imagen');
        } catch (error) {
            console.error('Error generando imagen:', error);
            toast.error('Error al generar la imagen');
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Vista Previa del Ticket</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className={styles.content}>
                    <div className={styles.ticketWrapper}>
                        {/* We use the same component for both preview and printing */}
                        <OrderTicket order={order} />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={`${styles.actionBtn} ${styles.downloadBtn}`} onClick={handleDownload}>
                        <FiDownload /> Guardar Imagen
                    </button>
                    <button className={`${styles.actionBtn} ${styles.printBtn}`} onClick={handlePrint}>
                        <FiPrinter /> Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketPreviewModal;
