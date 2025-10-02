
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { fetchOrder, updateOrder } from "../../services/orders";
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
  const location = useLocation();
  const navigate = useNavigate();
  // Prefer orderid from navigation state, fallback to param
  const id = location.state?.orderid;
  const [order, setOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [activeTab, setActiveTab] = useState(categories[0].key);
  const [search, setSearch] = useState("");

  if (!id) return <Navigate to="/" />;

  // Fetch order, menu items, and tables
  useEffect(() => {
    fetchOrder(id).then(res => setOrder(res.data));
    api.get("/menuitems/").then(res => setMenuItems(res.data));
    api.get("/tables/").then(res => setTables(res.data));
  }, [id]);

  if (!order) return <div>Loading...</div>;

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

  // Add item to order
  const addItem = (menuItem) => {
    setOrder(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Math.random(), // temp id for frontend
          menu_item: menuItem.id,
          item_name: menuItem.name,
          item_price: menuItem.price,
          quantity: 1
        }
      ]
    }));
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
    // Map items to backend format: only send menu_item, quantity, item_price
    const mappedItems = order.items.map(item => ({
      menu_item: item.menu_item,
      quantity: item.quantity,
      item_price: item.item_price
    }));
    await updateOrder(order.id, {
      ...order,
      items: mappedItems,
      table: order.table, // ensure table id is sent
      guests: order.guests || 4 // default or editable
    });
    navigate("/orders");
  };


  return (
    <div className="bg-gray-100">
      {/* Left: Order summary */}
      <div className="w-1/3 flex flex-col border-r border-gray-300 bg-white">
        <div className="flex items-center justify-between bg-green-200 px-4 py-2">
          <div>
            <span className="font-bold text-lg">ORDER</span>
            <span className="text-gray-600">#{order.id}</span>
          </div>
          <div>
            <span className="font-bold">
              {order.user_name}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-200 text-gray-700">
          <span className="flex items-center gap-1">
            <span role="img" aria-label="calendar">📅</span> {order.c_at ? new Date(order.c_at).toLocaleString() : "-"}
          </span>
          <span>| Table: 
            <span className="ml-1 px-2 py-1 border rounded w-32 bg-gray-100 cursor-not-allowed select-none">
              {order.table_details?.name || order.table || "-"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <span role="img" aria-label="guests">👥</span> Guests: 
            <input
              type="number"
              min={1}
              className="ml-1 px-2 py-1 border rounded w-12"
              value={order.guests || 4}
              onChange={e => setOrder(o => ({ ...o, guests: Number(e.target.value) }))}
            />
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          {/* List order items */}
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center px-4 py-2 border-b">
              <span>{item.item_name} x{item.quantity}</span>
              <span>{item.item_price} ₽</span>
              <button onClick={() => removeItem(item.id)} className="text-red-500 ml-2">Remove</button>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 px-4 py-2">
          <div className="flex justify-between text-sm">
            <span>Discount:</span>
            <span>0.00%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Surcharge:</span>
            <span>0.00%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Subtotal:</span>
            <span>836.00 ₽</span>
          </div>
          <div className="text-right text-2xl font-bold mt-2">836.00 ₽</div>
        </div>
        <div className="flex gap-2 p-2 border-t border-gray-200 bg-gray-50">
          <button className="flex-1 py-2 bg-gray-300 rounded font-bold" onClick={() => navigate(-1)}>← Back</button>
          <button className="flex-1 py-2 bg-gray-300 rounded font-bold" onClick={() => setOrder({ ...order, items: [] })}>× Clear</button>
          <button className="flex-1 py-2 bg-green-200 rounded font-bold flex items-center justify-center gap-1" onClick={handleSave}>
            <span role="img" aria-label="save">💾</span> Save
          </button>
        </div>
      </div>
      {/* Right: Menu and items */}
      <div className="w-1/2 flex flex-col">
        {/* Tabs */}
        <div className="flex bg-green-100">
          {categories.map(cat => (
            <button
              key={cat.key}
              className={`flex-1 py-2 text-lg font-bold border-b-4 ${activeTab === cat.key ? "border-yellow-400 bg-yellow-200" : "border-transparent"}`}
              onClick={() => setActiveTab(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            className="w-full p-2 rounded border border-gray-300"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Menu items grid */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-100">
          {filteredMenuItems.map(item => (
            <div
              key={item.id}
              className={`rounded-lg shadow text-white flex items-center justify-center text-lg font-bold h-32 bg-blue-400 cursor-pointer`}
              onClick={() => addItem(item)}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}