
import {Component, ViewEncapsulation, ViewChild, Input, Output,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";

import { Subject }    from 'rxjs';
import {StringsService} from "../../../services/strings.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

@Component({
    selector: 'override-string-modal',
    styleUrls: ['./overrideStringModal.scss'],
    templateUrl: './overrideStringModal.html',
})

export class OverrideStringModal {
    loading: boolean = false;
    stringToOverride: string = null;
    stringId:string = null;
    locale:string = null;
    key:string = null;
    allowRevert:boolean = false;
    text: string;
    @Output() stringOverridden : EventEmitter<any> = new EventEmitter();
    // @Output() onActionApproved = new EventEmitter();
    private stringToOverridsSubject = new Subject<string>();
    private stringToCancelOverridsSubject = new Subject<string>();
    stringToOverridsSubject$ = this.stringToOverridsSubject.asObservable();
    stringToCancelOverridsSubject$ = this.stringToCancelOverridsSubject.asObservable();
    constructor(private _airLockService:AirlockService,
                private cd: ChangeDetectorRef,
                private toastrService: NbToastrService,
                private _stringsSrevice: StringsService,
                protected modalRef: NbDialogRef<OverrideStringModal>,) {
    }
    approve(value: string) {
        this.stringToOverridsSubject.next(value);
    }

    open(stringToOverride:string,stringId:string,locale:string,key:string = "", allowRevert:boolean = false) {
        this.stringToOverride = stringToOverride;
        this.stringId=stringId;
        this.locale=locale;
        this.key=key;
        this.allowRevert = allowRevert;
    }

    save() {
        if (this.isValid()) {
            let str:string = this.stringToOverride;
            this.loading = true;
            this._airLockService.overrideStringToTranslation(this.stringId,this.locale,str).then(
                () => {
                    this.loading=false;
                    this.approve(str);
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Override string"});
                    this.close();
                }
        ).catch(error => {
    console.log(error);
    this.loading = false;
    let errMessage = error._body || error;
    let errorMessage = this._airLockService.parseErrorMessageB(error, "Failed to override string");
    this._airLockService.notifyDataChanged("error-notification",errorMessage);
    this.close();
}   );
        }
    }

    isValid() : boolean {
        return true;
    }

    close(){
        this.stringToOverridsSubject = new Subject<string>();
        this.stringToCancelOverridsSubject  = new Subject<string>();
        this.stringToOverridsSubject$ = this.stringToOverridsSubject.asObservable();
        this.stringToCancelOverridsSubject$ = this.stringToCancelOverridsSubject.asObservable();
        this.stringToOverride = null;
        this.stringId=null;
        this.locale=null;
        this.modalRef.close();
    }

    cancelOverride() {
        //TODO::
        this.loading = true;
        this._airLockService.cancelOverrideStringToTranslation(this.stringId,this.locale).then(
            () => {
                this.loading=false;
                //this.approve(null);
                this.stringOverridden.emit(null);
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Cancel Override string"});
                this.close();
            }
        ).catch(error => {
            console.log(error);
            this.loading = false;
            let errMessage = error._body || error;
            let errorMessage = `Failed to cancel override: ${errMessage}`;
            this._airLockService.notifyDataChanged("error-notification",errorMessage);
            this.close();
        });

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    canUserCancelOverrideLocale(){
        return this.allowRevert;
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

    create(message:string) {
        this.toastrService.danger(message, "Feature name does not match", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }
}

