
import {
    Component, Injectable, Input, EventEmitter, Output, ViewChild, ChangeDetectionStrategy,
    ChangeDetectorRef
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
import {AddConfigurationModal} from "../addConfigurationModal/addConfigurationModal.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {wlAttributesModal} from "../wlAttributesModal/wlAttributesModal.component";
import {Branch} from "../../../model/branch";


@Component({
    providers: [FeatureUtilsService],
    selector: 'configuration-cell',
    styles: [require('./style.scss'),require('./configurationCell.scss'),require('./dnd.scss')],
    // directives: [UiSwitchComponent, ConfigurationCell,COMMON_DIRECTIVES, DND_DIRECTIVES,PROGRESSBAR_DIRECTIVES, CORE_DIRECTIVES
    //     ,DROPDOWN_DIRECTIVES, TOOLTIP_DIRECTIVES, AlertComponent,EditFeatureModal,AddFeatureModal,AddConfigurationModal,ProgressbarComponent, AddFeatureToGroupModal, VerifyActionModal],
    template: require('./configurationCell.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationCell {

    // @ViewChild('verifyActionModal')
    // verifyActionModal:  VerifyActionModal;
    @ViewChild('configurationCell') _selector:any;

    @Input() seasonSupportAnalytics:boolean = true;
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
    @Input() insideMX: boolean;
    @Input() mainConfigCell: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() configurationSchema: {};
    @Input() defaultConfiguration: {};
    @Input() sourceFeature:Feature;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() showDevFeatures: boolean;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() filterlistDict: {string: Array<string>} = null;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() partOfBranch: boolean = false;
    @Input() wlAttributesModalDialog:wlAttributesModal;
    @Input() selectedFeatureId: string = "";
    @Output() onSelected:EventEmitter<any>= new EventEmitter<any>();
    @Output() onUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() beforeUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() hideIndicator:EventEmitter<any>= new EventEmitter<any>();
    @Output() onCellClick:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSearchHit:EventEmitter<string>= new EventEmitter<string>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean=false;
    remove: boolean=true;
    ruleInputSchemaSample: string;
    ruleUtilitieInfo: string;
    lastSearchTerm:string="";
    shouldOpenCellForSearch:boolean = false;
    highlighted = '';
    confirmSubfeatureStageChange: boolean = false;

    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airlockService:AirlockService,private authorizationService:AuthorizationService
    , public modal: Modal, private _stringsSrevice: StringsService, private cd: ChangeDetectorRef, private _featureUtils:FeatureUtilsService) {
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
    isMainConfigCell(): boolean {
        return this.mainConfigCell;
    }
    isAddDevelopmentSubConfig(){
        if(this.feature == null){
            return false;
        }
        return !this._airlockService.isViewer();
    }
    isShowOptions(){
        if (this.feature.stage=='PRODUCTION') {
            var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false);
        }else{
            return (!this.isViewer());
        }

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
        if (feature.configurationRules) {
            for (var subFeature of feature.configurationRules) {
                if (this.isPartOfSearch(term,subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        return false;

    }
    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
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

    public mySearchHit(obj:any) {
        this.onSearchHit.emit(obj);
    }

    public mySelected(obj:any) {
        this.onSelected.emit(obj);
    }

    isInProduction():boolean {
        return this.feature.stage=='PRODUCTION';
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getConfigString() : string {
        return this.feature.description;
        // let toRet = "";
        // if (this.feature.configuration) {
        //     toRet = JSON.stringify(this.feature.configuration);
        // }
        // return toRet;
    }

    getDefaultConfigString(): string {
        let toRet = "";
        if (this.defaultConfiguration) {
            toRet = JSON.stringify(this.defaultConfiguration);
        }
        return toRet;
    }

    getConfigSchemaString(): string {
        let toRet = "";
        if (this.configurationSchema) {
            toRet = JSON.stringify(this.configurationSchema);
        }
        return toRet;
    }

    getConfigurationString() : string {
        if (this.mainConfigCell) {
            return this.getString("configuration_cell_title") +" ("+this._featureUtils.getFeatureDisplayNameInTree(this.sourceFeature)+")";
        } else {
            return this._stringsSrevice.getStringWithFormat("configuration_cell_mx_title", String(this.feature.maxFeaturesOn));
            //return this.getString("configuration_cell_mx_title");
        }
    }

    isShowRevertFromProdToEditor(){
        return this._airlockService.isEditor() && this.feature.stage == 'PRODUCTION' && this.branch.uniqueId.toLowerCase()!="master";
    }

    isShowReleaseToProduction(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false || this.isShowRevertFromProdToEditor()) && this.partOfBranch;
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
    isViewer(){
        return this._airlockService.isViewer();
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
    ngOnInit() {
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5});
        } else {
        }
    }

    reorder() {
        let source = null;
        if (this.isMainConfigCell()) {
            // source = Feature.clone(this.sourceFeature);
            source = FeatureUtilsService.cloneFeature(this.sourceFeature) as Feature;
        }
        this.reorderMXGroupModal.open(this.branch, FeatureUtilsService.cloneFeature(this.sourceFeature) as Feature,source,false,true);
    }
    isShowReorderForCell(){
        return (this.feature && this.feature.configurationRules && this.feature.configurationRules.length > 1);
    }
    reorderSubConfiguration() {
        var clonedFeature:Feature = FeatureUtilsService.cloneFeature(this.sourceFeature) as Feature;
        this.reorderMXGroupModal.open(this.branch, clonedFeature,clonedFeature,false,true,false);
    }
    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }

    }
    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level*0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,240,256,"+opac+")";
        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133,"+1.0+")";
            } else {
                toRet = "rgba(220, 224, 199,"+1.0+")";
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


    getHeadBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level*0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,225,225,"+1+")";
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

    getHeadColorStyle() {
        let constRet = "rgba(0,0,0,1)"
        return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen || this.feature.configurationRules==null || this.feature.configurationRules.length <=0) {
            return "";//this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel*0.1;
            let toRet = "rgba(0,0,0,"+trans+")";
            return toRet;
        }

    }

    getNextLevel() {
        if(this.feature.configurationRules.length > 1) {
            return this.level + 1;
        } else {
            return this.level;
        }
    }

    getNextColorStyle() {
        if (!this.isOpen || this.feature.configurationRules==null || this.feature.configurationRules.length <=0) {
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
        if (this.feature.type=='CONFIGURATION_RULE' && this.feature.configurationRules!=null && this.feature.configurationRules.length > 0) {
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

    transitionEnd() {
        // console.log('transitionEnd');
        if(!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }
    getSendToAnalyticsTooltip(){
        if(!this.feature.sendToAnalytics){
            return this.getString('configuration_cell_click_to_send_to_analytics');
        }else{
            return this.getString('configuration_cell_sending_something_click_to_not_send_to_analytics');
        }
    }
    addNewFeatureToMXGroup(){
        console.log("add to MX Group");
        if (this.isMainConfigCell()) {
            if(this.sourceFeature.type === "ENTITLEMENT" || this.sourceFeature.type === "PURCHASE_OPTIONS"){
                this.addConfigurationModal.openAsAddSubFeatureWithParent(this.branch.uniqueId, this.sourceFeature, this.sourceFeature.namespace,true,false);
            }else {
                this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.sourceFeature.uniqueId, this._featureUtils.getFeatureDisplayName(this.sourceFeature), this.sourceFeature.namespace);
            }
        } else {
            this.addConfigurationModal.openInExistingXM(this.feature,this.branch.uniqueId);
        }

}
    addNewFeatureToMXGroupWithCurrentFeature(){
        this.addConfigurationModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId,this.feature);
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
        this.beforeUpdate.emit(null);
        this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
            this.ruleUtilitieInfo = result;
            console.log('UtilityInfo:');
            console.log(this.ruleUtilitieInfo);
            this._airlockService.getInputSample(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(res => {
                this.ruleInputSchemaSample = res;
                console.log('Input Schema Sample');
                console.log(this.ruleInputSchemaSample);
                this.hideIndicator.emit(this.feature);
                this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null,this, false, this.sourceFeature);
            }).catch(error => {
                console.log('Error in getting Input Schema Sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                this._airlockService.notifyDataChanged("error-notification",errorMessage);
                this.hideIndicator.emit(error);
            });
        }).catch(error => {
            console.log('Error in getting Utilitystring');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.hideIndicator.emit(error);
        });


    }

    openDefault() {
        //this.editFeatureModal.open(this.sourceFeature, this.featuresPath,true);
        this.beforeUpdate.emit(null);
        this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
            this.ruleUtilitieInfo = result;
            console.log('UtilityInfo:');
            console.log(this.ruleUtilitieInfo);
            this._airlockService.getInputSample(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
                this.ruleInputSchemaSample = result;
                console.log('Input Schema Sample');
                console.log(this.ruleInputSchemaSample);
                this.hideIndicator.emit(this.feature);
                this.editFeatureModal.open(this.branch, this.sourceFeature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, null, true);
            }).catch(error => {
                console.log('Error in getting Input Schema Sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                this._airlockService.notifyDataChanged("error-notification",errorMessage);
                this.hideIndicator.emit(error);
            });
        }).catch(error => {
            console.log('Error in getting Input Schema Sample');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get UtilityString");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.hideIndicator.emit(error);
        });

    }
    openAddDialog(){
        //console.log('BEFORE OPEN CONFIG ADD:', this.feature);
        //console.log('BEFORE OPEN CONFIG ADD PARENT FEATURE:', this.feature.parent);
        this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId,this.feature.name, this.feature.namespace);
    }
    shouldStyleCell() {
        if ((this.feature.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.feature.configurationRules.length > 1)) {
            return true;
        }
        else if (this.insideMX && !this.isOpen) {
            return false;
        }/*else  if (this.level > 0 && !this.insideMX) {
            return true;
        }*/
        else if (this.level==0 || this.isOpen==true || (this.feature.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.feature.configurationRules.length > 1)) {
            return true;
        } else {
            return false;
        }
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
            message = 'Are you sure you want to revert the stage of this configuration to development?';
        } else {
            message = 'Are you sure you want to release this configuration to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the configuration name to validate your decision.`;
        // this.modal.prompt()
        //     .title(message)
        //     .body(`<label class="modal-text">This action will have major impact on you application</label>
        //             <p><span class="modal-text">Type feature name: </span>
        //             </p>
        //             <input type="text" placeholder="Enter feature name"  class="form-control blackText" >
        //                `
        //     )
        //     .open()
        //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
        //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
        //     .then(result => {
        //         console.log("confirmed");
        //         console.log(result);
        //         this._changeStage();
        //     });// if were here ok was clicked.
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._changeStage();
            });

        this.confirmSubfeatureStageChange = false;
        if(!this.isMasterBranch()) {
            //make recursive chech for feature stage change only if feature in branch
            // change global var confirmSubfeatureStageChange because of recursive func
            this.recursiveCheckStage(this.feature);
        }

        this.verifyActionModal.open(message,this.feature, VeryfyDialogType.CONFIGURATION_TYPE, this.confirmSubfeatureStageChange);
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var newStageFeature:Feature = FeatureUtilsService.cloneFeature(this.feature) as Feature;
        var isRevert = false;
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
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Stage changed successfully"});
        }).catch(error => {
            let defErrorMessage = error._body || "Failed to change stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change stage. If this item has sub-configurations in production, revert them to development first";
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
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature) ) {
                console.log("FEATURE NAME:", feature.name, feature.stage);
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            for (var sub of feature.features) {
                this.recursiveCheckStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE" && feature.name != this.feature.name) {
                console.log("CONFIGURATION NAME:", feature.name, feature.stage );
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
            if (feature.type === "CONFIGURATION_RULE" && feature.name != this.feature.name) {
                console.log("CONFIGURATION NAME:", feature.name, feature.stage );
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';
            }
            for (var sub of feature.configurationRules) {
                this.recursiveUpdateStage(sub);
            }
        }
    }

    getDeleteColor() {
        if (this.feature.stage=='PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    delete() {
        if (this.feature.stage=='PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this configuration ('+this.feature.name+")?";
        this.modal.confirm()
            .title(message)
            .open()
            .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(result => {
                console.log("confirmed");
                this._delete();
            }) // if were here ok was clicked.
            .catch(err => console.log("CANCELED:"+err));
    }

    _delete() {
        this.beforeUpdate.emit(null);
        let featName = this.feature.name;
        this._airlockService.deleteFeature(this.feature, this.branch).then(resp => {
            if(this.insideMX) {
                this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(response => {
                    console.log("deleted feature");
                    let mxGroup:Feature = response;
                    if(mxGroup.type=="CONFIG_MUTUAL_EXCLUSION_GROUP" && (mxGroup.configurationRules==null || mxGroup.configurationRules.length <= 0)) {
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
                    message:"The configuration "+ featName+ " was deleted"});
            }



        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete configuration");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
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
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic");
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
            toRet = this.feature.internalUserGroups.toString();
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {

        let message = this.isFeatureSendToAnalytics()? this.getString('analytics_stop_report_config')+this._featureUtils.getFeatureDisplayName(this.feature)+this.getString('analytics_report_config_suffix') : this.getString('analytics_report_config')+this._featureUtils.getFeatureDisplayName(this.feature)+this.getString('analytics_report_config_suffix');
        if (this.feature.stage=='PRODUCTION') {
            this.verifyActionModal.actionApproved$.subscribe(
                astronaut => {
                    this.changeSendToAnalytic();
                });
            this.verifyActionModal.open(message,this.feature, VeryfyDialogType.CONFIGURATION_TYPE);
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

    isPartOfBranch():boolean {
        return this.feature && this.feature.branchStatus && (this.feature.branchStatus=="CHECKED_OUT" || this.feature.branchStatus=="NEW");
    }
    /*partOfBranch() {
        return this.branch.uniqueId=="master" || this.isPartOfBranch();
    }*/

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
