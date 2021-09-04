import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";

// Components
import { Button, TextField } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';

// config
import { baseUrl } from "../../config";

// styles
import styles from "./CreateSiteResource.module.scss";


export default function CreateSiteResource({siteResourceHandler, setSelectHandler, createReadyHandler}) {

    let [siteResource, setSiteResource] = useState({siteName : "", siteUrl : ""}),
        [message, setMessage] = useState(null),
        [isLoading, setIsLoading] = useState(false),
        [messageType, setMessageType] = useState(null),
        { authToken } = useAuth(),
        url = `${baseUrl}/api/site-resources`,
        abortCont = new AbortController();

    const submitHandler = (e) => {
        e.preventDefault();
        

        let { siteName, siteUrl } = siteResource;
        if((siteName.trim().length) && (siteUrl.trim().length)) {
            setMessage(null);
            setMessageType(null);
            setIsLoading(true);

            fetch(url, {
                method : "POST",
                headers : {
                    "Content-type" : "application/json",
                    "x-auth-token" : authToken
                },
                body : JSON.stringify(siteResource),
                signal : abortCont.signal
            })
                .then(res => {
                    return res.json();
                })
                .then(data => {
                    if(data.statusOk)   {
                        setMessage('you have successfully saved the data');
                        setMessageType("success");
                        siteResourceHandler(data.data);
                        setTimeout(() => createReadyHandler(), 777);
                    } else  {
                        throw Error(`Data NOT SAVED : ${data.message}`);
                    }
                    setIsLoading(false);
                })
                .catch(err => {
                    if(err.name !== "AbortError")   {
                        setMessage(err.message);
                        setMessageType("error");
                        setIsLoading(false);
                    }
                });
        } else  {
            setMessage(prev => "Please make sure that the Site Name and Site URL fields are not empty.");
            setMessageType(prev => "error");
        }

        
    }   


    const changeHandler = (inputName, e) => {
        setSiteResource(prev => ({...prev, [inputName] : e.target.value}));
    }


    useEffect(() => {

        // clearing memory leaks on unmount.
        return () => abortCont.abort();
    }, []);

    return (
        <div className={styles["form-container"]}>
            <h6 className={styles["template-title"]}>Create a new Site Resource</h6>
            <form onSubmit={submitHandler} className={styles.form} noValidate autoComplete="off">
                <div className={styles["input-container"]}>
                    <TextField onChange={changeHandler.bind(this, "siteName")} label="Site Name" />
                    <TextField onChange={changeHandler.bind(this, "siteUrl")} id="siteUrl" label="Site URL" />
                </div>
                
                {true && 
                    <div className={styles["buttons-container"]}>
                    {!isLoading && <Button type="submit" variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />} >
                        Save
                    </Button>}
                    {isLoading && <Button type="submit" variant="contained" size="small" color="primary" disableElevation disabled startIcon={<SaveIcon />} >
                        Saving...
                    </Button>}
                    {!isLoading && <Button onClick={setSelectHandler.bind(this, true)} type="button" variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />} >
                        Cancel
                    </Button>}
                    {isLoading && <Button type="button" variant="contained" size="small" color="default" disableElevation disabled startIcon={<Cancel />} >
                        Cancel...
                    </Button>}
                    </div>
                }
            </form>
            {message && 
                <>
                {messageType === "error" && 
                    <p style={{color : "red"}}>{message}</p>
                }
                {messageType === "success" &&
                    <p style={{color : "green"}}>{message}</p>
                }
                </>
            }
        </div>
    )
}