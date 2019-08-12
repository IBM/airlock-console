
import {
    Component, Injectable, Input, EventEmitter, Output, ViewChild, ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {Feature} from "../../../model/feature";

import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {wlAttributesModal} from "../wlAttributesModal/wlAttributesModal.component";
import {EditNotificationModal} from "../editNotificationModal/editNotificationModal.component";
import {Webhook} from "../../../model/webhook";
import {EditWebhookModal} from "../editWebhookModal";
import {GlobalState} from "../../../global.state";

@Component({
    providers: [FeatureUtilsService],
    selector: 'webhook-cell',
    styles: [require('./style.scss'),require('./webhookCell.scss'), require('./dnd.scss'), require('./animations.scss')],
    template: require('./webhookCell.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WebhookCell {

    @ViewChild('webhookCell') _selector:any;
    webhook:Webhook;
    @Input('webhook')
    set webhookObject(value: Webhook) {
        this.webhook = value;
        this.createProductsList();
    }
    @Input() parentFeatureId:string;
    @Input() contextFeatureId:string;
    @Input() level: number = 0;
    @Input() showDevFeatures: boolean;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() shouldOpenCell: boolean;
    @Input() openExperiments: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: {string: Array<string>} = null;
    @Input() schema;
    @Input() wlAttributesModalDialog:wlAttributesModal;
    @Input() editWebhookModal:EditWebhookModal;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedId: string = "";
    @Output() onUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() hideIndicator:EventEmitter<any>= new EventEmitter<any>();
    @Output() beforeUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() onCellClick:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSearchHit:EventEmitter<string>= new EventEmitter<string>();
    @Output() onDummySearchHit:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSelected:EventEmitter<any>= new EventEmitter<any>();
    ruleUtilitieInfo: string;
    ruleInputSchemaSample: string;
    notificationInputSample: string;
    nextLevel: number;
    containerClass: string;
    isOpen: boolean=false;
    remove: boolean=true;
    userEmail:string="";
    productsList = "";
    lastSearchTerm:string="";
    shouldOpenCellForSearch:boolean = false;
    processorInputSchemaSample : string;
    filterInputSchemaSample : string;
    highlighted = '';
    streamUtilitieInfo: string;
    public status: {isopen: boolean} = {isopen: false};

    constructor(private _airlockService:AirlockService,private authorizationService:AuthorizationService
    , public modal: Modal, private _stringsSrevice: StringsService, private cd: ChangeDetectorRef,
                private _featureUtils:FeatureUtilsService, private _appState: GlobalState,) {
        this.userEmail = this._airlockService.getUserEmail();
        this.nextLevel = this.level + 1;
        if (this.level==0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
    }
    // importFeature(){
    //     this.importFeaturesModal.open(false,this.variant);
    // }
    // pasteFeature(){
    //     this.importFeaturesModal.open(true,this.variant);
    // }
    
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format:string[]) {
        return this._stringsSrevice.getStringWithFormat(name,...format);
    }

    getMXTitle() : string {
        return this._stringsSrevice.getString("experiment_cell_variants_title");
    }

    isShowCopy(){
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions(){
        return true;

    }

    createProductsList() {
        if (this.webhook.products && this.webhook.products.length > 0) {
            let prodsList = "";
            for (let prodId of this.webhook.products) {
                if (prodsList.length > 0) {
                    prodsList += ", ";
                }
                prodsList += this.getProductName(prodId);
            }
            this.productsList = prodsList;
        } else {
            this.productsList = "";
        }
    }

    getProductName(prodID) {
        return prodID;
    }
    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.webhook);
    }

    isShowReleaseToProduction(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false) && this.partOfBranch();
    }
    isShowChangeEnableState() {
        return true;
    }
    isShowSendToAnalytic(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }
    isFeatureSendToAnalytics(){
        return false;
    }

    showExpand():boolean {
        return true;
    }
    shouldStyleAsMTX():boolean {
        return false;
    }

    isSendingSomethingToAnalytics(): boolean {
        return false;
    }

    _isSendingExtraStuffToAnalytics():boolean {
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
        return !(this.isViewer()) && !(this.isEditor() && this.isInProduction());
    }
    isEditor(){
        return this._airlockService.isEditor();
    }
    isShowAddToGroup(){
        return (!this.isViewer());
    }

    isShowAddVariant() {
        return (!this.isViewer() && !(this.isEditor() && this.isInProduction()))
    }
    isShowReorder(){
        return (!this.isViewer());
    }

    isShowReorderConfig(){
        return (!this.isViewer());
    }
    public updateFeature(newFeature:Feature){
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
                this.cd.markForCheck(), 0.5});
        } else {
        }
    }

    isShowAddToBranch() {
        return !this.partOfBranch();
    }

    isPartOfBranch():boolean {
        return true;//this.variant && this.variant.branchStatus && (this.variant.branchStatus=="CHECKED_OUT" || this.variant.branchStatus=="NEW");
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

    getMasterTooltip():string {
        return this.getString('experiment_cell_master_variant')
    }

    getFeatureFollowTooltip(isfollowed: boolean){
        if(!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if(isfollowed){
           return this.getString("notifications_unfollow_tooltip");
        }
        else{
            return this.getString("notifications_follow_tooltip");
        }
    }

    getBackgroundStyle() {
        var level = this.level;
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
        return toRet;
    }

    public mySelected(obj:any) {
        this.onSelected.emit(obj);
    }

    getMasterBackgroundStyle() {
        var level = this.level + 1;
        var trans = level*0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256,"+opac+")";
        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }
    getConfigBackgroundStyle() {
        var level = this.level;
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
        if (!this.isOpen) {
            return this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel*0.1;
            let toRet = "rgba(0,0,0,"+trans+")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel*0.1;
            var num = Math.floor(trans*256);
            let toRet = "rgba("+num+","+num+","+num+",1.0)";
            return toRet;
        }

    }

    cellClicked() {
        if(!this.isOpen) {
            this.remove = false;
            console.log("cell changed status:"+this.webhook.uniqueId);
            this.onCellClick.emit(this.webhook.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5});
        } else {
            // setTimeout(() => this.isOpen = false, 0.3);
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.webhook.uniqueId);
        }
        this.cd.markForCheck();

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
        // console.log("add to MX Group");
        // this.addFeatureModal.openInExistingXM(this.variant);
}
    addNewFeatureToMXGroupWithCurrentFeature(){
        // this.addFeatureModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId,this.variant);
    }

    addFeatureToMXGroup() {
        // this.beforeUpdate.emit(null);
        // this.variant.parent = this.parentFeatureId;
        // this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(parent => {
        //     let parentFeature: Feature = parent;
        //     this.hideIndicator.emit(null);
        //     this.addToMXGroupModal.open(this.branch, this.variant, parentFeature);
        // });

    }

    openEditDialog(event){
        if(event) {
            event.stopPropagation();
        }
        let prods = this._appState.getData('products');
        this.editWebhookModal.open(this.webhook, prods);
    }

    openAddVariantDialog(){

    }

    openAddDialog(){
    }
    copyFeature(){
    }
    exportFeature(){
    }
    openAddConfigurationDialog() {
    }

    openAnalyticAttributesDialog() {


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


    isPartOfSearch(term:string, webhook:Webhook):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let fullName = this.webhook.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return fullName.includes((lowerTerm));
    }


    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            // console.log("variant is filtered:"+this.variant.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = false;//this.hasSubElementWithTerm(this.searchTerm, this.s);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.webhook);
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

            if (hasSearchHit && this.lastSearchTerm!=this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm=this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.webhook.uniqueId),0.5
                });

            }

            return false;
        }
        return false;
    }

    getDisplayName(webhook:Webhook):string {
        return webhook.name;
    }
    updateHighlight(hasHit:boolean) {
        let allText = this.getDisplayName(this.webhook);
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
            if (this.webhook[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (this.webhook[key].toLowerCase()==value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
        return false;
    }


    public mySearchHit(obj:any) {
        this.onSearchHit.emit(obj);
    }

    public myDummySearchHit(obj:any) {
        this.onDummySearchHit.emit(obj);
    }
    isInProduction():boolean {
        return this.webhook.minStage=='PRODUCTION';
    }

    isSubFeature() {
        return false;
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

    isCellOpen(expID:string): boolean {
        var index = this.openExperiments.indexOf(expID, 0);
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

    changeEnableState() {

    }

    _changeEnableState() {

    }

    changeStage() {

    }

    _changeStage() {

    }

    getDeleteColor() {
        return "red";
    }



    delete() {
        let message = 'Are you sure you want to delete this webhook ('+this.getDisplayName(this.webhook)+")?";
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
        this._airlockService.deleteWebhook(this.webhook.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification",{title: "Success" ,
                message:"The webhook "+ this.getDisplayName(this.webhook)+ " was deleted"});
        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete webhook");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldShowUserGroups() {
        return false;
    }

    userGroupsText() {
        var toRet = "";
        return toRet;
    }

    promptChangeSendToAnalytics() {

    }

    isNotificationRunning() {
        return true;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId==this.webhook.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event":event, "id":this.webhook.uniqueId, "offset":y })
            return true;
        } else {
            return false;
        }
    }

    getOffset() {
        if(this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }

    isSelectedFeature() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId==this.webhook.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event":event, "id":this.webhook.uniqueId, "offset":y })
            return true;
        } else {
            return false;
        }
    }
}
