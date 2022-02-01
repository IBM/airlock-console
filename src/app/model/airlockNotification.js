"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AirlockNotification = void 0;
var rule_1 = require("./rule");
var AirlockNotification = /** @class */ (function () {
    function AirlockNotification() {
    }
    AirlockNotification.cloneToAirlockNotification = function (src, target) {
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
        target.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        target.owner = src.owner;
        target.configuration = src.configuration;
        target.cancellationRule = rule_1.Rule.clone(src.cancellationRule);
        target.registrationRule = rule_1.Rule.clone(src.registrationRule);
        target.maxNotifications = src.maxNotifications;
        target.minInterval = src.minInterval;
    };
    AirlockNotification.clone = function (src) {
        var toRet = new AirlockNotification();
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
        toRet.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        toRet.owner = src.owner;
        toRet.configuration = src.configuration;
        toRet.cancellationRule = rule_1.Rule.clone(src.cancellationRule);
        toRet.registrationRule = rule_1.Rule.clone(src.registrationRule);
        toRet.maxNotifications = src.maxNotifications;
        toRet.minInterval = src.minInterval;
        return toRet;
    };
    AirlockNotification.prototype.setFromAirlockNotification = function (src) {
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
        this.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        this.owner = src.owner;
        this.configuration = src.configuration;
        this.cancellationRule = rule_1.Rule.clone(src.cancellationRule);
        this.registrationRule = rule_1.Rule.clone(src.registrationRule);
        this.maxNotifications = src.maxNotifications;
        this.minInterval = src.minInterval;
    };
    AirlockNotification.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    AirlockNotification.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return AirlockNotification;
}());
exports.AirlockNotification = AirlockNotification;
//# sourceMappingURL=airlockNotification.js.map