/**
 * Created by yoavmac on 08/09/2016.
 */

var passport = require('passport');
var SamlStrategy = require('passport-saml').Strategy;
var config = require('./auth.conf.json');
var users = [];
var http = require('http');


function findByEmail(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        if (user.email === email) {
            //console.log(user);
            return fn(null, user);
        }
    }
    return fn(null, null);
}
console.log(process.env.AIRLOCK_AUTH_TYPE);
var authType = JSON.stringify((process.env.AIRLOCK_AUTH_TYPE) ? process.env.AIRLOCK_AUTH_TYPE : 'OKTA');
console.log(authType == '"OKTA"');
console.log(authType);
if (authType == '"OKTA"') {
    console.log("OKTA Auth");
    // Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(id, done) {
        findByEmail(id, function (err, user) {
            done(err, user);
        });
    });
    var entryPoint = "okta_entry_point_goes_here";
    console.log("before url given:"+process.env.AIRLOCK_OKTA_URL);
    if(JSON.stringify(process.env.AIRLOCK_OKTA_URL)){
        console.log(process.env.AIRLOCK_OKTA_URL);
        entryPoint = process.env.AIRLOCK_OKTA_URL;
    }
    console.log(entryPoint);
    passport.use(new SamlStrategy(
        {
            issuer: "http://localhost:3000/",
            path: '/auth/login/callback',
            entryPoint: entryPoint,
            cert: config.auth.cert
        },
        function(profile, done) {
            if (!profile.email) {
                return done(new Error("No email found"), null);
            }
            process.nextTick(function () {
                findByEmail(profile.email, function(err, user) {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        users.push(profile);
                        return done(null, profile);
                    }
                    return done(null, user);
                })
            });
        }
    ));

    passport.protected = function protectedResource(req, res, next) {

        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    };
}else if (authType == '"AZURE"'){

} else {
    console.log("BLUE Auth");
    // AUTH_TYPE == "BLUEID"
    // read settings.js
    var settings = require('./settings.js');
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });
    var OpenIDConnectStrategy = require('passport-idaas-openidconnect').IDaaSOIDCStrategy;
    var callback_url = (process.env.AIRLOCK_BLUE_CALLBACK_URL) ?
        process.env.AIRLOCK_BLUE_CALLBACK_URL : settings.callback_url;
    var authorization_url =  (process.env.AIRLOCK_BLUE_AUTHORIZATION_URL) ?
        process.env.AIRLOCK_BLUE_AUTHORIZATION_URL : settings.authorization_url;
    var token_url =  (process.env.AIRLOCK_BLUE_TOKEN_URL) ?
        process.env.AIRLOCK_BLUE_TOKEN_URL : settings.token_url;
    var client_id =  (process.env.AIRLOCK_BLUE_CLIENT_ID) ?
        process.env.AIRLOCK_BLUE_CLIENT_ID : settings.client_id;
    var client_secret =  (process.env.AIRLOCK_BLUE_CLIENT_SECRET) ?
        process.env.AIRLOCK_BLUE_CLIENT_SECRET : settings.client_secret;
    var issuer_id =  (process.env.AIRLOCK_BLUE_ISSUER_ID) ?
        process.env.AIRLOCK_BLUE_ISSUER_ID : settings.issuer_id;

    console.log(callback_url);
    var Strategy = new OpenIDConnectStrategy({
            authorizationURL : authorization_url,
            tokenURL : token_url,
            clientID : client_id,
            scope: 'openid',
            response_type: 'code',
            clientSecret : client_secret,
            callbackURL : callback_url,
            skipUserProfile: true,
            issuer: issuer_id,
            addCACert: true,
            CACertPathList: [
                '/verisign-root-ca.pem',
                '/symantec.pem',
                '/blueidSSL.pem',
                '/prepiam.toronto.ca.ibm.com.pem']
        },
        function(iss, sub, profile, accessToken, refreshToken, params, done)  {
            let jwt = params.id_token;
            //////??/////////////////////////////
            console.log("get to /auth/login/callback");

            // append the current chunk of data to the fullBody variable
            console.log("in data");
            // console.log(window.location);
            var AIRLOCK_API_URL = JSON.stringify((process.env.AIRLOCK_API_URL) ?
                process.env.AIRLOCK_API_URL : ((process.env.airlock_api_url) ?
                    process.env.airlock_api_url : 'http://9.148.54.98:9393/airlock/api/admin'));
            console.log(AIRLOCK_API_URL);

            var AIRLOCK_API_AUTH_KEY = (process.env.AIRLOCK_API_AUTH_KEY) ?
                process.env.AIRLOCK_API_AUTH_KEY : 'blueidSSL.pem';
            console.log(AIRLOCK_API_AUTH_KEY);
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
            console.log("***********JWT*************");
            console.log(jwt);
            console.log("***********JWT*************");
            var options = {
                host: hostAPI,
                path: '/airlock/api/admin/authentication/sso?key='+AIRLOCK_API_AUTH_KEY,
                method: 'GET'
            };
            if(portIndex != -1){
                options.port = parseInt(AIRLOCK_API_URL.substring(portIndex + 1,endHostIndex));
            }
            console.log(options);
            var https = require('https');
            var reqObj = http;
            if(hostType == "https"){
                reqObj = https;
            }
            var req = reqObj.request(options, function(res) {
                console.log('Status: ' + res.statusCode);
                console.log('Headers: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                // res.redirect("/?jwt="+encodeURIComponent(body));
                res.on('data', function (body) {

                    console.log('Body: ' + body);
                    console.log(res);
                    // body = body.substring(1,body.length - 1);
                    // resSaml.cookie("jwt",body,{ maxAge: 900000, httpOnly: false });
                    // global.response.setHeader( 'Access-Control-Allow-Origin', '*');
                    // global.response.setHeader(  'Access-Control-Allow-Credentials', true);
                    // global.response.setHeader(  'Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
                    // global.response.setHeader(  'Access-Control-Allow-Headers', 'Content-Type');
                    // global.jwt = encodeURIComponent(body);
                    var jwt = encodeURIComponent(body);
                    process.nextTick(function() {
                        profile.accessToken = accessToken;
                        profile.refreshToken = refreshToken;
                        profile.jwt = jwt;
                        done(null, profile);
                    })
                });
            });
            req.on('error', function(e) {
                console.log(e);
                console.log('problem with request: ' + e.message);
                process.nextTick(function() {
                    profile.accessToken = accessToken;
                    profile.refreshToken = refreshToken;
                    done(null, profile);
                })
            });
            // write data to request body
            req.setHeader('sessionToken',jwt);
            // req.write(jwt);
            req.end();
            console.log("after req end");
            /////////////////////////////////////

        });

    passport.use(Strategy);

}


exports = module.exports = passport;
