import api from './api';

// Create a new order item
export const createOrderItem = (order, menu_item, quantity) =>
  api.post('/orderitems/', { order, menu_item, quantity });
