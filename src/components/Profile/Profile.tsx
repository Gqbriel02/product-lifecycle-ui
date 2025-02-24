import React, { useEffect, useState, useContext } from "react";
import styles from "./Profile.module.css";
import { AuthContext } from "../../context/AuthContext";
import Loading from "../Loading/Loading.tsx";
import ProfileIcon from "../../assets/user-profile-icon.svg"
import ErrorComponent from "../Error/Error.tsx";

const Profile: React.FC = () => {
    const { isAuthenticated } = useContext(AuthContext)!;
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token is missing.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch("http://localhost:8080/api/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch user profile.");
                }

                const data = await response.json();
                setUser(data);
            } catch (err) {
                console.error("Error: ", err);
                setError("Could not load profile.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchProfile();
        }
    }, [isAuthenticated]);

    if (loading) return <Loading />;
    if (error) return <ErrorComponent errorMessage={error} />;

    return (
        <div className={styles.profileContainer}>
            <div className={styles.card}>
                <img src={ProfileIcon} alt="Profile" className={styles.profileImage}/>
                <h2>{user.name}</h2>
                <p><strong>Role:</strong> {user.roles.length > 0 ? user.roles[0].roleName : "No role"}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phoneNumber}</p>
            </div>
        </div>
    );
};

export default Profile;
