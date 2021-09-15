// core
import { useHistory } from "react-router";
import { useEffect } from "react";

// hooks
import useFetch from "../../hooks/useFetch";
import useAuth from "../../hooks/useAuth";
import useActiveMenu from "../../hooks/useActiveMenu";

// Components
import Card from "../../components/Card";
import EmptyCardFlex from "../../components/EmptyCardFlex";
import MuiTable from "../../components/MuiTable";

// import SaveIcon from '@material-ui/icons/Save';
import { Button } from '@material-ui/core';
import AddUserIcon from '@material-ui/icons/PersonAdd';
import ListAlt from '@material-ui/icons/ListAlt';

import styles from "./Dashboard.module.scss";


export default function Dashboard({pageTitle}) {

    let history = useHistory(),
        { activeMenuHandler } = useActiveMenu();

    useEffect(() => {
        history.push("/manage-scrapers/");

        // activeMenuHandler();
    })

    return  (
        <>  
            <EmptyCardFlex className={styles["main-container"]}>
                <h1 className="page-title">{pageTitle}</h1>
                <EmptyCardFlex className={styles["grid-container"]}>

                    <Card className={styles["data-container"]}>

                    </Card>
                    <Card className={styles["users-container"]}>

                    </Card>

                    <Card className={styles["scrapers-container"]}>

                    </Card>

                    <Card className={styles["profile-container"]}>

                    </Card>
                </EmptyCardFlex>
            </EmptyCardFlex>
        </>
    )

}