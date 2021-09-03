import styles from "./Footer.module.scss";

export default function Footer({children})    {

    const year = new Date().getFullYear();

    return (
        <footer className={styles["main-footer"]}>
            {children}
            <p>&copy; CC Scraper App {year}. All Rights Reserved.</p>
        </footer>
    );
}