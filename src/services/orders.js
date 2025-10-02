import api from './api';
import { useCallback } from 'react';

// Get all orders with optional params (pagination, status)
export const fetchOrders = (params = {}) => api.get('/orders/', { params });

// Get single order by id
export const fetchOrder = (id) => api.get(`/orders/${id}/`);

// Create new order
export const createOrder = (orderData) => api.post('/orders/', orderData);

// Update order by id
export const updateOrder = (id, orderData) => api.put(`/orders/${id}/`, orderData);

// Delete order by id
export const deleteOrder = (id) => api.delete(`/orders/${id}/`);
