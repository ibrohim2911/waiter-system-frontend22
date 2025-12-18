const UserFilter = ({ users, stats, selectedUser, onSelect }) => (
	<div className="mb-3">
		<div className="text-zinc-300 font-semibold mb-2">User</div>
		<div className="space-y-2">
			{users.map(user => {
				const pending = stats.pending_order_per_user.find(u => String(u.user_id) === String(user.id));
				const processing = stats.processing_order_per_user.find(u => String(u.user_id) === String(user.id));
				return (
					<div
						key={user.id}
						className={`cursor-pointer rounded-lg p-2 transition-all border-2 flex items-center justify-between ${selectedUser === String(user.id) ? "bg-blue-600 border-blue-400 text-white" : "bg-zinc-700 border-zinc-600 text-zinc-200 hover:bg-zinc-600"}`}
						onClick={() => onSelect(String(user.id))}
					>
						<span>{user.username || user.name || user.id}</span>
						<span className="ml-2 text-xs font-bold text-blue-300">{pending?.pending_order_count || 0} / {processing?.processing_order_count || 0}</span>
					</div>
				);
			})}
		</div>
	</div>
);

export default UserFilter;
