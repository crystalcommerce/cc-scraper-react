// core
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";

// hooks
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../../hooks/useAuth";
import useAccessCheck from "../../../hooks/useAccessCheck";

// Components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import EditUser from "../EditUser";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress, Modal } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Cancel from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';


// styles
import styles from "./UserDetails.module.scss";

// url;
import { baseUrl } from "../../../config";

// utils
import { toCapitalizeAll, toNormalString } from "../../../utilities/string";



export default function UserDetails({pageTitle})   {

    useAccessCheck(4);

    let history = useHistory(),
        { authToken, loggedUser } = useAuth(),
        { id } = useParams(),
        { data : user, hasError : userFetchError, fetchMessage : userFetchMessage } = useFetch(`/api/users/${id}`),
        [currentUser, setCurrentUser] = useState(user),
        [modalOpen, setModalOpen] = useState(false),
        positions = ["guest", "staff", "developer", "administrator", "site-owner"],
        abortCont = new AbortController(),

        // delete user states
        [isLoading, setIsLoading] = useState(null),
        [message, setMessage] = useState(null),
        [messageType, setMessageType] = useState(null),


        // edit user state
        [editUserOn, setEditUserOn] = useState(false);
    

    const modalSetter = (value) => {
        setModalOpen(prev => value);
    };

    const editUserHandler = ()  => {
        setEditUserOn(true)
    };

    const backButtonHandler = () => {
        history.push("/manage-users/");
    }

    const deleteUserHandler = () => {
        setIsLoading(true);
        setMessageType("info");
        setMessage("Deleting the user...");
        fetch(`${baseUrl}/api/users/${id}`, {
            method : "DELETE",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            signal : abortCont.signal
        })
            .then(res => {
                if(!res.ok) {
                    throw Error("We couldn't fetch the data");
                }
                return res.json();
            })
            .then(data => {
                setIsLoading(false);
                setMessageType("success");
                setMessage("User's information was successfully fetched.");
                setModalOpen(false);
                setTimeout(() => history.push("/manage-users"), 2500);
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setIsLoading(false);
                    setMessageType("error");
                    setMessage(err.message);
                    setModalOpen(false);

                }
            })
    };
    
    const updateStateHandler = (loadingState, messageState, messageTypeState) => {
        setIsLoading(loadingState);
        setMessage(messageState);
        setMessageType(messageTypeState);
    }
    

    useEffect(() => {
        setCurrentUser(user);        



        return () => abortCont.abort();

    }, [user])
    return (
        <>
            
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
                        {/* <Divider style={{margin : "1.4rem 0"}} /> */}
                        
                        
                        {!userFetchError && <div className={styles["user-info-container"]}>
                            <ul className={styles["user-info-list"]}>
                                <li><span className={styles["label"]}>ID</span> : <span className={styles["value"]}>{currentUser._id}</span></li>
                                <li><span className={styles["label"]}>First Name</span> : <span className={styles["value"]}>{currentUser.firstName}</span></li>
                                <li><span className={styles["label"]}>Last Name</span> : <span className={styles["value"]}>{currentUser.lastName}</span></li>
                                <li><span className={styles["label"]}>username</span> : <span className={styles["value"]}>{currentUser.username}</span></li>
                                <li><span className={styles["label"]}>Access Level</span> : <span className={styles["value"]}>{currentUser.permissionLevel ? toCapitalizeAll(toNormalString(positions[currentUser.permissionLevel - 1], "url")) : ""}</span></li>
                            </ul>
                        </div>}
                        {
                            userFetchError && 
                            <Alert severity="error">
                                {userFetchMessage}
                            </Alert>
                        }

                        <Divider style={{margin : "1.4rem 0"}} />
                        {currentUser && loggedUser && <>
                        {
                            (loggedUser.permissionLevel <= currentUser.permissionLevel || editUserOn) && 
                            <div className={styles["buttons-container-main"]}>
                                <Button onClick={backButtonHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                    Back to Users' List
                                </Button>
                                <Button disabled type="button" variant="contained" size="small" color="default" disableElevation startIcon={<DeleteIcon />}>
                                    Delete User
                                </Button>
                                <Button disabled type="button" variant="contained" size="small" color="default"  disableElevation startIcon={<EditIcon />}>
                                    Edit User
                                </Button>
                            </div>
                        }
                        {(loggedUser.permissionLevel > currentUser.permissionLevel && !editUserOn) && <div className={styles["buttons-container-main"]}>
                        
                            {!userFetchError && !message &&
                            <>
                                <Button onClick={backButtonHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                    Back to Users' List
                                </Button>
                                <Button onClick={() =>modalSetter(true)} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(201, 85, 85)", color : "white"}} disableElevation startIcon={<DeleteIcon />}>
                                    Delete User
                                </Button>
                                <Button onClick={editUserHandler} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(85 177 201)", color : "white"}} disableElevation startIcon={<EditIcon />}>
                                    Edit User
                                </Button>
                            </>
                            }
                            {userFetchError && !message && 
                            <>
                                <Button onClick={backButtonHandler} disabled type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                    Back to Users' List
                                </Button>
                                <Button onClick={() =>modalSetter(true)} disabled type="button" variant="contained" size="small" color="default" disableElevation startIcon={<DeleteIcon />}>
                                    Delete User
                                </Button>
                                <Button onClick={editUserHandler} disabled type="button" variant="contained" size="small" color="default"  disableElevation startIcon={<EditIcon />}>
                                    Edit User
                                </Button>
                                
                            </>
                            }

                            {message && messageType === "success" &&
                            <>
                                <Button onClick={backButtonHandler} disabled type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Cancel />}>
                                    Back to Users' List
                                </Button>
                                <Button onClick={() =>modalSetter(true)} disabled type="button" variant="contained" size="small" color="default" disableElevation startIcon={<DeleteIcon />}>
                                    User Deleted
                                </Button>
                                <Button onClick={editUserHandler} disabled type="button" variant="contained" size="small" color="default"  disableElevation startIcon={<EditIcon />}>
                                    Edit User
                                </Button>
                                
                            </>
                            }
                            <Modal
                                aria-labelledby="transition-modal-title"
                                aria-describedby="transition-modal-description"
                                onClose={() => modalSetter(false)}
                                open={modalOpen}
                                style={{display : "flex", justifyContent : "center", alignItems : "center"}}
                            >
            
                                    <Alert severity="error" style={{minHeight : "300px", minWidth : "250px", paddingRight : "2rem"}}>
                                        <h4 style={{color : "rgb(201, 85, 85)"}}className={styles["template-section-title"]}>Deleting the User?</h4>
                                        <Divider style={{margin : ".7rem 0 1.4rem"}} />
                                        <p>Are you sure you want to delete this user? Is he/she annoying?</p>
                                        <div className={styles["buttons-container"]}>
                                            
                                            {!isLoading && !messageType &&
                                                <>
                                                <Button onClick={deleteUserHandler} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(201, 85, 85)", color : "white"}} disableElevation startIcon={<DeleteIcon />}>
                                                    Delete User
                                                </Button>
                                                
                                                <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(85 159 171)", color : "white"}} disableElevation startIcon={<Cancel />}>
                                                    Cancel
                                                </Button>
                                                </>
                                            }


                                            {isLoading && 
                                                <>
                                                    <Button onClick={deleteUserHandler} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} />}>
                                                        Deleting User
                                                    </Button>
                                                    <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Cancel />}>
                                                    Cancel
                                                    </Button>
                                                </>
                                            }

                                            {!isLoading && messageType === "success" &&
                                                <>
                                                    <Button onClick={deleteUserHandler} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Check />}>
                                                        User Deleted
                                                    </Button>
                                                    <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Cancel />}>
                                                    Cancel
                                                    </Button>
                                                </>
                                            }
                                        </div>
                                    </Alert>

                            </Modal>
                        </div>}
                        </>}
                    </Card>
                    {editUserOn && 
                        <EditUser loggedUser={loggedUser} user={currentUser} editUserSetter={setEditUserOn} userSetter={setCurrentUser} updateStateHandler={updateStateHandler} />
                    }
                </EmptyCardFlex>    
            </EmptyCardFlex>
        </>    
    )
}