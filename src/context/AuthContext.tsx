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
        const storedUser = localStorage.getItem("currentUser");

        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
            setLoading(false);
            return;
        }

        axios
            .get("http://localhost:8080/api/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            })
            .then((response) => {
                setCurrentUser(response.data);
            })
            .catch(() => {
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

            localStorage.setItem("token", response.data.token);
            setIsAuthenticated(true);

            const profileResponse = await axios.get("http://localhost:8080/api/users/profile", {
                headers: { Authorization: `Bearer ${response.data.token}` },
                withCredentials: true,
            });

            setCurrentUser(profileResponse.data);
            localStorage.setItem("currentUser", JSON.stringify(profileResponse.data));

            navigate("/");
        } catch (error: any) {
            if (error.response && error.response.status === 401) {
                throw new Error("Invalid username or password.");
            } else {
                throw new Error("Login failed. Please try again later.");
            }
        }
    };

    const register = async (name: string, username: string, email: string, password: string, phoneNumber: string) => {
        try {
            await axios.post("http://localhost:8080/api/auth/register", {
                name,
                username,
                email,
                password,
                phoneNumber,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });
        } catch (error: any) {
            if (error.response) {
                throw new Error(error.response.data || "Registration failed.");
            } else {
                throw new Error("Registration failed. Please try again.");
            }
        }
    };

    const logout = () => {
        console.log("Logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("currentUser");
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
