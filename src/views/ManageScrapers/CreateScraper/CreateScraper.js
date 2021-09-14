// core
import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

// hooks
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";

// Components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import CodeEditor from "../../../components/CodeEditor/CodeEditor";
// import SaveIcon from '@material-ui/icons/Save';
import PublishIcon from '@material-ui/icons/Publish';
import { Button, Divider, CircularProgress, FormControl } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Cancel from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import CloseIcon from '@material-ui/icons/Close';


/***********************************************************
 * 
 *    Necessary Components for Creating a Scraper Script
 * 
***********************************************************/
    // creating site resource
    import SelectSiteResource from "../../../templates/SelectSiteResource/";
    import CreateSiteResource from "../../../templates/CreateSiteResource/";
    // creating scraperDetails
    import CreateScraperData from "../../../templates/CreateScraperData/";
    // crating a model object;
    import CreateModelOptions from "../../../templates/CreateModelOptions";
    // creating evaluatorObjects;
    import CreateEvaluators from "../../../templates/CreateEvaluatos";


// styles
import styles from "./CreateScraper.module.scss";

// url;
import { baseUrl } from "../../../config/"; 
import { toNormalString } from "../../../utilities/string";

export default function CreateScraper({pageTitle}) {

    let {authToken} = useAuth(),
        abortCont = new AbortController(),
        history = useHistory(),

        // siteResource object
        [selectOn, setSelectOn] = useState(true),
        [siteResource, setSiteResource] = useState({
            _id : "",
            siteName : "",
            siteUrl : "",
        }),
        {data : selectOptions, setData : setSelectOptions} = useFetch("/api/site-resources", {
            method : "GET",
            headers : {
                "x-auth-token" : authToken,
                "Content-type" : "application/json",
            }
        }),
        [siteResourceReady, setSiteResourceReady] = useState(false),

        // scraperDbObject
        [scraperDetails, setScraperDetails] = useState({
            productBrand : "", 
            imagePropName : "", 
            imageNameObject : {
                shared : [],
                split : [],
            },
            csvExcludedProps : ["imageUris", "imagePaths"],
        }),
        [scraperDetailsReady, setScraperDetailsReady] = useState(false),


        // model object;
        [modelObjectOptions, setModelObjectOptions] = useState({
            schema : {
                imagePaths : {
                    type : "Array",
                    required : "false",
                },
                imageUris : {
                    type : "Array",
                    required : "false",
                }
            },
            initializedProps : []
        }),
        [modelObjectOptionsReady, setModelObjectOptionsReady] = useState(false),


        // route object;
        [routeObjectOptions, setRouteObjectOptions] = useState({
            recordName : "",
            pluralized : false,
        }),

        
        // evaluatorObjects
        [evaluatorObjects, setEvaluatorObjects] = useState([]),
        [evaluatorObjectsReady, setEvaluatorObjectsReady] = useState(false),

        // usage
        [usage, setUsage] = useState(""),

        [groupIdentifierKey, setGroupIdentifierKey] = useState(null),

        [submitObject, setSubmitObject] = useState({
            type : null,
            message : null,
            loading : false,
        });
    

    
    /************************************/
    /************************************/
        // Event Handlers
    /************************************/
    /************************************/


    // site resource event handlers
    const selectOnchangeHandler = (id) => {
        setSiteResource(prev => {
            return selectOptions.find(item => item._id === id);
        });
    }

    const siteResourceHandler = (siteResource) => {
        setSiteResource(prev => ({...siteResource}))
        setSelectOptions(prev => [...prev, siteResource]);
    }

    const setSelectHandler = (state, e) => {
        e.preventDefault();
        if(!state)  setSiteResource(prev => (prev));
        setSelectOn(prev => state);
    }

    const createReadyHandler = () => {
        setSiteResourceReady(prev => true);
    }


    // scraper details event handler
    const setScraperDataHandler = (scraperDetailsObj, boolState) => {
        setScraperDetails(prev => ({...prev, ...scraperDetailsObj}));
        setRouteObjectOptions(prev => {
            return {
                recordName : scraperDetailsObj.productBrand, 
                pluralized : false
            };
        });
        setScraperDetailsReady(prev => boolState);
    }

    // set model Object event handler
    const setModelObjectHandler = (modelObject, boolState) => {
        setModelObjectOptions(prev => ({...prev, ...modelObject}));
        setModelObjectOptionsReady(prev => boolState);
    }



    // set evaluatorObjects event handlers
    const setEvaluatorObjectsHandler = (value, boolState) => {
        setEvaluatorObjects(prev => [...value]);
        setEvaluatorObjectsReady(prev => boolState);
    }


    // usage handler
    const setUsageHandler = (value) => {
        if(value.trim() !== "") {
            setUsage(prev => value.trim());
        }
    }


    // groupIdentifierKeyHandler
    const setGroupIdentifierKeyHandler = (value) => {
        
        setGroupIdentifierKey(prev => value);
  
    }



    // back button handler
    const backButtonHandler = (setter) => {
        setter(prev => false);

        setSubmitObject(prev => {
            return {
                ...prev, 
                message : null,
                loading : false,
                type : null,
            }
        });
    }

    // cancel button handler
    const cancelHandler = () => {
        // siteResource
        setSiteResource(prev => ({
            _id : "",
            siteName : "",
            siteUrl : "",
        }));
        setSiteResourceReady(false);

        // scraperDetails
        setScraperDetails(prev => ({
            productBrand : "", 
            imagePropName : "", 
            imageNameObject : {
                shared : [],
                split : [],
            },
            csvExcludedProps : ["imageUris", "imagePaths"],
        }));
        setScraperDetailsReady(false);

        // modelObject
        setModelObjectOptions(prev => ({
            schema : {
                imagePaths : {
                    type : "Array",
                    required : "false",
                },
                imageUris : {
                    type : "Array",
                    required : "false",
                }
            },
            initializedProps : []
        }));

        // routeObjectOptions
        setRouteObjectOptions(prev => ({
            recordName : "",
            pluralized : false,
        }));

        // evaluatorObjects = [];
        setEvaluatorObjects(prev => []);
        setUsage(prev => "");
        setGroupIdentifierKey(prev => "");

        //
        setSubmitObject(prev => {
            return {
                ...prev, 
                message : null,
                loading : false,
                type : null,
            }
        });

        setModelObjectOptionsReady(false);
        setEvaluatorObjectsReady(false);
    }



    const saveScraperHandler = () => {

        setSubmitObject(prev => {
            return {
                ...prev, 
                message : "Saving the Scraper Script into our database...",
                loading : true,
                type : "info",
            }
        });
        fetch(`${baseUrl}/api/scrapers`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({
                siteResource,
                usage,
                groupIdentifierKey,
                ...scraperDetails,
                modelObjectOptions,
                routeObjectOptions,
                evaluatorObjects,
            }),
            signal : abortCont.signal
        })
            .then(res => res.json())
            .then(data => {
                let { statusOk } = data;
                if(statusOk)    {
                    
                    setSubmitObject(prev => {
                        return {
                            ...prev, 
                            message : "We have successfully saved the scraper script data. You will be redirected to the page where you can run the script shortly.",
                            loading : false,
                            type : "success",
                        }
                    });
                    setTimeout(() => {
                        
                        history.push(`/manage-scrapers/run-script/${data.data._id}`);
                    }, 3000);
                    
                } else  {
                    setSubmitObject(prev => {
                        return {
                            ...prev, 
                            message : "Something went wrong with the process of saving the script... please check the scraper script details you have filled up...",
                            loading : false,
                            type : "warning",
                        }
                    });
                }
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setSubmitObject(prev => {
                        return {
                            ...prev, 
                            message : `Scraper Script was not saved : ${err.message}`,
                            loading : false,
                            type : "error",
                        }
                    });
                }
            });
    }




    useEffect(() => {
        
        if(submitObject.type === "success") {

        }

        return () => abortCont.abort();
    }, [submitObject]);

    return  (
        <>  
            <h1 className="page-title">{pageTitle}</h1>
            
            { submitObject.message !== null && 
                <EmptyCardFlex style={{padding : ".7rem 0"}}>
                    <Alert severity={submitObject.type}>{submitObject.loading && <CircularProgress style={{height: "20px", width : "20px"}}></CircularProgress>}{submitObject.message}</Alert>
                    {/* <Alert severity="error">This is an error message!</Alert>
                    <Alert severity="warning">This is a warning message!</Alert>
                    
                    <Alert severity="success">This is a success message!</Alert> */}
                </EmptyCardFlex>
            }

            <EmptyCardFlex >
                <EmptyCardFlex className={styles["create-scraper-container"]}>
                    {  !siteResourceReady && 
                        <Card className={styles["site-resource-card"]}> 
                            {selectOn && <SelectSiteResource 
                                selectOnchangeHandler={selectOnchangeHandler}
                                selectedSiteResource={siteResource}
                                selectOptions={selectOptions}
                                setSelectHandler={setSelectHandler}
                                createReadyHandler={createReadyHandler}
                            />}

                            {!selectOn && <CreateSiteResource siteResourceHandler={siteResourceHandler} createReadyHandler={createReadyHandler} setSelectHandler={setSelectHandler} />}
                        </Card>
                    }
                    {
                        siteResourceReady &&  !scraperDetailsReady && 
                        <Card className={styles["create-scraper-card"]}> 
                            <CreateScraperData currentValue={scraperDetails} setScraperDataHandler={setScraperDataHandler} cancelHandler={cancelHandler} backButtonHandler={() => backButtonHandler(setSiteResourceReady)}  />
                        </Card>
                    }
                    {  scraperDetailsReady && !modelObjectOptionsReady &&
                        <CreateModelOptions currentValue={modelObjectOptions} setModelObjectHandler={setModelObjectHandler} cancelHandler={cancelHandler} backButtonHandler={() => backButtonHandler(setScraperDetailsReady)} />
                    }
                    {  modelObjectOptionsReady && !evaluatorObjectsReady &&
                        <CreateEvaluators 
                            currentValue={evaluatorObjects} 
                            currentUsageValue={usage}
                            currentGroupIdentifierKeyValue={groupIdentifierKey}
                            currentSchema={modelObjectOptions.schema}
                            setGroupIdentifierKeyHandler={setGroupIdentifierKeyHandler} 
                            setUsageHandler={setUsageHandler} 
                            setEvaluatorObjectsHandler={setEvaluatorObjectsHandler} 
                            cancelHandler={cancelHandler}
                            backButtonHandler={() => backButtonHandler(setModelObjectOptionsReady)} />
                    }



                    {/* showing data to be submitted to the scraper API */}



                    { siteResourceReady && !evaluatorObjectsReady &&
                        <Card className={styles["json-data"]}>
                                {siteResourceReady && 
                                    <div className={styles["container"]}>
                                        <p>Site Resource : </p>
                                        <ul>
                                            <li><span className={styles["label"]}>id</span> : {siteResource._id}</li>
                                            <li><span className={styles["label"]}>Site Name</span> : {siteResource.siteName}</li>
                                            <li><span className={styles["label"]}>Site Url</span> : {siteResource.siteUrl}</li>
                                        </ul>
                                    </div>
                                }
                                {scraperDetailsReady && 
                                    <div className={styles["container"]}>
                                        <p>Scraper Details : </p>
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
                                }
                                { modelObjectOptionsReady &&
                                    <>
                                        <div className={styles["container"]}>
                                            <p>Model Object Options : </p>
                                            <ul>
                                                <li><span className={styles["label"]}>Schema</span> : 
                                                    <ul>
                                                        {Object.keys(modelObjectOptions.schema).map(key => {
                                                            return (
                                                                <li key={key}><span className={styles["label"]}>{toNormalString(key)}</span> : 
                                                                    <ul>
                                                                        {Object.keys(modelObjectOptions.schema[key]).map(prop => {
                                                                            return (
                                                                                <li key={prop}><span className={styles["label"]}>{toNormalString(prop)}</span> : {modelObjectOptions.schema[key][prop]}</li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </li>
                                                <li><span className={styles["label"]}>Initialized Props</span> : 
                                                    <ul>
                                                        {modelObjectOptions.initializedProps.map((item, index) => {
                                                            return (
                                                                <li key={index}><span className={styles["label"]}>{toNormalString(Object.keys(item).join(""))}</span> : {Object.values(item).join(", ")}</li>
                                                            );
                                                        })}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className={styles["container"]}>
                                            <p>Route Object Options : </p>
                                            <ul>
                                                <li><span className={styles["label"]}>Record Name</span> : {routeObjectOptions.recordName}</li>      
                                                <li><span className={styles["label"]}>Pluralized</span> : {routeObjectOptions.pluralized.toString()}</li>      
                                            </ul>
                                        </div>
                                    </>
                                }
                                {
                                    evaluatorObjects && 
                                    <div className={styles["container"]}>
                                        <p>Evaluator Objects : </p>
                                        <ul>
                                            {evaluatorObjects.map((item, index) => {
                                                return (
                                                    <li key={index}><span className={styles["label"]}>Evaluator Object {index + 1}</span> : 
                                                        <ul>
                                                            <li>
                                                                <span className={styles["label"]}>Callback</span> :
                                                                {item.callback}
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
                                        {usage && 
                                            <>
                                                <p className={styles["label"]}>Developer's comment on usage : </p>
                                                <ul>
                                                    <li><span className={styles["label"]}>Usage</span> : {usage}</li>
                                                </ul>
                                            </>
                                        }
                                        <Divider style={{margin : "1.4rem 0"}} />
                                        {groupIdentifierKey && 
                                            <>
                                                <p className={styles["label"]}>Developer's comment on usage : </p>
                                                <ul>
                                                    <li><span className={styles["label"]}>Product Group Identifier Key</span> : {groupIdentifierKey}</li>
                                                </ul>
                                            </>
                                        }
                                    </div>
                                }
                                
                        </Card>
                    }

                </EmptyCardFlex>
                
                <EmptyCardFlex flexDirection="row">
                    { evaluatorObjectsReady &&
                        <Card className={styles["json-data"]}>
                            <h6 className={styles["template-section-title"]}>Please Review the Data before submitting</h6>
                                {siteResourceReady && 
                                    <div className={styles["container"]}>
                                        <p>Site Resource : </p>
                                        <ul>
                                            <li><span className={styles["label"]}>id</span> : {siteResource._id}</li>
                                            <li><span className={styles["label"]}>Site Name</span> : {siteResource.siteName}</li>
                                            <li><span className={styles["label"]}>Site Url</span> : {siteResource.siteUrl}</li>
                                        </ul>
                                    </div>
                                }
                                {scraperDetailsReady && 
                                    <div className={styles["container"]}>
                                        <p>Scraper Details : </p>
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
                                }
                                {modelObjectOptionsReady &&
                                    <>
                                        <div className={styles["container"]}>
                                            <p>Model Object Options : </p>
                                            <ul>
                                                <li><span className={styles["label"]}>Schema</span> : 
                                                    <ul>
                                                        {Object.keys(modelObjectOptions.schema).map(key => {
                                                            return (
                                                                <li key={key}><span className={styles["label"]}>{toNormalString(key)}</span> : 
                                                                    <ul>
                                                                        {Object.keys(modelObjectOptions.schema[key]).map((prop, index) => {
                                                                            return (
                                                                                <li key={index}><span className={styles["label"]}>{toNormalString(prop)}</span> : {modelObjectOptions.schema[key][prop]}</li>
                                                                            );
                                                                        })}
                                                                        {/* <li><span className={styles["label"]}>Image Prop Name</span> : </li> */}
                                                                    </ul>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </li>
                                                <li><span className={styles["label"]}>Initialized Props</span> : 
                                                    <ul>
                                                        {modelObjectOptions.initializedProps.map((item, index) => {
                                                            return (
                                                                <li key={index}><span className={styles["label"]}>{toNormalString(Object.keys(item).join(""))}</span> : {Object.values(item).join(", ")}</li>
                                                            );
                                                        })}
                                                    {/* <li><span className={styles["label"]}>id</span> : {siteResource._id}</li> */}
                                                    </ul>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className={styles["container"]}>
                                            <p>Route Object Options : </p>
                                            <ul>
                                                <li><span className={styles["label"]}>Record Name</span> : {routeObjectOptions.recordName}</li>      
                                                <li><span className={styles["label"]}>Pluralized</span> : {routeObjectOptions.pluralized.toString()}</li>      
                                            </ul>
                                        </div>
                                    </>
                                }
                                {
                                    evaluatorObjects && 
                                    <div className={styles["container"]}>
                                        <p>Evaluator Objects : </p>
                                        <ul>
                                            {evaluatorObjects.map((item, index) => {
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
                                        {usage && 
                                            <>
                                                <p className={styles["label"]}>Developer's comment on usage : </p>
                                                <ul>
                                                    <li><span className={styles["label"]}>Usage</span> : {usage}</li>
                                                </ul>
                                            </>
                                        }
                                        <Divider style={{margin : "1.4rem 0"}} />
                                        {groupIdentifierKey && 
                                            <>
                                                <p className={styles["label"]}>Product Key that identifies what group or set name the product belongs to : </p>
                                                <ul>
                                                    <li><span className={styles["label"]}>Product Group Identifier Key</span> : {groupIdentifierKey}</li>
                                                </ul>
                                            </>
                                        }
                                    </div>
                                }
                            <div className={styles["buttons-container"]}>
                                <Divider style={{margin : "1.4rem 0"}} />
                                <Button onClick={cancelHandler} type="button" variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />} >
                                        Cancel
                                </Button>
                                <Button type="button" onClick={() => backButtonHandler(setEvaluatorObjectsReady)} variant="contained" size="small" color="secondary" disableElevation startIcon={<PreviousIcon />} >
                                    Back
                                </Button>
                                
                                {submitObject.loading && <Button type="button" variant="contained" size="small" color="primary" onClick={saveScraperHandler} disableElevation disabled startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />} >
                                    Saving the Scraper Script
                                </Button>}

                                {!submitObject.loading && !submitObject.message && <Button type="button" onClick={saveScraperHandler} variant="contained" size="small" color="primary" disableElevation startIcon={<PublishIcon />} >
                                    Save the Scraper Script
                                </Button>}

                                {!submitObject.loading && submitObject.type === "success" && <Button type="button" onClick={saveScraperHandler} variant="contained" size="small" color="primary" disableElevation disabled startIcon={<Check />} >
                                    Done.
                                </Button>}

                                {!submitObject.loading && submitObject.type !== null && submitObject.type !== "success" && <Button type="button" onClick={saveScraperHandler} variant="contained" size="small" color="primary" disableElevation disabled startIcon={<CloseIcon />} >
                                    Scraper was not saved...
                                </Button>}
                                
                            </div>
                        </Card>
                    }
                </EmptyCardFlex>
            </EmptyCardFlex>  
            
        </>
    )
}