"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaImageLoaderService = void 0;
var core_1 = require("@angular/core");
var BaImageLoaderService = /** @class */ (function () {
    function BaImageLoaderService() {
    }
    BaImageLoaderService.prototype.load = function (src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.src = src;
            img.onload = function () {
                resolve('Image with src ' + src + ' loaded successfully.');
            };
        });
    };
    BaImageLoaderService = __decorate([
        core_1.Injectable()
    ], BaImageLoaderService);
    return BaImageLoaderService;
}());
exports.BaImageLoaderService = BaImageLoaderService;
//# sourceMappingURL=baImageLoader.service.js.map