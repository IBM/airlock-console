
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {User} from "../../../model/user";


@Component({
    selector: 'add-user-modal',
    styles: [require('./addUserModal.scss')],
    template: require('./addUserModal.html')

})

export class AddUserModal {

    @ViewChild('addUserModal') modal: ModalComponent;

    loading: boolean = false;
    _user: User;
    productId: string;
    @Output() onUserAdded = new EventEmitter();

    constructor(private _airLockService:AirlockService,private _notificationService: NotificationsService
        , private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this._user = new User();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(productId: string) {
        if (this.modal){
            this.removeAll();
            this.productId = productId;
            this._user = new User();
            this._user.isGroupRepresentation = false;
            this._user.identifier = "";
            this._user.roles = ["Viewer"];
            this._user.creator=this._airLockService.getUserName();
            this.modal.open();
        }
    }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._airLockService.addUser(this._user, this.productId).
                then(
                    result => {
                        this.loading = false;
                        console.log(result);
                        this.onUserAdded.emit(result);
                        this.close();
                        this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New user added"});
                    }
                ).catch(
                    error => {
                        this.handleError(error);
                    }
                );

        } else {
            this.loading = false;
            this.create('Identifier is required.')
        }
    }

    isValid() : boolean {
        if (!this._user)
            return false;

        return (this._user.identifier.trim() !== '');
    }

    close(){
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = this._airLockService.parseErrorMessage(error,"Failed to add user. Please try again.");
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
        this.toastrService.error(message, "Add user failed", {
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

