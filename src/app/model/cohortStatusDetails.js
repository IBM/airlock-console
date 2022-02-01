"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortStatusDetails = void 0;
/*
private UUID productId = null;
    private UUID uniqueId = null; //nc + u
    private String name = null; //c+u
    private String exportName = null;
    private String description = null; //opt in c+u (if missing or null in update don't change)
    private Date creationDate = null; //nc + u (not changed)
    private String creator = null;	//c+u (creator not changed)
    private String queryCondition = null;
    private String queryAdditionalValue = null;
    private CohortCalculationFrequency updateFrequency = CohortCalculationFrequency.ONCE;
    private boolean export = false;
    private boolean enabled;
    private Date lastModified = null; // required in update. forbidden in create
    private JobStatus status;
    private String statusMessage;
    private String statusDetails;
    private Date lastExportTime;
    private Long usersNumber = null;
 */
var CohortStatusDetails = /** @class */ (function () {
    function CohortStatusDetails() {
    }
    CohortStatusDetails.cloneToCohortStatusDetails = function (src, target) {
        target.activityId = src.activityId;
        target.detailedMessage = src.detailedMessage;
        target.failedImports = src.failedImports;
        target.parsedImports = src.parsedImports;
        target.successfulImports = src.successfulImports;
        target.totalImports = src.totalImports;
        target.status = src.status;
    };
    CohortStatusDetails.clone = function (src) {
        var toRet = new CohortStatusDetails();
        if (!src)
            return toRet;
        toRet.activityId = src.activityId;
        toRet.detailedMessage = src.detailedMessage;
        toRet.failedImports = src.failedImports;
        toRet.parsedImports = src.parsedImports;
        toRet.successfulImports = src.successfulImports;
        toRet.totalImports = src.totalImports;
        toRet.status = src.status;
        return toRet;
    };
    CohortStatusDetails.prototype.setFromCohortStatusDetails = function (src) {
        this.activityId = src.activityId;
        this.detailedMessage = src.detailedMessage;
        this.failedImports = src.failedImports;
        this.parsedImports = src.parsedImports;
        this.successfulImports = src.successfulImports;
        this.totalImports = src.totalImports;
        this.status = src.status;
    };
    CohortStatusDetails.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    CohortStatusDetails.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return CohortStatusDetails;
}());
exports.CohortStatusDetails = CohortStatusDetails;
//# sourceMappingURL=cohortStatusDetails.js.map