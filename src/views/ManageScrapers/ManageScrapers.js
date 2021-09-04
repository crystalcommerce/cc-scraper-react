// core
import { useHistory } from "react-router";

// hooks
import useFetch from "../../hooks/useFetch"

// Components
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import MuiTable from "../../components/MuiTable";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Add from '@material-ui/icons/Add';
import PlayIcon from '@material-ui/icons/PlayArrow';
import ListAlt from '@material-ui/icons/ListAlt';


// styles
import styles from "./ManageScrapers.module.scss";

// url;
import { getAllObjectKeys } from "../../utilities/objects-array";



export default function ManageScrapers({pageTitle}) {

    let history = useHistory(),
        {data : scrapers, isLoading : isLoadingTableData} = useFetch("/api/scrapers"),
        tableData = scrapers.map(item => {
            const optionClickHandler = (value) => {
                history.push(value);
            }

            return {
                ...item, 
                // action : <DropdownButton size="small" dropDownOptions={dropDownOptions} optionClickHandler={optionClickHandler} />
                action : <div className={styles["action-column"]} style={{display: "flex", flexDirection : "row", gap : ".7rem", justifyContent: "center"}}>
                    <Button 
                        
                        onClick={optionClickHandler.bind(null, `/manage-scrapers/run-script/${item._id}`)}
                        startIcon={<PlayIcon />} 
                        style={{backgroundColor: "#4fbf4f", color : "white", whiteSpace : "nowrap", minWidth : "125px", maxWidth : "250px"}}
                        size="small">Run the Script</Button>  
                    <Button 
                        onClick={optionClickHandler.bind(null, `/manage-scrapers/${item._id}`)}
                        startIcon={<ListAlt />} 
                        size="small" 
                        style={{backgroundColor: "rgb(85 159 171)", color : "white", whiteSpace : "nowrap", minWidth : "125px", maxWidth : "250px"}}>View Details</Button></div>
            }
        }),
        includedKeys = ["_id", "siteName", "productBrand", "groupIdentifierKey", "scraperType", "apiRoute", "action", "anotherAction"],
        excludedColumns = getAllObjectKeys(tableData).filter(key => !includedKeys.includes(key));
        
    
    const createScraperButtonClickHandler = (e) => {
        e.preventDefault();
        history.push("/manage-scrapers/create-scraper/");
    }
    

    return  (
        <>  
            <h1 className="page-title">{pageTitle}</h1>
            <EmptyCardFlex flexDirection="column">
                <Card>
                    <div className={styles["buttons-container"]}>
                        <Button onClick={createScraperButtonClickHandler} type="button" variant="contained" size="medium" color="primary" disableElevation startIcon={<Add />} >
                            Create a new Scraper
                        </Button>
                    </div>
                    {isLoadingTableData && 
                        <>
                            <Divider style={{ margin : "1.4rem 0"}}></Divider>
                            <Alert severity="info"><CircularProgress style={{height: "20px", width: "20px"}}></CircularProgress> Loading the Scraper Script table</Alert>
                        </>
                    }
                    {
                        tableData.length > 0 && 
                        <>
                            <Divider style={{ margin : "1.4rem 0"}}></Divider>
                            <h6 className={styles["template-subtitle"]}>These are the current available scripts</h6>
                            <MuiTable tableData={tableData} uniqueId="_id" excludedColumns={excludedColumns}></MuiTable>
                        </>
                    }    
                </Card>
            </EmptyCardFlex>  
        </>
    )

}