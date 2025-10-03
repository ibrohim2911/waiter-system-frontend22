  // Allow editing if order_status is 'processing' or 'pending'
  
  import React, { useEffect, useState } from "react";
  import Numpad from "../../components/Numpad";
  import { useParams, useNavigate, useLocation } from "react-router-dom";
  import { fetchOrder, updateOrder } from "../../services/orders";
  import { createOrderItem } from "../../services/orderItems";
  import api from "../../services/api";
  
  const categories = [
  { key: "frequent", label: "FREQUENTLY USED" },
  { key: "mains", label: "MAINS" },
  { key: "salads", label: "SALADS" },
  { key: "drinks", label: "DRINKS" },
  { key: "deserts", label: "DESERTS" },
  { key: "appetizers", label: "APPETIZERS" },
];


export default function OrderEditPage() {
  // Local state for new order items to be added
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [numpad, setNumpad] = useState({ open: false, itemKey: null, value: "" });
  
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0].key);
  const [search, setSearch] = useState("");

  // Get commission from table details if available (after order is defined)
  const commission = order && order.table_details && order.table_details.commission
  ? Number(order.table_details.commission)
  : 0;
  
  // Get order id from navigation state or URL param
  const id = location.state?.orderid || params.orderid;
  
  // Debug logging
  console.log("OrderEditPage: id=", id, "order=", order);
  
  const isEditable = order && order.order_status === 'processing';
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

  // Group saved and new order items separately for display
  const groupedSavedOrderItems = React.useMemo(() => {
    if (!order || !order.items) return [];
    const map = {};
    order.items.forEach(item => {
      const key = `${item.item_name}__${item.item_price}`;
      if (!map[key]) {
        map[key] = { ...item, quantity: 0, total_price: 0 };
      }
      map[key].quantity += Number(item.quantity);
      map[key].total_price += Number(item.item_price) * Number(item.quantity);
    });
    return Object.values(map);
  }, [order]);

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

  // ...existing code...

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

  // Remove item from order
  const removeItem = (itemId) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Save order
  const handleSave = async () => {
    try {
      // First, send all new order items to backend
      for (const item of newOrderItems) {
        await createOrderItem(order.id, item.menu_item, item.quantity);
      }
      // Optionally, update order details if needed (guests, table, etc)
      await updateOrder(order.id, {
        ...order,
        table: order.table,
        guests: order.guests || 4
      });
      setNewOrderItems([]);
      navigate("/");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save order. Please try again.");
    }
  };


  return (
    <div className="min-h-screen bg-zinc-900 flex items-stretch justify-center p-0 m-0">
      <div
        className="w-full max-w-[100vw] bg-zinc-800 rounded-none shadow-lg flex flex-col md:flex-row overflow-hidden border border-zinc-700"
        style={{ height: 'calc(100vh - 80px)' }}
      >
        {/* Left: Order summary */}
        <div className="w-full md:w-1/3 flex flex-col border-r border-zinc-700 bg-zinc-900 min-h-[500px]">
          <div className="flex items-center justify-between bg-zinc-800 px-4 py-3 border-b border-zinc-700">
            <div>
              <span className="font-bold text-lg text-zinc-100">ORDER</span>
              <span className="text-zinc-400 ml-2">#{order.id}</span>
            </div>
            <div>
              <span className="font-bold text-blue-300">
                {order.user_name}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 border-b border-zinc-800 text-zinc-200 bg-zinc-800">
            <span className="flex items-center gap-1">
              <span role="img" aria-label="calendar">📅</span> {order.c_at ? new Date(order.c_at).toLocaleString() : "-"}
            </span>
            <span>Table:
              <span className="ml-1 px-2 py-1 border rounded w-28 bg-zinc-900 cursor-not-allowed select-none">
                {order.table_details?.name}
              </span>
              <span className="ml-1 px-2 py-1 border rounded w-28 bg-zinc-900 cursor-not-allowed select-none">
                {order.table_details?.location}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <span role="img" aria-label="guests">👥</span> Guests:
              <input
                type="number"
                min={1}
                className="ml-1 px-2 py-1 border rounded w-12 bg-zinc-900 text-zinc-100"
                value={order.table_details?.capacity || 4}
                onChange={e => setOrder(o => ({ ...o, guests: Number(e.target.value) }))}
              />
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {/* List order items */}
            {groupedSavedOrderItems.length === 0 && groupedNewOrderItems.length === 0 ? (
              <div className="text-zinc-500 text-center py-8">No items in order.</div>
            ) : (
              <>
                {groupedSavedOrderItems.length > 0 && (
                  <ul className="space-y-2 mb-4">
                    {groupedSavedOrderItems.map(item => (
                      <li key={"saved-" + item.item_name + '__' + item.item_price} className="flex items-center justify-between bg-zinc-800 rounded-lg shadow-sm px-3 py-2 border border-zinc-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 truncate max-w-[110px]">{item.item_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">{item.total_price} so'm</span>
                          <span className="inline-block bg-blue-900 text-blue-200 text-base font-bold rounded-full px-3 py-1">x{item.quantity}</span>
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
                        <li key={"new-" + item.item_name + '__' + item.item_price} className="flex items-center justify-between bg-zinc-800 rounded-lg shadow-sm px-3 py-2 border border-zinc-700">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-100 truncate max-w-[110px]">{item.item_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-200">{item.total_price} so'm</span>
                            <button
                              className="bg-zinc-700 text-zinc-200 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
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
                            >-</button>
                            {isEditable ? (
                              <span
                                className="inline-block bg-blue-900 text-blue-200 text-base font-bold rounded-full px-3 py-1 cursor-pointer select-none"
                                onClick={() => setNumpad({ open: true, itemKey: item.item_name + '__' + item.item_price, value: String(item.quantity) })}
                              >
                                x{item.quantity}
                              </span>
                            ) : (
                              <span className="inline-block bg-blue-900 text-blue-200 text-base font-bold rounded-full px-3 py-1">x{item.quantity}</span>
                            )}
      {/* Numpad overlay for editing quantity */}
      {numpad.open && (
        <Numpad
          value={numpad.value}
          onChange={val => setNumpad(n => ({ ...n, value: val }))}
          onClose={() => {
            // Save value to item if valid
            const val = parseFloat(numpad.value);
            if (!isNaN(val) && val > 0) {
              setNewOrderItems(prev => prev.map(i =>
                (i.item_name + '__' + i.item_price) === numpad.itemKey
                  ? { ...i, quantity: val }
                  : i
              ));
            }
            setNumpad({ open: false, itemKey: null, value: "" });
          }}
        />
      )}
                            <button
                              className="bg-zinc-700 text-zinc-200 rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-blue-700 disabled:opacity-50"
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
                            >+</button>
                            <button
                              onClick={() => {
                                if (!isEditable) return;
                                setNewOrderItems(prev => prev.filter(i => !(i.item_name === item.item_name && i.item_price === item.item_price)));
                              }}
                              className="text-red-400 hover:text-red-600 text-lg px-3 py-1 rounded transition disabled:opacity-50"
                              disabled={!isEditable}
                            >✕</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
          <div className="border-t border-zinc-800 px-4 py-3 bg-zinc-800">
            {/* Discount and Surcharge removed */}
            <div className="flex justify-between text-sm mb-1 text-zinc-300">
              <span>Subtotal:</span>
              <span>{calcSubtotal} so'm</span>
            </div>
            <div className="flex justify-between text-sm mb-1 text-zinc-300">
              <span>Commission:</span>
              <span>{commission}%</span>
            </div>
            <div className="text-right text-2xl font-bold mt-2 text-blue-300">
              {calcAmount} so'm
            </div>
          </div>
          <div className="flex gap-2 p-2 border-t border-zinc-800 bg-zinc-800">
            <button className="flex-1 py-2 bg-red-700 text-zinc-100 rounded font-bold hover:bg-red-600 transition disabled:opacity-50" onClick={() => isEditable && setNewOrderItems([])} disabled={!isEditable}>× Clear</button>
            <button className="flex-1 py-2 bg-blue-700 text-zinc-100 rounded font-bold flex items-center justify-center gap-1 hover:bg-blue-600 transition disabled:opacity-50" onClick={isEditable ? handleSave : undefined} disabled={!isEditable}>
              <span role="img" aria-label="save">💾</span> Save
            </button>
            {order.order_status === 'processing' && (
              <button
                className="flex-1 py-2 bg-yellow-600 text-zinc-900 rounded font-bold flex items-center justify-center gap-1 hover:bg-yellow-500 transition"
                onClick={async () => {
                  await updateOrder(order.id, { ...order, order_status: 'pending' });
                  setOrder({ ...order, order_status: 'pending' });
                }}
              >
                <span role="img" aria-label="precheque">🧾</span> Precheque
              </button>
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
                className={`flex-1 py-3 text-base font-bold border-b-4 ${activeTab === cat.key ? "border-blue-500 bg-zinc-900 text-blue-400" : "border-transparent text-zinc-400"}`}
                onClick={() => setActiveTab(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900">
            <input
              className="w-full p-2 rounded border border-zinc-700 bg-zinc-800 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {/* Menu items grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 p-4 bg-zinc-900 overflow-y-auto">
            {filteredMenuItems.length === 0 ? (
              <div className="col-span-full text-zinc-500 text-center py-8">No menu items found.</div>
            ) : (
              filteredMenuItems.map(item => (
                <div
                  key={item.id}
                  className={`rounded-lg shadow text-zinc-100 flex items-center justify-center text-base font-bold bg-blue-700 transition p-2 min-w-[110px] max-w-[110px] min-h-[80px] max-h-[80px] w-[110px] h-[80px] cursor-pointer ${isEditable ? 'hover:bg-blue-500' : 'opacity-60 cursor-not-allowed'}`}
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