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
import styles from "./ManageUsers.module.scss";

// url;
import { getAllObjectKeys } from "../../utilities/objects-array";


export default function ManageScrapedData({pageTitle}) {

    let history = useHistory(),
        { data : users, setData : setUsers, isLoading : isUsersLoading } = useFetch("/api/users/managed-users"),
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

    return (
        <>
            <h1 className="page-title">{pageTitle}</h1>
            <EmptyCardFlex>
                <Card>
                    <MuiTable tableData={tableData} uniqueId="_id" excludedColumns={excludedColumns}></MuiTable>
                </Card>
            </EmptyCardFlex>    
        </>
    )
}