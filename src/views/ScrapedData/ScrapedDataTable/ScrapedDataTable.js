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
import Alert from '@material-ui/lab/Alert';
import { CircularProgress } from '@material-ui/core';


// styles
import styles from "./ScrapedDataTable.module.scss"


export default function ManageScrapedData({pageTitle}) {

    let { authToken } = useAuth(),
        { apiRoute } = useParams(),
        { data : productSet } = useFetch(`/api/product-sets/single?apiRoute=/api/${apiRoute}`),
        [productData, setProductData] = useState(null),
        [siteName, setSiteName] = useState(""),
        [productBrand, setProductBrand] = useState(""),



        [message, setMessage] = useState(null),
        [status, setStatus] = useState(null),
        [isLoading, setIsLoading] = useState(false),
        [hasError, setHasError] = useState(false),
        abortCont = new AbortController();
        

    useEffect(() => {
        if(productSet.apiRoute)    {
            let queryString = window.location.search;

            setMessage("We are currently loading the data...");
            setStatus("info");
            setIsLoading(true);
            setSiteName(prev => productSet.siteName);
            setProductBrand(prev => productSet.productBrand);


            fetch(`${baseUrl}${productSet.apiRoute}/all${queryString}`, {
                method : "GET",
                headers : {
                    "x-auth-token" : authToken,
                },
                signal : abortCont.signal
            })
                .then(res => res.json())
                .then(dataObject => {

                    if(Array.isArray(dataObject))    {
                        setProductData(prev => dataObject);
                    } else  {
                        throw Error(dataObject.message)
                    }

                    setMessage("All data shown here are the ones we just saved into our database.");
                    setStatus("success");
                    setIsLoading(false);
                    
                    
                })
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        setMessage("We have successfully fetched the data from the database.");
                        setStatus("error");
                        setIsLoading(false);
                    }
                })
        }


        return () => abortCont.abort();
    }, [productSet])

    return  (
        <>  
            

            <EmptyCardFlex className={styles["main-container"]}>
                {message && <EmptyCardFlex style={{padding : ".7rem 0"}}>
                    <Alert severity={status}>{isLoading && <CircularProgress style={{height: "20px", width : "20px"}}></CircularProgress>}{message}</Alert>
                </EmptyCardFlex>}
                <Card>
                    {siteName && 
                        <h1 className="page-title">{siteName} - <span className={styles["highlighted"]}>{productBrand}</span></h1>}
                    {!siteName && !message &&
                        <h1 className="page-title">{pageTitle}</h1>}
                    {productData && <MuiTable tableData={productData} uniqueId="_id" excludedColumns={["imageUris", "dateCreated", "cardUri", "__v", "productUri", "multiFaced"]}></MuiTable>}
                </Card>
            </EmptyCardFlex>  
        </>
    )
}