// core
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

// Components
import Card from "../../../components/Card";
import Select from "../../../components/Select";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress, TextField, FormControl } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';


// styles
import styles from "./EditUser.module.scss";

// url;
import { baseUrl } from "../../../config";



export default function EditUser({loggedUser, user, editUserSetter, userSetter, updateStateHandler})  {

    let abortCont = new AbortController(),
        { authToken } = useAuth(),
        [initialValue, setInitialValue] = useState({...user}),
        [currentUser, setCurrentUser] = useState(user),
        selectOptions = [
            { name : "Staff", value : 2 },
            { name : "Developer", value : 3 },
            { name : "Administrator", value : 4 },
        ].filter(item => item.value < loggedUser.permissionLevel ),
        [updateButtonEnabled, setUpdateButtonEnabled] = useState(false),
        [isLoading, setIsLoading] = useState(false);


    const inputChangeHandler = (propName, e) => {
        e.preventDefault();

        setCurrentUser(prev => {
            let obj = {
                ...prev,
                [propName] : e.target.value,
            }
            userSetter(previousState => {
                return obj;
            });

            setUpdateButtonEnabled(prev => {
                return compareData(obj);
            });

            return obj;
        });
    }   

    const compareData = (userObject) => {
        let results = [];
        for(let key in userObject)  {
            results.push(userObject[key] !== initialValue[key]);
        }
        return results.some(res => res);
    }

    const cancelEditHandler = () => {
        editUserSetter(false);
        userSetter(previousState => {
            return initialValue;
        });
        updateStateHandler(false, null, null);
    }

    const selectOnChangeHandler = (value) => {
        setCurrentUser(prev => {
            let obj = {
                ...prev,
                permissionLevel : value,
            }
            userSetter(previousState => {
                return obj;
            });

            setUpdateButtonEnabled(prev => {
                return compareData(obj);
            });
            
            return obj;
        });
    }

    const updateUserHandler = (e) => {
        e.preventDefault();

        updateStateHandler(true, "Updating User Information", "info");
        setIsLoading(true);
        setUpdateButtonEnabled(false);

        fetch(`${baseUrl}/api/users/${currentUser._id}`, {
            method : "PUT",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify(currentUser),
            signal : abortCont.signal,
        })
            .then(res => {
                return res.json();
            })
            .then(data => {
                updateStateHandler(false, "We have successfully updated the user's information.", "success");
                setIsLoading(false);
                setInitialValue(currentUser);
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setIsLoading(false);
                    updateStateHandler(false, err.message, "error");
                }
            })
        
    }

    useEffect(() => {
        console.log(currentUser);

        return () => abortCont.abort();

    }, [currentUser])
    
    return (
        <Card>
            <div className={styles["edit-user-field-container"]}>
                <FormControl fullWidth>
                    <TextField 
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={currentUser.firstName} 
                        label="First Name" 
                        onChange={inputChangeHandler.bind(this, "firstName")}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField 
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={currentUser.lastName} 
                        label="First Name" 
                        onChange={inputChangeHandler.bind(this, "lastName")}
                    />
                </FormControl>
                <FormControl fullWidth>
                    <TextField 
                        InputLabelProps={{
                            shrink: true,
                        }}
                        value={currentUser.username} 
                        label="First Name" 
                        disabled
                    />
                </FormControl>
                <FormControl fullWidth>
                    <Select defaultValue={selectOptions.find(item => item.value === currentUser.permissionLevel)} selectOnchangeHandler={selectOnChangeHandler} label="Permission / Access Level" options={selectOptions} uniqueProp="value" optionLabelProp="name" ></Select>
                </FormControl>
            </div>
            <Divider style={{margin : "1.4rem 0"}} />
            <div className={styles["buttons-container-main"]}>
                <Button onClick={cancelEditHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                    Cancel
                </Button>
                {!updateButtonEnabled && !isLoading && <Button disabled type="button" variant="contained" size="small" color="default" disableElevation startIcon={<SaveIcon />}>
                    Update
                </Button>}
                {updateButtonEnabled && !isLoading && <Button type="button" onClick={updateUserHandler} variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />}>
                    Update
                </Button>}
                {isLoading && <Button type="button" disabled onClick={updateUserHandler} variant="contained" size="small" color="primary" disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} />}>
                    Update
                </Button>}
            </div>
        </Card>
    )
}