import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { Orders, PlaceSelection, OrderDetails, Profile } from "../views";
import LogoutInvisiblePage from "../helpers/LogoutInvisiblePage/index.jsx";
import Inventory from "../views/Inventory/index.jsx";
import ProtectedRoute from "../components/ProtectedRoute.jsx";
import Crud from "../views/Inventory/Crud/index.jsx";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				index: true,
				element: <Orders />,
			},
			{
				path: "create-order",
				element: <PlaceSelection />,
			},
			{
				path: "order-details",
				element: <OrderDetails />,
			},
			{
				path: "profile",
				element: <Profile />,
			},
			{
				element: <ProtectedRoute allowedRoles={["admin"]} />,
				children: [
					{
						path: "/inventory",
						element: <Inventory />,
					},
				],
			},
			{
				element: <ProtectedRoute allowedRoles={["admin"]} />,
				children: [
					{
						path: "inventory/crud",
						element: <Crud />,
					},
				],
			},
			{
				path: "logout",
				element: <LogoutInvisiblePage />,
			},
		],
	},
]);

export default router;
