"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortExport = void 0;
var cohortStatusDetails_1 = require("./cohortStatusDetails");
var CohortExport = /** @class */ (function () {
    function CohortExport() {
        this.exportEnabled = false;
    }
    CohortExport.clone = function (src) {
        var toRet = new CohortExport();
        if (!src)
            return toRet;
        toRet.exportEnabled = src.exportEnabled;
        toRet.exportName = src.exportName;
        toRet.exportStatus = src.exportStatus;
        toRet.exportStatusDetails = cohortStatusDetails_1.CohortStatusDetails.clone(src.exportStatusDetails);
        toRet.exportStatusMessage = src.exportStatusMessage;
        toRet.lastExportTime = src.lastExportTime;
        toRet.statuses = CohortExport.duplicateMap(src.statuses);
        return toRet;
    };
    CohortExport.duplicateMap = function (src) {
        return Object.assign({}, src);
    };
    return CohortExport;
}());
exports.CohortExport = CohortExport;
//# sourceMappingURL=cohortExport.js.map