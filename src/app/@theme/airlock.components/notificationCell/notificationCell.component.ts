import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import {Feature} from "../../../model/feature";

import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AirlockNotification} from "../../../model/airlockNotification";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {EditNotificationModal} from "../../modals/editNotificationModal";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {Stream} from "../../../model/stream";

//Modal views
//
// import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
// import {wlAttributesModal} from "../wlAttributesModal/wlAttributesModal.component";
// import {EditNotificationModal} from "../editNotificationModal/editNotificationModal.component";

// styleUrls: ['./style.scss', './notificationCell.scss', './dnd.scss', './animations.scss'],

@Component({
    selector: 'notification-cell',
    styleUrls: ['./notificationCell.scss', './dnd.scss', './animations.scss'],
    templateUrl: './notificationCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationCell {

    @ViewChild('notificationCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() notification: AirlockNotification;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() showDevFeatures: boolean;
    // @Input() verifyActionModal: VerifyActionModal;
    @Input() shouldOpenCell: boolean;
    @Input() openExperiments: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() inlineMode: boolean;
    @Input() schema;
    // @Input() wlAttributesModalDialog: wlAttributesModal;
    // @Input() editNotificationModal: EditNotificationModal;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedId: string = "";
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDummySearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditInline: EventEmitter<AirlockNotification> = new EventEmitter<AirlockNotification>();

    ruleUtilitieInfo: string;
    ruleInputSchemaSample: string;
    notificationInputSample: string;
    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    userEmail: string = "";
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    processorInputSchemaSample: string;
    filterInputSchemaSample: string;
    highlighted = '';
    streamUtilitieInfo: string;
    public status: { isopen: boolean } = {isopen: false};


    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private modalService: NbDialogService
                ) {
        this.userEmail = this._airlockService.getUserEmail();
        this.nextLevel = this.level + 1;
        if (this.level == 0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }

    getMXTitle(): string {
        return this._stringsSrevice.getString("experiment_cell_variants_title");
    }

    isShowCopy() {
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions() {
        if (this.notification.stage == 'PRODUCTION') {
            var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false && this.partOfBranch());
        } else {
            return (!this.isViewer() && this.partOfBranch());
        }

    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.notification);
    }

    isShowReleaseToProduction() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false) && this.partOfBranch();
    }

    isShowChangeEnableState() {
        if (this.notification.stage == 'PRODUCTION') {
            var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false && this.partOfBranch());
        } else {
            return (!this.isViewer() && this.partOfBranch());
        }
    }

    isShowSendToAnalytic() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isFeatureSendToAnalytics() {
        // if (this.variant.sendToAnalytics === true)
        //     return true;
        // else
        return false;
    }

    isNotification(): boolean {
        return true;
    }

    showExpand(): boolean {
        return true;
    }

    shouldStyleAsMTX(): boolean {
        return false;
    }

    isSendingSomethingToAnalytics(): boolean {
        return false;
    }

    _isSendingExtraStuffToAnalytics(): boolean {
        return false;
    }

    _hasConfigurationsToAnalytics() {
        // if (this.variant.configurationRules && this.variant.configurationRules.length > 0) {
        //     for (let configRule of this.variant.configurationRules) {
        //            if (this._isConfigInAnalytics(configRule)) {
        //                return true;
        //            }
        //     }
        // }
        return false;
    }

    getSendToAnalyticsTooltip(): string {
        if (this.allowAddToAnalytics()) {
            if (!this.isFeatureSendToAnalytics() && !this._isSendingExtraStuffToAnalytics()) {
                return this.getString('feature_cell_click_to_send_to_analytics');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_not_send_to_analytics');
                    } else {
                        return this.getString('feature_cell_click_to_not_send_to_analytics');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_send_to_analytics');
                    } else {
                        return this.getString('feature_cell_click_to_send_to_analytics');
                    }
                }
            }
        } else {
            //the button is disabled
            if (!this.isFeatureSendToAnalytics() && !this._isSendingExtraStuffToAnalytics()) {
                return this.getString('feature_cell_click_to_send_to_analytics_disabled');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_not_send_to_analytics_disabled');
                    } else {
                        return this.getString('feature_cell_click_to_not_send_to_analytics_disabled');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_send_to_analytics_disabled');
                    } else {
                        return this.getString('feature_cell_click_to_send_to_analytics_disabled');
                    }
                }
            }
        }

    }

    _isConfigInAnalytics(configRule: Feature): boolean {
        if (configRule.sendToAnalytics) {
            return true;
        }
        for (let subConf of configRule.configurationRules) {
            if (this._isConfigInAnalytics(subConf)) {
                return true;
            }
        }
        return false;
    }

    analyticsTooltip(): string {
        return "Status being sent to analytics";
    }

    isViewer() {
        return this._airlockService.isViewer();
    }

    allowAddToAnalytics() {
        return !(this.isViewer()) && !(this.isEditor() && this.isInProduction());
    }

    isEditor() {
        return this._airlockService.isEditor();
    }

    isShowAddToGroup() {
        return (!this.isViewer());
    }

    isShowAddVariant() {
        return (!this.isViewer() && !(this.isEditor() && this.isInProduction()))
    }

    isShowReorder() {
        return (!this.isViewer());
    }

    isShowReorderConfig() {
        return (!this.isViewer());
    }

    public updateFeature(newFeature: Feature) {
        // console.log("updateFeature");
        // console.log(newFeature);
        // Feature.cloneToFeature(newFeature,this.variant);
        // setTimeout(() => {
        //     this.tick = !this.tick;
        //     this.cd.markForCheck(), 0.5
        // });
    }

    getParentConfiguration(): Feature {
        // let parent = Feature.clone(this.variant)
        // parent.type = "CONFIG_MUTUAL_EXCLUSION_GROUP";
        // parent.configurationRules = this.getConfigs();
        // return parent;
        return null;
    }

    isShowAddConfiguration() {
        return (!this.isViewer());
    }

    ngOnInit() {
        // console.log("ngOnInit:"+this.variant.name);
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
        }
    }

    isShowAddToBranch() {
        return !this.partOfBranch();
    }

    isPartOfBranch(): boolean {
        return true; //this.variant && this.variant.branchStatus && (this.variant.branchStatus=="CHECKED_OUT" || this.variant.branchStatus=="NEW");
    }

    partOfBranch() {
        return true;
    }

    isDeleted() {

    }

    addToBranch() {

    }

    removeFromBranch() {

    }

    ngOnChanges() {
    }

    reorder() {
    }

    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }
    }

    getMasterTooltip(): string {
        return this.getString('experiment_cell_master_variant')
    }

    getFeatureFollowTooltip(isfollowed: boolean) {
        if (!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if (isfollowed) {
            return this.getString("notifications_unfollow_tooltip");
        } else {
            return this.getString("notifications_follow_tooltip");
        }
    }

    getBackgroundStyle() {
        var level = this.level;
        var trans = level * 0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256," + opac + ")";
        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133," + startPoint + ")";
            } else {
                toRet = "rgba(237, 245, 197," + startPoint + ")";
            }

        }
        return toRet;
    }

    public mySelected(obj: any) {
        this.onSelected.emit(obj);
    }

    getMasterBackgroundStyle() {
        var level = this.level + 1;
        var trans = level * 0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256," + opac + ")";
        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }

    getConfigBackgroundStyle() {
        var level = this.level;
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(210,210,210," + opac + ")";
        return toRet;
    }

    getIdentBackground() {
        var trans = this.level * 0.1;
        let toRet = "rgba(0,0,0," + trans + ")";
        return toRet;
    }

    getCellWidth(cell: number) {
        var identWidth = this.level * 2;
        if (cell == 0) {
            return identWidth + "%";
        } else if (cell == 3) {
            //return (30-identWidth)+"%";
            return "30%";
        } else {
            return "";
        }
    }

    getColorStyle() {
        var trans = this.level * 0.15;
        var num = Math.floor(trans * 256);
        var num1 = Math.floor(this.level * 0.4 * 256);
        var num2 = Math.floor(this.level * 0.3 * 256);
        let toRet = "rgba(" + num + "," + num1 + "," + num2 + ",1.0)";
        let constRet = "rgba(0,0,0,1,0)"
        return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen) {
            return this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            var num = Math.floor(trans * 256);
            let toRet = "rgba(" + num + "," + num + "," + num + ",1.0)";
            return toRet;
        }

    }

    cellClicked() {
        if (!this.isOpen) {
            this.remove = false;
            this.onCellClick.emit(this.notification.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
            // setTimeout(() => this.isOpen = false, 0.3);
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.notification.uniqueId);
        }
        this.cd.markForCheck();

    }

    transitionEnd() {
        // console.log('transitionEnd');
        if (!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }

    openEditDialog(event: Event, isInline: boolean = true){
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            this.onEditInline.emit(this.notification);
            return;
        }

        this.beforeUpdate.emit(null);
        if (this.ruleUtilitieInfo != null && this.ruleInputSchemaSample != null) {
            setTimeout(function (_that) {
                this.hideIndicator.emit(this.notification);
                // this.editNotificationModal.open(this.notification, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this.notificationInputSample, this.schema);
                this.modalService.open(EditNotificationModal, {
                        closeOnBackdropClick: false,
                        context: {
                            notification: AirlockNotification.clone(this.notification),
                            ruleUtilitiesInfo: this.ruleUtilitieInfo,
                            ruleInputSchemaSample: this.ruleInputSchemaSample,
                            notificationInputSample: this.notificationInputSample,
                            schema: this.schema,
                        },
                }).onClose.subscribe(reload => {
                    if (reload) {
                        this.onUpdate.emit(null);
                    }
                });
            }.bind(this), 0.5);
        } else {
            this._airlockService.getUtilitiesInfo(this.notification.seasonId, this.notification.stage, this.notification.minAppVersion).then(result => {
                this.ruleUtilitieInfo = result as string;
                this._airlockService.getNotificationsOutputsample(this.notification.seasonId).then(result1 => {
                    this.notificationInputSample = result1 as string;
                    this._airlockService.getInputSample(this.notification.seasonId, this.notification.stage, this.notification.minAppVersion).then(result2 => {
                        this.ruleInputSchemaSample = result2 as string;
                        this.hideIndicator.emit(this.notification);
                        this.modalService.open(EditNotificationModal, {
                                closeOnBackdropClick: false,
                                context: {
                                    notification: AirlockNotification.clone(this.notification),
                                    ruleUtilitiesInfo: this.ruleUtilitieInfo,
                                    ruleInputSchemaSample: this.ruleInputSchemaSample,
                                    notificationInputSample: this.notificationInputSample,
                                    schema: this.schema,
                                },
                        }).onClose.subscribe(reload => {
                            if (reload) {
                                this.onUpdate.emit(null);
                            }
                        });
                    }).catch(error => {
                        console.log('Error in getting Input Schema Sample');
                        let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
                        this._airlockService.notifyDataChanged("error-notification", errorMessage);
                        this.hideIndicator.emit(error);
                    });
                }).catch(error => {
                    console.log('Error in getting notifications output sample');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get notifications output sampleZ");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Utilitystring");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        }
    }

    shouldStyleCell() {
        // if ((this.variant.type=='MUTUAL_EXCLUSION_GROUP' && this.variant.features.length > 1)) {
        //     return true;
        // }

        // if (this.insideMX && !this.isOpen) {
        //     return false;
        // }
        // else if (this.level==0 || this.isOpen==true || (this.variant.type=='MUTUAL_EXCLUSION_GROUP' && this.variant.features.length > 1)) {
        //     return true;
        // } else {
        //     return false;
        // }
        return true;
    }

    shouldShowConfig(): boolean {
        // var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="CONFIGURATION_RULE"));
        // return (showConfig && ((this.getConfigs() && this.getConfigs().length > 0) || (this.variant.defaultConfiguration && this.variant.defaultConfiguration != {})));
        return true;
    }


    isPartOfSearch(term: string, notification: AirlockNotification): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this.notification.displayName ? this.notification.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this.notification.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }


    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            // console.log("variant is filtered:"+this.variant.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = false; //this.hasSubElementWithTerm(this.searchTerm, this.s);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.notification);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit || hasSubElements) {
            if (hasSubElements && !this.isOpen && !this.shouldOpenCellForSearch) {
                // console.log("now we know we should open the cell:"+this.variant.name);
                this.shouldOpenCellForSearch = true;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });

            } else if (!hasSubElements && this.isOpen && this.shouldOpenCellForSearch) {
                // console.log("now we know we should close the cell:"+this.variant.name);
                this.shouldOpenCellForSearch = false;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });
            }

            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.notification.uniqueId), 0.5
                });

            }

            return false;
        }
        return false;
    }

    getDisplayName(notification: AirlockNotification): string {
        if (this.notification.displayName && this.notification.displayName.length > 0) {
            return this.notification.displayName;
        }
        return this.notification.name;
    }

    updateHighlight(hasHit: boolean) {
        let allText = this.getDisplayName(this.notification);
        if (!allText || allText.length <= 0) {
            return;
        }
        this.highlighted = hasHit
            ? allText.replace(new RegExp('(' + this.searchTerm + ')', 'ig'),
                '<span class=highlight>$1</span>')
            : allText;
    }

    _isFilteredOut(): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (this.notification[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (this.notification[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    public mySearchHit(obj: any) {
        this.onSearchHit.emit(obj);
    }

    public myDummySearchHit(obj: any) {
        this.onDummySearchHit.emit(obj);
    }

    isInProduction(): boolean {
        return this.notification.stage == 'PRODUCTION';
    }

    isSubFeature() {
        return false;
    }

    shouldNotStyleCell() {
        return !this.shouldStyleCell();
    }

    public myBeforeUpdate(obj: any) {
        this.beforeUpdate.emit(obj);
    }

    public myFeatureChangedStatus(obj: string) {
        this.onCellClick.emit(obj);
    }

    isCellOpen(expID: string): boolean {
        var index = this.openExperiments.indexOf(expID, 0);
        if (index > -1) {
            return true;
        } else {
            return false;
        }
    }

    public myOnUpdate(obj: any) {
        this.onUpdate.emit(obj);
    }

    public myHideIndicator(obj: any) {
        this.hideIndicator.emit(obj);
    }

    changeEnableState() {
        let message = "";
        if (this.notification.enabled == true) {
            message = this.getStringWithFormat('stream_cell_disable_message', this.notification.name);
        } else {
            message = this.getStringWithFormat('stream_cell_enable_message', this.notification.name);
        }
        if (this.notification.stage == 'PRODUCTION') {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    notification: this.notification,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.NOTIFICATION_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._changeEnableState();
                }
            });
        } else {
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    message: message,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed){
                    this._changeEnableState();
                }
            });
        }
    }

    _changeEnableState() {
        this.beforeUpdate.emit(null);
        var action = "enable";
        if (this.notification.enabled == true) {
            this.notification.enabled = false;
            action = "disable";
        } else {
            this.notification.enabled = true;
        }

        this._airlockService.updateNotification(this.notification).then(notification => {
            this.notification = notification;
            this.onUpdate.emit(this.notification);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Notification " + action + "d successfully"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to " + action + " stream. Please try again.";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    changeStage() {
        this.popover.hide();
        let message = "";
        if (this.notification.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this notification to development?';
        } else {
            message = 'Are you sure you want to release this notification to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the notification name to validate your decision.`;
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                notification: this.notification,
                text: message,
                verifyModalDialogType: VerifyDialogType.NOTIFICATION_TYPE,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._changeStage();
            }
        });
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var isRevert = false;
        if (this.notification.stage == 'PRODUCTION') {
            this.notification.stage = 'DEVELOPMENT';
            isRevert = true;
        } else {
            this.notification.stage = 'PRODUCTION';
            if (this.notification.minAppVersion == null || this.notification.minAppVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this notification to production because a minimum app version is not specified. Edit the notification to specify a minimum app version.");
                this.onUpdate.emit(this.notification);
                return;
            }
        }

        this._airlockService.updateNotification(this.notification).then(notification => {
            this.notification = notification;
            this.onUpdate.emit(this.notification);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Notification stage changed successfully"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to change notification stage. Please try again.";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    getDeleteColor() {
        if (this.notification.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }


    delete() {
        this.popover.hide();
        if (this.notification.stage == 'PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this notification (' + this.getDisplayName(this.notification) + ")?";
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Delete"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._delete();
            }
        });
    }

    _delete() {
        this.beforeUpdate.emit(null);
        this._airlockService.deleteNotification(this.notification.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "The notification " + this.getDisplayName(this.notification) + " was deleted"
            });
        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete notification");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldShowUserGroups() {
        if (this.notification.stage == 'DEVELOPMENT' &&
            !(this.notification.internalUserGroups == null || this.notification.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.notification.internalUserGroups == null || this.notification.internalUserGroups.length <= 0)) {
            toRet = this.notification.internalUserGroups.join(", ");
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {

    }

    isNotificationRunning() {
        return this.notification.stage == "PRODUCTION" && this.notification.enabled && this.notification.rolloutPercentage > 0;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.notification.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.notification.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    getOffset() {
        if (this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }

    isSelectedFeature() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.notification.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.notification.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }
}
