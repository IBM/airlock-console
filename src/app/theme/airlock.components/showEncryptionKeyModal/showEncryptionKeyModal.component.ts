
import {Component, ViewEncapsulation, ViewChild, Input, Output,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {Feature} from "../../../model/feature";
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {StringsService} from "../../../services/strings.service";

import { Subject }    from 'rxjs/Subject';
import {ToastrService} from "ngx-toastr";
import {Stream} from "../../../model/stream";
import {AirlockNotification} from "../../../model/airlockNotification";

export enum VeryfyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE,
    STREAM_TYPE,
    NOTIFICATION_TYPE,
    ORDERING_RULE_TYPE
}

@Component({
    selector: 'show-key-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./showEncryptionKeyModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./showEncryptionKeyModal.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShowEncryptionKeyModal {

    @ViewChild('showKeyModal') modal: ModalComponent;

    loading: boolean = false;
    encryptionKey: string = "";
    title:string;
    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService,
                private cd: ChangeDetectorRef, private toastrService: ToastrService, private _stringsSrevice: StringsService) {
    }


    open(key: string) {
        console.log("VerifyActionModal inside open")
        this.encryptionKey=key;

        if (this.modal){
            this.cd.markForCheck();
            this.removeAll();
            this.modal.open();
        }
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    cancel(){
        this.close();
    }
    discard(){
        this.close();
    }
    close(){
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Action failed.";
        console.log("handleError in addProductModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        this.create(errorMessage);
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

    capitalizeFirstLetter(str:string):string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    create(message:string) {

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

