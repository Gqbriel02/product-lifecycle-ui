import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import {AuthContext} from "./context/AuthContext.tsx";
import Loading from "./components/Loading/Loading.tsx";
import Navbar from "./components/Navbar/Navbar.tsx";
import Register from "./components/Auth/Register/Register.tsx";
import Content from "./components/Content/Content.tsx";
import Home from "./components/Home/Home.tsx";
import Login from "./components/Auth/Login/Login.tsx";
import AdminRoutes from "./components/Admin/AdminRoutes/AdminRoutes.tsx";
import AdminDashboard from "./components/Admin/AdminDashboard/AdminDashboard.tsx";
import ManageUsers from "./components/Admin/ManageUsers/ManageUsers.tsx";
import ManageProducts from "./components/Admin/ManageProducts/ManageProducts.tsx";
import Reports from "./components/Admin/Reports/Reports.tsx";
import Settings from "./components/Admin/Settings/Settings.tsx";
import Profile from "./components/Profile/Profile.tsx";
import ProductDetails from "./components/ProductDetails/ProductDetails.tsx";

const App: React.FC = () => {
    const { isAuthenticated, loading } = useContext(AuthContext)!;

    if (loading) {
        return <Loading />;
    }

    return (
        <>
            {isAuthenticated && <Navbar />}

            <Routes>
                <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

                <Route element={<Content />}>
                    <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/product/:productId" element={isAuthenticated ? <ProductDetails /> : <Navigate to="/login" />} />

                </Route>

                <Route element={<AdminRoutes />}>
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/users" element={<ManageUsers />} />
                    <Route path="/admin/products" element={<ManageProducts />} />
                    <Route path="/admin/reports" element={<Reports />} />
                    <Route path="/admin/settings" element={<Settings />} />
                </Route>
            </Routes>
        </>
    );
};

export default App;