import {Component} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {NbDialogRef, NbGlobalLogicalPosition} from "@nebular/theme";
import {Product} from "../../../model/product";
import {UserGroups} from "../../../model/user-groups";

@Component({
    selector: 'add-group-modal',
    styleUrls: ['./addGroupModal.scss'],
    templateUrl: './addGroupModal.html',
})

export class AddGroupModal {
    title: string = "Add Group";
    loading: boolean = false;
    loaded: boolean = false;
    selectedProduct: Product = null;
    public groupList: UserGroups;
    groupName: string;

    constructor(private _airlockService: AirlockService,
                private modalRef: NbDialogRef<AddGroupModal>) {
        this.loading = true;
    }

    ngOnInit() {
        this.loaded = true;
        this.loading = false;
    }

    save() {
            if (this.groupName.trim() != '') {
                let oldInternalUserGroup = [].concat(this.groupList.internalUserGroups);
                this.groupList.internalUserGroups.push(this.groupName);
                this.loading = true;
                this._airlockService.updateUserGroups(this.selectedProduct, this.groupList).then(newGroups => {
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New group added"
                    });
                    this.close(true);
                }).catch(error => {
                    this.groupList.internalUserGroups = oldInternalUserGroup;
                    console.log(error);
                    this.loading = false;
                    let errMessage = error._body || error;
                    let errorMessage = `Failed to add group: ${errMessage}`;
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.close();
                });
            } else {
                this.close();
            }
        }
    close(val = false) {
        this.loading = false;
        this.modalRef.close(val);
    }
}

