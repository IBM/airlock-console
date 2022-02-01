"use strict";
/*
private UUID productId = null;
    private UUID uniqueId = null; //nc + u
    private String name = null; //c+u
    private String description = null; //opt in c+u (if missing or null in update don't change)
    private Date creationDate = null; //nc + u (not changed)
    private String creator = null;	//c+u (creator not changed)
    private String queryCondition = null;
    private String queryAdditionalValue = null;
    private JobStatus calculationStatus;
    private String calculationStatusMessage;
    private CohortCalculationFrequency updateFrequency = CohortCalculationFrequency.MANUAL;
    private boolean enabled;
    private Date lastModified = null; // required in update. forbidden in create

    private Map<String, CohortExportItem> exports = new HashMap<>();
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cohort = void 0;
var Cohort = /** @class */ (function () {
    function Cohort() {
    }
    Cohort.cloneToCohort = function (src, target) {
        target.uniqueId = src.uniqueId;
        target.productId = src.productId;
        target.name = src.name;
        target.lastModified = src.lastModified;
        target.description = src.description;
        target.enabled = src.enabled;
        target.queryCondition = src.queryCondition;
        target.creator = src.creator;
        target.creationDate = src.creationDate;
        target.queryAdditionalValue = src.queryAdditionalValue;
        target.updateFrequency = src.updateFrequency;
        target.calculationStatusMessage = src.calculationStatusMessage;
        target.usersNumber = src.usersNumber;
        target.calculationStatus = src.calculationStatus;
        target.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        target.exports = Cohort.duplicateMap(src.exports);
    };
    Cohort.clone = function (src) {
        var toRet = new Cohort();
        toRet.uniqueId = src.uniqueId;
        toRet.productId = src.productId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.description = src.description;
        toRet.enabled = src.enabled;
        toRet.queryCondition = src.queryCondition;
        toRet.creator = src.creator;
        toRet.creationDate = src.creationDate;
        toRet.queryAdditionalValue = src.queryAdditionalValue;
        toRet.updateFrequency = src.updateFrequency;
        toRet.calculationStatusMessage = src.calculationStatusMessage;
        toRet.usersNumber = src.usersNumber;
        toRet.calculationStatus = src.calculationStatus;
        toRet.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        toRet.exports = Cohort.duplicateMap(src.exports);
        return toRet;
    };
    Cohort.prototype.setFromCohort = function (src) {
        this.uniqueId = src.uniqueId;
        this.productId = src.productId;
        this.name = src.name;
        this.lastModified = src.lastModified;
        this.description = src.description;
        this.enabled = src.enabled;
        this.queryCondition = src.queryCondition;
        this.creator = src.creator;
        this.creationDate = src.creationDate;
        this.queryAdditionalValue = src.queryAdditionalValue;
        this.updateFrequency = src.updateFrequency;
        this.calculationStatusMessage = src.calculationStatusMessage;
        this.usersNumber = src.usersNumber;
        this.calculationStatus = src.calculationStatus;
        this.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        this.exports = Cohort.duplicateMap(src.exports);
    };
    Cohort.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Cohort.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    Cohort.duplicateMap = function (src) {
        return Object.assign({}, src);
    };
    return Cohort;
}());
exports.Cohort = Cohort;
//# sourceMappingURL=cohort.js.map