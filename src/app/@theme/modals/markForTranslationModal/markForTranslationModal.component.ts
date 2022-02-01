import {Component, EventEmitter, Output, NgZone, ViewChild} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Season} from "../../../model/season";
import {Inject} from "@angular/core";
import {ElementRef} from "@angular/core";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {StringToTranslate} from "../../../model/stringToTranslate";
import {
    NbDialogRef,
    NbDialogService,
    NbGlobalLogicalPosition,
    NbPopoverDirective,
    NbToastrService
} from "@nebular/theme";
import {ConfirmActionModal} from "../confirmActionModal";
export enum TranslationImportExportType {
    ANDROID,
    IOS,
    JSON
}

export enum MarkType {MARK,REVIEW,SEND,COPY,EXPORT}
@Component({
    selector: 'mark-for-translation-modal',
    styleUrls: ['./markForTranslationModal.scss'],
    templateUrl: './markForTranslationModal.html',
})

export class MarkForTranslationModal{
    @Output() outputStatusChanged : EventEmitter<any> = new EventEmitter();
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    strings: StringToTranslate[];
    inputStrings: StringToTranslate[];
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
    loading: boolean = false;
    private elementRef:ElementRef;
    loaded = false;
    isOpen:boolean = false;
    title: string;
    selectedIds:string[] = [];
    markStatus:any = {};
    isMark:boolean=false;
    isReview:boolean=false;
    isSend:boolean=false;
    isCopy:boolean=false;
    isExport:boolean=false;
    continueText:string = "Save"
    actionTitle:string;
    season:Season;
    selectedRowIDs: string[] = [];


    buttonText:string = "Format";
    platforms:string[] = ["Android", "iOS", "JSON"];
    selectedActionTypeIndex:number = -1;
    constructor(
                private _airLockService:AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils:FeatureUtilsService,
                private authorizationService:AuthorizationService,
                private zone:NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<MarkForTranslationModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
        this.loading = false;
        this.title = this.getString("add_context_to_whitelist_title");
        this.isOpen = true;
        this.strings=this.getOrderedStrings(this.inputStrings);
        this.selectedIds =[];
        this.markStatus = {};
        // this.isMark = (markType == MarkType.MARK);
        // this.isReview = (markType == MarkType.REVIEW);
        // this.isSend = (markType == MarkType.SEND);
        // this.isCopy = (markType == MarkType.COPY);
        // this.isExport = (markType == MarkType.EXPORT);
        if(this.isMark){
            this.actionTitle =  this.getString("mark_for_translation_leading_txt");
        }
        if(this.isReview){
            this.actionTitle =  this.getString("review_for_translation_leading_txt");
        }
        if(this.isSend){
            this.actionTitle =  this.getString("send_for_translation_leading_txt");
        }
        if(this.isCopy){
            this.continueText ="Copy";
            this.actionTitle =  this.getString("copy_strings_leading_txt");
        }
        if(this.isExport){
            this.continueText = "Export";
            this.actionTitle =  this.getString("export_strings_leading_txt");
        }

        for (let s of this.strings){
            this.markStatus[s.uniqueId] = false;
        }
        this.selectIDs(this.selectedRowIDs);
    }
    initAfterClose(){

    }

    checkButton(id){
        // markStatus[id] = !markStatus[id];
        // var index = this.selectedIds.indexOf(id, 0);
        // if(index > -1){
        //     this.selectedIds.splice(index, 1);
        // }else{
        //     this.selectedIds.push(id);
        // }
        // console.log(this.selectedIds);
    }
    save() {
        this.loading = true;
        this.selectedIds =[];
        console.log('markStatus', this.markStatus);
        console.log('selectedActionTypeIndex:', this.selectedActionTypeIndex);
        for (var key in this.markStatus) {
            if (this.markStatus.hasOwnProperty(key)) {
                if(this.markStatus[key]){
                    this.selectedIds.push(key);
                }
            }
        }
        console.log(this.selectedIds);
        if(this.isMark){
            this._airLockService.markStringForTranslation(this.season.uniqueId, this.selectedIds).then(res => {
                this.loading = false;
                this.outputStatusChanged.emit(null);
                this.close();
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            });

        }else if(this.isReview){
                this._airLockService.reviewStringForTranslation(this.season.uniqueId, this.selectedIds).then(res => {
                    this.loading = false;
                    this.outputStatusChanged.emit(null);
                    this.close();
                }).catch(error => {
                    this.loading = false;
                    this.handleError(error);
                });
        }else if(this.isSend) {
                this._airLockService.sendStringForTranslation(this.season.uniqueId, this.selectedIds).then(res => {
                    this.loading = false;
                    this.outputStatusChanged.emit(null);
                    this.close();
                }).catch(error => {
                    this.loading = false;
                    this.handleError(error);
                });
        }
        else if (this.isCopy){
            if(this.selectedIds.length >99){
                this.loading = false;
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        shouldDisplaySubmit: false,
                        title: 'Error',
                        message: this.getString("copystrings_size_limit"),
                        defaultTitle: 'OK'
                    }
                })
                // this.showMessageModal.open("Error",this.getString("copystrings_size_limit"));
            }
            else {
                this._airLockService.setCopiedStrings(this.selectedIds)
                this.loading = false;
                this.close();
            }
        }
        else{
            if(this.selectedIds.length >99){
                this.loading = false;
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        shouldDisplaySubmit: false,
                        title: 'Error',
                        message: this.getString("export_size_limit"),
                        defaultTitle: 'OK'
                    }
                })
                // this.showMessageModal.open("Error",this.getString("export_size_limit"));
            }
            else if (this.selectedActionTypeIndex == -1){
                this.loading = false;
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        shouldDisplaySubmit: false,
                        title: 'Warning',
                        message: this.getString("export_type_unavailable"),
                        defaultTitle: 'OK'
                    }
                })
                // this.showMessageModal.open("Warning",this.getString("export_type_unavailable"));
            }
            else {
                if (this.selectedActionTypeIndex == TranslationImportExportType.ANDROID){
                    console.log('TranslationImportExportType is ANDROID');
                    this._airLockService.downloadStringsToFormat(this.season.uniqueId, this.selectedIds, 'ANDROID');
                    this.loading = false;
                    this.close();
                }
                else if (this.selectedActionTypeIndex == TranslationImportExportType.IOS){
                    console.log('TranslationImportExportType is IOS');
                    this._airLockService.downloadStringsToFormat(this.season.uniqueId, this.selectedIds, 'IOS');
                    this.loading = false;
                    this.close();
                }
                else if (this.selectedActionTypeIndex == TranslationImportExportType.JSON) {
                    this._airLockService.downloadStrings(this.season.uniqueId, this.selectedIds);
                    this.loading = false;
                    this.close();
                }
                else {
                    console.log('Wrong Translation Export type');
                    this.loading = false;
                    this.close();
                }
            }
        }

        // this.promptSaveContextFields();
    }

    handleError(error: any,title:string = "Save Failed") {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = error._body || "Request failed, try again later.";

        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        console.log("handleError in editFeatureModal:"+errorMessage);
        console.log(error);
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                shouldDisplaySubmit: false,
                title: title,
                message: errorMessage,
                defaultTitle: 'OK'
            }
        })
        // this.showMessageModal.open(title,errorMessage);
    }
    close(){
        this.isOpen = false;
        this.strings=null;
        this.markStatus = {};
        this.initAfterClose();
        this.loaded = false;
        this.isMark = true;
        this.modalRef.close();
        this.continueText = "Save"
    }

    unSelectAll(){
        for (var key in this.markStatus) {
            if (this.markStatus.hasOwnProperty(key)) {
                this.markStatus[key] = false;
            }
        }
    }

    selectAll(){
        for (var key in this.markStatus) {
            if (this.markStatus.hasOwnProperty(key)) {
                this.markStatus[key] = true;
            }
        }
    }

    selectItem(index:number){
        this.popover?.hide();
        console.log("index:"+index);
        this.selectedActionTypeIndex=index;
        this.buttonText = this.platforms[index];
        //this.setLinks();
    }

    selectIDs(selectedRowsIDs: string[]) {
        for (var key of selectedRowsIDs) {
            if (this.markStatus.hasOwnProperty(key)) {
                this.markStatus[key] = true;
            }
        }
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.zbbezhz9dcc3');
    }
    showRuleHelpExport() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.adzqn241uqku');
    }

    getOrderedStrings(strings: StringToTranslate[]){
        if(strings == null){
            return null;
        }
        if(strings.length == 0){
            return strings;
        }
        var sortedArray: StringToTranslate[] = strings.sort((n1,n2) => {
            if(n1 == null || n1.key == null){
                return -1;
            }
            if(n2 == null || n2.key == null){
                return 1;
            }
            return n1.key.localeCompare(n2.key);
        });
        return sortedArray;

    }
    open(strings: StringToTranslate[], season:Season,markType:MarkType, selectedRowsIDs:string[]) {

        this.loading = false;
        this.title = this.getString("add_context_to_whitelist_title");
        this.isOpen = true;
        this.season = season;
        this.strings=this.getOrderedStrings(this.strings);
        this.selectedIds =[];
        this.markStatus = {};
        this.isMark = (markType == MarkType.MARK);
        this.isReview = (markType == MarkType.REVIEW);
        this.isSend = (markType == MarkType.SEND);
        this.isCopy = (markType == MarkType.COPY);
        this.isExport = (markType == MarkType.EXPORT);
        if(this.isMark){
            this.actionTitle =  this.getString("mark_for_translation_leading_txt");
        }
        if(this.isReview){
            this.actionTitle =  this.getString("review_for_translation_leading_txt");
        }
        if(this.isSend){
            this.actionTitle =  this.getString("send_for_translation_leading_txt");
        }
        if(this.isCopy){
            this.continueText ="Copy";
            this.actionTitle =  this.getString("copy_strings_leading_txt");
        }
        if(this.isExport){
            this.continueText = "Export";
            this.actionTitle =  this.getString("export_strings_leading_txt");
        }

        for (let s of strings){
            this.markStatus[s.uniqueId] = false;
        }
        this.selectIDs(selectedRowsIDs);
        if(this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                // this.modal.open('md');
            });

        }
    }

    create(title:string,message:string) {
        this.toastrService.danger(message, title, {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }
}



