import {Component, ViewEncapsulation, ViewChild, Input, NgZone} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {Season} from "../../../model/season";
import 'select2';
import {} from "@angular/core";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {TabsetConfig} from "ng2-bootstrap";
import {ShowMessageModal} from "../showMessageModal/showMessageModal.component";
import {ToastrService} from "ngx-toastr";
export enum TranslationImportExportType {
    ANDROID,
    IOS,
    JSON
}

@Component({
    selector: 'import-strings-modal',
   providers: [TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./importStringsModal.scss')],
    template: require('./importStringsModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class ImportStringsModal{
    @ViewChild('importStringsModal')
    modal: ModalComponent;
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    ////
    //private uploadedFileContent:string;
    private uploadedFileContent:any;
    private isClear:boolean = false;
    private heading:string;
    loading: boolean = false;
    @Input() season:Season;
    @Output() onCopyStrings= new EventEmitter<any>();
    showImportFile:boolean=false;
    loaded = false;
    isOpen:boolean = false;
    isPaste:boolean = false;
    preserveFormat:boolean = false;
    seasonId:string;
    hasConflict: boolean = false;
    leadingText: string = "";
    conflictText: string = "";
    addingText: string = "";
    private canShowPreview:boolean = false;
    private generalTabActive:boolean = true;
    shouldHideModal = true
    title: string;
    canSave:boolean;
    saveText = "Save";
    saveTextOverwrite = "Save";
    referenceOpen: boolean = false;
    previewOpen: boolean = false;
    buttonText:string = "Format";
    platforms:string[] = ["Android", "iOS", "JSON"];
    selectedActionTypeIndex:number = -1;
    constructor( private _airLockService:AirlockService, private zone:NgZone, private _notificationService: NotificationsService,
                 private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        ;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    initAfterClose(){
        this.referenceOpen=true;
        this.previewOpen=false;
        this.showImportFile = false;
        this.isPaste=false;
        this.isClear = false;
        this.uploadedFileContent=null;
        this.generalTabActive = true;
        this.canShowPreview = false;
        this.canSave=false;
        this.hasConflict = false;
        this.removeAll();
    }

    selectItem(index:number){
        console.log("index:"+index);
        this.selectedActionTypeIndex=index;
        this.buttonText = this.platforms[index];
        //this.setLinks();
    }
    selectGeneralPage(){
        this.generalTabActive = true;
    }
    moveToPreviewTab(){
        this.canShowPreview = true;
        this.generalTabActive = false;
    }
    validate(dontPopValidationErrors:boolean = false) {
        if(!this.isPaste && this.uploadedFileContent == null){
            this.create(this._stringsSrevice.getString("import_features_select_file"),"Validation Failed");
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
        if (this.selectedActionTypeIndex == TranslationImportExportType.ANDROID) {
            this._airLockService.validateImportStringsAsZip(this.seasonId, this.uploadedFileContent, "ANDROID", this.preserveFormat).then(res => {
                this.handleValidationSucceed(res);
            })
            .catch(error => {
                this.handleValidationError(false,error);
            });
        }
        else if (this.selectedActionTypeIndex == TranslationImportExportType.IOS) {
            console.log('TranslationImportExportType is IOS');
            this._airLockService.validateImportStringsAsZip(this.seasonId, this.uploadedFileContent, "IOS", this.preserveFormat).then(res => {
                this.handleValidationSucceed(res);
            })
                .catch(error => {
                    this.handleValidationError(false,error);
                });

        }
        else if (this.selectedActionTypeIndex == TranslationImportExportType.JSON) {
            this._airLockService.validateImportStrings(this.seasonId,this.uploadedFileContent).then(res => {
                this.handleValidationSucceed(res);
            })
            .catch(error => {
                this.handleValidationError(false,error);
            });
        }
        ////////////////

        /*this.loading = true;
        this._airLockService.validateImportStrings(this.seasonId,this.uploadedFileContent).then(res => {
            this.handleValidationSucceed(res);
        })
        .catch(error => {
            this.handleValidationError(false,error);
        });*/

    }
    handleValidationError(dontPopValidationErrors:boolean = false,error:any){
        this.loading = false;
        var serverErrorMessage = error._body || "Request failed, try again later.";
        try{
            var errorJson = JSON.parse(serverErrorMessage);
            var errorMessage:string="";
            if(errorJson.error != null){
                errorMessage += errorJson.error;
            }
            if(errorJson.error != null || !dontPopValidationErrors) {
                this.showMessageModal.open("Validation Failed", errorMessage);
            }
        }catch (e){
            console.log(e);
            this._airLockService.notifyDataChanged("error-notification",{title:"Error",message:"String were not copied"});
            this.close()
        }
    }
    handleValidationSucceed(res:any){
        console.log(res);
        if(!this.isPaste){
            var num =0;
            var stringKeys = "";
            if(res.addedStrings != undefined && res.addedStrings.length != 0){
                num += res.addedStrings.length;
                for(let added of res.addedStrings){
                    stringKeys += added.key+", " + "\n"
                }
            }
            if (res.nonConflictingStrings != undefined && res.nonConflictingStrings.length != 0) {
                num += res.nonConflictingStringsSize;
                for(let nonConflict of res.nonConflictingStrings){
                    stringKeys += "ID: "+ nonConflict.key+ " Value: "+nonConflict.value+ "\n"
                }
            }
            if(num != 0){
                var plural = "";
                if(num != 1){
                    plural = "s";
                }
                this.addingText += +num+" string"+plural+" will be imported: \n" + stringKeys;
            }

        }
        if(res.stringsInConflict != undefined && res.stringsInConflict.length != 0){
            this.hasConflict = true;
            this.shouldHideModal = false;
            var numOfConflict = res.stringsInConflictSize;
            if(numOfConflict != 1){
                this.conflictText = "\nThere are "+ numOfConflict+ " strings in conflict:\n";
            }
            else{
                this.conflictText = "\nThere is 1 string in conflict:\n";
            }
            var prodConflicts = [];
            var devConflicts = [];
            for(let conflict of res.stringsInConflict){
                if(conflict.stage == "PRODUCTION"){
                    prodConflicts.push(conflict)
                }
                else devConflicts.push(conflict)
            }
            if(prodConflicts.length != 0){
                this.conflictText +=  "\nIn Production: \n";
                this.appendConflicts(prodConflicts);
            }
            if(devConflicts.length != 0){
                this.conflictText +=  "\nIn Development: \n";
                this.appendConflicts(devConflicts);
            }
             this.loading = false;
             this.canSave=true;
             this.moveToPreviewTab();
             this.loading = false;
             this.referenceOpen=false;
             this.previewOpen=true;

        }
        else {
            this.hasConflict = false;
            this.conflictText = "\nThere are no conflicts."
             if(this.isPaste){
                setTimeout(() => {
                    this.save(false)
                }, 500);
             }
             else{
                 this.loading = false;
                 this.canSave=true;
                 this.moveToPreviewTab();
                 this.loading = false;
                 this.referenceOpen=false;
                 this.previewOpen=true;
             }
        }
    }
    appendConflicts( conflictsArray){
        for(let conflict of conflictsArray){
            this.conflictText +=  "\nString ID: "+ conflict.key+"\n";
            for(let conflictField of conflict.conflictingFields){
                var name = conflictField.fieldName;
                if(name == "translations"){
                    this.conflictText += "Conflicting values in locale(s): "+ conflictField.sourceField + "\n";
                }
                else if (name == "variant"){
                    this.conflictText += "Conflicting translations variants.\n";
                }
                else if (name == "stage"){
                    this.conflictText += "Source " + name + ": " + conflictField.sourceField + "\nDestination " + name + " (cannot be overwritten)"+ ": " + conflictField.destField + "\n";
                }
                else {
                    this.conflictText += "Source " + name + ": " + conflictField.sourceField + "\nDestination " + name + ": " + conflictField.destField + "\n";
                }
            }
        }
    }
    validateCopy(dontPopValidationErrors:boolean = false){
        this.loading = true;
        this._airLockService.validateCopyStrings(this.seasonId,this._airLockService.getCopiedStrings()).then(res => {
            this.handleValidationSucceed(res);
        })
        .catch(error => {
            this.handleValidationError(dontPopValidationErrors,error);
        });
    }
    save(overwrite:boolean) {
       if(!this.isPaste){
            this._saveImported(overwrite);
        }else{
            this._savePasted(overwrite);
        }
    }

    _savePasted(overwrite:boolean){
        this.loading = true;
        this._airLockService.copyStrings(this.seasonId,this._airLockService.getCopiedStrings(),overwrite).then(res => {
            this.loading = false;
            this.onCopyStrings.emit(null);
            this.close();

            var successMessage ="";
            if(res.addedStrings != undefined && res.addedStrings.length != 0){
                var num = res.addedStringsSize;
                if(num == 1){
                    successMessage += num + " string was successfully pasted.\n";
                }else{
                    successMessage += num + " strings were successfully pasted.\n";
                }

            }
            if(res.stringsOverride != undefined && res.stringsOverride.length != 0){
                var num = res.stringsOverrideSize;
                if(num == 1){
                    successMessage += num + " string was successfully overwritten.\n";
                }else{
                    successMessage += num + " strings were successfully overwritten.\n";
                }

            }
            if(res.nonConflictingStrings != undefined && res.nonConflictingStrings.length != 0){
                var num = res.nonConflictingStringsSize;
                if(num == 1){
                    successMessage += num + " string not pasted since it already existed.\n";
                }else{
                    successMessage += num + " strings not pasted since they already existed.\n";
                }

            }
            if(res.stringsInConflict != undefined && res.stringsInConflict.length != 0){
                var num = res.stringsInConflictSize;
                if(num == 1){
                    successMessage += num + " string was not overwritten.\n";
                }else{
                    successMessage += num + " strings were not overwritten.\n";
                }

            }
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:successMessage});
        }).catch(error => this.handleError(error));

    }

    _saveImported(overwrite:boolean) {
        this.loading = true;

        if (this.selectedActionTypeIndex == TranslationImportExportType.ANDROID) {
            this._airLockService.importStringsByModeAsZip("ACT",this.seasonId, "ANDROID", this.uploadedFileContent,overwrite, this.preserveFormat).then(res => {
                this.loading = false;
                this.onCopyStrings.emit(null);
                this.close();
                var successMessage ="";
                if(res.addedStrings != undefined && res.addedStrings.length != 0){
                    var num = res.addedStringsSize;
                    if(num == 1){
                        successMessage += num + " string was successfully imported.\n";
                    }else{
                        successMessage += num + " strings were successfully imported.\n";
                    }

                }
                if(res.stringsOverride != undefined && res.stringsOverride.length != 0){
                    var num = res.stringsOverrideSize;
                    if(num == 1){
                        successMessage += num + " string was successfully overwritten.\n";
                    }else{
                        successMessage += num + " strings were successfully overwritten.\n";
                    }
                }
                if(res.nonConflictingStrings != undefined && res.nonConflictingStrings.length != 0){
                    var num = res.nonConflictingStringsSize;
                    if(num == 1){
                        successMessage += num + " string not imported since it already existed.\n";
                    }else{
                        successMessage += num + " strings not imported since they already existed.\n";
                    }

                }
                if(res.stringsInConflict != undefined && res.stringsInConflict.length != 0){
                    var num = res.stringsInConflictSize;
                    if(num == 1){
                        successMessage += num + " string was not overwritten.\n";
                    }else{
                        successMessage += num + " strings were not overwritten.\n";
                    }

                }
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:successMessage});
            })
                .catch(error => this.handleError(error));

        }
        else if (this.selectedActionTypeIndex == TranslationImportExportType.IOS) {
            console.log('TranslationImportExportType is IOS');
            this._airLockService.importStringsByModeAsZip("ACT",this.seasonId, "IOS", this.uploadedFileContent,overwrite, this.preserveFormat).then(res => {
                this.loading = false;
                this.onCopyStrings.emit(null);
                this.close();
                var successMessage ="";
                if(res.addedStrings != undefined && res.addedStrings.length != 0){
                    var num = res.addedStringsSize;
                    if(num == 1){
                        successMessage += num + " string was successfully imported.\n";
                    }else{
                        successMessage += num + " strings were successfully imported.\n";
                    }

                }
                if(res.stringsOverride != undefined && res.stringsOverride.length != 0){
                    var num = res.stringsOverrideSize;
                    if(num == 1){
                        successMessage += num + " string was successfully overwritten.\n";
                    }else{
                        successMessage += num + " strings were successfully overwritten.\n";
                    }
                }
                if(res.nonConflictingStrings != undefined && res.nonConflictingStrings.length != 0){
                    var num = res.nonConflictingStringsSize;
                    if(num == 1){
                        successMessage += num + " string not imported since it already existed.\n";
                    }else{
                        successMessage += num + " strings not imported since they already existed.\n";
                    }

                }
                if(res.stringsInConflict != undefined && res.stringsInConflict.length != 0){
                    var num = res.stringsInConflictSize;
                    if(num == 1){
                        successMessage += num + " string was not overwritten.\n";
                    }else{
                        successMessage += num + " strings were not overwritten.\n";
                    }

                }
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:successMessage});
            })
                .catch(error => this.handleError(error));

        }
        else if (this.selectedActionTypeIndex == TranslationImportExportType.JSON) {
            this._airLockService.importStrings(this.seasonId,this.uploadedFileContent,overwrite).then(res => {
                this.loading = false;
                this.onCopyStrings.emit(null);
                this.close();
                var successMessage ="";
                if(res.addedStrings != undefined && res.addedStrings.length != 0){
                    var num = res.addedStringsSize;
                    if(num == 1){
                        successMessage += num + " string was successfully imported.\n";
                    }else{
                        successMessage += num + " strings were successfully imported.\n";
                    }
                }
                if(res.stringsOverride != undefined && res.stringsOverride.length != 0){
                    var num = res.stringsOverrideSize;
                    if(num == 1){
                        successMessage += num + " string was successfully overwritten.\n";
                    }else{
                        successMessage += num + " strings were successfully overwritten.\n";
                    }

                }
                if(res.nonConflictingStrings != undefined && res.nonConflictingStrings.length != 0){
                    var num = res.nonConflictingStringsSize;
                    if(num == 1){
                        successMessage += num + " string not imported since it already existed.\n";
                    }else{
                        successMessage += num + " strings not imported since they already existed.\n";
                    }
                }
                if(res.stringsInConflict != undefined && res.stringsInConflict.length != 0){
                    var num = res.stringsInConflictSize;
                    if(num == 1){
                        successMessage += num + " string was not overwritten.\n";
                    }else{
                        successMessage += num + " strings were not overwritten.\n";
                    }
                }
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:successMessage});
            })
                .catch(error => this.handleError(error));

        }
    }

    isOpenFileDisabled(){
        if (this.selectedActionTypeIndex == -1)
            return true;
        else
            return false;
    }

    isFileChooserJSONFormat(){
        if (this.selectedActionTypeIndex == TranslationImportExportType.JSON) {
            console.log('isFileChooserJSONFormat is JSON');
            return true;
        }
        else{
            console.log('isFileChooserJSONFormat is ZIP');
            return false;
        }

    }

    isIosOrAndroidFormat() {
        return this.selectedActionTypeIndex == TranslationImportExportType.IOS
            || this.selectedActionTypeIndex == TranslationImportExportType.ANDROID;
    }
    clickOpenFile(event) {
        let input = event.target
        input.value = null;
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
            //reader.readAsText(input.files[index]);
            //reader.readAsBinaryString(input.files[index]);
            //reader.readAsDataURL(input.files[index]);

            if (this.selectedActionTypeIndex == -1) {
                this.loading = false;
                this.showMessageModal.open("Warning", this.getString("export_type_unavailable"));
            }
            else {
                if (this.selectedActionTypeIndex == TranslationImportExportType.ANDROID) {
                    console.log('TranslationImportExportType is ANDROID');
                    reader.readAsArrayBuffer(input.files[index]);

                }
                else if (this.selectedActionTypeIndex == TranslationImportExportType.IOS) {
                    console.log('TranslationImportExportType is IOS');
                    reader.readAsArrayBuffer(input.files[index]);
                }
                else if (this.selectedActionTypeIndex == TranslationImportExportType.JSON) {
                    console.log('TranslationImportExportType is JSON');
                    reader.readAsText(input.files[index]);
                }
                setTimeout(() => {
                    this.validate()
                }, 500);
            }
        }
    }

    showRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/import-export-strings');
    }

    handleError(error: any,title:string ="Save failed") {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage =  "Request failed, try again later.";
        try {
            if (error != null && typeof error._body === 'string') {
                errorMessage = error._body;
            }
            if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }catch(e){


        }
        console.log("handleError in import features:"+errorMessage);
        console.log(error);
        this.showMessageModal.open(title,errorMessage);
    }
    close(){
        this.isOpen = false;
        this.conflictText = "";
        this.addingText = "";
        this.initAfterClose();
        this.loaded = false;
        this.loading=false;
        this.modal.close();
    }

    open(isPaste:boolean,seasonId:string) {

        this.isPaste = isPaste;
        this.seasonId = seasonId;
        this.isOpen = true;
        this.isClear=true;
        this.loading = false;
        this.referenceOpen=true;
        this.previewOpen=false;

        if(isPaste){
            this.shouldHideModal = true;
            this.title = this.getString("paste_features_title");
            this.heading = this.getString("paste_strings_tab_title");
            this.saveText = "Paste"
            this.saveTextOverwrite = "Paste and Overwrite"
            this.leadingText = this.getString('overwrite_strings_content_paste');
        }else {
            this.shouldHideModal = false;
            this.showImportFile = true;
            this.title = this.getString("import_strings_title");
            this.heading = this.getString("import_strings_tab_title");
            this.saveText = "Import"
            this.saveTextOverwrite = "Import and Overwite"
            this.leadingText = this.getString('overwrite_strings_content_import');
        }
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

    removeAll() { this._notificationService.remove() }
    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

}



