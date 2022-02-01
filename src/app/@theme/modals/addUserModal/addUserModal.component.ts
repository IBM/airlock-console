
import {Component, ViewChild, Output} from '@angular/core';
import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {User} from "../../../model/user";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'add-user-modal',
    styleUrls: ['./addUserModal.scss'],
    templateUrl: './addUserModal.html'
})

export class AddUserModal {
    loading: boolean = false;
    _user: User;
    productId: string;
    @Output() onUserAdded = new EventEmitter();

    constructor(private _airlockService:AirlockService,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<AddUserModal>) {
        this._user = new User();
    }

    ngOnInit() {
        this._user = new User();
        this._user.isGroupRepresentation = false;
        this._user.roles = ["Viewer"];
        this._user.creator=this._airlockService.getUserName();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(productId: string) {
            this.productId = productId;
            this._user = new User();
            this._user.isGroupRepresentation = false;
            this._user.identifier = "";
            this._user.roles = ["Viewer"];
            this._user.creator=this._airlockService.getUserName();
    }

    save() {
        if (this.isValid()) {
            this.loading = true;
            this._airlockService.addUser(this._user, this.productId).
                then(
                    result => {
                        this.loading = false;
                        console.log(result);
                        this.close(result);
                        this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"New user added"});
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

    close(val = null){
        this.loading = false;
        this.modalRef.close(val);
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = this._airlockService.parseErrorMessage(error,"Failed to add user. Please try again.");
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
        this.toastrService.danger(message, "Add user failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }


    removeAll() { }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }
    //////////////////////////////////////////
}

