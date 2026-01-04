// Simple printer helper to send print jobs to a networked Xprinter
// Note: Direct printing from the browser may be blocked by CORS or printer capabilities.
// This helper will attempt an HTTP POST to the printer IP; if that fails, it logs the error.
export const formatOrderReceipt = (order = {}, action = 'PRINT') => {
  const lines = [];
  lines.push('--- Receipt ---');
  lines.push(`Action: ${action}`);
  if (order.id) lines.push(`Order: ${order.id}`);
  if (order.table) lines.push(`Table: ${order.table}`);
  if (order.place) lines.push(`Place: ${order.place}`);
  if (order.status) lines.push(`Status: ${order.status}`);
  if (order.created_at) lines.push(`Created: ${order.created_at}`);
  lines.push('');
  if (order.items && Array.isArray(order.items)) {
    lines.push('Items:');
    order.items.forEach((it) => {
      const name = it.name || it.menu_item?.name || 'Item';
      const qty = it.quantity || it.qty || 1;
      const price = it.price || it.unit_price || '';
      lines.push(` - ${name} x${qty} ${price}`.trim());
    });
  }
  if (order.total) lines.push('');
  if (order.total) lines.push(`Total: ${order.total}`);
  lines.push('--- Thank you ---');
  return lines.join('\n');
};

export const formatOrderItemReceipt = (orderItem = {}, action = 'ITEM') => {
  const lines = [];
  lines.push('--- Item Receipt ---');
  lines.push(`Action: ${action}`);
  if (orderItem.id) lines.push(`Item: ${orderItem.id}`);
  if (orderItem.order) lines.push(`Order: ${orderItem.order}`);
  const name = orderItem.name || orderItem.item_name || orderItem.menu_item?.name || '';
  if (name) lines.push(`Name: ${name}`);
  const qty = orderItem.quantity || orderItem.qty || '';
  if (qty) lines.push(`Qty: ${qty}`);
  if (orderItem.price) lines.push(`Price: ${orderItem.price}`);
  lines.push('---');
  return lines.join('\n');
};

export const printToXPrinter = async (text) => {
  // Attempt to POST to the printer IP. Adjust path/port if your printer uses a different endpoint.
  const PRINTER_HOST = 'http://192.168.100.51';
  const TRY_PATHS = ['/print', '/'];

  for (const p of TRY_PATHS) {
    const url = `${PRINTER_HOST}${p}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: text,
      });
      if (res.ok) return res;
      // If not ok, continue to next path
    } catch (err) {
      // network error or CORS — try next
      console.warn('Printer POST failed to', url, err.message || err);
    }
  }

  // If direct printer POST fails, do not open UI. Return failure so caller can decide.
  return { ok: false };
};
