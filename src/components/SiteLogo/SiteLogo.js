// core
import { Link } from "react-router-dom";

// styles
import styles from "./SiteLogo.module.scss";

import logo from "./logo.png";

export default function SiteLogo()  {

    return (
        <h1 className={styles["site-logo"]}>
            <Link to="/">
            <img src={logo} />
            </Link>
            <Link to="/">
                CC Scraper App
            </Link>
        </h1>
    )

}