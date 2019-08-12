import {Component, Input, ViewEncapsulation, OnInit, Output, EventEmitter, ViewChild, ChangeDetectorRef} from '@angular/core';
import {StringToTranslate} from "../../../../model/stringToTranslate";
import {Season} from "../../../../model/season";
import {AirlockService} from "../../../../services/airlock.service";
import {FeatureUtilsService} from "../../../../services/featureUtils.service";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {OverrideStringModal} from "../../../../theme/airlock.components/overrideStringModal/overrideStringModal.component";
import {EditStringModal} from "../../../../theme/airlock.components/editStringModal/editStringModal.component";
import {VerifyActionModal, VeryfyDialogType} from "../../../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {StringsService} from "../../../../services/strings.service";
import {StringUsageModal} from "../../../../theme/airlock.components/stringUsageModal/stringUsageModal.component";

@Component({
    selector: 'strings-table',
    styles: [require('./strings.table.scss')],
    template: require('./strings.table.html'),
    //providers: [StringDetail]
})
export class StringsTableView implements OnInit{
    @Input() selectedStrings: StringToTranslate[];
    @Input() selectedSeason: Season;
    @Input() verifyActionModal:  VerifyActionModal;
    @Input() supportedLocales: string[];
    selectedStringToTranslate:StringToTranslate;
    @Output() reloadTranslations : EventEmitter<any> = new EventEmitter();
    @Output() onSelectedChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

    @ViewChild('overrideStringModal')
    overrideStringModal: OverrideStringModal;

    @ViewChild('editStringModal')
    editStringModal:  EditStringModal;

    @ViewChild('stringUsageModal')
    stringUsageModal: StringUsageModal;

    public data;
    public sortBy; //= "key";
    public sortOrder = "asc";
    loading: boolean = false;
    private sub:any = null;
    private showTranslations = {};
    curSelectedStringID:string = null;
    selectedRowsIDs:string[] = [];

    constructor(private _airlockService : AirlockService,public modal: Modal,private cd: ChangeDetectorRef,private _stringsSrevice: StringsService) {
    }

    isShowingTranslation(locale): boolean {
        if (typeof(this.showTranslations[locale]) === 'undefined')
            return false;
        return this.showTranslations[locale];
    }

    localeClicked(locale): void {
        if (typeof(this.showTranslations[locale]) === 'undefined'){
            this.showTranslations[locale] = true;
        }
        else{
            this.showTranslations[locale] = !this.showTranslations[locale];
        }
    }

    ngOnInit(): void {
        console.log("on Init")
    }

    ngOnDestroy(){
        if(this.sub != null){
            this.sub.unsubscribe();
        }
    }

    ngOnChanges(): void{
        this.data = this.selectedStrings;
    }

    canUserOpenActions(s : StringToTranslate) {
        return (this.canUserEditString(s) ||
        this.canMarkForTranslation(s) ||
        this.canReviewForTranslation(s) ||
        this.canSendForTranslation(s) ||
        this.canUserChangeProduction() ||
            this.canUserCopyString() ||
            this.canUserExportString() ||
            this.canViewUsage(s) ||
        this.canUserDeleteString(s));
    }

    canUserEditString(stringToTranslate : StringToTranslate){
        if(stringToTranslate.stage == 'PRODUCTION'){
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        }else{
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }

    canViewUsage(s:StringToTranslate){
        return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
    }

    viewStringUsage(s:StringToTranslate){
        this.stringUsageModal.open(s.uniqueId,s.key);
    }

    canShowActionsMenu() {
        return !this._airlockService.isViewer()  || this._airlockService.isUserHasStringTranslateRole();
    }

    markStringForTranslation(stringToTranslate : StringToTranslate){
        this.loading=true;
        this._airlockService.markStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading=false;
            this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this._stringsSrevice.getString("mark_for_translation_success_message")});
        }).catch(error => {
            console.log(error);
            this.loading = false;
            
            this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }
    reviewStringForTranslation(stringToTranslate : StringToTranslate){
        this.loading=true;
        this._airlockService.reviewStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading=false;
            this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this._stringsSrevice.getString("review_for_translation_success_message")});
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }
    sendStringForTranslation(stringToTranslate : StringToTranslate){
        this.loading=true;
        this._airlockService.sendStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading=false;
            this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this._stringsSrevice.getString("sent_for_translation_success_message")});
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }
    canUserDeleteString(stringToTranslate : StringToTranslate){
        if(stringToTranslate.stage == 'PRODUCTION'){
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        }else{
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }
    canUserChangeProduction(){
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }
    canMarkForTranslation(stringToTranslate : StringToTranslate){
        if(stringToTranslate.status != 'NEW_STRING'){
            return false;
        }
        if(stringToTranslate.stage == 'PRODUCTION'){
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead()  || this._airlockService.isUserHasStringTranslateRole();;
        }else{
            return !this._airlockService.isViewer()  || this._airlockService.isUserHasStringTranslateRole();
        }
    }
    canReviewForTranslation(stringToTranslate : StringToTranslate){
        if(stringToTranslate.status != 'READY_FOR_TRANSLATION'){
            return false;
        }
        return this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }
    canSendForTranslation(stringToTranslate : StringToTranslate){
        if(stringToTranslate.status != 'REVIEWED_FOR_TRANSLATION'){
            return false;
        }
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
    }

    canUserCopyString(){
        return this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }
    canUserExportString(){
        return this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }


    copyString(stringToCopy : StringToTranslate){
        this._airlockService.setCopiedStrings([stringToCopy.uniqueId])
    }
    exportString(stringToExport: StringToTranslate){
        this._airlockService.downloadStrings(this.selectedSeason.uniqueId,[stringToExport.uniqueId]);
    }

    getDeleteColor(str:StringToTranslate) {
        if (str.stage=='PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    changeStage(selectedString:StringToTranslate) {
        let message = "";
        if (selectedString.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this string to development?';
        } else {
            message = 'Are you sure you want to release this string to production?';
        }
        message += ` This operation can impact your app in production.`;
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._changeStage(selectedString);
            });
        console.log("open verifyActionModal");
        this.verifyActionModal.open(message,null, VeryfyDialogType.STRING_TYPE);

    }
    _changeStage(selectedString:StringToTranslate){
        this.loading=true;
        this._airlockService.getStringFullInformation(selectedString.uniqueId).then(res => {
            if(res.stage ==  "DEVELOPMENT"){
                res.stage = "PRODUCTION";
            }else {
                res.stage = "DEVELOPMENT";
            }
            this._airlockService.updateStringToTranslation(selectedString.uniqueId,res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to revertToDevelopment: ${error}`);
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));
                }
            );

        }).catch(error => {
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }

    getNumberOfSupportedLocales(stringToTranslate : StringToTranslate){
        // if(this.supportedLocales != null){
        //     return this.supportedLocales.length;
        // }else{
        return stringToTranslate.translations.length;
        // }
    }
    getNumberOfTranslatedLocales(stringToTranslate : StringToTranslate){
        var counter:number = 0;
        for(let item of stringToTranslate.translations){
            if(item.translationStatus == 'TRANSLATED' || item.translationStatus == 'OVERRIDE'){
                counter++;
            }
        }
        return counter;
    }
    reloadString(event:any){
        this.reloadTranslations.emit(null);
    }
    showEditString(_selectedString:StringToTranslate){
        this.editStringModal.open(_selectedString);
    }
    isSupportedLocale(locale:string){
        if(!this.supportedLocales){
            return true;
        }
        return this.supportedLocales.some(x=>x==locale);
    }

    getStringStatus(status:string): string{
        if(status == 'TRANSLATION_COMPLETE')
            return "Translation Completed";
        if(status == 'IN_TRANSLATION')
            return "In Translation";
        if(status == 'NEW_STRING')
            return "New String";
        if(status == 'READY_FOR_TRANSLATION'){
            return "Ready for Review";
        }
        if(status == 'REVIEWED_FOR_TRANSLATION'){
            return "Review Complete";
        }
        return status;
    }

    rowSelected(stringToTranslateID : string) {
        console.log("rowSelected");
        this.curSelectedStringID = stringToTranslateID;
        if (this.isRowSelected(stringToTranslateID)) {
            let index = this.selectedRowsIDs.indexOf(stringToTranslateID);
            this.selectedRowsIDs.splice(index,1);
        } else {
            this.selectedRowsIDs.push(stringToTranslateID);
        }
        this.onSelectedChanged.emit(this.selectedRowsIDs);
    }

    clearSelected() {
        this.selectedRowsIDs = [];
        this.onSelectedChanged.emit(this.selectedRowsIDs);
    }

    isRowSelected(stringToTranslateID: string):boolean {
        return this.selectedRowsIDs.indexOf(stringToTranslateID) > -1;
    }

    private sortByTranslated = (a:any) => {
        return this.getNumberOfTranslatedLocales(a);
    };

    private sortByStatus = (a:any) => {
        if(a.status == 'NEW_STRING')
            return 1;
        if(a.status == 'READY_FOR_TRANSLATION'){
            return 2;
        }
        if(a.status == 'REVIEWED_FOR_TRANSLATION'){
            return 3;
        }
        if(a.status == 'IN_TRANSLATION')
            return 4;
        if(a.status == 'TRANSLATION_COMPLETE')
            return 5;
        return 10;
    };

    canShowDelete(){
        return this._airlockService.isAdministrator;
    }

    deleteString(strToTranslate: StringToTranslate) {
        if (strToTranslate.stage != 'PRODUCTION') {
            this.remove(strToTranslate.uniqueId, strToTranslate.key);
        }
    }
    remove(id:string,name:string){

        let message = 'Are you sure you want to delete this string ('+name+")?";
        this.modal.confirm()
            .title(message)
            .open()
            .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(result => {
                console.log("confirmed");
                this.loading=true;
                this._airlockService.deleteStringToTranslation(id).then(()=>{
                    this.loading=false;
                    this.reloadTranslations.emit(null);
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"String deleted"});
                }).catch(error => {
                    console.log(error);
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));
                });
            }) // if were here ok was clicked.
            .catch(err => console.log("CANCELED:"+err));
    }


    getTranslationTooltip(translation:string, stage:string, locale:string):string {
        var toRet = translation;
        if(toRet == null){
            toRet = "";
        }
        if (this.canUserOverrideLocale(stage)) {
            if (toRet.length > 0) {
                toRet += "\n";
            }
            toRet = toRet + "Click to override (" +locale+")";
        }
        //&#013
        return toRet;
    }

    canUserOverrideLocale(stage:string){
        if(stage == 'PRODUCTION'){
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        }else{
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }
    }

    overrideTranslation(stringId:string,translation/*locale:string,str:string*/,key:string, stage:string){
        //this._stringDetail.overrideTranslation(stringId,locale,str);
        console.log("STAGE:"+stage);
        if (!this.canUserOverrideLocale(stage)) {
            let message = this._stringsSrevice.getString("cannot_modify_production_string");
            this.modal.alert()
                .title(message)
                .open();
            return;
        }
        if(this.sub != null){
            this.sub.unsubscribe();
        }
        this.sub = this.overrideStringModal.stringToOverridsSubject$.subscribe(
            astronaut => {
                console.log("changed:"+astronaut);
                // map[locale] = astronaut;
                if(astronaut != null) {
                    translation.translation = astronaut;
                    translation.translationStatus = "OVERRIDE";
                }else {
                    translation.translationStatus = "NOT_TRANSLATED";
                    translation.translation = null;
                }
                this.cd.markForCheck();
            });
        this.overrideStringModal.open(translation.translation,stringId,translation.locale,key, translation.translationStatus=='OVERRIDE');
    }

    getLocaleTitle(locale:string): string {
        if(this.isShowingTranslation(locale)){
            return "Click to hide translations"
        }
        return "Click to show translations";
    }
}