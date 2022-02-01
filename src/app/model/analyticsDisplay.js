"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Atributes = exports.OrderingRules = exports.ConfigurationRules = exports.AnalyticsDataCollectionByFeatureNames = exports.InputFieldsForAnalytics = exports.AnalyticsDataCollection = exports.AnalyticsDisplay = void 0;
var AnalyticsDisplay = /** @class */ (function () {
    function AnalyticsDisplay() {
        this.analyticsDataCollection = null;
        this.lastModified = 0;
        this.rule = null;
        this.seasonId = "";
        this.rolloutPercentage = 0;
        this.analyticsDataCollection = new AnalyticsDataCollection();
    }
    return AnalyticsDisplay;
}());
exports.AnalyticsDisplay = AnalyticsDisplay;
var AnalyticsDataCollection = /** @class */ (function () {
    function AnalyticsDataCollection() {
        this.analyticsDataCollectionByFeatureNames = [];
        this.inputFieldsForAnalytics = [];
    }
    return AnalyticsDataCollection;
}());
exports.AnalyticsDataCollection = AnalyticsDataCollection;
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
var OrderingRules = /** @class */ (function () {
    function OrderingRules() {
    }
    return OrderingRules;
}());
exports.OrderingRules = OrderingRules;
var Atributes = /** @class */ (function () {
    function Atributes() {
    }
    return Atributes;
}());
exports.Atributes = Atributes;
//# sourceMappingURL=analyticsDisplay.js.map