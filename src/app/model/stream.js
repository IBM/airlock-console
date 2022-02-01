"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stream = void 0;
var Stream = /** @class */ (function () {
    function Stream() {
    }
    Stream.cloneToStream = function (src, target) {
        target.uniqueId = src.uniqueId;
        target.seasonId = src.seasonId;
        target.name = src.name;
        target.lastModified = src.lastModified;
        target.stage = src.stage;
        target.description = src.description;
        target.enabled = src.enabled;
        target.minAppVersion = src.minAppVersion;
        target.rolloutPercentage = src.rolloutPercentage;
        target.creator = src.creator;
        target.creationDate = src.creationDate;
        target.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        target.filter = src.filter;
        target.maxQueuedEvents = src.maxQueuedEvents;
        target.queueSizeKB = src.queueSizeKB;
        target.owner = src.owner;
        target.processor = src.processor;
        target.resultsSchema = src.resultsSchema;
        target.operateOnHistoricalEvents = src.operateOnHistoricalEvents;
        target.processEventsOfLastNumberOfDays = src.processEventsOfLastNumberOfDays;
        target.limitByEndDate = src.limitByEndDate;
        target.limitByStartDate = src.limitByStartDate;
    };
    Stream.clone = function (src) {
        var toRet = new Stream();
        toRet.uniqueId = src.uniqueId;
        toRet.seasonId = src.seasonId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.stage = src.stage;
        toRet.description = src.description;
        toRet.enabled = src.enabled;
        toRet.minAppVersion = src.minAppVersion;
        toRet.rolloutPercentage = src.rolloutPercentage;
        toRet.creator = src.creator;
        toRet.creationDate = src.creationDate;
        toRet.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        toRet.filter = src.filter;
        toRet.maxQueuedEvents = src.maxQueuedEvents;
        toRet.queueSizeKB = src.queueSizeKB;
        toRet.owner = src.owner;
        toRet.processor = src.processor;
        toRet.resultsSchema = src.resultsSchema;
        toRet.operateOnHistoricalEvents = src.operateOnHistoricalEvents;
        toRet.processEventsOfLastNumberOfDays = src.processEventsOfLastNumberOfDays;
        toRet.limitByEndDate = src.limitByEndDate;
        toRet.limitByStartDate = src.limitByStartDate;
        return toRet;
    };
    Stream.prototype.setFromStream = function (src) {
        this.uniqueId = src.uniqueId;
        this.seasonId = src.seasonId;
        this.name = src.name;
        this.lastModified = src.lastModified;
        this.stage = src.stage;
        this.description = src.description;
        this.enabled = src.enabled;
        this.minAppVersion = src.minAppVersion;
        this.rolloutPercentage = src.rolloutPercentage;
        this.creator = src.creator;
        this.creationDate = src.creationDate;
        this.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        this.filter = src.filter;
        this.maxQueuedEvents = src.maxQueuedEvents;
        this.queueSizeKB = src.queueSizeKB;
        this.owner = src.owner;
        this.processor = src.processor;
        this.resultsSchema = src.resultsSchema;
        this.operateOnHistoricalEvents = src.operateOnHistoricalEvents;
        this.processEventsOfLastNumberOfDays = src.processEventsOfLastNumberOfDays;
        this.limitByEndDate = src.limitByEndDate;
        this.limitByStartDate = src.limitByStartDate;
    };
    Stream.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Stream.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return Stream;
}());
exports.Stream = Stream;
//# sourceMappingURL=stream.js.map