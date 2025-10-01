import React from 'react'
import { useOrders } from '../../hooks/useOrders'
import OrderCard from '../../components/OrderCard'

const Orders = () => {
  const { orders, getOrders } = useOrders()
  React.useEffect(() => {
    console.log('Fetching orders...');
    
    getOrders()
  }, [getOrders])
  console.log(orders)
  return (
    // <ul>
    //   <li>Orders ({orders.length}): </li>
    //   {orders.map(order => (
    //     <li key={order.id}>{order.table}</li>
    //   ))}
    // </ul>
    <div className="p-3 w-full flex gap-2 flex-wrap justify-around ">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  )
}

export default Orders