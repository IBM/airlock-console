"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsPage = void 0;
var core_1 = require("@angular/core");
var animations_1 = require("@angular/animations");
var airlock_service_1 = require("../../services/airlock.service");
var core_2 = require("@angular/core");
var transparentSpinner_service_1 = require("../../theme/airlock.components/transparentSpinner/transparentSpinner.service");
var global_state_1 = require("../../global.state");
var verifyActionModal_component_1 = require("../../theme/airlock.components/verifyActionModal/verifyActionModal.component");
var featureUtils_service_1 = require("../../services/featureUtils.service");
var strings_service_1 = require("../../services/strings.service");
var addNotificationModal_component_1 = require("../../theme/airlock.components/addNotificationModal/addNotificationModal.component");
var reorderNotificationsModal_component_1 = require("../../theme/airlock.components/reorderNotificationsModal/reorderNotificationsModal.component");
var limitNotificationsModal_component_1 = require("../../theme/airlock.components/limitNotificationsModal/limitNotificationsModal.component");
var NotificationsPage = /** @class */ (function () {
    function NotificationsPage(_airLockService, _appState, _stringsSrevice) {
        this._airLockService = _airLockService;
        this._appState = _appState;
        this._stringsSrevice = _stringsSrevice;
        this.valid = true;
        this.filteredItems = new Array();
        this.selectedId = null;
        this.selectedIndex = -1;
        this.showDevFeatures = true;
        this.scrolledToSelected = false;
        this.filterlistDict = { string: [] };
        this.editDialogOpen = false;
        this.openNotification = [];
        this.showConfig = false;
        this.loading = false;
        this.showDialog = false;
        this.searchQueryString = null;
        this.possibleUserGroupsList = [];
        this.status = { isopen: false };
    }
    NotificationsPage.prototype.setEditDialog = function (isOpen) {
        this.editDialogOpen = isOpen;
    };
    NotificationsPage.prototype.isShowOptions = function () {
        return (!this._airLockService.isViewer());
    };
    NotificationsPage.prototype.isViewer = function () {
        return this._airLockService.isViewer();
    };
    NotificationsPage.prototype.toggleDataCollectionDetails = function () {
        this.showDialog = !this.showDialog;
    };
    NotificationsPage.prototype.initData = function (currentSeason, isSeasonLatest) {
    };
    NotificationsPage.prototype.ngOnInit = function () {
        var _this = this;
        var isLatestStr = this._appState.getData('features.isLatestSeason');
        // let currProduct = this._appState.getData('features.currentProduct');
        var currSeason = this._appState.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        console.log("got saved season!!!");
        //console.log(currSeason);
        this._appState.subscribe('features.currentSeason', 'notifications', function (season) {
            _this.selectedSeason = season;
            _this.onSeasonSelected(season);
        });
        // this.initData(currSeason, isLatest);
        this.onSeasonSelected(currSeason);
    };
    NotificationsPage.prototype.ngOnDestroy = function () {
        this._appState.unsubcribe('features.currentSeason', 'notifications');
    };
    NotificationsPage.prototype.onSeasonSelected = function (season) {
        if (!this._airLockService.canViewPage("notifications")) {
            this.loading = false;
            this._airLockService.redirectToFeaturesPage();
            return;
        }
        this.loadNotifications();
    };
    NotificationsPage.prototype.notificationsReordered = function (obj) {
        this.loadNotifications();
    };
    NotificationsPage.prototype.loadNotifications = function () {
        var _this = this;
        if (this.selectedSeason) {
            var currProduct = this._appState.getData('features.currentProduct');
            this._airLockService.getUserGroups(currProduct).then(function (response) {
                console.log(response);
                _this.possibleUserGroupsList = response.internalUserGroups;
            });
            if (featureUtils_service_1.FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion, "4.5")) {
                this.valid = false;
                this.notifications = null;
                this.loading = false;
                var errorMessage = this.getString("notifications_season_not_supported");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
            }
            else {
                this.loading = true;
                this._airLockService.getNotifications(this.selectedSeason).then(function (notifications) {
                    // this.experiments = products;
                    _this.notifications = notifications;
                    _this.loading = false;
                }).catch(function (error) {
                    _this.loading = false;
                    // alert(`Failed to update product: ${error}`)
                    _this._airLockService.notifyDataChanged("error-notification", "Failed to load notifications: " + error);
                });
                ;
            }
        }
        else {
            this.loading = false;
        }
    };
    NotificationsPage.prototype.isCellOpen = function (expID) {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    };
    NotificationsPage.prototype.setShowConfig = function (show) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }
    };
    NotificationsPage.prototype.setShowDevFeatures = function (show) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        }
        else {
            this.filterlistDict["stage"] = ["development"];
        }
    };
    NotificationsPage.prototype.refreshTable = function () {
        this.loadNotifications();
    };
    NotificationsPage.prototype.beforeUpdate = function () {
        this.loading = true;
    };
    NotificationsPage.prototype.afterUpdate = function () {
        this.loading = false;
    };
    NotificationsPage.prototype.deleteFeature = function (feature) {
    };
    NotificationsPage.prototype.changeStateHandler = function (feature) {
        console.log('in changeFeatureState():' + this._airLockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        }
        else {
            feature.stage = 'PRODUCTION';
        }
    };
    NotificationsPage.prototype.addNotification = function () {
        this.addNotificationModal.open();
    };
    NotificationsPage.prototype.updateNotifications = function (notification) {
        this.loadNotifications();
    };
    NotificationsPage.prototype.canAddNotification = function () {
        return !this._airLockService.isViewer();
    };
    NotificationsPage.prototype.canLimitNotifications = function () {
        return this._airLockService.isProductLead() || this._airLockService.isAdministrator();
    };
    NotificationsPage.prototype.onSearchQueryChanged = function (term) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    };
    NotificationsPage.prototype.getString = function (name) {
        return this._stringsSrevice.getString(name);
    };
    NotificationsPage.prototype.notificationIsInFilter = function (streamID) {
    };
    NotificationsPage.prototype.notificationChangedStatus = function (notificationID) {
        console.log("notification changed status:" + notificationID);
        var index = this.openNotification.indexOf(notificationID, 0);
        if (index > -1) {
            this.openNotification.splice(index, 1);
        }
        else {
            this.openNotification.push(notificationID);
        }
    };
    NotificationsPage.prototype.createFilteredList = function () {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        var term = this.searchQueryString;
        if (term && term.length > 0 && this.notifications) {
            for (var _i = 0, _a = this.notifications.notifications; _i < _a.length; _i++) {
                var notif = _a[_i];
                this.isFilteredOut(notif);
            }
        }
    };
    NotificationsPage.prototype.isFilteredOut = function (notification) {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldNotificationBeFilteredOut(notification)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        var hasSearchHit = this.isPartOfSearch(this.searchQueryString, notification);
        if (hasSearchHit) {
            this.filteredItems.push(notification.uniqueId);
        }
        return !hasSearchHit;
    };
    NotificationsPage.prototype.shouldNotificationBeFilteredOut = function (feature) {
        if (!this.filterlistDict) {
            return false;
        }
        var keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var _a = 0, valuesArr_1 = valuesArr; _a < valuesArr_1.length; _a++) {
                    var value = valuesArr_1[_a];
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        return isFilteredOut;
    };
    NotificationsPage.prototype.isPartOfSearch = function (term, stream) {
        if (!term || term == "") {
            return true;
        }
        var lowerTerm = term.toLowerCase();
        var displayName = stream.displayName ? stream.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        var fullName = stream.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    };
    NotificationsPage.prototype.showNextSearchResult = function (forward) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length - 1)) {
                    this.selectedIndex = 0;
                }
                else {
                    this.selectedIndex++;
                }
            }
            else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length - 1;
                }
                else {
                    this.selectedIndex--;
                }
            }
            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    };
    NotificationsPage.prototype.itemIsSelected = function (itemObj) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            var y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    };
    NotificationsPage.prototype.checkIfInView = function (top) {
        var windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;
            if (offset > window.innerHeight || offset < 0) {
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top - 200;
                return false;
            }
        }
        return true;
    };
    NotificationsPage.prototype.reorder = function () {
        this._reorderNotificationsModal.open(this.notifications);
    };
    NotificationsPage.prototype.limitNotifications = function () {
        this._limitNotificationsModal.open(this.notifications);
    };
    __decorate([
        core_2.ViewChild('verifyActionModal'),
        __metadata("design:type", verifyActionModal_component_1.VerifyActionModal)
    ], NotificationsPage.prototype, "verifyActionModal", void 0);
    __decorate([
        core_2.ViewChild('addNotificationModal'),
        __metadata("design:type", addNotificationModal_component_1.AddNotificationModal)
    ], NotificationsPage.prototype, "addNotificationModal", void 0);
    __decorate([
        core_2.ViewChild('reorderNotificationsModal'),
        __metadata("design:type", reorderNotificationsModal_component_1.ReorderNotificationsModal)
    ], NotificationsPage.prototype, "_reorderNotificationsModal", void 0);
    __decorate([
        core_2.ViewChild('limitNotificationsModal'),
        __metadata("design:type", limitNotificationsModal_component_1.LimitNotificationsModal)
    ], NotificationsPage.prototype, "_limitNotificationsModal", void 0);
    NotificationsPage = __decorate([
        core_1.Component({
            selector: 'notifications',
            providers: [transparentSpinner_service_1.TransparentSpinner, featureUtils_service_1.FeatureUtilsService],
            styles: [require('./notifications.scss')],
            template: require('./notifications.html'),
            animations: [
                animations_1.trigger('slideInOut', [
                    animations_1.state('in', animations_1.style({
                        transform: 'translate3d(0, 0, 0)'
                    })),
                    animations_1.state('out', animations_1.style({
                        transform: 'translate3d(100%, 0, 0)'
                    })),
                    animations_1.transition('in => out', animations_1.animate('400ms ease-in-out')),
                    animations_1.transition('out => in', animations_1.animate('400ms ease-in-out'))
                ]),
            ]
        }),
        __metadata("design:paramtypes", [airlock_service_1.AirlockService,
            global_state_1.GlobalState, strings_service_1.StringsService])
    ], NotificationsPage);
    return NotificationsPage;
}());
exports.NotificationsPage = NotificationsPage;
//# sourceMappingURL=notifications.component.js.map