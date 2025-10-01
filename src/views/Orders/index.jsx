import React from "react";
import {useOrders} from "../../hooks/useOrders";
import OrderCard from "../../components/OrderCard";

const Orders = () => {
	const {orders, getOrders} = useOrders();
	React.useEffect(() => {
		console.log("Fetching orders...");

		getOrders();
	}, [getOrders]);
	return (
		<div className="p-3 w-full grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-center gap-6 min-h-screen bg-zinc-900 pb-20">
			{orders.map(order => (
				<OrderCard key={order.id} order={order} />
			))}
		</div>
	);
};

export default Orders;
