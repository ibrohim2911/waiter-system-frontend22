import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // AuthContext import


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

  return (
    <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 flex justify-around items-center py-4 z-[1000]">
      <Link to="/orders" className="text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors">Orders</Link>
      <Link to="/create-order" className="text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors">Create Order</Link>
      <button onClick={handleLogout} className="text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors">Log Out</button>
      <button onClick={goBack} className="text-zinc-100 text-base px-4 py-2 hover:text-blue-400 transition-colors">Back</button>
    </div>
  );
};

export default BottomBar;
