const LocationFilter = ({ locations, stats, selectedLocation, onSelect, onClear }) => (
	<div className="mb-3">
		<div className="text-zinc-300 font-semibold mb-2">Location</div>
		<div className="space-y-2">
			{locations.map(location => {
				const locationStat = stats.orders_per_table_location.find(l => l.table__location === location);
				const pendingStat = stats.pending_order_per_location.find(l => l.table__location === location);
				const processingStat = stats.processing_order_per_location.find(l => l.table__location === location);
				return (
					<div
						key={location}
						className={`cursor-pointer rounded-lg p-2 transition-all border-2 flex items-center justify-between ${selectedLocation === location ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600"}`}
						onClick={() => onSelect(location)}
					>
						<span>{location}</span>
						<span className="ml-2 text-xs font-bold text-blue-300">{pendingStat?.order_count || 0} / {processingStat?.order_count || 0}</span>
					</div>
				);
			})}
		</div>
		{selectedLocation && (
			<button className="mt-2 text-blue-300 hover:text-blue-100 text-sm" onClick={onClear}>Clear Location</button>
		)}
	</div>
);

export default LocationFilter;
