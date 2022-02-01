"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableBranches = exports.Branch = void 0;
var Branch = /** @class */ (function () {
    function Branch() {
    }
    Branch.clone = function (other) {
        var retObj = new Branch();
        retObj.uniqueId = other.uniqueId;
        retObj.seasonId = other.seasonId;
        retObj.name = other.name;
        retObj.creationDate = other.creationDate;
        retObj.lastModified = other.lastModified;
        retObj.description = other.description;
        retObj.creator = other.creator;
        return retObj;
    };
    return Branch;
}());
exports.Branch = Branch;
var AvailableBranches = /** @class */ (function () {
    function AvailableBranches() {
    }
    return AvailableBranches;
}());
exports.AvailableBranches = AvailableBranches;
//# sourceMappingURL=branch.js.map