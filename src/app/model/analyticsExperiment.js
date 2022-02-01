"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Branches = exports.OrderingRule = exports.ConfigurationRules = exports.AnalyticsDataCollectionByFeatureNames = exports.InputFieldsForAnalytics = exports.AnalyticsExperiment = void 0;
var AnalyticsExperiment = /** @class */ (function () {
    function AnalyticsExperiment() {
        this.analyticsDataCollectionByFeatureNames = [];
        this.inputFieldsForAnalytics = [];
    }
    return AnalyticsExperiment;
}());
exports.AnalyticsExperiment = AnalyticsExperiment;
var InputFieldsForAnalytics = /** @class */ (function () {
    function InputFieldsForAnalytics() {
    }
    return InputFieldsForAnalytics;
}());
exports.InputFieldsForAnalytics = InputFieldsForAnalytics;
var AnalyticsDataCollectionByFeatureNames = /** @class */ (function () {
    function AnalyticsDataCollectionByFeatureNames() {
        this.configurationRules = [];
        this.attributes = [];
        this.orderingRules = [];
    }
    return AnalyticsDataCollectionByFeatureNames;
}());
exports.AnalyticsDataCollectionByFeatureNames = AnalyticsDataCollectionByFeatureNames;
var ConfigurationRules = /** @class */ (function () {
    function ConfigurationRules() {
    }
    return ConfigurationRules;
}());
exports.ConfigurationRules = ConfigurationRules;
var OrderingRule = /** @class */ (function () {
    function OrderingRule() {
    }
    return OrderingRule;
}());
exports.OrderingRule = OrderingRule;
var Branches = /** @class */ (function () {
    function Branches() {
    }
    return Branches;
}());
exports.Branches = Branches;
//# sourceMappingURL=analyticsExperiment.js.map