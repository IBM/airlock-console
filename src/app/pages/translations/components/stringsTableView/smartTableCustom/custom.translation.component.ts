import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {ViewCell} from "ng2-smart-table";
import {AirlockService} from "../../../../../services/airlock.service";
import {StringsService} from "../../../../../services/strings.service";
import {NbDialogService} from "@nebular/theme";
import {ConfirmActionModal} from "../../../../../@theme/modals/confirmActionModal";
import {OverrideStringModal} from "../../../../../@theme/modals/overrideStringModal";

@Component({
    template: `
        <i aria-hidden="true"
           class="ion-checkmark-round tranlateStatusIcon status-icon-translated"
           *ngIf="!isShowingTranslation() && isTranslationStatus(['TRANSLATED'])"
           title="{{getTranslationTooltip()}}"
           (click)="overrideTranslation()"></i>
        <i aria-hidden="true"
           class="ion-compose tranlateStatusIcon status-icon-overriden"
           *ngIf="!isShowingTranslation() && isTranslationStatus(['OVERRIDE'])"
           title="{{getTranslationTooltip()}}"
           (click)="overrideTranslation()"></i>
        <i aria-hidden="true"
           class="ion-close-round tranlateStatusIcon status-icon-not-translated"
           title="{{getTranslationTooltip()}}"
           *ngIf="!isTranslationStatus(['OVERRIDE']) && !isTranslationStatus(['TRANSLATED'])"
           (click)="overrideTranslation()"></i>
  `,
})
export class CustomTranslationComponent implements ViewCell, OnInit {
    @Input() value: string;
    @Input() rowData: any;
    private showTranslations = {};

    constructor(private _airlockService: AirlockService,
                private cd: ChangeDetectorRef,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService) {
    }

    ngOnInit(): void {
    }

    getStringStatus(status: string): string {
        if (status == 'TRANSLATION_COMPLETE')
            return "Translation Completed";
        if (status == 'IN_TRANSLATION')
            return "In Translation";
        if (status == 'NEW_STRING')
            return "New String";
        if (status == 'READY_FOR_TRANSLATION') {
            return "Ready for Review";
        }
        if (status == 'REVIEWED_FOR_TRANSLATION') {
            return "Review Complete";
        }
        return status;
    }

    isTranslationStatus(statuses: string[]) {
        const translation = this.getTranslation();
        for (let status of statuses){
            if (status === translation.translationStatus){
                return true;
            }
        }
        return false;
    }

    overrideTranslation() {
        const translation = this.getTranslation();
        if (!this.canUserOverrideLocale(translation.stage)) {
            let message = this._stringsSrevice.getString("cannot_modify_production_string");
            this.modalService.open(ConfirmActionModal, {
                context: {
                    message: message,
                    shouldDisplaySubmit: false
                }
            })
            return;
        }
        // if (this.sub != null) {
        //     this.sub.unsubscribe();
        // }
        this.modalService.open(OverrideStringModal, {
            context: {
                stringToOverride: translation.translation,
                stringId: this.rowData.uniqueId,
                locale: this.value,
                key: this.rowData.key,
                allowRevert : translation.translationStatus == 'OVERRIDE'
            }
        })
    }

    isShowingTranslation() {
        if (typeof (this.showTranslations[this.rowData.title]) === 'undefined')
            return false;
        return this.showTranslations[this.value];
    }

    getTranslationTooltip() {
        let toRet = this.getTranslation().translation;
        if (toRet == null) {
            toRet = "";
        }
        if (this.canUserOverrideLocale(toRet.stage)) {
            if (toRet.length > 0) {
                toRet += "\n";
            }
            toRet = toRet + "Click to override (" + this.value + ")";
        }
        //&#013
        return toRet;
    }

    getTranslation(){
        for (let translation of this.rowData.translations){
            if (translation.locale === this.value){
                return translation;
            }
        }
        return {};
    }

    private canUserOverrideLocale(stage:string){
        if(stage == 'PRODUCTION'){
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        }else{
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }
    }
}
