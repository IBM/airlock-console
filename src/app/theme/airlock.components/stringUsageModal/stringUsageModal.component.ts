import {Component, Injectable, ViewEncapsulation, ViewChild, Input, Pipe, PipeTransform, NgModule} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {NotificationsService} from "angular2-notifications";
import { AccordionModule } from 'ng2-bootstrap';

@Component({
    selector: 'string-usage-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./stringUsageModal.scss')],
    template: require('./stringUsageModal.html'),
})

export class StringUsageModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    title:string = "String Usage";
    loading: boolean = false;
    private stringId: string;
    private responseJson;
    private usage;
    private branchNames: string[];
    private feturesCount: number;
    private key:string = "";

    constructor(private _airLockService:AirlockService,
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
    }

    isViewer(){
        return this._airLockService.isViewer();
    }

    clean(){
        this.usage = {};
        this.branchNames = [];
        this.feturesCount = 0;
    }

    initUsage(){
        var features = {};
        for (let use of this.responseJson.UsedByConfigurations) {
            let branch = use["branchName"]
            if(this.usage[branch] === undefined){
                this.usage[branch] = [];
                this.branchNames.push(branch);
            }
            let u = {};
            u["featureName"] = use["featureName"];
            u["configName"] = use["configName"];
            this.usage[branch].push(u)
            if(features[use["featureName"]] === undefined){
                features[use["featureName"]] = true;
                this.feturesCount++;
            }
        }
    }

    open(stringId: string, key:string = ""){
        this.clean();
        //this.loading = true;
        this.key = key;
        this.stringId = stringId;
        this._airLockService.getStringUsage(stringId).then(res => {
            this.responseJson = res;
            this.initUsage();
            //this.loading = false;
            if (this.modal != null) {
                this.modal.open();
            }
        }).catch(
            error => {
               // this.loading = false;
                console.log(`Failed to get string usage: ${error}`);
                this.handleError(error, "Failed to get string usage");
            }
        );
    }

    close(){
        this.modal.close();
    }

    handleError(error: any,title: string) {
        this.loading = false;
        let errorMessage = error._body || "Failed to create issue. Please try again.";
        console.log("handleError in stringIssueModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        this.create(errorMessage,title);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message:string, title: string) {
        this.toastrService.error(message, title, {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

