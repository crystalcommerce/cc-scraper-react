import { useState, useEffect } from "react";
import { useHistory } from "react-router";

export default function useActiveMenu() {
    let setActiveParentMenu = useState(null)[1],
        setActiveChildMenu = useState(null)[1],
        [currentUrl, setCurrentUrl] = useState(null),
        history = useHistory();
        

    history.listen((location) => { 
        setCurrentUrl(prev => window.location.href);
    });

    window.addEventListener("click", function() {
        setCurrentUrl(prev => window.location.href);
    });

    window.addEventListener("load", function() {
        setCurrentUrl(prev => window.location.href);
    });

    window.addEventListener('popstate', function (e) {
        setCurrentUrl(prev => window.location.href);
        console.log("this fired...")
    });

    const activeMenuHandler = () => {
        let parentMenus = Array.from(document.querySelectorAll(`.main-sidebar > .main-nav > ul > li > a`)),
            childMenus = Array.from(document.querySelectorAll(`.main-sidebar > .main-nav > ul > li > ul > li a`));


        let activeParent = parentMenus.find(item => currentUrl.includes(item.href)),
            activeChild = childMenus.find(item => item.href === window.location.href);

        if(activeParent) {
            parentMenus.forEach(item => item.classList.remove(`active-parent`));
            childMenus.forEach(item => item.classList.remove(`active-child`));
            setActiveParentMenu(prev => activeParent);
            activeParent.classList.add(`active-parent`);
        } else  {
            parentMenus.forEach(item => item.classList.remove(`active-parent`));
            childMenus.forEach(item => item.classList.remove(`active-child`));
        }
        if(activeChild) {
            setActiveChildMenu(prev => activeChild)
            activeChild.classList.add(`active-child`);
        };


        return () => {
            parentMenus.forEach(item => item.classList.remove(`active-parent`));
            childMenus.forEach(item => item.classList.remove(`active-child`));
        }
    }


    useEffect(() => {
        activeMenuHandler();

    }, [currentUrl]);


    return { activeMenuHandler, currentUrl, setCurrentUrl };
}

