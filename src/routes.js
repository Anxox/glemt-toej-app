// routes.js
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./PrivateRoute"; // Importer din PrivateRoute

const routes = [
    { path: "/", element: <Login /> },
    { path: "/dashboard", element: <PrivateRoute><Dashboard /></PrivateRoute> },
    // ... andre ruter
];

export default routes;