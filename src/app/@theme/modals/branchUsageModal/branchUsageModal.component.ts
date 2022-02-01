
import {Component, Injectable, ViewEncapsulation, ViewChild, Input, Output, OnInit} from '@angular/core';

import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {DomSanitizer} from "@angular/platform-browser";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'branch-usage-modal',
    styleUrls: ['./branchUsageModal.scss'],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent, AirlockTooltip],
    templateUrl: './branchUsageModal.html'
})

export class BranchUsageModal implements OnInit{
    loading:boolean = false;
    downloadJsonHref: any;
    fileName: string = "download.json";
    text:string = "";
    constructor(private _airlockService : AirlockService, 
                private _stringsSrevice: StringsService, 
                private toastrService: NbToastrService,
                private sanitizer: DomSanitizer,
                private modalRef: NbDialogRef<BranchUsageModal>) {
    }

    generateDownloadJsonUri(theJSON: any) {
        // var theJSON = JSON.stringify(this.resJsonResponse);
        var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
        this.downloadJsonHref = uri;
    }

    ngOnInit() {

    }
    getConsoleVersion() {
        return this._airlockService.getVersion();
    }

    getApiURL() {
        return this._airlockService.getApiUrl();
    }


    open(json:any, usageStr: string) {
        this.generateDownloadJsonUri(json);
        this.fileName = usageStr+".json";
        this.text = json;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    close(){
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to load API information.";
        console.log("handleError in aboutModal:"+errorMessage);
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

    create(message:string) {
        this.toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
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
