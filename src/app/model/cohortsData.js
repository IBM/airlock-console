"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortsData = void 0;
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
var cohort_1 = require("./cohort");
var CohortsData = /** @class */ (function () {
    function CohortsData() {
    }
    CohortsData.cloneToCohortsData = function (src, target) {
        target.productId = src.productId;
        target.lastModified = src.lastModified;
        target.dbApplicationName = src.dbApplicationName;
        target.cohorts = cohort_1.Cohort.duplicateArray(src.cohorts);
    };
    CohortsData.clone = function (src) {
        var toRet = new CohortsData();
        toRet.productId = src.productId;
        toRet.lastModified = src.lastModified;
        toRet.dbApplicationName = src.dbApplicationName;
        toRet.cohorts = cohort_1.Cohort.duplicateArray(src.cohorts);
        return toRet;
    };
    CohortsData.prototype.setFromCohortsData = function (src) {
        this.productId = src.productId;
        this.lastModified = src.lastModified;
        this.dbApplicationName = src.dbApplicationName;
        this.cohorts = cohort_1.Cohort.duplicateArray(src.cohorts);
    };
    CohortsData.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    CohortsData.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return CohortsData;
}());
exports.CohortsData = CohortsData;
//# sourceMappingURL=cohortsData.js.map