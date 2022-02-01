"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexingProgress = exports.IndexRange = exports.IndexingInfo = void 0;
var IndexingInfo = /** @class */ (function () {
    function IndexingInfo() {
    }
    IndexingInfo.clone = function (info) {
        var toRet = new IndexingInfo();
        if (info) {
            toRet.owner = info.owner;
            toRet.dashboardURL = info.dashboardURL;
            toRet.missingDashboardExplanation = info.missingDashboardExplanation;
            toRet.productId = info.productId;
            toRet.ranges = IndexingInfo.duplicateArrayRange(info.ranges);
            toRet.endDate = info.endDate;
            toRet.description = info.description;
            toRet.variants = IndexingInfo.duplicateArrayString(info.variants);
            toRet.productName = info.productName;
            toRet.indexExperiment = info.indexExperiment;
            toRet.controlGroupVariants = IndexingInfo.duplicateArrayString(info.controlGroupVariants);
            toRet.stage = info.stage;
            toRet.indexingProgress = IndexingProgress.clone(info.indexingProgress);
            if (info.uniqueUsers != null) {
                toRet.uniqueUsers = JSON.parse(JSON.stringify(info.uniqueUsers));
            }
            toRet.name = info.name;
            toRet.experimentId = info.experimentId;
            toRet.hypothesis = info.hypothesis;
            toRet.variantsDescriptions = IndexingInfo.duplicateArrayString(info.variantsDescriptions);
            toRet.startDate = info.startDate;
            return toRet;
        }
        else {
            return null;
        }
    };
    IndexingInfo.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    IndexingInfo.duplicateArrayRange = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(IndexRange.clone(x));
            });
        }
        else {
            return null;
        }
        return arr;
    };
    IndexingInfo.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return IndexingInfo;
}());
exports.IndexingInfo = IndexingInfo;
var IndexRange = /** @class */ (function () {
    function IndexRange() {
    }
    IndexRange.clone = function (other) {
        var retObj = new IndexRange();
        retObj.start = other.start;
        retObj.end = other.end;
        return retObj;
    };
    return IndexRange;
}());
exports.IndexRange = IndexRange;
var IndexingProgress = /** @class */ (function () {
    function IndexingProgress() {
    }
    IndexingProgress.clone = function (other) {
        var retObj = new IndexingProgress();
        if (other) {
            retObj.totalNumberOfBuckets = other.totalNumberOfBuckets;
            retObj.numberOfDoneBuckets = other.numberOfDoneBuckets;
            retObj.numberOfErrorBuckets = other.numberOfErrorBuckets;
        }
        return retObj;
    };
    return IndexingProgress;
}());
exports.IndexingProgress = IndexingProgress;
//# sourceMappingURL=indexingInfo.js.map