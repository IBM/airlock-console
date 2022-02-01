"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
require("rxjs/add/operator/toPromise");
var Base64Utils_1 = require("./Base64Utils");
var AuthorizationService = /** @class */ (function () {
    function AuthorizationService(http) {
        this.http = http;
        this.airlockBaseApiUrl = process.env.AIRLOCK_API_URL;
        // private airlockBaseApiUrl = 'http://9.148.49.163:8080/airlock/api/admin';
        // private airlockBaseApiUrl = 'http://9.148.54.98:7070/airlock/api/admin'; // console dev
        // private airlockBaseApiUrl = 'http://9.148.54.98:2020/airlock/api/admin'; // rotem/vicky QA
        // private airlockBaseApiUrl = 'http://airlock2.7iku82rby4.eu-west-1.elasticbeanstalk.com/airlock/api/admin'; // amazon
        this.airlockProductsUrl = this.airlockBaseApiUrl + "/products";
        this.airlockGroupsUrl = this.airlockBaseApiUrl + "/usergroups";
        this.airlockFeaturesUrl = this.airlockBaseApiUrl + "/features";
        this.airlockOpsUrl = this.airlockBaseApiUrl + "/../ops/";
        this.userName = "moshe";
        this.curGroupName = "";
        console.log("AuthorizationService constructor");
        this.jwtToken = this.getCookie("jwt");
        console.log("JWT:" + this.jwtToken);
    }
    AuthorizationService.prototype.addAuthToHeaders = function (headers) {
        // headers.append('sessionToken', this.jwtToken);
        return { headers: headers };
    };
    AuthorizationService.prototype.getCookie = function (name) {
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
    AuthorizationService.getUser = function (token) {
        var decodedString = Base64Utils_1.Base64Utils.Base64.decode(token);
        var isSecond = 0;
        var startIndex = -1;
        var endIndex = -1;
        var counter = 0;
        var finish = 0;
        for (var i = 0; i < decodedString.length && finish == 0; ++i) {
            if (decodedString[i] == '{') {
                if (isSecond == 1 && counter == 0) {
                    startIndex = i;
                }
                counter++;
            }
            if (decodedString[i] == '}') {
                counter--;
                if (counter == 0) {
                    if (isSecond == 0) {
                        isSecond = 1;
                    }
                    else {
                        endIndex = i;
                        finish = 1;
                    }
                }
            }
        }
        if (finish == 1 && startIndex != -1 && endIndex != -1) {
            var userData = decodedString.substring(startIndex, endIndex + 1);
            console.log("userData");
            console.log(userData);
            var myobj = JSON.parse(userData);
            // console.log(myobj.jti);
            return myobj;
        }
        // console.log("getUser");
        // console.log(decodedString);
        return "";
    };
    AuthorizationService.prototype.init = function (role) {
        this.curGroupName = role;
        // if(this.jwtToken != null && this.jwtToken.length > 0){
        //     var userData = AuthorizationService.getUser(this.jwtToken);
        //     console.log(userData);
        //     // console.log("********");
        //     // console.log("finish:"+this.getActualRole(["Viewer","Editor"]));
        //     // console.log("********");
        //     //userRoles
        //     this.userName = userData.jti;
        //     console.log("AuthorizationService init " + this.userName);
        //     // this.curGroupName = this._airlockService.getUserRole();
        //     // var v = this;
        //     // this.getUserData().then(resp =>{
        //     //         console.log("getUserData");
        //     //         console.log(resp);
        //     //         v.curGroupName = this.getRoleOfUserInRoles(resp);
        //     //         console.log("md:"+v.curGroupName);
        //     //     });
        //     console.log("finish:"+this.curGroupName);
        // }
    };
    AuthorizationService.getActualRole = function (list) {
        var role = "";
        if (list) {
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var curRole = list_1[_i];
                console.log("role");
                console.log(curRole);
                if (role === "") {
                    if (curRole === "Administrator" || curRole === "ProductLead" || curRole === "Editor" || curRole === "Viewer") {
                        role = curRole;
                    }
                }
                else {
                    if (role === "Administrator") {
                    }
                    else if (role === "ProductLead") {
                        if (curRole === "Administrator") {
                            role = curRole;
                        }
                    }
                    else if (role === "Editor") {
                        if (curRole === "Administrator" || curRole === "ProductLead") {
                            role = curRole;
                        }
                    }
                    else if (role === "Viewer") {
                        if (curRole === "Administrator" || curRole === "ProductLead" || curRole === "Editor") {
                            role = curRole;
                        }
                    }
                }
            }
            console.log(role);
        }
        ;
        return role;
    };
    AuthorizationService.prototype.getRoleOfUserInRoles = function (data) {
        console.log(data);
        var role = "";
        var userName = this.userName;
        data.roles.forEach(function (curRole) {
            console.log("role");
            console.log(curRole);
            console.log(curRole.users.indexOf(userName));
            if (curRole.users.indexOf(userName) != -1) {
                console.log("cur role:" + curRole.role);
                if (role == "") {
                    role = curRole.role;
                }
                else {
                    if (role == "Administrator") {
                    }
                    else if (role == "ProductLead") {
                        if (curRole.role == "Administrator") {
                            role = curRole.role;
                        }
                    }
                    else if (role == "Editor") {
                        if (curRole.role == "Administrator" || curRole.role == "ProductLead") {
                            role = curRole.role;
                        }
                    }
                    else if (role == "Viewer") {
                        role = curRole.role;
                    }
                }
            }
        });
        return role;
    };
    AuthorizationService.prototype.isViewer = function () {
        // console.log("AuthorizationService isViewer " + this.userName)
        // console.log("AuthorizationService isViewer " + this.curGroupName)
        var b = (this.curGroupName == "Viewer");
        // console.log(b);
        return b;
    };
    AuthorizationService.prototype.isProductLead = function () {
        return (this.curGroupName == "Administrator");
    };
    AuthorizationService.prototype.isEditor = function () {
        return (this.curGroupName == "Editor");
    };
    // private getUserData(errorHandler:any = this.handleError){
    //     let url = `${this.airlockOpsUrl}/airlockusers/`;
    //
    //     return this.http.get(url,this.addAuthToHeaders(new Headers()))
    //         .toPromise()
    //         .then(response => response.json())
    //         .catch(errorHandler);
    // }
    // private getAuthorization(errorHandler:any = this.handleError) {
    //     return {Roles:
    //         [  { Role: "Administrator" ,
    // DisplayName: "Administrator",
    //     Users: ["moshe"]
    // }, { Role: "Viewer" ,
    //             DisplayName: "Viewer",
    //             Users: ["koko"]
    //         }, { Role: "Editor" ,
    //             DisplayName: "Editor",
    //             Users: ["sisi"]
    //         }]
    // };
    // let url = `${this.airlockProductsUrl}/seasons/`;
    //
    // return this.http.get(url)
    //     .toPromise()
    //     .then(response => response.json().products as Product[])
    //     .catch(errorHandler);
    // }
    AuthorizationService.prototype.handleError = function (error) {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    };
    AuthorizationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], AuthorizationService);
    return AuthorizationService;
}());
exports.AuthorizationService = AuthorizationService;
//# sourceMappingURL=authorization.service.js.map