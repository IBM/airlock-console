/**
 * Created by yoavmac on 14/09/2016.
 */
var http = require('http');
export default (app, router, auth, secured) => {
    var authType = JSON.stringify((process.env.AIRLOCK_AUTH_TYPE) ? process.env.AIRLOCK_AUTH_TYPE : 'OKTA');
    console.log("in Authentication");
    /////////sample hook callback
    // router.post('/webhook/callback', (req, res) => {
    //     console.log("webhook recieved");
    //     console.log("-------body------------");
    //     console.log(req.body);
    //     console.log("-------time-------------");
    //     console.log(req.body.time);
    //     // console.log("-------files-------------");
    //     // console.log(req.body.files);
    //     // console.log(req.body.files[0]);
    //     // console.log(req.body.files[0].globalUsers);
    //     // console.log(req.body.files[0].globalUsers[0]);
    //     res.send(req.body);
    // });
    ///////////////////
    const isOKTA = (authType == '"OKTA"');
    const isAZURE = (authType == '"AZURE"');
    const isGOOGLE = (authType == '"GOOGLE"')
    if (isOKTA) {
        console.log("IS OKTA");
        router.get('/auth/login', auth.authenticate('saml', { successRedirect: '/', failureRedirect: '/auth/login', failureFlash: true }));

        router.post('/auth/login/callback', (reqSaml, resSaml) => {
            console.log("get to /auth/login/callback");
            // console.log(reqSaml.body);
            // console.log(reqSaml.body.SAMLResponse);

            // append the current chunk of data to the fullBody variable
            console.log("in data");
            // console.log(window.location);
            var fullSAMLBody = reqSaml.body.SAMLResponse;
            var AIRLOCK_API_URL = JSON.stringify((process.env.AIRLOCK_API_URL) ?
                process.env.AIRLOCK_API_URL : ((process.env.airlock_api_url) ?
                    process.env.airlock_api_url : 'http://9.148.54.98:9393/airlock/api/admin'))
            console.log(AIRLOCK_API_URL);
            // console.log(fullSAMLBody);

            var startIndex = AIRLOCK_API_URL.indexOf("//");
            var portIndex  = AIRLOCK_API_URL.indexOf(":",startIndex);
            var endHostIndex = AIRLOCK_API_URL.indexOf("/",startIndex+2);
            var finalHostIndex = portIndex;
            if(finalHostIndex == -1){
                finalHostIndex = endHostIndex;
            }
            var hostAPI  = AIRLOCK_API_URL.substring(startIndex + 2,finalHostIndex);
            var hostType = AIRLOCK_API_URL.substring(1,startIndex -1);
            console.log("*"+hostType+"*");
            console.log(startIndex);
            console.log(portIndex);
            console.log(endHostIndex);
            console.log("hostAPI********"+hostAPI);
            var options = {
                host: hostAPI,
                path: '/airlock/api/admin/authentication',
                // url: 'https://api.airlock.twcmobile.weather.com/airlock/api/admin/authentication',
                method: 'POST'
            };
            if(portIndex != -1){
                options.port = parseInt(AIRLOCK_API_URL.substring(portIndex + 1,endHostIndex));
            }
            console.log(options);
            var rootCas = require('ssl-root-cas').create();
            rootCas
                .addFile(__dirname + '/certificate.pem')
            ;

            require('https').globalAgent.options.ca = rootCas;
            var https = require('https');
            var reqObj = http;
            if(hostType == "https"){
                reqObj = https;
            }
            var req = reqObj.request(options, function(res) {
                console.log('Status: ' + res.statusCode);
                console.log('Headers: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (body) {

                    console.log('Body: ' + body);
                    // body = body.substring(1,body.length - 1);
                    // resSaml.cookie("jwt",body,{ maxAge: 900000, httpOnly: false });
                    resSaml.setHeader( 'Access-Control-Allow-Origin', '*');
                    resSaml.setHeader(  'Access-Control-Allow-Credentials', true);
                    resSaml.setHeader(  'Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
                    resSaml.setHeader(  'Access-Control-Allow-Headers', 'Content-Type');
                    resSaml.redirect("/?jwt="+encodeURIComponent(body));
                });
            });
            req.on('error', function(e) {
                console.log(e);
                console.log('problem with request: ' + e.message);
            });
// write data to request body
            req.write(fullSAMLBody);
            req.end();
            console.log("after req end");

            // TODO: Redirect to fron end and also pass the SAML assetion
            //res.redirect('/');

        });
    }else if (isAZURE) {
        var authURL = (process.env.AIRLOCK_AUTH_AZURE_URL) ? process.env.AIRLOCK_AUTH_AZURE_URL : 'OKTA';
        router.get('/auth/login', (req, res) => {

            // If the user is authenticated, return a user object else return 0
            console.log(authURL)
            res.redirect(authURL);
        });

    } else if (isGOOGLE) {
        console.log("IS GOOGLE");
        // router.get('/google', passport.authenticate('google',{scope:['profile', 'email']}))
        router.get('/auth/login', auth.authenticate('google',{scope:['openid','profile', 'email']}))
        router.get('/auth/google/callback', auth.authenticate('google', {failureRedirect:"/"}),
            (req, res) => {
                console.log("req at google/callback routes:"+req);
                var accessToken = req.user.accessToken;
                var email = req.user.email;
                var id_token = req.user.id_token;
                var refreshToken = req.user.refreshToken;
                var AIRLOCK_API_URL = JSON.stringify((process.env.AIRLOCK_API_URL) ?
                    process.env.AIRLOCK_API_URL : ((process.env.airlock_api_url) ?
                        process.env.airlock_api_url : 'http://9.148.54.98:9393/airlock/api/admin'))
                console.log(AIRLOCK_API_URL);

                var startIndex = AIRLOCK_API_URL.indexOf("//");
                var portIndex  = AIRLOCK_API_URL.indexOf(":",startIndex);
                var endHostIndex = AIRLOCK_API_URL.indexOf("/",startIndex+2);
                var finalHostIndex = portIndex;
                if(finalHostIndex == -1){
                    finalHostIndex = endHostIndex;
                }
                var hostAPI  = AIRLOCK_API_URL.substring(startIndex + 2,finalHostIndex);
                var hostType = AIRLOCK_API_URL.substring(1,startIndex -1);
                console.log("*"+hostType+"*");
                console.log(startIndex);
                console.log(portIndex);
                console.log(endHostIndex);
                console.log("hostAPI********"+hostAPI);
                var options = {
                    host: hostAPI,
                    path: '/airlock/api/admin/authentication',
                    // url: 'https://api.airlock.twcmobile.weather.com/airlock/api/admin/authentication',
                    method: 'POST'
                };
                if(portIndex != -1){
                    options.port = parseInt(AIRLOCK_API_URL.substring(portIndex + 1,endHostIndex));
                }
                console.log(options);
                var rootCas = require('ssl-root-cas').create();
                rootCas
                    .addFile(__dirname + '/certificate.pem')
                ;

                require('https').globalAgent.options.ca = rootCas;
                var https = require('https');
                var reqObj = http;
                if(hostType == "https"){
                    reqObj = https;
                }
                var req = reqObj.request(options, function(resAirlock) {
                    console.log('Status: ' + resAirlock.statusCode);
                    console.log('Headers: ' + JSON.stringify(resAirlock.headers));
                    resAirlock.setEncoding('utf8');
                    resAirlock.on('data', function (body) {

                        console.log('Body: ' + body);
                        // body = body.substring(1,body.length - 1);
                        // resSaml.cookie("jwt",body,{ maxAge: 900000, httpOnly: false });
                        res.cookie("jwt",body,{ maxAge: 900000, httpOnly: false });
                        res.setHeader( 'Access-Control-Allow-Origin', '*');
                        res.setHeader(  'Access-Control-Allow-Credentials', true);
                        res.setHeader(  'Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
                        res.setHeader(  'Access-Control-Allow-Headers', 'Content-Type');
                        res.redirect("/?jwt="+encodeURIComponent(body));
                    });
                });
                req.on('error', function(e) {
                    console.log(e);
                    console.log('problem with request: ' + e.message);
                });

                console.log("requessst:");
                console.log(req);
                req.write(id_token+"="+accessToken);
                req.end();
                console.log("after req end");
                // res.redirect('/')
            })

    }
    else {
        console.log("IS NOT OKTA");
        var passport = require('passport');
        // BLUEid auth type
        router.get('/auth/login', auth.authenticate('openidconnect', { successRedirect: '/', failureRedirect: '/auth/login', failureFlash: true }));
        /*
         app.get('/auth/github/callback',
         passport.authenticate('github', { failureRedirect: '/login' }),
         function(req, res) {
         // successful auth, user is set at req.user.  redirect as necessary.
         if (req.user.isNew) { return res.redirect('/back_again'); }
         res.redirect('/welcome');
         });
         */
        app.get('/auth/login/callback',passport.authenticate('openidconnect', {
                failureRedirect: '/failure'}),
            function(req, res) {
                console.log("********** in /auth/login/callback");
                console.log(req);
                console.log(req.user)
                console.log(req.user.jwt)
                console.log("**********");
                if(req.user.jwt) {
                    res.redirect('/?jwt=' + req.user.jwt);
                }else{
                    res.redirect('/noCredentials.html');
                }
            });
    }


    // Route to test if the user is logged in or not
    router.get('/auth/loggedIn', (req, res) => {

        // If the user is authenticated, return a user object else return 0
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // Route to log a user out
    router.post('/auth/logout', (req, res) => {

        req.logOut();

        // Even though the logout was successful, send the status code
        // `401` to be intercepted and reroute the user to the appropriate
        // page
        res.sendStatus(401);
    });

    // Route to get the current user
    router.get('/auth/user', secured, (req, res) => {

        res.json(req.user);
    });
};
