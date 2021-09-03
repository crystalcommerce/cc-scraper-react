import { Link } from "react-router-dom";
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
import { baseUrl, fileUrl} from '../../config';


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
  
export default function ScrapedDataTable({scraperObject, tableData, uniqueId, excludedColumns}) {
    const classes = useStyles();
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const {fileToken} = useAuth();

    const rows = tableData;
    const columns = getAllObjectKeys(tableData).map(item => {
        return {
            id: item,
            label: item === "_id" ? "ID" : item === "imagePaths" ? "Images" : toCapitalizeAll(toNormalString(item)),
            align : 'center',
            minWidth : 170,
            maxWidth : 400,
        }
    }).filter(item => {
        return !excludedColumns.includes(item.id);
    })

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
                    <TableCell style={{ minWidth: 175, color : "#3a9eb5" }}>
                        Action
                    </TableCell>
                </TableRow>
            </TableHead>
            
            <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={row[uniqueId]}>
                        
                    {columns.filter(column => column.id !== "_id").map((column) => {
                        const value = row[column.id];

                        if(column.id === "imagePaths")  {
                            let imagePaths = value.map(item => item.trim());
                            return  (
                                <TableCell key={column.id} align={column.align}>
                                    {imagePaths.map(item => {
                                        return (
                                            <img src={`${fileUrl}${fileToken}?filePath=${item}`} alt="" />
                                        );
                                    })}
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

                    <TableCell style={{ color : "#3a9eb5" }}>
                        <Link to={`/scraped-data/single/${scraperObject._id}/${row._id}`}>edit</Link>
                    </TableCell>
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