import {useState, useEffect} from "react";
import { Link } from "react-router-dom";

import styles from "./Nav.module.scss";
import "./Nav.scss";


export default function Nav({navObjectsArr, className}) {

    


    return (
        <nav className={`${styles.nav} ${className} nav`}>
            <ul>
                {navObjectsArr.length > 0 && 
                
                    navObjectsArr.map(item => {
                        return (
                            <li key={item.path}>
                                <Link key={item.path} to={item.path}>{item.title}</Link>
                                {item.children.length > 0 && 
                                    <ul>
                                        {item.children.map(child => {
                                            return (
                                                <li key={child.path}><Link to={child.path}>{child.title}</Link></li>
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

