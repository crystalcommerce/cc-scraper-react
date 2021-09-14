// core
import { useHistory } from "react-router";
import { useEffect, useState } from "react";

// hooks
import useAuth from "../../../hooks/useAuth";

// Components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import Select from "../../../components/Select";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress, Modal, TextField, FormControl, InputAdornment } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import PasswordIcon from '@material-ui/icons/VpnKey';
import UsernameIcon from '@material-ui/icons/AccountCircle';


// styles
import styles from "./CreateUser.module.scss";

// url;
import { baseUrl } from "../../../config";

// utils
import { toCapitalizeAll, toNormalString } from "../../../utilities/string";
import { debounce } from "../../../utilities";


export default function CreateUser({pageTitle})    {

    let history = useHistory(),
        abortCont = new AbortController(),
        { authToken, loggedUser } = useAuth(),
        [user, setUser] = useState({
            firstName : null,
            lastName : null,
            username : null,
            password : null,
            permissionLevel : 2,
        }),
        [selectOptions, setSelectOptions] = useState([
            { name : "Staff", value : 2 },
            { name : "Developer", value : 3 },
            { name : "Administrator", value : 4 },
        ]),

        // save user states;
        [message, setMessage] = useState(null),
        [isLoading, setIsLoading] = useState(false),
        [messageType, setMessageType] = useState(null),
        [saveButtonEnabled, setSaveButtonEnabled] = useState(false),

        // username state checker
        [usernameCheckMessage, setUsernameCheckMessage] = useState(null),
        [usernameCheckLoading, setUsernameCheckLoading] = useState(false),
        [usernameCheckMessageType, setUsernameCheckMessageType] = useState(null);



    const inputChangeHandler = (propName, e) => {
        e.preventDefault();

        setUser(prev => {
            let obj = {
                ...prev,
                [propName] : e.target.value,
            }
            return obj;
        });

        if(propName === "username") {
            checkUsername(e.target.value);
        }
    }   


    const selectOnChangeHandler = (value) => {
        setUser(prev => {
            let obj = {
                ...prev,
                permissionLevel : value,
            }
            return obj;
        });
    }

    
    const cancelButtonHandler = () => {
        history.push("/manage-users/")
    }


    const checkUsername = debounce((value) => {
        if(!value.length) {
            setUsernameCheckMessage("Please enter a username");
            setUsernameCheckLoading(false);
            setUsernameCheckMessageType("info");
            setSaveButtonEnabled(false);
        } else  {
            setUsernameCheckMessage("Checking the uniqueness of entered username...");
            setUsernameCheckLoading(true);
            setUsernameCheckMessageType("info");
            setSaveButtonEnabled(false);


            fetch(`${baseUrl}/api/users/all?username=${value}`, {
                method : "GET",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken,
                },
                signal : abortCont.signal,
            })
                .then(res => res.json())
                .then(data => {
                    if(data.length) {
                        throw Error("This username is already in use.")
                    } else  {
                        setUsernameCheckMessage("Username is valid.");
                        setUsernameCheckLoading(false);
                        setUsernameCheckMessageType("success");
                        setSaveButtonEnabled(true);
                    }
                })
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        setUsernameCheckMessage(err.message);
                        setUsernameCheckLoading(true);
                        setUsernameCheckMessageType("info");
                    }
                });
        }
        
    }, 1400, false);


    const saveUserHandler = () => {

        setMessage("Saving User...");
        setIsLoading(true);
        setMessageType("info");
        setSaveButtonEnabled(false);

        fetch(`${baseUrl}/api/users`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify(user),
            signal : abortCont.signal,
        })
            .then(res => res.json())
            .then(data => {
                setMessage("We have successfully saved the user.");
                setIsLoading(false);
                setMessageType("info");
                setSaveButtonEnabled(false);

                let userId = data.data._id;

                setTimeout(() => history.push(`/manage-users/${userId}`), 2500);
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setMessage(err.message);
                    setIsLoading(false);
                    setMessageType("error");
                    setSaveButtonEnabled(true);
                }
            });

    }


    useEffect(() => {
        if(loggedUser)  {
            setSelectOptions(prev => {
                return prev.filter(item => item.value < loggedUser.permissionLevel);
            })
        }

    }, [loggedUser, user, usernameCheckMessage]);

    return (
        <EmptyCardFlex className={styles["main-container"]}>
                <h1 className="page-title">{pageTitle}</h1>
                {
                    message && 
                    <Alert severity={messageType}>{isLoading && <><CircularProgress style={{height: "20px", width : "20px"}}></CircularProgress>&nbsp;&nbsp;&nbsp; </>}
                        {message}
                    </Alert>
                }
            
                <EmptyCardFlex className={styles["main-cards-container"]}>
                    <Card>  
                        <div className={styles["create-user-field-container"]}>
                            <FormControl fullWidth className={styles["firstName"]}>
                                <TextField 
                                    value={user.firstName} 
                                    label="First Name" 
                                    onChange={inputChangeHandler.bind(this, "firstName")}
                                />
                            </FormControl>
                            <FormControl fullWidth className={styles["lastName"]}>
                                <TextField 
                                    value={user.lastName} 
                                    label="Last Name" 
                                    onChange={inputChangeHandler.bind(this, "lastName")}
                                />
                            </FormControl>
                            <FormControl fullWidth className={styles["username"]}>
                                <TextField 
                                    startAdornment={
                                        <InputAdornment position="start">
                                        <UsernameIcon />
                                        </InputAdornment>
                                    }
                                    value={user.username} 
                                    label="Username" 
                                    onChange={inputChangeHandler.bind(this, "username")}
                                />
                                {usernameCheckMessage && usernameCheckMessageType === "error" && <p className={styles["error-message"]}>{usernameCheckMessage}</p>}
                                {usernameCheckMessage && usernameCheckMessageType === "info" && usernameCheckLoading && <p className={styles["info-message"]}>{usernameCheckMessage}</p>}
                                {usernameCheckMessage && usernameCheckMessageType === "info" && !usernameCheckLoading && <p className={styles["info-message"]}>{usernameCheckMessage}</p>}
                                {usernameCheckMessage && usernameCheckMessageType === "success" && <p className={styles["success-message"]}>{usernameCheckMessage}</p>}
                            </FormControl>
                            <FormControl fullWidth className={styles["password"]}>
                                <TextField 
                                    startAdornment={
                                        <InputAdornment position="start">
                                        <PasswordIcon />
                                        </InputAdornment>
                                    }
                                    value={user.password} 
                                    label="Password" 
                                    onChange={inputChangeHandler.bind(this, "password")}
                                />
                            </FormControl>
                            <FormControl fullWidth className={styles["permissionLevel"]}>
                                <Select defaultValue={selectOptions.find(item => item.value === user.permissionLevel)} selectOnchangeHandler={selectOnChangeHandler} label="Permission / Access Level" options={selectOptions} uniqueProp="value" optionLabelProp="name" ></Select>
                            </FormControl>
                        </div>
                        
                        <Divider style={{margin : "1.4rem 0"}} />

                        <div className={styles["buttons-container-main"]}>
                            <Button onClick={cancelButtonHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                Cancel
                            </Button>
                            {!saveButtonEnabled && !isLoading && <Button disabled type="button" variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />}>
                                Save User
                            </Button>}

                            {!saveButtonEnabled && isLoading && <Button disabled type="button" variant="contained" size="small" color="primary" disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} />}>
                                Saving the User...
                            </Button>}
                            {saveButtonEnabled && !isLoading && <Button onclick={saveUserHandler} disabled type="button" variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />}>
                                Save User
                            </Button>}
                        </div>
                    </Card>
                </EmptyCardFlex>

        </EmptyCardFlex>
    )
}