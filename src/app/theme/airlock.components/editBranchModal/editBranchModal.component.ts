
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {Branch} from "../../../model/branch";


@Component({
    selector: 'edit-branch-modal',
    styles: [require('./editBranchModal.scss')],
    template: require('./editBranchModal.html')

})

export class EditBranchModal {

    @ViewChild('editBranchModal') modal: ModalComponent;

    loading: boolean = false;
    _branch: Branch;
    @Output() onBranchEdited = new EventEmitter<Branch>();

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService
        , private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this._branch = new Branch();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(source:Branch) {
        if (this.modal){
            this.removeAll();
            this._branch = Branch.clone(source);
            this.modal.open();
        }
    }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._airLockService.updateBranch(this._branch).
                then(
                    result => {
                        this.loading = false;
                        console.log(result)
                        this.onBranchEdited.emit(result);
                        this.close()
                        this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Branch edited"});
                    }
                ).catch(
                    error => {
                        this.handleError(error);
                    }
                );

        } else {
            this.loading = false;
            this.create('Branch name is required.')
        }
    }

    isValid() : boolean {
        if (!this._branch)
            return false;

        return (this._branch.name.trim() !== '');
    }

    close(){
        this._branch = new Branch();
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to save branch. Please try again.");
        console.log("handleError in addBranchModal:"+errorMessage);
        console.log(error);
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
        this.toastrService.error(message, "Edit branch failed", {
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

