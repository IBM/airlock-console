import {Component, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {AirlockNotification} from "../../model/airlockNotification";
import {AirlockNotifications} from "../../model/airlockNotifications";
import {NbDialogService} from "@nebular/theme";
import {AddNotificationModal} from "../../@theme/modals/addNotificationModal";
import {LimitNotificationsModal} from "../../@theme/modals/limitNotificationsModal";
import {ReorderNotificationsModal} from "../../@theme/modals/reorderNotificationsModal";
import {ActivatedRoute} from "@angular/router";
import {EditNotificationModal} from "../../@theme/modals/editNotificationModal";

@Component({
    selector: 'notifications',
    styleUrls: ['./notifications.scss'],
    templateUrl: './notifications.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})


export class NotificationsPage {

    @ViewChild("editInline") editInline: EditNotificationModal;
    inlineMode: boolean = false;

    notifications: AirlockNotifications;
    valid: boolean = true;
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    showDevFeatures: boolean = true;
    scrolledToSelected = false;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    openNotification: Array<string> = [];
    showConfig: boolean = false;
    loading: boolean = false;
    showDialog = false;
    searchQueryString: string = null;
    possibleUserGroupsList: Array<string> = [];
    selectedSeason: Season;

    public status: { isopen: boolean } = {isopen: false};
    private selectedBranch: any;
    private pathNotificationId: any;

    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService,
                private route: ActivatedRoute
                ) {
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions() {
        return (!this._airlockService.isViewer());
    }

    isViewer(): boolean {
        return this._airlockService.isViewer();
    }

    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest: boolean) {

    }

    ngOnInit() {
        let currSeason = this._appState.getData('features.currentSeason');
        this.onSeasonSelected(currSeason);
        this._appState.subscribe('features.currentSeason', 'notifications', (season) => {
            this.onSeasonSelected(season)
        });
        this.loading = false;
        let currBranch = this._appState.getData('features.currentBranch');
        this.selectedBranch = currBranch;
        if (this.selectedBranch) {
            this.onBranchSelection(this.selectedBranch);
        }
        this._appState.subscribe('features.currentSeason', 'features', (season) => {
            this.selectedSeason = season;
        });
        this._appState.subscribe('features.currentBranch', 'features', (branch) => {
            this.onBranchSelection(branch);
        });
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let notificationId = params.notificationId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId && notificationId) {
                console.log("going to edit mode")
                this.pathNotificationId = notificationId;
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
            } else {
                this.pathNotificationId = null;
            }
        });
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason', 'notifications');
    }

    onSeasonSelected(season: Season) {
        this.selectedSeason = season;
        if (!this._appState.canUseNotifications()) {
            this.loading = false;
            this._airlockService.redirectToFeaturesPage();
            return;
        }
        this.loadNotifications()
    }

    notificationsReordered(obj: any) {
        this.loadNotifications();
    }

    loadNotifications(notification = null) {
        if (this.selectedSeason) {
            let currProduct = this._appState.getData('features.currentProduct');
            this._airlockService.getUserGroups(currProduct).then(response => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
            if (FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion, "4.5")) {
                this.valid = false;
                this.notifications = null;
                this.loading = false;
                let errorMessage = this.getString("notifications_season_not_supported");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
            } else {
                this.loading = true;
                this._airlockService.getNotifications(this.selectedSeason).then((notifications) => {
                    // this.experiments = products;
                    this.notifications = notifications;
                    if (notification != null){
                        this.showEditInline(this.getItemWithId(notification.uniqueId),notifications.configurationSchema);
                    }
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                    // alert(`Failed to update product: ${error}`)
                    this._airlockService.notifyDataChanged("error-notification", `Failed to load notifications: ${error}`);
                });
            }

        } else {
            this.loading = false;
        }

    }

    isCellOpen(expID: string): boolean {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    }

    setShowConfig(show: boolean) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }

    }

    setShowDevFeatures(show: boolean) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        } else {
            this.filterlistDict["stage"] = ["development"];
        }

    }

    public refreshTable() {
        this.loadNotifications();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }

    public deleteFeature(feature: Feature) {

    }

    public changeStateHandler(feature: Experiment) {
        console.log('in changeFeatureState():' + this._airlockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage = 'PRODUCTION';
        }
    }

    addNotification() {
        this.modalService.open(AddNotificationModal, {
            closeOnBackdropClick: false,
            context: {
                notificationsPage: this,
                notificationTitle: null,
                title: 'Add Notification'
            }
        }).onClose.subscribe(notification=>{
            this.loadNotifications(notification);
        });
    }

    updateNotifications() {
        this.loadNotifications();
    }

    canAddNotification() {
        return !this._airlockService.isViewer();
    }

    canLimitNotifications() {
        return this._airlockService.isProductLead() || this._airlockService.isAdministrator();
    }

    public onSearchQueryChanged(term: string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    notificationIsInFilter(streamID: string) {
    }

    notificationChangedStatus(notificationID: string) {
        console.log("notification changed status:" + notificationID);
        var index = this.openNotification.indexOf(notificationID, 0);
        if (index > -1) {
            this.openNotification.splice(index, 1);
        } else {
            this.openNotification.push(notificationID);
        }
    }

    createFilteredList() {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0 && this.notifications) {
            for (var notif of this.notifications.notifications) {
                this.isFilteredOut(notif);
            }
        }
    }

    isFilteredOut(notification: AirlockNotification): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldNotificationBeFilteredOut(notification)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, notification);
        if (hasSearchHit) {
            this.filteredItems.push(notification.uniqueId);
        }
        return !hasSearchHit;
    }

    shouldNotificationBeFilteredOut(feature: any): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        return isFilteredOut;
    }

    isPartOfSearch(term: string, stream: any): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = stream.displayName ? stream.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = stream.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    showNextSearchResult(forward: boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length - 1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length - 1;
                } else {
                    this.selectedIndex--;
                }
            }
            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    itemIsSelected(itemObj: any) {
        itemObj.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    checkIfInView(top: number) {
        let windowScroll = jQuery(window).scrollTop();
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
    }

    reorder() {
        this.modalService.open(ReorderNotificationsModal, {
            closeOnBackdropClick: false,
            context: {
                _notifications: AirlockNotifications.clone(this.notifications)
            }
        }).onClose.subscribe(reload=>{
            if (reload){
                this.refreshTable();
            }
        })
        // this._reorderNotificationsModal.open(this.notifications);
    }

    limitNotifications() {
        this.modalService.open(LimitNotificationsModal, {
            closeOnBackdropClick: false,
            context: {
                _notifications: AirlockNotifications.clone(this.notifications)
            }
        })
        // this._limitNotificationsModal.open(this.notifications);
    }

    private onBranchSelection(branch: any) {
        if (this.selectedBranch != null && this.selectedSeason != null) {
            this.loading = true;
            this._airlockService.getNotifications(this.selectedSeason).then((notifications) => {
                this.notifications = notifications;
                this.loading = false;
                if (this.pathNotificationId) {
                    let pathNotification = this.getItemWithId(this.pathNotificationId);
                    if (pathNotification) {
                        this.showEditNotification(pathNotification);
                    }
                    this.pathNotificationId = null;
                }
            }).catch(error => {
                this.loading = false;
                this._airlockService.notifyDataChanged("error-notification", `Failed to load notifications: ${error}`);
            });
        } else {
            this.valid = false;
            this.notifications = null;
            this.loading = false;
        }
    }

    getItemWithId(fId: string): AirlockNotification {
        for (let notification of this.notifications.notifications) {
            if (notification.uniqueId === fId){
                return notification
            }
        }
        return null;
    }

    private showEditNotification(notification: AirlockNotification) {
        this._airlockService.getUtilitiesInfo(notification.seasonId, notification.stage, notification.minAppVersion).then(result => {
            let ruleUtilitiesInfo = result as string;
            this._airlockService.getNotificationsOutputsample(notification.seasonId).then(result1 => {
                let notificationInputSample = result1 as string;
                this._airlockService.getInputSample(notification.seasonId, notification.stage, notification.minAppVersion).then(result2 => {
                    let ruleInputSchemaSample = result2 as string;
                    // this.hideIndicator.emit(notification);
                    this.modalService.open(EditNotificationModal, {
                        closeOnBackdropClick: false,
                        context: {
                            notificationsPage: this,
                            inlineMode: false,
                            visible: true,
                            notification: AirlockNotification.clone(notification),
                            ruleUtilitiesInfo: ruleUtilitiesInfo,
                            ruleInputSchemaSample: ruleInputSchemaSample,
                            notificationInputSample: notificationInputSample,
                            schema: this.notifications.configurationSchema,
                        },
                    });
                }).catch(error => {
                    console.log('Error in getting Input Schema Sample');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    // this.hideIndicator.emit(error);
                });
            }).catch(error => {
                console.log('Error in getting notifications output sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get notifications output sample");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                // this.hideIndicator.emit(error);
            });
        });
    }

    showEditInline(notification: AirlockNotification, schema: any) {
        console.log("showEditExperimentInline");
        this.inlineMode = true;
        this.editInline.open(notification, null, null, null, schema);
    }
    closeEditInline(value) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.loading = false;
    }
}

