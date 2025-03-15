import React, { ReactNode } from "react";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import styles from "./AdminLayout.module.css";

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className={styles.adminContainer}>
            <AdminSidebar />
            <main className={styles.mainContent}>{children}</main>
        </div>
    );
};

export default AdminLayout;
