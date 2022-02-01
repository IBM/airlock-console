"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaThemePreloader = void 0;
var core_1 = require("@angular/core");
var BaThemePreloader = /** @class */ (function () {
    function BaThemePreloader() {
    }
    BaThemePreloader_1 = BaThemePreloader;
    BaThemePreloader.registerLoader = function (method) {
        BaThemePreloader_1._loaders.push(method);
    };
    BaThemePreloader.clear = function () {
        BaThemePreloader_1._loaders = [];
    };
    BaThemePreloader.load = function () {
        return new Promise(function (resolve, reject) {
            BaThemePreloader_1._executeAll(resolve);
        });
    };
    BaThemePreloader._executeAll = function (done) {
        setTimeout(function () {
            Promise.all(BaThemePreloader_1._loaders).then(function (values) {
                done.call(null, values);
            }).catch(function (error) {
                console.error(error);
            });
        });
    };
    var BaThemePreloader_1;
    BaThemePreloader._loaders = [];
    BaThemePreloader = BaThemePreloader_1 = __decorate([
        core_1.Injectable()
    ], BaThemePreloader);
    return BaThemePreloader;
}());
exports.BaThemePreloader = BaThemePreloader;
//# sourceMappingURL=baThemePreloader.service.js.map