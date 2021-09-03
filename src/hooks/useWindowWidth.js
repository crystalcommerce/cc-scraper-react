import { useState, useEffect } from "react";

export default function useWindowWidth(callback)    {
    let [windowWidth, setWindowWidth] = useState(window.innerWidth);


    useEffect(() => {
        window.addEventListener("resize", function(){
            setWindowWidth(window.innerWidth);
        });
        window.addEventListener("load", function(){
            setWindowWidth(window.innerWidth);
        });

        callback();
    });

    return windowWidth;
}



