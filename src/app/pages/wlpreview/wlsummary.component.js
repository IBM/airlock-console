"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhitelistSummary = exports.FeatureDisplayType = void 0;
var core_1 = require("@angular/core");
var animations_1 = require("@angular/animations");
var analyticsDisplay_1 = require("../../model/analyticsDisplay");
var strings_service_1 = require("../../services/strings.service");
var branch_1 = require("../../model/branch");
var FeatureDisplayType;
(function (FeatureDisplayType) {
    FeatureDisplayType[FeatureDisplayType["FEATURE_NOT_SEND"] = 0] = "FEATURE_NOT_SEND";
    FeatureDisplayType[FeatureDisplayType["FEATURE_SEND_IN_MASTER"] = 1] = "FEATURE_SEND_IN_MASTER";
    FeatureDisplayType[FeatureDisplayType["FEATURE_SEND_NOT_IN_BRANCH"] = 2] = "FEATURE_SEND_NOT_IN_BRANCH";
    FeatureDisplayType[FeatureDisplayType["FEATURE_SEND_IN_BRANCH"] = 3] = "FEATURE_SEND_IN_BRANCH";
})(FeatureDisplayType = exports.FeatureDisplayType || (exports.FeatureDisplayType = {}));
var WhitelistSummary = /** @class */ (function () {
    function WhitelistSummary(_stringsSrevice) {
        this._stringsSrevice = _stringsSrevice;
        this.closable = true;
        this.visibleChange = new core_1.EventEmitter();
    }
    WhitelistSummary.prototype.getString = function (name) {
        return this._stringsSrevice.getString(name);
    };
    WhitelistSummary.prototype.ngOnInit = function () {
    };
    WhitelistSummary.prototype.showAnaliticsHelp = function () {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.lal9wm6w3zm7');
    };
    WhitelistSummary.prototype.getAttributeDeletedTooltip = function () {
        return this.getString('analytics_summary_attribute_deleted_warning');
    };
    WhitelistSummary.prototype.isMasterIndicator = function (attribute) {
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (attribute.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    };
    WhitelistSummary.prototype.isMasterBranch = function () {
        return (this.selectedBranch.name === "MASTER");
    };
    /* isIndicatorFeatures(feature:AnalyticsDataCollectionByFeatureNames){
         if (this.selectedBranch.name == "MASTER") {
             if (feature.sendToAnalytics)
                 return true;
             else
                 return false;
 
         }
         else{
             if (feature.sendToAnalytics && feature.branchName != "MASTER")
                 return true;
             else
                 return false;
         }
 
     }*/
    WhitelistSummary.prototype.isIndicatorFeatures = function (feature) {
        if (!feature.sendToAnalytics)
            return FeatureDisplayType.FEATURE_NOT_SEND;
        if (feature.sendToAnalytics && this.selectedBranch.name == "MASTER") {
            return FeatureDisplayType.FEATURE_SEND_IN_MASTER;
        }
        else {
            if (feature.branchName === "MASTER")
                return FeatureDisplayType.FEATURE_SEND_NOT_IN_BRANCH;
            else
                return FeatureDisplayType.FEATURE_SEND_IN_BRANCH;
        }
    };
    WhitelistSummary.prototype.isMasterIndicatorConfigurations = function (conf) {
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (conf.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    };
    WhitelistSummary.prototype.isMasterIndicatorOrderingRule = function (conf) {
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (conf.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    };
    WhitelistSummary.prototype.isMasterIndicatorAtributes = function (atr) {
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (atr.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    };
    WhitelistSummary.prototype.close = function () {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Object)
    ], WhitelistSummary.prototype, "closable", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], WhitelistSummary.prototype, "visible", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], WhitelistSummary.prototype, "totalCount", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], WhitelistSummary.prototype, "totalCountDev", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Number)
    ], WhitelistSummary.prototype, "totalCountQuota", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", analyticsDisplay_1.AnalyticsDisplay)
    ], WhitelistSummary.prototype, "analyticDataForDisplay", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", branch_1.Branch)
    ], WhitelistSummary.prototype, "selectedBranch", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", core_1.EventEmitter)
    ], WhitelistSummary.prototype, "visibleChange", void 0);
    WhitelistSummary = __decorate([
        core_1.Component({
            selector: 'wl-summary',
            templateUrl: 'wlsummary.component.html',
            styleUrls: ['wlsummary.component.css'],
            animations: [
                animations_1.trigger('dialog', [
                    animations_1.transition('void => *', [
                        animations_1.style({ transform: 'scale3d(.3, .3, .3)' }),
                        animations_1.animate(100)
                    ]),
                    animations_1.transition('* => void', [
                        animations_1.animate(100, animations_1.style({ transform: 'scale3d(.0, .0, .0)' }))
                    ])
                ])
            ]
        }),
        __metadata("design:paramtypes", [strings_service_1.StringsService])
    ], WhitelistSummary);
    return WhitelistSummary;
}());
exports.WhitelistSummary = WhitelistSummary;
//# sourceMappingURL=wlsummary.component.js.map