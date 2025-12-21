import api from './api';

// Create a new order item
export const createOrderItem = (order, menu_item, quantity) =>
  api.post('/orderitems/', { order, menu_item, quantity });

// Create a new order item list
export const createOrderItemList = (itemList) =>
  api.post('/orderitems/', itemList);

// Update an order item (by id)
export const updateOrderItem = (id, data) =>
  api.put(`/orderitems/${id}/`, data);

// Delete an order item (by id)
export const deleteOrderItem = (id) =>
  api.delete(`/orderitems/${id}/`);
