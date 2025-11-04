import React, { useState, useEffect } from 'react';
import { me as getMe } from '../../services/getMe';
import { useAuth } from '../../context/AuthContext';
import { getOrderStats, getUserStats } from '../../services/statistics';
import { UserCircleIcon, ArrowLeftOnRectangleIcon, ChartBarIcon, CurrencyDollarIcon, ClipboardDocumentListIcon, UsersIcon, TableCellsIcon, CakeIcon } from '@heroicons/react/24/solid';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Admin = () => {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [error, setError] = useState('');
  const [statsPeriod, setStatsPeriod] = useState({ period: "day", startDate: new Date(), endDate: new Date() });

  const handlePeriodChange = (period) => {
    const now = new Date();
    let startDate = now;
    let endDate = now;
    let newPeriod = period;

    if (period === 'week') {
      startDate = startOfWeek(now);
      endDate = endOfWeek(now);
    } else if (period === 'month') {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    } else if (period === 'custom') {
      // For custom, we don't change dates here, user picks them.
      // We just set the period.
    }
    // For 'day', default values are correct.

    setStatsPeriod({ period: newPeriod, startDate, endDate });
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getMe();
        setUser(userData);

        setStatsLoading(true);
        const params = {
          period: statsPeriod.period,
        };
        if (statsPeriod.period === 'custom') {
          params.start_time = `${format(statsPeriod.startDate, 'yyyy-MM-dd')}T00:00:00`;
          params.end_time = `${format(statsPeriod.endDate, 'yyyy-MM-dd')}T23:59:59`;
        }

        const [orderData, usersData] = await Promise.all([
          getOrderStats(params),
          getUserStats(params)
        ]);
        setOrderStats(orderData); // Assuming orderData is the full object
        setUserStats(usersData.user_stats || []); // Access the nested user_stats array

      } catch (err) {
        setError('Failed to fetch data.');
        console.error(err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };
    fetchUser();
  }, [statsPeriod]);
  const totalamount = orderStats?.all_data?.[0]?.all_amount || 0;
  const totalEarned = orderStats?.all_data?.[0]?.all_earned || 0;
  const totalearned4 = totalEarned * 0.4
  if (loading || statsLoading) {
    return <div className="text-center text-zinc-300 p-10">Loading profile...</div>;
  }

  if (error || !user) {
    return <div className="text-center text-red-400 p-10">{error || 'User not found.'}</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-6 mb-14" >
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-800 rounded-lg shadow-xl p-4 mb-4">
          <div className="flex flex-col items-center">
            <UserCircleIcon className="h-16 w-16 text-blue-400 mb-2" />
            <h1 className="text-xl font-bold">{user.name || user.username}</h1>
            <p className="text-zinc-400 text-base capitalize">{user.role}</p>
          </div>
          <div className="mt-4 border-t border-zinc-700 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-400">Phone:</span>
              <span className="text-zinc-200 text-sm">{user.phone_number || 'Not provided'}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-700 pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-zinc-200 flex items-center gap-2"><ChartBarIcon className="h-6 w-6" /> Statistics </h2>
            {/* Period Filter */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg">
                {['day', 'week', 'month'].map(p => (
                  <button
                    key={p}
                    onClick={() => handlePeriodChange(p)}
                    className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors capitalize ${statsPeriod.period === p ? 'bg-blue-600 text-white' : 'text-zinc-300 hover:bg-zinc-700'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                  <DatePicker
                    selected={statsPeriod.startDate}
                    onChange={(date) => setStatsPeriod(prev => ({ ...prev, startDate: date, period: 'custom' }))}
                    selectsStart
                    startDate={statsPeriod.startDate}
                    endDate={statsPeriod.endDate}
                    className="bg-zinc-700 text-white p-2 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-zinc-400">to</span>
                  <DatePicker
                    selected={statsPeriod.endDate}
                    onChange={(date) => setStatsPeriod(prev => ({ ...prev, endDate: date, period: 'custom' }))}
                    selectsEnd
                    startDate={statsPeriod.startDate}
                    endDate={statsPeriod.endDate}
                    minDate={statsPeriod.startDate}
                    className="bg-zinc-700 text-white p-2 rounded-md w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
              </div>
            </div>
          </div>

          {/* General Stats */}
          <div className="mb-6 flex gap-6 justify-around">
            <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
              <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" /><br/>
              <p className="text-zinc-400 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-white">${totalEarned.toFixed(2)}</p>
            </div>
            
            <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
              <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" /><br/>
              <p className="text-zinc-400 text-sm">Total Earned</p>
              <p className="text-2xl font-bold text-white">${totalearned4.toFixed(2)}</p>
            </div>
          
            <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
              <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" /><br/>
              <p className="text-zinc-400 text-sm">Total Amount</p>
              <p className="text-2xl font-bold text-white">${totalamount.toFixed(2)}</p>
            </div>
          </div>
          {/* User Stats Table */}
          <div className="bg-zinc-800 p-4 rounded-lg shadow-lg mb-6">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3">User Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-zinc-300">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-700">
                  <tr>
                    <th scope="col" className="px-4 py-2">User</th>
                    <th scope="col" className="px-4 py-2 text-right">Completed</th>
                    <th scope="col" className="px-4 py-2 text-right">Pending</th>
                    <th scope="col" className="px-4 py-2 text-right">Commission</th>
                    <th scope="col" className="px-4 py-2 text-right">Total Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {userStats.map(u => (
                    <tr key={u.id} className="border-b border-zinc-700 hover:bg-zinc-700/50">
                      <td className="px-4 py-2 font-medium">{u.name}</td>
                      <td className="px-4 py-2 text-right">{u.completed_order_count}</td>
                      <td className="px-4 py-2 text-right">{u.non_completed_order_count}</td>
                      <td className="px-4 py-2 text-right">${u.earned.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right font-semibold">${u.total_earned.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Menu Item Stats */}
          <div className="bg-zinc-800 p-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-zinc-200 mb-3">Top Menu Items</h3>
            <ul className="space-y-2">
              {orderStats?.menu_items
                ?.filter(item => item.order_item_count > 0)
                .sort((a, b) => b.order_item_count - a.order_item_count)
                .map(item => (
                  <li key={item.menu_item_id} className="flex justify-between items-center bg-zinc-700/50 p-2 rounded">
                    <span className="font-medium text-zinc-200">{item.name}</span>
                    <span className="font-bold text-blue-400">{item.order_item_count} orders</span>
                  </li>
                ))
              }
            </ul>
          </div >

        </div>
      </div>
    </div>
  );
};

export default Admin;
