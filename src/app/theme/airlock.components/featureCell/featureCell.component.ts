
import {
    Component, Injectable, Input, EventEmitter, Output, ViewChild, ChangeDetectionStrategy,
    ChangeDetectorRef, ElementRef
} from '@angular/core';
import {Feature} from "../../../model/feature";
import {EditFeatureModal} from "../editFeatureModal/editFeatureModal.component";
import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";

import {AirlockService} from "../../../services/airlock.service";
import {AddFeatureModal} from "../addFeatureModal/addFeatureModal.component";
import {ReorderMXGroupModal} from "../reorderMXGroupModal/reorderMXGroupModal.component";
import {AddFeatureToGroupModal} from "../addFeatureToGroupModal/addFeatureToGroupModal.component";
import {AuthorizationService} from "../../../services/authorization.service";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AddConfigurationModal} from "../addConfigurationModal/addConfigurationModal.component";
import {Observable} from "rxjs";
import {Analytic,FeatureAnalyticAttributes} from "../../../model/analytic";
//import {FeatureAttributes} from "../../../model/feature-attributes";
import {wlAttributesModal} from "../wlAttributesModal/wlAttributesModal.component";
import {FeaturesPage} from "../../../pages/featuresPage/featuresPage.component";
import {ImportFeaturesModal} from "../importFeaturesModal/importFeaturesModal.component";
import {Branch} from "../../../model/branch";
import {VerifyRemoveFromBranchModal} from "../verifyRemoveFromBranchModal/verifyRemoveFromBranchModal.component";
import {InAppPurchase} from "../../../model/inAppPurchase";

@Component({
    providers: [FeatureUtilsService],
    selector: 'feature-cell',
    styles: [require('./style.scss'),require('./featureCell.scss'),require('./dnd.scss')],
    // directives: [UiSwitchComponent, FeatureCell, ConfigurationCell,COMMON_DIRECTIVES, DND_DIRECTIVES,PROGRESSBAR_DIRECTIVES, CORE_DIRECTIVES
    //     ,DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, AlertComponent,EditFeatureModal,AddFeatureModal,ProgressbarComponent, AddFeatureToGroupModal, VerifyActionModal],
    template: require('./featureCell.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureCell {

    // @ViewChild('verifyActionModal')
    // verifyActionModal:  VerifyActionModal;
    //@ViewChild('pwlAttributesModalDialog') wlAttributesModalDialog : wlAttributesModal;
    @ViewChild('featureCell') _selector:any;

    @Input() seasonSupportAnalytics:boolean = true;
    @Input() canImportExport:boolean = true;
    @Input() feature:Feature;
    @Input() branch:Branch;
    @Input() parentFeatureId:string;
    @Input() contextFeatureId:string;
    @Input() level: number = 0;
    @Input() editFeatureModal:EditFeatureModal;
    @Input() addFeatureModal:AddFeatureModal;
    @Input() addConfigurationModal:AddConfigurationModal;
    @Input() reorderMXGroupModal:ReorderMXGroupModal;
    @Input() addToMXGroupModal:AddFeatureToGroupModal;
    @Input() importFeaturesModal:ImportFeaturesModal;
    @Input() insideMX: boolean;
    @Input() showConfig: boolean;
    @Input() showNotInBranch: boolean;
    @Input() showDevFeatures: boolean;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() verifyRemoveFromBranchModal: VerifyRemoveFromBranchModal;
    @Input() shouldOpenCell: boolean;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: {string: Array<string>} = null;
    @Input() wlAttributesModalDialog:wlAttributesModal;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedFeatureId: string = "";
    @Output() onUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() hideIndicator:EventEmitter<any>= new EventEmitter<any>();
    @Output() beforeUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() onCellClick:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSearchHit:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSelected:EventEmitter<any>= new EventEmitter<any>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean=false;
    remove: boolean=true;
    userEmail:string="";
    lastSearchTerm:string="";
    shouldOpenCellForSearch:boolean = false;
    ruleInputSchemaSample : string;
    analyticData : Analytic;
    highlighted = '';
    featureAnalyticAttributes : FeatureAnalyticAttributes;
    ruleUtilitieInfo: string;
    confirmSubfeatureStageChange: boolean = false;
    staticMode:boolean = false;

    public status: {isopen: boolean} = {isopen: false};

    constructor(private _airlockService:AirlockService,private authorizationService:AuthorizationService
    , public modal: Modal, private _stringsSrevice: StringsService, private cd: ChangeDetectorRef, private _featureUtils:FeatureUtilsService,private _featuresPage:FeaturesPage) {
        this.userEmail = this._airlockService.getUserEmail();
        if (this.feature && this.feature.type=="FEATURE") {
            this.nextLevel = this.level + 1;
        } else {
            this.nextLevel = this.level + 1;
        }
        if (this.level==0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
        this.staticMode = this._airlockService.isStaticMode();

    }
    importFeature(){
        this.importFeaturesModal.open(false,this.feature);
    }
    pasteFeature(){
        this.importFeaturesModal.open(true,this.feature);
    }
    isAddDevelopmentSubFeature(){
        if(this.feature == null){
            return false;
        }
        return !this._airlockService.isViewer() && this.partOfBranch();
    }
    isShowPaste(){
        if(this.feature == null){
            return false;
        }
        return !this._airlockService.isViewer() && (this._airlockService.getCopiedFeature() != null) && this.partOfBranch();
    }
    
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format:string[]) {
        return this._stringsSrevice.getStringWithFormat(name,...format);
    }

    getMXTitle() : string {

        return this._stringsSrevice.getStringWithFormat("feature_cell_mx_title", String(this.feature.maxFeaturesOn));
    }

    isShowCopy(){
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions(){
        if (this.feature.stage=='PRODUCTION') {
            var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false && this.partOfBranch());
        }else{
            return (!this.isViewer() && this.partOfBranch());
        }

    }

    /**
     * is user might be able to revert from production feature in branch that is not in experiment
     * the server will block if in eperiment - we in console cant know that
     * @returns {boolean}
     */
    isShowRevertFromProdToEditor(){
        return this._airlockService.isEditor() && this.feature.stage == 'PRODUCTION' && this.branch.uniqueId.toLowerCase()!="master";
    }
    isShowReleaseToProduction(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false || this.isShowRevertFromProdToEditor()) && this.partOfBranch();
    }
    isShowSendToAnalytic(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }
    isFeatureSendToAnalytics(){
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

    _isSendingExtraStuffToAnalytics():boolean {
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
            }else {
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
            }else {
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

    _isConfigInAnalytics(configRule:Feature) : boolean {
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
    isViewer(){
        return this._airlockService.isViewer();
    }

    allowAddToAnalytics() {
        return !(this.isViewer()) && !(this.isEditor() && this.isInProduction()) && this.partOfBranch();
    }
    isEditor(){
        return this._airlockService.isEditor();
    }
    isShowAddToGroup(){
        return (!this.isViewer());
    }
    isShowReorder(){
        return (!this.isViewer());
    }

    isShowReorderConfig(){
        return (!this.isViewer());
    }
    public updateFeature(newFeature:Feature){
        console.log("updateFeature");
        console.log(newFeature);
        Feature.cloneToFeature(newFeature,this.feature);
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
        console.log("getParentOrderRule");
        console.log(parent);
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
                this.cd.markForCheck(), 0.5});
        } else {
        }
    }

    isShowAddToBranch() {
        return !this.partOfBranch() && !this.isViewer();
    }

    isShowRemoveFromBranch() {
        return this.branch.uniqueId.toLowerCase()!="master" && this.feature && this.feature.branchStatus && this.feature.branchStatus=="CHECKED_OUT" && !this.isViewer();
    }

    isPartOfBranch():boolean {
        return this.feature && this.feature.branchStatus && (this.feature.branchStatus=="CHECKED_OUT" || this.feature.branchStatus=="NEW");
    }
    partOfBranch() {
        return this.branch.uniqueId.toLowerCase()=="master" || this.isPartOfBranch();
    }

    isDeleted() {

    }
    addToBranch() {
        this.beforeUpdate.emit(null);
        this._airlockService.checkoutFeature(this.branch, this.feature).then(feature => {
            this.onUpdate.emit(this.feature);
            let message = "Feature checked out successfully";
            if (this.feature.type=='MUTUAL_EXCLUSION_GROUP') {
                message = "Mutual exclusion group checked out successfully";
            }
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:message});
        }).catch(error => {
            let defErrorMessage = "Failed to check out feature.";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }

    removeFromBranch() {
        this.verifyRemoveFromBranchModal.actionApproved$.subscribe(
            applyAll => {
                this._removeFromBranch(applyAll);
            });
        this.verifyRemoveFromBranchModal.open(this.feature, this.branch);
    }
    _removeFromBranch(includeSubFeatures:boolean) {
        this.beforeUpdate.emit(null);
        this._airlockService.cancelCheckoutFeature(this.branch, this.feature, includeSubFeatures).then(feature => {
            this.onUpdate.emit(this.feature);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Successfully canceled checkout"});
        }).catch(error => {
            let defErrorMessage = "Failed to cancel checkout";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }
    ngOnChanges() {
    }
    isShowReorderForCell(){
        return (this.feature && this.feature.features && this.feature.features.length > 1);
    }
    reorder() {
        this.reorderMXGroupModal.open(this.branch, Feature.clone(this.feature),null,true);
    }
    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }

    }

    getFeatureFollowTooltip(isfollowed: boolean){
        if(!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");

        if (this.isNewFeature()) {
            return this.getString("notification_cannot_follow_tooltip");
        }
        if(isfollowed){
           return this.getString("notifications_unfollow_tooltip");
        }
        else{
            return this.getString("notifications_follow_tooltip");
        }
    }

    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level*0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256,"+opac+")";

        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133,"+startPoint+")";
            } else {
                toRet = "rgba(237, 245, 197,"+startPoint+")";
            }

        }
        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }

    isSelectedFeature() {
        if (this.selectedFeatureId && this.selectedFeatureId.length > 0 && this.selectedFeatureId==this.feature.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event":event, "id":this.feature.uniqueId, "offset":y })
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
        var trans = level*0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(210,210,210,"+opac+")";
        return toRet;
    }

    getIdentBackground() {
        var trans = this.level*0.1;
        let toRet = "rgba(0,0,0,"+trans+")";
        return toRet;
    }
    getCellWidth(cell:number) {
        var identWidth = this.level*2;
        if(cell==0) {
            return identWidth+"%";
        } else if(cell==3) {
            //return (30-identWidth)+"%";
            return "30%";
        } else {
            return "";
        }
    }
    getColorStyle() {
        var trans = this.level*0.15;
        var num = Math.floor(trans*256);
        var num1 = Math.floor(this.level*0.4*256);
        var num2 = Math.floor(this.level*0.3*256);
        let toRet = "rgba("+num+","+num1+","+num2+",1.0)";
        let constRet = "rgba(0,0,0,1,0)"
        return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen || this.feature.features==null || this.feature.features.length <=0) {
            return "";//this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel*0.1;
            let toRet = "rgba(0,0,0,"+trans+")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen || this.feature.features==null || this.feature.features.length <=0) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel*0.1;
            var num = Math.floor(trans*256);
            let toRet = "rgba("+num+","+num+","+num+",1.0)";
            return toRet;
        }

    }

    getNextFeaturePath() {
        return [...this.featuresPath,this.feature];
    }

    cellClicked() {
        if (this.feature.type=='FEATURE' && ((this.feature.features!=null && this.feature.features.length > 0) || this.shouldShowConfig() || this.shouldShowOrderRules())) {
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

    starClicked(event, f: Feature){
        console.log("star-clicked");
        if(event) {
            event.stopPropagation();
        }
        if(!this._airlockService.isHaveJWTToken() || this.isNewFeature())
            return;
        if (f.isCurrentUserFollower){
            this.beforeUpdate.emit(null);
            this._featuresPage.loading = true;
            this._airlockService.unfollowFeature(f.uniqueId)
                .then(response  => {
                    console.log(response);
                    f.isCurrentUserFollower = false;
                    this.onUpdate.emit(f);
                    this._featuresPage.loading = false;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck(), 0.5
                    });
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_unfollow_feature_success",f.name)});
                })
                .catch(error => {
                    this._featuresPage.loading = false;
                    console.log('Error in unfollow feature');
                    let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_unfollow_feature_error"));
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
        }
        else{
            this.beforeUpdate.emit(null);
            this._featuresPage.loading = true;
            this._airlockService.followFeature(f.uniqueId)
                .then(response  => {
                    console.log(response);
                    f.isCurrentUserFollower = true;
                    setTimeout(() => {
                        this.tick = !this.tick;
                        this.cd.markForCheck(), 0.5
                    });
                    this.onUpdate.emit(f);
                    this._featuresPage.loading = false;
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_follow_feature_success",f.name)});
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
        if(!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }
    addNewFeatureToMXGroup(){
        console.log("add to MX Group");
        this.addFeatureModal.openInExistingXM(this.feature);
}
    addNewFeatureToMXGroupWithCurrentFeature(){
        this.addFeatureModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId,this.feature);
    }

    addFeatureToMXGroup() {
        this.beforeUpdate.emit(null);
        this.feature.parent = this.parentFeatureId;
        this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(parent => {
            let parentFeature: Feature = parent;
            this.hideIndicator.emit(null);
            this.addToMXGroupModal.open(this.branch, this.feature, parentFeature);
        });

    }

    openEditDialog(event){
        if(event) {
            event.stopPropagation();
        }

        console.log('season id:');
        console.log(this.feature.seasonId);
        console.log('stage:' + this.feature.stage);
        console.log('min app version:' + this.feature.minAppVersion);

        if (this.ruleUtilitieInfo!=null && this.ruleInputSchemaSample!= null) {
            console.log("SKIPPING utilities and inputSchema");
            this.beforeUpdate.emit(null);
            this._airlockService.getInAppPurchases(this.branch.seasonId, this.branch).then(purchasesResult => {
                this.hideIndicator.emit(this.feature);
                let purchases: InAppPurchase[] = purchasesResult.entitlements;
                this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this as FeatureCell,null,false,null, null, purchases);
            }).catch(error => {
                // console.log('Error in getting InAppPurchases');
                // let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Purchases ");
                // this._airlockService.notifyDataChanged("error-notification",errorMessage);
                // this.hideIndicator.emit(error);
                this.hideIndicator.emit(this.feature);
                // let purchases: InAppPurchase[] = purchasesResult.entitlements;
                this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this as FeatureCell,null,false,null, null, null);

            });

        }
        else {
            console.log("RETRIEVING utilities and inputSchema");
            console.log(this.ruleUtilitieInfo);
            console.log(this.ruleInputSchemaSample);
            this.beforeUpdate.emit(null);
            this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
                this.ruleUtilitieInfo = result;
                console.log('UtilityInfo:');
                console.log(this.ruleUtilitieInfo);
                this._airlockService.getInputSample(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
                    this.ruleInputSchemaSample = result;
                    console.log('Input Schema Sample');
                    console.log(this.ruleInputSchemaSample);
                    this._airlockService.getInAppPurchases(this.branch.seasonId, this.branch).then(purchasesResult => {
                        this.hideIndicator.emit(this.feature);
                        let purchases: InAppPurchase[] = purchasesResult.entitlements;
                        this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this,null, false, null, null, purchases);
                    }).catch(error => {
                        console.log('Error in getting InAppPurchases');
                        // let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Purchases ");
                        // this._airlockService.notifyDataChanged("error-notification",errorMessage);
                        // this.hideIndicator.emit(error);
                        this.hideIndicator.emit(this.feature);
                        // let purchases: InAppPurchase[] = purchasesResult.entitlements;
                        this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this,null, false, null, null, null);

                    });
                }).catch(error => {
                    console.log('Error in getting Input Schema Sample');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
                    this._airlockService.notifyDataChanged("error-notification",errorMessage);
                    this.hideIndicator.emit(error);
                });
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Utilitystring");
                this._airlockService.notifyDataChanged("error-notification",errorMessage);
                this.hideIndicator.emit(error);
            });
        }

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
    openAddDialog(){
        this.addFeatureModal.openAsAddSubFeature(this.feature.uniqueId,this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace);
    }
    copyFeature(){
        this._airlockService.setCopiedFeature(this.feature,this.branch);
    }
    exportFeature(){
        this._airlockService.downloadFeature(this.feature, this.branch);
    }
    openAddConfigurationDialog() {
        this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace);
    }
    openAddOrderingRuleDialog() {
        this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this._featureUtils.getFeatureDisplayName(this.feature), this.feature.namespace,false,true);
    }

    isNewFeature() {
        return this.partOfBranch() && this.feature.branchStatus=="NEW";
    }
    openAnalyticAttributesDialog() {
        console.log('in openAnalyticAttributesDialog');
        console.log('openAnalyticAttributesDialog feature', this.feature);
        this.beforeUpdate.emit(null);
        this._airlockService.getAnalyticsGlobalDataCollection(this.feature.seasonId, this.branch.uniqueId).then(result => {
            this.analyticData = result;
            console.log('AnalyticData JSON', JSON.stringify(this.analyticData));
                this._airlockService.getFeatureAttributes(this.feature.uniqueId, this.branch.uniqueId).then(result => {
                    this.featureAnalyticAttributes = result;
                    console.log('getFeatureAttributes JSON', JSON.stringify(this.featureAnalyticAttributes));
                    this.hideIndicator.emit(this.feature);
                    this.wlAttributesModalDialog.open(this.feature,this.branch, this.analyticData, this.featureAnalyticAttributes);
                }).catch(error => {
                    console.log('Error in getting Feature Attributes');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Feature Attributes");
                    this._airlockService.notifyDataChanged("error-notification",errorMessage);
                    this.hideIndicator.emit(error);
                });

        }).catch(error => {
            console.log('Error in getting Input Schema Sample');
            console.log(error);
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Analytic Global Data Collection");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.hideIndicator.emit(error);
        });


    }

    shouldStyleCell() {
        if ((this.feature.type=='MUTUAL_EXCLUSION_GROUP' && this.feature.features.length > 1)) {
            return true;
        }

        if (this.insideMX && !this.isOpen) {
            return false;
        }/*else  if (this.level > 0 && !this.insideMX) {
            return true;
        }*/
        else if (this.level==0 || this.isOpen==true || (this.feature.type=='MUTUAL_EXCLUSION_GROUP' && this.feature.features.length > 1)) {
            return true;
        } else {
            return false;
        }
    }

    shouldShowConfig(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="CONFIGURATION_RULE"));
        return (showConfig && ((this.getConfigs() && this.getConfigs().length > 0) || (this.feature.defaultConfiguration && this.feature.defaultConfiguration != {})));
    }

    shouldShowOrderRules(): boolean {
        var showOrder = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="ORDERING_RULE"));
        return (showOrder && ((this.getOrderRules() && this.getOrderRules().length > 0)));
    }
    canShowConfig(): boolean {
        var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="CONFIGURATION_RULE"));
        return showConfig;
    }


    isPartOfSearch(term:string, feature:Feature):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    hasSubElementWithTerm(term: string, feature:Feature):boolean {
        if (!term || term=="") {
            return false;
        }
        if (feature.features) {
            for (var subFeature of feature.features) {
                if (this.isPartOfSearch(term,subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        if (feature.configurationRules && this.canShowConfig()) {
            for (var subFeature of feature.configurationRules) {
                if (this.isPartOfSearch(term,subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        if (feature.orderingRules) {
            for (var subFeature of feature.orderingRules) {
                console.log("XXXXXX search in orderingRules:" + subFeature.name);
                if (this.isPartOfSearch(term,subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
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

            if (hasSearchHit && this.lastSearchTerm!=this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm=this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.feature.uniqueId),0.5
                });

            }

            return false;
        }
        return false; //change to true if you want to filter results out of the search
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.feature);
    }
    updateHighlight(hasHit:boolean) {
        let allText = this._featureUtils.getFeatureDisplayName(this.feature);
        if (!allText || allText.length <= 0) {
            return;
        }
        this.highlighted = hasHit
            ? allText.replace(new RegExp('('+this.searchTerm+')','ig'),
                '<span class=highlight>$1</span>')
            : allText;
    }
    _isFilteredOut(): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (this.feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (this.feature[key].toLowerCase()==value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }

        // if this is MTX - iterate over all the features and see if someone is not filtered out
        if (this.feature.type=="MUTUAL_EXCLUSION_GROUP") {
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


    public mySearchHit(obj:any) {
        this.onSearchHit.emit(obj);
    }

    public mySelected(obj:any) {
        this.onSelected.emit(obj);
    }

    isInProduction():boolean {
        return this.feature.stage=='PRODUCTION';
    }
    isFeatureFilteredOut(feature:Feature): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase()==value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
    }

    shouldFeatureBeFilteredOut(feature:Feature): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        var isFilteredOut = false;
        if (feature.type=='MUTUAL_EXCLUSION_GROUP') {
            //if this is MTX - filter out unless some children are not filtered
            isFilteredOut = true;
        }
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
        //now check if has children which are not being filtered out
        if(feature.features != null) {
            for (var subFeat of feature.features) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if(feature.orderingRules != null) {
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
    public myBeforeUpdate(obj:any) {
        this.beforeUpdate.emit(obj);
    }

    public myFeatureChangedStatus(obj:string) {
        this.onCellClick.emit(obj);
    }

    isCellOpen(featureID:string): boolean {
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            return true;
        } else {
            return false;
        }
    }

    public myOnUpdate(obj:any) {
        this.onUpdate.emit(obj);
    }

    public myHideIndicator(obj:any) {
        this.hideIndicator.emit(obj);
    }
    changeStage() {
        let message = "";
        if (this.feature.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this feature to development?';
            message += ` Enter the feature name to validate your decision.`;
        } else {
            message = 'Are you sure you want to release this feature to production?';
            message += ` This operation can impact your app in production.
        Enter the feature name to validate your decision.`;
        }

        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._changeStage();
            });
        console.log("open verifyActionModal");
        this.confirmSubfeatureStageChange = false;

        if(!this.isMasterBranch() && this.feature.stage=='PRODUCTION') {
            //raise this flag only if we are reverting to development
            //make recursive chech for feature stage change only if feature in branch
            // change global var confirmSubfeatureStageChange because of recursive func
            this.recursiveCheckStage(this.feature);
        }
        this.verifyActionModal.open(message,this.feature, VeryfyDialogType.FEATURE_TYPE, this.confirmSubfeatureStageChange);

    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        console.log("feature full JSON:", JSON.stringify(this.feature));
        var newStageFeature:Feature = Feature.clone(this.feature);
        var isRevert = false;
        var hasSubFeaturesInProd = false;
        if (newStageFeature.stage=='PRODUCTION') {
            newStageFeature.stage = 'DEVELOPMENT';
            isRevert = true;
            if(!this.isMasterBranch()) {
                this.recursiveUpdateStage(newStageFeature);
            }

        } else {
            newStageFeature.stage='PRODUCTION';
            if(newStageFeature.minAppVersion == null || newStageFeature.minAppVersion.length == 0){
                this._airlockService.notifyDataChanged("error-notification","Unable to release this feature to production because a minimum app version is not specified. Edit the feature to specify a minimum app version.");
                this.onUpdate.emit(this.feature);
                return;
            }
        }
        this._airlockService.updateFeature(newStageFeature, this.branch.uniqueId).then(feature => {
            this.feature = feature;
            this.onUpdate.emit(this.feature);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Feature stage changed successfully"});
        }).catch(error => {
            let defErrorMessage = "Failed to change stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change stage. If this item has subfeatures or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }

    isMasterBranch():boolean{
        return this.branch.uniqueId.toLowerCase()=="master"
    }

    isFeatureCheckedOutOrNew(feature: Feature):boolean {
        return (this.branch.uniqueId.toLowerCase()!="master" && (feature.branchStatus=="CHECKED_OUT" || feature.branchStatus=="NEW"));
    }

    recursiveCheckStage(feature:Feature){
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
            if (feature.type === "CONFIGURATION_RULE") {
                //console.log("CONFIGURATION NAME:", feature.name, feature.stage );
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            for (var sub of feature.configurationRules) {
                this.recursiveCheckStage(sub);
            }
        }
    }

    recursiveUpdateStage(feature:Feature){
        var hasSubfeatureToRevert = false;
        if (feature.features) {
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                console.log("FEATURE NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';

            }
            for (var sub of feature.features) {
                this.recursiveUpdateStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE") {
                console.log("CONFIGURATION NAME:", feature.name, feature.stage );
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';
            }
            for (var sub of feature.configurationRules) {
                this.recursiveUpdateStage(sub);
            }
        }
    }

    changeSendToAnalytic(){
        if (this.isFeatureSendToAnalytics()){
            this.beforeUpdate.emit(null);
            console.log('delete feature from send to Analytic');
            this._airlockService.deleteFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                console.log('Error in delete feature to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        }
        else {
            this.beforeUpdate.emit(null);
            console.log('update feature to send to Analytic');
            this._airlockService.updateFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                console.log('Error in update feature to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);

            });
        }
    }

    getDeleteColor() {
        if (this.feature.stage=='PRODUCTION' || this.isFeatureCheckedOut()) {
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
    getOrderRules(){
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

    isFeatureConfigRule(feat:Feature): boolean {
        if (feat.type=="CONFIGURATION_RULE") {
            return true;
        } else if (feat.type=="FEATURE") {
            return false;
        } else if (feat.type=="MUTUAL_EXCLUSION_GROUP" && feat.features && feat.features.length > 0) {
            let isIt = false;
            feat.features.forEach((subFeat) => {
                if(this.isFeatureConfigRule(subFeat)) {
                    isIt = true;
                }
            });
            return isIt
        } else {
            return false;
        }
    }

    isFeatureCheckedOut():boolean {
        return (this.branch.uniqueId.toLowerCase()!="master" && this.feature.branchStatus=="CHECKED_OUT");
    }

    delete() {
        if (this.feature.stage=='PRODUCTION' || this.isFeatureCheckedOut()) {
            return;
        }
        let message = 'Are you sure you want to delete this feature ('+this._featureUtils.getFeatureDisplayName(this.feature)+")?";
        this.modal.confirm()
            .title(message)
            .open()
            .catch(err => {
                console.log("ERROR")
            }) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(result => {
                console.log("confirmed");
                this._delete();
            }) // if were here ok was clicked.
            .catch(err => console.log("CANCELED"));
    }

    _delete() {
        this.beforeUpdate.emit(null);
        let featName = this._featureUtils.getFeatureDisplayName(this.feature);
        this._airlockService.deleteFeature(this.feature, this.branch).then(resp => {
            if(this.insideMX) {
                this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(response => {
                    console.log("deleted feature");
                    let mxGroup:Feature = response;
                    if(mxGroup.features==null || mxGroup.features.length <= 0) {
                        this._airlockService.deleteFeature(mxGroup, this.branch).then(re =>{
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
                this._airlockService.notifyDataChanged("success-notification",{title: "Success" ,
                                                                                message:"The feature "+ featName+ " was deleted"});
            }

        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete feature");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }
    draggedFeature($event) {
        let feature: Feature = $event.dragData;
        //alert('dragged '+feature.name);
    }
    droppedFeature($event) {
        let feature: Feature = $event.dragData;
        alert('dropped '+feature.name);
    }

    shouldShowUserGroups() {
        if (this.feature.stage=='DEVELOPMENT' &&
                !(this.feature.internalUserGroups==null || this.feature.internalUserGroups.length <=0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.feature.internalUserGroups==null || this.feature.internalUserGroups.length <=0)) {
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
        let message = this.isFeatureSendToAnalytics()? this.getString('analytics_stop_report_feature')+this._featureUtils.getFeatureDisplayName(this.feature)+this.getString('analytics_report_feature_suffix') : this.getString('analytics_report_feature')+this._featureUtils.getFeatureDisplayName(this.feature)+this.getString('analytics_report_feature_suffix');
        if (this.feature.stage=='PRODUCTION') {
            this.verifyActionModal.actionApproved$.subscribe(
                astronaut => {
                    this.changeSendToAnalytic();
                });
            this.verifyActionModal.open(message,this.feature, VeryfyDialogType.FEATURE_TYPE);
        } else {
            this.modal.confirm()
                .title(message)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(() => {
                    this.changeSendToAnalytic();
                }) // if were here ok was clicked.
                .catch(err => {

                });
        }
    }

    isDoubleEmptyMTX() {
        if (this.feature.type == 'MUTUAL_EXCLUSION_GROUP') {
            if (this.feature.features.length == 1 && this.feature.features[0].type=="MUTUAL_EXCLUSION_GROUP") {
                var mtx:Feature = this.feature.features[0];
                if (mtx.features.length <= 0) {
                    return true;
                }
            }
            return false;
        }
    }

    getOffset() {
        if(this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while( el && !isNaN( el.offsetTop ) ) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }
}
