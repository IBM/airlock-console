"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataimportsData = void 0;
var DataimportsData = /** @class */ (function () {
    function DataimportsData() {
    }
    DataimportsData.clone = function (src) {
        var toRet = new DataimportsData();
        toRet.productId = src.productId;
        toRet.lastModified = src.lastModified;
        toRet.pruneThreshold = src.pruneThreshold;
        toRet.jobs = DataimportsData.duplicateArray(src.jobs);
        return toRet;
    };
    DataimportsData.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return DataimportsData;
}());
exports.DataimportsData = DataimportsData;
//# sourceMappingURL=dataimportsData.js.map