
import React, { useState, useEffect } from "react";
import { useOrders } from "../../hooks/useOrders";
import OrderCard from "../../components/OrderCard";

const PAGE_SIZE = 8;
const ORDER_STATUSES = ["all", "pending", "processing", "completed"];

const Orders = () => {
	const { orders, getOrders, loading } = useOrders();
	const [page, setPage] = useState(1);
	const [orderStatus, setOrderStatus] = useState("all");
	const [total, setTotal] = useState(0);

		useEffect(() => {
			let params = {
				page,
				page_size: PAGE_SIZE,
			};
			// For 'all', show only pending and processing
				if (orderStatus === "all") {
					params.order_status = "pending,processing";
				} else if (orderStatus !== "all") {
					params.order_status = orderStatus;
				}
			getOrders(params).then(data => {
				if (data && (data.count || data.total)) setTotal(data.count || data.total);
			});
		}, [page, orderStatus, getOrders]);

	const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

	return (
		<div className="min-h-screen bg-zinc-900 pb-20">
			<div className="flex flex-wrap gap-2 p-3">
				{ORDER_STATUSES.map(status => (
					<button
						key={status}
						className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all
							${orderStatus === status ? "bg-blue-500 text-white" : "bg-zinc-700 text-zinc-200 hover:bg-blue-600 hover:text-white"}`}
						onClick={() => { setOrderStatus(status); setPage(1); }}
					>
						{status.charAt(0).toUpperCase() + status.slice(1)}
					</button>
				))}
			</div>
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
	);
};

export default Orders;
