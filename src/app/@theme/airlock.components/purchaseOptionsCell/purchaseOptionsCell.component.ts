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
import {Branch} from "../../../model/branch";
import {PurchasesPage} from "../../../pages/purchases";
import {PurchaseOptions} from "../../../model/purchaseOptions";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {EditPurchaseOptionsModal} from "../../modals/editPurchaseOptionsModal";
import {AddPurchaseConfigurationModal} from "../../modals/addPurchaseConfigurationModal";
import {AddFeatureToGroupModal} from "../../modals/addFeatureToGroupModal";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {ReorderMXGroupModal} from "../../modals/reorderMXGroupModal";
import {ImportFeaturesModal} from "../../modals/importFeaturesModal";
import {VerifyRemoveFromBranchModal} from "../../modals/verifyRemoveFromBranchModal";
import {AddFeatureModal} from "../../modals/addFeatureModal";
import {wlAttributesModal} from "../../modals/wlAttributesModal";
import {EditFeatureConfig} from "../../../model/editFeatureConfig";
import {AddPurchaseOptionModal} from "../../modals/addPurchaseOptionModal";

@Component({
    selector: 'purchase-options-cell',
    // styleUrls: ['./style.scss'],
    styleUrls: ['./purchaseOptionsCell.scss', './dnd.scss'],
    templateUrl: './purchaseOptionsCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseOptionsCell {

    @ViewChild('purchaseCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() seasonSupportAnalytics: boolean = true;
    @Input() canImportExport: boolean = true;
    @Input() feature: PurchaseOptions;
    @Input() branch: Branch;
    @Input() inlineMode: boolean;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() showConfig: boolean;
    @Input() showNotInBranch: boolean;
    @Input() showDevFeatures: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedFeatureId: string = "";
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditPOInline: EventEmitter<any> = new EventEmitter<any>();

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

    public status: { isopen: boolean } = {isopen: false};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private _purchasesPage: PurchasesPage,
                private modalService: NbDialogService,
                ) {
        this.userEmail = this._airlockService.getUserEmail();
        if (this.feature && this.feature.type == "PURCHASE_OPTIONS") {
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
                rootFeatureGroups: this._purchasesPage.purchasesRoot.entitlements,
                rootId: this._purchasesPage.rootId,
                targetBranch: this._purchasesPage.selectedBranch
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this._purchasesPage.refreshTable();
            }
        })
    }

    pasteFeature() {
        // this.importFeaturesModal.open(true, this.feature);
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

    getMXOptions() {
        return (this.feature as PurchaseOptions).purchaseOptions;
    }

    getMXTitle(): string {
        return this._stringsSrevice.getStringWithFormat("purchase_options_cell_mx_title", String(this.feature.maxFeaturesOn));
    }

    isShowCopy() {
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions() {
        if (this.feature.stage == 'PRODUCTION') {
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
        return this._airlockService.isEditor() && this.feature.stage == 'PRODUCTION' && this.branch.uniqueId.toLowerCase() != "master";
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
                return this.getString('purchase_option_cell_click_to_send_to_analytics');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('purchase_option_cell_sending_something_click_to_not_send_to_analytics');
                    } else {
                        return this.getString('purchase_option_cell_click_to_not_send_to_analytics');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('purchase_option_cell_sending_something_click_to_send_to_analytics');
                    } else {
                        return this.getString('purchase_option_cell_click_to_send_to_analytics');
                    }
                }
            }
        } else {
            //the button is disabled
            if (!this.isFeatureSendToAnalytics() && !this._isSendingExtraStuffToAnalytics()) {
                return this.getString('purchase_option_cell_click_to_send_to_analytics_disabled');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('purchase_option_cell_sending_something_click_to_not_send_to_analytics_disabled');
                    } else {
                        return this.getString('purchase_option_cell_click_to_not_send_to_analytics_disabled');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('purchase_option_cell_sending_something_click_to_send_to_analytics_disabled');
                    } else {
                        return this.getString('purchase_option_cell_click_to_send_to_analytics_disabled');
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

    public updateFeature(newFeature: PurchaseOptions) {
        PurchaseOptions.cloneToFeature(newFeature, this.feature);
        setTimeout(() => {
            this.tick = !this.tick;
            this.cd.markForCheck();
        }, 100);
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

    ngOnInit() {
        // console.log("ngOnInit:"+this.feature.name);
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck();
            }, 100);
        } else {
        }
    }

    isShowAddToBranch() {
        return !this.partOfBranch() && !this.isViewer();
    }

    isShowRemoveFromBranch() {
        return this.branch.uniqueId.toLowerCase() != "master" && this.feature && this.feature.branchStatus && this.feature.branchStatus == "CHECKED_OUT" && !this.isViewer();
    }

    isPartOfBranch(): boolean {
        return this.feature && this.feature.branchStatus && (this.feature.branchStatus == "CHECKED_OUT" || this.feature.branchStatus == "NEW");
    }

    partOfBranch() {
        return this.branch.uniqueId.toLowerCase() == "master" || this.isPartOfBranch();
    }

    isDeleted() {

    }

    addToBranch() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this._airlockService.checkoutFeature(this.branch, this.feature).then(feature => {
            this.onUpdate.emit(this.feature);
            let message = "Purchase option checked out successfully";
            if (this.feature.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
                message = "Mutual exclusion group checked out successfully";
            }
            this._airlockService.notifyDataChanged("success-notification", {title: "Success", message: message});
        }).catch(error => {
            let defErrorMessage = "Failed to check out purchase option.";
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

    isShowOptionsButton() {
        return (!this.isViewer());
    }

    isShowReorderForCell() {
        return (this.feature && this.feature.features && this.feature.features.length > 1);
    }

    reorder() {

        this.modalService.open(ReorderMXGroupModal, {
            closeOnBackdropClick: false,
            context: {
                _branch: this.branch,
                _mxGroup: PurchaseOptions.clone(this.feature),
                _configParent: null,
                isFeature: false,
                isConfig: false,
                isOrderRule: false,
                isShowMaxForOrderRule: false,
                isPurchases: false,
                isPurchaseOptions: true,
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(null);
            }
        });
        // this.reorderMXGroupModal.open(this.branch, PurchaseOptions.clone(this.feature), null, false, false, false, false, false, true);
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

    getFeatureActiveTooltip() {
        if (this.isPurchaseOptionActive()) {
            return this.getString("purchase_option_cell_active_tooltip");
        } else {
            return this.getString("purchase_option_cell_not_active_tooltip");
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
        if (this.feature.type=='PURCHASE_OPTIONS' && ((this.feature.purchaseOptions!=null && this.feature.purchaseOptions.length > 0) || this.shouldShowConfig() || this.shouldShowPurchaseOptions() || this.shouldShowOrderRules())) {
            if(!this.isOpen) {
                this.remove = false;
                this.onCellClick.emit(this.feature.uniqueId);
                setTimeout(() => {
                    this.isOpen = true;
                    this.cd.markForCheck(), 0.5});
            } else {
                // setTimeout(() => this.isOpen = false, 0.3);
                this.isOpen = false;
                this.remove = true;
                this.onCellClick.emit(this.feature.uniqueId);
            }
        } else {
            this.isOpen = false;
        }
        this.cd.markForCheck();
    }

    starClicked(event: Event, f: Feature) {
        if (event) {
            event.stopPropagation();
        }
        if (!this._airlockService.isHaveJWTToken() || this.isNewFeature())
            return;
        if (f.isCurrentUserFollower) {
            this.beforeUpdate.emit(null);
            this._purchasesPage.loading = true;
            this._airlockService.unfollowFeature(f.uniqueId)
                .then(response => {
                    f.isCurrentUserFollower = false;
                    this.onUpdate.emit(f);
                    this._purchasesPage.loading = false;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck();
                    }, 100);
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_unfollow_purchase_option_success", f.name)
                    });
                })
                .catch(error => {
                    this._purchasesPage.loading = false;
                    console.log('Error in unfollow feature');
                    let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_unfollow_purchase_option_error"));
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
        } else {
            this.beforeUpdate.emit(null);
            this._purchasesPage.loading = true;
            this._airlockService.followFeature(f.uniqueId)
                .then(response => {
                    f.isCurrentUserFollower = true;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck();
                    }, 100);
                    // this.onUpdate.emit(f);
                    this._purchasesPage.refreshTable();
                    this._purchasesPage.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_follow_purchase_option_success", f.name)
                    });
                })
                .catch(error => {
                    this._purchasesPage.loading = false;
                    console.log('Error in follow feature');
                    let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_follow_purchase_option_error"));
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
        var mxItemNames: Array<string> = ["-- Add As First --"];
        for (let item of this.feature.purchaseOptions) {
            if (item.type == 'MUTUAL_EXCLUSION_GROUP') {
                mxItemNames.push(this._featureUtils.getMXDisplayName(item));
            } else {
                mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
        this.modalService.open(AddPurchaseOptionModal, {
            closeOnBackdropClick: false,
            context: {
                title: "Add Purchase Option To Mutual Exclusion  Group",
                mxGroupToAdd: this.feature,
                parentId: this.feature.uniqueId,
                mxItemNames: mxItemNames,
            }
        }).onClose.subscribe(reload=>{
            if (reload){
                this._purchasesPage.refreshTable();
            }
        });
        // this.addFeatureModal.openInExistingXM(this.feature);
    }

    addNewFeatureToMXGroupWithCurrentFeature() {
        // this.addFeatureModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId, this.feature);
    }

    addFeatureToMXGroup() {
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
                    isPurchaseOption: true,
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this._purchasesPage.refreshTable();
                }
            })
        });
    }

    openEditDialog(event: Event, isInline: boolean = true){
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            this.onEditPOInline.emit(this.feature as PurchaseOptions);
            return;
        }

        if (this.ruleUtilitieInfo != null && this.ruleInputSchemaSample != null) {
            // this.beforeUpdate.emit(null);
            // this.hideIndicator.emit(this.feature);
            this.openEditPurchaseOptionsModal();
        } else {
            this.beforeUpdate.emit(null);
            this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
                this.ruleUtilitieInfo = result as any;
                this._airlockService.getInputSample(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result1 => {
                    this.ruleInputSchemaSample = result1 as any;
                    this.hideIndicator.emit(this.feature);
                    this.openEditPurchaseOptionsModal();
                }).catch(error => {
                    console.log('Error in getting Input Schema Sample');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
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

    openEditPurchaseOptionsModal(){
        this.modalService.open(EditPurchaseOptionsModal, {
            closeOnBackdropClick: false,
            context: {
                root: this._purchasesPage.purchasesRoot,
                rootId: this._purchasesPage.rootId,
                title: this.getString("edit_purchase_option_title"),
                branch: this.branch,
                feature: PurchaseOptions.clone(this.feature),
                parentPurchaseId: this.parentFeatureId,
                featurePath: this.featuresPath,
                ruleInputSchemaSample: this.ruleInputSchemaSample,
                ruleUtilitiesInfo: this.ruleUtilitieInfo,
                featureCell: this,
                configurationCell: null,
                showConfiguration: false,
                sourceFeature: null,
                orderCell: null,
                inAppPurchases: [],
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(null);
            }
        });
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
        // this.addFeatureModal.openAsAddSubFeature(this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace);
    }

    copyFeature() {
        this._airlockService.setCopiedPurchase(this.feature, this.branch);
    }

    exportFeature() {
        this._airlockService.downloadFeature(this.feature, this.branch);
    }

    openAddConfigurationDialog() {
        let parentName = this._featureUtils.getFeatureDisplayName(this.feature);
        this.modalService.open(AddPurchaseConfigurationModal, {
            closeOnBackdropClick: false,
            context: {
                branchId: this.branch.uniqueId,
                parentId: this.feature.uniqueId,
                isConfiguraion: true,
                isOrderRule: false,
                parentType: 'ENTITLEMENT',
                subFeatureParentName: parentName,
                title: 'Add Configuration',
                namespace: this.feature.namespace,
            }
        }).onClose.subscribe(reload=>{
            if (reload){
                this.onUpdate.emit(null);
            }
        });
    }

    openAddOrderingRuleDialog() {
        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this.feature.name, this.feature.namespace, false, true);
    }

    isNewFeature() {
        return this.partOfBranch() && this.feature.branchStatus == "NEW";
    }

    openAnalyticAttributesDialog() {
        this.beforeUpdate.emit(null);
        this._airlockService.getAnalyticsGlobalDataCollection(this.feature.seasonId, this.branch.uniqueId).then(result => {
            this.analyticData = result;
            this._airlockService.getFeatureAttributes(this.feature.uniqueId, this.branch.uniqueId).then(result1 => {
                this.featureAnalyticAttributes = result1;
                this.hideIndicator.emit(this.feature);
                this.modalService.open(wlAttributesModal, {
                    context: {
                        totalCount: this._purchasesPage.totalAnaliticsCount,
                        totalCountDev: this._purchasesPage.totalAnaliticsDevCount,
                        totalCountQuota: this._purchasesPage.totalCountQuota,
                        title: this.getString("add_attributes_to_whitelist_title"),
                        isOpen: true,
                        feature: this.feature,
                        branch: this.branch,
                        analyticData: this.analyticData,
                        featureAnalyticAttributes: this.featureAnalyticAttributes,
                    }
                })
            }).catch(error => {
                console.log('Error in getting purchase option Attributes');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get purchase option Attributes");
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
        if ((this.feature.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP' && (this.feature as PurchaseOptions).purchaseOptions.length > 1)) {
            return true;
        }

        if (this.insideMX && !this.isOpen) {
            return false;
        } else if (this.level == 0 || this.isOpen == true || (this.feature.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP' && (this.feature as PurchaseOptions).purchaseOptions.length > 1)) {
            return true;
        } else {
            return false;
        }
    }

    shouldShowConfig(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x => x == "CONFIGURATION_RULE"));
        var defaultConf = this.feature.defaultConfiguration;
        // console.log((this.feature.defaultConfiguration && this.feature.defaultConfiguration !== "{}"));
        // console.log(this.feature.defaultConfiguration);
        // // console.log(JSON.stringify(defaultConf));
        // //
        // // console.log(JSON.stringify({}));
        // // console.log(this.isEmptyObject(defaultConf));
        // console.log(defaultConf  && (JSON.stringify(defaultConf) == "{}" || defaultConf == {}));
        // // console.log(defaultConf  && Object.getOwnPropertyNames(defaultConf).length === 0);
        // if(defaultConf){
        //     console.log(defaultConf === "{}"));
        //     console.log((defaultConf === JSON.parse('{}')));
        //     console.log(JSON.stringify(defaultConf).trim());
        // }
        return (showConfig && ((this.getConfigs() && this.getConfigs().length > 0) || (this.feature.defaultConfiguration && (this.feature.defaultConfiguration !== "{}"))));
    }

    shouldShowPurchaseOptions(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x => x == "PURCHASE_OPTIONS"));
        return (showConfig && ((this.getOptions() && this.getOptions().length > 0)));
    }

    shouldShowOrderRules(): boolean {
        return false;
        // var showOrder = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="ORDERING_RULE"));
        // return (showOrder && ((this.getOrderRules() && this.getOrderRules().length > 0)));
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

        if (feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || feature.type === "PURCHASE_OPTIONS") {
            var option: PurchaseOptions = feature as PurchaseOptions;
            if (option.purchaseOptions) {
                for (var subOption of option.purchaseOptions) {
                    if (this.isPartOfSearch(term, subOption) || this.hasSubElementWithTerm(term, subOption)) {
                        return true;
                    }
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
                    this.cellClicked()
                }, 100);

            } else if (!hasSubElements && this.isOpen && this.shouldOpenCellForSearch) {
                // console.log("now we know we should close the cell:"+this.feature.name);
                this.shouldOpenCellForSearch = false;
                setTimeout(() => {
                    this.cellClicked();
                }, 100);
            }

            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.feature.uniqueId);
                }, 100);

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
        if (this.feature.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
            for (var subFeat of this.feature.purchaseOptions) {
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

    isInProduction(): boolean {
        return this.feature.stage == 'PRODUCTION';
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
        if (feature.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
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
        //now check if has children which are not being filtered out
        var subPurchaseOptions = (feature as PurchaseOptions).purchaseOptions;
        if (subPurchaseOptions != null) {
            for (var opt of subPurchaseOptions) {
                let isFiltered = this.shouldFeatureBeFilteredOut(opt as Feature);
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
        let message = "";
        if (this.feature.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this purchase option to development?';
            message += ` Enter the purchase option name to validate your decision.`;
        } else {
            message = 'Are you sure you want to release this purchase option to production?';
            message += ` This operation can impact your app in production.
        Enter the purchase option name to validate your decision.`;
        }
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                feature: this.feature,
                text: message,
                verifyModalDialogType: VerifyDialogType.PURCHASE_OPTION_TYPE,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._changeStage();
            }
        });
        this.confirmSubfeatureStageChange = false;

        if (!this.isMasterBranch() && this.feature.stage == 'PRODUCTION') {
            //raise this flag only if we are reverting to development
            //make recursive chech for purchase option stage change only if purchase option in branch
            // change global var confirmSubfeatureStageChange because of recursive func
            try {
                this.recursiveCheckStage(this.feature);
            } catch (e) {
                console.log(e);
            }
        }
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        console.log("purchase full JSON:", JSON.stringify(this.feature));
        var newStageFeature: PurchaseOptions = PurchaseOptions.clone(this.feature);
        var isRevert = false;
        var hasSubFeaturesInProd = false;
        if (newStageFeature.stage == 'PRODUCTION') {
            newStageFeature.stage = 'DEVELOPMENT';
            isRevert = true;
            if (!this.isMasterBranch()) {
                try {
                    this.recursiveUpdateStage(newStageFeature);
                } catch (e) {
                    console.log(e);
                }
            }

        } else {
            newStageFeature.stage = 'PRODUCTION';
            if (newStageFeature.minAppVersion == null || newStageFeature.minAppVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this purchase option to production because a minimum app version is not specified. Edit the purchase option to specify a minimum app version.");
                this.onUpdate.emit(this.feature);
                return;
            }
        }
        this._airlockService.updatePurchaseOptions(newStageFeature, this.branch.uniqueId).then(feature => {
            this.feature = feature;
            this.onUpdate.emit(this.feature);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Purchase option stage changed successfully"
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
        //                    this.confirmSubfeatureStageChange = true;
        // if (feature.features) {
        //     if (feature.type === "ENTITLEMENT" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
        //         console.log("FEATURE NAME:", feature.name, feature.stage);
        //         if (feature.stage === "PRODUCTION")
        //         // feature.stage = 'DEVELOPMENT';
        //             this.confirmSubfeatureStageChange = true;
        //     }
        //     for (var sub of feature.features) {
        //         this.recursiveCheckStage(sub);
        //     }
        // }
        //PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP
        if (feature instanceof PurchaseOptions || feature.type === "PURCHASE_OPTIONS" || feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
            var option = feature as PurchaseOptions;
            if (feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                console.log("FEATURE NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            if (option.purchaseOptions) {
                for (var option_sub of option.purchaseOptions) {
                    this.recursiveCheckStage(option_sub);
                }
            }
        }
        // if(feature instanceof InAppPurchase || feature.type === "ENTITLEMENT" || feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP"){
        //     if (feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
        //         console.log("FEATURE NAME:", feature.name, feature.stage);
        //         if (feature.stage === "PRODUCTION")
        //             this.confirmSubfeatureStageChange = true;
        //     }
        //     var inapppurchase = feature as InAppPurchase;
        //     if(inapppurchase.entitlements) {
        //         for (var inapppurchase_sub of inapppurchase.entitlements) {
        //             this.recursiveCheckStage(inapppurchase_sub);
        //         }
        //     }
        //     if(inapppurchase.purchaseOptions) {
        //         for (var inapppurchase_option_sub of inapppurchase.purchaseOptions) {
        //             this.recursiveCheckStage(inapppurchase_option_sub);
        //         }
        //     }
        // }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE") {
                console.log("CONFIGURATION NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION") {
                    this.confirmSubfeatureStageChange = true;
                }
            }
            for (var sub of feature.configurationRules) {
                this.recursiveCheckStage(sub);
            }
        }


    }

    recursiveUpdateStage(feature: Feature) {
        var hasSubfeatureToRevert = false;
        // if (feature.features) {
        //     if (feature.type === "ENTITLEMENT" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
        //         console.log("FEATURE NAME:", feature.name, feature.stage);
        //         if (feature.stage === "PRODUCTION")
        //             feature.stage = 'DEVELOPMENT';
        //
        //     }
        //     for (var sub of feature.features) {
        //         this.recursiveUpdateStage(sub);
        //     }
        // }
        //PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP
        if (feature instanceof PurchaseOptions || feature.type === "PURCHASE_OPTIONS" || feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
            var option = feature as PurchaseOptions;
            if (feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                console.log("FEATURE NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';

            }
            if (option.purchaseOptions) {
                for (var option_sub of option.purchaseOptions) {
                    this.recursiveUpdateStage(option_sub);
                }
            }
        }
        // if(feature instanceof InAppPurchase || feature.type === "ENTITLEMENT" || feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP"){
        //     if (feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
        //         console.log("FEATURE NAME:", feature.name, feature.stage);
        //         if (feature.stage === "PRODUCTION")
        //             feature.stage = 'DEVELOPMENT';
        //
        //     }
        //     var inapppurchase = feature as InAppPurchase;
        //     if(inapppurchase.entitlements) {
        //         for (var inapppurchase_sub of inapppurchase.entitlements) {
        //             this.recursiveUpdateStage(inapppurchase_sub);
        //         }
        //     }
        //     if(inapppurchase.purchaseOptions) {
        //         for (var inapppurchase_option_sub of inapppurchase.purchaseOptions) {
        //             this.recursiveUpdateStage(inapppurchase_option_sub);
        //         }
        //     }
        // }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE") {
                console.log("CONFIGURATION NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';
            }
            for (var sub of feature.configurationRules) {
                this.recursiveUpdateStage(sub);
            }
        }
    }

    // recursiveCheckStage(feature:Feature){
    //     if (feature.features) {
    //         if (feature.type === "PURCHASE_OPTIONS" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
    //             //console.log("FEATURE NAME:", feature.name, feature.stage);
    //             if (feature.stage === "PRODUCTION")
    //                 this.confirmSubfeatureStageChange = true;
    //         }
    //
    //         for (var sub of feature.features) {
    //             this.recursiveCheckStage(sub);
    //         }
    //     }
    //     if (feature.configurationRules) {
    //         if (feature.type === "CONFIGURATION_RULE") {
    //             //console.log("CONFIGURATION NAME:", feature.name, feature.stage );
    //             if (feature.stage === "PRODUCTION")
    //                 this.confirmSubfeatureStageChange = true;
    //         }
    //         for (var sub of feature.configurationRules) {
    //             this.recursiveCheckStage(sub);
    //         }
    //     }
    // }

    // recursiveUpdateStage(feature:Feature){
    //     var hasSubfeatureToRevert = false;
    //     if (feature.features) {
    //         if (feature.type === "PURCHASE_OPTIONS" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
    //             console.log("FEATURE NAME:", feature.name, feature.stage);
    //             if (feature.stage === "PRODUCTION")
    //                 feature.stage = 'DEVELOPMENT';
    //
    //         }
    //         for (var sub of feature.features) {
    //             this.recursiveUpdateStage(sub);
    //         }
    //     }
    //     if (feature.configurationRules) {
    //         if (feature.type === "CONFIGURATION_RULE") {
    //             console.log("CONFIGURATION NAME:", feature.name, feature.stage );
    //             if (feature.stage === "PRODUCTION")
    //                 feature.stage = 'DEVELOPMENT';
    //         }
    //         for (var sub of feature.configurationRules) {
    //             this.recursiveUpdateStage(sub);
    //         }
    //     }
    // }

    changeSendToAnalytic() {
        if (this.isFeatureSendToAnalytics()) {
            this.beforeUpdate.emit(null);
            console.log('delete purchase option from send to Analytic');
            this._airlockService.deleteFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = <PurchaseOptions>feature;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                console.log('Error in delete purchase option to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete purchase option to send to Analytic ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        } else {
            this.beforeUpdate.emit(null);
            console.log('update purchase option to send to Analytic');
            this._airlockService.updateFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature as any;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                console.log('Error in update purchase option to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);

            });
        }
    }

    getDeleteColor() {
        if (this.feature.stage == 'PRODUCTION' || this.isFeatureCheckedOut()) {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    getPurchaseOptions() {
        return (this.feature as PurchaseOptions).purchaseOptions;
        /*let feat = this.feature;
        let toRet = [];
        feat.features.forEach((feat) => {
            if (!this.isFeatureConfigRule(feat)) {
                toRet.push(feat);
            }
        });
        return toRet;*/
    }

    getSubFeatures() {
        return (this.feature as PurchaseOptions).purchaseOptions;
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

    getOptions() {
        return (this.feature as PurchaseOptions).purchaseOptions;
    }

    isFeatureConfigRule(feat: Feature): boolean {
        if (feat.type == "CONFIGURATION_RULE") {
            return true;
        } else if (feat.type == "PURCHASE_OPTIONS") {
            return false;
        } else if (feat.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" && (feat as PurchaseOptions).purchaseOptions && (feat as PurchaseOptions).purchaseOptions.length > 0) {
            let isIt = false;

            (feat as PurchaseOptions).purchaseOptions.forEach((subFeat) => {
                if (this.isFeatureConfigRule(subFeat)) {
                    isIt = true;
                }
            });
            return isIt;
        } else {
            return false;
        }
    }

    isFeatureCheckedOut(): boolean {
        return (this.branch.uniqueId.toLowerCase() != "master" && this.feature.branchStatus == "CHECKED_OUT");
    }

    hasChildren(): boolean {
        let pur = (this.feature as PurchaseOptions)
        return pur.purchaseOptions && pur.purchaseOptions.length > 0;
    }

    delete() {
        if (this.feature.stage == 'PRODUCTION' || this.isFeatureCheckedOut()) {
            return;
        }
        let message = 'Are you sure you want to delete this purchase option (' + this._featureUtils.getFeatureDisplayName(this.feature) + ")?";
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
        let featName = this._featureUtils.getFeatureDisplayName(this.feature);
        this._airlockService.deletePurchaseOptions(this.feature, this.branch.uniqueId).then(resp => {
            if (this.insideMX) {
                this._airlockService.getPurchaseOption(this.parentFeatureId, this.branch.uniqueId).then(response => {
                    console.log("deleted purchase option");
                    let mxGroup: PurchaseOptions = response as PurchaseOptions;
                    if (mxGroup.purchaseOptions == null || mxGroup.purchaseOptions.length <= 0) {
                        this._airlockService.deletePurchaseOptions(mxGroup, this.branch.uniqueId).then(re => {
                            console.log("deleted mx-group also");
                            this.onUpdate.emit(null);
                        }).catch(error => {
                            this.onUpdate.emit(error);
                        });
                    } else {
                        this.onUpdate.emit(resp);
                    }
                }).catch(error => {
                    this.onUpdate.emit(error);
                });
            } else {
                this.onUpdate.emit(resp);
                this._airlockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "The purchase option " + featName + " was deleted"
                });
            }

        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete purchase option");
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
        if (this.feature.stage == 'DEVELOPMENT' &&
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
        let message = this.isFeatureSendToAnalytics() ? this.getString('analytics_stop_report_purchase_option') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_feature_suffix') : this.getString('analytics_report_purchase_option') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_feature_suffix');
        if (this.feature.stage == 'PRODUCTION') {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    feature: this.feature,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.PURCHASE_OPTION_TYPE,
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
                if (confirmed){
                    this.changeSendToAnalytic();
                }
            });
        }
    }

    isDoubleEmptyMTX() {
        if (this.feature.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
            var pur = (this.feature as PurchaseOptions);
            if (pur.purchaseOptions.length == 1 && pur.purchaseOptions[0].type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") {
                var mtx: PurchaseOptions = pur.purchaseOptions[0];
                if (mtx.purchaseOptions.length <= 0) {
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

    isPurchaseOptionActive() {
        return this.feature.stage == 'PRODUCTION' && this.feature.enabled == true;
    }

    showEditPOInline(subFeature: PurchaseOptions) {
        
    }

    onEditConfig(event: EditFeatureConfig) {
        console.log("onEditConfig PO cell")
        this.onEditPOInline.emit(event);
    }
}
