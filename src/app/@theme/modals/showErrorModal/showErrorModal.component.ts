import {Component, OnInit, ViewChild} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {DomSanitizer} from "@angular/platform-browser";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'show-error-modal',
    styleUrls: ['./showErrorModal.scss'],
    templateUrl: './showErrorModal.html'
})

export class ShowErrorModal implements OnInit {
    loading: boolean = false;
    errorStr: string = "";
    text: string = "";

    constructor(private _airlockService: AirlockService
        , private _stringsSrevice: StringsService, private toastrService: NbToastrService, private sanitizer: DomSanitizer,
                protected modalRef: NbDialogRef<ShowErrorModal>) {
    }

    ngOnInit() {

    }

    getConsoleVersion() {
        return this._airlockService.getVersion();
    }

    getApiURL() {
        return this._airlockService.getApiUrl();
    }


    open(json: any, title: string) {
        if (this.modalRef) {
            this.errorStr = json;
            this.text = title;
            // this.modal.open();
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    close() {
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to load API information.";
        console.log("handleError in aboutModal:" + errorMessage);
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
        this.toastrService.danger(message, "Error", {
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
