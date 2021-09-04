// hooks
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useFetch from "../../../hooks/useFetch";
import { useParams } from "react-router";
import  { baseUrl } from "../../../config";

// Components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import MuiTable from "../../../components/MuiTable";


// styles
import styles from "./ScrapedDataTable.module.scss"


export default function ManageScrapedData({pageTitle}) {

    let { authToken } = useAuth(),
        { apiRoute } = useParams(),
        { data : scraperDetails } = useFetch(`/api/scrapers/single?apiRoute=/api/${apiRoute}`),
        [productData, setProductData] = useState(null),
        [siteName, setSiteName] = useState(""),
        [productBrand, setProductBrand] = useState(""),
        [isLoading, setIsLoading] = useState(false),
        [hasError, setHasError] = useState(false),
        abortCont = new AbortController();
        

    useEffect(() => {
        if(scraperDetails.apiRoute)    {
            let queryString = window.location.search;

            setIsLoading("We are currently loading the data...");
            setSiteName(prev => scraperDetails.siteName);
            setProductBrand(prev => scraperDetails.productBrand);


            fetch(`${baseUrl}${scraperDetails.apiRoute}/all${queryString}`, {
                method : "GET",
                headers : {
                    "x-auth-token" : authToken,
                },
                signal : abortCont.signal
            })
                .then(res => res.json())
                .then(dataObject => {
                    setIsLoading(false);
                    
                    if(Array.isArray(dataObject))    {
                        setHasError(false);
                        setProductData(prev => dataObject);
                    } else  {
                        throw Error(dataObject.message)
                    }
                })
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        setHasError(err.message);
                    }
                })
        }


        return () => abortCont.abort();
    }, [scraperDetails])

    return  (
        <>  
            

            <EmptyCardFlex className={styles["main-container"]}>
                    
                <Card>
                    {siteName && !isLoading && !hasError &&
                        <h1 className="page-title">{siteName} - <span className={styles["highlighted"]}>{productBrand}</span></h1>}
                    {!siteName && !isLoading && !hasError &&
                        <h1 className="page-title">{pageTitle}</h1>}
                    {isLoading && !hasError && <h1 className="page-title">{isLoading}</h1>}
                    {hasError && <h1 className="page-title">{hasError}</h1>}


                    {productData && <MuiTable tableData={productData} uniqueId="_id" excludedColumns={["imageUris", "dateCreated", "cardUri", "__v", "productUri", "multiFaced"]}></MuiTable>}
                </Card>
            </EmptyCardFlex>  
        </>
    )
}