// hooks
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useHistory } from "react-router-dom";


// Components
import Card from "../../components/Card";
import { Button, TextField, FormControl, CircularProgress } from '@material-ui/core';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';



//config
import { baseUrl } from "../../config/"; 
import logo from "./logo.png";


import styles from "./Login.module.scss";

export default function Login() {
    
    const { login } = useAuth();

    let [username, setUsername] = useState(""),
        [password, setPassword] = useState(""),
        [loginMessage, setLoginMessage] = useState(null),
        [loggingIn, setLoggingIn] = useState(null),
        [messageType, setMessageType] = useState(null),
        history = useHistory(),
        abortCont = new AbortController();
    


    const onChangeHandler = (inputName, e) => {
        let setter = inputName === "username" ? setUsername : setPassword,
            value = e.target.value.trim();

        setter(prev => value);
    }

    const submitHandler = async (e) => {
        e.preventDefault();

        setLoggingIn(prev => true);
        setMessageType(prev => "info");
        
        
        fetch(`${baseUrl}/api/login`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
            },
            body : JSON.stringify({username, password}),
            signal : abortCont.signal
        })
        .then(res => {
            return res.json();
        })
        .then(jsonData => {
            let {statusOk, message} = jsonData;
            if(!statusOk)    {
                throw Error(message);
                
            } else  {
                login(jsonData);
                history.push("/");
                setLoggingIn(false);
                setLoginMessage(prev => "You have successfully logged in.");
                setMessageType(prev => "success");

            }
        })
        .catch(err => {
            if(err.name !== "AbortError")   {
                setLoggingIn(false);
                setLoginMessage(err.message);
                setMessageType(prev => "error");
            }
        });
        
    }

    useEffect(() => {

        return () => abortCont.abort();
    }, []);
    
    return (
        <div className={styles.login}>
            <div className={styles["main-container"]}>
                
                <Card className={styles["form-container"]}>
                    <div className={styles["logo-container"]}>
                        <img src={logo} className={styles["logo"]} /><h1 className={styles["site-name"]}>CC Scraper App</h1>
                    </div>
                    
                    <form action="" onSubmit={submitHandler.bind(this)}>
                    
                        <FormControl fullWidth>
                            <TextField value={username}onChange={onChangeHandler.bind(this, "username")} label="Username" />
                            {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                        </FormControl>
                        <FormControl fullWidth>
                            <TextField type="password" value={password}onChange={onChangeHandler.bind(this, "password")} label="Password" />
                            {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                        </FormControl>
                        {!loggingIn && <Button variant="contained" size="large" color="primary" disableElevation startIcon={<ExitToAppIcon />} type="submit">Login</Button>}
                        {loggingIn && <Button variant="contained" size="large" color="primary" disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}}></CircularProgress>} type="submit">Logging in...</Button>}
                    </form>
                    {loginMessage && messageType === "success" && <p className={styles["template-section-title"]}>{loginMessage}</p>}
                    {loginMessage && messageType === "error" && <p className={styles["error-message"]}>{loginMessage}</p>}
                </Card>
            </div>
        </div>
    )

}