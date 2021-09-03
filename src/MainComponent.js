// core
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";


// Layout
import Layout from "./Layout";

// routes 
import routes from "./routes";

// views 
    import Login from "./views/Login";
    import Dashboard from "./views/Dashboard";

    // Manage Scrapers
    import ManageScrapers from "./views/ManageScrapers";
        import CreateScraper from "./views/ManageScrapers/CreateScraper/";
        import RunScraperScript from "./views/ManageScrapers/RunScraperScript/RunScraperScript";
        import ScraperDetails from "./views/ManageScrapers/ScraperDetails";

    // Scraped Data
    import ScrapedData from "./views/ScrapedData";
        import ScrapedDataTable from "./views/ScrapedData/ScrapedDataTable";

    // Manage Users
    import ManageUsers from "./views/ManageUsers";

    // Manage Tasks
    import ManageTasks from "./views/ManageTasks";

    // MY Profile
    import MyProfile from "./views/MyProfile";


    // 404
    import Page404 from "./views/Page404/Page404";



// css
import styles from "./MainComponent.module.scss";

export default function Main()  {

    const getRoute = (route) => {
        return routes.find(item => item.path === route);
    }

    const getChildRoute = (route) => {
        let parentRoute = routes.find(item => route.includes(item.path));
        return parentRoute.children.find(item => item.path === route);
    }


    return (
        <div className={styles.main}>
            <Router>
                <Switch>

                    <Route path="/" exact>
                        <Layout><Dashboard pageTitle="Scraper Admin Dashboard" /></Layout>
                    </Route>

                    {/* {ManageScrapers} */}
                    <Route path="/manage-scrapers" exact>
                        <Layout><ManageScrapers pageTitle={getRoute("/manage-scrapers").title} /></Layout>
                    </Route>
                        <Route path="/manage-scrapers/create-scraper/" exact>
                            <Layout><CreateScraper pageTitle="Create a Scraper Script" /></Layout>
                        </Route>
                        
                        <Route path="/manage-scrapers/run-script/:id" exact>
                            <Layout><RunScraperScript pageTitle="Run Scraper Script" /></Layout>
                        </Route>

                        <Route path="/manage-scrapers/:id" exact>
                            <Layout><ScraperDetails pageTitle="Scraper Details : " /></Layout>
                        </Route>

                    
                    {/* Scraped Data */}
                    <Route path="/scraped-data/" exact>
                        <Layout><ScrapedData pageTitle={getRoute("/scraped-data").title} /></Layout>
                    </Route>
                        <Route path="/scraped-data/:apiRoute">
                            <Layout><ScrapedDataTable pageTitle="Scraped Data : " /></Layout>
                        </Route>

                    {/* Manage Users */}
                    <Route path="/manage-users" exact>
                        <Layout><ManageUsers pageTitle={getRoute("/manage-users").title} /></Layout>
                    </Route>

                    {/* Tasks*/}
                    <Route path="/manage-tasks" exact>
                        <Layout><ManageTasks pageTitle={getRoute("/manage-tasks").title} /></Layout>
                    </Route>

                    {/* My Profile */}
                    <Route path="/my-profile" exact>
                        <Layout><ManageTasks pageTitle="My Profile" /></Layout>
                    </Route>

                    {/* Login */}
                    <Route path="/login" exact>
                        <Login  />
                    </Route>


                    <Route path="/" >
                        <Layout><Page404 pageTitle={"Page 404"} /></Layout>
                    </Route>
                    
                    
                </Switch>
                
            </Router>
        </div>
    );
}