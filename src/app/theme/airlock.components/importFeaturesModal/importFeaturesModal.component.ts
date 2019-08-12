import {Component, Injectable, ViewEncapsulation, ViewChild, Input, AfterViewInit, NgZone} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import {Feature} from "../../../model/feature";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {Season} from "../../../model/season";
import 'select2';
import {} from "@angular/core";
import {Inject} from "@angular/core";
import {ElementRef} from "@angular/core";
import {FeatureUtilsService,FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {HirarchyTree} from "../hirarchyTree/hirarchyTree.component";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {TabsetConfig} from "ng2-bootstrap";
import {ShowMessageModal} from "../showMessageModal/showMessageModal.component";
import {ShowConflictsModal} from "../showConflictsModal/showConflictsModal.component";
import {ToastrService} from "ngx-toastr";
import {Branch} from "../../../model/branch";

@Component({
    selector: 'import-features-modal',
   providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./importFeaturesModal.scss')],
    template: require('./importFeaturesModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class ImportFeaturesModal{
    @ViewChild('importModal')
    modal: ModalComponent;
    @ViewChild(HirarchyTree)
    parentTree: HirarchyTree;
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('showConflictsModal')
    showConflictsModal: ShowConflictsModal;
    private uploadedFileContent:string;
    private isClear:boolean = false;
    private heading:string;
    loading: boolean = false;
    parentFeatureInFlatList: Array<FeatureInFlatList> = [];
    selectedParent:FeatureInFlatList;
    @Input() season:Season;
    @Input() targetBranch:Branch;
    feature: Feature;
    private previewRoot :Feature = null;
    conflictingStrings :Array<any> = null;
    conflictingStringsMessage :string = "";
    @Input() rootFeatuteGroups : Array<Feature>;
    @Input() root: Feature;
    @Output() onImportFeatures= new EventEmitter<any>();
    @Input() rootId: string;
    @Input()
    featurePath: Array<Feature> = [];
    previewFeaturePath: Array<Feature> = [];
    private elementRef:ElementRef;
    private isShowSuffix:boolean = false;
    private isShowMinApp:boolean = false;
    private isShowWarning:boolean = false;
    private hasReviewedWarning = false;
    private suffix:string;
    showImportFile:boolean=false;
    private minAppVersion:string;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    isPaste:boolean = false;
    copiedFeatureTitlePrefix : string;
    copiedFeatureTitleMain : string;
    copiedFeatureTitleSuffix : string;
    newFeatureId:string = null;
    private canShowPreview:boolean = false;
    private generalTabActive:boolean = true;
    private hirarchyTabActive:boolean = false;
    title: string;
    canSave:boolean;
    saveText = "Save";
    referenceOpen: boolean = false;
    previewOpen: boolean = false;
    constructor( private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                 private zone:NgZone, private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    initAfterClose(){
        this.feature = null;
        this.referenceOpen=true;
        this.previewOpen=false;
        this.showImportFile = false;
        this.isPaste=false;
        this.isClear = false;
        this.selectedParent=null;
        this.uploadedFileContent=null;
        this.previewRoot=null;
        this.suffix=null;
        this.minAppVersion=null;
        this.generalTabActive = true;
        this.canShowPreview = false;
        this.hirarchyTabActive = false;
        this.copiedFeatureTitlePrefix = "";
        this.copiedFeatureTitleMain= "";
        this.copiedFeatureTitleSuffix = "";
        this.canSave=false;
        this.previewFeaturePath = [];
        this.newFeatureId = null;
        this.conflictingStringsMessage = "";
        this.conflictingStrings = null;
        this.isShowWarning = false;
        this.hasReviewedWarning = false;
        this.removeAll();
    }

    selectGeneralPage(){
        this.generalTabActive = true;
        this.hirarchyTabActive=false;
    }
    moveToPreviewTab(){
        this.canShowPreview = true;
        this.generalTabActive = false;
        this.hirarchyTabActive=true;
    }
    validate(dontPopValidationErrors:boolean = false) {
        if(!this.isPaste && this.uploadedFileContent == null){
            this.create(this._stringsSrevice.getString("import_features_select_file"),"Validation Failed");
            return;
        }
        if(this.selectedParent == null){
            this.create(this._stringsSrevice.getString("import_features_select_parent"),"Validation Failed");
            return;
        }
        if(this.isPaste){
            this.validateCopy(dontPopValidationErrors);
        }else{
            this.validateImport();
        }
    }

    validateImport(){
        this.loading = true;
        var targetBranch = (this.targetBranch.uniqueId != null)?this.targetBranch.uniqueId:'MASTER';
        this._airLockService.validateImportFeature(this.uploadedFileContent,this.selectedParent.feature.uniqueId,targetBranch,this.suffix,this.minAppVersion).then(res => {
            this.handleValidationSucceed(res);
        })
            .catch(error => {
                this.handleValidationError(false,error);
            });
    }
    openWarning(){
        this.showConflictsModal.open("Conflicting Assets", this.conflictingStringsMessage);
        this.hasReviewedWarning = true
        if(this.isPaste){
            this.saveText = "Paste (Ignore Warnings)"
        }
        else{
            this.saveText = "Import (Ignore Warnings)"
        }

    }
    handleValidationError(dontPopValidationErrors:boolean = false,error:any){
        console.log(error);
        this.loading = false;
        var shouldShowGeneralErrorMessgae:boolean = true;
        var serverErrorMessage = error._body;
        try{
            var errorJson = JSON.parse(serverErrorMessage);
            var errorMessage:string="";
            if(errorJson.illegalMinAppVersion != null && errorJson.illegalMinAppVersion.length > 0){
                if(this.minAppVersion == null){
                    errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
                }else{
                    errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
                }
                this.isShowMinApp = true;
            }
            if(errorJson.illegalGivenMinAppVersion != null){
                errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
            }
            if(errorJson.illegalName != null && errorJson.illegalName.length > 0){
                if(this.suffix == null){
                    errorMessage += this._stringsSrevice.getString("import_features_provide_suffix");
                }else{
                    errorMessage += this._stringsSrevice.getString("import_features_change_suffix");
                }
                this.isShowSuffix = true;
            }
            if(errorJson.error != null){
                errorMessage += errorJson.error;
            }

            var isMissingUtilities = (errorJson.missingUtilities != null  && errorJson.missingUtilities.length > 0);
            if(isMissingUtilities){
                errorMessage += this._stringsSrevice.getString("import_features_missing_utils");
                for(let util of errorJson.missingUtilities) {
                    errorMessage += util +'\n';
                }

            }
            var isMissingContextFields = (errorJson.missingFields != null  && errorJson.missingFields.length > 0);
            if(isMissingContextFields){
                errorMessage += this._stringsSrevice.getString("import_features_missing_fields");
                for(let field of errorJson.missingFields) {
                    errorMessage += field +'\n';
                }

            }
            var isMissingAssets = (errorJson.missingAssets != null  && errorJson.missingAssets.length > 0);
            if(isMissingAssets){
                errorMessage += this._stringsSrevice.getString("import_features_missing_assets");
                for(let asset of errorJson.missingAssets) {
                    errorMessage += asset.name +'\n';
                }

            }
            //{"missingFields":[],"missingUtilities":["isTrue"]}

            //show pop up message if needed and mute the general error in case dontPopValidationErrors is true
            //and this is expected error (suffix,min version or missing assets)
            if(errorJson.error != null || isMissingAssets ||  isMissingUtilities || isMissingContextFields || !dontPopValidationErrors) {
                this.showMessageModal.open("Validation Failed", errorMessage);
                shouldShowGeneralErrorMessgae = false;
            }else{
                shouldShowGeneralErrorMessgae = ((dontPopValidationErrors && errorMessage != "") == false);
            }

        }catch (e){
            console.log(e);
        }
        if(shouldShowGeneralErrorMessgae){
            this.showMessageModal.open("Validation Failed", "Request failed, try again later.");
        }

    }
    handleValidationSucceed(res:any){
        console.log(res);
        this.conflictingStrings = res.stringsInConflict as Array<any>
        if(this.conflictingStrings.length!=0){
            this.conflictingStringsMessage = this.getString("copystrings_conflict_prefix");
            for(let conflict of this.conflictingStrings) {
                this.conflictingStringsMessage += "\nString ID: '"+ conflict.key+"'\n Source value: "+ conflict.sourceValue + "\n Destination value: "
              + conflict.destValue + "\n"
            }
            this.isShowWarning = true;
            this.hasReviewedWarning = false;
            this.saveText = "Review Warnings"
        }
        this.previewRoot = res.updatedSeasonsFeatures as Feature;
        this.loading = false;
        this.canSave=true;
        this.newFeatureId = res.newSubTreeId;
        this.moveToPreviewTab();
        this.loading = false;
        this.referenceOpen=false;
        this.previewOpen=true;
    }
    validateCopy(dontPopValidationErrors:boolean = false){
        this.loading = true;
        var targetBranch = (this.targetBranch.uniqueId != null)?this.targetBranch.uniqueId:'MASTER';
        this._airLockService.validateCopyFeature(this._airLockService.getCopiedFeature().uniqueId,this._airLockService.getCopiedFeatureBranch().uniqueId,this.selectedParent.feature.uniqueId,targetBranch,this.suffix,this.minAppVersion).then(res => {
            this.handleValidationSucceed(res);
        })
            .catch(error => {
                this.handleValidationError(dontPopValidationErrors,error);
            });
    }
    save() {
        if(this.isShowWarning == true && this.hasReviewedWarning == false){
            this.openWarning();
            return;
        }
        if(!this.isPaste && this.uploadedFileContent == null){
            this.create(this._stringsSrevice.getString("import_features_select_file"));
            return;
        }
        if(this.selectedParent == null){
            this.create(this._stringsSrevice.getString("import_features_select_parent"));
            return;
        }
        console.log(this.uploadedFileContent);
        console.log(this.selectedParent.feature.uniqueId);
        if(!this.isPaste){
            this._saveImported();
        }else{
            this._savePasted();
        }
    }

    _savePasted(){
        this.loading = true;
        var targetBranch = (this.targetBranch.uniqueId != null)?this.targetBranch.uniqueId:'MASTER';
        this._airLockService.copyFeature(this._airLockService.getCopiedFeature().uniqueId,this._airLockService.getCopiedFeatureBranch().uniqueId,this.selectedParent.feature.uniqueId,targetBranch,this.suffix,this.minAppVersion).then(() => {
            this.loading = false;
            this._airLockService.setCopiedFeature(null,null);
            this.onImportFeatures.emit(null);
            this.close();
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Feature pasted successfully"});
        })
            .catch(error => this.handleError(error));

    }
    _saveImported() {
        this.loading = true;
        var targetBranch = (this.targetBranch.uniqueId != null)?this.targetBranch.uniqueId:'MASTER';
        this._airLockService.importFeature(this.uploadedFileContent,this.selectedParent.feature.uniqueId,targetBranch,this.suffix,this.minAppVersion).then(() => {
            this.loading = false;
            this.onImportFeatures.emit(null);
            this.close();
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Feature imported successfully"});
        })
            .catch(error => this.handleError(error));
    }


    openFile(event) {
        let input = event.target;
        for (var index = 0; index < input.files.length; index++) {
            let reader = new FileReader();
            reader.onload = () => {
                var text = reader.result;
                this.uploadedFileContent = text;
                console.log(text);
            };
            reader.readAsText(input.files[index]);
        }
    }
    handleError(error: any,title:string ="Save failed") {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = error._body || "Request failed, try again later.";
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        console.log("handleError in import features:"+errorMessage);
        console.log(error);
        this.showMessageModal.open(title,errorMessage);
    }
    close(){
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }
    getPreviewTitle(){
        if(this.canShowPreview){
            return this.getString("import_feature_preview_accordion_title_available");
        }else{
            return this.getString("import_feature_preview_accordion_title_not_available");
        }
    }
    open(isPaste:boolean,parent:Feature) {

        this.isPaste = isPaste;
        this.isOpen = true;
        this.isClear=true;
        this.isShowSuffix=false;
        this.isShowMinApp=false;
        this.loading = false;
        this.referenceOpen=true;
        this.previewOpen=false;
        if(isPaste){
            this.copiedFeatureTitleMain =  this._airLockService.getCopiedFeature().name;
            this.title = this.getString("paste_features_title")  +this.copiedFeatureTitleMain;
            this.heading = this.getString("paste_features_tab_title");
            this.copiedFeatureTitlePrefix = "Paste ";
            this.copiedFeatureTitleSuffix  =" feature";
            this.saveText = "Paste"

        }else {
            this.showImportFile = true;
            this.title = this.getString("import_features_title");
            this.heading = this.getString("import_features_tab_title");
            this.saveText = "Import"
        }
        this.parentFeatureInFlatList = this._featureUtils.getPossibleParentsInFlatList(this.rootFeatuteGroups,this.rootId,false);
        this.selectNewParent(parent);
        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.modal.open('lg');
                if(isPaste){
                    this.validate(true);
                }
            });

        }
    }

    addFeatureToPath(curPath:Array<Feature>,curFeature:FeatureInFlatList){
        if(curFeature == null){
            return;
        }
        curPath.push(curFeature.feature);

        if(curFeature.parent != null) {
            var parentAsList: FeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList, curFeature.parent.uniqueId);
            this.addFeatureToPath(curPath, parentAsList);
        }
    }
    selectParent(parent:FeatureInFlatList){
        console.log("selectParent");
        if(parent.feature.uniqueId != this.feature.uniqueId){
            if(!this._featureUtils.isContainCycle(parent.feature,this.feature.features)) {
                this.selectedParent = parent;
            }else{
                alert("Can't set feature parent to the feature which is his son");
            }
        }else{
            alert("Can't set feature parent to the feature itself");
        }

    }

    selectNewParent(parent:Feature) {
        if(parent == null){
            return;
        }
        var parentAsList: FeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList,parent.uniqueId);
        this.selectedParent = parentAsList;
        var parents:Array<Feature> = [];
        this.addFeatureToPath(parents,parentAsList);
        parents.reverse();
        this.previewFeaturePath = parents;
    }

     /////////////////////////////////////////
    //notifications stuff
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: "visible",
        rtl: false,
        animate: "scale",
        position: ["right", "bottom"]
    };

    create(message:string,title:string = "Save failed") {
        this.toastrService.error(message, title, {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }
    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

}



