import {useState, useEffect} from "react";
import  { baseUrl } from "../config";
import useAuth from "./useAuth";

export default function useFetch(apiEndPoint, fetchOptions, initialValue = [])  {

    let [data, setData] = useState(initialValue),
        [isLoading, setIsLoading] = useState(false),
        [hasError, setHasError] = useState(false),
        [fetchMessage, setFetchMessage] = useState(null),
        { authToken } = useAuth(),
        abortCont = new AbortController();


    useEffect(async () => {
        setIsLoading(true);
        setFetchMessage(prev => "We are currently fetching the data from the database.");
        setHasError(false);
        if(authToken)   {
            fetch(`${baseUrl}${apiEndPoint}`, {
                ...fetchOptions,
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
            .then(jsonData => {
                setIsLoading(false);
                setHasError(false);
                setFetchMessage(prev => "We have successfully fetched the data.");
                setData(prev => jsonData);
            })
            .catch(err => {
                if(err.name !== "AbortError")   {
                    setIsLoading(false);
                    setHasError(true);
                    setFetchMessage(err.message);
                }
            })

            return () => abortCont.abort();
        }
        
    }, [authToken]);

    return {data, setData, isLoading, hasError, fetchMessage};
}