// Main Component
import { BrowserRouter as Router } from "react-router-dom";
import MainComponent from "./MainComponent";
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from './theme';    
import { ThemeProvider } from "@material-ui/styles";


import "./Reset.scss";
import "./App.scss";
import "./Defaults.scss";

function App() {
	
	return (
		<Router>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<div className="App">
					<MainComponent />
				</div>
			</ThemeProvider>
		</Router>

  	);
}

export default App;
