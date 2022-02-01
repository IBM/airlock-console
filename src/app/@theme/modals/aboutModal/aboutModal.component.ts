import {Component, OnInit} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

@Component({
    selector: 'about-modal',
    styleUrls: ['./aboutModal.scss'],
    templateUrl: './aboutModal.html'

})
export class AboutModal implements OnInit {

    // @ViewChild('aboutModal') modal: ModalComponent;

    loading: boolean = false;
    props: any = {};
    keys = [];

    constructor(private _airlockService: AirlockService,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                protected modalRef: NbDialogRef<AboutModal>
    ) {
    }

    ngOnInit() {
        this.loading = true;
        this._airlockService.getApiAbout().then(res => {
            this.props = res;
            this.keys = Object.keys(this.props);
            this.loading = false;
        }).catch(error => {
            this.handleError(error);
        })
    }

    getConsoleVersion() {
        return this._airlockService.getVersion();
    }

    getApiURL() {
        return this._airlockService.getApiUrl();
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
    getKeyLabel(key: string) {
        var out = key[0].toUpperCase();
        var outIndex = 1;
        for (let i=1; i<key.length;i++) {
            if (key[i] === key[i].toUpperCase()) {
                out = out.concat(' ')
            }
            out = out.concat(key[i]);
        }
        return out;
    }
}
