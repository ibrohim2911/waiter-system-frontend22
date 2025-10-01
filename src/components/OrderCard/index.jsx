const OrderCard = ({ order }) => {
  return (
    <div className="flex flex-col justify-between bg-zinc-800 h-75 text-zinc-100 rounded-2xl shadow-lg p-4 my-4 max-w-xs transition-shadow duration-200 hover:shadow-2xl">
      <div className="flex justify-between mb-1 text-sm">
        <div>
          <strong>Order ID:</strong> {order.id}
        </div>
        <div>
          <strong>User:</strong> {order.user_name || order.user}
        </div>
        <div>
          <strong>Table:</strong> {order.table_details.name}, {order.table_details.location}
        </div>
      </div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <div>
          <strong>Created:</strong> {order.c_at ? new Date(order.c_at).toLocaleString() : ''}
        </div>
        <div>
          <strong>Updated:</strong> {order.u_at ? new Date(order.u_at).toLocaleString() : ''}
        </div>
        <div>
          <strong>Status:</strong> {order.order_status}
        </div>
      </div>
      <div className="mb-1.5 flex-grow overflow-y-auto">
        <strong className="text-sm">Order Items:</strong>
        <ul className="ml-4 mt-1 list-disc text-sm">
          {order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <li key={item.id}>
                {item.item_name} x{item.quantity} - {item.item_price} so'm
              </li>
            ))
          ) : (
            <li>No items</li>
          )}
        </ul>
      </div>
      <div className="flex flex-col justify-between  font-bold text-lg ">
        <div>
          <small className="text-xs">Subamount: {order.subamount} so'm + {order.table_details.commission}%</small>
        </div>
        <div>
          <strong className="text-sm">Amount:</strong> {order.amount} so'm
        </div>
        
      </div>
    </div>
  );
};

export default OrderCard;
