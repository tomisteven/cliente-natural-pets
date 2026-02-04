import React from 'react';
import './OrderTicket.css';
import { formatCurrency } from '../../utils/currencyFormatter';

const OrderTicket = ({ order }) => {
    if (!order) return null;

    return (
        <div id="printable-ticket" className="ticket-container">
            <div className="ticket-header">
                <span className="store-name">MAYORISTA MASCOTAS</span>
                <span>Don Torcuato, Buenos Aires</span><br />
                <span>admin@mayoristamascotas.com</span><br />
                <span>TEL: 011 3475-0981</span>
            </div>

            <div className="ticket-separator"></div>

            <div className="ticket-info">
                <div className="ticket-row">
                    <span>FECHA: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="ticket-row">
                    <span>HORA: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="ticket-row">
                    <span>CLIENTE: {order.shippingData?.name}</span>
                </div>
                <div className="ticket-row">
                    <span>MÉTODO: {order.paymentMethod?.split(' (')[0]}</span>
                </div>
            </div>

            <div className="ticket-separator"></div>

            <div style={{ textAlign: 'center', marginBottom: '5px', fontWeight: 'bold' }}>
                DETALLE DE PRODUCTOS
            </div>

            <div className="items-header">
                <span className="col-qty">Cant</span>
                <span className="col-desc">Descripción</span>
                <span className="col-total">Total</span>
            </div>

            <div className="items-list">
                {order.items.map((item, index) => (
                    <div key={index} className="item-row">
                        <span className="col-qty">{item.quantity}</span>
                        <span className="col-desc">{item.nombre}</span>
                        <span className="col-total">{formatCurrency(item.precio * item.quantity)}</span>
                    </div>
                ))}
            </div>

            <div className="ticket-separator"></div>

            <div className="totals-section">
                {order.discountValue > 0 && (
                    <div className="ticket-row" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <span>Desc. ({order.discountCode}): -{formatCurrency(order.discountValue)}</span>
                    </div>
                )}
                {order.surcharge > 0 && (
                    <div className="ticket-row" style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <span>Recargo: +{formatCurrency(order.surcharge)}</span>
                    </div>
                )}
                <div className="total-row">
                    <span>SUBTOTAL: {formatCurrency(order.total)} ARS</span>
                </div>
            </div>

            <div className="ticket-footer">
                <p>*¡Gracias por su compra!*</p>
                <p>*Los cambios se realizan con este ticket.*</p>
                <p style={{ marginTop: '5px' }}>{order._id.slice(-6).toUpperCase()}</p>
            </div>
        </div>
    );
};

export default OrderTicket;
