import {Component, Injectable, trigger, state, transition, animate, style, ElementRef} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {GlobalState} from "../../global.state";
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {AddNotificationModal} from "../../theme/airlock.components/addNotificationModal/addNotificationModal.component";
import {AirlockNotification} from "../../model/airlockNotification";
import {AirlockNotifications} from "../../model/airlockNotifications";
import {ReorderNotificationsModal} from "../../theme/airlock.components/reorderNotificationsModal/reorderNotificationsModal.component";
import {LimitNotificationsModal} from "../../theme/airlock.components/limitNotificationsModal/limitNotificationsModal.component";

@Component({
    selector: 'notifications',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./notifications.scss')],
    template: require('./notifications.html'),
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
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
    @ViewChild('addNotificationModal')
    addNotificationModal:  AddNotificationModal;
    @ViewChild('reorderNotificationsModal')
    _reorderNotificationsModal : ReorderNotificationsModal;
    @ViewChild('limitNotificationsModal')
    _limitNotificationsModal : LimitNotificationsModal;

    notifications: AirlockNotifications;
    valid: boolean = true;
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    showDevFeatures: boolean = true;
    scrolledToSelected = false;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    openNotification: Array<string> = [];
    showConfig: boolean = false;
    loading: boolean = false;
    showDialog = false;
    searchQueryString: string = null;
    possibleUserGroupsList :Array<string> = [];
    selectedSeason: Season;

    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService) {
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions(){
        return (!this._airLockService.isViewer());
    }
    isViewer():boolean {
        return this._airLockService.isViewer();
    }


    toggleDataCollectionDetails(){
        this.showDialog = !this.showDialog;
    }
    initData(currentSeason: Season, isSeasonLatest:boolean) {

    }

    ngOnInit() {
        let isLatestStr = this._appState.getData('features.isLatestSeason');
        // let currProduct = this._appState.getData('features.currentProduct');
        let currSeason = this._appState.getData('features.currentSeason');
        this.selectedSeason = currSeason;

        console.log("got saved season!!!");
        //console.log(currSeason);
        this._appState.subscribe('features.currentSeason', 'notifications', (season) => {
            this.selectedSeason = season;
            this.onSeasonSelected(season)
        });
        // this.initData(currSeason, isLatest);
        this.onSeasonSelected(currSeason);
    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason','notifications');
    }
    onSeasonSelected(season:Season){
        if(!this._airLockService.canViewPage("notifications")){
            this.loading = false;
            this._airLockService.redirectToFeaturesPage();
            return;
        }
        this.loadNotifications()
    }

    notificationsReordered(obj:any) {
        this.loadNotifications();
    }

    loadNotifications() {
        if (this.selectedSeason) {
            let currProduct = this._appState.getData('features.currentProduct');
            this._airLockService.getUserGroups(currProduct).then(response  => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
            if (FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion,"4.5")) {
                this.valid = false;
                this.notifications = null;
                this.loading = false;
                let errorMessage = this.getString("notifications_season_not_supported");
                this._airLockService.notifyDataChanged("error-notification",errorMessage);
            } else {
                this.loading = true;
                this._airLockService.getNotifications(this.selectedSeason,).then((notifications) => {
                    // this.experiments = products;
                    this.notifications = notifications;
                    this.loading = false;
                }).catch(error => {
                    this.loading = false;
                    // alert(`Failed to update product: ${error}`)
                    this._airLockService.notifyDataChanged("error-notification",`Failed to load notifications: ${error}`);
                });;
            }

        } else {
            this.loading = false;
        }

    }
    isCellOpen(expID:string): boolean {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    }

    setShowConfig(show:boolean) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }

    }

    setShowDevFeatures(show:boolean) {
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
    public deleteFeature(feature:Feature) {

    }

    public changeStateHandler(feature:Experiment) {
        console.log('in changeFeatureState():'+this._airLockService);
        this.loading = true;
        if (feature.stage=='PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage='PRODUCTION';
        }
    }
    addNotification(){
        this.addNotificationModal.open();
    }
    updateNotifications(notification:AirlockNotification){
        this.loadNotifications();
    }
    canAddNotification(){
        return !this._airLockService.isViewer();
    }
    canLimitNotifications(){
        return this._airLockService.isProductLead() || this._airLockService.isAdministrator();
    }
    public onSearchQueryChanged(term:string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }


    notificationIsInFilter(streamID:string) {
    }


    notificationChangedStatus(notificationID:string) {
        console.log("notification changed status:"+notificationID);
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

    isFilteredOut(notification:AirlockNotification): boolean {
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

    shouldNotificationBeFilteredOut(feature:any): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase()==value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        return isFilteredOut;
    }

    isPartOfSearch(term:string, stream:any):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = stream.displayName ? stream.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = stream.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    showNextSearchResult(forward:boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length-1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length-1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    itemIsSelected(itemObj:any) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            let y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if(offset > window.innerHeight  || offset < 0){
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top-200;
                return false;
            }
        }
        return true;
    }

    reorder() {
        this._reorderNotificationsModal.open(this.notifications);
    }

    limitNotifications(){
        this._limitNotificationsModal.open(this.notifications);
    }
}

