
import {
    Component, Injectable, Input, EventEmitter, Output, ViewChild, ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import {Feature} from "../../../model/feature";
import {EditFeatureModal} from "../editFeatureModal/editFeatureModal.component";
import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";
import {AirlockService} from "../../../services/airlock.service";
import {AddFeatureModal} from "../addFeatureModal/addFeatureModal.component";
import {AddVariantModal} from "../addVariantModal/addVariantModal.component";
import {ReorderMXGroupModal} from "../reorderMXGroupModal/reorderMXGroupModal.component";
import {AddFeatureToGroupModal} from "../addFeatureToGroupModal/addFeatureToGroupModal.component";
import {AuthorizationService} from "../../../services/authorization.service";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {StringsService} from "../../../services/strings.service";
import {AddConfigurationModal} from "../addConfigurationModal/addConfigurationModal.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {wlAttributesModal} from "../wlAttributesModal/wlAttributesModal.component";
import {Branch,AvailableBranches} from "../../../model/branch";
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {EditVariantModal} from "../editVariantModal/editVariantModal.component";


@Component({
    providers: [FeatureUtilsService],
    selector: 'variant-cell',
    styles: [require('./style.scss'),require('./variantCell.scss'),require('./dnd.scss')],
    template: require('./variantCell.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VariantCell {
    @ViewChild('variantCell') _selector:any;
    @Input() variant:Variant;
    @Input() level: number = 0;
    @Input() editVariantModal:EditVariantModal;
    @Input() insideMX: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() showDevFeatures: boolean;
    @Input() showDisabled: boolean;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() addVariantModal:AddVariantModal;
    @Input() filterlistDict: {string: Array<string>} = null;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() variantIndex: number = 0;
    @Input() experiment: Experiment;
    @Input() selectedId: string = "";
    @Output() onUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() beforeUpdate:EventEmitter<any>= new EventEmitter<any>();
    @Output() hideIndicator:EventEmitter<any>= new EventEmitter<any>();
    @Output() onCellClick:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSearchHit:EventEmitter<string>= new EventEmitter<string>();
    @Output() onDummySearchHit:EventEmitter<string>= new EventEmitter<string>();
    @Output() onSelected:EventEmitter<any>= new EventEmitter<any>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean=false;
    remove: boolean=true;
    ruleInputSchemaSample: string = null;
    ruleUtilitieInfo: string = null;
    availableBranches: AvailableBranches;
    lastSearchTerm:string="";
    shouldOpenCellForSearch:boolean = false;
    loading:boolean = false;
    highlighted = '';
    highlightedBranch = '';
    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airlockService:AirlockService,private authorizationService:AuthorizationService
    , public modal: Modal, private _stringsSrevice: StringsService, private cd: ChangeDetectorRef, private _featureUtils:FeatureUtilsService) {
        this.nextLevel = this.level + 1;
        this.containerClass = "panel panel-warning";
    }

    isMainConfigCell(): boolean {
        return false;
    }
    isAddDevelopmentSubConfig(){
        if(this.variant == null){
            return false;
        }
        return !this._airlockService.isViewer();
    }
    isShowOptions(){
        if (this.variant.stage=='PRODUCTION') {
            var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false);
        }else{
            return (!this.isViewer());
        }

    }

    isPartOfSearch(term:string, variant:Variant):boolean {
        if (!term || term=="") {
            return true;
        }
        var hasDisplayNameMatch = false;
        var hasNameMatch = false;
        var hasBranchMatch = false;
        let lowerTerm = term.toLowerCase();
        let displayName = this.getDisplayName();
        if (displayName) {
            hasDisplayNameMatch = displayName.toLowerCase().includes(lowerTerm);
        }
        let name = this.variant.name;
        if (name) {
            hasNameMatch = name.toLowerCase().includes(lowerTerm);
        }
        let branchName = this.variant.branchName;
        if (branchName) {
            hasBranchMatch = branchName.toLowerCase().includes(lowerTerm);
        }
        return hasDisplayNameMatch || hasBranchMatch || hasNameMatch;
    }

    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            this.updateHighlight(false);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.variant);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit) {
            if (hasSearchHit && this.lastSearchTerm!=this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm=this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.variant.uniqueId),0.5
                });

            }
            return false;
        } else {
            if (this.lastSearchTerm!=this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm=this.searchTerm;
                setTimeout(() => {
                    this.onDummySearchHit.emit(this.variant.uniqueId),0.5
                });

            }
            return false;
        }
    }

    getDisplayName() {
        return this._featureUtils.getVariantDisplayName(this.variant) || "";
    }
    updateHighlight(hasHit:boolean) {
        let allText = this.getDisplayName();
        if (!allText || allText.length <= 0) {
            // return;
        } else {
            this.highlighted = hasHit
                ? allText.replace(new RegExp('('+this.searchTerm+')','ig'),
                    '<span class=highlight>$1</span>')
                : allText;
        }
        let branchText = this.variant.branchName;
        if (!branchText || branchText.length <= 0) {
            // return;
        } else {
            this.highlightedBranch = hasHit
                ? branchText.replace(new RegExp('('+this.searchTerm+')','ig'),
                    '<span class=highlight>$1</span>')
                : branchText;
        }
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
            if (this.variant.hasOwnProperty(key) && valuesArr) {
                if ((typeof this.variant[key] === 'string' || this.variant[key] instanceof String)) {
                    for (var value of valuesArr) {
                        if (this.variant[key].toLowerCase()==value.toLowerCase()) {
                            return true;
                        }
                    }
                } else if ((typeof this.variant[key] === 'boolean' || this.variant[key] instanceof Boolean)) {
                    for (var value of valuesArr) {
                        if (this.variant[key]==value) {
                            return true;
                        }
                    }
                }
            }

        }

        // if this is MTX - iterate over all the features and see if someone is not filtered out
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

    isInProduction():boolean {
        return this.variant.stage=='PRODUCTION';
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getConfigString() : string {
        return this.variant.description;
        // let toRet = "";
        // if (this.variant.configuration) {
        //     toRet = JSON.stringify(this.variant.configuration);
        // }
        // return toRet;
    }


    isShowReleaseToProduction(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }
    isShowSendToAnalytic(){
        var isNotEditorOrViewer:boolean =  ( this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }
    isFeatureSendToAnalytics(){
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
        return toRet;
    }
    colors = ["rgba(61, 126, 14, 0.9)",
        "rgba(126, 17, 10, 0.9)",
        "rgba(187, 185, 51, 0.9)",
        "rgba(42, 48, 187, 0.9)",
        "rgba(119, 167, 147, 0.9)",
        "rgba(255, 47, 49, 0.9)",
        "rgba(219, 110, 207, 0.9)",
        "rgba(78, 39, 71, 0.9)",];

    getVariantColor() {
        var index = 3;//this.variantIndex % 8;
        if (this.isDefalut()) {
            return "darkslategray";
        }
        return this.colors[index];
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
        return "";
        // if (!this.isOpen || this.variant.configurationRules==null || this.variant.configurationRules.length <=0) {
        //     return "";//this.getBackgroundStyle();
        // } else {
        //     var trans = this.nextLevel*0.1;
        //     let toRet = "rgba(0,0,0,"+trans+")";
        //     return toRet;
        // }

    }

    getNextLevel() {
        return this.level;
    }

    getNextColorStyle() {
        return this.getColorStyle();
        // if (!this.isOpen || this.variant.configurationRules==null || this.variant.configurationRules.length <=0) {
        //     return this.getColorStyle();
        // } else {
        //     var trans = this.nextLevel*0.1;
        //     var num = Math.floor(trans*256);
        //     let toRet = "rgba("+num+","+num+","+num+",1.0)";
        //     return toRet;
        // }

    }

    getNextFeaturePath() {
        return [...this.featuresPath,this.variant];
    }

    cellClicked() {
        // if (this.variant.type=='CONFIGURATION_RULE' && this.variant.configurationRules!=null && this.variant.configurationRules.length > 0) {
        //     if(!this.isOpen) {
        //         this.remove = false;
        //         console.log("featureCell changed status:"+this.variant.uniqueId);
        //         this.onCellClick.emit(this.variant.uniqueId);
        //         setTimeout(() => {
        //             this.isOpen = true;
        //             this.cd.markForCheck(), 0.5});
        //     } else {
        //         // setTimeout(() => this.isOpen = false, 0.3);
        //         this.isOpen = false;
        //         this.remove = true;
        //         this.onCellClick.emit(this.variant.uniqueId);
        //     }
        // } else {
        //     this.isOpen = false;
        // }
        // this.cd.markForCheck();
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
        // if (this.isMainConfigCell()) {
        //     this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.sourceFeature.uniqueId, this._featureUtils.getFeatureDisplayName(this.sourceFeature), this.sourceFeature.namespace);
        // } else {
        //     this.addConfigurationModal.openInExistingXM(this.variant);
        // }

}
    addNewFeatureToMXGroupWithCurrentFeature(){
        // this.addConfigurationModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId,this.variant);
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
    isDefalut(){
        if (this.experiment.controlGroupVariants == null){
            return false;
        }
        for (var varName of this.experiment.controlGroupVariants) {
            if (varName == this.variant.name){
                return true;
            }
        }
        return false;
    }
    setVariantAsDefaultVariant() {
        this.loading = true;
        var experimentToUpdate: Experiment = Experiment.clone(this.experiment);

        var variantName:string = this.variant.name;
        experimentToUpdate.controlGroupVariants = [variantName]
        let experimentStr = JSON.stringify(experimentToUpdate);
        console.log("experimentStr:", experimentStr);
        this._airlockService.updateExperiment(experimentToUpdate).then(resp => {
            this.loading = false;
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification",{title: "Success" ,
                message:"The variant "+ variantName+ " was set as control"});
        }).catch(error => {
            this.loading = false;
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to set variant as control ");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }
    openEditDialog(event){
         if(event) {
             event.stopPropagation();
         }

        //this.editVariantModal.open(this.variant, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this);

         if (this.ruleUtilitieInfo!=null && this.ruleInputSchemaSample!= null && this.availableBranches!= null) {
            console.log("SKIPPING utilities and inputSchema");
            this.editVariantModal.open(this.variant, this.availableBranches.availableInAllSeasons, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this);
         }
         else {
             console.log("RETRIEVING utilities and inputSchema");
             console.log(this.ruleUtilitieInfo);
             console.log(this.ruleInputSchemaSample);
             this.beforeUpdate.emit(null);
             this._airlockService.getAvailableBranches(this.experiment.uniqueId).then(result => {
                 this.availableBranches = result;
                 console.log('availableBranches', this.availableBranches);
                 this._airlockService.getExperimentUtilitiesInfo(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result => {
                     this.ruleUtilitieInfo = result;
                     console.log('UtilityInfo:');
                     console.log(this.ruleUtilitieInfo);
                     this._airlockService.getExperimentInputSample(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result => {
                         this.ruleInputSchemaSample = result;
                         console.log('Input Schema Sample');
                         console.log(this.ruleInputSchemaSample);
                         this.hideIndicator.emit(this.variant);
                         this.editVariantModal.open(this.variant, this.availableBranches.availableInAllSeasons, this.ruleInputSchemaSample, this.ruleUtilitieInfo,this);
                     }).catch(error => {
                         console.log('Error in getting Experiment Input Schema Sample');
                         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema");
                         this._airlockService.notifyDataChanged("error-notification",errorMessage);
                         this.hideIndicator.emit(error);
                     });
                 }).catch(error => {
                     console.log('Error in getting UtilityInfo');
                     let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Utilitystring");
                     this._airlockService.notifyDataChanged("error-notification",errorMessage);
                     this.hideIndicator.emit(error);
                 });
             }).catch(error => {
                 console.log('Error in getting Feature Attributes');
                 let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Feature Attributes");
                 this._airlockService.notifyDataChanged("error-notification",errorMessage);
                 this.hideIndicator.emit(error);
             });
         }



    }

    openDefault() {
        // this.beforeUpdate.emit(null);
        // this._airlockService.getUtilitiesInfo(this.variant.seasonId, this.variant.stage, this.variant.minAppVersion).then(result => {
        //     this.ruleUtilitieInfo = result;
        //     console.log('UtilityInfo:');
        //     console.log(this.ruleUtilitieInfo);
        //     this._airlockService.getInputSample(this.variant.seasonId, this.variant.stage, this.variant.minAppVersion).then(result => {
        //         this.ruleInputSchemaSample = result;
        //         console.log('Input Schema Sample');
        //         console.log(this.ruleInputSchemaSample);
        //         this.hideIndicator.emit(this.variant);
        //         this.editFeatureModal.open(this.branch, this.sourceFeature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, null, true);
        //     }).catch(error => {
        //         console.log('Error in getting Input Schema Sample');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
        //         this._airlockService.notifyDataChanged("error-notification",errorMessage);
        //         this.hideIndicator.emit(error);
        //     });
        // }).catch(error => {
        //     console.log('Error in getting Input Schema Sample');
        //     let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get UtilityString");
        //     this._airlockService.notifyDataChanged("error-notification",errorMessage);
        //     this.hideIndicator.emit(error);
        // });

    }
    openAddDialog(){
        //console.log('BEFORE OPEN CONFIG ADD:', this.variant);
        //console.log('BEFORE OPEN CONFIG ADD PARENT FEATURE:', this.variant.parent);
        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.variant.uniqueId,this.variant.name, this.variant.namespace);
    }
    shouldStyleCell() {
        return false;
        // if ((this.variant.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.variant.configurationRules.length > 1)) {
        //     return true;
        // }
        // else if (this.insideMX && !this.isOpen) {
        //     return false;
        // }/*else  if (this.level > 0 && !this.insideMX) {
        //     return true;
        // }*/
        // else if (this.level==0 || this.isOpen==true || (this.variant.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.variant.configurationRules.length > 1)) {
        //     return true;
        // } else {
        //     return false;
        // }
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
        if (this.variant.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this variant to development?';
        } else {
            message = 'Are you sure you want to release this variant to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the experiment name to validate your decision.`;
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._changeStage();
            });
        console.log("open verifyActionModal");
        this.verifyActionModal.open(message,this.variant, VeryfyDialogType.VARIANT_TYPE);

    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var isRevert = false;
        if (this.variant.stage=='PRODUCTION') {
            this.variant.stage = 'DEVELOPMENT';
            isRevert = true;
        } else {
            this.variant.stage='PRODUCTION';
        }

        this._airlockService.updateVariant(this.variant).then(variant => {
            this.variant = variant;
            this.onUpdate.emit(this.variant);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Variant stage changed successfully"});
        }).catch(error => {
            let defErrorMessage = "Failed to change variant stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change variant stage. If this item has variants or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }

    getDeleteColor() {
        if (this.variant.stage=='PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    delete() {
        if (this.variant.stage=='PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this variant ('+this.getDisplayName()+")?";
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
        let variantName = this.getDisplayName();
        this._airlockService.deleteVariant(this.variant.uniqueId).then(resp => {
                this.onUpdate.emit(resp);
                this._airlockService.notifyDataChanged("success-notification",{title: "Success" ,
                                                                                 message:"The variant "+ variantName+ " was deleted"});


        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete variant");
            this._airlockService.notifyDataChanged("error-notification",errorMessage);
            this.onUpdate.emit(error);
        });
    }

    changeSendToAnalytic(){
        // if (this.isFeatureSendToAnalytics()){
        //     this.beforeUpdate.emit(null);
        //     console.log('delete variant from send to Analytic');
        //     this._airlockService.deleteFeatureSendToAnalytic(this.variant).then(feature => {
        //         this.variant = feature;
        //         this.onUpdate.emit(this.variant);
        //     }).catch(error => {
        //         console.log('Error in delete variant to send to Analytic');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic");
        //         this._airlockService.notifyDataChanged("error-notification", errorMessage);
        //         this.hideIndicator.emit(error);
        //     });
        // }
        // else {
        //     this.beforeUpdate.emit(null);
        //     console.log('update variant to send to Analytic');
        //     this._airlockService.updateFeatureSendToAnalytic(this.variant).then(feature => {
        //         this.variant = feature;
        //         this.onUpdate.emit(this.variant);
        //     }).catch(error => {
        //         console.log('Error in update variant to send to Analytic');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
        //         this._airlockService.notifyDataChanged("error-notification", errorMessage);
        //         this.hideIndicator.emit(error);
        //
        //     });
        // }
    }

    shouldShowUserGroups() {
        if (this.variant.stage=='DEVELOPMENT' &&
            !(this.variant.internalUserGroups==null || this.variant.internalUserGroups.length <=0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.variant.internalUserGroups==null || this.variant.internalUserGroups.length <=0)) {
            toRet = this.variant.internalUserGroups.toString();
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {

        let message = this.isFeatureSendToAnalytics()? this.getString('analytics_stop_report_config')+this.getDisplayName()+this.getString('analytics_report_config_suffix') : this.getString('analytics_report_config')+this.getDisplayName()+this.getString('analytics_report_config_suffix');
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

    isPartOfBranch():boolean {
        return true;
    }
    partOfBranch() {
        return true;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId==this.variant.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event":event, "id":this.variant.uniqueId, "offset":y })
            return true;
        } else {
            return false;
        }
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.variant);
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
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId==this.variant.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event":event, "id":this.variant.uniqueId, "offset":y })
            return true;
        } else {
            return false;
        }
    }

    getActiveUsersMessage():string {
        if (this.experiment && this.experiment.indexingInfo&& this.experiment.indexingInfo.uniqueUsers && this.experiment.indexingInfo.uniqueUsers[this.variant.name]) {
            var num = this.experiment.indexingInfo.uniqueUsers[this.variant.name];

            return num + " unique user" + ((num > 1) ? "s": "");
        }
        return "No users yet";
    }
}
