import styles from './Navbar.module.css'
import {Link, useLocation, useNavigate} from "react-router-dom"
import {useContext, useState} from "react";
import {AuthContext} from "../../context/AuthContext.tsx";
import LogoutIcon from "../../assets/logout.svg"

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, currentUser } = useContext(AuthContext)!;
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (!isAuthenticated) {
        return null;
    }

    const handleLogout = async () => {
        try {
            logout();
            navigate("/login");
        } catch (error) {
            console.error("Failed to sign out:", error);
        }
    };

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        if (location.pathname === "/") {
            window.location.reload();
        } else {
            navigate("/", {replace: true});
        }
    };

    const handleLinkClick = () => {
        setDropdownOpen(false);
    };

    return (
        <nav className={styles.navigation}>
            <div className={styles.links}>
                <Link to="/" onClick={handleHomeClick}> Home </Link>
            </div>
            <h2>Product Lifecycle Management System</h2>
            <div className={styles.userSection}>
                {currentUser && (
                    <div className={styles.userMenu}>
                        <button className={styles.userName} onClick={() => setDropdownOpen(!dropdownOpen)}>
                            {currentUser.name}
                        </button>
                        {dropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link to="/profile" onClick={handleLinkClick}>Profile</Link>
                                {currentUser.roles.some((role: any) => role.roleName === "Admin") && (
                                    <Link to="/admin" onClick={handleLinkClick}>Admin Dashboard</Link>
                                )}
                                <button onClick={handleLogout} className={styles.logoutButton}>
                                    <img src={LogoutIcon} alt="logout"/>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;