"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Season = void 0;
var feature_1 = require("./feature");
var Season = /** @class */ (function () {
    function Season(s) {
        if (s) {
            this.name = s.name;
            this.uniqueId = s.uniqueId;
            this.productId = s.productId;
            this.minVersion = s.minVersion;
            this.maxVersion = s.maxVersion;
            this.lastModified = s.lastModified;
            this.runtimeEncryption = s.runtimeEncryption;
            if (s.root) {
                this.root = feature_1.Feature.clone(s.root);
            }
        }
        else {
            this.name = '';
            this.minVersion = '';
            this.maxVersion = '';
        }
    }
    return Season;
}());
exports.Season = Season;
//# sourceMappingURL=season.js.map