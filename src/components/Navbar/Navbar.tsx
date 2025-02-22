import styles from './Navbar.module.css'
import {Link, useLocation, useNavigate} from "react-router-dom"
import {useContext} from "react";
import {AuthContext} from "../../context/AuthContext.tsx";
import LogoutIcon from "../../assets/logout.svg"

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, logout, currentUser } = useContext(AuthContext)!;

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

    return (
        <nav className={styles.navigation}>
            <div className={styles.links}>
                <Link to="/" onClick={handleHomeClick}> Home </Link>
            </div>
            <div className={styles['user-info']}>
                {currentUser && <span>{currentUser.username}</span>}
                <button className={styles['logout']} type="button" onClick={handleLogout}>
                    <img src={LogoutIcon} alt="logout"/>
                </button>
            </div>
        </nav>
    );
}

export default Navbar;