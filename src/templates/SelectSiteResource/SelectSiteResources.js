// core
import { useState, useEffect } from "react";

// styles
import styles from "./SelectSiteResources.module.scss";
import { Button } from '@material-ui/core';
import NavigateNext from '@material-ui/icons/NavigateNext';
import Create from '@material-ui/icons/Create';
import Cancel from '@material-ui/icons/Cancel';

// components
import Select from "../../components/Select";
import { useHistory } from "react-router-dom";

export default function SelectSiteResource({selectOptions, selectedSiteResource, selectOnchangeHandler, setSelectHandler, createReadyHandler})    {

    let [hasSelected, setHasSelected] = useState(false),
        history = useHistory()


    const selectButtonHandler = (e) => {
        e.preventDefault();
        createReadyHandler();
    };

    const changeHandler = (value) =>   {
        setHasSelected(prev => true);
        selectOnchangeHandler(value);
    }

    const cancelHandler = () => {
        history.push("/manage-scrapers")
    }


    useEffect(() => {
        if(selectedSiteResource.siteName !== "")    {
            setHasSelected(prev => true);
        }
    }, [selectedSiteResource]);

    return (
        <div className={styles["select-container"]}>
            <h6 className={styles["template-title"]}>Select a Site Resource.</h6>
            <div>
                <Select defaultValue={selectedSiteResource} selectOnchangeHandler={changeHandler} label="Select a Site Resource" options={selectOptions} uniqueProp="_id" optionLabelProp="siteName"></Select>
                
            </div>

            {selectedSiteResource && selectedSiteResource.siteName !== "" && <div className={styles["site-resource-info-container"]}>
                <p>Site Name : {selectedSiteResource.siteName}</p>
                <p>Site Url : {selectedSiteResource.siteUrl}</p>
            </div>}

            <div className={styles["buttons-container"]}>
                <Button onClick={cancelHandler} variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />}>Cancel</Button>
                {!hasSelected && <Button  variant="contained" size="small" color="primary" disableElevation disabled startIcon={<NavigateNext />}>Use Selected Resource</Button>}
                {hasSelected && <Button onClick={selectButtonHandler.bind(this)} variant="contained" size="small" color="primary" disableElevation startIcon={<NavigateNext />}>Use Selected Resource</Button>}
                <Button onClick={setSelectHandler.bind(this, false)} variant="contained" size="small" color="secondary" disableElevation startIcon={<Create />}>Create a New Site Resource</Button>
            </div>
            
        </div>
    )
}   

