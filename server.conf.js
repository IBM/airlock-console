/**
 * Created by yoavmac on 13/09/2016.
 */

// Load Express
var express = require('express');

// Load Node http module
var http = require('http');
var https = require('https');
var fs = require('fs');


// Create our app with Express
let app = express();

/*https.createServer({
    key: fs.readFileSync('./config/authentication/key.pem'),
    cert: fs.readFileSync('./config/authentication/cert.pem')
}, app).listen(3000);*/

// Create a Node server for our Express app
let server = http.createServer(app);

// Log requests to the console (Express 4)
var morgan = require('morgan');

// Pull information from HTML POST (express 4)
var bodyParser = require('body-parser');

// Simulate DELETE and PUT (Express 4)
var methodOverride = require('method-override');

// Authentication
var cookieParser = require('cookie-parser');
var session = require('express-session');
var connect = require('connect');
var auth = require('./config/authentication/auth');

// Set the port for this app
let port = process.env.PORT || 3000;

if (process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'test') {

    // Log every request to the console
    app.use(morgan('dev'));
}

// Read cookies (needed for authentication)
app.use(cookieParser());

// Get all data/stuff of the body (POST) parameters

// Parse application/json
app.use(bodyParser.json());

// Parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Override with the X-HTTP-Method-Override header in the request. Simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// Set the static files location
app.use(express.static(__dirname + '/dist'));

// Passport JS session secret
app.use(session({

    secret : process.env.SESSION_SECRET || 'it is a secret',
    resave : true,
    saveUninitialized : true
}));

app.use(auth.initialize());
app.use(auth.session());

// Get an instance of the express Router
let router = express.Router();

// Load our application API routes
import routes from './config/routes/routes';

// Pass in instances of the express app, router, and passport
routes(app, router, auth);

// Ignition Phase
server.listen(port);

// Shoutout to the user
console.log(`Server is listening on port ${port}`);

// Expose app
export {app};
