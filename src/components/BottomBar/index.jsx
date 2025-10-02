
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { HomeIcon, PlusCircleIcon, ArrowLeftOnRectangleIcon, ArrowUturnLeftIcon } from "@heroicons/react/24/outline";


const BottomBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); // logout function from context

  if (location.pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    logout(); // context orqali logout
    navigate("/login");
  };

  const goBack = () => {
    navigate(-1);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full max-h-20 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center py-1 z-[1000]">
      <Link
        to="/"
        className={`flex flex-col items-center text-base px-4 py-2 rounded-lg transition-all
          ${isActive("/") ? "bg-blue-500 text-white font-bold shadow-lg" : "text-zinc-100 hover:text-blue-400"}`}
      >
        <HomeIcon className="h-6 w-6 mb-1" />
        Orders
      </Link>
      <Link
        to="/create-order"
        className={`flex flex-col items-center text-base px-4 py-2 rounded-lg transition-all
          ${isActive("/create-order") ? "bg-blue-500 text-white font-bold shadow-lg" : "text-zinc-100 hover:text-blue-400"}`}
      >
        <PlusCircleIcon className="h-6 w-6 mb-1" />
        Create Order
      </Link>
      <button
        onClick={handleLogout}
        className="flex flex-col items-center text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors"
      >
        <ArrowLeftOnRectangleIcon className="h-6 w-6 mb-1" />
        Log Out
      </button>
      <button
        onClick={goBack}
        className="flex flex-col items-center text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors"
      >
        <ArrowUturnLeftIcon className="h-6 w-6 mb-1" />
        Back
      </button>
    </div>
  );
}
export default BottomBar;