
import {Component, Injectable, ViewEncapsulation, ViewChild, Input, Output, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import { Season } from "../../../model/season"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: 'about-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./aboutModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent, AirlockTooltip],
    template: require('./aboutModal.html')
})

export class AboutModal implements OnInit{

    @ViewChild('aboutModal') modal: ModalComponent;

    loading:boolean = false;
    props: any = {};
    keys = [];
    constructor(private _airlockService : AirlockService, private _notificationService: NotificationsService
        , private _stringsSrevice: StringsService, private toastrService: ToastrService) {
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


    open() {
        if (this.modal){


            this.modal.open();
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    close(){
        this.modal.close();
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
        this.toastrService.error(message, "Error", {
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