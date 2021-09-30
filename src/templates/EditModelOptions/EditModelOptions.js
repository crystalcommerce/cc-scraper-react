import { useState, useEffect } from "react";

// utils
import { isObjectUnique } from "../../utilities/objects-array";

// Components
import { Button, TextField, Chip, FormControl, CircularProgress } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import Add from '@material-ui/icons/Add';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import Select from "../../components/Select";
import RadioButtonsGroup from "../../components/Radio";
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import IconButton from '@material-ui/core/IconButton';

// styles 
import styles from "./EditModelOptions.module.scss";

export default function EditModelSchema({currentValue, setModelObjectHandler, cancelHandler}) {

    let selectOptions = [
            { name : "String" },
            { name : "Array" },
        ],
        radioOptions = [
            { value : "true", label : "True" },
            { value : "false", label : "False" },
        ],
        [modelObjectOptions, setModelObjectOptions] = useState(currentValue),
        [saveButtonEnabled, setSavedButtonEnabled] = useState(false),
        [schemaArray, setSchemaArray] = useState(Object.keys(modelObjectOptions.schema).map(propKey => {
            return {key : propKey, ...modelObjectOptions.schema[propKey]}
        })),
        [addSchemaButtonDisabled, setAddSchemaButtonDisabled] = useState(true),
        [schemaKey, setSchemaKey] = useState(""),
        [schemaKeyType, setSchemaKeyType] = useState("String"),
        [schemaKeyRequired, setSchemaKeyRequired] = useState("false"),
        [schemaError, setSchemaError] = useState(""),


        // model initialized props 
        [propObjectsErrMessage, setPropObjectsErrMessage] = useState({
            friendlyUrlProps : null,
            immutableProps : null,
            uniqueProps : null,
        }),
        [propObjects, setPropObjects] = useState({
            friendlyUrlProps : modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("friendlyUrlProps")) ? [...modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("friendlyUrlProps"))["friendlyUrlProps"]] : [],
            immutableProps : modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("immutableProps")) ? [...modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("immutableProps"))["immutableProps"]] : [],
            uniqueProps : modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("uniqueProps")) ? [...modelObjectOptions.initializedProps.find(item => Object.keys(item).includes("uniqueProps"))["uniqueProps"]] : [],
        }),
        [friendlyUrlProp, setFriendlyUrlProp] = useState(""),
        [immutableProp, setImmutableProp] = useState(""),
        [uniqueProp, setUniqueProp] = useState(""),

        [isLoading, setIsLoading] = useState(null),
        [message, setMessage] = useState(null),
        [status, setStatus] = useState(null);

    // model schema event handlers 
    const inputChangeHandler = (e) => {
        e.preventDefault();
        setSchemaKey(prev => e.target.value);
        if(e.target.value.trim() !== "")    {
            setAddSchemaButtonDisabled(prev => false);
            setSchemaError(prev => false);
        } else  {
            setAddSchemaButtonDisabled(prev => true);
        }
    }

    const selectOnchangeHandler = (value) => {
        setSchemaKeyType(prev => value);
    }

    const radioChangeHandler = (value) => {
        setSchemaKeyRequired(prev => value);
    }

    const addSchemaHandler = (e) => {
        e.preventDefault();
        if(schemaKey && schemaKey.length > 0) {

            let schemaObject = {key : schemaKey, type : schemaKeyType, required : schemaKeyRequired};

            if(isObjectUnique(schemaObject, schemaArray, ["key"])) {
                setSchemaArray(prev => {                    
                    let arr = [...prev, schemaObject];
                    return arr;
                });
            } else  {
                setSchemaError('We already have this schema...');
            }
            setSchemaKey(prev => "");
            // setSchemaKeyType(prev => "String");
            setSchemaKeyRequired(prev => "false");
            setAddSchemaButtonDisabled(prev => true);
        }
    }

    const deleteSchemaHandler = (key, e) => {
        e.preventDefault();
        setSchemaArray(prev => {
            let arr = prev.slice().filter(item => item.key !== key);
            return arr;
        });
    }



    // initializedPropsHandler


    const handleDeleteChipEntry = (propName, arrItem, e) => {
        e.preventDefault();

        setPropObjects(prev => {
            let obj = {...prev},
                arr = obj[propName].filter(item => item !== arrItem);
            return {...obj, [propName] : arr};
        });
        
    }   

    const propObjectChangeHandler = (setter, propName, e) => {
        setter(e.target.value);
        setPropObjectsErrMessage(prev => {
            return {...prev, [propName] : null};
        })
    }

    const addPropObjects = (propName, value, setter, e) => {
        e.preventDefault();

        if(value.trim() !== "")    {
            
            if(!propObjects[propName].includes(value)) {
                
                setPropObjects(prev => {
                    let obj = {...prev};
                    obj[propName].push(value);
                    return obj;
                });
            } else  {
                setPropObjectsErrMessage(prev => {
                    return {...prev, [propName] : `We already have "${value}" property name in ${propName}`}
                });
            }
        }
        setter(prev => "");
    }



    // submit handler

    const submitHandler = (e) => {
        e.preventDefault();
        setModelObjectOptions(prev => {
            let obj = {...prev},
                initializedProps = [];
            
            for(let key in propObjects) {
                initializedProps.push({[key] : propObjects[key]});
            }
            
            obj.schema = schemaArray.reduce((a, b) => {
                    a[b.key] = {
                        type : b.type,
                        required : b.required,
                    };

                    return a;
                }, {});

            obj.initializedProps = initializedProps;
            setModelObjectHandler(obj, false, setIsLoading, setMessage, setStatus);
            return obj;
        });
        
    }  

    useEffect(() => {
        if(schemaArray.length)  {
            setSavedButtonEnabled(prev => true);
        } else  {
            setSavedButtonEnabled(prev => false);
        }
    }, [schemaArray]);

    return (
        <form className={styles["main-container"]} onSubmit={submitHandler}>
            <EmptyCardFlex className={styles["model-object-container"]}>
                <Card className={styles["create-model-card"]}> 
                    <div className={`${styles["form-container"]}`}>
                        <h6 className={styles["template-title"]}>Edit DB Model Schema</h6>
                        <div className={styles.form} >
                        <h6 className={styles["template-section-title"]}>Add DB Model Schema</h6>
                            <div className={styles["input-container"]}>
                                <div className={styles["field-container"]}>
                                    <FormControl fullWidth>
                                        <TextField value={schemaKey} onChange={inputChangeHandler} label="Schema Property Name" />
                                        {schemaError && <p className={styles["error-message"]}>{schemaError}</p>}
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <Select defaultValue={selectOptions[0]} selectOnchangeHandler={selectOnchangeHandler} label="Shema Property Type" options={selectOptions} uniqueProp="name" optionLabelProp="name" ></Select>
                                    </FormControl>
                                    <FormControl fullWidth>
                                        <RadioButtonsGroup radioOptions={radioOptions} legend="Is Value Required?" onChange={radioChangeHandler} />
                                    </FormControl>
                                    {!addSchemaButtonDisabled && 
                                        <Button onClick={addSchemaHandler.bind(this)} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Add />} >
                                            Add Schema Property
                                        </Button>
                                    }
                                    {addSchemaButtonDisabled && 
                                        <Button onClick={addSchemaHandler.bind(this)} type="button" variant="contained" size="small" color="secondary" disabled disableElevation startIcon={<Add />} >
                                            Add Schema Property
                                        </Button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>   
                </Card>
                {
                    schemaArray.length > 0 && 
                    <Card className={styles["schema-container"]}>
                        <h6 className={styles["template-subtitle"]}>Added Model Schemas</h6>
                        <ul>
                        {schemaArray.map(item => {
                            let {key, type, required} = item;
                            return (
                                <li key={key}>
                                    <span>Key : {key}</span>
                                    <span>Type : {type}</span>
                                    <span>Required : {required}</span>
                                    
                                    <IconButton onClick={deleteSchemaHandler.bind(this, key)} className={styles["delete-button"]} color="default"  component="span">
                                    <Cancel />
                                    </IconButton>
                                </li>
                            )
                        })}
                        </ul>
                    </Card>
                }
            </EmptyCardFlex>
            <EmptyCardFlex className={styles["model-object-container"]}>
                <Card className={styles["create-model-card"]}> 
                <div className={`${styles["form-container"]}`}>
                   
                    <div className={styles.form}>
                        <h6 className={styles["template-section-title"]}>Set the Initialized Properties</h6>


                        {/* Array containers : uniqueProps */}
                        <div className={styles["input-container-array"]}>
                            <p className={styles["description"]}>Unique Properties</p>
                            <div className={styles["result-container"]}>
                                {propObjects.uniqueProps.length > 0 && 
                                    propObjects.uniqueProps.map((item, index) => {
                                        return (
                                            <Chip
                                                key={`${index}`}
                                                label={item}
                                                onDelete={handleDeleteChipEntry.bind(this, "uniqueProps", item)}
                                                deleteIcon={<Cancel />}
                                            />
                                        );
                                    })
                                }
                            </div>
                            <div className={styles["input-container-2"]}>
                                <div className={styles["field-container"]}>
                                    <TextField value={uniqueProp} onChange={propObjectChangeHandler.bind(this, setUniqueProp, "uniqueProps")} fullWidth label="Unique Properties" />
                                    {propObjectsErrMessage.uniqueProps && <p className={styles["error-message"]}>{propObjectsErrMessage.uniqueProps}</p>}
                                </div>
                                <div className={styles["button-container"]}>
                                    {uniqueProp && <Button type="button" onClick={addPropObjects.bind(this, "uniqueProps", uniqueProp, setUniqueProp)} variant="contained" size="small" disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                    {!uniqueProp && <Button type="button" onClick={addPropObjects.bind(this, "uniqueProps", uniqueProp, setUniqueProp)} variant="contained" size="small" disabled disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                </div>
                            </div>
                        </div>

                        {/* Array containers : immutableProps */}
                        <div className={styles["input-container-array"]}>

                            <p className={styles["description"]}>Immutable Properties</p>
                            <div className={styles["result-container"]}>
                                {propObjects.immutableProps.length > 0 && 
                                    propObjects.immutableProps.map((item, index) => {
                                        return (
                                            <Chip
                                                key={`${index}`}
                                                label={item}
                                                onDelete={handleDeleteChipEntry.bind(this, "immutableProps", item)}
                                                deleteIcon={<Cancel />}
                                            />
                                        );
                                    })
                                }
                            </div>
                            <div className={styles["input-container-2"]}>
                                <div className={styles["field-container"]}>
                                    <TextField value={immutableProp} onChange={propObjectChangeHandler.bind(this, setImmutableProp, "immutableProps")} fullWidth label="Immutable Properties" />
                                    {propObjectsErrMessage.immutableProps && <p className={styles["error-message"]}>{propObjectsErrMessage.immutableProps}</p>}
                                </div>
                                <div className={styles["button-container"]}>
                                    {immutableProp && <Button type="button" onClick={addPropObjects.bind(this, "immutableProps", immutableProp, setImmutableProp)} variant="contained" size="small" disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                    {!immutableProp && <Button type="button" onClick={addPropObjects.bind(this, "immutableProps", immutableProp, setImmutableProp)} variant="contained" size="small" disabled disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                </div>
                            </div>
                        </div>

                        {/* Array containers : friendlyUrlProps */}
                        <div className={styles["input-container-array"]}>
                            <p className={styles["description"]}>Friendly URL Properties</p>
                            <div className={styles["result-container"]}>
                                {propObjects.friendlyUrlProps.length > 0 && 
                                    propObjects.friendlyUrlProps.map((item, index) => {
                                        return (
                                            <Chip
                                                key={`${index}`}
                                                label={item}
                                                onDelete={handleDeleteChipEntry.bind(this, "friendlyUrlProps", item)}
                                                deleteIcon={<Cancel />}
                                            />
                                        );
                                    })
                                }
                            </div>
                            <div className={styles["input-container-2"]}>
                                <div className={styles["field-container"]}>
                                    <TextField value={friendlyUrlProp} onChange={propObjectChangeHandler.bind(this, setFriendlyUrlProp, "friendlyUrlProps")} fullWidth label="Friendly URL Properties" />
                                    {propObjectsErrMessage.friendlyUrlProps && <p className={styles["error-message"]}>{propObjectsErrMessage.friendlyUrlProps}</p>}
                                </div>
                                <div className={styles["button-container"]}>
                                    {friendlyUrlProp && <Button type="button" onClick={addPropObjects.bind(this, "friendlyUrlProps", friendlyUrlProp, setFriendlyUrlProp)} variant="contained" size="small" disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                    {!friendlyUrlProp && <Button type="button" onClick={addPropObjects.bind(this, "friendlyUrlProps", friendlyUrlProp, setFriendlyUrlProp)} variant="contained" size="small" disabled disableElevation startIcon={<Add />} >
                                        Add
                                    </Button>}
                                </div>
                            </div>
                        </div>
                    </div>            
                </div>    
                </Card> 
                
            </EmptyCardFlex>
            <Card>
                <div className={styles["buttons-container"]}>
                    <Button onClick={cancelHandler} type="button" variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />} >
                            Cancel
                    </Button>
                    
                    {saveButtonEnabled && !isLoading && <Button type="submit" variant="contained" size="small" color="primary" disableElevation endIcon={<SaveIcon />} >
                        Save
                    </Button>}
                    {!saveButtonEnabled && !isLoading && <Button type="submit" variant="contained" size="small" color="primary" disabled disableElevation endIcon={<SaveIcon />} >
                        Save
                    </Button>}
                    {
                        isLoading && <Button type="submit" variant="contained" size="small" color="primary" disabled disableElevation endIcon={<CircularProgress style={{height: "20px", width : "20px"}}></CircularProgress>} >
                        Saving the DB Model Schema
                    </Button>
                    }
                    
                </div>
            </Card>
        </form>
    )
}