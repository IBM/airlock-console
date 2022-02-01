"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InAppPurchase = void 0;
var rule_1 = require("./rule");
var feature_1 = require("./feature");
var InAppPurchase = /** @class */ (function (_super) {
    __extends(InAppPurchase, _super);
    function InAppPurchase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InAppPurchase.cloneToFeature = function (feat, target) {
        feature_1.Feature.cloneToFeature(feat, target);
        target.includedEntitlements = feature_1.Feature.duplicateArrayString(feat.includedEntitlements);
        target.purchaseOptions = feature_1.Feature.duplicateArray(feat.purchaseOptions);
        target.entitlements = feature_1.Feature.duplicateArray(feat.entitlements);
    };
    InAppPurchase.clone = function (feat) {
        var toRet = new InAppPurchase(); //(InAppPurchase)Feature.clone(feat);
        toRet.setFromFeature(feat);
        toRet.includedEntitlements = feature_1.Feature.duplicateArrayString(feat.includedEntitlements);
        toRet.purchaseOptions = feature_1.Feature.duplicateArray(feat.purchaseOptions);
        toRet.entitlements = feature_1.Feature.duplicateArray(feat.entitlements);
        return toRet;
    };
    InAppPurchase.prototype.setFromFeature = function (feat) {
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
        this.features = feature_1.Feature.duplicateArray(feat.features);
        this.configurationRules = feature_1.Feature.duplicateArray(feat.configurationRules);
        this.orderingRules = feature_1.Feature.duplicateArray(feat.orderingRules);
        this.owner = feat.owner;
        this.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        this.rolloutPercentage = feat.rolloutPercentage;
        this.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        this.uniqueId = feat.uniqueId;
        this.seasonId = feat.seasonId;
        this.internalUserGroups = feature_1.Feature.duplicateArrayString(feat.internalUserGroups);
        this.isCurrentUserFollower = feat.isCurrentUserFollower;
        this.configAttributesToAnalytics = feature_1.Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        this.defaultConfiguration = feat.defaultConfiguration;
        this.configurationSchema = feat.configurationSchema;
        this.configuration = feat.configuration;
        this.maxFeaturesOn = feat.maxFeaturesOn;
        this.noCachedResults = feat.noCachedResults;
        this.sendToAnalytics = feat.sendToAnalytics;
        this.branchStatus = feat.branchStatus;
        this.includedEntitlements = feature_1.Feature.duplicateArrayString(feat.includedEntitlements);
        this.purchaseOptions = feature_1.Feature.duplicateArray(feat.purchaseOptions);
        this.entitlements = feature_1.Feature.duplicateArray(feat.entitlements);
    };
    return InAppPurchase;
}(feature_1.Feature));
exports.InAppPurchase = InAppPurchase;
//# sourceMappingURL=inAppPurchase.js.map