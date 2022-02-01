import {Component, Input, OnInit} from '@angular/core';
import {ViewCell} from 'ng2-smart-table';
import {NbDialogService} from "@nebular/theme";
import {AirlockService} from "../../services/airlock.service";
import {VerifyActionModal, VerifyDialogType} from "../../@theme/modals/verifyActionModal";
import {User} from "../../model/user";

@Component({
    selector: 'auth-delete',
    template: `
        <button class="btn btn-outline-secondary" (click)="deleteUser($event)">
            <i class="fa ion-trash-b"></i>
        </button>
  `
})
export class CustomDeleteComponent implements ViewCell, OnInit {

    @Input() value: any;
    @Input() rowData: any;

    checked: boolean;

    constructor(private modalService: NbDialogService,
                private _airlockService: AirlockService) { }

    ngOnInit() {
        this.checked = this.value;
    }

    deleteUser($event: MouseEvent) {
        console.log("deleteUser");
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                text: `Are you sure you want to delete the user ${this.rowData.id}? ` + this.value,
                verifyModalDialogType: VerifyDialogType.DELETE_USER_TYPE,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                console.log("confirmed");
                let user = new User();
                user.identifier = this.rowData.id;
                user.uniqueId = this.rowData.uniqueId;
                this._airlockService.deleteUser(user).then((res) => {
                    this.rowData.authPage.refreshTable();
                }).catch((error) => {
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete user");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.rowData.authPage.refreshTable();
                });
            }
        });
    }
}
