"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variant = void 0;
var rule_1 = require("./rule");
var Variant = /** @class */ (function () {
    function Variant() {
    }
    Variant.cloneToVariant = function (variant, target) {
        target.uniqueId = variant.uniqueId;
        target.name = variant.name;
        target.displayName = variant.displayName;
        target.lastModified = variant.lastModified;
        target.stage = variant.stage;
        target.description = variant.description;
        target.branchName = variant.branchName;
        target.experimentId = variant.experimentId;
        target.enabled = variant.enabled;
        target.rule = rule_1.Rule.clone(variant.rule);
        target.rolloutPercentage = variant.rolloutPercentage;
        target.creator = variant.creator;
        target.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        target.creationDate = variant.creationDate;
    };
    Variant.clone = function (variant) {
        var toRet = new Variant();
        toRet.uniqueId = variant.uniqueId;
        toRet.name = variant.name;
        toRet.displayName = variant.displayName;
        toRet.lastModified = variant.lastModified;
        toRet.stage = variant.stage;
        toRet.description = variant.description;
        toRet.branchName = variant.branchName;
        toRet.experimentId = variant.experimentId;
        toRet.enabled = variant.enabled;
        toRet.rule = rule_1.Rule.clone(variant.rule);
        toRet.rolloutPercentage = variant.rolloutPercentage;
        toRet.creator = variant.creator;
        toRet.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        toRet.creationDate = variant.creationDate;
        return toRet;
    };
    Variant.prototype.setFromExperiment = function (variant) {
        this.uniqueId = variant.uniqueId;
        this.name = variant.name;
        this.displayName = variant.displayName;
        this.lastModified = variant.lastModified;
        this.stage = variant.stage;
        this.description = variant.description;
        this.branchName = variant.branchName;
        this.experimentId = variant.experimentId;
        this.enabled = variant.enabled;
        this.rule = rule_1.Rule.clone(variant.rule);
        this.rolloutPercentage = variant.rolloutPercentage;
        this.creator = variant.creator;
        this.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        this.creationDate = variant.creationDate;
    };
    Variant.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Variant.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return Variant;
}());
exports.Variant = Variant;
//# sourceMappingURL=variant.js.map