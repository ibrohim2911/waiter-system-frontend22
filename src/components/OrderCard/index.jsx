
const OrderCard = ({order}) => {
	let sortedItems = {};
	// Status color mapping
	const getStatusColor = status => {
		switch (status) {
			case "pending":
				return "border-yellow-400 shadow-yellow-400/50";
			case "processing":
				return "border-blue-400 shadow-blue-400/50";
			case "completed":
				return "border-black";
			// case 'cancelled':
			//   return 'border-red-400 shadow-red-400/50';
			default:
				return "border-gray-400 shadow-gray-400/50";
		}
	};

	const formatDate = dateString => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return (
			date.toLocaleDateString() +
			" " +
			date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
		);
	};

	order.items.forEach(itm => {
		if (!sortedItems[itm.item_name]) {
			sortedItems[itm.item_name] = {
				total_price: 0,
				quantity: 0,
				item_price: itm.item_price,
			};
		}
		sortedItems[itm.item_name]["quantity"] += parseFloat(itm["quantity"]);
		sortedItems[itm.item_name]["total_price"] += parseFloat(itm["item_price"]) * parseFloat(itm["quantity"]);
	});

	return (
		<div
			className={`relative bg-zinc-800 text-zinc-100 rounded-lg shadow-lg p-4 my-2 w-full transition-all duration-300 hover:shadow-xl border-l-4 ${getStatusColor(
				order.order_status
			)} shadow-lg flex flex-col`}
		>
			{/* Glowing effect */}
			<div
				className={`absolute -left-1 top-0 bottom-0 w-1 rounded-l-lg ${getStatusColor(
					order.order_status
				)} blur-sm opacity-75`}
			></div>

			{/* Header */}
			<div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-600">
				<div className="flex flex-col">
					<h3 className="text-base font-bold text-zinc-100">
						Order #{order.id}
					</h3>
					<span
						className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
							order.order_status === "pending"
								? "bg-yellow-900 text-yellow-200"
								: order.order_status === "in_progress"
								? "bg-blue-900 text-blue-200"
								: order.order_status === "completed"
								? "bg-green-900 text-green-200"
								: // order.order_status === 'cancelled' ? 'bg-red-900 text-red-200' :
								  "bg-zinc-700 text-zinc-200"
						}`}
					>
						{order.order_status.replace("_", " ").toUpperCase()}
					</span>
				</div>
				<div className="text-right">
					<p className="text-xs text-zinc-400">Table</p>
					<p className="font-semibold text-base text-zinc-100">
						{order.table_details?.name || order.table}
					</p>
					{order.table_details?.location && (
						<p className="text-xs text-zinc-500">
							{order.table_details.location}
						</p>
					)}
				</div>
			</div>

			{/* Customer Info */}
			<div className="mb-3 flex items-center justify-between">
				<p className="text-xs text-zinc-400">Customer</p>
				<p className="font-medium text-sm text-zinc-100">
					{order.user_name || `User #${order.user}`}
				</p>
			</div>

			{/* Order Items */}
			<div className="mb-3 h-32 min-h-32">
				<p className="text-xs font-medium text-zinc-300 mb-1">Items</p>
				<div className="bg-zinc-700 rounded-md p-2 overflow-y-scroll no-scrollbar h-full">
					{order.items && order.items.length > 0 ? (
						<ul className="space-y-0.5">
							{Object.keys(sortedItems).map(key => {
								console.log("Rendering item:", key, sortedItems[key]);
								return (
									<li
										key={key}
										className="flex justify-between text-xs text-zinc-200"
									>
										<span className="flex gap-1 items-center">
											{key} <sub>x{sortedItems[key].quantity}</sub>
										</span>
										<span className="font-medium">
											{sortedItems[key].total_price} so'm
										</span>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="text-xs text-zinc-400 italic">No items yet</p>
					)}
				</div>
			</div>

			{/* Amount */}
			<div className="mb-3 bg-zinc-700 rounded-md p-2">
				<div className="flex justify-between text-xs mb-1">
					<span className="text-zinc-400">Subtotal:</span>
					<span className="text-zinc-200">{order.subamount} so'm</span>
				</div>
				{order.table_details?.commission && (
					<div className="flex justify-between text-xs mb-1">
						<span className="text-zinc-400">
							Commission ({order.table_details.commission}%):
						</span>
						<span className="text-zinc-200">
							{(parseFloat(order.amount) - parseFloat(order.subamount)).toFixed(
								2
							)}{" "}
							so'm
						</span>
					</div>
				)}
				<div className="flex justify-between font-bold text-sm border-t border-zinc-600 pt-1">
					<span className="text-zinc-100">Total:</span>
					<span className="text-green-400">{order.amount} so'm</span>
				</div>
			</div>

			{/* Timestamps */}
			<div className="text-xs text-zinc-500 space-y-0.5">
				<div className="flex justify-between">
					<span>Created:</span>
					<span>{formatDate(order.c_at)}</span>
				</div>
				<div className="flex justify-between">
					<span>Updated:</span>
					<span>{formatDate(order.u_at)}</span>
				</div>
			</div>
		</div>
	);
};

export default OrderCard;
