import { useAuth } from "./context/AuthContext";
import { Login } from "./views";
import AppLayout from "./layouts/AppLayout";

function App() {
	const { token } = useAuth();

	if (!token) {
		return (
			<div className="min-h-screen bg-zinc-900">
				<Login />
			</div>
		);
	}

	return <AppLayout />;
}

export default App;
