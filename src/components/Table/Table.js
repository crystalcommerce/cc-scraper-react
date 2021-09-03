// component
import { DataGrid } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// utils
import { toCapitalizeAll, toNormalString } from "../../utilities/string/index"
import { getAllObjectKeys } from "../../utilities/objects-array/index";

// hooks
import useAuth from "../../hooks/useAuth";

// css
import styles from "./Table.module.scss";
import { baseUrl } from '../../config/';


// custom styles
const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });

export default function CcTable({tableData, setTableData, uniqueId, excludedColumns}) {
    let objectKeys = Array.isArray(tableData) && tableData.length > 0 ? getAllObjectKeys(tableData) : [],
        { fileToken } = useAuth(),
        columns = objectKeys.filter(item => !excludedColumns.includes(item)).map(item => {
            return {
                field: item,
                headerName: item === "imagePaths" ? "images" :  toCapitalizeAll(toNormalString(item)),
                width: 150,
                editable: true,
            }
        }),
        rows = tableData,
        classes = useStyles();


    const deleteItemHandler = (id, e) => {
        e.preventDefault();

        let arr = tableData.filter(item => item._id !== id);
        
        setTableData(prev => arr);
        
    }   


    return (
        <>
        {Array.isArray(tableData) && <TableContainer component={Paper}>
            <Table className={`${styles.table} ${classes.table}`} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        {columns.filter(col => col.field !== "_id").map(column => {
                            return <TableCell key={column.field}>{column.headerName}</TableCell>
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row) => (
                    <TableRow key={row[uniqueId]}>
                        {columns.filter(col => col.field !== "_id").map(col => {
                            if(col.field === "imagePaths")  {
                                return (
                                    <TableCell key={col.field}>
                                    {row[col.field].map((item, index) => {
                                        return (
                                            <img key={index} src={`${baseUrl}/files/${fileToken}?filePath=${item}`} title={item.split("/").pop().split(".").shift()} />
                                        )
                                    })}
                                    </TableCell>
                                );
                            } else  {
                                return <TableCell key={col.field}>{row[col.field]}</TableCell>
                            }
                            
                        })}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </TableContainer>}
        </>
    );
}