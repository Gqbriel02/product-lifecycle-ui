import React, { useState, useContext, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { AuthContext } from "../../../context/AuthContext.tsx";

const Register: React.FC = () => {
    const { register } = useContext(AuthContext)!;
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
    });
    const [error, setError] = useState("");

    function handleChange(e: ChangeEvent<HTMLInputElement>) {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();
        const { name, username, email, password, confirmPassword, phoneNumber } = userDetails;

        if (!name || !username || !email || !password || !confirmPassword || !phoneNumber) {
            setError("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            await register(name, username, email, password, phoneNumber);
            setError("");
            navigate("/login");
        } catch {
            setError("Registration failed. Try again.");
        }
    }

    return (
        <div className={styles.registerContainer}>
            <div className={styles.card}>
                <h2>Register</h2>
                {error && <p className={styles.error}>{error}</p>}
                <form onSubmit={handleRegister}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={userDetails.name}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={userDetails.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={userDetails.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={userDetails.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={userDetails.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        name="phoneNumber"
                        value={userDetails.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit">Register</button>
                </form>
                <p className={styles.loginText}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
