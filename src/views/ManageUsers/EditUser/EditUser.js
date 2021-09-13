// core
import { useHistory, useParams } from "react-router";
import { useEffect, useState } from "react";

// hooks
import useFetch from "../../../hooks/useFetch";
import useAuth from "../../../hooks/useAuth";

// Components
import Card from "../../../components/Card";
import EmptyCardFlex from "../../../components/EmptyCardFlex";
import MuiTable from "../../../components/MuiTable";

// import SaveIcon from '@material-ui/icons/Save';
import { Button, Divider, CircularProgress, Modal, TextField, FormControl } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import Add from '@material-ui/icons/Add';
import PlayIcon from '@material-ui/icons/PlayArrow';
import ListAlt from '@material-ui/icons/ListAlt';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Cancel from '@material-ui/icons/Cancel';
import Check from '@material-ui/icons/Check';


// styles
import styles from "./UserDetails.module.scss";

// url;
import { baseUrl } from "../../../config";

// utils
import { getAllObjectKeys } from "../../../utilities/objects-array";

export default function EditUser()  {
    return (
        <>
            <div className={styles["field-container"]}>
                <FormControl fullWidth>
                    <TextField value={scraperDetails.productBrand} onChange={changeHandler.bind(this, "productBrand")} label="Product Brand" />
                </FormControl>
                {productBrandErrorMessage && <p className={styles["error-message"]}>{productBrandErrorMessage}</p>}
            </div>
        </>
    )
}