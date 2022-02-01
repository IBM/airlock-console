import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {Subject} from 'rxjs';
import {StringsService} from "../../../services/strings.service";
import {Branch} from "../../../model/branch";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

export enum VeryfyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE
}

@Component({
    selector: 'verify-remove-from-branch-modal',
    styleUrls: ['./verifyRemoveFromBranchModal.scss'],
    templateUrl: './verifyRemoveFromBranchModal.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerifyRemoveFromBranchModal {

    // @ViewChild('verifyRemoveFromBranchModal') modal: ModalComponent;

    loading: boolean = false;
    feature: Feature = null;
    branch: Branch = null;
    applyToSubFeatures: boolean = false;
    verifyModalDialogType: VeryfyDialogType;
    text: string;
    private actionApproved = new Subject<boolean>();
    actionApproved$ = this.actionApproved.asObservable();

    constructor(private _airLockService: AirlockService,
                private cd: ChangeDetectorRef, private toastrService: NbToastrService, private _stringsSrevice: StringsService,
                private modalRef: NbDialogRef<VerifyRemoveFromBranchModal>) {
    }

    ngOnInit(){
        this.cd.markForCheck();
    }

    approve(value: boolean) {
        this.actionApproved.next(value);
    }

    open(feature: Feature, branch: Branch) {
        if (this.modalRef) {
            this.feature = feature;
            this.branch = branch;
            this.cd.markForCheck();
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

    getType() {
        if (this.feature == null) {
            return "feature";
        }
        if (this.feature.type === "ENTITLEMENT" || this.feature.type === "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP") {
            return "entitlement";
        }
        if (this.feature.type === "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || this.feature.type === "PURCHASE_OPTIONS") {
            return "purchase option";
        }
        return "feature";
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }

    isValid(): boolean {
        if (this.feature == null) {
            return false;
        }
        return true;
    }

    close() {
        this.actionApproved = new Subject<boolean>();
        this.actionApproved$ = this.actionApproved.asObservable();
        this.applyToSubFeatures = false;
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to add product. Please try again.";
        console.log("handleError in addProductModal:" + errorMessage);
        console.log(error);
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
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

    create(message: string) {
        this.toastrService.danger(message, "Feature name does not match", {
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

