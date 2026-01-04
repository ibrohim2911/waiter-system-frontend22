import api from './api';
import { printToXPrinter, formatOrderItemReceipt } from './printer';

// Create a new order item
export const createOrderItem = async (order, menu_item, quantity) => {
  const res = await api.post('/orderitems/', { order, menu_item, quantity });
  try {
    const data = res?.data || res;
    const text = formatOrderItemReceipt(data, 'CREATED');
    await printToXPrinter(text);
  } catch (err) {
    console.warn('Printing failed after creating order item', err?.message || err);
  }
  return res;
};

// Create a new order item list
export const createOrderItemList = async (itemList) => {
  const res = await api.post('/orderitems/', itemList);
  try {
    const data = res?.data || res;
    // If API returns an array of created items, print each
    if (Array.isArray(data)) {
      for (const it of data) {
        const text = formatOrderItemReceipt(it, 'CREATED');
        await printToXPrinter(text);
      }
    } else {
      const text = formatOrderItemReceipt(data, 'CREATED');
      await printToXPrinter(text);
    }
  } catch (err) {
    console.warn('Printing failed after creating order item list', err?.message || err);
  }
  return res;
};

// Update an order item (by id)
export const updateOrderItem = async (id, data) => {
  const res = await api.put(`/orderitems/${id}/`, data);
  try {
    const d = res?.data || res;
    const text = formatOrderItemReceipt(d, 'UPDATED');
    await printToXPrinter(text);
  } catch (err) {
    console.warn('Printing failed after updating order item', err?.message || err);
  }
  return res;
};

// Delete an order item (by id)
export const deleteOrderItem = (id) =>
  api.delete(`/orderitems/${id}/`);
