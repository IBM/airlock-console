import {Component, EventEmitter, Output} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {Branch} from "../../../model/branch";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'edit-branch-modal',
    styleUrls: ['./editBranchModal.scss'],
    templateUrl: './editBranchModal.html'
})

export class EditBranchModal {

    loading: boolean = false;
    _branch: Branch;
    @Output() onBranchEdited = new EventEmitter<Branch>();

    constructor(private _airLockService: AirlockService
        , private _stringsSrevice: StringsService, private toastrService: NbToastrService
        , protected modalRef: NbDialogRef<EditBranchModal>) {
        this._branch = new Branch();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    // open(source: Branch) {
    //     if (this.modal) {
    //
    //         this._branch = Branch.clone(source);
    //         this.modal.open();
    //     }
    // }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._airLockService.updateBranch(this._branch).then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onBranchEdited.emit(result);
                    this.close()
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "Branch edited"
                    });
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

    isValid(): boolean {
        if (!this._branch)
            return false;

        return (this._branch.name.trim() !== '');
    }

    close() {
        this._branch = new Branch();
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to save branch. Please try again.");
        console.log("handleError in addBranchModal:" + errorMessage);
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

    create(message: string) {
        this.toastrService.danger(message, "Edit branch failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////
}

