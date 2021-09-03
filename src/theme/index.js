import { blue,blueGrey, green, lightBlue, orange, purple, red, yellow } from '@material-ui/core/colors';
import { createTheme, darken } from '@material-ui/core/styles';

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