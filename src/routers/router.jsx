// frontend/src/routers/router.jsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import Login from "../components/Login";
import Register from "../components/Register";
import CartPage from "../pages/products/CartPage";
import CheckoutPage from "../pages/products/CheckoutPage";
import SingleProduct from "../pages/products/SingleProduct";
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import AdminLogin from "../components/AdminLogin";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import AddProducts from "../pages/dashboard/addProduct/AddProducts";
import UpdateProduct from "../pages/dashboard/EditProduct/UpdateProduct";
import ManageProducts from "../pages/dashboard/manageProducts/ManageProducts";
import ManageOrders from "../pages/dashboard/ManageOrders";
import OrderDetail from "../pages/dashboard/OrderDetail";

// User Pages
import UserDashboard from "../pages/user/UserDashboard";
import UserOrders from "../pages/user/UserOrders";

// 🔥 NEW: Password Reset Pages
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <App />,
            children: [
                {
                    path: "/",
                    element: <Home />,
                },
                {
                    path: "/about",
                    element: <div>About</div>
                },
                {
                    path: "/login",
                    element: <Login />
                },
                {
                    path: "/register",
                    element: <Register />
                },
                // 🔥 NEW: Password Reset Routes
                {
                    path: "/forgot-password",
                    element: <ForgotPassword />
                },
                {
                    path: "/reset-password",
                    element: <ResetPassword />
                },
                {
                    path: "/cart",
                    element: <CartPage />
                },
                {
                    path: "/checkout",
                    element: <PrivateRoute><CheckoutPage /></PrivateRoute>
                },
                {
                    path: "/products/:id",
                    element: <SingleProduct />
                },
                {
                    path: "/product/:id",
                    element: <SingleProduct />
                },
                // User Routes - Cần đăng nhập
                {
                    path: "/user/dashboard",
                    element: <PrivateRoute><UserDashboard /></PrivateRoute>
                },
                {
                    path: "/user/orders",
                    element: <PrivateRoute><UserOrders /></PrivateRoute>
                }
            ]
        },
        // Admin routes - Standalone (không nằm trong App layout)
        {
            path: "/admin",
            element: <AdminLogin />
        },
        {
            path: "/admin-login",
            element: <AdminLogin />
        },
        {
            path: "/dashboard",
            element: <AdminRoute><AdminDashboard /></AdminRoute>
        },
        // 🔥 FIX: Đổi thành /dashboard/products/add
        {
            path: "/dashboard/products/add",
            element: <AdminRoute><AddProducts /></AdminRoute>
        },
        // 🔥 KEEP: Old route for backward compatibility
        {
            path: "/dashboard/add-product",
            element: <AdminRoute><AddProducts /></AdminRoute>
        },
        {
            path: "/dashboard/manage-products",
            element: <AdminRoute><ManageProducts /></AdminRoute>
        },
        // 🔥 FIX: Đổi thành /dashboard/products/edit/:id
        {
            path: "/dashboard/products/edit/:id",
            element: <AdminRoute><UpdateProduct /></AdminRoute>
        },
        // 🔥 KEEP: Old route for backward compatibility
        {
            path: "/dashboard/edit-product/:id",
            element: <AdminRoute><UpdateProduct /></AdminRoute>
        },
        // Order Management Routes
        {
            path: "/dashboard/manage-orders",
            element: <AdminRoute><ManageOrders /></AdminRoute>
        },
        {
            path: "/dashboard/orders/:id",
            element: <AdminRoute><OrderDetail /></AdminRoute>
        }
    ],
    {
        future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }
    }
);

export default router;