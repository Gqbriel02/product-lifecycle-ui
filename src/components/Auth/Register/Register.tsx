import React, { useState, useContext, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Register.module.css";
import { AuthContext } from "../../../context/AuthContext.tsx";
import ErrorMessage from "../../Error/Error.tsx"

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
                {error && <ErrorMessage errorMessage={error}></ErrorMessage>}
                <form onSubmit={handleRegister} className={styles.registerForm}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={userDetails.name}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Username"
                        name="username"
                        value={userDetails.username}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        name="email"
                        value={userDetails.email}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={userDetails.password}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        value={userDetails.confirmPassword}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        name="phoneNumber"
                        value={userDetails.phoneNumber}
                        onChange={handleChange}
                        className={styles.registerInput}
                        required
                    />
                    <button type="submit" className={styles.registerButton}>Register</button>
                </form>
                <p className={styles.loginText}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
