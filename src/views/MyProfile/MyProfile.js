// core
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useHistory } from "react-router";

// Components
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress } from '@material-ui/core';
import Cancel from '@material-ui/icons/Cancel';
import Alert from '@material-ui/lab/Alert';
import EditIcon from '@material-ui/icons/Edit';


import { toNormalString, toCapitalizeAll } from "../../utilities/string";

// styles
import styles from "./MyProfile.module.scss";

// url;
import { baseUrl } from "../../config";
import EditInfo from "./EditInfo";


export default function ManageScrapedData({pageTitle}) {

    let { loggedUser, authToken } = useAuth(),
        history = useHistory(),
        abortCont = new AbortController(),
        positions = ["guest", "staff", "developer", "administrator", "site-owner"],
        [currentUser, setCurrentUser] = useState(),

        // edit info
        [editInfoEnabled, setEditInfoEnabled] = useState(false),


        // fetch states
        [message, setMessage] = useState(null),
        [messageType, setMessageType] = useState(null),
        [isLoading, setIsLoading] = useState(false);



    const updateStateHandler = (loadingState, messageState, messageTypeState) => {
        setIsLoading(loadingState);
        setMessage(messageState);
        setMessageType(messageTypeState);
    }

    const editInforHandler = (value) => {
        setEditInfoEnabled(value);
    }

    const backButtonHandler = () => {
        history.goBack();
    }


    useEffect(() => {

        if(loggedUser) {

            setMessage("Currently getting your information");
            setMessageType("info");
            setIsLoading(true);

            fetch(`${baseUrl}/api/users/single?username=${loggedUser.username}&permissionLevel=${loggedUser.permissionLevel}`, {
                method : "GET",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken,
                },
                signal : abortCont.signal,
            })
                .then(res => {
                    return res.json()
                })
                .then(data => {
                    setMessage("We have successfully fetched your information from the database.");
                    setMessageType("success");
                    setIsLoading(false);

                    setCurrentUser(prev => data);

                })
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        setMessage("We couldn't reach the server.");
                        setMessageType("error");
                        setIsLoading(false);
                    }
                })



        }

        return () => abortCont.abort();
    }, [loggedUser])
    

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
                    {currentUser && 
                    <>
                        <div className={styles["user-info-container"]}>
                            <ul className={styles["user-info-list"]}>
                                <li><span className={styles["label"]}>ID</span> : <span className={styles["value"]}>{currentUser._id}</span></li>
                                <li><span className={styles["label"]}>First Name</span> : <span className={styles["value"]}>{currentUser.firstName}</span></li>
                                <li><span className={styles["label"]}>Last Name</span> : <span className={styles["value"]}>{currentUser.lastName}</span></li>
                                <li><span className={styles["label"]}>username</span> : <span className={styles["value"]}>{currentUser.username}</span></li>
                                <li><span className={styles["label"]}>Access Level</span> : <span className={styles["value"]}>{currentUser.permissionLevel ? toCapitalizeAll(toNormalString(positions[currentUser.permissionLevel - 1], "url")) : ""}</span></li>
                            </ul>
                        </div>
                        <Divider style={{margin : "1.4rem 0"}} />
                    </>
                    }
                    <>
                        <div className={styles["buttons-container-main"]}>
                        {!isLoading && 
                            <Button onClick={backButtonHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                Back
                            </Button>
                        }
                        {isLoading && 
                            <Button onClick={backButtonHandler} type="button" variant="contained" size="small" color="secondary" disableElevation disabled startIcon={<Cancel />}>
                                Back
                            </Button>
                        }
                        {!editInfoEnabled &&
                            <Button onClick={editInforHandler.bind(this, true)} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(85 177 201)", color : "white"}} disableElevation startIcon={<EditIcon />}>
                                Edit My Info
                            </Button>
                        }
                        {editInfoEnabled &&
                            <Button onClick={editInforHandler.bind(this, true)} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<EditIcon />}>
                                Edit My Info
                            </Button>
                        }
                        </div>
                    </>
                    
                </Card>
                

                {
                    editInfoEnabled && 
                    <EditInfo currentUser={currentUser} currentUserSetter={setCurrentUser} editInforHandler={editInforHandler} updateStateHandler={updateStateHandler} ></EditInfo>
                }


            </EmptyCardFlex>
        </EmptyCardFlex>
    )
}