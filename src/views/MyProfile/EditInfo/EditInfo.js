// core
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

// Components
import Card from "../../../components/Card";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress, TextField, FormControl } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import PasswordIcon from '@material-ui/icons/VpnKey';


// styles
import styles from "./EditInfo.module.scss";

// url;
import { baseUrl } from "../../../config";


export default function EditInfo({currentUser, currentUserSetter, updateStateHandler, editInforHandler})  {

    let abortCont = new AbortController(),
        { authToken } = useAuth(),
        [updateButtonEnabled, setUpdateButtonEnabled] = useState(false),
        [changePassword, setChangePassword] = useState(false),
        [isLoading, setIsLoading] = useState(false),

        // change password message,
        [passwordMessage, setPasswordMessage] = useState(null),
        [passwordMessageType, setPasswordMessageType] = useState(null),

        // data for submission
        [firstName, setFirstName] = useState(currentUser.firstName),
        [lastName, setLastName] = useState(currentUser.lastName),
        [password, setPassword] = useState(null),
        [passwordConf, setPasswordConf] = useState(null);



    
    const inputChangeHandler = (propName, e) => {
        e.preventDefault();
        let setter = propName === "firstName" ? setFirstName : setLastName;
        setter(prev => e.target.value);
    }

    const cancelEditHandler = () => {
        editInforHandler(prev => false);
    }

    

    const changePasswordHandler = (value, e) => {
        e.preventDefault();
        setChangePassword(prev => value);
        setPassword(null);
        setPasswordConf(null);
    }

    const passwordInputChangeHandler = (propName, e) => {
        let setter = propName === "password" ? setPassword : setPasswordConf;
        setter(prev => e.target.value);
    }

    // update request submission
    const updateUserHandler = () => {

        let obj = password ? {firstName, lastName, password} : {firstName, lastName};

        updateStateHandler(true, "Currently updating your info...", "info");
        setIsLoading(true);

        fetch(`${baseUrl}/api/users/${currentUser._id}`,    {
            method : "PUT",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify(obj),
            signal : abortCont.signal,
        })
            .then(res => res.json())
            .then(data => {
                updateStateHandler(false, "We have successfully updated your info!", "success");
                setIsLoading(false);
                currentUserSetter(prev => {
                    return {
                        ...prev,
                        firstName,
                        lastName,
                    }
                });
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    updateStateHandler(false, err.message, "error");
                    setIsLoading(false);
                }   
            });


    }

    useEffect(() => {

        if(changePassword && password && passwordConf) {
            if(password === passwordConf)   {
                if(password.trim().length >= 8) {
                    setUpdateButtonEnabled(true);
                    setPasswordMessage("Passwords met the number of required characters, and both of them matched.");
                    setPasswordMessageType("success");
                } else  {
                    setUpdateButtonEnabled(false);
                    setPasswordMessage("Password requires a minimum of 8 characters.");
                    setPasswordMessageType("error");
                }
            } else  {
                setUpdateButtonEnabled(false);
                setPasswordMessage("Please type the same password on both fields.");
                setPasswordMessageType("error");
            }
        } else if(firstName !== currentUser.firstName || lastName !== currentUser.lastName) {
            setUpdateButtonEnabled(true);
        } else  {
            setUpdateButtonEnabled(false);
        }


        return () => abortCont.abort();
    }, [changePassword, firstName, lastName, password, passwordConf]);
    

    return (
        <Card>
            <div className={styles["edit-user-field-container"]}>
                <FormControl fullWidth>
                    <TextField 
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={firstName} 
                        label="First Name" 
                        onChange={inputChangeHandler.bind(this, "firstName")}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField 
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={lastName} 
                        label="Last Name" 
                        onChange={inputChangeHandler.bind(this, "lastName")}
                    />
                </FormControl>
                {
                    changePassword && 
                    <>
                    <FormControl fullWidth>
                        <TextField 
                            InputLabelProps={{
                                shrink: true,
                            }}
                            label="Password" 
                            type="password"
                            value={password}
                            onChange={passwordInputChangeHandler.bind(this, "password")}
                        />
                    </FormControl>
                    <FormControl fullWidth>
                        <TextField 
                            InputLabelProps={{
                                shrink: true,
                            }}
                            label="Confirm Password" 
                            type="password"
                            value={passwordConf}
                            onChange={passwordInputChangeHandler.bind(this, "passwordConf")}
                        />
                        {passwordMessage && passwordMessageType === "error" && <p className={styles["error-message"]}>{passwordMessage}</p>}
                        {passwordMessage && passwordMessageType === "success" && <p className={styles["success-message"]}>{passwordMessage}</p>}
                    </FormControl>
                    </>
                }
            </div>
            <Divider style={{margin : "1.4rem 0"}} />
            <div className={styles["buttons-container-main"]}>
                {!isLoading &&
                    <Button onClick={cancelEditHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                        Cancel
                    </Button>
                }
                {isLoading &&
                    <Button onClick={cancelEditHandler} type="button" disabled variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                        Cancel
                    </Button>
                }
                { isLoading && 
                <>
                    {!changePassword && 
                        <Button onClick={changePasswordHandler.bind(this, true)} type="button" variant="contained" size="small" color="secondary" disableElevation disabled startIcon={<PasswordIcon />}>
                            Change Password
                        </Button>
                    }
                    {changePassword &&
                        <Button onClick={changePasswordHandler.bind(this, false)} type="button" variant="contained" size="small" disabled disableElevation startIcon={<PasswordIcon />}>
                            Keep Same Password
                        </Button>
                    }
                </>
                }
                { !isLoading && 
                    <>
                        {!changePassword && 
                            <Button onClick={changePasswordHandler.bind(this, true)} type="button" variant="contained" size="small" color="secondary" disableElevation style={{backgroundColor : "rgb(194 138 36)", color : "white"}} startIcon={<PasswordIcon />}>
                                Change Password
                            </Button>
                        }
                        {changePassword &&
                            <Button onClick={changePasswordHandler.bind(this, false)} type="button" variant="contained" size="small" style={{backgroundColor : "#67b5a6", color : "white"}} disableElevation startIcon={<PasswordIcon />}>
                                Keep Same Password
                            </Button>
                        }
                    </>
                }
                {!updateButtonEnabled && !isLoading && <Button disabled type="button" variant="contained" size="small" color="default" disableElevation startIcon={<SaveIcon />}>
                    Update My Info
                </Button>}
                {updateButtonEnabled && !isLoading && <Button type="button" onClick={updateUserHandler} variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />}>
                    Update My Info
                </Button>}
                {isLoading && <Button type="button" disabled onClick={updateUserHandler} variant="contained" size="small" color="primary" disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} />}>
                    Updating Info...
                </Button>}
            </div>
        </Card>
    )
}