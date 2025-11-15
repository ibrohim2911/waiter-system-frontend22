import { useAuth } from "./context/AuthContext";
import { Login } from "./views";
import { Outlet } from "react-router-dom";
import { BottomBar } from "./components";

function App() {
	const { token } = useAuth();

	if (!token) {
		return (
			<div className="min-h-screen bg-zinc-900">
				<Login />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-zinc-900">
			<Outlet />
			<BottomBar />
		</div>
	);
}

export default App;
