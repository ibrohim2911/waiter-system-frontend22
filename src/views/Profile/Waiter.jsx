import {
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { DateRangePicker } from "../../components";

const Waiter = ({ user }) => {
  const { logout } = useAuth();
  // const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [error, setError] = useState("");
  const [statsPeriod, setStatsPeriod] = useState({
    period: "day",
    startDate: new Date(),
    endDate: new Date(),
  });
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError("New passwords don't match.");
      return;
    }

    try {
      await changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password,
        confirm_password: passwords.confirm_password,
      });
      setPasswordSuccess("Password changed successfully!");
      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: "",
      }); // Clear fields on success
    } catch (err) {
      // Handle potential error messages from the API
      if (err && typeof err === "object" && err.detail) {
        setPasswordError(err.detail);
      } else if (err && typeof err === "object" && err.error) {
        setPasswordError(err.error);
      } else {
        setPasswordError(
          "Failed to change password. Please check the old password."
        );
      }
      console.error(err);
    }
    const totalamount = orderStats?.all_data?.[0]?.all_amount || 0;
    const totalEarned = orderStats?.all_data?.[0]?.all_earned || 0;
    const totalearned4 = totalEarned * 0.4;
  };
  return ( 
    <div className="max-h-screen bg-zinc-900 text-zinc-100 p-4 md:p-6 mb-14">
      <div className="max-w-7xl mx-auto grid  grid-cols-1 lg:grid-cols-4 gap-6 ">

      <div className="bg-zinc-800 rounded-lg shadow-xl p-4 mb-4">
        <div className="flex flex-col items-center">
          <UserCircleIcon className="h-16 w-16 text-blue-400 mb-2" />
          <h1 className="text-xl font-bold">{user?.name || user?.username}</h1>
          <p className="text-zinc-400 text-base capitalize">{user?.role}</p>
        </div>
        <div className="mt-4 border-t border-zinc-700 pt-4 space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold text-zinc-400">Phone:</span>
            <span className="text-zinc-200 text-sm">
              {user?.phone_number || "Not provided"}
            </span>
          </div>
        </div>
        <form
          onSubmit={handlePasswordChange}
          className="mt-4 border-t border-zinc-700 pt-4 space-y-3"
        >
          <h3 className="font-semibold text-zinc-300">Reset Password</h3>
          <input
            type="password"
            name="old_password"
            placeholder="Old Password"
            value={passwords.old_password}
            onChange={handlePasswordInputChange}
            className="w-full bg-zinc-700 text-white p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="new_password"
            placeholder="New Password"
            value={passwords.new_password}
            onChange={handlePasswordInputChange}
            className="w-full bg-zinc-700 text-white p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm New Password"
            value={passwords.confirm_password}
            onChange={handlePasswordInputChange}
            className="w-full bg-zinc-700 text-white p-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {passwordError && (
            <p className="text-red-400 text-xs">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="text-green-400 text-xs">{passwordSuccess}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            Update Password
          </button>
        </form>
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


      <div className=" mb-4">
        <div className="flex items-center gap-4">

        <h2 className="text-2xl font-bold text-zinc-200 flex items-center gap-2">
          <ChartBarIcon className="h-6 w-6" /> Statistics{" "}
        </h2>
        {/* Period Filter */}
        <div className="flex flex-wrap items-center gap-4">
          <DateRangePicker onChange={setStatsPeriod} />
        </div>
        </div>
      </div>

      {/* General Stats */}
      {/* <div className="mb-6 flex gap-6 justify-around">
        <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
          <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" />
          <br />
          <p className="text-zinc-400 text-sm">Total Earned</p>
          <p className="text-2xl font-bold text-white">
            ${totalEarned.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
          <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" />
          <br />
          <p className="text-zinc-400 text-sm">Total Earned</p>
          <p className="text-2xl font-bold text-white">
            ${totalearned4.toFixed(2)}
          </p>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg shadow-lg text-center">
          <CurrencyDollarIcon className="h-8 w-8 mx-auto text-green-400 mb-2" />
          <br />
          <p className="text-zinc-400 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-white">
            ${totalamount.toFixed(2)}
          </p>
        </div>
      </div> */}
      </div>
    </div>
  );
};

export default Waiter;
