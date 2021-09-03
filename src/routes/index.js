const mainNavObjectsArr = [    
    {
        title : "Manage Scrapers",
        path : "/manage-scrapers",
        shown : true,
        children : [],
    },
    {
        title : "Scraped / Stored Data",
        path : "/scraped-data",
        children : [],
    },
    {
        title : "Manage Users",
        path : "/manage-users",
        children : [
            // {
            //     title : "Create a User",
            //     path : "/manage-users/create-user"
            // },
            // {
            //     title : "Update a User",
            //     path : "/manage-users/update-user/:id"
            // },
            // {
            //     title : "Delete a User",
            //     path : "/manage-users/delete-user/:id"
            // }
        ],
    },
    {
        title : "Manage Tasks",
        path : "/manage-tasks",
        children : [
            // @ic@yumi1828
            // {
            //     title : "Create a Task",
            //     path : "/manage-tasks/create-scraper"
            // },
            // {
            //     title : "Update a Task",
            //     path : "/manage-tasks/update-scraper/:id"
            // },
            // {
            //     title : "Delete a Task",
            //     path : "/manage-tasks/delete-scraper/:id"
            // }
        ],
    }
];


export default mainNavObjectsArr;