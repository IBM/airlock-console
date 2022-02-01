import {Component, EventEmitter, Output} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Branch} from "../../../model/branch";


@Component({
    selector: 'add-branch-modal',
    styleUrls: ['./addBranchModal.scss'],
    templateUrl: './addBranchModal.html'

})

export class AddBranchModal {

    loading: boolean = false;
    loaded: boolean = false;
    _branch: Branch;
    _sourceBranch: Branch;
    _sources: Branch[];
    @Output() onBranchAdded = new EventEmitter<Branch>();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<AddBranchModal>) {
        this._branch = new Branch();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit(){
        this._branch.creator = this._airLockService.getUserName();
    }

    // open(source: Branch, branches: Branch[]) {
    //     if (this.modalRef) {
    //
    //         this._branch = new Branch();
    //         this._branch.seasonId = source.seasonId;
    //         this._sourceBranch = source;
    //         this._sources = branches;
    //         this._branch.creator = this._airLockService.getUserName();
    //         this.loaded = true;
    //         this.modalRef.open();
    //     }
    // }

    save() {
        this._branch.name = this._branch.name.trim();
        if (this.isValid()) {
            this.loading = true;
            this._airLockService.addBranch(this._branch, this._sourceBranch.uniqueId).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onBranchAdded.emit(result);
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New branch added"
                    });
                }
            ).catch(
                error => {
                    this.loading = false;
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

    close(branch: Branch = null) {
        this.loaded = false;
        this.modalRef.close(branch);
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to create branch. Please try again.");
        console.log("handleError in addBranchModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

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
        this.toastrService.danger(message, "Create branch failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    getBranchesForSelect(): any[] {
        var toRet = [];
        if (this._sources) {
            for (var branch of this._sources) {
                let seasonObj = {
                    id: branch,
                    text: branch.name
                };
                toRet.push(seasonObj);
            }
        }
        return toRet;
    }

    selectBranchFromSelect(branchObj: any) {
        if (branchObj) {
            if (branchObj.id && branchObj.id != this._sourceBranch) {
                this.selectBranch(branchObj.id);
            }

        }
    }

    selectBranch(branch: Branch) {
        this._sourceBranch = branch;
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }
}

