import { useState, useEffect } from "react";

// Components
import { Button, TextField, Chip, FormControl } from '@material-ui/core';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import NextIcon from '@material-ui/icons/NavigateNext';
import Cancel from '@material-ui/icons/Cancel';
import Add from '@material-ui/icons/Add';

// styles
import styles from "./CreateScraperData.module.scss";

export default function CreateScraperData({currentValue, setScraperDataHandler, backButtonHandler, cancelHandler}) {

    let [scraperDetails, setScraperDetails] = useState(currentValue),
        [productBrandErrorMessage, setProductBrandErrorMessage] = useState(null),
        [imagePropNameErrorMessage, setImagePropNameErrorMessage] = useState(null),
        [uniqueSplitErrorMessage, setUniqueSplitErrorMessage] = useState(null),
        [arrItemError, setArrItemError] = useState({}),
        [arrItem, setArrItem] = useState({
            splitItem : "",
            sharedItem : "",
            csvExcludedPropsItem : "",
        });
        // objectKeys = [getAllObjectKeys];


    const submitHandler =(e) => {
        e.preventDefault();
        let { productBrand, imagePropName, imageNameObject } = scraperDetails;
        if(productBrand && imagePropName && imageNameObject.split.length > 0)   {
            setProductBrandErrorMessage(null);
            setUniqueSplitErrorMessage(null);
            setImagePropNameErrorMessage(null);

            setScraperDataHandler(scraperDetails, true);
        } else  {
            setScraperDataHandler(scraperDetails, false);
            if(!productBrand)   {
                setProductBrandErrorMessage("Product Brand is required.");
            }
            if(!imagePropName)   {
                setImagePropNameErrorMessage("Image Prop Name is required.");
            }
            if(!imageNameObject.split.length)   {
                setUniqueSplitErrorMessage("It is required to at least have a single Unique / Split Property.")
            }
        }
    }

    const changeHandler = (prop, e) => {
        setScraperDetails(prev => ({...prev, [prop] : e.target.value}));
    }

    const arrInputChangeHandler = (prop, e) => {
        let keys = Object.keys(arrItemError),
            key = keys.find(item => prop.includes(item));
        setArrItemError(prev => {
            let obj = {...prev};
            obj[key] = null;
            return obj;
        })
        setArrItem(prev => ({...prev, [prop] : e.target.value}));
    }

    const addItemToArrayInObjectHandler = (propName, arrName = null, e) => {
        e.preventDefault();
        let value;
        if(arrName) {
            value = arrItem[`${arrName}Item`];
            if(value.trim() !== "") {
                setArrItem(prev => ({...prev, [`${arrName}Item`] : ""}));
            }
            
        } else  {
            value = arrItem[`${propName}Item`];
            if(value.trim() !== "") {
                setArrItem(prev => ({...prev, [`${propName}Item`] : ""}));
            }
        }
        if(value.trim() !== "") {
            setScraperDetails(prev => {
                if(value.trim().length) {
                    if(arrName) {
                        let arr = [...prev[propName][arrName]];
                        if(!arr.includes(value))    {
                            arr.push(value)
                        } else  {
                            setArrItemError(prev => {
                                return {
                                    ...prev,
                                    [arrName] : `We already have "${value}" in ${arrName} array of data.`
                                };
                            });
                        }
                        return {
                            ...prev, 
                            [propName] : {
                                ...prev[propName],
                                [arrName] : arr
                            }
                        };
                    } else  {
                        let arr = [...prev[propName]];
                        if(!arr.includes(value))    {
                            arr.push(value)
                        } else  {
                            setArrItemError(prev => {
                                return {
                                    ...prev,
                                    [propName] : `We already have "${value}" in ${propName} array of data.`
                                };
                            });
                        }
                        return {
                            ...prev, 
                            [propName] : arr,
                        };
                    }
                }
            });
        }
        
    }

    const handleDeleteChipEntry = (propName, arrName = null, value, e) => {
        e.preventDefault();
        
        setScraperDetails(prev => {
            if(value.trim().length) {
                if(arrName) {
                    let arr = prev[propName][arrName].filter(item => item !== value);

                    return {
                        ...prev, 
                        [propName] : {
                            ...prev[propName],
                            [arrName] : arr
                        }
                    };
                } else  {
                    let arr = prev[propName].filter(item => item !== value);

                    return {
                        ...prev, 
                        [propName] : arr,
                    };
                }
            }
        });
    }


    useEffect(() => {
        
    }, [arrItemError])

    return (
        <div className={`${styles["form-container"]}`}>
            <h6 className={styles["template-title"]}>Create Scraper Details</h6>
            <form className={styles.form} onSubmit={submitHandler}>
                <div className={styles["input-container"]}>
                    <div className={styles["field-container"]}>
                        <FormControl fullWidth>
                            <TextField value={scraperDetails.productBrand} onChange={changeHandler.bind(this, "productBrand")} label="Product Brand" />
                        </FormControl>
                        {productBrandErrorMessage && <p className={styles["error-message"]}>{productBrandErrorMessage}</p>}
                    </div>
                    <div className={styles["field-container"]}>
                        <FormControl fullWidth>
                            <TextField value={scraperDetails.imagePropName} onChange={changeHandler.bind(this, "imagePropName")} label="Image Prop Name" />
                        </FormControl>
                        {imagePropNameErrorMessage && <p className={styles["error-message"]}>{imagePropNameErrorMessage}</p>}
                    </div>
                </div>

                {/* Array containers : split */}
                <div className={styles["input-container-array"]}>
                    <p className={styles["description"]}>Unique Properties of product to be used as part of the image name.</p>
                    <div className={styles["result-container"]}>
                        {scraperDetails.imageNameObject.split.length > 0 && 
                            scraperDetails.imageNameObject.split.map((item, index) => {
                                return (
                                    <Chip
                                        key={`${item}-${index}`}
                                        label={item}
                                        onDelete={handleDeleteChipEntry.bind(this, "imageNameObject", "split", item)}
                                        deleteIcon={<Cancel />}
                                    />
                                );
                            })
                        }
                    </div>
                    <div className={styles["input-container"]}>
                        <div className={styles["field-container"]}>
                            <TextField value={arrItem.splitItem} onChange={arrInputChangeHandler.bind(this, "splitItem")} fullWidth label="Unique / Split"  />
                            {uniqueSplitErrorMessage && <p className={styles["error-message"]}>{uniqueSplitErrorMessage}</p>}
                            {arrItemError.split !== null && <p className={styles["error-message"]}>{arrItemError.split}</p>}
                        </div>
                        <Button onClick={addItemToArrayInObjectHandler.bind(this, "imageNameObject", "split")} type="button" variant="contained" size="small" disableElevation startIcon={<Add />} >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Array containers : shared */}
                <div className={styles["input-container-array"]}>
                    <p className={styles["description"]}>Shared Properties of the product to be used as part of the image name.</p>
                    <div className={styles["result-container"]}>
                        {scraperDetails.imageNameObject.shared.length > 0 && 
                            scraperDetails.imageNameObject.shared.map((item, index) => {
                                return (
                                    <Chip
                                        key={`${item}-${index}`}
                                        label={item}
                                        onDelete={handleDeleteChipEntry.bind(this, "imageNameObject", "shared", item)}
                                        deleteIcon={<Cancel />}
                                    />
                                );
                            })
                        }
                    </div>
                    <div className={styles["input-container"]}>
                        <div className={styles["field-container"]}>
                            <TextField fullWidth value={arrItem.sharedItem} onChange={arrInputChangeHandler.bind(this, "sharedItem")} label="Shared" />
                            {arrItemError.shared !== null && <p className={styles["error-message"]}>{arrItemError.shared}</p>}
                        </div>
                        <Button onClick={addItemToArrayInObjectHandler.bind(this, "imageNameObject", "shared")} type="button" variant="contained" size="small" disableElevation startIcon={<Add />} >
                            Add
                        </Button>
                    </div>
                </div>

                {/* Array containers : csv excluded props */}
                <div className={styles["input-container-array"]}>
                    <p className={styles["description"]}>Excluded Properties when creating the CSV file.</p>
                    <div className={styles["result-container"]}>
                        {scraperDetails.csvExcludedProps.length > 0 && 
                            scraperDetails.csvExcludedProps.map((item, index) => {
                                return (
                                    <Chip
                                        key={`${item}-${index}`}
                                        label={item}
                                        onDelete={handleDeleteChipEntry.bind(this, "csvExcludedProps", null, item)}
                                        deleteIcon={<Cancel />}
                                    />
                                );
                            })
                        }
                    </div>
                    <div className={styles["input-container"]}>
                        <div className={styles["field-container"]}>
                            <TextField value={arrItem.csvExcludedPropsItem} onChange={arrInputChangeHandler.bind(this, "csvExcludedPropsItem")} fullWidth label="CSV Excluded Props" />
                            {arrItemError.csvExcludedProps !== null && <p className={styles["error-message"]}>{arrItemError.csvExcludedProps}</p>}
                        </div>
                        <Button onClick={addItemToArrayInObjectHandler.bind(this, "csvExcludedProps", null)} type="button" variant="contained" size="small" disableElevation startIcon={<Add />} >
                            Add
                        </Button>
                    </div>
                </div>
                <div className={styles["message"]}>

                </div>
                <div className={styles["buttons-container"]}>
                    <Button onClick={cancelHandler} type="button" variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />} >
                        Cancel
                    </Button>
                    <Button type="button" onClick={backButtonHandler} variant="contained" size="small" color="secondary" disableElevation startIcon={<PreviousIcon />} >
                        Back
                    </Button>
                    <Button type="submit" variant="contained" size="small" color="primary" disableElevation endIcon={<NextIcon />} >
                        Next
                    </Button>
                </div>
                
            </form>            
        </div>    
    )
}