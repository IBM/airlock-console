"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
var season_1 = require("./season");
var Product = /** @class */ (function () {
    function Product(p) {
        if (p) {
            this.name = p.name;
            this.description = p.description;
            this.uniqueId = p.uniqueId;
            this.codeIdentifier = p.codeIdentifier;
            this.lastModified = p.lastModified;
            this.seasons = [];
            this.capabilities = p.capabilities.slice();
            this.isCurrentUserFollower = p.isCurrentUserFollower;
            if (p.seasons != null) {
                for (var i = 0; i < p.seasons.length; i++) {
                    this.seasons[i] = new season_1.Season(p.seasons[i]);
                }
            }
        }
        else {
            this.name = '';
            this.description = '';
            this.codeIdentifier = '';
        }
    }
    return Product;
}());
exports.Product = Product;
//# sourceMappingURL=product.js.map