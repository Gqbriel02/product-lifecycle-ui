import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    isAuthenticated: boolean;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: any;
    setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
    loading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name:string, username: string, email: string, password: string, phoneNumber: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("No token found, user is not authenticated.");
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        setIsAuthenticated(true);

        axios
            .get("http://localhost:8080/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((response) => {
                console.log("User session restored:", response.data);
                setCurrentUser(response.data);
            })
            .catch((error) => {
                console.error("Session validation failed:", error);
                setIsAuthenticated(false);
                localStorage.removeItem("token");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post("http://localhost:8080/api/auth/login", { username, password });

            console.log("Login successful, setting token:", response.data.token);
            localStorage.setItem("token", response.data.token);
            setIsAuthenticated(true);

            const profileResponse = await axios.get("http://localhost:8080/api/users/profile", {
                headers: { Authorization: `Bearer ${response.data.token}` },
                withCredentials: true,
            });

            console.log("User profile loaded:", profileResponse.data);
            setCurrentUser(profileResponse.data);

            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
            throw new Error("Login failed");
        }
    };

    const register = async (name: string, username: string, email: string, password: string, phoneNumber: string) => {
        try {
            const response = await axios.post("http://localhost:8080/api/auth/register", {
                name,
                username,
                email,
                password,
                phoneNumber,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });
            console.log("Registration successful", response.data);
        } catch (error) {
            console.error("Registration failed:", error);
            throw new Error("Registration failed");
        }
    };

    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser, loading, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
