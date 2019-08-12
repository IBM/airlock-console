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


@Component({
    selector: 'add-notification-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addNotificationModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addNotificationModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddNotificationModal {
    @ViewChild('addNotificationModal') modal: ModalComponent;
    @Input() seasonId: string;
    @Input() possibleGroupsList :Array<any> = [];
    @Input() configurationSchema;
    title:string = "Add Notification";
    notificationTitle: string;
    loading: boolean = false;
    private isShow:boolean = true;
    _notification: AirlockNotification;

    @Output() onNotificationAdded = new EventEmitter();


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
        this._notification = new AirlockNotification();
        this._notification.description="";
        this._notification.minAppVersion="";
        this._notification.rolloutPercentage = 100;
        this._notification.stage = "DEVELOPMENT";
        this._notification.enabled = false;
        this._notification.internalUserGroups=[];
        this._notification.creator=this._airLockService.getUserName();
        this._notification.configuration="{}";
        this._notification.cancellationRule=new Rule();
        this._notification.cancellationRule.ruleString="false";
        this._notification.registrationRule=new Rule();
        this._notification.registrationRule.ruleString="";
        this._notification.maxNotifications = -1;
        this._notification.minInterval = -1;
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
        if(this._notification.name  == null || this._notification.name.length == 0 || this._notification.minAppVersion  == null || this._notification.minAppVersion.length == 0
            || this.notificationTitle  == null || this.notificationTitle.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._notification.name = this._notification.name.trim();
            this._notification.configuration = "{\"notification\":{\"title\":\"" + this.notificationTitle + "\"}}"

            this.loading = true;
            this._airLockService.createNotification(this.seasonId, this._notification).
            then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onNotificationAdded.emit(result);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New Notification added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Minimum App Version, Notification Name and Title are required.')
        }
    }

    open(){
        this.initNotification();
        this.notificationTitle = null;
        this.title = "Add Notification";
        this.removeAll();
        /*this.openWithoutClean(parentId);*/
        this.openWithoutClean();
    }

    openWithoutClean(){

        //this.parentId=parentId;
        var $exampleMulti =  $$(".js_example").select2(
            {
                tags: true,
                tokenSeparators: [',', ' ']
            }
        );
        console.log("internalGroups");
        console.log(this._notification.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._notification.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._notification.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.modal.open('md');
        }
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Notification. Please try again.";
        console.log("handleError in addNotificationModal:"+errorMessage);
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
        this.toastrService.error(message, "Notification creation failed", {
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

