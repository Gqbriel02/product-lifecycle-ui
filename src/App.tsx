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
                </Route>
            </Routes>
        </>
    );
};

export default App;