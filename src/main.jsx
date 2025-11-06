import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import {AuthProvider} from "./context/AuthContext.jsx";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import {Orders, PlaceSelection, OrderDetails, Profile} from "./views";

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
		],
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</StrictMode>
);
