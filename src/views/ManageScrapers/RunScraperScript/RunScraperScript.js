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

// progress bar
import LinearProgress from '@material-ui/core/LinearProgress';



// utils
import { toCapitalizeAll, toNormalString } from "../../../utilities/string";

// config
import { baseUrl, socketUrl, fileUrl } from "../../../config";


// styles
import styles from "./RunScraperScript.module.scss";
import { isObjectInArray } from "../../../utilities/objects-array";


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
        [productsTotal, setProductsTotal] = useState(null),


        [progress, setProgress] = useState(0),

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
                body : JSON.stringify({scriptId}),
                signal : abortCont.signal,
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
                if(err.name !== "AbortError")   {
                    setScriptRunning(prev => true);
                }
            });
        }
    }

    const clearScrapingStates = () => {
        setScriptRunning(prev => false);
        setScrapingMessage(prev => null);
        setScrapingStatus(prev => null);
    }

    
    const runScraperScriptHandler = (e) => {
        e.preventDefault()

        // reset the other states for downloading process.
        setCurrentScrapedProducts(prev => null);
        setCurrentShownData(prev => []);
        setProductsTotal(prev => null);

        setScrapedData(null);
        setUnscrapedData(null);

        setScriptRunning(prev => true);
        setScrapingMessage(prev => "Currently running the script...");
        setScrapingStatus(prev => "info");

        fetch(`${baseUrl}/api/script/create-script/${id}`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({groupIdentifier, productsListEvaluatorUris, evaluatorArgs}),
            signal : abortCont.signal,
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
                        signal : abortCont.signal,
                    })
                        .then(res => {
                            if(!res.ok)  {
                               throw Error("We couldn't reach the server."); 
                            }
                            return res.json();
                        })
                        .then(data => {
                            setScriptRunning(prev => true);
                            setScrapingStatus("info");
                            setScrapingMessage(`We are now scraping the data for ${productBrand} - ${groupIdentifier} from ${siteName}`)
                        })
                        .catch(err => {
                            if(err.name !== "AbortError")   {
                                setScriptRunning(prev => false); 
                                setScrapingMessage(err.message);
                                setScrapingStatus("error");
                            }
                            
                        });
                }, 1500);
                

            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setScriptRunning(prev => false);
                    setScrapingMessage(err.message);
                    setScrapingStatus(prev => "error");
                }
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


            abortCont.abort();
        }
    }, []);



    /* SOCKET IO CONNECTION */
    
    socket.on("current-process", (data) => {
        if(scriptId === data.scriptId)  {

            
            if(data.phase === "initial-scraping")   {
                setCurrentProcess(prev => data);
                if(data.totalProducts)  {
                    setProductsTotal(prev => data.totalProducts)
                }
            }

            if(data.phase === "data-scraping")  {
                if(currentProcess && typeof currentProcess.phase !== "undefined" && currentProcess.phase === "initial-scraping") {
                    setCurrentProcess(prev => data);
                }
                if(data.totalScrapedData > totalScrapedData)  {
                    setTotalScrapedData(prev => {
                        return data.totalScrapedData;
                    });
                    setProgress(prev => (Number(totalScrapedData) / Number(productsTotal)) * 100 );
                }
                
            }


            if(data.phase === "set-rescraping") {
                setRescraping(prev => true);
                if(data.totalUnscrapedData > 0 && totalUnscrapedData !== data.totalUnscrapedData)    {
                    setTotalUnscrapedData(prev => data.totalUnscrapedData);
                    setTotalScrapedData(prev => {
                        return data.totalScrapedData;
                    });
                    setProgress(prev => (Number(data.totalScrapedData) / Number(data.totalUnscrapedData)) * 100 );
                }
            }


            if(data.phase === "data-rescraping")    {
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


            if(data.phase === "image-downloading")   {
                if(currentProcess &&  (currentProcess.phase === "data-scraping" || currentProcess.phase === "data-rescraping")) {
                    setCurrentProcess(prev => data);
                }
                if(scrapingMessage !== `We are now downloading the images for the scraped the data : ${productBrand} - ${groupIdentifier} from ${siteName}`)    {
                    setScrapingMessage(`We are now downloading the images for the scraped the data : ${productBrand} - ${groupIdentifier} from ${siteName}`);
                }
                
            }

            if(data.phase === "finalizing")  {
                setScriptRunning(prev => false);
                setScrapingStatus("success");
                setScrapingMessage(`We have successfully scraped the data for ${productBrand} - ${groupIdentifier} from ${siteName}`);

                setCurrentProcess(prev => null);
                setScrapedData(data.data);
                setUnscrapedData(data.unscrapedData);

            }
        }
    });

    
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
                            <p>By default we are rescraping the unscraped data, until we at least have 5 rows of unscraped data left or lower; or if we have done rescraping the data for at least 5 times.</p>
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
                    
                    {scriptRunning && <Button onClick={backButtonHandler} type="button" disabled variant="contained" size="small" style={{}}color="secondary" disableElevation startIcon={<PreviousIcon />} >
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