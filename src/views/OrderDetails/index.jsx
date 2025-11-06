import React, {useEffect, useState} from "react";
import {
	useParams,
	useNavigate,
	useLocation,
	useBlocker,
} from "react-router-dom";
import {fetchOrder, updateOrder} from "../../services/orders";
import {
	updateOrderItem,
	deleteOrderItem,
	createOrderItemList,
} from "../../services/orderItems";
import api from "../../services/api";
import {me} from "../../services/getMe";

import OrderHeader from "./components/OrderHeader";
import OrderItemsList from "./components/OrderItemsList";
import OrderTotals from "./components/OrderTotals";
import OrderActions from "./components/OrderActions";
import MenuComponent from "./components/MenuComponent";

const categories = [
	{key: "frequent", label: "FREQUENTLY USED"},
	{key: "mains", label: "MAINS"},
	{key: "salads", label: "SALADS"},
	{key: "drinks", label: "DRINKS"},
	{key: "deserts", label: "DESERTS"},
	{key: "appetizers", label: "APPETIZERS"},
];

export default function OrderEditPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useParams();
	const [order, setOrder] = useState(null);
	const [menuItems, setMenuItems] = useState([]);
	const [activeTab, setActiveTab] = useState(categories[0].key);
	const [search, setSearch] = useState("");
	const [user, setUser] = useState(null);
	const [newOrderItems, setNewOrderItems] = useState([]);
	const [pendingEdits, setPendingEdits] = useState([]);
	const [numpad, setNumpad] = useState({open: false, itemKey: null, value: ""});

	const hasUnsavedChanges = newOrderItems.length > 0 || pendingEdits.length > 0;

	const blocker = useBlocker(hasUnsavedChanges);

	useEffect(() => {
		if (blocker.state === "blocked") {
			const saveAndProceed = async () => {
				await handleSave();
				blocker.proceed();
			};

			saveAndProceed();
		}
	}, [blocker]);

	const id = location.state?.orderid || params.orderid;

	const handleSave = async () => {
		try {
			await createOrderItemList(
				newOrderItems.map(item => ({
					order: order.id,
					menu_item: item.menu_item,
					quantity: item.quantity,
				}))
			);

			const editPromises = pendingEdits
				.map(edit => {
					if (edit.deleted) return deleteOrderItem(edit.id);
					else if (typeof edit.quantity === "number") {
						const original = order.items.find(i => i.id === edit.id);
						if (original)
							return updateOrderItem(edit.id, {
								order: order.id,
								menu_item: original.menu_item,
								quantity: edit.quantity,
							});
					}
					return null;
				})
				.filter(Boolean);

			if (editPromises.length) {
				const results = Promise.allSettled(editPromises);
				results.forEach(result => {
					if (result.status === "rejected") {
						console.error("Failed to process an edit:", result.reason);
					}
				});
			}

			setNewOrderItems([]);
			setPendingEdits([]);
			const res = await fetchOrder(order.id);
			setOrder(res.data);
		} catch (err) {
			console.error("Save failed", err);
		}
	};

	const addItem = menuItem => {
		if (!isEditable) return;
		setNewOrderItems(prev => {
			const idx = prev.findIndex(i => i.menu_item === menuItem.id);
			if (idx !== -1) {
				const updated = [...prev];
				updated[idx] = {...updated[idx], quantity: updated[idx].quantity + 1};
				return updated;
			}
			return [
				...prev,
				{
					menu_item: menuItem.id,
					item_name: menuItem.name,
					item_price: menuItem.price,
					quantity: 1,
				},
			];
		});
	};

	const handleUpdateStatus = async status => {
		await updateOrder(order.id, {
			...order,
			order_status: status,
		});
		setOrder({...order, order_status: status});
	};

	useEffect(() => {
		me().then(setUser);
	}, []);

	useEffect(() => {
		if (!id) return;
		fetchOrder(id)
			.then(res => setOrder(res.data))
			.catch(err => console.error("Error fetching order:", err));
		api
			.get("/menuitems/")
			.then(res => setMenuItems(res.data))
			.catch(err => console.error("Error fetching menu items:", err));
	}, [id]);

	const isEditable =
		order &&
		user &&
		((user.role === "waiter" && order.order_status === "processing") ||
			(user.role !== "waiter" &&
				(order.order_status === "processing" ||
					order.order_status === "pending")));

	const commission = order?.table_details?.commission
		? Number(order.table_details.commission)
		: 0;

	const calcSubtotal = React.useMemo(() => {
		const allItems = [...(order?.items || []), ...newOrderItems];
		return allItems.reduce(
			(sum, item) => sum + Number(item.item_price) * Number(item.quantity),
			0
		);
	}, [order, newOrderItems]);

	const calcAmount = React.useMemo(() => {
		let withCommission = calcSubtotal + (calcSubtotal * commission) / 100;
		return Math.round(withCommission);
	}, [calcSubtotal, commission]);

	const displayedSavedOrderItems = React.useMemo(() => {
		if (!order?.items) return [];
		return order.items
			.map(item => {
				const edit = pendingEdits.find(e => e.id === item.id);
				if (edit) {
					if (edit.deleted) return null;
					return {...item, quantity: edit.quantity};
				}
				return item;
			})
			.filter(Boolean);
	}, [order, pendingEdits]);

	const groupedNewOrderItems = React.useMemo(() => {
		if (!newOrderItems.length) return [];
		const map = {};
		newOrderItems.forEach(item => {
			const key = `${item.item_name}__${item.item_price}`;
			if (!map[key]) {
				map[key] = {...item, quantity: 0, total_price: 0};
			}
			map[key].quantity += Number(item.quantity);
			map[key].total_price += Number(item.item_price) * Number(item.quantity);
		});
		return Object.values(map);
	}, [newOrderItems]);

	const handleNumpadClose = () => {
		const val = parseFloat(numpad.value);
		if (!isNaN(val) && val > 0) {
			if (String(numpad.itemKey).startsWith("saved-")) {
				const itemId = Number(numpad.itemKey.replace("saved-", ""));
				const target = order.items.find(i => i.id === itemId);
				if (target) {
					setPendingEdits(prev => {
						const exists = prev.find(e => e.id === target.id);
						if (exists) {
							return prev.map(e =>
								e.id === target.id ? {...e, quantity: val} : e
							);
						}
						return [...prev, {id: target.id, quantity: val}];
					});
				}
			} else {
				setNewOrderItems(prev =>
					prev.map(i =>
						i.item_name + "__" + i.item_price === numpad.itemKey
							? {...i, quantity: val}
							: i
					)
				);
			}
		}
		setNumpad({open: false, itemKey: null, value: ""});
	};

	if (!id) return <div>No order id provided.</div>;
	if (!order) return <div>Loading order...</div>;

	return (
		<div className="min-h-screen bg-zinc-900 flex items-stretch justify-center p-0 m-0">
			<div
				className="w-full max-w-[100vw] bg-zinc-800 rounded-none shadow-lg flex flex-col md:flex-row overflow-hidden border border-zinc-700"
				style={{height: "calc(100vh - 60px)"}}
			>
				<div className="w-full md:w-1/3 flex flex-col border-r border-zinc-700 bg-zinc-900 min-h-[500px]">
					<OrderHeader
						order={order}
						isEditable={isEditable}
						onNavigate={navigate}
					/>
					<OrderItemsList
						savedItems={displayedSavedOrderItems}
						newItems={groupedNewOrderItems}
						numpad={numpad}
						onNumpadChange={val => setNumpad(n => ({...n, value: val}))}
						onNumpadClose={handleNumpadClose}
					/>
					<OrderTotals
						subtotal={calcSubtotal}
						commission={commission}
						total={calcAmount}
					/>
					<OrderActions
						order={order}
						user={user}
						isEditable={isEditable}
						onClear={() => setNewOrderItems([])}
						onSave={handleSave}
						onUpdateStatus={handleUpdateStatus}
					/>
				</div>
				<MenuComponent
					menuItems={menuItems}
					activeTab={activeTab}
					onTabChange={setActiveTab}
					search={search}
					onSearchChange={setSearch}
					onAddItem={addItem}
					isEditable={isEditable}
				/>
			</div>
		</div>
	);
}
