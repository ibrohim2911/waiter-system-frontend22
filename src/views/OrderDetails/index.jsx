import React, { useEffect, useState } from "react";
import Numpad from "../../components/Numpad";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchOrder, updateOrder } from "../../services/orders";
import { createOrderItem, updateOrderItem, deleteOrderItem } from "../../services/orderItems";
import api from "../../services/api";
import { me } from "../../services/getMe";
import { TableCellsIcon } from "@heroicons/react/24/outline";

const categories = [
  { key: "frequent", label: "FREQUENTLY USED" },
  { key: "mains", label: "MAINS" },
  { key: "salads", label: "SALADS" },
  { key: "drinks", label: "DRINKS" },
  { key: "deserts", label: "DESERTS" },
  { key: "appetizers", label: "APPETIZERS" },
];

// Helper to show time since last update (uses u_at or c_at)
function timeSince(date) {
  if (!date) return "-";
  const now = new Date();
  const updated = new Date(date);
  const seconds = Math.floor((now - updated) / 1000);
  if (seconds < 60) return `${seconds} sekund `;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minut `;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat`;
  const days = Math.floor(hours / 24);
  return `${days} kun${days > 1 ? 'lar' : ''}`;
}
// Allow editing if order_status is 'processing' or 'pending'


export default function OrderEditPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0].key);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState(null);

  // Safe navigation: always save before leaving if there are unsaved items
  const safeNavigate = async (...args) => {
    if (newOrderItems.length > 0 || pendingEdits.length > 0) {
      await handleSave();
    }
    navigate(...args);
  };
  // Add item locally to newOrderItems
  const addItem = (menuItem) => {
    if (!isEditable) return;
    setNewOrderItems(prev => {
      // If already in list, increment quantity
      const idx = prev.findIndex(i => i.menu_item === menuItem.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      // Else add new
      return [
        ...prev,
        {
          menu_item: menuItem.id,
          item_name: menuItem.name,
          item_price: menuItem.price,
          quantity: 1
        }
      ];
    });
  };
  // Save order (restored)
  const handleSave = async () => {
    try {
      // First, send all new order items to backend
      for (const item of newOrderItems) {
        await createOrderItem(order.id, item.menu_item, item.quantity);
      }
      // Apply pending edits to saved order items
      for (const edit of pendingEdits) {
        if (edit.deleted) {
          await deleteOrderItem(edit.id);
        } else if (typeof edit.quantity === 'number') {
          const original = order.items.find(i => i.id === edit.id);
          if (original) {
            await updateOrderItem(edit.id, {
              order: order.id,
              menu_item: original.menu_item,
              quantity: edit.quantity
            });
          }
        }
      }
      // Optionally, update order details if needed (guests, table, etc)
      await updateOrder(order.id, {
        ...order,
        table: order.table,
        guests: order.guests || 4
      });
      setNewOrderItems([]);
      setPendingEdits([]);
      // Fetch latest order and update UI
      const res = await fetchOrder(order.id);
      setOrder(res.data);
    } catch (err) {
      console.error("Save failed", err);
    }
  };
  // Local state for new order items to be added
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [numpad, setNumpad] = useState({ open: false, itemKey: null, value: "" });
  // Track local edits to saved order items: { id, quantity, deleted }
  const [pendingEdits, setPendingEdits] = useState([]);
  // Auto-save on page unload (browser close/refresh)
  useEffect(() => {
    const autoSave = async (e) => {
      if (newOrderItems.length > 0 || pendingEdits.length > 0) {
        await handleSave();
      }
    };
    window.addEventListener('beforeunload', autoSave);
    return () => {
      window.removeEventListener('beforeunload', autoSave);
    };
  }, [newOrderItems, pendingEdits]);



  // Get commission from table details if available (after order is defined)
  const commission = order && order.table_details && order.table_details.commission
    ? Number(order.table_details.commission)
    : 0;

  // Get order id from navigation state or URL param
  const id = location.state?.orderid || params.orderid;

  // Debug logging
  console.log("OrderEditPage: id=", id, "order=", order, "user=", user);

  // Fetch user info on mount
  useEffect(() => {
    me().then(setUser);
  }, []);

  // isEditable: waiter can edit only if processing, non-waiter can edit if processing or pending
  const isEditable = order && user && (
    (user.role === 'waiter' && order.order_status === 'processing') ||
    (user.role !== 'waiter' && (order.order_status === 'processing' || order.order_status === 'pending'))
  );
  useEffect(() => {
    if (!id) return;
    fetchOrder(id)
      .then(res => {
        setOrder(res.data);
        console.log("Fetched order:", res.data);
      })
      .catch(err => {
        console.error("Error fetching order:", err);
      });
    api.get("/menuitems/")
      .then(res => setMenuItems(res.data))
      .catch(err => console.error("Error fetching menu items:", err));
    api.get("/tables/")
      .then(res => setTables(res.data))
      .catch(err => console.error("Error fetching tables:", err));
  }, [id]);

  // Calculate subtotal and amount dynamically from all order items (existing + new)
  const calcSubtotal = React.useMemo(() => {
    const allItems = [
      ...(order && order.items ? order.items : []),
      ...newOrderItems
    ];
    if (!allItems.length) return 0;
    return allItems.reduce((sum, item) => sum + (Number(item.item_price) * Number(item.quantity)), 0);
  }, [order, newOrderItems]);

  // Calculate total amount after commission only
  const calcAmount = React.useMemo(() => {
    let subtotal = calcSubtotal;
    let withCommission = subtotal + (subtotal * commission / 100);
    return Math.round(withCommission);
  }, [calcSubtotal, commission]);

  // Apply pendingEdits to saved order items for display (no grouping)
  const displayedSavedOrderItems = React.useMemo(() => {
    if (!order || !order.items) return [];
    // Apply edits
    return order.items.map(item => {
      const edit = pendingEdits.find(e => e.id === item.id);
      if (edit) {
        if (edit.deleted) return null;
        return { ...item, quantity: edit.quantity };
      }
      return item;
    }).filter(Boolean);
  }, [order, pendingEdits]);

  const groupedNewOrderItems = React.useMemo(() => {
    if (!newOrderItems.length) return [];
    const map = {};
    newOrderItems.forEach(item => {
      const key = `${item.item_name}__${item.item_price}`;
      if (!map[key]) {
        map[key] = { ...item, quantity: 0, total_price: 0 };
      }
      map[key].quantity += Number(item.quantity);
      map[key].total_price += Number(item.item_price) * Number(item.quantity);
    });
    return Object.values(map);
  }, [newOrderItems]);

  // Only return JSX after all hooks
  if (!id) return <div>No order id provided. (id is missing)</div>;
  if (!order) return <div>Loading order... (Check console for debug info)</div>;

  // Filter menu items by tab and search
  // If search is active, show all items matching search, else filter by tab
  let filteredMenuItems = [];
  if (search.trim() !== "") {
    filteredMenuItems = menuItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
  } else {
    filteredMenuItems = menuItems.filter(item => {
      if (activeTab === "frequent") {
        return item.is_frequent;
      }
      if (activeTab === "mains") {
        return item.category === "mains";
      }
      if (activeTab === "salads") {
        return item.category === "salads";
      }
      if (activeTab === "drinks") {
        return item.category === "drinks";
      }
      if (activeTab === "deserts") {
        return item.category === "deserts";
      }
      if (activeTab === "appetizers") {
        return item.category === "appetizers";
      }
      return true;
    });
  }

  // Only return JSX after all hooks
  if (!id) return <div>No order id provided. (id is missing)</div>;
  if (!order) return <div>Loading order... (Check console for debug info)</div>;

  // Filter menu items by tab and search
  // If search is active, show all items matching search, else filter by tab

  return (
    <div className="min-h-screen bg-zinc-900 flex items-stretch justify-center p-0 m-0">
      <div
        className="w-full max-w-[100vw] bg-zinc-800 rounded-none shadow-lg flex flex-col md:flex-row overflow-hidden border border-zinc-700"
        style={{ height: 'calc(100vh - 60px)' }}
      >
        {/* Left: Order summary */}
        <div className="w-full md:w-1/3 flex flex-col border-r border-zinc-700 bg-zinc-900 min-h-[500px]">
          <div className="flex items-center justify-between bg-zinc-800 px-2 py-1 border-b border-zinc-700">
            <div>
              <span className="font-bold text-sm text-zinc-100">ORDER</span>
              <span className="text-zinc-400 ml-1">#{order.id}</span>
            </div>
            <div>
              <span className="font-bold text-blue-300">
                {order.user_name}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 py-2 border-b border-zinc-800 text-zinc-200 bg-zinc-800">
            <span className="flex items-center  text-[0.7em]">
              <span role="img" aria-label="calendar " >📅</span> {order.c_at ? new Date(order.c_at).toLocaleString() : "-"}
            </span>
            <span className="text-[0.8em]">
              <TableCellsIcon className="w-4 h-4 inline-block" />
              <span
                className="ml-1 px-1 py-1 cursor-pointer select-none text-blue-400 underline"
                onClick={() => {
                  if (!isEditable) return;
                  safeNavigate("/create-order", { state: { orderid: order.id } });
                }}
              >
                {order.table_details?.name}
              </span>
              <span className="ml-1 px-1 py-1 select-none">
                {order.table_details?.location}
              </span>
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-2">
            {/* List order items */}
            {displayedSavedOrderItems.length === 0 && groupedNewOrderItems.length === 0 ? (
              <div className="text-zinc-500 text-center py-4">No items in order.</div>
            ) : (
              <>
                {displayedSavedOrderItems.length > 0 && (
                  <ul className="space-y-2 mb-1">
                    {displayedSavedOrderItems.map(item => (
                      <li key={"saved-" + item.id} className="flex text-[0.8em] items-center justify-between bg-zinc-800 rounded-lg shadow-sm px-3 py-1 border border-zinc-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 truncate max-w-[110px]">{item.item_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">{Number(item.item_price) * Number(item.quantity)} <small>so'm</small></span>
                          {/* Editable controls for non-waiter users */}
                          {(
                            <>
                              {/* <button
                                className="bg-zinc-700 text-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => {
                                  const qty = item.quantity;
                                  if (qty > 1) {
                                    setPendingEdits(prev => {
                                      const exists = prev.find(e => e.id === item.id);
                                      if (exists) {
                                        return prev.map(e => e.id === item.id ? { ...e, quantity: qty - 1 } : e);
                                      } else {
                                        return [...prev, { id: item.id, quantity: qty - 1 }];
                                      }
                                    });
                                  } else if (qty === 1) {
                                    setPendingEdits(prev => {
                                      return [...prev.filter(e => e.id !== item.id), { id: item.id, deleted: true }];
                                    });
                                  }
                                }}
                              >-</button> */}
                              <span
                                className="inline-block bg-blue-900 text-blue-200 text-xs font-bold rounded-full px-2 py-1 select-none"

                              >
                                x{item.quantity}
                              </span>
                              {/* <button
                                className="bg-zinc-700 text-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                                onClick={() => {
                                  const qty = item.quantity;
                                  setPendingEdits(prev => {
                                    const exists = prev.find(e => e.id === item.id);
                                    if (exists) {
                                      return prev.map(e => e.id === item.id ? { ...e, quantity: qty + 1 } : e);
                                    } else {
                                      return [...prev, { id: item.id, quantity: qty + 1 }];
                                    }
                                  });
                                }}
                              >+</button> */}
                              {/* <button
                                onClick={() => {
                                  setPendingEdits(prev => [...prev.filter(e => e.id !== item.id), { id: item.id, deleted: true }]);
                                }}
                                className="text-red-400 hover:text-red-600 text-sm px-1 py-1 rounded transition"
                              >✕</button> */}
                              <span className="text-xs text-zinc-400 italic">
                                {timeSince(item.u_at)}
                              </span>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {groupedNewOrderItems.length > 0 && (
                  <>
                    <div className="text-xs text-blue-400 mb-1">New Items (not saved yet)</div>
                    <ul className="space-y-2">
                      {groupedNewOrderItems.map(item => (
                        <li key={"new-" + item.item_name + '__' + item.item_price} className="flex text-[0.8em] items-center justify-between bg-zinc-800 rounded-lg shadow-sm px-2 py-1 border border-zinc-700">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold  text-zinc-100 truncate max-w-[110px]">{item.item_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200">{item.total_price} <small>so'm</small></span>
                            {/* <button
                              className="bg-zinc-700 text-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                              onClick={() => {
                                if (!isEditable) return;
                                setNewOrderItems(prev => prev.flatMap(i => {
                                  if (i.item_name === item.item_name && i.item_price === item.item_price) {
                                    if (i.quantity > 1) {
                                      return [{ ...i, quantity: i.quantity - 1 }];
                                    } else {
                                      // Remove this item instance
                                      return [];
                                    }
                                  }
                                  return [i];
                                }));
                              }}
                              disabled={!isEditable}
                            >-</button> */}
                            {/* {isEditable ? (
                              <span
                                className="inline-block bg-blue-900 text-blue-200 text-xs font-bold rounded-full px-2 py-1 cursor-pointer select-none"
                                onClick={() => setNumpad({ open: true, itemKey: item.item_name + '__' + item.item_price, value: String(item.quantity) })}
                              >
                                x{item.quantity}
                              </span>
                            ) :  */}

                            <span className="inline-block bg-blue-900 text-blue-200 text-sm font-bold rounded-full px-2 py-1">x{item.quantity}</span>

                            {/* Numpad overlay for editing quantity */}
                            {numpad.open && (
                              <Numpad
                                value={numpad.value}
                                onChange={val => setNumpad(n => ({ ...n, value: val }))}
                                onClose={() => {
                                  // Save value to item if valid
                                  const val = parseFloat(numpad.value);
                                  if (!isNaN(val) && val > 0) {
                                    // Saved order item
                                    if (String(numpad.itemKey).startsWith('saved-')) {
                                      const itemId = Number(numpad.itemKey.replace('saved-', ''));
                                      const target = order.items.find(i => i.id === itemId);

                                      if (target) {
                                        setPendingEdits(prev => {
                                          const exists = prev.find(e => e.id === target.id);
                                          if (exists) {
                                            return prev.map(e => e.id === target.id ? { ...e, quantity: val } : e);
                                          } else {
                                            return [...prev, { id: target.id, quantity: val }];
                                          }
                                        });
                                      }
                                    } else {
                                      // New order item
                                      setNewOrderItems(prev => prev.map(i =>
                                        (i.item_name + '__' + i.item_price) === numpad.itemKey
                                          ? { ...i, quantity: val }
                                          : i
                                      ));
                                    }
                                  }
                                  setNumpad({ open: false, itemKey: null, value: "" });
                                }}
                              />
                            )}
                            {/* <button
                              className="bg-zinc-700 text-zinc-200 rounded-full w-6 h-6 flex items-center justify-center text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                              onClick={() => {
                                if (!isEditable) return;
                                setNewOrderItems(prev => [
                                  ...prev,
                                  {
                                    menu_item: item.menu_item,
                                    item_name: item.item_name,
                                    item_price: item.item_price,
                                    quantity: 1
                                  }
                                ]);
                              }}
                              disabled={!isEditable}
                            >+</button> */}
                            {/* <button
                              onClick={() => {
                                if (!isEditable) return;
                                setNewOrderItems(prev => prev.filter(i => !(i.item_name === item.item_name && i.item_price === item.item_price)));
                              }}
                              className="text-red-400 hover:text-red-600 text-sm px-2 py-1 rounded transition disabled:opacity-50"
                              disabled={!isEditable}
                            >✕</button> */}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
          <div className="border-t border-zinc-800 px-2 py-1 bg-zinc-800">
            {/* Discount and Surcharge removed */}
            <div className="flex justify-between text-xs text-zinc-300">
              <span>Subtotal:</span>
              <span>{calcSubtotal} so'm + {commission}%</span>
            </div>
            <div className="text-right text-xl font-bold mt-1 text-blue-300">
              {calcAmount} <small>so'm</small>
            </div>
          </div>
          <div className="flex gap-2 p-1 border-t border-zinc-800 bg-zinc-800">
            <button className="flex-1 py-1 bg-red-700 text-zinc-100 rounded-lg font-bold text-sm  hover:bg-red-600 transition disabled:opacity-50" onClick={() => isEditable && setNewOrderItems([])} disabled={!isEditable}> Clear</button>
            <button className="flex-1 py-1 bg-blue-700 text-zinc-100 rounded-lg font-bold text-sm flex items-center justify-center gap-1 hover:bg-blue-600 transition disabled:opacity-50" onClick={isEditable ? handleSave : undefined} disabled={!isEditable}>
              <span role="img" aria-label="save"></span> Save
            </button>
            {/* Precheque for processing orders */}
            {order.order_status === 'processing' && (
              <button
                className="flex-1 py-1 bg-yellow-600 text-zinc-100 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-yellow-500 transition"
                onClick={async () => {
                  await updateOrder(order.id, { ...order, order_status: 'pending' });
                  setOrder({ ...order, order_status: 'pending' });
                }}
              >
                <span role="img" aria-label="precheque"></span> prechek
              </button>
            )}
            {/* Status change controls for non-waiters */}
            {user && user.role !== 'waiter' && (
              <>
                {order.order_status !== 'completed' && (
                  <button
                    className="flex-1 py-3 bg-green-700 text-zinc-100 rounded-lg font-bold text-xs flex items-center justify-center gap-1 hover:bg-green-600 transition"
                    onClick={async () => {
                      await updateOrder(order.id, { ...order, order_status: 'completed' });
                      setOrder({ ...order, order_status: 'completed' });
                    }}
                  >
                    <span role="img" aria-label="close" ></span> yopish
                  </button>
                )}
                {order.order_status !== 'processing' && (
                  <button
                    className="flex-1 py-3 bg-blue-800 text-zinc-100 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    onClick={async () => {
                      await updateOrder(order.id, { ...order, order_status: 'processing' });
                      setOrder({ ...order, order_status: 'processing' });
                    }}
                  >
                    <span role="img" aria-label="open"></span> Ochish
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {/* Right: Menu and items */}
        <div className="w-full md:w-2/3 flex flex-col min-h-[500px] bg-zinc-900">
          {/* Tabs */}
          <div className="flex bg-zinc-800 border-b border-zinc-700">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`flex-1 py-2 text-xs font-bold border-b-4 ${activeTab === cat.key ? "border-blue-500 bg-zinc-900 text-blue-400" : "border-transparent text-zinc-400"}`}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="p-2 border-b border-zinc-800 bg-zinc-900">
            <div className="relative">
              <input
                className="w-full p-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-400 text-lg px-1"
                  onClick={() => setSearch("")}
                  tabIndex={0}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          {/* Menu items grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 p-4 bg-zinc-900 overflow-y-auto">
            {filteredMenuItems.length === 0 ? (
              <div className="col-span-full text-zinc-500 text-center py-4">No menu items found.</div>
            ) : (
              filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  className={`rounded-lg shadow text-zinc-100 flex items-center text-center justify-center text-xs  font-bold bg-blue-700 transition p-1 w-20 h-20 select-none cursor-pointer ${isEditable ? 'hover:bg-blue-500' : 'opacity-60 cursor-not-allowed'}`}
                  onClick={() => isEditable && addItem(item)}
                  tabIndex={0}
                  aria-disabled={!isEditable}
                >
                  {item.name}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}