// core
import { useHistory } from "react-router";

// hooks
import useFetch from "../../hooks/useFetch";
import useAccessCheck from "../../hooks/useAccessCheck";

// Components
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import MuiTable from "../../components/MuiTable";

// import SaveIcon from '@material-ui/icons/Save';
import { Button } from '@material-ui/core';
import AddUserIcon from '@material-ui/icons/PersonAdd';
import ListAlt from '@material-ui/icons/ListAlt';


// styles
import styles from "./ManageUsers.module.scss";

// url;
import { getAllObjectKeys } from "../../utilities/objects-array";



export default function ManageScrapedData({pageTitle}) {

    let history = useHistory(),
        { data : users } = useFetch("/api/users/"),
        tableData = users.sort((a, b) => {
            return a.firstName < b.firstName ? -1 : a.firstName > b.firstName ? 1 : 0;
        })
        .sort((a, b) => {   
            return Number(b.permissionLevel) - Number(a.permissionLevel);
        })
        .map(item => {

            const positions = ["guest", "staff", "developer", "administrator", "site-owner"];

            const optionClickHandler = (value) => {
                history.push(value);
            }

            return  {
                ...item,
                accessLevel : positions[item.permissionLevel - 1],
                action : <div className={styles["action-column"]} style={{display: "flex", flexDirection : "row", gap : ".7rem", justifyContent: "center"}}>
                    <Button 
                        onClick={optionClickHandler.bind(null, `/manage-users/${item._id}`)}
                        startIcon={<ListAlt />} 
                        size="small" 
                        style={{backgroundColor: "rgb(85 159 171)", color : "white", whiteSpace : "nowrap", minWidth : "125px", maxWidth : "250px"}}>View Details</Button>
                        
                </div>
            }
        }),
        includedKeys = ["_id", "firstName", "lastName", "username", "accessLevel", "action",],
        excludedColumns = getAllObjectKeys(tableData).filter(key => !includedKeys.includes(key));
    
    const addUserHandler = () => {
        history.push("/manage-users/create");
    }


    useAccessCheck(4);

    return (
        <>
            <h1 className="page-title">{pageTitle}</h1>
            <EmptyCardFlex>
                
                <Card className={styles["main-container"]}>
                    <Button onClick={addUserHandler} startIcon={<AddUserIcon />} size="md" 
                        style={{backgroundColor: "rgb(35 191 112)", color : "white", whiteSpace : "nowrap"}}>Add User</Button>
                    <MuiTable tableData={tableData} uniqueId="_id" excludedColumns={excludedColumns}></MuiTable>
                </Card>
            </EmptyCardFlex>    
        </>
    )
}