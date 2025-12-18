import { Outlet } from "react-router-dom";
import { BottomBar } from "../components";

const AppLayout = () => (
	<div className="min-h-screen bg-zinc-900">
		<Outlet />
		<BottomBar />
	</div>
);

export default AppLayout;
