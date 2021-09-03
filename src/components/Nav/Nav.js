import {useState, useEffect} from "react";
import { Link } from "react-router-dom";

import styles from "./Nav.module.scss";
import "./Nav.scss";


export default function Nav({navObjectsArr, className}) {

    let [activeParentMenu, setActiveParentMenu] = useState(null),
        [activeChildMenu, setActiveChildMenu] = useState(null),
        [currentUrl, setCurrentUrl] = useState(window.location.href)
        
    useEffect(() => {
        let parentMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > a`)),
            childMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > ul > li a`));

        parentMenus.forEach(item => item.classList.remove(`active-parent`));
        childMenus.forEach(item => item.classList.remove(`active-child`));

        let activeParent = parentMenus.find(item => currentUrl.includes(item.href)),
            activeChild = childMenus.find(item => item.href === window.location.href);

        if(activeParent) {
            setActiveParentMenu(prev => activeParent);
            activeParent.classList.add(`active-parent`);
        }
        if(activeChild) {
            setActiveChildMenu(prev => activeChild)
            activeChild.classList.add(`active-child`);
        };

    }, [currentUrl]);

    const setActiveParentHandler = (e) => {

        let parentMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > a`)),
            childMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > ul > li a`));

        parentMenus.forEach(item => item.classList.remove(`active-parent`));
        childMenus.forEach(item => item.classList.remove(`active-child`));
        e.target.classList.add(`active-parent`);
    }

    const setActiveChildHandler = (e) => {
        let parentMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > a`)),
            childMenus = Array.from(document.querySelectorAll(`.${styles.nav} > ul > li > ul > li a`));
            
        parentMenus.forEach(item => item.classList.remove(`active-parent`));
        childMenus.forEach(item => item.classList.remove(`active-child`));
        e.target.classList.add(`active-child`);
        e.target.parentElement.parentElement.parentElement.querySelector("a").classList.add("active-parent");
    }

    return (
        <nav className={`${styles.nav} ${className} nav`}>
            <ul>
                {navObjectsArr.length > 0 && 
                
                    navObjectsArr.map(item => {
                        return (
                            <li key={item.path}>
                                <Link onClick={setActiveParentHandler.bind(this)} key={item.path} to={item.path}>{item.title}</Link>
                                {item.children.length > 0 && 
                                    <ul>
                                        {item.children.map(child => {
                                            return (
                                                <li key={child.path}><Link onClick={setActiveChildHandler.bind(this)} to={child.path}>{child.title}</Link></li>
                                            )
                                        })}
                                    </ul>
                                }
                            </li>
                        );
                    })
                }
            </ul>
        </nav>
    )
}

