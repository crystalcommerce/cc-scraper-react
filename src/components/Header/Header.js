import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useWindowWidth from "../../hooks/useWindowWidth";

// styles
import styles from "./Header.module.scss";

export default function Header({loggedUser, className, openMenuHandler, menuActive}) {

    let windowWidth = useWindowWidth(() => {})

    const { logout } = useAuth();
    
    const logoutHandler = (e) => {
        // e.preventDefault();
        logout();
    }

    const menuClickHandler = (e) => {
        openMenuHandler();
    }

    return  (
        <header className={`${styles["main-header"]} ${className}`}>
            
            <h1>Welcome to CC Scraper App, <span>{loggedUser.firstName}</span>!</h1>
            {windowWidth < 768 && 
                <div className={styles["button-container"]}>
                    <div className={`${styles["nav-button"]} ${menuActive ? styles.active : null}`} onClick={menuClickHandler.bind(this)}>
                        <div className={styles["bar-container"]}>
                            <div className={styles["bar"]}></div>
                            <div className={styles["bar"]}></div>
                            <div className={styles["bar"]}></div>
                        </div>
                    </div>
                </div>
            }
            <nav className={styles["header-nav"]}>
                <ul>
                    <li>
                        <Link to="/my-profile">My Profile</Link>
                    </li>
                    <li>
                        <Link to="/login" onClick={logoutHandler}>Logout</Link>
                    </li>
                </ul>
            </nav>
        </header>
    )

}