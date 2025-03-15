import React, { useEffect, useState, useContext } from "react";
import styles from "./Profile.module.css";
import { AuthContext } from "../../context/AuthContext";
import Loading from "../Loading/Loading.tsx";
import ProfileIcon from "../../assets/user-profile-icon.svg"
import ErrorComponent from "../Error/Error.tsx";
import axios from "axios";

interface Role {
    id: number;
    roleName: string;
}

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
    roles: Role[];
}

const Profile: React.FC = () => {
    const { isAuthenticated } = useContext(AuthContext)!;
    const [user, setUser] = useState<User | null>(null);
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
                const response = await axios.get("http://localhost:8080/api/users/profile", {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setUser(response.data);
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

    const userFields = [
        { label: "Name", value: user?.name },
        { label: "Username", value: user?.username },
        { label: "Email", value: user?.email },
        { label: "Phone", value: user?.phoneNumber },
        {
            label: "Roles",
            value:
                user?.roles && user?.roles?.length > 0
                    ? user?.roles.map((role) => role.roleName).join(", ")
                    : "No roles",
        },
    ];


    return (
        <div className={styles.profileContainer}>
            <div className={styles.card}>
                <img src={ProfileIcon} alt="Profile" className={styles.profileImage}/>

                {userFields.map((field, idx) => (
                    <p key={idx}>
                        <strong>{field.label}:</strong> {field.value}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default Profile;
