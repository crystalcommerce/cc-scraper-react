import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

export default function useAuth()   {
    let [isLoggedIn, setIsLoggedIn] = useState(false),
        [loggedUser, setLoggedUser] = useState(null),
        [authToken, setAuthToken] = useState(window.localStorage.getItem("x-auth-token")),
        [fileToken, setFileToken] = useState(window.localStorage.getItem("x-file-token")),
        [tokenExpiration, setTokenExpiration] = useState(window.localStorage.getItem("x-token-expiration") || 0),
        [loginMessage, setLoginMessage] = useState(null),
        history = useHistory();
        

    const logout = () => {
        setIsLoggedIn(prev => false);
        setLoginMessage(prev => null);
        setAuthToken(prev => null);
        setFileToken(prev => null);
        setLoggedUser(prev => null);
        setTokenExpiration(prev => 0);

        window.localStorage.removeItem("x-auth-token");
        window.localStorage.removeItem("x-file-token");
        window.localStorage.removeItem("x-logged-user");
        window.localStorage.removeItem("x-token-expiration");
    }


    const login = (res) => {
        let {authToken : xAuthToken, fileToken : xFileToken, tokenExpiration : xTokenExpiration, userInfo, statusOk, message} = res;

        if(statusOk)    {
            setIsLoggedIn(prev => statusOk);
            setLoginMessage(prev => message);
            setAuthToken(prev => {
                window.localStorage.setItem("x-auth-token", xAuthToken);
                return xAuthToken
            });
            setFileToken(prev => {
                window.localStorage.setItem("x-file-token", xFileToken);
                return xFileToken
            });
            setLoggedUser(prev => {
                window.localStorage.setItem("x-logged-user", JSON.stringify(userInfo, null, 4));
                return userInfo
            });
            setTokenExpiration(prev => {
                window.localStorage.setItem("x-token-expiration", Number(xTokenExpiration));
                return Number(xTokenExpiration);
            });

            

        }  else {
            setIsLoggedIn(prev => false);
            logout();

        }

        return {authToken, fileToken, loggedUser, isLoggedIn, loginMessage};
        
    }

    const checkLoggedIn = () => {
        
        if( new Date().getTime() < Number(tokenExpiration) )   {
            setIsLoggedIn(prev => {
                setLoggedUser(prev => {
                    return JSON.parse(window.localStorage.getItem("x-logged-user"));
                });
                return true;
            });


            if(window.location.pathname === "/login")   {
                history.push("/");
            }


        } else  {
            setIsLoggedIn(prev => false);
            setLoginMessage(prev => null);
            setAuthToken(prev => null);
            setFileToken(prev => null);
            setLoggedUser(prev => null);
            setTokenExpiration(prev => 0)

            window.localStorage.removeItem("x-auth-token");
            window.localStorage.removeItem("x-file-token");
            window.localStorage.removeItem("x-logged-user");
            window.localStorage.removeItem("x-token-expiration");
            history.push("/login");

        }

    }
    
    useEffect(() => {
        checkLoggedIn();

        // return () => console.log("Authentication checked.");
    }, [isLoggedIn]);


    return {authToken, fileToken, loggedUser, isLoggedIn, loginMessage, login, logout, checkLoggedIn};

}