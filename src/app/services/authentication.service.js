"use strict";
/**
 * Created by yoavmac on 14/09/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var Observable_1 = require("rxjs/Observable");
var AuthenticationService = /** @class */ (function () {
    function AuthenticationService(http) {
        this.http = http;
    }
    AuthenticationService.prototype.oktaGetUser = function (errorHandler) {
        // let url = '/auth/user';
        //
        // return this.http.get(url)
        //     .map(this.extractData)
        //     .catch(errorHandler);
        if (errorHandler === void 0) { errorHandler = this.handleError; }
        var url = '/auth/user';
        return this.http.get(url)
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(errorHandler);
    };
    // oktaIsLoggedIn (errorHandler:any = this.handleError) : Observable<User> {
    //
    //     // The logged in method will return a User object if logged in or 0 if not
    //
    //     let url = '/auth/loggedIn';
    //
    //     return this.http.get(url)
    //         .map(this.extractData)
    //         .catch(errorHandler);
    // }
    AuthenticationService.prototype.extractData = function (res) {
        var body = res.json();
        return body.data || {};
    };
    AuthenticationService.prototype.handleError = function (error) {
        var errMsg = (error.message) ? error.message : error.status ? error.status + " - " + error.statusText : 'Server error';
        console.error(errMsg);
        return Observable_1.Observable.throw(errMsg);
    };
    AuthenticationService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], AuthenticationService);
    return AuthenticationService;
}());
exports.AuthenticationService = AuthenticationService;
//# sourceMappingURL=authentication.service.js.map