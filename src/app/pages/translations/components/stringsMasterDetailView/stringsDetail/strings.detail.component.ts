import {Component, ViewEncapsulation, Input, Output, EventEmitter,OnDestroy} from '@angular/core';
import {ViewChild} from "@angular/core";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {AirlockService} from "../../../../../services/airlock.service";
import {StringToTranslate} from "../../../../../model/stringToTranslate";
import {Season} from "../../../../../model/season";
import {TransparentSpinner} from "../../../../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {ShowMessageModal} from "../../../../../theme/airlock.components/showMessageModal/showMessageModal.component";
import {OverrideStringModal} from "../../../../../theme/airlock.components/overrideStringModal/overrideStringModal.component";
import {StringIssueModal} from "../../../../../theme/airlock.components/stringIssueModal/stringIssueModal.component";
import {ChangeDetectorRef} from "@angular/core";
import {FeatureUtilsService} from "../../../../../services/featureUtils.service";
import {EditStringModal} from "../../../../../theme/airlock.components/editStringModal/editStringModal.component";
import { Subject }    from 'rxjs/Subject';
import {VerifyActionModal, VeryfyDialogType} from "../../../../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
@Component({
    selector: 'string-detail',
    styles: [require('./strings.detail.scss')],
    template: require('./strings.detail.html')
})
export class StringDetail implements OnDestroy{

    @Input() _selectedString   : StringToTranslate   = null;
    @Input() selectedSeason   : Season   = null;
    @Input() supportedLocales: string[];
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('editStringModal')
    editStringModal:  EditStringModal;
    @ViewChild('overrideStringModal')
    overrideStringModal: OverrideStringModal;
    @ViewChild('stringIssueModal')
    stringIssueModal: StringIssueModal;
    loading:boolean=false;
    mapTranslations:{} = null;
    private sub:any = null;
    @Input()
    parentSubject:Subject<any>;
    @Input() verifyActionModal:  VerifyActionModal;
    @Output() reloadTranslations : EventEmitter<any> = new EventEmitter();

    constructor(private _spinner:TransparentSpinner,private _airLockService: AirlockService,
                public modal: Modal,private cd: ChangeDetectorRef) {
     }
    isSupportedLocale(locale:string){
        if(!this.supportedLocales){
            return true;
        }
        return this.supportedLocales.some(x=>x==locale);
    }

    public onEditString(str) {
        this.showEditString();
    }
    showEditString(){
        this.editStringModal.open(this._selectedString);
    }

    canViewIssues(){
        if(this._selectedString.stage == 'PRODUCTION'){
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        }else{
            return !this._airLockService.isViewer();
        }
    }

    canUserOverrideLocale(){
        if(this._airLockService.isUserHasStringTranslateRole()){
            return true;
        }
        if(this._selectedString.stage == 'PRODUCTION'){
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        }else{
            return !this._airLockService.isViewer();
        }
    }
    canUserCancelOverrideLocale(translationStatus:string){
        return translationStatus == 'OVERRIDE' && this.canUserOverrideLocale();
    }
    canUserEditString(){
        if(this._airLockService.isUserHasStringTranslateRole()){
            return true;
        }
        if(this._selectedString.stage == 'PRODUCTION'){
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        }else{
            return !this._airLockService.isViewer();
        }

    }
    canUserChangeProduction(){
        return (this._airLockService.isProductLead() || this._airLockService.isAdministrator() || this._airLockService.isUserHasStringTranslateRole())
    }
    releaseToProduction() {
        let message = "";
        if (this._selectedString.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this string to development?';
        } else {
            message = 'Are you sure you want to release this string to production?';
        }
        message += ` This operation can impact your app in production.`;
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._releaseToProduction();
            });
        console.log("open verifyActionModal");
        this.verifyActionModal.open(message,null, VeryfyDialogType.STRING_TYPE);

    }
    _releaseToProduction(){
        this.loading=true;
        this._airLockService.getStringFullInformation(this._selectedString.uniqueId).then(res => {
            res.stage="PRODUCTION";
            this._airLockService.updateStringToTranslation(this._selectedString.uniqueId,res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to releaseToProduction: ${error}`);
                    this.loading = false;
                    this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

                }
            );

        }).catch(error => {
            this.loading = false;
            this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }
    revertToDevelopment() {
        let message = "";
        if (this._selectedString.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this string to development?';
        } else {
            message = 'Are you sure you want to release this string to production?';
        }
        message += ` This operation can impact your app in production.`;
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this._revertToDevelopment();
            });
        console.log("open verifyActionModal");
        this.verifyActionModal.open(message,null, VeryfyDialogType.STRING_TYPE);

    }
    _revertToDevelopment(){
        this.loading=true;
        this._airLockService.getStringFullInformation(this._selectedString.uniqueId).then(res => {
            res.stage="DEVELOPMENT";
            this._airLockService.updateStringToTranslation(this._selectedString.uniqueId,res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to revertToDevelopment: ${error}`);
                    this.loading = false;
                    this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));
                }
            );

        }).catch(error => {
            this.loading = false;
            this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));

        });
    }

    reloadString(event:any){
            this.reloadTranslations.emit(null);
    }
    overrideTranslation(stringId:string,locale:string,str:string, translationStatus:string){
            if(this.sub != null){
                this.sub.unsubscribe();
            }
            this.sub = this.overrideStringModal.stringToOverridsSubject$.subscribe(
            astronaut => {
                console.log("changed:"+astronaut);
                // map[locale] = astronaut;
                for(let translation of this._selectedString.translations){
                    if(translation.locale == locale) {
                        console.log("find locale");
                        if(astronaut != null) {
                            translation.translation = astronaut;
                            translation.translationStatus = "OVERRIDE";
                        }else {
                            translation.translationStatus = "NOT_TRANSLATED";
                            translation.translation = null;
                        }
                        this.cd.markForCheck();

                    }
                }

            });
        this.overrideStringModal.open(str,stringId,locale,this._selectedString.key, translationStatus=='OVERRIDE');

    }
    cancelOverrideTranslation(stringId:string,locale:string,str:string){
        //TODO::
        this._airLockService.cancelOverrideStringToTranslation(stringId,locale).then(() => {
            this.loading = false;
            this.reloadTranslations.emit(null);
        }).catch(
            error => {
                console.log(`Failed to cancel override: ${error}`);
                this.loading = false;
                this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));
            }
        );
    }

    getTranslationForLocale(stringId:string,locale:string){
        this.getTranslationForString(stringId,[locale]);

    }
    getTranslationForString(stringId:string,locale:Array<string>=null){
        this._airLockService.getStringsToTranslationForStringIds(this.selectedSeason.uniqueId,[stringId],locale,true).then(resp =>
        {
            console.log(resp);
            var translations = resp;
            var message:string = "";
            if(translations.length  >0) {
                for (let item of translations[0].translations) {
                    message += item.translation + "\n"
                }
            }
            this.showMessageModal.open("Translation", message);

        }).catch(
            error => {
                this._airLockService.notifyDataChanged("error-notification",FeatureUtilsService.parseErrorMessage(error));
                this.loading = false;
            }
        );
    }

    showStringIssues(stringId: string, locale: string,issueStatus: string, key: string,isTranslation: boolean){
        this.stringIssueModal.open(stringId, locale,issueStatus, key,isTranslation);
    }

    shouldDisableActions(s : StringToTranslate):boolean {
        let shouldDisable =  !(this.canUserOverrideLocale() || this.canViewIssues());
        return shouldDisable;
    }

    canShowActionsMenu() {
        return !this._airLockService.isViewer() || this._airLockService.isUserHasStringTranslateRole();
    }

    getStringStatus(status:string): string{
        if(status == 'TRANSLATION_COMPLETE')
            return "Translation Completed";
        if(status == 'IN_TRANSLATION')
            return "In Translation";
        if(status == 'NEW_STRING')
            return "New String";
        if(status == 'REVIEWED_FOR_TRANSLATION'){
            return "Reviewed For Translation";
        }
        if(status == 'READY_FOR_TRANSLATION'){
            return "Ready For Translation";
        }
        return status;
    }
    ngOnDestroy(){
        if(this.sub != null){
            this.sub.unsubscribe();
        }
    }

}