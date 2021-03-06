// hooks
import { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import useFetch from "../../hooks/useFetch";


// Components
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import MuiTable from "../../components/MuiTable";
import { Button, FormControl, CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import DownloadIcon from '@material-ui/icons/GetApp';
import Select from "../../components/Select";


//config
import { baseUrl, fileUrl } from "../../config/"; 
import { toNormalString } from "../../utilities/string";


// styles
import styles from "./ScrapedData.module.scss";

export default function ManageScrapedData({pageTitle}) {


    let {authToken, fileToken} = useAuth(),

        // collections of data
        {data : siteResources, fetchMessage, isLoading : fetchLoading} = useFetch(`/api/site-resources/`, {}, []),
        {data : scrapers } = useFetch(`/api/scrapers/`, {}, []),
        {data : productSets} = useFetch(`/api/product-sets`, {}, []),
        

        // filtered data
        [filteredScrapers, setFilteredScrapers] = useState([]),
        [filteredProductSets, setFilteredProductSets] = useState([]),
        [siteResource, setSiteResource] = useState(null),
        [scraper, setScraper] = useState(null),
        [productSet, setProductSet] = useState(null),


        // productsData;

        [productsData, setProductsData] = useState([]),


        // next action states // downloading and saving;
        [isLoading, setIsLoading] = useState(false),
        [message, setMessage] = useState(null),
        [status, setStatus] = useState(null),
        [downloadingZip, setDownloadingZip] = useState(false),

        // abort Controller
        abortCont = new AbortController();




    // set site resource by select
    const selectSiteResourceHandler = (value) => {
        setSiteResource(prev => siteResources.find(item => item.siteName === value));
        setFilteredScrapers(prev => {
            return scrapers.filter(item => item.siteName === value);
        });
        setFilteredProductSets(prev => []);
        setProductSet(prev => null);
        setScraper(prev => null);
        setDownloadingZip(prev => false);
    }

    // set productBrand by select
    const selectScraperHandler = (value) => {
        setScraper(prev => filteredScrapers.find(item => item.productBrand === value));
        setFilteredProductSets(prev => {
            return productSets.filter(item => item.productBrand === value)
        });
        setProductSet(prev => null);
    }

    // productSet handler
    const selectProductSetHandler = (value) => {
        setProductSet(prev => filteredProductSets.find(item => item.groupIdentifier === value));
    }

    const createUrl = () => {
        let url = `${baseUrl}`;
        if(scraper) {
            url += `${scraper.apiRoute}/`;
            if(productSet)  {
                url += `all?${scraper.groupIdentifierKey}=${productSet.groupIdentifier}`;
            }
            return url;
        } else  {
            return null;
        }
        
    }


    const downloadZipHandler = (e) => {
        e.preventDefault();
        setDownloadingZip(true);

        let { dataDirPath : dirPath, productBrand, groupIdentifier, siteName } = productSet,
            { apiRoute } = scraper;
        // productsData
            

        fetch(`${baseUrl}/api/script/create-csv-saved-data/`, {
            method : "POST",
            headers : {
                "Content-type" : "application/json",
                "x-auth-token" : authToken,
            },
            body : JSON.stringify({dirPath, siteName, productBrand, groupIdentifierKey : scraper.groupIdentifierKey, groupIdentifier, apiRoute, csvExcludedProps : scraper.csvExcludedProps}),
            signal : abortCont.signal,
        })
            .then( res => res.json() )
            .then( data => {
                setDownloadingZip(false);

                let {filePath} = data,
                    downloadUrl = `${fileUrl}${fileToken}?filePath=${filePath}&qType=download`;
                
                // console.log(data);

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
                    console.log(err.message);
                }
            });
    }


    // side effects

    useEffect(() => {
        if(fetchLoading)    {
            setIsLoading(prev => fetchLoading);
            setMessage(prev => fetchMessage);
            setStatus(prev => "info");
        } else  {
            setStatus(null);
            setMessage(null);
            setIsLoading(null);
        }
        

    }, [fetchLoading, fetchMessage])

    useEffect(() => {
        let url = createUrl();

        if(url) {

            setIsLoading(prev => true);
            setStatus(prev => "info");
            setMessage("Currently Loading data...");

            fetch(url, {
                method : "GET",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken,
                },
                signal : abortCont.signal,
            })
                .then(res => {
                    if(!res.ok) {
                        throw Error("We couldn't reach the server...")
                    }
                    return res.json();
                })
                .then(data => {
                    setProductsData(prev => data);
                    if(data.length) {
                        

                        setIsLoading(prev => false);
                        setStatus(prev => "success");
                        setMessage("We have successfully fetched the data");
                    } else  {
                        setIsLoading(prev => false);
                        setStatus(prev => "success");
                        setMessage("Query is valid, although we don't have any saved data for this set of products.");
                    }
                    
                })
                .catch(err => {
                    console.log(err)
                    // setIsLoading(prev => false);
                    // setStatus(prev => "error");
                    // setMessage(err.message);
                })

        } else  {
            setProductsData(prev => []);
        }

    }, [scraper, productSet]);

    useEffect(() => {

        return () => abortCont.abort();
    }, []); 
    
    return  (
        <EmptyCardFlex className={styles["main-container"]}>  
            <h1 className="page-title">{pageTitle}</h1>

            

            <EmptyCardFlex >
                <Card>
                {!siteResource && !isLoading && <h3 className={styles["template-section-title"]}>Please use the filter to display data...</h3>}
                {siteResource && !productSet && !isLoading && productsData.length === 0 && <h3 className={styles["template-section-title"]}>We currently have no data to display</h3>}
                
                {isLoading && <h3 className={styles["template-section-title"]}>Currently Loading the scraped data</h3>}

                {/* scraper productBrand !productSet */}
                {scraper && !productSet && !isLoading && productsData.length > 0 && <h3 className={styles["template-section-title"]}>Showing the scraped for <span className={styles["highlighted"]}>{scraper.productBrand}</span></h3>}
                
                {/* scraper productBrand !productSet */}
                {scraper && !isLoading && productSet && productsData.length === 0 && <h3 className={styles["template-section-title"]}>We currently have no data for <span className={styles["highlighted"]}>{scraper.productBrand}</span> - <span className={styles["highlighted-2"]}>{productSet.groupIdentifier}</span></h3>}

                {/* scraper productBrand productSet */}
                {scraper && !isLoading && productSet && productsData.length > 0 && <h3 className={styles["template-section-title"]}>Showing the scraped data for <span className={styles["highlighted"]}>{scraper.productBrand}</span> - <span className={styles["highlighted-2"]}>{productSet.groupIdentifier}</span></h3>}
                <div className={styles["select-container"]}>
                    {siteResources.length > 0 && scrapers.length > 0 && <FormControl style={{width : "auto"}}>
                        <Select value={siteResource} selectOnchangeHandler={selectSiteResourceHandler} label="Site Resource" options={siteResources.map(item=> ({...item, labelName : `${item.siteName} - ${item.siteUrl}`}))} uniqueProp="siteName" optionLabelProp="labelName" ></Select>
                    </FormControl>
                    }

                    {filteredScrapers.length > 0 && productSets.length > 0 &&
                    <FormControl style={{width : "auto"}}>
                        <Select value={scraper} selectOnchangeHandler={selectScraperHandler} label="Product Line / Brand" options={filteredScrapers} uniqueProp="productBrand" optionLabelProp="productBrand" ></Select>
                    </FormControl>
                    }

                    {filteredProductSets.length > 0 && 
                    <FormControl style={{width : "auto"}}>
                        <Select value={productSet} selectOnchangeHandler={selectProductSetHandler} label={toNormalString(scraper.groupIdentifierKey)} options={filteredProductSets} uniqueProp="groupIdentifier" optionLabelProp="groupIdentifier" ></Select>
                    </FormControl>
                    }

                    
                </div>
                </Card>
            </EmptyCardFlex>  
            {isLoading && 
                <EmptyCardFlex className={styles["message-container-top"]}>
                {message &&
                    <Alert severity={status}>
                        {status === "info" && 
                            <>
                                <CircularProgress style={{height: "20px", width : "20px"}} color="primary"  />
                                &nbsp;&nbsp;&nbsp;
                            </>
                        }
                        {message}
                    </Alert>
                }
                </EmptyCardFlex>
            }
            <EmptyCardFlex style={{display : "grid"}}>
            {productsData.length > 0 && 
                <Card>
                    {productSet && <div className={styles["action-buttons-container"]}>
                       
                        {!downloadingZip && <Button type="button" variant="contained" size="small" color="primary" onClick={downloadZipHandler} disableElevation startIcon={<DownloadIcon />}>
                            Download CSV files and Images
                        </Button>}

                        {downloadingZip && <Button type="button" variant="contained" size="small" color="primary" onClick={downloadZipHandler} disabled disableElevation startIcon={<CircularProgress style={{height: "20px", width : "20px"}} color="secondary"  />}>
                            Downloading CSV files and Images
                        </Button>}
                        
                    </div>}

                    <MuiTable tableData={productsData} uniqueId="_id" excludedColumns={["imageUris", "dateCreated", "cardUri", "__v", "productUri", "multiFaced"]}></MuiTable>

                </Card>
            }
            </EmptyCardFlex>
        </EmptyCardFlex>
    )
}