import React from 'react';
import { FiX, FiPrinter, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import OrderTicket from './OrderTicket';
import styles from './TicketPreviewModal.module.css';
import toast from 'react-hot-toast';

const TicketPreviewModal = ({ order, onClose }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
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
