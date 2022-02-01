"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utility = void 0;
var Utility = /** @class */ (function () {
    function Utility(u) {
        if (u) {
            this.uniqueId = u.uniqueId;
            this.seasonId = u.seasonId;
            this.stage = u.stage;
            this.type = u.type;
            this.utility = u.utility;
            this.name = u.name;
            this.lastModified = u.lastModified;
        }
        else {
            this.uniqueId = '';
            this.seasonId = '';
            this.stage = '';
            this.type = '';
            this.utility = '';
            this.name = '';
            this.lastModified = 0;
        }
    }
    return Utility;
}());
exports.Utility = Utility;
//# sourceMappingURL=utility.js.map