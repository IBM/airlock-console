
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

import { Subject }    from 'rxjs/Subject';
import {ToastrService} from "ngx-toastr";
import {StringsService} from "../../../services/strings.service";
import {Branch} from "../../../model/branch";

export enum VeryfyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE
}

@Component({
    selector: 'verify-remove-from-branch-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./verifyRemoveFromBranchModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./verifyRemoveFromBranchModal.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerifyRemoveFromBranchModal {

    @ViewChild('verifyRemoveFromBranchModal') modal: ModalComponent;

    loading: boolean = false;
    feature: Feature = null;
    branch: Branch = null;
    applyToSubFeatures: boolean = false;
    verifyModalDialogType: VeryfyDialogType;
    text: string;
    private actionApproved = new Subject<boolean>();
    actionApproved$ = this.actionApproved.asObservable();
    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService,
                private cd: ChangeDetectorRef, private toastrService: ToastrService, private _stringsSrevice: StringsService) {
    }
    approve(value: boolean) {
        this.actionApproved.next(value);
    }


    open(feature:Feature, branch:Branch) {

        if (this.modal){
            this.feature = feature;
            this.branch = branch;
            this.cd.markForCheck();
            this.removeAll();
            this.modal.open();
        }
    }


    save() {
        console.log("VerifyActionModal save");
        if (this.isValid()) {
            this.approve(this.applyToSubFeatures);
            // this.onActionApproved.emit(null);
            this.close();
        } else {
            this.create('Please re-type the validation name to perform the selected action')
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getType(){
        if(this.feature == null){
            return "feature";
        }
        if(this.feature.type === "ENTITLEMENT" || this.feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP"){
            return "entitlement";
        }
        if(this.feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || this.feature.type === "PURCHASE_OPTIONS"){
            return "purchase option";
        }
        return "feature";
    }
    getStringWithFormat(name: string, ...format:string[]) {
        return this._stringsSrevice.getStringWithFormat(name,...format);
    }

    isValid() : boolean {
        if (this.feature==null) {
            return false;
        }
        return true;
    }

    close(){
        this.actionApproved = new Subject<boolean>();
        this.actionApproved$ = this.actionApproved.asObservable();
        this.applyToSubFeatures = false;
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to add product. Please try again.";
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

