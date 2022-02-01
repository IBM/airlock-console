"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var authentication_service_1 = require("./authentication.service");
var airlock_service_1 = require("./airlock.service");
var AuthGuard = /** @class */ (function () {
    function AuthGuard(authService, router, airlockService) {
        this.authService = authService;
        this.router = router;
        this.airlockService = airlockService;
        //AIRLOCK_AUTH
        this.auth = process.env.AIRLOCK_API_AUTH;
    }
    AuthGuard.prototype.canActivate = function (route, state) {
        if (this.auth != "TRUE") {
            return true;
        }
        var url = state.url;
        if (!this.checkLogin(url)) {
            var str = window.location.href;
            var ind = str.lastIndexOf("#");
            var prefix = str.substring(0, ind);
            window.location.href = prefix + 'auth/login';
            return false;
        }
        else {
            return true;
        }
    };
    AuthGuard.prototype.checkLogin = function (url) {
        return this.airlockService.isHaveJWTToken();
        // TODO: check if JWT exists. If yes return true, otherwise false + redirect to OKTA.
        //  If yes then return true
        //  If not, save url in session, redirect and then catch the redirection again with the guard
        // if (this.authService.isLoggedIn) { return true; }
        //
        // // Store the attempted URL for redirecting
        // this.authService.redirectUrl = url;
        //
        // // Navigate to the login page with extras
        // //this.router.navigate(['/login']);
        //
        // window.location.href = '/auth/login';
        // return true;
    };
    AuthGuard = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [authentication_service_1.AuthenticationService, router_1.Router, airlock_service_1.AirlockService])
    ], AuthGuard);
    return AuthGuard;
}());
exports.AuthGuard = AuthGuard;
//# sourceMappingURL=auth-guard.service.js.map