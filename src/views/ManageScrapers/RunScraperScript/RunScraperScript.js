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
import EditIcon from '@material-ui/icons/Edit';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import MuiTable from "../../../components/MuiTable";

// progress bar
import LinearProgress from '@material-ui/core/LinearProgress';


// utils
import { toCapitalizeAll, toNormalString } from "../../../utilities/string";

// config
import { baseUrl, socketUrl, fileUrl } from "../../../config";


// styles
import styles from "./RunScraperScript.module.scss";


// socket.io
const socket = io(`${socketUrl}`);


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
        [submitEnabled, setSubmitEnabled] = useState(false),

        // io currentProcess
        [currentProcess, setCurrentProcess] = useState(null),
        [currentScrapedProducts, setCurrentScrapedProducts] = useState(0),
        [rescraping, setRescraping] = useState(false),
        [totalScrapedData, setTotalScrapedData] = useState(0),
        [totalUnscrapedData, setTotalUnscrapedData] = useState(0),
        [currentShownData, setCurrentShownData] = useState([]),
        [productsTotal, setProductsTotal] = useState(0),


        [progress, setProgress] = useState(0),

        [runningScriptObject, setRunningScriptObject] = useState(null),

        // fixing the scripts
        [fixingScript, setFixingScript] = useState(false),
        [fixScriptButtonEnabled, setFixScriptButtonEnabled] = useState(false),

        abortCont = new AbortController();


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


    const runScraperScriptHandler = (e) => {
        e.preventDefault();

        resetStates();

        // reset the other states for downloading process.
        setCurrentScrapedProducts(prev => null);
        setCurrentShownData(prev => []);
        setProductsTotal(prev => 0);

        setScrapedData(null);
        setUnscrapedData(null);

        setScriptRunning(prev => true);
        setScrapingMessage(prev => "Currently running the script...");
        setScrapingStatus(prev => "info");


        socket.emit("run-script", {scraperId : id, groupIdentifier, productsListEvaluatorUris, evaluatorArgs});

    }

    const scriptRewriteHandler = () => {
        setScrapingMessage("Currently fixing the script...");
        setScrapingStatus("info");
        setFixingScript(true);

        fetch(`${baseUrl}/api/scrapers/${id}`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            }
        })
            .then(res => res.json())
            .then(data => {
                setScrapingMessage(data.message);
                setScrapingStatus("success");
                setFixingScript(false);
            })
            .catch(err => {
                setScrapingMessage(err.message);
                setScrapingStatus("error");
                setFixingScript(false);
            })

    }

    const resetStates = () => {

        setScriptRunning(prev => false);
        setScrapingMessage(prev => null);
        setScrapingStatus(prev => null);

        setScriptId(null);

        setScrapedData(null);
        setUnscrapedData(null);

        setCurrentProcess(prev => null);
        setCurrentScrapedProducts(0);
        setRescraping(false);
        setTotalScrapedData(0);
        setTotalUnscrapedData(null);
        setCurrentShownData([]);
        setProductsTotal(0);
        setProgress(0);
        
        setDownloadingZip(false);
        setSavingToDb(false);
        setSavingDataMessage(null);
        setSavingDataStatus(null);
    }

    
    /* SOCKET IO CONNECTION */
    /*
        script-initialization-ready
        script-initialization-error
        initializing
        list-evaluator-finished
        data-scraping
        data-rescraping
        set-rescraping
        image-downloading
        finished-scraping
    */

    //script-initialization-ready
    socket.off("script-initialization-ready").on("script-initialization-ready", function(data)  {
        setScriptId(prev => {
            setScriptRunning(prev => true);
            setScrapingStatus("info");
            setScrapingMessage(`We are now scraping the data for ${productBrand} - ${groupIdentifier} from ${siteName}`);


           return data.scriptId;
        });
        socket.emit("initialize", {status : 200, message : "Ready to scrape data."});
    });

    // Error
    socket.off("script-initialization-error").on("script-initialization-error", function(data)  {
        // if(scriptId === data.scriptId)  {
        setScriptRunning(prev => false);
        setScrapingMessage(prev => data.message);
        setScrapingStatus(prev => "error");
        if(data.message.toLowerCase().includes("cannot find module"))   {
            setFixScriptButtonEnabled(true);
            console.log("fix must be enabled..");
        }
        // }
    });


    // handling script running events;
    socket.off("initializing").on("initializing", function(data)  {
        if(scriptId === data.scriptId)  {
            setCurrentProcess(prev => data);
        }
    });

    // initial evaluator finished
    socket.off("list-evaluator-finished").on("list-evaluator-finished", function(data)  {
        if(scriptId === data.scriptId)  {
            setCurrentProcess(prev => data);
            if(data.totalProducts)  {
                setProductsTotal(prev => data.totalProducts)
            }
        }
    });

    // initial single-product-scraping
    socket.off("data-scraping").on("data-scraping", function(data)  {
        if(scriptId === data.scriptId)  {
            if(currentProcess && typeof currentProcess.phase !== "undefined" && currentProcess.phase === "initial-scraping") {
                setCurrentProcess(prev => data);
            }
            if(data.totalScrapedData > totalScrapedData)  {
                setTotalScrapedData(prev => {
                    return data.totalScrapedData;
                });
                setProgress(prev => (Number(data.totalScrapedData) / Number(productsTotal)) * 100 );
            }
        }
    });

    // rescraping single-product pages
    socket.on("set-rescraping", function(data)  {
        if(scriptId === data.scriptId)  {
            setRescraping(prev => true);
            if(data.totalUnscrapedData > 0 && totalUnscrapedData !== data.totalUnscrapedData)    {
                setTotalUnscrapedData(prev => data.totalUnscrapedData);
                setTotalScrapedData(prev => {
                    return data.totalScrapedData;
                });
                setProgress(prev => (Number(data.totalScrapedData) / Number(data.totalUnscrapedData)) * 100 );
            }
        }
    });

    // rescraping single-product pages
    socket.on("data-rescraping", function(data)  {
        if(scriptId === data.scriptId)  {
            if(currentProcess && typeof currentProcess.phase !== "undefined" && currentProcess.phase === "data-scraping") {
                setCurrentProcess(prev => data);
            }
            if(data.totalScrapedData > totalScrapedData)  {
                setTotalScrapedData(prev => {
                    return data.totalScrapedData;
                });

                setProgress(prev => (Number(data.totalScrapedData) / Number(totalUnscrapedData)) * 100 );
            }
        }
    });

    // image downloading
    socket.off("image-downloading").on("image-downloading", function(data)  {
        if(scriptId === data.scriptId)  {
            if(currentProcess &&  (currentProcess.phase === "data-scraping" || currentProcess.phase === "data-rescraping")) {
                setCurrentProcess(prev => data);
            }
            if(scrapingMessage !== `We are now downloading the images for the scraped the data : ${productBrand} - ${groupIdentifier} from ${siteName}`)    {
                setScrapingMessage(`We are now downloading the images for the scraped the data : ${productBrand} - ${groupIdentifier} from ${siteName}`);
            }
        }
    });

    // scraping finished;
    socket.off("finished-scraping").on("finished-scraping", function(data)  {
        if(scriptId === data.scriptId)  {
            setScriptRunning(prev => false);
            setScrapingStatus("success");
            setScrapingMessage(`We have successfully scraped the data for ${productBrand} - ${groupIdentifier} from ${siteName}`);


            setCurrentProcess(prev => null);
            setScrapedData(data.data);
            setUnscrapedData(data.unscrapedData);
            
        }
    });

    socket.off("connect").on("connect", () => {
        setScrapingMessage(prev => "We are now ready to start scraping");
        setScrapingStatus(prev => "success");
        setScriptRunning(false);
    }) 

    socket.off("disconnect").on("disconnect", () => {
        resetStates();

        setScriptRunning(prev => false);
        setScrapingMessage(prev => "You have been disconnected from the server.");
        setScrapingStatus(prev => "error");
    });



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
            signal : abortCont.signal,
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
                if(err.name !== "AbortError")   {
                    setDownloadingZip(false);
                }
            });
    }

    const saveDataHandler = (e) => {
        e.preventDefault();
        setSavingToDb(true);
        setSavingDataMessage("Currently saving the data");
        setSavingDataStatus("info");


        fetch(`${baseUrl}/api/script/save-data/${scriptId}`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({apiRoute, scraperId : id}),
            signal : abortCont.signal,
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
                if(err.name !== "AbortError")   {
                    setSavingDataMessage(err.message);
                    setSavingDataStatus("error");
                }
            });
    }
 

    // useEffect

    useEffect(() => {
        if(groupIdentifier !== null && groupIdentifier.trim() !== "")    {
            setSubmitEnabled(true)
        } else  {
            setSubmitEnabled(false)
        }

    }, [productsListEvaluatorUris, groupIdentifier])


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
        
        // fires up on dismounting of component

        return () => {
            fetch(`${baseUrl}/api/script/remove-scraper-object/${scriptId}`, {
                method : "POST",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken,
                },
                body : JSON.stringify({apiRoute}),
                signal : abortCont.signal,
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        console.log(err.name);
                    }
                });
        }
    }, []);

    

    // prevent navigation while script running
    useEffect(() => {
        
        function removeClick(e) {
            e.preventDefault()
            alert("Please do not navigate to any page while the script is running... try opening the pages on new tabs");
        }
        if(scriptRunning)   {
            Array.from(document.querySelectorAll("a")).forEach(item => {
                item.addEventListener("click", removeClick);
            });
        } else  {
            Array.from(document.querySelectorAll("a")).forEach(item => {
                item.removeEventListener("click", removeClick);
            });
        }

        return () => {
            Array.from(document.querySelectorAll("a")).forEach(item => {
                item.removeEventListener("click", removeClick);
            });
        }
    }, [scriptRunning]);

    
    
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



            { scriptRunning && currentProcess && 
                <Card>
                    {!rescraping && 
                        <>
                            <h6 className={styles["template-section-title"]}>{toCapitalizeAll(toNormalString(currentProcess.phase, "url"))} - Total number of products to scrape : <span className={styles["highlighted-2"]}>{productsTotal}</span></h6>
                            <h6 className={styles["template-section-title"]}>Current Scraped Products : <span className={styles["highlighted-2"]}>{totalScrapedData}</span> / <span className={styles["highlighted-2"]}>{productsTotal}</span></h6>
                        </>
                    }

                    {rescraping && 
                        <>
                            <h6 className={styles["template-section-title"]}>{toCapitalizeAll(toNormalString(currentProcess.phase, "url"))} - Total number of products to scrape : <span className={styles["highlighted-2"]}>{productsTotal}</span></h6>
                            <h6 className={styles["template-section-title"]}>We are currently rescraping : <span className={styles["highlighted-2"]}>{totalScrapedData}</span> / <span className={styles["highlighted-2"]}>{totalUnscrapedData}</span> </h6>
                            <p className={styles["highlighted-2"]} style={{fontSize: ".8rem"}}>By default we are rescraping data, until we have 5 or lower rows of unscraped data left; or if we have done rescraping the data for at least 5 times.</p>
                        </>
                    }
                    {!rescraping && currentProcess && currentProcess.phase === "image-download" &&
                        <>
                            <h6 className={styles["template-section-title"]}>We have already finished rescraping. We are now downloading the images for the scraped products. Scraping process will finish shortly.</h6>
                        </>
                    }

                    <LinearProgress variant="determinate" value={progress}  />

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


                    {scrapedData && <MuiTable tableData={scrapedData} uniqueId="cardUri" excludedColumns={csvExcludedProps.filter(item => item !== "imagePaths")}></MuiTable>}
                </Card>
            } 
            {scrapingStatus === "success" && unscrapedData &&

                <Card>
                    <h6 className={styles["section-title"]}>UNSCRAPED Data : <span className={styles["highlighted"]}>{productBrand}</span> - <span className={styles["highligted-2"]}>{groupIdentifier}</span></h6>
                    {unscrapedData && <MuiTable tableData={unscrapedData} uniqueId="cardUri" excludedColumns={csvExcludedProps.filter(item => item !== "cardUri")}></MuiTable>}
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

                    {!scriptRunning && !fixingScript &&
                        <>
                            <Button onClick={backButtonHandler} type="button" variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                                Back
                            </Button>
                            {
                                submitEnabled && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disableElevation startIcon={<PlayIcon />} style={{color : "white", backgroundColor : "green"}}>
                                    Run the script
                                </Button>
                            }
                            {
                                !submitEnabled && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<PlayIcon />}>
                                    Run the script
                                </Button>
                            }
                        </>
                    }

                    {
                        (scriptRunning || fixingScript) && 
                        <>
                            <Button onClick={backButtonHandler} type="button" disabled variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                                Back
                            </Button>
                            {   
                                !fixingScript && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                                    Executing the Script...
                                </Button>
                            }
                            {   
                                fixingScript && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<PlayIcon />}>
                                    Run the Script
                                </Button>
                            }
                        </>
                    }

                    
                    {/* {scriptRunning && <Button onClick={backButtonHandler} type="button" disabled variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>}
                    {!scriptRunning && <Button onClick={backButtonHandler} type="button" variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>}


                    {!scriptRunning && submitEnabled &&  <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disableElevation startIcon={<PlayIcon />} style={{color : "white", backgroundColor : "green"}}>
                        Run the script
                    </Button>}

                    {!scriptRunning && !submitEnabled &&  <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<PlayIcon />}>
                        Run the script
                    </Button>}

                    {scriptRunning && <Button type="button" variant="contained" size="small" color="primary" onClick={runScraperScriptHandler} disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                        Executing the Script...
                    </Button>} */}


                    {/* quick script fix */}
                    {fixScriptButtonEnabled && 
                    
                    <>
                        {fixingScript && <Button type="button" variant="contained" size="small" color="primary" onClick={scriptRewriteHandler}  disableElevation disabled startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                            Fixing the script
                        </Button>}
                        {!fixingScript && <Button type="button" variant="contained" size="small" style={{backgroundColor : "#4c7dab", color : "white"}} onClick={scriptRewriteHandler} disableElevation startIcon={<EditIcon />}>
                            Automated Script Fix
                        </Button>}
                    </>
                    }
                    {!fixScriptButtonEnabled && <Button type="button" variant="contained" size="small" color="primary" onClick={scriptRewriteHandler} disabled disableElevation startIcon={<EditIcon />}>
                        Automated Script Fix
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