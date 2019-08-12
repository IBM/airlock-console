
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";

@Component({
    selector: 'select-Locale-For-Runtime-Modal',
    styles: [require('./selectLocaleForRuntimeModal.scss')],
    template: require('./selectLocaleForRuntimeModal.html'),
    // encapsulation: ViewEncapsulation.None
})

export class SelectLocaleForRuntimeModal {

    @ViewChild('selectLocaleForRuntimeModal') modal: ModalComponent;

    loading: boolean = false;
    seasonId:string = null;
    locales:any[] = [];
    @Output() onProductAdded = new EventEmitter();

    constructor(private _airLockService:AirlockService, private _notificationService: NotificationsService,
                private _stringsSrevice: StringsService, private toastrService: ToastrService) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(seasonId:string) {
        var v = this;
        this.removeAll();
        this.locales = [];
        this.seasonId=seasonId;
        // this.linksObj = {
        //     "seasonId": "e2d4efc6-90cf-40f7-a4aa-323daf14e0e3",
        //     "defaultsFile": "https://s3-eu-west-1.amazonaws.com/airlockdev/irit/seasons/e2d4efc6-90cf-40f7-a4aa-323daf14e0ec/e2d4efc6-90cf-40f7-a4aa-323daf14e0e3/AirlockDefaults.json",
        //     "platforms": [
        //         {
        //             "platform": "Android",
        //             "links": [
        //                 {
        //                     "link": "https://s3-eu-west-1.amazonaws.com/airlockdev/irit/seasons/e2d4efc6-90cf-40f7-a4aa-323daf14e0ec/e2d4efc6-90cf-40f7-a4aa-323daf14e0e3/AirlockConstants.java",
        //                     "displayName": "Constants for Android"
        //                 }
        //             ]
        //         },
        //         {
        //             "platform": "iOS",
        //             "links": [
        //                 {
        //                     "link": "https://s3-eu-west-1.amazonaws.com/airlockdev/irit/seasons/e2d4efc6-90cf-40f7-a4aa-323daf14e0ec/e2d4efc6-90cf-40f7-a4aa-323daf14e0e3/AirlockConstants.swift",
        //                     "displayName": "Constants for iOS"
        //                 }
        //             ]
        //         }
        //     ]
        // };
        // this.platforms = this.getPlatforms(this.linksObj);
        // v.loading = false;
        // if (v.modal){
        //
        //     v.modal.open();
        // }
        // if(1 == 1) {
        //     return;
        // }
        this.setLocales();
        v.loading = false;
        if (v.modal){
            v.modal.open();
        }
    }

    setLocales(){
        this.locales = [{"displayName":"en_us","locale":"en_us"},{"displayName":"all","locale":"general"}];
    }

    downloadFiles(locale: string){
        this._airLockService.downloadRuntimeDefaultFiles(this.seasonId,locale);
    }


    close(){
        this.modal.close();
    }


    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Request failed, try again later.";
        console.log("handleError in selectLocaleForRuntimeModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
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

    create(message:string) {
        this.toastrService.error(message, "Action failed", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-notification bare toast',
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

