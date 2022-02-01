"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlockService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
var rxjs_1 = require("rxjs");
var authorization_service_1 = require("./authorization.service");
var baMenu_service_1 = require("../theme/services/baMenu/baMenu.service");
var save_as_1 = require("save-as");
var router_1 = require("@angular/router");
var role_1 = require("../model/role");
var AirlockService = /** @class */ (function () {
    function AirlockService(http, _menuService, router) {
        // this.jwtToken = this.getCookie("jwt");
        var _this = this;
        this.http = http;
        this._menuService = _menuService;
        this.router = router;
        //arrange notifications
        this._data = new rxjs_1.Subject();
        this._dataStream$ = this._data.asObservable();
        this._subscriptions = new Map();
        ////////////////////////
        this.airlockBaseApiUrl = process.env.AIRLOCK_API_URL;
        this.airlockVersion = process.env.VERSION;
        this.auth = process.env.AIRLOCK_API_AUTH;
        this.staticModeFlag = process.env.AIRLOCK_STATIC_FEATURE_MODE;
        this.cohortsMode = process.env.AIRLOCK_COHORTS_MODE;
        this.analytics_url = process.env.AIRLOCK_ANALYTICS_URL;
        // private airlockBaseApiUrl = 'http://9.148.49.163:8080/airlock/api/admin';
        // private airlockBaseApiUrl = 'http://9.148.54.98:7070/airlock/api/admin'; // console dev
        // private airlockBaseApiUrl = 'http://9.148.54.98:2020/airlock/api/admin'; // rotem/vicky QA
        // private airlockBaseApiUrl = 'http://airlock2.7iku82rby4.eu-west-1.elasticbeanstalk.com/airlock/api/admin'; // amazon
        this.airlockBaseApiUrlAnalytic = "" + this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5);
        this.airlockProductsUrl = this.airlockBaseApiUrl + "/products";
        this.airlockAirlyticsUrl = this.airlockBaseApiUrl + "/airlytics";
        this.airlockInAppPurchasesUrl = this.airlockProductsUrl;
        this.airlockGroupsUrl = this.airlockBaseApiUrl + "/usergroups";
        this.airlockFeaturesUrl = this.airlockBaseApiUrl + "/features";
        this.airlockTranslationsUrl = this.airlockBaseApiUrl + "/../translations";
        this.airlockAnalyticsUrl = this.airlockBaseApiUrlAnalytic + "/analytics";
        this.airlockAuthUrl = this.airlockBaseApiUrl + "/authentication";
        this.airlockAboutUrl = this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5) + "/ops/about";
        this.airlockOpsUrl = this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5) + "ops";
        this.hasAdminProds = false;
        this.addStringValidateMode = "VALIDATE";
        this.addStringActMode = "ACT";
        if (this.jwtToken == null || this.jwtToken.length == 0) {
            console.log("jwt is empty look from query string");
            var d = document;
            this.jwtToken = d.jwtToken;
        }
        this.userRoleGlobal = this.calcUserRole();
        this.isStringTranslateRoleGlobal = this.calcIsStringTranslateRole();
        this.isAnalyticsViewerRoleGlobal = this.calcIsAnalyticsViewerRole();
        this.isAnalyticsEditorRoleGlobal = this.calcIsAnalyticsEditorRole();
        this.userRole = this.userRoleGlobal;
        this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
        this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
        this.isAnalyticsEditorRole = this.isAnalyticsEditorRoleGlobal;
        this.userName = this.calcUserName();
        this.email = this.calcEmail();
        try {
            console.log("version:" + this.getVersion());
            console.log("JWT:" + this.jwtToken);
            console.log(this.getUserRole());
            this._dataStream$.subscribe(function (data) { return _this._onEvent(data); });
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
                console.log(userData);
                var startDate = userData.iat;
                var endDate = userData.exp;
                var period = (endDate - startDate) / 3 * 1000;
                console.log(period);
                setInterval(function () {
                    _this.extendSession();
                }, period);
            }
        }
        catch (e) {
            console.log(e);
            this.jwtToken = "";
        }
    }
    AirlockService.prototype.getGlobalUserRole = function () {
        return this.userRoleGlobal;
    };
    AirlockService.prototype.initRolePerProduct = function (rolesList) {
        console.log("initRolePerProduct");
        console.log(rolesList);
        if (!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            this.userRole = this.userRoleGlobal;
            this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
            this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
            this.isAnalyticsEditorRole = this.isAnalyticsEditorRoleGlobal;
            return;
        }
        this.userRole = authorization_service_1.AuthorizationService.getActualRole(rolesList);
        console.log("initRolePerProduct set role:" + this.userRole);
        var isStringTranslateRole = false;
        var isAnalyticsViewerRole = false;
        var isAnalyticsEditorRole = false;
        for (var _i = 0, rolesList_1 = rolesList; _i < rolesList_1.length; _i++) {
            var curRole = rolesList_1[_i];
            if (curRole === "TranslationSpecialist") {
                isStringTranslateRole = true;
            }
            else if (curRole === "AnalyticsViewer") {
                isAnalyticsViewerRole = true;
            }
            else if (curRole === "AnalyticsEditor") {
                isAnalyticsEditorRole = true;
            }
        }
        this.isStringTranslateRole = isStringTranslateRole;
        this.isAnalyticsViewerRole = isAnalyticsViewerRole;
        this.isAnalyticsEditorRole = isAnalyticsEditorRole;
    };
    AirlockService.prototype.updateUserRoleForProduct = function (productId, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //http://localhost:9090/airlock/api/ops/products/{product_id}/airlockuser/roles
        if (!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            return new Promise(function (resolve, reject) {
                resolve(42);
            });
        }
        var url = this.airlockBaseApiUrl + "/../ops/products/" + productId + "/airlockuser/roles";
        var issue = {};
        // var userData = AuthorizationService.getUser(this.jwtToken);
        if (this.email != null && this.email.length > 0) {
            issue["user"] = this.email[0];
        }
        else {
        }
        return this.http.post(url, JSON.stringify(issue), this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var creds = response.json();
            _this.initRolePerProduct(creds.roles);
            return creds;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.isUserHasStringTranslateRole = function () {
        return this.isStringTranslateRole;
    };
    AirlockService.prototype.isUserHasAnalyticsViewerRole = function () {
        return this.isAnalyticsViewerRole;
    };
    AirlockService.prototype.isUserHasAnalyticsEditorRole = function () {
        return this.isAnalyticsEditorRole;
    };
    AirlockService.prototype.getCopiedFeature = function () {
        return this.copiedFeature;
    };
    AirlockService.prototype.getCopiedFeatureBranch = function () {
        return this.copiedFeatureBranch;
    };
    AirlockService.prototype.getCopiedPurchase = function () {
        return this.copiedPurchase;
    };
    AirlockService.prototype.getCopiedPurchaseBranch = function () {
        return this.copiedPurchaseBranch;
    };
    AirlockService.prototype.setCopiedPurchase = function (purchase, branch) {
        this.copiedPurchase = purchase;
        this.copiedPurchaseBranch = branch;
    };
    AirlockService.prototype.setCopiedFeature = function (feature, branch) {
        this.copiedFeature = feature;
        this.copiedFeatureBranch = branch;
    };
    AirlockService.prototype.getAnalyticsUrl = function () {
        return this.analytics_url;
    };
    AirlockService.prototype.getCopiedStrings = function () {
        return this.copiedStrings;
    };
    AirlockService.prototype.setCopiedStrings = function (strings) {
        if (strings != null && strings.length != 0) {
            this.copiedStrings = strings;
        }
    };
    AirlockService.prototype.downloadStrings = function (seasonId, strings, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        if (strings.length != 0) {
            var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/strings?mode=INCLUDE_TRANSLATIONS";
            for (var _i = 0, strings_1 = strings; _i < strings_1.length; _i++) {
                var stringId = strings_1[_i];
                url += "&ids=" + stringId;
            }
            var fileName = "Strings.json";
            return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
                .toPromise()
                .then(function (response) { return _this.extractContent(JSON.stringify(response.json()), fileName); })
                .catch(errorHandler);
        }
    };
    AirlockService.prototype.processDownloadFile = function (data, assetName) {
        console.log(data._body.length);
        var blob = new Blob([data._body], { "type": 'application/octet-stream' });
        // Must detect if the browser is IE in order to download files on IE.
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, assetName + ".zip");
        }
        else {
            save_as_1.default(blob, assetName + ".zip");
            /*
            let a = document.createElement("a");
            document.body.appendChild(a);
            //   a.setAttribute('style', 'display: none');
            let someUrl = window.URL.createObjectURL(blob);
            a.href = someUrl;
            a.download = assetName + ".zip";
            a.click();
            window.URL.revokeObjectURL(someUrl);*/
        }
    };
    AirlockService.prototype.downloadStringsToFormat = function (seasonId, strings, format, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        if (strings.length != 0) {
            var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/stringstoformat?mode=INCLUDE_TRANSLATIONS&format=" + format;
            for (var _i = 0, strings_2 = strings; _i < strings_2.length; _i++) {
                var stringId = strings_2[_i];
                url += "&ids=" + stringId;
            }
            var fileName = "Strings";
            // let headers =  this.addAuthToHeaders(new Headers());
            // console.log(headers);
            //{
            // method: RequestMethod.Post,
            //     responseType: ResponseContentType.Blob,
            //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}
            return this.http.get(url, { responseType: http_1.ResponseContentType.ArrayBuffer, headers: new http_1.Headers({ 'sessionToken': this.jwtToken }) })
                .toPromise()
                .then(function (response) { return _this.processDownloadFile(response, fileName); })
                .catch(errorHandler);
        }
    };
    AirlockService.prototype.downloadRuntimeDefaultFiles = function (seasonId, locale, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //TODO: add locale parameter to url
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/runtimedefaults";
        var fileName = "RuntimeDefaults";
        // let headers =  this.addAuthToHeaders(new Headers());
        // console.log(headers);
        //{
        // method: RequestMethod.Post,
        //     responseType: ResponseContentType.Blob,
        //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}
        return this.http.get(url, { responseType: http_1.ResponseContentType.ArrayBuffer, headers: new http_1.Headers({ 'sessionToken': this.jwtToken }) })
            .toPromise()
            .then(function (response) { return _this.processDownloadFile(response, fileName); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getVersion = function () {
        return this.airlockVersion;
    };
    AirlockService.prototype.getApiUrl = function () {
        return this.airlockBaseApiUrl;
    };
    AirlockService.prototype.getUserName = function () {
        return this.userName;
    };
    AirlockService.prototype.getUserEmail = function () {
        return this.email;
    };
    AirlockService.prototype.calcUserName = function () {
        if (this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            if (userData != null && userData.userAttributes != null) {
                return userData.userAttributes.FirstName + " " + userData.userAttributes.LastName;
            }
        }
        return "Esteban Zia";
    };
    AirlockService.prototype.calcEmail = function () {
        if (this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            if (userData != null && userData.userAttributes != null) {
                return userData.userAttributes.Email;
            }
        }
        return "DummyUserForNotifications@weather.com";
    };
    AirlockService.prototype.getUserData = function () {
        try {
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
                if (userData != null) {
                    return userData.userAttributes;
                }
            }
        }
        catch (e) {
        }
        return { "FirstName": "", "LastName": "", "Email": "" };
    };
    AirlockService.prototype.getUserRole = function () {
        return this.userRole;
    };
    AirlockService.prototype.isGlobalUserViewer = function () {
        return (this.userRoleGlobal === "Viewer");
    };
    AirlockService.prototype.isGlobalUserProductLead = function () {
        return (this.userRoleGlobal == "ProductLead");
    };
    AirlockService.prototype.isGlobalUserAdministrator = function () {
        return (this.userRoleGlobal == "Administrator");
    };
    AirlockService.prototype.isGlobalUserEditor = function () {
        return (this.userRoleGlobal == "Editor");
    };
    AirlockService.prototype.isViewer = function () {
        return (this.userRole === "Viewer");
    };
    AirlockService.prototype.isProductLead = function () {
        return (this.userRole == "ProductLead");
    };
    AirlockService.prototype.isAdministrator = function () {
        return (this.userRole == "Administrator");
    };
    AirlockService.prototype.isEditor = function () {
        return (this.userRole == "Editor");
    };
    AirlockService.prototype.calcIsStringTranslateRole = function () {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (var _i = 0, _a = userData.userRoles; _i < _a.length; _i++) {
                    var curRole = _a[_i];
                    if (curRole === "TranslationSpecialist") {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    };
    AirlockService.prototype.calcIsAnalyticsViewerRole = function () {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (var _i = 0, _a = userData.userRoles; _i < _a.length; _i++) {
                    var curRole = _a[_i];
                    if (curRole === "AnalyticsViewer") {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    };
    AirlockService.prototype.calcIsAnalyticsEditorRole = function () {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (var _i = 0, _a = userData.userRoles; _i < _a.length; _i++) {
                    var curRole = _a[_i];
                    if (curRole === "AnalyticsEditor") {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    };
    AirlockService.prototype.calcUserRole = function () {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = authorization_service_1.AuthorizationService.getUser(this.jwtToken);
            return authorization_service_1.AuthorizationService.getActualRole(userData.userRoles);
        }
        return "Administrator";
    };
    AirlockService.prototype.extendSession = function (errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAuthUrl + "/extend/";
        var v = this;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            console.log(response);
            var r = response;
            v.jwtToken = r._body;
            console.log(v.jwtToken);
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.logOut = function () {
        console.log("logOut");
        this.jwtToken = "";
        this.deleteCookie("jwt");
        var str = window.location.href;
        var ind = str.lastIndexOf("#");
        var prefix = str.substring(0, ind);
        window.location.href = prefix + 'logOut.html';
    };
    AirlockService.prototype.deleteCookie = function (name) {
        this.setCookie(name, "", -1);
    };
    AirlockService.prototype.setCookie = function (name, value, expireDays, path) {
        if (path === void 0) { path = ""; }
        var d = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "");
    };
    AirlockService.prototype.getCookie = function (name) {
        var cookiesArr = document.cookie.split(';');
        var len = cookiesArr.length;
        var cookieName = name + "=";
        var curCookie;
        for (var i = 0; i < len; i += 1) {
            curCookie = cookiesArr[i].replace(/^\s\+/g, "");
            if (curCookie.indexOf(cookieName) == 0) {
                return curCookie.substring(cookieName.length, curCookie.length);
            }
        }
        return "";
    };
    AirlockService.prototype.getProducts = function (errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var products = response.json().products;
            products = products.sort(function (n1, n2) {
                if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                    return 1;
                }
                if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                    return -1;
                }
                return 0;
            });
            return products;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getUsers = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockOpsUrl + "/userrolesets";
        if (productId != null && productId.length > 0) {
            url = this.airlockOpsUrl + "/products/" + productId + "/userrolesets";
        }
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var products = response.json().users;
            return products;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateUser = function (user, productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockOpsUrl + "/userrolesets/" + user.uniqueId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, JSON.stringify(user), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteUser = function (user, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockOpsUrl + "/userrolesets/" + user.uniqueId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.getUserRoles = function (errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockOpsUrl + "/userrolesets/user";
        var currUser = this.getUserEmail()[0];
        if (Array.isArray(currUser) && currUser.length > 0) {
            currUser = currUser[0];
        }
        var identifierObj = { identifier: currUser };
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(identifierObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            return res.json().userRoleSets;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addUser = function (user, productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockOpsUrl + "/userrolesets";
        if (productId != null && productId.length > 0) {
            url = this.airlockOpsUrl + "/products/" + productId + "/userrolesets";
        }
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(user), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getRoles = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var promise = new Promise(function (resolve, reject) {
            // setTimeout(() => {
            //
            // }, 1000);
            var role1 = new role_1.Role();
            role1.name = "Viewer";
            var role2 = new role_1.Role();
            role2.name = "Editor";
            role2.dependencies = ['Viewer'];
            var role3 = new role_1.Role();
            role3.name = "ProductLead";
            role3.dependencies = ['Viewer', 'Editor'];
            var role4 = new role_1.Role();
            role4.name = "AnalyticsViewer";
            role4.dependencies = ['Viewer'];
            var role5 = new role_1.Role();
            role5.name = "AnalyticsEditor";
            role5.dependencies = ['Viewer'];
            var role6 = new role_1.Role();
            role6.name = "Administrator";
            role6.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            var role7 = new role_1.Role();
            role7.name = "ProductAdmin";
            role7.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            var role8 = new role_1.Role();
            role8.name = "TranslationSpecialist";
            role8.dependencies = ['Viewer'];
            resolve([role1, role2, role3, role6, role4, role5, role8]);
        });
        return promise;
    };
    AirlockService.prototype.getDocumentLinks = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/documentlinks";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getImportTablesList = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/airlytics/products/" + productId + "/dataimport/meta/users/tables";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.isStaticMode = function () {
        return (this.staticModeFlag == "TRUE");
    };
    AirlockService.prototype.addAuthToHeaders = function (headers) {
        if (this.auth == "TRUE") {
            headers.append('sessionToken', this.jwtToken);
        }
        return { headers: headers };
    };
    AirlockService.prototype.validateCopyStrings = function (seasonId, stringsId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyStringsByMode("VALIDATE", seasonId, stringsId, false, errorHandler);
    };
    AirlockService.prototype.copyStrings = function (seasonId, stringsId, overwrite, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyStringsByMode("ACT", seasonId, stringsId, overwrite, errorHandler);
    };
    AirlockService.prototype.copyStringsByMode = function (mode, seasonId, stringsId, overwrite, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/copystrings/" + seasonId + "?mode=" + mode + "&overwrite=" + overwrite;
        for (var _i = 0, stringsId_1 = stringsId; _i < stringsId_1.length; _i++) {
            var stringItem = stringsId_1[_i];
            url += "&ids=" + stringItem;
        }
        console.log(url);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateImportStrings = function (seasonId, stringsContent, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importStringsByMode("VALIDATE", seasonId, stringsContent, false, errorHandler);
    };
    AirlockService.prototype.importStrings = function (seasonId, stringsContent, overwrite, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importStringsByMode("ACT", seasonId, stringsContent, overwrite, errorHandler);
    };
    AirlockService.prototype.importStringsByMode = function (mode, seasonId, stringsContent, overwrite, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/importstrings?mode=" + mode + "&overwrite=" + overwrite;
        console.log(url);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateImportStringsAsZip = function (seasonId, stringsContent, format, preserveFormat, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importStringsByModeAsZip("VALIDATE", seasonId, format, stringsContent, false, preserveFormat, errorHandler);
    };
    AirlockService.prototype.importStringsAsZip = function (seasonId, stringsContent, format, overwrite, preserveFormat, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importStringsByModeAsZip("ACT", seasonId, format, stringsContent, overwrite, preserveFormat, errorHandler);
    };
    AirlockService.prototype.importStringsByModeAsZip = function (mode, seasonId, format, stringsContent, overwrite, preserveFormat, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstringswithformat?mode=${mode}&format=ANDROID&overwrite=${overwrite}`;
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/importstringswithformat?mode=" + mode + "&format=" + format + "&overwrite=" + overwrite + "&preserveFormat=" + preserveFormat;
        console.log(url);
        //let headers = new Headers({
        //    'Content-Type': 'multipart/form-data'});
        //let headers = new Headers({
        //    'Content-Type': 'application/zip'});
        //let headers = new Headers({
        //   'Content-Type': 'application/x-www-form-urlencoded'});
        var headers = new http_1.Headers();
        //stringsContent = Base64Utils.Base64.decode(stringsContent);
        //stringsContent = Base64.decode(stringsContent);
        //stringsContent = encodeURI(stringsContent);
        //stringsContent = encodeURIComponent(stringsContent);
        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateCopyFeature = function (copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyFeatureByMode("VALIDATE", copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    AirlockService.prototype.copyFeature = function (copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyFeatureByMode("ACT", copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    AirlockService.prototype.validateCopyPurchase = function (copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyPurchaseByMode("VALIDATE", copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    AirlockService.prototype.copyPurchase = function (copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.copyPurchaseByMode("ACT", copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    //PUT /admin/features/copy/branches/{source-branch-id}/{feature-id}/branches/{destination-branch-id}/{new-parent-id}
    AirlockService.prototype.copyFeatureByMode = function (mode, copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        var url = this.airlockFeaturesUrl + "/copy/branches/" + copiedBranchId + "/" + copiedFeatureId + "/branches/" + targetBranchId + "/" + parentId + "?mode=" + mode;
        if (suffix != null) {
            url += "&namesuffix=" + suffix;
        }
        if (minAppVersion != null) {
            url += "&minappversion=" + minAppVersion;
        }
        console.log(url);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.copyPurchaseByMode = function (mode, copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        var url = this.airlockFeaturesUrl + "/copy/branches/" + copiedBranchId + "/" + copiedPurchaseId + "/branches/" + targetBranchId + "/" + parentId + "?mode=" + mode;
        if (suffix != null) {
            url += "&namesuffix=" + suffix;
        }
        if (minAppVersion != null) {
            url += "&minappversion=" + minAppVersion;
        }
        console.log(url);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.importFeatureByMode = function (mode, featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //http://9.148.48.79:4545/airlock/api/admin/features/import/nid?mode=ACT&namesuffix=suf&minappaersion=app&overrideids=true
        //PUT /admin/features/import/branches/{destination-branch-id}/{new-parent-id}
        var url = this.airlockFeaturesUrl + "/import/branches/" + targetBranchId + "/" + parentId + "?mode=" + mode + "&overrideids=true";
        if (suffix != null) {
            url += "&namesuffix=" + suffix;
        }
        if (minAppVersion != null) {
            url += "&minappversion=" + minAppVersion;
        }
        console.log(url);
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, featureContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.importFeature = function (featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importFeatureByMode("ACT", featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    AirlockService.prototype.validateImportFeature = function (featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        return this.importFeatureByMode("VALIDATE", featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    };
    AirlockService.prototype.getFeatures = function (season, branch, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("getFeatures");
        //let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        var url = this.airlockProductsUrl + "/seasons/" + season.uniqueId + "/branches/" + branch.uniqueId + "/features";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json().root; })
            .catch(errorHandler);
    };
    AirlockService.prototype.extractContent = function (res, fileName) {
        var saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style.cssText = "display: none";
            return function (data, fileName) {
                var blob = new Blob([data], { type: "octet/stream" }), url = window.URL.createObjectURL(blob);
                console.log(url);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());
        console.log(res);
        saveData(res, fileName);
    };
    AirlockService.prototype.downloadSeasonFeatures = function (season, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + season.uniqueId + "/features";
        console.log("downloadSeasonFeatures");
        var options = this.addAuthToHeaders(new http_1.Headers());
        options["responseType"] = "blob";
        console.log(options);
        var fileName = "versionrange" + season.minVersion;
        if (season.maxVersion != null) {
            fileName += " - " + season.maxVersion;
        }
        fileName += ".json";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return _this.extractContent(JSON.stringify(response.json()), fileName); })
            .catch(errorHandler);
    };
    AirlockService.prototype.downloadFeature = function (feature, branch, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId + "/features/" + feature.uniqueId + "?includeStrings=true";
        var fileName = feature.namespace + "_" + feature.name + ".json";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return _this.extractContent(JSON.stringify(response.json()), fileName); })
            .catch(errorHandler);
    };
    AirlockService.prototype.downloadEntitlement = function (feature, branch, errorHandler) {
        var _this = this;
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId + "/entitlements/" + feature.uniqueId + "?includeStrings=true";
        var fileName = feature.namespace + "_" + feature.name + ".json";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return _this.extractContent(JSON.stringify(response.json()), fileName); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getApiAbout = function (errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = "" + this.airlockAboutUrl;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getAllFeatures = function (product, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = "" + this.airlockFeaturesUrl;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getFeature = function (featureId, branchId, errorHandler) {
        if (branchId === void 0) { branchId = 'MASTER'; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/features/" + featureId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getInputSample = function (seasonId, stageName, minAppVersionName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/inputsample?stage=" + stageName + "&minappversion=" + minAppVersionName + "&generationmode=MAXIMAL";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getNotificationsOutputsample = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        // /admin/products/seasons/{season-id}/notifications/outputsample
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/notifications/outputsample";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStreamInputSample = function (seasonId, stageName, minAppVersionName, filter, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/streams/eventsfieldsbyfilter?stage=" + stageName;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, filter, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStreamFilterInputSample = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //POST /admin/products/seasons/{season-id}/streams/eventsfields
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/streams/eventsfields";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getUtilitiesInfo = function (seasonId, stageName, minAppVersionName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/utilitiesinfo?stage=" + stageName + "&minAppVerion=" + minAppVersionName;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStreamUtilitiesInfo = function (seasonId, stageName, minAppVersionName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/utilitiesinfo?stage=" + stageName + "&minAppVerion=" + minAppVersionName + "&type=STREAMS_UTILITY";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getExperimentInputSample = function (experimentId, stageName, minAppVersionName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/inputsample?stage=" + stageName + "&minappversion=" + minAppVersionName + "&generationmode=MAXIMAL";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getExperimentUtilitiesInfo = function (experimentId, stageName, minAppVersionName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/utilitiesinfo?stage=" + stageName + "&minAppVerion=" + minAppVersionName;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getFeatureAttributes = function (featureId, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/features/" + featureId + "/attributes";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    //***************InAppPurchases*********************//
    AirlockService.prototype.getInAppPurchases = function (seasonId, branch, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockInAppPurchasesUrl + "/seasons/" + seasonId + "/branches/" + branch.uniqueId + "/entitlements";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json().entitlementsRoot; })
            .catch(errorHandler);
    };
    AirlockService.prototype.addInAppPurchase = function (purchase, seasonId, branchId, parentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockInAppPurchasesUrl + "/seasons/" + seasonId + "/branches/" + branchId + "/entitlements?parent=" + parentId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            purchase.uniqueId = res.json().uniqueId;
            return purchase;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addPurchaseOptions = function (purchaseOptions, seasonId, branchId, parentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockInAppPurchasesUrl + "/seasons/" + seasonId + "/branches/" + branchId + "/entitlements?parent=" + parentId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(purchaseOptions), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            purchaseOptions.uniqueId = res.json().uniqueId;
            return purchaseOptions;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getInAppPurchase = function (purchaseId, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchaseId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getPurchaseOption = function (purchaseOptionsId, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchaseOptionsId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    /*
        deleteNotification(notificationId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {
    
            let url = `${this.airlockProductsUrl}/seasons/notifications/${notificationId}`;
    
            let headers = new Headers();
            headers.append('Content-Type', 'application/json');
    
            return this.http
                .delete(url, this.addAuthToHeaders(headers))
                .toPromise()
                .catch(errorHandler);
        }
     */
    AirlockService.prototype.deleteInAppPurchase = function (purchase, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchase.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.updateInAppPurchase = function (purchase, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchase.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deletePurchaseOptions = function (purchase, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchase.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.updatePurchaseOptions = function (purchase, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/entitlements/" + purchase.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    //***************Experiments*********************//
    AirlockService.prototype.getExperiments = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/" + productId + "/experiments?includeindexinginfo=true";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getExperimentIndexingInfo = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/indexinginfo";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.resetDashboard = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //PUT /analytics/products/experiments/{experiment-id}/resetdashboard
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/resetdashboard";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response; })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateExperiments = function (container, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/" + container.productId + "/experiments";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(container), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.createExperiment = function (productId, experiment, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/" + productId + "/experiments";
        console.log('new experiment:', JSON.stringify(experiment));
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(experiment), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            experiment.uniqueId = res.json().uniqueId;
            return experiment;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getDataImports = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /admin/airlytics/products/{product-id}/dataimport
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/dataimport";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getDataImport = function (jobId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /admin/airlytics/dataimport/{job-id}
        var url = this.airlockAirlyticsUrl + "/dataimport/" + jobId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.createDataImport = function (productId, dataimport, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /admin/airlytics/products/{product-id}/dataimport
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/dataimport";
        console.log('new data import:', JSON.stringify(dataimport));
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(dataimport), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            dataimport.uniqueId = res.json().uniqueId;
            return dataimport;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateDataimportsData = function (importsData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //PUT /admin/airlytics/products/{product-id}/dataimport
        var url = this.airlockAirlyticsUrl + "/products/" + importsData.productId + "/cohorts";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(importsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response; })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteDataimport = function (jobId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAirlyticsUrl + "/dataimport/" + jobId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.getCohorts = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /admin/airlytics/products/{product-id}/cohorts
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/cohorts";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getCohort = function (cohortId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /admin/airlytics/cohorts/{cohort-id}
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohortId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getCohortsDbColumns = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /admin/airlytics/cohorts/meta/users/columns
        //GET /admin/airlytics/products/{product-id}/cohorts/meta/users/columns
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/cohorts/meta/users/columns";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateCohortQuery = function (productId, queryCondition, queryAdditionalValue, joinedTables, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //POST /admin/airlytics/products/{product-id}/cohorts/validate
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/cohorts/validate";
        var headers = new http_1.Headers();
        var validationObj = { "queryCondition": queryCondition, "queryAdditionalValue": queryAdditionalValue, "joinedTables": joinedTables };
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(validationObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateCohortQueryBeforeSave = function (productId, queryCondition, queryAdditionalValue, joinedTables, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //POST /admin/airlytics/products/{product-id}/cohorts/validate
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/cohorts/validateQuery";
        var headers = new http_1.Headers();
        var validationObj = { "queryCondition": queryCondition, "queryAdditionalValue": queryAdditionalValue, "joinedTables": joinedTables };
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(validationObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.createCohort = function (productId, cohort, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /admin/airlytics/products/{product-id}/cohorts
        var url = this.airlockAirlyticsUrl + "/products/" + productId + "/cohorts";
        console.log('new cohort:', JSON.stringify(cohort));
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(cohort), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            cohort.uniqueId = res.json().uniqueId;
            return cohort;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateCohort = function (cohort, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //admin/airlytics/cohorts/{cohort-id}
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohort.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(cohort), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.exportCohort = function (cohort, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //PUT /admin/airlytics/cohorts/{cohort-id}/execute
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohort.uniqueId + "/execute";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, "{}", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateCohortsData = function (cohortsData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //PUT /admin/airlytics/products/{product-id}/cohorts
        var url = this.airlockAirlyticsUrl + "/products/" + cohortsData.productId + "/cohorts";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(cohortsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response; })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteCohort = function (cohortId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohortId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteCohortExport = function (cohortId, exportKey, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        ///cohorts/{cohort-id}/export/{export-key}
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohortId + "/export/" + exportKey;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.renameCohortExport = function (cohortId, exportKey, oldExportName, newExportName, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAirlyticsUrl + "/cohorts/" + cohortId + "/rename";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        var requestObj = { "exportKey": exportKey, "oldExportName": oldExportName, "newExportName": newExportName };
        return this.http
            .put(url, JSON.stringify(requestObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response; })
            .catch(errorHandler);
    };
    AirlockService.prototype.createStream = function (seasonId, stream, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /admin/products/seasons/{season-id}/streams
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/streams";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(stream), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            stream.uniqueId = res.json().uniqueId;
            return stream;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateStream = function (stream, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/streams/" + stream.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(stream), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateStreamsData = function (seasonId, streamsData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //PUT /admin/products/seasons/{season-id}/streams
        streamsData.streams = undefined;
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/streams";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(streamsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return streamsData;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getBranchUsage = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/branchesusage";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return JSON.stringify(response.json(), null, 2); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteStream = function (streamId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/streams/" + streamId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.getStreams = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/streams";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getExperiment = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "?includeindexinginfo=true";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateExperiment = function (experiment, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experiment.uniqueId;
        //remove indexing info if exsits
        experiment.indexingInfo = undefined;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(experiment), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteExperiment = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.addVariant = function (variant, experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/variants/";
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            variant.uniqueId = res.json().uniqueId;
            return variant;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getVariant = function (variantId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/variants/" + variantId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateVariant = function (variant, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/variants/" + variant.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteVariant = function (variantId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/variants/" + variantId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    //***************Branches*********************//
    AirlockService.prototype.addBranch = function (branch, sourceBranchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + branch.seasonId + "/" + sourceBranchId + "/branches";
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            branch.uniqueId = res.json().uniqueId;
            return branch;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getBranches = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/branches";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var branches = response.json().branches;
            branches = branches.sort(function (n1, n2) {
                //put master on top - otherwise sort alphabetically
                if (n1.name.toLowerCase() == "master") {
                    return -1;
                }
                if (n2.name.toLowerCase() == "master") {
                    return 1;
                }
                if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                    return 1;
                }
                if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                    return -1;
                }
                return 0;
            });
            return branches;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getBranch = function (branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateBranch = function (branch, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteBranch = function (branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.getAvailableBranches = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/availablebranches";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var availableBranches = response.json();
            availableBranches.availableInAllSeasons = availableBranches.availableInAllSeasons.sort(function (n1, n2) {
                //put master on top - otherwise sort alphabetically
                if (n1.toLowerCase() == "master") {
                    return -1;
                }
                if (n2.toLowerCase() == "master") {
                    return 1;
                }
                if (n1.toLowerCase() > n2.toLowerCase()) {
                    return 1;
                }
                if (n1.toLowerCase() < n2.toLowerCase()) {
                    return -1;
                }
                return 0;
            });
            return availableBranches;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.checkoutFeature = function (branch, feature, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId + "/checkout/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response;
        }).catch(errorHandler);
    };
    AirlockService.prototype.cancelCheckoutFeature = function (branch, feature, includeSubFeatures, errorHandler) {
        if (includeSubFeatures === void 0) { includeSubFeatures = false; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var mode = includeSubFeatures ? "INCLUDE_SUB_FEATURES" : "STAND_ALONE";
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId + "/cancelcheckout/" + feature.uniqueId + "?mode=" + mode;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response;
        }).catch(errorHandler);
    };
    AirlockService.prototype.getAnalyticsGlobalDataCollection = function (seasonId, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/" + seasonId + "/branches/" + branchId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getAnalyticsForDisplay = function (seasonId, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/" + seasonId + "/branches/" + branchId + "/?mode=DISPLAY";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getAnalyticsGlobalDataCollectionExperiment = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/experiments/" + experimentId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getAnalyticsForDisplayExperiment = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/experiments/" + experimentId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getQuota = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/" + seasonId + "/quota";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getExperimentQuota = function (experimentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockAnalyticsUrl + "/products/experiments/" + experimentId + "/quota";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateAnalyticsGlobalDataCollection = function (seasonId, branchId, analyticData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/" + seasonId + "/branches/" + branchId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(analyticData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return analyticData; })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateFeatureSendToAnalytic = function (feature, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/branches/" + branchId + "/feature/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, feature, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteFeatureSendToAnalytic = function (feature, branchId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockAnalyticsUrl + "/globalDataCollection/branches/" + branchId + "/feature/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return feature; })
            .catch(errorHandler);
    };
    AirlockService.prototype.update = function (feature, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/features/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return feature; })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateFeature = function (feature, branchId, errorHandler) {
        if (branchId === void 0) { branchId = 'MASTER'; }
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branchId + "/features/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteFeature = function (feature, branch, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/branches/" + branch.uniqueId + "/features/" + feature.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteStringToTranslation = function (stringId, errorHandler) {
        //    DELETE /translations/seasons/strings/{string-id}
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/strings/" + stringId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addStringToTranslationWithMode = function (seasonId, stringData, errorHandler, validate) {
        //    POST /translations/seasons/{season-id}/strings
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var mode = validate ? this.addStringValidateMode : this.addStringActMode;
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/strings?mode=" + mode;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addStringToTranslation = function (seasonId, stringData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        return this.addStringToTranslationWithMode(seasonId, stringData, errorHandler, false);
    };
    AirlockService.prototype.validateAddStringToTranslation = function (seasonId, stringData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        return this.addStringToTranslationWithMode(seasonId, stringData, errorHandler, true);
    };
    AirlockService.prototype.updateStringToTranslationWithMode = function (stringId, stringData, errorHandler, validate) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //    //POST /translations/seasons/{season-id}/strings
        //PUT /translations/seasons/strings/{string-id}
        var url = this.airlockTranslationsUrl + "/seasons/strings/" + stringId;
        if (validate) {
            stringData["mode"] = this.addStringValidateMode;
        }
        else {
            stringData["mode"] = this.addStringActMode;
        }
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateStringToTranslation = function (stringId, stringData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        return this.updateStringToTranslationWithMode(stringId, stringData, errorHandler, false);
    };
    AirlockService.prototype.validateUpdateStringToTranslation = function (stringId, stringData, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        return this.updateStringToTranslationWithMode(stringId, stringData, errorHandler, true);
    };
    AirlockService.prototype.markStringForTranslation = function (seasonId, ids, errorHandler) {
        if (ids === void 0) { ids = []; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("markStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/markfortranslation
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/markfortranslation";
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response;
        }).catch(errorHandler);
    };
    AirlockService.prototype.addIdsToUrl = function (_url, ids) {
        var url = _url;
        var isFirst = true;
        if (ids && ids != null) {
            for (var _i = 0, ids_1 = ids; _i < ids_1.length; _i++) {
                var id = ids_1[_i];
                if (!isFirst && id) {
                    url += "&ids=" + id;
                }
                else {
                    url += "?ids=" + id;
                    isFirst = false;
                }
            }
        }
        return url;
    };
    AirlockService.prototype.reviewStringForTranslation = function (seasonId, ids, errorHandler) {
        if (ids === void 0) { ids = []; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("reviewStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/reviewedfortranslation
        //PUT /translations/seasons/{season-id}/completereview
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/completereview";
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response;
        }).catch(errorHandler);
    };
    AirlockService.prototype.sendStringForTranslation = function (seasonId, ids, errorHandler) {
        if (ids === void 0) { ids = []; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("sendStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/markfortranslation
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/sendtotranslation";
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            return response;
        }).catch(errorHandler);
    };
    AirlockService.prototype.getStringsToTranslationForSeason = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("getStringsToTranslationForSeason");
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/translate/summary";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var translations = response.json().translationSummary;
            translations = translations.sort(function (n1, n2) {
                if (n1.lastModified < n2.lastModified) {
                    return 1;
                }
                if (n1.lastModified > n2.lastModified) {
                    return -1;
                }
                return 0;
            });
            return translations;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.overrideStringToTranslation = function (stringId, locale, newValue, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //PUT /translations/seasons/{string-id}/overridetranslate/{locale}
        var url = this.airlockTranslationsUrl + "/seasons/" + stringId + "/overridetranslate/" + locale;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, newValue, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.cancelOverrideStringToTranslation = function (stringId, locale, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //PUT /translations/seasons/{string-id}/canceloverride/{locale}
        var url = this.airlockTranslationsUrl + "/seasons/" + stringId + "/canceloverride/" + locale;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            // feature.uniqueId = res.json().uniqueId;
            return res;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStringsToTranslationForStringIds = function (seasonId, ids, locales, showTranslation, errorHandler) {
        if (ids === void 0) { ids = null; }
        if (locales === void 0) { locales = null; }
        if (showTranslation === void 0) { showTranslation = false; }
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        // console.log("getStringsToTranslationForStringIds");
        // console.log(ids);
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/translate/summary?showtranslations=" + showTranslation;
        if (ids && ids != null) {
            for (var _i = 0, ids_2 = ids; _i < ids_2.length; _i++) {
                var id = ids_2[_i];
                if (id) {
                    url += "&ids=" + id;
                }
            }
        }
        if (locales && locales != null) {
            for (var _a = 0, locales_1 = locales; _a < locales_1.length; _a++) {
                var curLocale = locales_1[_a];
                if (curLocale) {
                    url += "&locales=" + curLocale;
                }
            }
        }
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var translations = response.json().translationSummary;
            translations = translations.sort(function (n1, n2) {
                if (n1.lastModified < n2.lastModified) {
                    return 1;
                }
                if (n1.lastModified > n2.lastModified) {
                    return -1;
                }
                return 0;
            });
            return translations;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStringFullInformation = function (stringId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //GET /translations/seasons/strings/{string-id}
        var url = this.airlockTranslationsUrl + "/seasons/strings/" + stringId;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getStringsForFeature = function (featureId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("getStringsForFeature");
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        //http://9.148.48.79:4545/airlock/api/translations/seasons/967ef44d-0714-4f1e-a0c1-3c8c9adadf32/stringsinuse
        var url = this.airlockTranslationsUrl + "/seasons/" + featureId + "/stringsinuse";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var translations = response.json();
            // translations = translations.sort((n1,n2) => {
            //     if (n1.lastModified < n2.lastModified) {
            //         return 1;
            //     }
            //
            //     if (n1.lastModified > n2.lastModified) {
            //         return -1;
            //     }
            //
            //     return 0;
            // })
            return translations;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addFeature = function (feature, seasonId, branchId, parentId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/branches/" + branchId + "/features?parent=" + parentId;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            feature.uniqueId = res.json().uniqueId;
            return feature;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addProduct = function (product, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = "" + this.airlockProductsUrl;
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            product.uniqueId = res.json().uniqueId;
            return product;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.addSeason = function (season, productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/" + productId + "/seasons";
        var headers = new http_1.Headers({
            'Content-Type': 'application/json'
        });
        return this.http
            .post(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            season.uniqueId = res.json().uniqueId;
            return season;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateSeason = function (season, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + season.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return season; })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteSeason = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.updateProduct = function (product, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/" + product.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return product; })
            .catch(errorHandler);
    };
    AirlockService.prototype.getInputSchema = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/inputschema";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.validateInputSchema = function (seasonId, inputScheama, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/inputschema/validate";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, inputScheama, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getUtilities = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        //http://airlock-dev4-adminapi.eu-west-1.elasticbeanstalk.com:80/airlock/api/admin/products/seasons/8851b6d6-8d54-4d10-8a9c-209a1cb19c53/utilities
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/utilities";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json().utilities; })
            .catch(errorHandler);
    };
    AirlockService.prototype.createUtil = function (util, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /admin/products/seasons/{season-id}/utilities
        //?stage=DEVELOPMENT&force=false&type=MAIN_UTILITY
        var url = this.airlockProductsUrl + "/seasons/" + util.seasonId + "/utilities?stage=" + util.stage + "&type=" + util.type + "&name=" + encodeURIComponent(util.name);
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, util.utility, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return util; })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateUtil = function (util, errorHandler) {
        //POST /admin/products/seasons/{season-id}/utilities
        //?stage=DEVELOPMENT&force=false&type=MAIN_UTILITY
        //http://airlock-dev4-adminapi.eu-west-1.elasticbeanstalk.com:80/airlock/api/admin/products/seasons/utilities/36942b7f-ba91-4f2c-9de3-d08df9af9f76?stage=DEVELOPMENT&lastmodified=1508056701230&force=false
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/utilities/" + util.uniqueId + "?stage=" + util.stage + "&lastmodified=" + util.lastModified + "&name=" + encodeURIComponent(util.name);
        var headers = new http_1.Headers();
        // headers.append('Content-Type', 'application/json');
        console.log(util.utility);
        return this.http
            .put(url, util.utility, this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteUtil = function (utilId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        // DELETE /admin/products/seasons/utilities/{utility-id}
        var url = this.airlockProductsUrl + "/seasons/utilities/" + utilId;
        return this.http
            .delete(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateInputSchema = function (inputScheama, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/" + inputScheama.seasonId + "/inputschema";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(inputScheama), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return inputScheama; })
            .catch(errorHandler);
    };
    AirlockService.prototype.getUserGroups = function (product, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/" + product.uniqueId + "/usergroups";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) {
            var groups = response.json();
            if (groups && groups.internalUserGroups) {
                groups.internalUserGroups = groups.internalUserGroups.sort(function (n1, n2) {
                    if (n1.toLowerCase() > n2.toLowerCase()) {
                        return 1;
                    }
                    if (n1.toLowerCase() < n2.toLowerCase()) {
                        return -1;
                    }
                    return 0;
                });
            }
            return groups;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.getUserGroupsUsage = function (product, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/" + product.uniqueId + "/usergroups/usage";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getEncryptionKey = function (season, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/seasons/" + season.uniqueId + "/encryptionkey";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getConstantsFileContent = function (platform, seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/seasons/" + seasonId + "/constants?platform=" + platform;
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.text(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getDefaultsFileContent = function (seasonId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/seasons/" + seasonId + "/defaults";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.text(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateUserGroups = function (product, userGroups, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockBaseApiUrl + "/products/" + product.uniqueId + "/usergroups";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(userGroups), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function () { return userGroups; })
            .catch(errorHandler);
    };
    AirlockService.prototype.handleError = function (error) {
        console.log("handleError");
        try {
            console.log("*********");
            console.log(error);
            this.navigateToLoginIfSessionProblem(error);
            // console.log(error._body);
            // console.log(error.status);
            // if(error._body != null && error.status == 401 && error._body.indexOf("expired") != -1){
            //     // this.deleteCookie("jwt");
            //     var str = window.location.href;
            //     var ind = str.lastIndexOf("#");
            //     var prefix = str.substring(0,ind);
            //     window.location.href = prefix+'auth/login';
            //     return;
            // }
        }
        catch (e) {
            console.log(e);
        }
        var errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if ((error.status === 404 && error.statusText) || (error._body && typeof error._body === 'string' && error._body.startsWith("<!DOCTYPE html>"))) {
            errorMessage = "Request failed, try again later. (" + error.status + " " + error.statusText + ")";
            error._body = errorMessage;
            // return Promise.reject(errorMessage);
        }
        return Promise.reject(error.message || error);
    };
    AirlockService.prototype.navigateToLoginIfSessionProblem = function (error) {
        try {
            if (error == null) {
                return;
            }
            console.log("********* navigateToLoginIfSessionProblem");
            console.log(error);
            console.log(error.status);
            if (error._body != null && error.status == 401 && ((typeof error._body === 'string' && (error._body.indexOf("expired") != -1 || error._body.indexOf("JWT") != -1)))) {
                console.log("logOut");
                // this.jwtToken = "";
                // this.deleteCookie("jwt");
                var str = window.location.href;
                var ind = str.lastIndexOf("#");
                var prefix = str.substring(0, ind);
                window.location.href = prefix + 'auth/login';
                return;
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    AirlockService.prototype.handleErrorAndShow = function (error) {
        console.log("handleErrorAndShow");
        try {
            console.log("*********");
            console.log(this);
            this.navigateToLoginIfSessionProblem(error);
            // console.log(error);
            // console.log(error._body);
            // console.log(error.status);
            // if(error._body != null && error.status == 401 && error._body.indexOf("expired") != -1){
            //     console.log("logOut");
            //     // this.jwtToken = "";
            //     // this.deleteCookie("jwt");
            //     var str = window.location.href;
            //     var ind = str.lastIndexOf("#");
            //     var prefix = str.substring(0,ind);
            //     window.location.href = prefix+'auth/login';
            //     return;
            // }
            // this.notifyDataChanged("error-notification",this.parseErrorMessage(error,"Request failed, try again later."));
        }
        catch (e) {
            console.log(e);
        }
        var errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        // alert(errorMessage);
        return Promise.reject(error.message || error);
    };
    AirlockService.prototype._handleError = function (error, show) {
        if (show === void 0) { show = false; }
        console.log("_handleError");
        try {
            console.log("*********");
            console.log(error);
            console.log(error._body);
            console.log(error.status);
            if ((error._body != null && error.status == 401 && (error._body.indexOf("expired") != -1)) || (error._body != null && error._body.toLowerCase().indexOf("jwt") != -1)) {
                // this.deleteCookie("jwt");
                var str = window.location.href;
                var ind = str.lastIndexOf("#");
                var prefix = str.substring(0, ind);
                window.location.href = prefix + 'auth/login';
                return;
            }
        }
        catch (e) {
            console.log(e);
        }
        var errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if (show == true) {
            alert(errorMessage);
        }
        return Promise.reject(error.message || error);
    };
    //notificatins
    AirlockService.prototype.subscribe = function (event, callback) {
        var subscribers = this._subscriptions.get(event) || [];
        subscribers.push(callback);
        this._subscriptions.set(event, subscribers);
    };
    AirlockService.prototype._onEvent = function (data) {
        var subscribers = this._subscriptions.get(data['event']) || [];
        subscribers.forEach(function (callback) {
            callback.call(null, data['data']);
        });
    };
    AirlockService.prototype.notifyDataChanged = function (event, value) {
        console.log("notifyDataChaned (airlockService)");
        this._data[event] = value;
        this._data.next({
            event: event,
            data: this._data[event]
        });
    };
    AirlockService.prototype.getJWT = function () {
        return this.jwtToken;
    };
    AirlockService.prototype.isHaveJWTToken = function () {
        return (this.jwtToken != null && this.jwtToken.length > 0);
    };
    AirlockService.prototype.followProduct = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/" + productId + "/follow";
        return this.http
            .post(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.unfollowProduct = function (productId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/" + productId + "/follow";
        return this.http
            .delete(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.followFeature = function (featureId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/features/" + featureId + "/follow";
        return this.http
            .post(url, "", this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.unfollowFeature = function (featureId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/features/" + featureId + "/follow";
        return this.http
            .delete(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (res) { return res; })
            .catch(errorHandler);
    };
    AirlockService.prototype.parseErrorMessage = function (error, defaultMessage) {
        var errorMessage = error._body || defaultMessage;
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        }
        catch (err) {
            if (errorMessage != null && (typeof errorMessage === 'string' || errorMessage instanceof String) && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }
        return errorMessage;
    };
    AirlockService.prototype.parseErrorMessageB = function (error, defaultMessage) {
        var errorMessage = error._body || defaultMessage;
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        }
        catch (err) {
            if (errorMessage != null && errorMessage.indexOf('{"error":') == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(9, errorMessage.length - 1);
            }
        }
        return errorMessage;
    };
    AirlockService.prototype.getStringIssue = function (stringId, locale, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/strings/" + stringId + "/locale/" + locale + "/issues";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.createNewStringIssue = function (stringId, locale, issueText, issueType, issueSubType, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/" + stringId + "/issues/" + locale;
        var issue = {};
        issue["issueTypeCode"] = issueType;
        issue["issueSubTypeCode"] = issueSubType;
        issue["issueText"] = issueText;
        return this.http.post(url, JSON.stringify(issue), this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.addStringIssueComment = function (seasonId, issueId, comment, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/issue/" + issueId;
        return this.http.put(url, JSON.stringify(comment), this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function () { return comment; })
            .catch(errorHandler);
    };
    AirlockService.prototype.changeIssueState = function (seasonId, issueId, isOpen, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/" + seasonId + "/issue/" + issueId;
        var newStateJson = {};
        newStateJson["setOpenStatus"] = isOpen;
        return this.http.put(url, JSON.stringify(newStateJson), this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then()
            .catch(errorHandler);
    };
    AirlockService.prototype.getStringUsage = function (stringId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        var url = this.airlockTranslationsUrl + "/seasons/" + stringId + "/stringusage";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.getNotifications = function (season, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("getNotifications");
        // /admin/products/seasons/{season-id}/notifications
        var url = this.airlockProductsUrl + "/seasons/" + season.uniqueId + "/notifications";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateoNotifications = function (notifications, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        // /admin/products/seasons/{season-id}/notifications
        var url = this.airlockProductsUrl + "/seasons/" + notifications.seasonId + "/notifications";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notifications), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.updateNotification = function (notification, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        // /admin/products/seasons/notifications/{webhook-id}
        var url = this.airlockProductsUrl + "/seasons/notifications/" + notification.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notification), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    AirlockService.prototype.createNotification = function (seasonId, notification, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /admin/products/seasons/{season-id}/notifications
        var url = this.airlockProductsUrl + "/seasons/" + seasonId + "/notifications";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(notification), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            notification.uniqueId = res.json().uniqueId;
            return notification;
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteNotification = function (notificationId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        var url = this.airlockProductsUrl + "/seasons/notifications/" + notificationId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.getWebhooks = function (errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleError.bind(this); }
        console.log("getWebhooks");
        // GET /ops/webhooks
        var url = this.airlockOpsUrl + "/webhooks";
        return this.http.get(url, this.addAuthToHeaders(new http_1.Headers()))
            .toPromise()
            .then(function (response) { return response.json().webhooks; })
            .catch(errorHandler);
    };
    AirlockService.prototype.createWebhook = function (webhook, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //POST /ops/webhooks
        var url = this.airlockOpsUrl + "/webhooks";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(webhook), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (res) {
            console.log(res);
            return res.json();
        })
            .catch(errorHandler);
    };
    AirlockService.prototype.deleteWebhook = function (webhookId, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        //DELETE /ops/webhooks/{webhook-id}
        var url = this.airlockOpsUrl + "/webhooks/" + webhookId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    };
    AirlockService.prototype.updateWebhook = function (webhook, errorHandler) {
        if (errorHandler === void 0) { errorHandler = this.handleErrorAndShow.bind(this); }
        // PUT /ops/webhooks/{webhook-id}
        var url = this.airlockOpsUrl + "/webhooks/" + webhook.uniqueId;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(webhook), this.addAuthToHeaders(headers))
            .toPromise()
            .then(function (response) { return response; })
            .catch(errorHandler);
    };
    /*
     "STREAMS",
     "FEATURES",
     "NOTIFICATIONS",
     "TRANSLATIONS",
     "ANALYTICS",
     "EXPERIMENTS",
     "BRANCHES",
     "EXPORT_IMPORT"
     */
    AirlockService.prototype.setCapabilities = function (product) {
        if (product) {
            this.capabilities = product.capabilities;
        }
        else {
            this.capabilities = [];
        }
        this.refreshMenu();
        // if(this.cantViewSelectedPage()){
        //     this.redirectToFeaturesPage();
        // }
    };
    AirlockService.prototype.cantViewSelectedPage = function () {
        return this._menuService.getCurrentItem().hidden && this._menuService.getCurrentItem().selected;
    };
    AirlockService.prototype.getCapabilities = function () {
        return this.capabilities || [];
    };
    AirlockService.prototype.redirectToFeaturesPage = function () {
        this.router.navigate(['/pages/features']);
    };
    AirlockService.prototype.canExportImport = function () {
        return this.getCapabilities().includes("EXPORT_IMPORT");
    };
    AirlockService.prototype.canUseBranches = function () {
        return this.getCapabilities().includes("BRANCHES");
    };
    AirlockService.prototype.canUseAnalytics = function () {
        return this.getCapabilities().includes("ANALYTICS");
    };
    AirlockService.prototype.setHasAdminProds = function (has) {
        this.hasAdminProds = has;
        this.refreshMenu();
    };
    AirlockService.prototype.isCohortsMode = function () {
        return (this.cohortsMode != null && (this.cohortsMode == "TRUE" || this.cohortsMode == 'true'));
    };
    AirlockService.prototype.canViewPage = function (menuPathOrTitle) {
        if (this.isCohortsMode()) {
            return menuPathOrTitle == "cohorts";
        }
        if (menuPathOrTitle == "Administration" || menuPathOrTitle == "products"
            || (menuPathOrTitle == "groups" && !this.isStaticMode())
            || menuPathOrTitle == "Airlock" || menuPathOrTitle == "") {
            return true;
        }
        if (menuPathOrTitle == "Airlytics") {
            return (this.capabilities.includes("COHORTS") || this.capabilities.includes("DATA_IMPORT"));
        }
        if (menuPathOrTitle == "entitlements") {
            return true;
        }
        if (menuPathOrTitle == "authorization") {
            return this.hasAdminProds;
        }
        if (menuPathOrTitle == "webhooks") {
            return this.isAdministrator();
        }
        if (menuPathOrTitle == "dataimport") {
            menuPathOrTitle = "DATA_IMPORT";
        }
        if (this.capabilities == undefined) {
            return true;
        }
        return this.capabilities.includes(menuPathOrTitle.toUpperCase());
    };
    AirlockService.prototype.refreshMenu = function () {
        //this._menuService.refreshMenu();
        console.log(this._menu);
        for (var _i = 0, _a = this._menu[0].children; _i < _a.length; _i++) {
            var menu = _a[_i];
            var menuPathOrTitle;
            if (typeof menu["path"] != 'undefined') {
                menuPathOrTitle = menu["path"];
            }
            else {
                menuPathOrTitle = menu.data.menu.title;
            }
            menu.data.menu.hidden = !this.canViewPage(menuPathOrTitle);
            if (menu.children) {
                for (var _b = 0, _c = menu.children; _b < _c.length; _b++) {
                    var child = _c[_b];
                    var childPathOrTitle;
                    if (typeof child["path"] != 'undefined') {
                        childPathOrTitle = child["path"];
                    }
                    else {
                        childPathOrTitle = child.data.menu.title;
                    }
                    child.data.menu.hidden = !this.canViewPage(childPathOrTitle);
                }
            }
        }
        this._menuService.updateMenuByRoutes(this._menu);
    };
    AirlockService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http, baMenu_service_1.BaMenuService, router_1.Router])
    ], AirlockService);
    return AirlockService;
}());
exports.AirlockService = AirlockService;
//# sourceMappingURL=airlock.service.js.map