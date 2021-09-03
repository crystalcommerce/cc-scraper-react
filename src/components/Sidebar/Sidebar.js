import styles from "./Sidebar.module.scss";

export default function Sidebar({children, className, menuActive})   {
    return (
        <aside className={`${styles["main-sidebar"]} ${className} ${menuActive ? styles.active : ""}`}>
            {children}
        </aside>
    )
}