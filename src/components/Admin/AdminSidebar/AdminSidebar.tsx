import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "./AdminSidebar.module.css";

const AdminSidebar: React.FC = () => {
    const location = useLocation();

    return (
        <aside className={styles.sidebarPanel}>
            <h2>Admin Panel</h2>
            <nav>
                <ul>
                    <li className={location.pathname === "/admin/dashboard" ? styles.activePath : ""}>
                        <Link to="/admin/dashboard">Dashboard</Link>
                    </li>
                    <li className={location.pathname === "/admin/users" ? styles.activePath : ""}>
                        <Link to="/admin/users">Manage Users</Link>
                    </li>
                    <li className={location.pathname === "/admin/products" ? styles.activePath : ""}>
                        <Link to="/admin/products">Manage Products</Link>
                    </li>
                    <li className={location.pathname === "/admin/reports" ? styles.activePath : ""}>
                        <Link to="/admin/reports">Reports</Link>
                    </li>
                    <li className={location.pathname === "/admin/settings" ? styles.activePath : ""}>
                        <Link to="/admin/settings">Settings</Link>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
