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
import {Analytic, FeatureAnalyticAttributes} from "../../../model/analytic";
import {FeaturesPage} from "../../../pages/featuresPage/featuresPage.component";
import {Branch} from "../../../model/branch";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {EditFeatureModal} from "../../modals/editFeatureModal";
import {AddFeatureModal} from "../../modals/addFeatureModal";
import {AddConfigurationModal} from "../../modals/addConfigurationModal";
import {ReorderMXGroupModal} from "../../modals/reorderMXGroupModal/reorderMXGroupModal.component";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {AddFeatureToGroupModal} from "../../modals/addFeatureToGroupModal";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ImportFeaturesModal} from "../../modals/importFeaturesModal";
import {VerifyRemoveFromBranchModal} from "../../modals/verifyRemoveFromBranchModal";
import {wlAttributesModal} from "../../modals/wlAttributesModal";
import {EditFeatureConfig} from "../../../model/editFeatureConfig";



@Component({
    selector: 'feature-cell',
    styleUrls: ['./featureCell.scss', './dnd.scss'],
    templateUrl: './featureCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureCell {

    //@ViewChild('pwlAttributesModalDialog') wlAttributesModalDialog : wlAttributesModal;
    @ViewChild('featureCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

    @Input() seasonSupportAnalytics: boolean = true;
    @Input() canImportExport: boolean = true;
    @Input() feature: Feature;
    @Input() branch: Branch;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() showConfig: boolean;
    @Input() showNotInBranch: boolean;
    @Input() showDevFeatures: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() inlineMode: boolean;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedFeatureId: string = "";
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditInline: EventEmitter<EditFeatureConfig> = new EventEmitter<EditFeatureConfig>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    userEmail: string = "";
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    ruleInputSchemaSample: string;
    analyticData: Analytic;
    highlighted = '';
    featureAnalyticAttributes: FeatureAnalyticAttributes;
    ruleUtilitieInfo: string;
    confirmSubfeatureStageChange: boolean = false;
    private initializedOnce = false;


    public status: { isopen: boolean } = {isopen: false};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private _featuresPage: FeaturesPage,
                private modalService: NbDialogService) {
        this.userEmail = this._airlockService.getUserEmail();
        if (this.feature && this.feature.type == "FEATURE") {
            this.nextLevel = this.level + 1;
        } else {
            this.nextLevel = this.level + 1;
        }
        if (this.level == 0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
    }

    ngOnInit(){
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck();
            },0.5);
        }
    }

    importFeature() {
        this.popover.hide();
        this.modalService.open(ImportFeaturesModal, {
            closeOnBackdropClick: false,
            context: {
                isPaste : false,
                parent : this.feature,
                isOpen: true,
                isClear: true,
                isShowSuffix: false,
                isShowMinApp: false,
                loading: false,
                referenceOpen: true,
                previewOpen: false,
                rootFeatureGroups: this._featuresPage.features,
                rootId: this._featuresPage.rootId,
                targetBranch: this._featuresPage.selectedBranch
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this._featuresPage.refreshTable(reload);
            }
        });
        this._featuresPage.loading = false;
    }

    pasteFeature() {
        this.popover.hide();
        this.modalService.open(ImportFeaturesModal, {
            closeOnBackdropClick: false,
            context: {
                isPaste : true,
                parent : this.feature,
                isOpen: true,
                isClear: true,
                isShowSuffix: false,
                isShowMinApp: false,
                loading: false,
                referenceOpen: true,
                previewOpen: false,
                rootFeatureGroups: this._featuresPage.features,
                rootId: this._featuresPage.rootId,
                targetBranch: this._featuresPage.selectedBranch
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this._featuresPage.refreshTable(reload);
            }
        });
        this._featuresPage.loading = false;
    }

    isAddDevelopmentSubFeature() {
        if (this.feature == null) {
            return false;
        }
        return !this._airlockService.isViewer() && this.partOfBranch();
    }

    isShowPaste() {
        if (this.feature == null) {
            return false;
        }
        return !this._airlockService.isViewer() && (this._airlockService.getCopiedFeature() != null) && this.partOfBranch();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }

    getMXTitle(): string {

        return this._stringsSrevice.getStringWithFormat("feature_cell_mx_title", String(this.feature.maxFeaturesOn));
    }

    isShowCopy() {
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions() {
        if (this.feature?.stage == 'PRODUCTION') {
            var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false && this.partOfBranch());
        } else {
            return (!this.isViewer() && this.partOfBranch());
        }

    }

    /**
     * is user might be able to revert from production feature in branch that is not in experiment
     * the server will block if in eperiment - we in console cant know that
     * @returns {boolean}
     */
    isShowRevertFromProdToEditor() {
        return this._airlockService.isEditor() && this.feature?.stage == 'PRODUCTION' && this.branch.uniqueId.toLowerCase() != "master";
    }

    isShowReleaseToProduction() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false || this.isShowRevertFromProdToEditor()) && this.partOfBranch();
    }

    isShowSendToAnalytic() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isFeatureSendToAnalytics() {
        if (this.feature.sendToAnalytics === true)
            return true;
        else
            return false;
    }

    isSendingSomethingToAnalytics(): boolean {
        if (this.feature.sendToAnalytics === true)
            return false;
        else {
            if ((this.featureAnalyticAttributes && this.featureAnalyticAttributes.attributes.length > 0) || this._hasConfigurationsToAnalytics()) {
                return true;
            }
        }
        return false;
    }

    _isSendingExtraStuffToAnalytics(): boolean {
        if ((this.featureAnalyticAttributes && this.featureAnalyticAttributes.attributes.length > 0) || this._hasConfigurationsToAnalytics()) {
            return true;
        }
        return false;
    }

    _hasConfigurationsToAnalytics() {
        if (this.feature.configurationRules && this.feature.configurationRules.length > 0) {
            for (let configRule of this.feature.configurationRules) {
                if (this._isConfigInAnalytics(configRule)) {
                    return true;
                }
            }
        }
        return false;
    }

    getPremiumTooltip(): string {
        return this.getString('feature_cell_premium_tooltip');
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
        return !(this.isViewer()) && !(this.isEditor() && this.isInProduction()) && this.partOfBranch();
    }

    isEditor() {
        return this._airlockService.isEditor();
    }

    isShowAddToGroup() {
        return (!this.isViewer());
    }

    isShowReorder() {
        return (!this.isViewer());
    }

    isShowReorderConfig() {
        return (!this.isViewer());
    }

    public updateFeature(newFeature: Feature) {
        Feature.cloneToFeature(newFeature, this.feature);
        setTimeout(() => {
            this.tick = !this.tick;
            this.cd.markForCheck(), 0.5
        });
    }

    getParentConfiguration(): Feature {
        let parent = Feature.clone(this.feature);
        parent.type = "CONFIG_MUTUAL_EXCLUSION_GROUP";
        parent.configurationRules = this.getConfigs();
        return parent;
    }

    getParentOrderRule(): Feature {
        let parent = Feature.clone(this.feature);
        parent.type = "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP";
        parent.orderingRules = this.feature.orderingRules;
        return parent;
    }

    isShowAddConfiguration() {
        return (!this.isViewer());
    }

    isShowAddToBranch() {
        return !this.partOfBranch() && !this.isViewer();
    }

    isShowRemoveFromBranch() {
        return this.branch?.uniqueId.toLowerCase() != "master" && this.feature && this.feature.branchStatus && this.feature.branchStatus == "CHECKED_OUT" && !this.isViewer();
    }

    isPartOfBranch(): boolean {
        return this.feature && this.feature.branchStatus && (this.feature.branchStatus == "CHECKED_OUT" || this.feature.branchStatus == "NEW");
    }

    partOfBranch() {
        return this.branch?.uniqueId.toLowerCase() == "master" || this.isPartOfBranch();
    }

    isDeleted() {

    }

    addToBranch() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this._airlockService.checkoutFeature(this.branch, this.feature).then(feature => {
            this.onUpdate.emit(this.feature);
            let message = "Feature checked out successfully";
            if (this.feature.type == 'MUTUAL_EXCLUSION_GROUP') {
                message = "Mutual exclusion group checked out successfully";
            }
            this._airlockService.notifyDataChanged("success-notification", {title: "Success", message: message});
        }).catch(error => {
            let defErrorMessage = "Failed to check out feature.";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    removeFromBranch() {
        this.popover.hide();
        this.modalService.open(VerifyRemoveFromBranchModal, {
            closeOnBackdropClick: false,
            context: {
                feature: this.feature,
                branch: this.branch,
            }
        }).onClose.subscribe(applyAll => {
            this._removeFromBranch(applyAll);
        });
        this._featuresPage.loading = false;
    }

    _removeFromBranch(includeSubFeatures: boolean) {
        this.beforeUpdate.emit(null);
        this._airlockService.cancelCheckoutFeature(this.branch, this.feature, includeSubFeatures).then(feature => {
            this.onUpdate.emit(this.feature);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Successfully canceled checkout"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to cancel checkout";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    ngOnChanges() {
    }

    isShowReorderForCell() {
        return (this.feature && this.feature.features && this.feature.features.length > 1);
    }

    reorder() {
        this.popover.hide();
        this.modalService.open(ReorderMXGroupModal, {
            closeOnBackdropClick: false,
            context: {
                _branch: this.branch,
                _mxGroup: Feature.clone(this.feature),
                _configParent: null,
                isFeature: true,
                isConfig: false,
                isOrderRule: false,
                isShowMaxForOrderRule: false,
                isPurchases: false,
                isPurchaseOptions: false,
                }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(null);
            }
        });
        this._featuresPage.loading = false;
        // this.reorderMXGroupModal.open(this.branch, Feature.clone(this.feature), null, true);
    }

    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }

    }

    getFeatureFollowTooltip(isfollowed: boolean) {
        if (!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");

        if (this.isNewFeature()) {
            return this.getString("notification_cannot_follow_tooltip");
        }
        if (isfollowed) {
            return this.getString("notifications_unfollow_tooltip");
        } else {
            return this.getString("notifications_follow_tooltip");
        }
    }

    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
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
        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }

    isSelectedFeature() {
        if (this.selectedFeatureId && this.selectedFeatureId.length > 0 && this.selectedFeatureId == this.feature.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.feature.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    getConfigBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
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
        if (!this.isOpen || this.feature.features == null || this.feature.features.length <= 0) {
            return ""; //this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen || this.feature.features == null || this.feature.features.length <= 0) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            var num = Math.floor(trans * 256);
            let toRet = "rgba(" + num + "," + num + "," + num + ",1.0)";
            return toRet;
        }

    }

    getNextFeaturePath() {
        return [...this.featuresPath, this.feature];
    }

    cellClicked() {
        if (this.feature.type == 'FEATURE' && ((this.feature.features != null && this.feature.features.length > 0) || this.shouldShowConfig() || this.shouldShowOrderRules())) {
            this.onCellClick.emit(this.feature.uniqueId);
            if (!this.isOpen) {
               this.openCell();
            } else {
                // setTimeout(() => this.isOpen = false, 0.3);
                this.isOpen = false;
                this.remove = true;
            }
        } else {
            this.isOpen = false;
        }
        this.cd.markForCheck();
    }

    private openCell(){
        this.remove = false;
        setTimeout(() => {
            this.isOpen = true;
            this.cd.markForCheck()
        }, 5);
    }

    starClicked(event: Event, f: Feature) {
        if (event) {
            event.stopPropagation();
        }
        if (!this._airlockService.isHaveJWTToken() || this.isNewFeature())
            return;
        if (f.isCurrentUserFollower) {
            this.beforeUpdate.emit(null);
            this._featuresPage.loading = true;
            this._airlockService.unfollowFeature(f.uniqueId)
                .then(response => {
                    f.isCurrentUserFollower = false;
                    this.onUpdate.emit(f);
                    this._featuresPage.loading = false;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck(), 0.5
                    });
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_unfollow_feature_success", f.name)
                    });
                })
                .catch(error => {
                    this._featuresPage.loading = false;
                    console.log('Error in unfollow feature');
                    let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_unfollow_feature_error"));
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
        } else {
            this.beforeUpdate.emit(null);
            this._featuresPage.loading = true;
            this._airlockService.followFeature(f.uniqueId)
                .then(response => {
                    f.isCurrentUserFollower = true;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck(), 0.5
                    });
                    this._featuresPage.refreshTable();
                    this._featuresPage.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_follow_feature_success", f.name)
                    });
                })
                .catch(error => {
                    this._featuresPage.loading = false;
                    console.log('Error in follow feature');
                    let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_follow_feature_error"));
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
        }
    }

    transitionEnd() {
        // console.log('transitionEnd');
        if (!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }

    addNewFeatureToMXGroup() {
        this.popover.hide();
        this.modalService.open(AddFeatureModal, {
            closeOnBackdropClick: false,
            context: {
                title: "Add Subfeature",
                parentId: this.feature.uniqueId,
                subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature),
                parentNamespace: this.feature.namespace,
            }
        }).onClose.subscribe((feature) => {
            this._featuresPage.refreshTable(feature);
        })
        this._featuresPage.loading = false;
        // this.addFeatureModal.openInExistingXM(this.feature);
    }

    addNewFeatureToMXGroupWithCurrentFeature() {
        // this.addFeatureModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId, this.feature);
    }

    addFeatureToMXGroup() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this.feature.parent = this.parentFeatureId;
        this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(parent => {
            let parentFeature: Feature = parent;
            this.hideIndicator.emit(null);
            this.modalService.open(AddFeatureToGroupModal, {
                closeOnBackdropClick: false,
                context: {
                    _branch: this.branch,
                    _feature: this.feature,
                    _contextFeature: parentFeature,
                    isOrderRule: false,
                    isPurchase: false,
                    isPurchaseOption: false,
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this._featuresPage.refreshTable();
                }
            })
            this._featuresPage.loading = false;
            // this.addToMXGroupModal.open(this.branch, this.feature, parentFeature);
        });
    }

    openEditDialog(event: Event, isInline: boolean = true) {
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        let editConfig = new EditFeatureConfig(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this, null, false, null, null, null);
        this.onEditInline.emit(editConfig);
    }
    openEditDialog_old(event: Event) {
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        this.beforeUpdate.emit(null);
        this.modalService.open(EditFeatureModal, {
            closeOnBackdropClick: false,
            context: {
                originalFeature: this.feature,
                branch: this.branch,
                featurePath: this.featuresPath,
                inAppPurchases: null,
                feature: Feature.clone(this.feature),
                ruleInputSchemaSample: this.ruleInputSchemaSample,
                ruleUtilitiesInfo: this.ruleUtilitieInfo,
                featureCell: this,
                configurationCell: null,
                orderCell: null,
                sourceFeature: null,
                rootFeatuteGroups: this._featuresPage.features,
                rootId: this._featuresPage.rootId,
                root: this._featuresPage.root,
            },
        }).onClose.subscribe((value) => {
            if (value) {
                if (value == "onEditFeature") {
                    this._featuresPage.refreshTable();
                }
                if (value == "outputEventWhiteListUpdate") {
                    this._featuresPage.updateWhitelist(null);
                    this._featuresPage.refreshTable();
                }
                this._featuresPage.setEditDialog(false);

            }

        });
        this._featuresPage.setEditDialog(true);
        this._featuresPage.loading = false;
    }

    _getUtilitiesInfo(seasonId: string, stageName: string, minAppVersionName: string) {
        if (this.ruleUtilitieInfo) {
            // return new Promise((resolve, reject) => {
            //     let res:{} = this.ruleInputSchemaSample;
            //     // resolve(res);
            // });

        } else {
            return this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion);
        }
    }

    openAddDialog() {
        this.popover.hide();
        this.modalService.open(AddFeatureModal, {
            closeOnBackdropClick: false,
            context: {
                title: "Add Subfeature",
                parentId: this.feature.uniqueId,
                subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature),
                parentNamespace: this.feature.namespace,
            }
        }).onClose.subscribe((feature) => {
            this._featuresPage.refreshTable(feature, this.feature.uniqueId);
        })
        this._featuresPage.loading = false;
        // this.addFeatureModal.openAsAddSubFeature(this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace);
    }

    copyFeature() {
        this.popover.hide();
        this._airlockService.setCopiedFeature(this.feature, this.branch);
    }

    exportFeature() {
        this.popover.hide();
        this._airlockService.downloadFeature(this.feature, this.branch);
    }

    openAddConfigurationDialog() {
        this.popover.hide();
        this.modalService.open(AddConfigurationModal, {
            closeOnBackdropClick: false,
            context: {
                branchId: this.branch.uniqueId,
                parentId: this.feature.uniqueId,
                subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature),
                namespace: this.feature.namespace,
                isConfiguraion: true,
                isOrderRule: false,
                title: 'Add Configuration'
            }
        }).onClose.subscribe(feature => {
            if (feature) {
                // this.openEditId = (feature as Feature).uniqueId
                this._featuresPage.refreshTable(feature, this.feature.uniqueId);
            }
        });
        this._featuresPage.loading = false;
        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace);
    }

    openAddOrderingRuleDialog() {
        this.popover.hide();
        this.modalService.open(AddConfigurationModal, {
            closeOnBackdropClick: false,
            context: {
                branchId: this.branch.uniqueId,
                parentId: this.feature.uniqueId,
                subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature),
                namespace: this.feature.namespace,
                isConfiguraion: false,
                isOrderRule: true,
                title: 'Add Ordering Rule'
            }
        }).onClose.subscribe(feature => {
            if (feature) {
                this._featuresPage.refreshTable(feature, this.feature.uniqueId);
            }
        });
        this._featuresPage.loading = false;
        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace, false, true);
    }

    isNewFeature() {
        return this.partOfBranch() && this.feature.branchStatus == "NEW";
    }

    openAnalyticAttributesDialog() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this._airlockService.getAnalyticsGlobalDataCollection(this.feature.seasonId, this.branch.uniqueId).then(result => {
            this.analyticData = result;
            this._airlockService.getFeatureAttributes(this.feature.uniqueId, this.branch.uniqueId).then(result1 => {
                this.featureAnalyticAttributes = result1;
                this.hideIndicator.emit(this.feature);
                //[totalCount]="totalAnaliticsCount" [totalCountDev]="totalAnaliticsDevCount" [totalCountQuota]="totalCountQuota"
                this.modalService.open(wlAttributesModal, {
                    context: {
                        totalCount: this._featuresPage.totalAnaliticsCount,
                        totalCountDev: this._featuresPage.totalAnaliticsDevCount,
                        totalCountQuota: this._featuresPage.totalCountQuota,
                        title: this.getString("add_attributes_to_whitelist_title"),
                        isOpen: true,
                        feature: this.feature,
                        branch: this.branch,
                        analyticData: this.analyticData,
                        featureAnalyticAttributes: this.featureAnalyticAttributes,
                    }
                })
            }).catch(error => {
                console.log('Error in getting Feature Attributes');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Feature Attributes");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });

        }).catch(error => {
            console.log('Error in getting Input Schema Sample');
            console.log(error);
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Analytic Global Data Collection");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.hideIndicator.emit(error);
        });
    }

    shouldStyleCell() {
        if ((this.feature.type == 'MUTUAL_EXCLUSION_GROUP' && this.feature.features.length > 1)) {
            return true;
        }

        if (this.insideMX && !this.isOpen) {
            return false;
        } else if (this.level == 0 || this.isOpen == true || (this.feature.type == 'MUTUAL_EXCLUSION_GROUP' && this.feature.features.length > 1)) {
            return true;
        } else {
            return false;
        }
    }

    shouldShowConfig(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x => x == "CONFIGURATION_RULE"));
        return (showConfig && ((this.getConfigs() && this.getConfigs().length > 0) || (this.feature.defaultConfiguration && this.feature.defaultConfiguration != '{}')));
    }

    shouldShowOrderRules(): boolean {
        var showOrder = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x => x == "ORDERING_RULE"));
        return (showOrder && ((this.getOrderRules() && this.getOrderRules().length > 0)));
    }

    canShowConfig(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x => x == "CONFIGURATION_RULE"));
        return showConfig;
    }


    isPartOfSearch(term: string, feature: Feature): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    hasSubElementWithTerm(term: string, feature: Feature): boolean {
        if (!term || term == "") {
            return false;
        }
        if (feature.features) {
            for (var subFeature of feature.features) {
                if (this.isPartOfSearch(term, subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        if (feature.configurationRules && this.canShowConfig()) {
            for (var subFeature of feature.configurationRules) {
                if (this.isPartOfSearch(term, subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        if (feature.orderingRules) {
            for (var subFeature of feature.orderingRules) {
                if (this.isPartOfSearch(term, subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }

        return false;

    }

    isFilteredOut(): boolean {
        if (this.feature.name == "Detail Page Events") {
            this.feature;
        }
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldFeatureBeFilteredOut(this.feature)) {
            // console.log("feature is filtered:"+this.feature.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = this.hasSubElementWithTerm(this.searchTerm, this.feature);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.feature);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit || hasSubElements) {
            if (hasSubElements && !this.isOpen && !this.shouldOpenCellForSearch) {
                // console.log("now we know we should open the cell:"+this.feature.name);
                this.shouldOpenCellForSearch = true;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });

            } else if (!hasSubElements && this.isOpen && this.shouldOpenCellForSearch) {
                // console.log("now we know we should close the cell:"+this.feature.name);
                this.shouldOpenCellForSearch = false;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });
            }

            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.feature.uniqueId), 0.5
                });

            }

            return false;
        }
        return false; //change to true if you want to filter results out of the search
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.feature);
    }

    updateHighlight(hasHit: boolean) {
        let allText = this._featureUtils.getFeatureDisplayName(this.feature);
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
            if (this.feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (this.feature[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }

        // if this is MTX - iterate over all the features and see if someone is not filtered out
        if (this.feature.type == "MUTUAL_EXCLUSION_GROUP") {
            for (var subFeat of this.feature.features) {
                let isFiltered = this.isFeatureFilteredOut(subFeat);
                if (!isFiltered) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }


    public mySearchHit(obj: any) {
        this.onSearchHit.emit(obj);
    }

    public mySelected(obj: any) {
        this.onSelected.emit(obj);
    }

    public myEditFeature(obj: any) {
        this.onEditInline.emit(obj);
    }

    isInProduction(): boolean {
        return this.feature?.stage == 'PRODUCTION';
    }

    isFeatureFilteredOut(feature: Feature): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
    }

    shouldFeatureBeFilteredOut(feature: Feature): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        if (feature.type == 'MUTUAL_EXCLUSION_GROUP') {
            //if this is MTX - filter out unless some children are not filtered
            isFilteredOut = true;
        }
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
        //now check if has children which are not being filtered out
        if (feature.features != null) {
            for (var subFeat of feature.features) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.orderingRules != null) {
            for (var subFeat of feature.orderingRules) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        return isFilteredOut;
    }

    isSubFeature() {
        if (this.level > 0 && !this.insideMX) {
            return true;
        } else {
            return false;
        }
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

    isCellOpen(featureID: string): boolean {
        var index = this.openFeatures.indexOf(featureID, 0);
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

    changeStage() {
        this.popover.hide();
        let message = "";
        if (this.feature?.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this feature to development?';
            message += ` Enter the feature name to validate your decision.`;
        } else {
            message = 'Are you sure you want to release this feature to production?';
            message += ` This operation can impact your app in production.
        Enter the feature name to validate your decision.`;
        }
        this.confirmSubfeatureStageChange = false;

        if (!this.isMasterBranch() && this.feature?.stage == 'PRODUCTION') {
            //raise this flag only if we are reverting to development
            //make recursive chech for feature stage change only if feature in branch
            // change global var confirmSubfeatureStageChange because of recursive func
            this.recursiveCheckStage(this.feature);
        }

        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                feature: this.feature,
                text: message,
                verifyModalDialogType: VerifyDialogType.FEATURE_TYPE,
                confirmSubfeatureStageChange: this.confirmSubfeatureStageChange,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._changeStage();
            }
        });
        this._featuresPage.loading = false;
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var newStageFeature: Feature = Feature.clone(this.feature);
        var isRevert = false;
        var hasSubFeaturesInProd = false;
        if (newStageFeature.stage == 'PRODUCTION') {
            newStageFeature.stage = 'DEVELOPMENT';
            isRevert = true;
            if (!this.isMasterBranch()) {
                this.recursiveUpdateStage(newStageFeature);
            }

        } else {
            newStageFeature.stage = 'PRODUCTION';
            if (newStageFeature.minAppVersion == null || newStageFeature.minAppVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this feature to production because a minimum app version is not specified. Edit the feature to specify a minimum app version.");
                this.onUpdate.emit(null);
                return;
            }
        }
        this._airlockService.updateFeature(newStageFeature, this.branch.uniqueId).then(feature => {
            this.feature = feature;
            this.onUpdate.emit(null);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Feature stage changed successfully"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to change stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change stage. If this item has subfeatures or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    isMasterBranch(): boolean {
        return this.branch.uniqueId.toLowerCase() == "master"
    }

    isFeatureCheckedOutOrNew(feature: Feature): boolean {
        return (this.branch.uniqueId.toLowerCase() != "master" && (feature.branchStatus == "CHECKED_OUT" || feature.branchStatus == "NEW"));
    }

    recursiveCheckStage(feature: Feature) {
        if (feature.features) {
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                //console.log("FEATURE NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }

            for (var sub of feature.features) {
                this.recursiveCheckStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE" && this.isFeatureCheckedOutOrNew(feature)) {
                //console.log("CONFIGURATION NAME:", feature.name, feature.stage );
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            for (var sub of feature.configurationRules) {
                this.recursiveCheckStage(sub);
            }
        }
    }

    recursiveUpdateStage(feature: Feature) {
        var hasSubfeatureToRevert = false;
        if (feature.features) {
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';

            }
            for (var sub of feature.features) {
                this.recursiveUpdateStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE" && this.isFeatureCheckedOutOrNew(feature)) {
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';
            }
            for (var sub of feature.configurationRules) {
                this.recursiveUpdateStage(sub);
            }
        }
    }

    changeSendToAnalytic() {
        if (this.isFeatureSendToAnalytics()) {
            this.beforeUpdate.emit(null);
            this._airlockService.deleteFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature;
                this.onUpdate.emit();
            }).catch(error => {
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        } else {
            this.beforeUpdate.emit(null);
            this._airlockService.updateFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature as Feature;
                this.onUpdate.emit();
            }).catch(error => {
                console.log('Error in update feature to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);

            });
        }
    }

    getDeleteColor() {
        if (this.feature?.stage == 'PRODUCTION' || this.isFeatureCheckedOut()) {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    getSubFeatures() {
        return this.feature.features;
        /*let feat = this.feature;
        let toRet = [];
        feat.features.forEach((feat) => {
            if (!this.isFeatureConfigRule(feat)) {
                toRet.push(feat);
            }
        });
        return toRet;*/
    }

    getOrderRules() {
        return this.feature.orderingRules;
    }

    getConfigs() {
        return this.feature.configurationRules;
        /*let feat = this.feature;
        let toRet = [];
        feat.features.forEach((feat) => {
            if (this.isFeatureConfigRule(feat)) {
                toRet.push(feat);
            }
        });
        return toRet;*/
    }

    isFeatureConfigRule(feat: Feature): boolean {
        if (feat.type == "CONFIGURATION_RULE") {
            return true;
        } else if (feat.type == "FEATURE") {
            return false;
        } else if (feat.type == "MUTUAL_EXCLUSION_GROUP" && feat.features && feat.features.length > 0) {
            let isIt = false;
            feat.features.forEach((subFeat) => {
                if (this.isFeatureConfigRule(subFeat)) {
                    isIt = true;
                }
            });
            return isIt
        } else {
            return false;
        }
    }

    isFeatureCheckedOut(): boolean {
        return (this.branch.uniqueId.toLowerCase() != "master" && this.feature.branchStatus == "CHECKED_OUT");
    }

    delete() {
        this.popover.hide();
        if (this.feature?.stage == 'PRODUCTION' || this.isFeatureCheckedOut()) {
            return;
        }
        let message = 'Are you sure you want to delete this feature (' + this._featureUtils.getFeatureDisplayName(this.feature) + ")?";
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Delete"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._delete();
            }
        });
        this._featuresPage.loading = false;
    }

    _delete() {
        this.beforeUpdate.emit(null);
        let featName = this._featureUtils.getFeatureDisplayName(this.feature);
        this._airlockService.deleteFeature(this.feature, this.branch).then(resp => {
            if (this.insideMX) {
                this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(response => {
                    let mxGroup: Feature = response;
                    if (mxGroup.features == null || mxGroup.features.length <= 0) {
                        this._airlockService.deleteFeature(mxGroup, this.branch).then(re => {
                            this.onUpdate.emit(null);
                        }).catch(error => {
                            this.onUpdate.emit(error);
                        });
                    } else {
                        this.onUpdate.emit();
                    }
                }).catch(error => {
                    this.onUpdate.emit(error);
                });
            } else {
                this.onUpdate.emit();
                this._airlockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "The feature " + featName + " was deleted"
                });
            }

        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete feature");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    draggedFeature($event) {
        let feature: Feature = $event.dragData;
        //alert('dragged '+feature.name);
    }

    droppedFeature($event) {
        let feature: Feature = $event.dragData;
        alert('dropped ' + feature.name);
    }

    shouldShowUserGroups() {
        if (this.feature?.stage == 'DEVELOPMENT' &&
            !(this.feature.internalUserGroups == null || this.feature.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.feature.internalUserGroups == null || this.feature.internalUserGroups.length <= 0)) {
            // for (var userGroup of this.feature.internalUserGroups) {
            //     toRet += userGroup + "\n";
            // }
            toRet = this.feature.internalUserGroups.join(", ");
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {
        if (!this.allowAddToAnalytics()) {
            return;
        }
        let message = this.isFeatureSendToAnalytics() ? this.getString('analytics_stop_report_feature') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_feature_suffix') : this.getString('analytics_report_feature') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_feature_suffix');
        if (this.feature?.stage == 'PRODUCTION') {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    feature: this.feature,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.FEATURE_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this.changeSendToAnalytic();
                }
            });
        } else {
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    message: message,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this.changeSendToAnalytic();
                }
            });
        }
    }

    isDoubleEmptyMTX() {
        if (this.feature.type == 'MUTUAL_EXCLUSION_GROUP') {
            if (this.feature.features.length == 1 && this.feature.features[0].type == "MUTUAL_EXCLUSION_GROUP") {
                var mtx: Feature = this.feature.features[0];
                if (mtx.features.length <= 0) {
                    return true;
                }
            }
            return false;
        }
    }

    getOffset() {
        if (this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while (el && !isNaN(el.offsetTop)) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }

    hidePopover() {
        this.popover.hide();
    }
}
