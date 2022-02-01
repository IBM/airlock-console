import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbToastrService} from "@nebular/theme";


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
    styleUrls: ['./showEncryptionKeyModal.scss'],
    templateUrl: './showEncryptionKeyModal.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class ShowEncryptionKeyModal {

    // @ViewChild('showKeyModal') modal: ModalComponent;

    loading: boolean = false;
    encryptionKey: string = "";
    title: string;

    constructor(private _airLockService: AirlockService,
                private cd: ChangeDetectorRef,
                private toastrService: NbToastrService,
                private _stringsSrevice: StringsService,
                private modalRef: NbDialogRef<ShowEncryptionKeyModal>
    ) {
    }

    open(key: string) {
        console.log("VerifyActionModal inside open")
        this.encryptionKey = key;

        if (this.modalRef) {
            this.cd.markForCheck();

        }
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    cancel() {
        this.close();
    }

    discard() {
        this.close();
    }

    close() {
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Action failed.";
        console.log("handleError in addProductModal:" + errorMessage);
        console.log(error);
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
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

    capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    create(message: string) {

    }



    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

}

