import { useState, useEffect } from "react";
import { useParams } from "react-router";
import useAuth from "../../../hooks/useAuth";
import { io } from "socket.io-client";
import { useHistory } from "react-router-dom";

// custom hooks
import useFetch from "../../../hooks/useFetch";

// Material UI Components && custom components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import { Button, TextField, FormControl, CircularProgress, Divider } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import PlayIcon from '@material-ui/icons/PlayArrow';
import DownloadIcon from '@material-ui/icons/GetApp';
import SaveIcon from '@material-ui/icons/Save';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import MuiTable from "../../../components/MuiTable";

// utils
import { toNormalString } from "../../../utilities/string";

// config
import { baseUrl, socketUrl, fileUrl } from "../../../config";


// styles
import styles from "./RunScraperScript.module.scss";




// // socket.io
// const socket = io(`${socketUrl}`);

// socket.on("greet", (arg) => {
//     console.log(arg); // world
// });


export default function RunScraperScript({pageTitle})  {

    let {authToken, fileToken} = useAuth(),
        history = useHistory(),
        {id} = useParams(),
        {data : scraperData, fetchMessage} = useFetch(`/api/scrapers/${id}`),
        [siteName, setSiteName] = useState(""),
        [productBrand, setProductBrand] = useState(""),
        [siteUrl, setSiteUrl] = useState(""),
        [csvExcludedProps, setCsvExcludedProps] = useState(null), 
        [groupIdentifierKey, setGroupIdentifierKey] = useState(""),
        [evaluatorObjects, setEvaluatorObjects] = useState([]),
        [apiRoute, setApiRoute] = useState(null),
        [evaluatorIndexes, setEvaluatorIndexes] = useState([]),
        [usage, setUsage] = useState(null),

        // script id
        [scriptId, setScriptId] = useState(null),

        // requiredData from user
        [productsListEvaluatorUris, setProductsListEvaluatorUris] = useState([]),
        [groupIdentifier, setGroupIdentifier] = useState(null),
        [evaluatorArgs, setEvaluatorArgs] = useState([]),

        // script state
        [scriptRunning, setScriptRunning] = useState(false),
        [scrapingMessage, setScrapingMessage] = useState(null),
        [scrapingStatus, setScrapingStatus] = useState(null),

        // next action states // downloading and saving;
        [downloadingZip, setDownloadingZip] = useState(false),
        [savingToDb, setSavingToDb] = useState(false),
        [savingDataMessage, setSavingDataMessage] = useState(null),
        [savingDataStatus, setSavingDataStatus] = useState(null),




        // scraped data;
        [scrapedData, setScrapedData] = useState(null),
        [unscrapedData, setUnscrapedData] = useState(null),
        [submitEnabled, setSubmitEnabled] = useState(false);
        

    const groupIdentifierKeyChangeHandler = (e) => {
        setGroupIdentifier(prev => e.target.value);
    }

    
    const evaluatorUriChangeHandler = (propName, evaluatorObjectIndex, arrIndex, e) => {
        e.preventDefault();
        setProductsListEvaluatorUris(prev => {
            let arr = [...prev];
            arr[arrIndex] = {[propName] : e.target.value, evaluatorIndex : evaluatorObjectIndex};

            return arr;
        });
    }

    const backButtonHandler = () => {
        history.goBack();
    }

    // bottom buttons event handlers        
    const stopScriptHandler = (e) => {
        e.preventDefault();

        if(scriptId)    {
            fetch(`${baseUrl}/api/script/kill-script-processes/${scriptId}`, {
                method : "GET",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken,
                },
                body : JSON.stringify({scriptId})
            })
            .then(res => {
                if(res.ok)  {
                    return res.json()
                } else  {
                    throw Error("We couldn't reach the server");
                }
            })
            .then(data => {
                setScriptRunning(prev => false);
                
            })
            .catch(err => {
                setScriptRunning(prev => true);
            });
        }
    }

    useEffect(() => {
        if(groupIdentifier !== null && groupIdentifier.trim() !== "")    {
            setSubmitEnabled(true)
        } else  {
            setSubmitEnabled(false)
        }

        console.log(submitEnabled);
    }, [productsListEvaluatorUris, groupIdentifier])

    const clearScrapingStates = () => {
        setScriptRunning(prev => false);
        setScrapingMessage(prev => null);
        setScrapingStatus(prev => null);
    }


    const runScraperScriptHandler = (e) => {
        e.preventDefault()

        setScriptRunning(prev => true);
        setScrapingMessage(prev => "Currently running the script...");
        setScrapingStatus(prev => "info");

        fetch(`${baseUrl}/api/script/create-script/${id}`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({groupIdentifier, productsListEvaluatorUris, evaluatorArgs})
        })
            .then(res => {
                if(res.ok)  {
                    return res.json()
                } else  {
                    throw Error("We couldn't reach the server");
                }
            })
            .then(data => {
                setScriptId(prev => data.scriptId);
                setTimeout(() => {
                    fetch(`${baseUrl}/api/script/execute-script/${data.scriptId}`, {
                        method : "POST",
                        headers : {
                            "Content-type" : "application/json",
                            "x-auth-token" : authToken,
                        },
                    })
                        .then(res => {
                            if(!res.ok)  {
                               throw Error("We couldn't reach the server."); 
                            }
                            return res.json();
                        })
                        .then(data => {
                            setScriptRunning(prev => false);
                            setScrapingStatus("success");
                            setScrapingMessage(`We have successfully scraped the ${productBrand} - ${groupIdentifier} from ${siteName}`)
                            setScrapedData(data.data.scrapedProducts);
                            setUnscrapedData(data.data.unscrapedProducts);
                        })
                        .catch(err => {
                            setScriptRunning(prev => false);
                            setScrapingMessage(err.message);
                            setScrapingStatus("error");

                        });
                }, 1500);
                

            })
            .catch(err => {
                setScriptRunning(prev => false);
                setScrapingMessage(err.message);
                setScrapingStatus(prev => "error");

                // setTimeout(() => clearScrapingStates(), 3000);
            });

    }



    // action button events handler

    const downloadZipHandler = (e) => {
        e.preventDefault();
        setDownloadingZip(true);


        fetch(`${baseUrl}/api/script/create-csv/${scriptId}`, {
            method : "GET",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
        })
            .then( res => res.json() )
            .then( data => {
                setDownloadingZip(false);

                let {filePath} = data,
                    downloadUrl = `${fileUrl}${fileToken}?filePath=${filePath}&qType=download`;
                

                let aElem = document.createElement("a");
                aElem.setAttribute("href", downloadUrl);
                aElem.setAttribute("download", true);
                aElem.setAttribute("target", "_blank");
                aElem.click();

                aElem.remove();
            })
            .catch(err => {
                setDownloadingZip(false);
            });
    }

    const saveDataHandler = (e) => {
        // /script/save-data/:scriptId
        e.preventDefault();
        // clearScrapingStates();
        setSavingToDb(true);
        setSavingDataMessage("Currently saving the data");
        setSavingDataStatus("info");


        fetch(`${baseUrl}/api/script/save-data/${scriptId}`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({apiRoute})
        })
            .then( res => res.json() )
            .then( data => {
                let {statusOk, message} = data;
                if(!statusOk)   {
                    throw Error(message);
                }
                setSavingDataMessage(message);
                setSavingDataStatus("success");

                let subApiRoute = apiRoute.replace("/api", ""),
                    url = `/scraped-data${subApiRoute}/all?${groupIdentifierKey}=${groupIdentifier}`;

                setTimeout(() => history.push(url), 3000);

            })
            .catch(err => {
                setSavingDataMessage(err.message);
                setSavingDataStatus("error");
            });
    }
 



    // useEffect

    useEffect(() => {
        if(scraperData._id)   {

            // we set the scraper data into its own states
            setEvaluatorIndexes(prev => {
                return scraperData.evaluatorObjects.reduce((a, b, index) => {
                    if(b.type === "list")   {
                        a.push(index);
                    }
                    return a;
                }, []);
            });
            
            setSiteName(prev => scraperData.siteName);
            setProductBrand(prev => scraperData.productBrand);
            setSiteUrl(prev => scraperData.siteUrl);
            setGroupIdentifierKey(prev => scraperData.groupIdentifierKey);
            setEvaluatorObjects(prev => scraperData.evaluatorObjects);
            setApiRoute(prev => scraperData.apiRoute);
            setCsvExcludedProps(prev => scraperData.csvExcludedProps);
            setUsage(prev => scraperData.usage);
        }
    }, [scraperData])

    useEffect(() => {
        setEvaluatorArgs(prev => {
            return evaluatorIndexes.reduce((a, b) => {
                a.push({evaluatorIndex : b, args : []});
                return a;
            }, []);
        });

    }, [evaluatorObjects, evaluatorIndexes]);

    useEffect(() => {
        
    }, [scriptRunning])
    
    return (
        <EmptyCardFlex className={styles["main-container"]}>
            {/* <pre style={{wordBreak : "break-word"}}>
                {JSON.stringify(scraperData, null, 4)}
            </pre> */}
            <h1 className="page-title">{pageTitle}</h1>
            {scrapingMessage && !savingDataStatus && <EmptyCardFlex className={styles["message-container-top"]}>
                {scrapingStatus &&
                    <Alert severity={scrapingStatus}>
                        {scrapingStatus === "info" && 
                            <>
                                <CircularProgress style={{height: "20px", width : "20px"}} color="primary"  />
                                &nbsp;&nbsp;&nbsp;
                            </>
                        }
                        {scrapingMessage}
                    </Alert>
                }
            </EmptyCardFlex>}


            {savingDataStatus && 
                <EmptyCardFlex className={styles["message-container-top"]}>
                {savingDataStatus &&
                    <Alert severity={savingDataStatus}>
                        {savingDataStatus === "info" && 
                            <>
                                <CircularProgress style={{height: "20px", width : "20px"}} color="primary"  />
                                &nbsp;&nbsp;&nbsp;
                            </>
                        }
                        {savingDataMessage}
                    </Alert>
                }
                </EmptyCardFlex>
            }



            { scriptRunning && 
                <Card>
                    Show data here...
                </Card>
            }


            {scrapingStatus === "success" && scrapedData &&

                <Card>
                    <h6 className={styles["section-title"]}>Scraped Data : <span className={styles["highlighted"]}>{productBrand}</span> - <span className={styles["highlighted-2"]}>{groupIdentifier}</span></h6>

                    <div className={styles["action-buttons-container"]}>
                        {!savingToDb &&
                            <Button type="button" onClick={saveDataHandler} variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<SaveIcon />} >
                                Save to Database
                            </Button>
                        }
                        {savingToDb &&
                            <Button type="button" onClick={saveDataHandler} variant="contained" size="small" disabled style={{}}color="secondary" disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />} >
                                Saving Scraped Data into our database...
                            </Button>
                        }
                        {!downloadingZip && <Button type="button" variant="contained" size="small" color="primary" onClick={downloadZipHandler} disableElevation startIcon={<DownloadIcon />}>
                            Download CSV files and Images
                        </Button>}

                        {downloadingZip && <Button type="button" variant="contained" size="small" color="primary" onClick={downloadZipHandler} disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                            Downloading CSV files and Images
                        </Button>}
                        
                    </div>


                    {scrapedData && <MuiTable tableData={scrapedData} excludedColumns={csvExcludedProps.filter(item => item !== "imagePaths")}></MuiTable>}
                </Card>
            } 
            {scrapingStatus === "success" && unscrapedData &&

                <Card>
                    <h6 className={styles["section-title"]}>UNSCRAPED Data : <span className={styles["highlighted"]}>{productBrand}</span> - <span className={styles["highligted-2"]}>{groupIdentifier}</span></h6>
                    {unscrapedData && <MuiTable tableData={unscrapedData} uniqueId="_id" excludedColumns={csvExcludedProps.filter(item => item !== "cardUri")}></MuiTable>}
                </Card>
            }


            <Card>
                {scraperData._id && <h5 className={styles["template-title"]}>Start scraping <span className={styles["highlighted"]}>{productBrand}</span> data from {siteName}</h5>}
                {!scraperData._id && <h5 className={styles["template-title"]}>{fetchMessage}</h5>}
                {usage && 
                <Alert severity="info" className={styles["usage"]}>
                    <h6 className={styles["section-title"]}>Usage</h6>
                    <p>{usage}</p>
                </Alert>}
                
                <div className={styles["field-container"]}>
                    <div className={styles["input-container"]}>
                        {  !scriptRunning && groupIdentifierKey &&
                            <FormControl fullWidth>
                                <TextField value={groupIdentifier || ""} onChange={groupIdentifierKeyChangeHandler} label={toNormalString(groupIdentifierKey)} />
                                {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                            </FormControl>
                        }

                        {
                            scriptRunning && 
                            <FormControl fullWidth>
                                <TextField value={groupIdentifier || ""} disabled onChange={groupIdentifierKeyChangeHandler} label={toNormalString(groupIdentifierKey)} />
                                {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                            </FormControl>
                        }

                    </div>
                    
                    {evaluatorIndexes.length > 0 && 
                        evaluatorIndexes.map((item, i) => {
                            return (
                                <div key={item} className={styles["input-container"]}>
                                    {!scriptRunning && groupIdentifierKey && 
                                        <FormControl fullWidth key={item}>
                                            <TextField onChange={evaluatorUriChangeHandler.bind(this, "url", item, i)} label={`Starting Poin URL`} />
                                            {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                                        </FormControl>
                                    }

                                    {
                                        scriptRunning && 
                                        <FormControl fullWidth key={item}>
                                            <TextField disabled onChange={evaluatorUriChangeHandler.bind(this, "url", item, i)} label={`Starting Poin URL`} />
                                            {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                                        </FormControl>
                                    }
                                </div>
                            )
                        })
                        
                    }
                </div>

                <Divider style={{margin : "1.4rem 0"}} />
                {scraperData._id && <div className={styles["buttons-container"]}>
                    
                    {scriptRunning && <Button onClick={backButtonHandler} type="button" disabled variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>}
                    {!scriptRunning && <Button onClick={backButtonHandler} type="button" variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>}


                    {/* Currently disabled as we don't have a way to stop the process... */}

                    {/* {scriptRunning && <Button onClick={stopScriptHandler} type="button" variant="contained" size="small" style={{backgroundColor : "rgb(201, 85, 85)", color : "white"}} disableElevation startIcon={<StopIcon />}>
                        Stop Scraping Process
                    </Button>}

                    {!scriptRunning && <Button onClick={stopScriptHandler} type="button" disabled variant="contained" size="small" disableElevation startIcon={<StopIcon />}>
                        Stop Scraping Process
                    </Button>} */}
                    
                    {/* <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disableElevation disabled startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />} >
                        Saving the Scraper Script
                    </Button> */}
                    {!scriptRunning && submitEnabled &&  <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disableElevation startIcon={<PlayIcon />} style={{color : "white", backgroundColor : "green"}}>
                        Run the script
                    </Button>}

                    {!scriptRunning && !submitEnabled &&  <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<PlayIcon />}>
                        Run the script
                    </Button>}

                    {scriptRunning && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                        Executing the Script...
                    </Button>}
                </div>}

                {!scraperData._id && 
                <div className={styles["buttons-container"]}>
                    <Button onClick={backButtonHandler} type="button" disabled variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>
                    {!scriptRunning && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<PlayIcon />}>
                        Run the script
                    </Button>}
                    
                </div>
                }
            </Card>
            
        </EmptyCardFlex>   
    )
}