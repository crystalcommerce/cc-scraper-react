// hooks
import { useState, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import useActiveMenu from "../hooks/useActiveMenu";

// routes
import mainNavObjectsArr from "../routes";

// components
import Header from "../components/Header";
import Main from "../components/Main";
import SiteLogo from "../components/SiteLogo";
import Sidebar from "../components/Sidebar";
import Nav from "../components/Nav";
import Footer from "../components/Footer";


import { useHistory } from "react-router";


// styles
import styles from "./Layout.module.scss";

export default function Layout({ children })  {

    let [active, setActive] = useState(true);
    
    useActiveMenu();

    const { isLoggedIn, loggedUser } = useAuth();

    const openMenuHandler = (e) => {
        setActive(prev => !prev);
    }


    return (
        <div className={styles.wrapper}>
            {isLoggedIn && loggedUser && 
            <>
                <div className={styles["main-section"] } onClick={() => {
                    if(active) setActive(prev => false);
                }}>
                    <Header loggedUser={loggedUser} className="card" openMenuHandler={openMenuHandler} menuActive={active}></Header>
                    <Main>{children}</Main>
                    <Footer></Footer>
                </div>
                <Sidebar className="card main-sidebar" menuActive={active}>
                    <SiteLogo></SiteLogo>
                    <Nav navObjectsArr={mainNavObjectsArr} className="main-nav" />
                </Sidebar>
            </>
            }
        </div>
    )
}