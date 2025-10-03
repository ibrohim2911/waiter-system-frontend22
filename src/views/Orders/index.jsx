
import React, { useState, useEffect } from "react";
import { useOrders } from "../../hooks/useOrders";
import OrderCard from "../../components/OrderCard";
import { getAllTables } from "../../services/tables";
import { getAllUsers } from "../../services/users";

const PAGE_SIZE = 8;
const ORDER_STATUSES = ["pending", "processing", "completed"];


const Orders = () => {
	const { orders, getOrders, loading } = useOrders();
	const [page, setPage] = useState(1);
	const [orderStatuses, setOrderStatuses] = useState(["pending", "processing"]);
	const [total, setTotal] = useState(0);
	const [locations, setLocations] = useState([]);
	const [selectedLocation, setSelectedLocation] = useState("");
	const [users, setUsers] = useState([]);
	const [selectedUser, setSelectedUser] = useState("");

	useEffect(() => {
		getAllTables().then(tables => {
			const uniqueLocations = [...new Set(tables.map(t => t.location))].filter(Boolean).sort();
			setLocations(uniqueLocations);
		});
		getAllUsers().then(users => setUsers(users));
	}, []);

	useEffect(() => {
			let params = {
			page,
			page_size: PAGE_SIZE,
		};
		if (orderStatuses.length > 0) {
			params.order_status = orderStatuses.join(",");
		}
		if (selectedLocation) {
			params["table__location"] = selectedLocation;
		}
		if (selectedUser) {
			params["user"] = selectedUser;
		}
		getOrders(params).then(data => {
			if (data && (data.count || data.total)) setTotal(data.count || data.total);
		});
	}, [page, orderStatuses, selectedLocation, selectedUser, getOrders]);

	const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

	return (
		<div className="min-h-screen bg-zinc-900 pb-20 flex">
			{/* Sidebar Filters */}
			<div className="w-80 bg-zinc-800 border-r border-zinc-700 flex flex-col h-full p-4">
				<h2 className="text-zinc-100 text-lg font-bold mb-4">Filter Orders</h2>
				{/* Location Filter */}
				<div className="mb-6">
					<div className="text-zinc-300 font-semibold mb-2">Location</div>
					<div className="space-y-2">
						{locations.map(location => (
							<div
								key={location}
								className={`cursor-pointer rounded-lg p-2 transition-all border-2 ${selectedLocation === location ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600"}`}
								onClick={() => setSelectedLocation(selectedLocation === location ? "" : location)}
							>
								{location}
							</div>
						))}
					</div>
					{selectedLocation && (
						<button className="mt-2 text-blue-300 hover:text-blue-100 text-sm" onClick={() => setSelectedLocation("")}>Clear Location</button>
					)}
				</div>
				{/* User Filter */}
				<div className="mb-6">
					<div className="text-zinc-300 font-semibold mb-2">User</div>
					<select
						className="w-full p-2 rounded bg-zinc-900 text-zinc-100 border border-zinc-700"
						value={selectedUser}
						onChange={e => setSelectedUser(e.target.value)}
					>
						<option value="">All Users</option>
						{users.map(user => (
							<option key={user.id} value={user.id}>{user.username || user.name || user.id}</option>
						))}
					</select>
				</div>
				{/* Status Filter */}
				<div className="mb-6">
					<div className="text-zinc-300 font-semibold mb-2">Status</div>
					<div className="flex flex-wrap gap-2">
						{ORDER_STATUSES.map(status => {
							const checked = orderStatuses.includes(status);
							return (
								<button
									key={status}
									className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
										${checked ? "bg-blue-500 text-white border-2 border-blue-400" : "bg-zinc-700 text-zinc-200 hover:bg-blue-600 hover:text-white"}`}
									onClick={() => {
										setPage(1);
										setOrderStatuses(prev =>
											prev.includes(status)
												? prev.filter(s => s !== status)
												: [...prev, status]
										);
									}}
								>
									<span className={`inline-block w-4 h-4 border rounded mr-1 ${checked ? "bg-white border-blue-400" : "border-zinc-400"}`}>{checked ? <span className="block w-2 h-2 mx-auto my-auto bg-blue-500 rounded"></span> : null}</span>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</button>
							);
						})}
					</div>
				</div>
			</div>
			{/* Orders List */}
			<div className="flex-1">
				<div className="p-3 w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center gap-6">
					{loading ? (
						<div className="col-span-full text-center text-zinc-300">Loading...</div>
					) : orders.length ? (
						orders.map(order => <OrderCard key={order.id} order={order} />)
					) : (
						<div className="col-span-full text-center text-zinc-400">No orders found.</div>
					)}
				</div>
				{/* Pagination */}
				<div className="flex justify-center gap-2 mt-4">
					<button
						className="px-3 py-1 rounded bg-zinc-700 text-zinc-200 disabled:opacity-50"
						onClick={() => setPage(p => Math.max(1, p - 1))}
						disabled={page === 1}
					>
						Previous
					</button>
					<span className="px-3 py-1 text-zinc-300">Page {page} of {totalPages}</span>
					<button
						className="px-3 py-1 rounded bg-zinc-700 text-zinc-200 disabled:opacity-50"
						onClick={() => setPage(p => Math.min(totalPages, p + 1))}
						disabled={page === totalPages}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
};

export default Orders;
