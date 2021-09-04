import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';

// config
import { baseUrl, fileUrl} from '../../config/';

// utils
import { toCapitalize, toCapitalizeAll, toNormalString } from "../../utilities/string/index"
import { getAllObjectKeys } from "../../utilities/objects-array/index";

// hooks
import useAuth from "../../hooks/useAuth";

// css
import styles from "./MuiTable.module.scss";
const useStyles = makeStyles({
    root: {
        width: '100%',
    },
    container: {
        maxHeight: 770,
    },
});
  
export default function StickyHeadTable({tableData, uniqueId, excludedColumns}) {
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const {fileToken, authToken} = useAuth();

    const rows = tableData;
    const columns = Array.isArray(tableData) && tableData.length > 0 ? getAllObjectKeys(tableData).map(item => {
        return {
            id: item,
            label: item === "_id" ? "ID" : item === "imagePaths" ? "Images" : toCapitalizeAll(toNormalString(item)),
            align : 'center',
            minWidth : 170,
            maxWidth : 400,
        }
    }).filter(item => {
        return !excludedColumns.includes(item.id);
    }) : [];

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper className={`${classes.root}`}>
        <TableContainer className={`${classes.container} ${styles["mui-table-container"]}`}>
            <Table stickyHeader aria-label="sticky table" className={styles["mui-table"]}>
            <TableHead>
                {columns.length > 0 && 
                <TableRow>
                {columns.filter(column => column.id !== "_id").map((column) => (
                    <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth, color : "#3a9eb5" }}
                    >
                    {column.label}
                    </TableCell>
                ))}
                </TableRow>
                }   
            </TableHead>
            
            <TableBody>
                {rows.length > 0 && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={uniqueId ? row[uniqueId] : row}>
                        
                    {columns.filter(column => column.id !== "_id").map((column) => {
                        const value = row[column.id];

                        if(column.id === "imagePaths")  {
                            let imagePaths = value.map(item => item.trim());
                            return  (
                                <TableCell className={styles["image-container"]}key={column.id} align={column.align}>
                                    <div className={styles["image-slider"]}>
                                        {imagePaths.map(item => {
                                            return (
                                                <img key={item} src={`${fileUrl}${fileToken}?filePath=${item}`} alt="" />
                                            );
                                        })}
                                    </div>
                                </TableCell>
                            );
                        } else  {
                            
                            return (
                                <TableCell key={column.id} align={column.align}>
                                    {value}
                                </TableCell>
                            );
                        }
                    })}
                    </TableRow>
                );
                })}
            </TableBody>
            </Table>
        </TableContainer>
        <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
        />
        </Paper>
    );
}