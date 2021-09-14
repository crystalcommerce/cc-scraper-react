import { blue,blueGrey, red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({  
    palette: {
        primary: blue,
        secondary: blueGrey,
        error: red,
    },
    typography: {
        button: {
            textTransform: 'none',
        }
    }
});

export default theme;