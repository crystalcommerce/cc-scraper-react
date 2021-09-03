import { useState, useEffect } from "react";

// utils
import { isObjectInArray } from "../../utilities/objects-array";

// Components
import { Button, TextField, Chip, FormControl, Divider } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import Cancel from '@material-ui/icons/Cancel';
import Add from '@material-ui/icons/Add';
import PreviousIcon from '@material-ui/icons/NavigateBefore';
import Create from '@material-ui/icons/Create';
import Select from "../../components/Select";
import RadioButtonsGroup from "../../components/Radio";
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import IconButton from '@material-ui/core/IconButton';
import CodeEditor from "../../components/CodeEditor/";

// styles
import styles from "./CreateEvaluators.module.scss";
import { toCamelCase } from "../../utilities/string";

export default function CreateEvaluators({currentValue, currentUsageValue, currentGroupIdentifierKeyValue, currentSchema, setEvaluatorObjectsHandler, setUsageHandler, setGroupIdentifierKeyHandler, cancelHandler, backButtonHandler})   {


    let radioOptions = [
            { value : "list", label : "List" },
            { value : "single", label : "Single" },
        ],
        selectOptions = [
            { name : "True", value : true },
            { name : "False", value : false },
        ],
        [evaluatorObjects, setEvaluatorObjects] = useState(currentValue),
        [submitButtonEnabled, setSubmitButtonEnabled] = useState(false),
        [addEvaluatorButtonEnabled, setAddEvaluatorButtonEnabled] = useState(false),

        [callback, setCallback] = useState(""),
        [type, setType] = useState("list"),

        // waitMethod
        [waitMethods, setWaitMethods] = useState([
            // {name : "waitForSelector", args : ".page-card-info .product-info"},
            // {name : "waitForSelector", args : ".page-image-container .product-image"},
        ]),
        [currentWaitMethod, setCurrentWaitMethod] = useState({
            name: "",
            args : "",
        }),
        [addWaitMethodButtonReady, setAddWaitMethodButtonReady] = useState(false),
        [waitMethodError, setWaitMethodError] = useState(null),

            // shows if evaluator TYPE === list;
            [showPaginated, setShowPaginated] = useState(true),
            [paginated, setPaginated] = useState(false),
            
            // only needed if evaluator TYPE === single;
            [objPropArgs, setObjPropArgs] = useState([]),
            [objPropArgsError, setObjPropArgsError] = useState(null),
            [currentPropArg, setCurrentPropArg] = useState(''),
            [addObjPropArgsButtonEnabled, setAddObjPropArgsButtonEnabled] = useState(false),

            // productUrlProp
            [productUrlProp, setProductUrlProp] = useState(""),
            [productUrlPropError, setProductUrlPropError] = useState(false),

        // devs comments
        [usage, setUsage] = useState(currentUsageValue),

        // groupIdentifierKey
        [groupIdentifierKey, setGroupIdentifierKey] = useState(currentGroupIdentifierKeyValue);
        


    // callback event handler
    const callbackTextFieldChangeHandler = (e) => {
        setCallback(prev => e.target.value);
    }


    // wait methods event handlers

    const removeWaitMethodHandler = (item, e) => {
        setWaitMethods(prev => {
            let arr = prev.slice();
            return [...arr.filter(method => method !== item)];
        })
    }

    const waitMethodInputChangeHandler = (propName, e) => {
        e.preventDefault();
        setWaitMethodError(prev => false);
        setCurrentWaitMethod(prev => {
            return {...prev, [propName] : e.target.value};
        })
    }

    const addWaitMethodHandler = () => {
        let waitMethod = {...currentWaitMethod};
        if(!isObjectInArray(currentWaitMethod, waitMethods))    {
            setWaitMethods(prev => { 
                return [...prev, waitMethod];
            });
        } else  {
            setWaitMethodError(prev => `We already have this Wait Method in our list of methods.`);
        }
        setCurrentWaitMethod(prev => ({name : "", args : ""}));
    }



    // type events
    const radioChangeHandler = (value) => {
        setType(prev => value);
        if(value === "list")    {
            setShowPaginated(true);
        } else  {
            setShowPaginated(false);
        }
    }

    

    // selectOnChangeHandler
    const selectOnchangeHandler = (value) => {
        setPaginated(prev => value);
    }

    // objPropArgs event handlers
    const handleDeleteObjPropArgs = (value, e) => {
        setObjPropArgs(prev => prev.filter(item => item !== value));
    }

    const propArgsInputChangeHandler = (e) => {
        setCurrentPropArg(prev => e.target.value);
        if(e.target.value !== "")   {
            setObjPropArgsError(prev => null);
            setAddObjPropArgsButtonEnabled(true);
        } else  {
            setAddObjPropArgsButtonEnabled(false);
        }
    }

    const addButtonHandler = (e) => {
        e.preventDefault();
        
        setCurrentPropArg(prev => {

            setObjPropArgs(prevState => {
                if(prevState.includes(prev))    {
                    setObjPropArgsError(prevState => `We already have "${prev}" in our Object Property Arguments list...`);
                    return [...prevState];
                } else  {
                    return [...prevState, prev];
                }
            });
            setAddObjPropArgsButtonEnabled(false);
            return "";
        });
        
    }

    // productUrlProp event handler
    const productUrlPropChangeHandler = (e) => {
        setProductUrlPropError(null);
        setProductUrlProp(prev => e.target.value);
    }


    // usage
    const usageInputChangeHandler = (e) => {
        setUsage(prev => e.target.value);
    }


     // groupIdentifierKey event hander
    const groupIdentifierKeyPropChangeHandler = (value) => {
        setGroupIdentifierKey(prev => value);
    }

    /* **************************************************** */
    /* **************************************************** */
    /* **************************************************** */
    /* **************************************************** */

    // addEvaluatorObject event handler
    const addEvaluatorObjectHandler = (e) => {
        e.preventDefault();
        if(type === "list") {
            setEvaluatorObjects(prev => [...prev, {
                callback,
                type,
                waitMethods,
                paginated,
            }]);
        } else  {
            setEvaluatorObjects(prev => [...prev, {
                callback,
                type,
                waitMethods,
                objPropArgs,
                productUrlProp,
            }]);
            
        }
        
        setCallback(prev => "");
        setWaitMethods(prev => []);
        setPaginated(false);
        setObjPropArgs(prev => []);
        setProductUrlProp(prv => "");
        setAddEvaluatorButtonEnabled(false);
        
        
    }

    const removeEvaluatorHandler = (item, e) => {
        setEvaluatorObjects(prev => prev.filter(evaluator => evaluator !== item));
    }

    const checkEvaluatorReady = () => {
        if(callback === "")   {
            setAddEvaluatorButtonEnabled(false);
            return;
        }
        if(type === "single" && productUrlProp.trim() === "")  {
            setAddEvaluatorButtonEnabled(false);
            return;
        }
        setAddEvaluatorButtonEnabled(true);
        
    }






     /* **************************************************** */
    /* **************************************************** */
    /* **************************************************** */
    /* **************************************************** */





    // submitHandler
    const submitHandler = (e) => {
        e.preventDefault();
        
        setUsageHandler(usage);
        setEvaluatorObjectsHandler(evaluatorObjects, true);
        // need to set error message for productUrlProp here
        setGroupIdentifierKeyHandler(groupIdentifierKey)
    }

    useEffect(() => {
        setAddWaitMethodButtonReady(prev => (currentWaitMethod.name.trim() !== "" && currentWaitMethod.args.trim() !== ""));
        checkEvaluatorReady();
        setEvaluatorObjectsHandler(evaluatorObjects, false);
        if(evaluatorObjects.length) {
            setSubmitButtonEnabled(true);
        } else  {
            setSubmitButtonEnabled(false);
        }

    }, [currentWaitMethod, callback, type, productUrlProp, evaluatorObjects]);

    return (
        <form className={styles["main-container"]} onSubmit={submitHandler}>

            <EmptyCardFlex className={styles["evaluator-object-container"]}>
                {evaluatorObjects.length > 0 && 
                <Card className={styles["create-evaluator-card"]}>
                    <div className={styles["added-evaluator-container"]}>
                        <h6 className={styles["template-title"]}>Added Evaluator Objects</h6>

                        {evaluatorObjects.map((item, index) => {
                            return (
                                <div className={styles["added-evaluator-object-container"]} key={index}>
                                    <ul>
                                        <li>
                                            <div className={styles["label"]}>Callback : </div>
                                            <FormControl>
                                                {/* onChange, padding, value, style, placeholder */}
                                                <CodeEditor disabled value={item.callback}></CodeEditor>
                                                {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                                            </FormControl>
                                        </li>
                                        {item.waitMethods.length > 0 && <li>
                                            <span className={styles["label"]}>Wait Methods</span> :
                                            <ul>
                                                {item.waitMethods.map((method, i) => {
                                                    return (
                                                        <li key={i}>
                                                            <ul>
                                                                <li><span className={styles["label"]}>Name</span> : {method.name}</li>
                                                                <li><span className={styles["label"]}>Args</span> : {method.args}</li>
                                                            </ul>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            
                                        </li>}
                                        {
                                            item.type === "list" && 
                                            <li>
                                                <span className={styles["label"]}>Paginated</span> :
                                                {item.paginated.toString()}
                                            </li>
                                        }
                                        {
                                            item.type !== "list" && 
                                            <>
                                                <li>
                                                    <span className={styles["label"]}>Object Property Arguments</span> :
                                                    {item.objPropArgs.join(", ")}
                                                </li>
                                                <li>
                                                    <span className={styles["label"]}>Product Url Prop Name</span> :
                                                    {item.productUrlProp}
                                                </li>
                                            </>
                                        }
                                        
                                    </ul>
                                    <span className={styles["remove-button"]}>
                                        <IconButton onClick={removeEvaluatorHandler.bind(this, item)} className={styles["delete-button"]} color="default" aria-label="upload picture" component="span">
                                        <Cancel />
                                        </IconButton>
                                    </span>
                                </div>
                            )
                        })}

                        {usage && 
                            <>
                                <p style={{color : "#4f72a7"}}>Developer's comment on usage : </p>
                                <p style={{color  : "#40bb46", fontWeight : "bold"}}>{usage}</p>
                            </>
                        }
                        {groupIdentifierKey && 
                            <>
                                <p style={{color : "#4f72a7"}}>Product Group / Set Identifier KEY : </p>
                                <p style={{color  : "#40bb46", fontWeight : "bold"}}>{groupIdentifierKey}</p>
                            </>
                        }
                    </div>
                </Card>}
                <Card className={styles["create-evaluator-card"]}>
                    <div className={`${styles["form-container"]}`}>
                        <h6 className={styles["template-title"]}>Create Evaluator Objects</h6>
                        <div className={styles["input-container"]}>
                            <h6 className={styles["template-section-title"]}>Write an Evaluator Function</h6>
                            <FormControl>
                                {/* onChange, padding, value, style, placeholder */}
                                <CodeEditor onChange={callbackTextFieldChangeHandler} value={callback}></CodeEditor>
                                {/* {schemaError && <p className={styles["error-message"]}>{schemaError}</p>} */}
                            </FormControl>

                            <Divider style={{margin : "1.4rem 0"}} />


                            {/* // wait methods */}
                            <div className={styles["wait-methods-container"]}>
                                
                                {waitMethods.length > 0 &&
                                     <>
                                    <h6 className={styles["description"]}>Added Wait Methods</h6>
                                    <div className={styles["added-methods"]}>
                                        
                                        <ul>
                                            {waitMethods.map((item, index) => {
                                                return (
                                                    <li key={`${index}-${item}`}>
                                                        <ul>
                                                            <li><span>Method Name : </span> {item.name}</li>
                                                            <li><span>Method Args : </span> {item.args}</li>
                                                        </ul>
                                                        <span className={styles["cancel-button"]}>
                                                            <IconButton onClick={removeWaitMethodHandler.bind(this, item)} className={styles["delete-button"]} color="default" aria-label="upload picture" component="span">
                                                            <Cancel />
                                                            </IconButton>
                                                        </span>
                                                        
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                        {waitMethodError && <p className={styles["error-message"]}>{waitMethodError}</p>}
                                    </div>
                                    </>
                                }

                                <div className={styles["wait-method-input-container"]}>
                                    <div className={styles["input-container-array"]}>
                                        <p className={styles["description"]}>Add Puppeteer Wait Methods</p>
                                        <div className={styles["field-container"]}>
                                            <FormControl>
                                                <TextField 
                                                    onChange={waitMethodInputChangeHandler.bind(this, "name")}
                                                    fullWidth 
                                                    label="Method Name" 
                                                    value={currentWaitMethod.name}
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <TextField 
                                                    onChange={waitMethodInputChangeHandler.bind(this, "args")}
                                                    fullWidth 
                                                    label="Method Arguments" 
                                                    value={currentWaitMethod.args}
                                                />
                                            </FormControl>
                                        </div>
                                        <div className={styles["button-container"]}>
                                            {addWaitMethodButtonReady && 
                                            <Button 
                                                onClick={addWaitMethodHandler}
                                                type="button" 
                                                variant="contained" 
                                                size="small" 
                                                color="default" 
                                                disableElevation 
                                                startIcon={<Add />} >
                                                Add Wait Method
                                            </Button>}
                                            {!addWaitMethodButtonReady && <Button type="button" variant="contained" size="small" color="default" disableElevation disabled startIcon={<Add />} >
                                                Add Wait Method
                                            </Button>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Divider style={{margin : "1.4rem 0"}} />



                            {/* evaluator options */}
                            <div className={styles["evaluator-options"]}>
                                <FormControl fullWidth>
                                    <RadioButtonsGroup value={type} defaultValue={type} radioOptions={radioOptions} legend="Evalutator Type" onChange={radioChangeHandler} />
                                </FormControl>
                                <Divider style={{margin : "1.4rem 0"}} />
                                {showPaginated &&
                                    <>
                                    <FormControl fullWidth>
                                        <p className={styles["description"]}>Is the evaluator function meant to be used for paginated starting url?</p>
                                        <Select selectOnchangeHandler={selectOnchangeHandler} label="Is Paginated?" options={selectOptions} uniqueProp="value" optionLabelProp="name" ></Select>
                                    </FormControl>
                                    <Divider style={{margin : "1.4rem 0"}} />
                                    </>
                                }
                                {!showPaginated &&
                                    <>
                                        <div className={styles["input-container-array"]}>
                                            <p className={styles["description"]}>Object Properties as function arguments</p>
                                            <div className={styles["input-container-2"]}>
                                                <div className={styles["field-container"]}>
                                                    {objPropArgs.length > 0 && 
                                                        <>
                                                            <div className={`${styles["result-container"]} ${styles["chip-container"]}`}>
                                                
                                                                {objPropArgs.length > 0 && 
                                                                    objPropArgs.map((item, index) => {
                                                                        return (
                                                                            <Chip
                                                                                key={`${item}-${index}`}
                                                                                label={item}
                                                                                onDelete={handleDeleteObjPropArgs.bind(this, item)}
                                                                                deleteIcon={<Cancel />}
                                                                            />
                                                                        );
                                                                    })
                                                                }
                                                            </div>
                                                        </>
                                                    }
                                                    <div>
                                                        <TextField 
                                                            value={currentPropArg}
                                                            onChange={propArgsInputChangeHandler}
                                                            fullWidth 
                                                            label="Object Property Arguments" />
                                                        {objPropArgsError && <p className={styles["error-message"]}>{objPropArgsError}</p>}
                                                    </div>
                                                    <div>
                                                        {addObjPropArgsButtonEnabled && <Button 
                                                            type="button" 
                                                            variant="contained" 
                                                            size="small" 
                                                            disableElevation 
                                                            onClick={addButtonHandler}
                                                            startIcon={<Add />} >
                                                            Add Object Property Arguments
                                                        </Button>}
                                                        {!addObjPropArgsButtonEnabled && <Button 
                                                            type="button" 
                                                            variant="contained" 
                                                            size="small" 
                                                            disabled
                                                            disableElevation 
                                                            startIcon={<Add />} >
                                                            Add Object Property Arguments
                                                        </Button>}
                                                    </div>
                                                    
                                                </div>
                                                
                                            </div>
                                            
                                        </div>
                                        <Divider style={{margin : "1.4rem 0"}} />
                                        
                                        <div className={styles["input-container-array"]}>
                                            <div className={styles["input-container-2"]}>
                                                <div className={styles["field-container"]}>
                                                    <TextField 
                                                        value={productUrlProp}
                                                        onChange={productUrlPropChangeHandler}
                                                        fullWidth 
                                                        label="Product URI Property" />
                                                        {productUrlPropError && <p className={styles["error-message"]}>{productUrlPropError}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <Divider style={{margin : "1.4rem 0"}} />

                                        
                                    </>
                                }
                                
                                <div className={styles["buttons-container"]}>
                                {addEvaluatorButtonEnabled && <Button onClick={addEvaluatorObjectHandler} type="button" variant="contained" size="small" color="secondary" disableElevation startIcon={<Create />} >
                                    Add to List of Evaluators
                                </Button>}
                                {!addEvaluatorButtonEnabled && <Button onClick={addEvaluatorObjectHandler} type="button" variant="contained" disabled size="small" color="secondary" disableElevation startIcon={<Create />} >
                                    Add to List of Evaluators
                                </Button>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Divider style={{margin : "1.4rem 0"}} />

                    <div className={`${styles["form-container"]}`}>
                        <div className={styles["input-container"]}>
                            <div className={styles["input-container-2"]}>
                                <div className={styles["field-container"]}>
                                    <p className={styles["description"]}>This will be used to group the data into sets or maybe categories</p>
                                    <div className={styles["field-container"]}>
                                        <FormControl fullWidth>
                                        <Select 
                                            selectOnchangeHandler={groupIdentifierKeyPropChangeHandler} 
                                            label="Product Group / Set Identifier Key" 
                                            options={[{name : " -- Select a Property Name -- ", value : ""}, ...Object.keys(currentSchema).map(item => {
                                            return {
                                                name : item, value : item,
                                            }
                                        })]} 
                                            uniqueProp="value" 
                                            optionLabelProp="name"
                                            defaultValue={currentGroupIdentifierKeyValue}
                                            />
                                        </FormControl>
                                    </div>
                                </div>
                            </div>

                            <Divider style={{margin : "1.4rem 0"}} />

                            <div className={styles["input-container-2"]}>
                                <div className={styles["field-container"]}>
                                    <p className={styles["description"]}>Developer's comments in terms of Script Usage.</p>
                                    <div className={styles["field-container"]}>
                                        
                                        <TextField 
                                            value={usage}
                                            multiline
                                            onChange={usageInputChangeHandler}
                                            fullWidth 
                                            label="Usage" />
                                    </div>
                                </div>
                            </div>
                        </div>      
                    </div>  




                    {/* // buttons */}
                    <div className={styles["buttons-container"]}>
                        <Button onClick={cancelHandler} type="button" variant="contained" size="small" color="default" disableElevation startIcon={<Cancel />} >
                                Cancel
                        </Button>
                        <Button type="button" onClick={backButtonHandler} variant="contained" size="small" color="secondary" disableElevation startIcon={<PreviousIcon />} >
                            Back
                        </Button>
                        
                        {submitButtonEnabled && <Button type="submit" variant="contained" size="small" color="primary" disableElevation startIcon={<SaveIcon />} >
                            Save
                        </Button>}
                        {!submitButtonEnabled && <Button type="submit" variant="contained" size="small" color="primary" disabled disableElevation startIcon={<SaveIcon />} >
                            Save
                        </Button>}
                        
                    </div>
                </Card>
                {/* <Card className={styles["create-evaluator-card"]}></Card> */}
            </EmptyCardFlex>
            {/* <EmptyCardFlex className={styles["evaluator-object-container"]}>
                <Card>
                
                </Card>
                <Card className={styles["create-evaluator-card"]}></Card>
            </EmptyCardFlex> */}
        </form>    
    )
}