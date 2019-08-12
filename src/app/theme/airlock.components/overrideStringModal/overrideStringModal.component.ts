
import {Component, ViewEncapsulation, ViewChild, Input, Output,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {Feature} from "../../../model/feature";

import { Subject }    from 'rxjs/Subject';
import {ToastrService} from "ngx-toastr";
import {StringsService} from "../../../services/strings.service";

@Component({
    selector: 'override-string-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./overrideStringModal.scss')],
    template: require('./overrideStringModal.html'),
    // encapsulation: ViewEncapsulation.None,
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class OverrideStringModal {

    @ViewChild('overrideStringModal') modal: ModalComponent;

    loading: boolean = false;
    private stringToOverride: string = null;
    private stringId:string = null;
    private locale:string = null;
    private key:string = null;
    private allowRevert:boolean = false;
    text: string;
    @Output() stringOverridden : EventEmitter<any> = new EventEmitter();
    // @Output() onActionApproved = new EventEmitter();
    private stringToOverridsSubject = new Subject<string>();
    private stringToCancelOverridsSubject = new Subject<string>();
    stringToOverridsSubject$ = this.stringToOverridsSubject.asObservable();
    stringToCancelOverridsSubject$ = this.stringToCancelOverridsSubject.asObservable();
    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService,
                private cd: ChangeDetectorRef, private toastrService: ToastrService, private _stringsSrevice: StringsService) {
    }
    approve(value: string) {
        this.stringToOverridsSubject.next(value);
    }

    // cancelOverride(value:string){
    //     this.stringToCancelOverridsSubject$.next(value);
    // }

    open(stringToOverride:string,stringId:string,locale:string,key:string = "", allowRevert:boolean = false) {
        console.log("OverrideStringModal inside open")
        console.log("locale:"+locale);
        console.log("stringToOverride:"+stringToOverride);
        console.log("stringId:"+stringId);
        this.stringToOverride = stringToOverride;
        this.stringId=stringId;
        this.locale=locale;
        this.key=key;
        this.allowRevert = allowRevert;
        if (this.modal){
            // this.cd.markForCheck();
            // this.removeAll();
            this.modal.open();
        }
    }

    save() {
        console.log("VerifyActionModal save");
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
        this.modal.close();
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
        this.toastrService.error(message, "Feature name does not match", {
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


    //////////////////////////////////////////
}

