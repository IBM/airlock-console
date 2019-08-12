/**
 * Created by yoavmac on 14/09/2016.
 */

// Define routes for the Node backend

// Load our API routes for user authentication
import authRoutes from './authentication.routes.js';

export default (app, router, auth) => {

    // Express middleware to use for all requests
    router.use((req, res, next) => {

        console.log('Request arrived'); // DEBUG

        // Make sure we go to the next routes and don't stop here...
        next();
    });

    // Define a middleware function to be used for all secured routes
    let secured = (req, res, next) => {

        if (!req.isAuthenticated())
            //res.sendStatus(401);
            res.redirect('/auth/login');
        else
            next();
    };

    // Pass in our Express app and Router
    authRoutes(app, router, auth, secured);

    // Optional: set a prefix to all backend URLs
    app.use('/', router);

    // Route to handle all Angular requests
    app.get('/', (req, res) => {

        res.sendFile('/dist/index.html', { root: __dirname + "/../../"});
    });
};
