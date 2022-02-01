"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Experiment = void 0;
var rule_1 = require("./rule");
var indexingInfo_1 = require("./indexingInfo");
var Experiment = /** @class */ (function () {
    function Experiment() {
        this.indexExperiment = false;
    }
    Experiment.cloneToExperiment = function (exp, target) {
        target.uniqueId = exp.uniqueId;
        target.productId = exp.productId;
        target.name = exp.name;
        target.displayName = exp.displayName;
        target.lastModified = exp.lastModified;
        target.stage = exp.stage;
        target.ranges = indexingInfo_1.IndexingInfo.duplicateArrayRange(exp.ranges);
        target.description = exp.description;
        target.hypothesis = exp.hypothesis;
        target.measurements = exp.measurements;
        target.enabled = exp.enabled;
        target.indexingInfo = indexingInfo_1.IndexingInfo.clone(exp.indexingInfo);
        target.minVersion = exp.minVersion;
        target.maxVersion = exp.maxVersion;
        target.rule = rule_1.Rule.clone(exp.rule);
        target.rolloutPercentage = exp.rolloutPercentage;
        target.variants = Experiment.duplicateArray(exp.variants);
        target.creator = exp.creator;
        target.creationDate = exp.creationDate;
        target.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        target.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
        target.indexExperiment = exp.indexExperiment;
    };
    Experiment.clone = function (exp) {
        var toRet = new Experiment();
        toRet.uniqueId = exp.uniqueId;
        toRet.productId = exp.productId;
        toRet.name = exp.name;
        toRet.displayName = exp.displayName;
        toRet.lastModified = exp.lastModified;
        toRet.stage = exp.stage;
        toRet.ranges = indexingInfo_1.IndexingInfo.duplicateArrayRange(exp.ranges);
        toRet.description = exp.description;
        toRet.hypothesis = exp.hypothesis;
        toRet.measurements = exp.measurements;
        toRet.enabled = exp.enabled;
        toRet.indexingInfo = indexingInfo_1.IndexingInfo.clone(exp.indexingInfo);
        toRet.minVersion = exp.minVersion;
        toRet.maxVersion = exp.maxVersion;
        toRet.rule = rule_1.Rule.clone(exp.rule);
        toRet.rolloutPercentage = exp.rolloutPercentage;
        toRet.variants = Experiment.duplicateArray(exp.variants);
        toRet.creator = exp.creator;
        toRet.creationDate = exp.creationDate;
        toRet.indexExperiment = exp.indexExperiment;
        toRet.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        toRet.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
        return toRet;
    };
    Experiment.prototype.setFromExperiment = function (exp) {
        this.uniqueId = exp.uniqueId;
        this.productId = exp.productId;
        this.name = exp.name;
        this.displayName = exp.displayName;
        this.lastModified = exp.lastModified;
        this.stage = exp.stage;
        this.ranges = indexingInfo_1.IndexingInfo.duplicateArrayRange(exp.ranges);
        this.description = exp.description;
        this.hypothesis = exp.hypothesis;
        this.measurements = exp.measurements;
        this.enabled = exp.enabled;
        this.indexingInfo = indexingInfo_1.IndexingInfo.clone(exp.indexingInfo);
        this.minVersion = exp.minVersion;
        this.maxVersion = exp.maxVersion;
        this.rule = rule_1.Rule.clone(exp.rule);
        this.indexExperiment = exp.indexExperiment;
        this.rolloutPercentage = exp.rolloutPercentage;
        this.variants = Experiment.duplicateArray(exp.variants);
        this.creator = exp.creator;
        this.creationDate = exp.creationDate;
        this.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        this.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
    };
    Experiment.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Experiment.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return Experiment;
}());
exports.Experiment = Experiment;
//# sourceMappingURL=experiment.js.map