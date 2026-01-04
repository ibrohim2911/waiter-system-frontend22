import api from './api';
import { printToXPrinter, formatOrderReceipt } from './printer';

// Get all orders with optional params (pagination, status)
export const fetchOrders = (params = {}) => api.get('/orders/', { params });

// Get single order by id
export const fetchOrder = (id) => api.get(`/orders/${id}/`);

// Create new order and attempt to print a receipt
export const createOrder = (orderData) => api.post('/orders/', orderData);

// Update order by id and attempt to print a receipt
export const updateOrder = async (id, orderData) => {
	const res = await api.put(`/orders/${id}/`, orderData);
	// Only print a full receipt when the status field is present in the update payload
	try {
		if (orderData && Object.prototype.hasOwnProperty.call(orderData, 'status')) {
			const data = res?.data || res;
			const text = formatOrderReceipt(data, 'STATUS_UPDATED');
			await printToXPrinter(text);
		}
	} catch (err) {
		console.warn('Printing failed after updating order status', err?.message || err);
	}
	return res;
};

// Delete order by id
export const deleteOrder = (id) => api.delete(`/orders/${id}/`);
