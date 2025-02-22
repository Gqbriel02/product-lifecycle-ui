import React, { useState, useContext, ChangeEvent } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Login.module.css";

const Login: React.FC = () => {
    const { login } = useContext(AuthContext)!;
    const [userCredentials, setUserCredentials] = useState<{ username: string; password: string }>({
        username: "",
        password: "",
    });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    function handleCredentials(e: ChangeEvent<HTMLInputElement>) {
        setUserCredentials({ ...userCredentials, [e.target.name]: e.target.value });
    }

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const { username, password } = userCredentials;

        if (!username || !password) {
            setError("Please fill in all fields.");
            return;
        }

        try {
            await login(username, password);
            setError("");
            navigate("/");
        } catch {
            setError("Invalid username or password.");
        }
    }

    return (
        <div className={styles.loginContainer}>
            <div className={styles.card}>
                <h2>Login</h2>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={userCredentials.username}
                        onChange={handleCredentials}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={userCredentials.password}
                        onChange={handleCredentials}
                        required
                    />
                    <button type="submit">Login</button>
                </form>
                <p className={styles.registerText}>
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
