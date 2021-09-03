import { useHistory, useParams } from "react-router-dom";
import useFetch from "../../../hooks/useFetch";
import { useState, useEffect } from "react";
import useAuth from "../../../hooks/useAuth";
import { baseUrl } from "../../../config";


// components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import EditEvaluators from "../../../templates/EditEvaluators";
import { Button, Divider, CircularProgress, Modal, FormControl } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Cancel from '@material-ui/icons/Cancel';
import PlayIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Check from '@material-ui/icons/Check';
import CodeEditor from "../../../components/CodeEditor/";


import styles from "./ScraperDetails.module.scss";


export default function ScraperDetails({pageTitle})  {

    let { authToken } = useAuth(),
        { id } = useParams(),
        {data : scraperDetails, setData : setScraperDetails} = useFetch(`/api/scrapers/${id}`, {}, null),
        history = useHistory(),
        [modalOpen, setModalOpen] = useState(false),
        [isLoading, setIsLoading] = useState(null),
        [message, setMessage] = useState(null),
        [messageType, setMessageType] = useState(null),

        // edit evaluator functions
        [editingEvaluatorObjects, setEditingEvaluatorObjects] = useState(false);
        

    const executeScriptHandler = () => {
        history.push(`/manage-scrapers/run-script/${id}`)
    }

    const editEvaluatorObjectsHandler = () => {
        setEditingEvaluatorObjects(prev =>true);
    }

    const setEvaluatorObjectsHandler = (evaluatorObjects, state, setLoading, setMessage, setStatus) => {
        
        setLoading(true);
        setStatus("info");
        setMessage("Updating the Evalutors");

        console.log(`${baseUrl}/api/scrapers/${id}`);
        console.log(evaluatorObjects);

        fetch(`${baseUrl}/api/scrapers/${id}`, {
            method : "PUT",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({...scraperDetails, evaluatorObjects})
        })
            .then(res => {
                if(!res.ok) {
                    throw Error("We had problems reaching the server... We couldn't update the evaluators.");
                }
                return res.json();
            })
            .then(data => {
                setLoading(false);
                setStatus("success");
                setMessage("We have successfully updated the evaluators.");


                setScraperDetails(prev => {
                    return {
                        ...prev,
                        evaluatorObjects,
                    }
                });
                setTimeout(() => setEditingEvaluatorObjects(prev => state), 777);

            })
            .catch(err => {
                setLoading(false);
                setStatus("error");
                setMessage(err.message);
            });

        
        // save the data to database...
    }

    const cancelHandler = () => {
        setEditingEvaluatorObjects(prev => false)
    }

    const deleteScriptHandler = () => {
        setIsLoading(true);
        fetch(`${baseUrl}/api/scrapers/${id}`, {
            method : "DELETE",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            }
        })
            .then(res => res.json())
            .then(data => {
                if(data.statusOk)    {
                    setMessage("We have successfully deleted the scraper script");
                    setIsLoading(false);
                    setMessageType("success");
                    setTimeout(() => history.push(`/manage-scrapers/`), 2500);
                } else  {
                    setMessage("We were not able to delete the scraper script");
                    setIsLoading(false);
                    setMessageType("success");
                    setModalOpen(false);
                }
            })
            .catch(err => {
                setMessage(err.message);
                setIsLoading(false);
                setMessageType("error");
                setModalOpen(false);
                // console.log(err)
            });

        
    }

    const modalSetter = (value) => {
        setModalOpen(prev => value);

        
    }

    useEffect(() => {
        // console.log(scraperDetails);
        // console.log(editingEvaluatorObjects);

        


    }, [modalOpen, scraperDetails])

    return (
        <EmptyCardFlex className={styles["main-container"]}>
            {/* {message && <Alert severity={messageType}>{message}</Alert>} */}

            {
                editingEvaluatorObjects && 

                <Card>
                    
                    {scraperDetails && scraperDetails.evaluatorObjects && <EditEvaluators currentValue={scraperDetails.evaluatorObjects} setEvaluatorObjectsHandler={setEvaluatorObjectsHandler} cancelHandler={cancelHandler}></EditEvaluators>}

                </Card>



            }
            {!editingEvaluatorObjects && <Card>
            <h1 className="page-title">{pageTitle}</h1>
                {scraperDetails && 
                <>
                    <Divider style={{margin : "1.4rem 0"}} />
                    <div className={styles["details-container"]}>
                        

                        
                        <div className={styles["container"]}>
                            <p className={styles["template-section-title"]}>Site Resource Info : </p>
                            <ul>
                                <li><span className={styles["label"]}>Site Name</span> : {scraperDetails.siteName}</li>
                                <li><span className={styles["label"]}>Site Url</span> : {scraperDetails.siteUrl}</li>
                            </ul>
                        </div>
                        <Divider style={{margin : "1.4rem 0"}} />
                        <div className={styles["container"]}>
                            <p className={styles["template-section-title"]}>Scraper Details : </p>
                            <ul>
                                <li><span className={styles["label"]}>Product Brand</span> : {scraperDetails.productBrand}</li>
                                <li><span className={styles["label"]}>Image Prop Name</span> : {scraperDetails.imagePropName}</li>
                                <li><span className={styles["label"]}>Image Name Object</span> : 
                                    <ul>
                                        <li><span className={styles["label"]}>Split</span> : {scraperDetails.imageNameObject.split.join(", ")}</li>
                                        <li><span className={styles["label"]}>Shared</span> : {scraperDetails.imageNameObject.shared.join(", ")}</li>
                                    </ul>
                                </li>
                                <li><span className={styles["label"]}>Image Name Object</span> : {scraperDetails.csvExcludedProps.join(", ")}</li>
                            </ul>
                        </div>
                        <Divider style={{margin : "1.4rem 0"}} />
                        <div className={styles["container"]}>
                            <p className={styles["template-section-title"]}>Evaluator Objects : </p>
                            <ul>
                                {scraperDetails.evaluatorObjects.map((item, index) => {
                                    return (
                                        <li key={index}><span className={styles["label"]}>Evaluator Object {index + 1}</span> : 
                                            <ul>
                                                <li>
                                                    <div className={styles["label"]}>Callback : </div>
                                                    <FormControl>
                                                        {/* onChange, padding, value, style, placeholder */}
                                                        <CodeEditor disabled value={item.callback}></CodeEditor>
                                                        {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                                                    </FormControl>
                                                </li>
                                                {item.waitMethods.length > 0 && <li>
                                                    <span className={styles["label"]}>Wait Methods</span> :
                                                    <ul>
                                                        {item.waitMethods.map((method, i) => {
                                                            return (
                                                                <li key={i}>
                                                                    <ul>
                                                                        <li><span className={styles["label"]}>Name</span> : {method.name}</li>
                                                                        <li><span className={styles["label"]}>Args</span> : {method.args}</li>
                                                                    </ul>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                    
                                                </li>}
                                                {
                                                    item.type === "list" && 
                                                    <li>
                                                        <span className={styles["label"]}>Paginated</span> :
                                                        {item.paginated.toString()}
                                                    </li>
                                                }
                                                {
                                                    item.type !== "list" && 
                                                    <>
                                                        <li>
                                                            <span className={styles["label"]}>Object Property Arguments</span> :
                                                            {item.objPropArgs.join(", ")}
                                                        </li>
                                                        <li>
                                                            <span className={styles["label"]}>Product Url Prop Name</span> :
                                                            {item.productUrlProp}
                                                        </li>
                                                    </>
                                                }
                                                
                                            </ul>
                                        </li>
                                    )
                                })}
                            </ul>
                            <Divider style={{margin : "1.4rem 0"}} />

                            <div>
                                <p className={styles["template-section-title"]}>Developer's comment on usage : </p>
                                <ul>
                                    <li><span className={styles["label"]}>Usage</span> : {scraperDetails.usage}</li>
                                </ul>
                            </div>

                            <Divider style={{margin : "1.4rem 0"}} />

                            <div>
                                <p className={styles["template-section-title"]}>Product Group / Set Identifier Key : </p>
                                <ul>
                                    <li><span className={styles["label"]}>Key</span> : {scraperDetails.groupIdentifierKey}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </>
                }
                <Divider style={{margin : "1.4rem 0"}} />
                <div className={styles["buttons-container"]}>
                    
                    <Button onClick={() =>modalSetter(true)} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(201, 85, 85)", color : "white"}} disableElevation startIcon={<DeleteIcon />}>
                        Delete Script
                    </Button>
                    <Button onClick={editEvaluatorObjectsHandler} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(85 177 201)", color : "white"}} disableElevation startIcon={<EditIcon />}>
                        Edit Evaluators
                    </Button>
                    <Button onClick={executeScriptHandler} type="button" variant="contained" size="small" color="primary" disableElevation startIcon={<PlayIcon />} >
                            Run the Script
                    </Button>
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        onClose={() => modalSetter(false)}
                        open={modalOpen}
                        style={{display : "flex", justifyContent : "center", alignItems : "center"}}
                    >
    
                            <Alert severity="error" style={{minHeight : "300px", minWidth : "250px", paddingRight : "2rem"}}>
                                <h4 style={{color : "rgb(201, 85, 85)"}}className={styles["template-section-title"]}>Deleting the Script?</h4>
                                <Divider style={{margin : ".7rem 0 1.4rem"}} />
                                <p>Are you sure you want to delete this awesome script?</p>
                                <div className={styles["buttons-container"]}>
                                    
                                    {!isLoading && !messageType &&
                                        <>
                                        <Button onClick={deleteScriptHandler} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(201, 85, 85)", color : "white"}} disableElevation startIcon={<DeleteIcon />}>
                                            Delete Script
                                        </Button>
                                        
                                        <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" style={{backgroundColor : "rgb(85 159 171)", color : "white"}} disableElevation startIcon={<Cancel />}>
                                            Cancel
                                        </Button>
                                        </>
                                    }


                                    {isLoading && 
                                        <>
                                            <Button onClick={deleteScriptHandler} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} />}>
                                                Delete Script
                                            </Button>
                                            <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Cancel />}>
                                            Cancel
                                        </Button>
                                        </>
                                    }

                                    {!isLoading && messageType === "success" &&
                                        <>
                                            <Button onClick={deleteScriptHandler} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Check />}>
                                                Script Deleted
                                            </Button>
                                            <Button onClick={() =>modalSetter(false)} type="button" variant="contained" size="small" color="default" disabled disableElevation startIcon={<Cancel />}>
                                            Cancel
                                        </Button>
                                        </>
                                    }
                                </div>
                            </Alert>

                    </Modal>
                </div>
            </Card>}
            
        </EmptyCardFlex>
    )
}