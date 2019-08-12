import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {AirlockNotification} from "../../../model/airlockNotification";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {Rule} from "../../../model/rule";
import {Webhook} from "../../../model/webhook";


@Component({
    selector: 'add-webhook-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addWebhookModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addWebhookModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddWebhookModal {
    @ViewChild('addWebhookModal') modal: ModalComponent;
    @Input() seasonId: string;
    possibleProdsList :Array<any> = [];
    @Input() configurationSchema;
    title:string = "Add Notification";
    loading: boolean = false;
    private isShow:boolean = true;
    _webhook: Webhook;
    globalWebhook: boolean = false;

    @Output() onWebhookAdded = new EventEmitter();


    constructor(private _airLockService:AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService) {
        this.loading = true;
        this.initNotification();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initNotification(){
        this._webhook = new Webhook();
        this._webhook.products=[];
        this._webhook.url = "";
        this._webhook.creator = this._airLockService.getUserName();
        this._webhook.sendAdmin = false;
        this._webhook.sendRuntime = false;
        this._webhook.minStage = "PRODUCTION";
        this.loading = false;
    }
    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue=="") {
            return true;
        }
        else
            return false;
    }

    isShownADDButton(){
        return (!this.isViewer());
    }
    isValid(){
        if(this._webhook.name  == null || this._webhook.name.length == 0 || this._webhook.url  == null || this._webhook.url.length == 0
            || this._webhook.minStage  == null || this._webhook.minStage.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._webhook.name = this._webhook.name.trim();
            this.loading = true;
            this._airLockService.createWebhook(this._webhook).
            then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onWebhookAdded.emit(result);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New webhook added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Name and URL are required')
        }
    }

    open(prodsList: Array<any>){
        this.initNotification();
        this.title = "Add Webhook";
        this.globalWebhook = false;
        this.possibleProdsList = prodsList;
        this.removeAll();
        /*this.openWithoutClean(parentId);*/
        this.openWithoutClean();
    }

    toggleGlobal(event) {
        if (this.globalWebhook == true) {
            this.globalWebhook = false;
            this._webhook.products = [];
            var $exampleMulti =  $$(".js_example").select2(
                {
                    tags: true,
                    tokenSeparators: [',', ' ']
                }
            );

            $$('.js_example').on(
                'change',
                (e) => {
                    let prods = jQuery(e.target).val();
                    if (prods != null) {
                        this._webhook.products = prods;
                    }
                }
            );
            $exampleMulti.val(this._webhook.products).trigger("change");
        } else {
            this.globalWebhook = true;
            this._webhook.products = null;
        }
    }
    openWithoutClean(){

        var $exampleMulti =  $$(".js_example").select2(
            {
                tags: true,
                tokenSeparators: [',', ' ']
            }
        );

        $$('.js_example').on(
            'change',
            (e) => {
                let prods = jQuery(e.target).val();
                if (prods != null) {
                    this._webhook.products = prods;
                }
            }
        );
        $exampleMulti.val(this._webhook.products).trigger("change");

        if(this.modal != null) {
            this.modal.open('md');
        }
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Webhook. Please try again.";
        console.log("handleError in addWebhookModal:"+errorMessage);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message:string) {
        this.toastrService.error(message, "Webhook creation failed", {
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

