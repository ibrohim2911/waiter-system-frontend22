export const STATS_API_URL = `${import.meta.env.VITE_BASE_URL}order-stats/`;

export const INITIAL_STATS = {
	orders_per_user: [],
	pending_order_per_user: [],
	processing_order_per_user: [],
	orders_per_table_location: [],
	pending_order_per_location: [],
	processing_order_per_location: [],
};
