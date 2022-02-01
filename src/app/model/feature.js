"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feature = void 0;
var rule_1 = require("./rule");
var Feature = /** @class */ (function () {
    function Feature() {
        this.defaultIfAirlockSystemIsDown = false;
        this.sendToAnalytics = false;
    }
    Feature.cloneToFeature = function (feat, target) {
        target.uniqueId = feat.uniqueId;
        target.enabled = feat.enabled;
        target.lastModified = feat.lastModified;
        target.parent = feat.parent;
        target.type = feat.type;
        target.stage = feat.stage;
        target.additionalInfo = feat.additionalInfo;
        target.namespace = feat.namespace;
        target.creator = feat.creator;
        target.creationDate = feat.creationDate;
        target.description = feat.description;
        target.rule = rule_1.Rule.clone(feat.rule);
        target.minAppVersion = feat.minAppVersion;
        target.name = feat.name;
        target.displayName = feat.displayName;
        target.features = Feature.duplicateArray(feat.features);
        target.configurationRules = Feature.duplicateArray(feat.configurationRules);
        target.orderingRules = Feature.duplicateArray(feat.orderingRules);
        target.owner = feat.owner;
        target.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        target.rolloutPercentage = feat.rolloutPercentage;
        target.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        target.uniqueId = feat.uniqueId;
        target.seasonId = feat.seasonId;
        target.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        target.isCurrentUserFollower = feat.isCurrentUserFollower;
        target.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        target.defaultConfiguration = feat.defaultConfiguration;
        target.configurationSchema = feat.configurationSchema;
        target.configuration = feat.configuration;
        target.maxFeaturesOn = feat.maxFeaturesOn;
        target.noCachedResults = feat.noCachedResults;
        target.sendToAnalytics = feat.sendToAnalytics;
        target.branchStatus = feat.branchStatus;
        target.premium = feat.premium;
        target.entitlement = feat.entitlement;
        target.premiumRule = rule_1.Rule.clone(feat.premiumRule);
    };
    Feature.clone = function (feat) {
        var toRet = new Feature();
        toRet.uniqueId = feat.uniqueId;
        toRet.enabled = feat.enabled;
        toRet.lastModified = feat.lastModified;
        toRet.parent = feat.parent;
        toRet.type = feat.type;
        toRet.stage = feat.stage;
        toRet.additionalInfo = feat.additionalInfo;
        toRet.namespace = feat.namespace;
        toRet.creator = feat.creator;
        toRet.creationDate = feat.creationDate;
        toRet.description = feat.description;
        toRet.rule = rule_1.Rule.clone(feat.rule);
        toRet.minAppVersion = feat.minAppVersion;
        toRet.name = feat.name;
        toRet.displayName = feat.displayName;
        toRet.features = Feature.duplicateArray(feat.features);
        toRet.configurationRules = Feature.duplicateArray(feat.configurationRules);
        toRet.orderingRules = Feature.duplicateArray(feat.orderingRules);
        toRet.owner = feat.owner;
        toRet.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        toRet.rolloutPercentage = feat.rolloutPercentage;
        toRet.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        toRet.uniqueId = feat.uniqueId;
        toRet.seasonId = feat.seasonId;
        toRet.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        toRet.isCurrentUserFollower = feat.isCurrentUserFollower;
        toRet.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        toRet.defaultConfiguration = feat.defaultConfiguration;
        toRet.configurationSchema = feat.configurationSchema;
        toRet.configuration = feat.configuration;
        toRet.maxFeaturesOn = feat.maxFeaturesOn;
        toRet.noCachedResults = feat.noCachedResults;
        toRet.sendToAnalytics = feat.sendToAnalytics;
        toRet.branchStatus = feat.branchStatus;
        toRet.premium = feat.premium;
        toRet.entitlement = feat.entitlement;
        toRet.premiumRule = rule_1.Rule.clone(feat.premiumRule);
        return toRet;
    };
    Feature.prototype.setFromFeature = function (feat) {
        this.uniqueId = feat.uniqueId;
        this.enabled = feat.enabled;
        this.lastModified = feat.lastModified;
        this.parent = feat.parent;
        this.type = feat.type;
        this.stage = feat.stage;
        this.additionalInfo = feat.additionalInfo;
        this.namespace = feat.namespace;
        this.creator = feat.creator;
        this.creationDate = feat.creationDate;
        this.description = feat.description;
        this.rule = rule_1.Rule.clone(feat.rule);
        this.minAppVersion = feat.minAppVersion;
        this.name = feat.name;
        this.displayName = feat.displayName;
        this.features = Feature.duplicateArray(feat.features);
        this.configurationRules = Feature.duplicateArray(feat.configurationRules);
        this.orderingRules = Feature.duplicateArray(feat.orderingRules);
        this.owner = feat.owner;
        this.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        this.rolloutPercentage = feat.rolloutPercentage;
        this.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        this.uniqueId = feat.uniqueId;
        this.seasonId = feat.seasonId;
        this.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        this.isCurrentUserFollower = feat.isCurrentUserFollower;
        this.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        this.defaultConfiguration = feat.defaultConfiguration;
        this.configurationSchema = feat.configurationSchema;
        this.configuration = feat.configuration;
        this.maxFeaturesOn = feat.maxFeaturesOn;
        this.noCachedResults = feat.noCachedResults;
        this.sendToAnalytics = feat.sendToAnalytics;
        this.branchStatus = feat.branchStatus;
        this.premium = feat.premium;
        this.entitlement = feat.entitlement;
        this.premiumRule = rule_1.Rule.clone(feat.premiumRule);
    };
    Feature.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Feature.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return Feature;
}());
exports.Feature = Feature;
//# sourceMappingURL=feature.js.map