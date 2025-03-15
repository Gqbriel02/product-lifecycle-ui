import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext.tsx";
import AdminLayout from "../AdminLayout/AdminLayout.tsx";

const AdminRoutes = () => {
    const { currentUser } = useContext(AuthContext)!;

    if (!currentUser || !currentUser.roles.some((role: any) => role.roleName === "Admin")) {
        return <Navigate to="/" />;
    }

    return (
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    );
};

export default AdminRoutes;
