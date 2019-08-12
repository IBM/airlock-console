import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Stream} from "../../../model/stream";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: 'add-stream-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addStreamModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addStreamModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddStreamModal {
    @ViewChild('addStreamModal') modal: ModalComponent;
    @Input() seasonId: string;
    @Input() possibleGroupsList :Array<any> = [];
    title:string = "Add Stream";
    loading: boolean = false;
    private isShow:boolean = true;
    _stream: Stream;

    @Output() onStreamAdded = new EventEmitter();


    constructor(private _airLockService:AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService) {
        this.loading = true;
        this.initStream();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initStream(){
        this._stream = new Stream();
        this._stream.filter="false";
        this._stream.description="";
        this._stream.processor="false";
        this._stream.minAppVersion="";
        this._stream.queueSizeKB=1024;
        this._stream.maxQueuedEvents=null;
        this._stream.rolloutPercentage = 100;
        this._stream.stage = "DEVELOPMENT";
        this._stream.resultsSchema="{}";
        this._stream.enabled = false;
        this._stream.internalUserGroups=[];
        this._stream.creator=this._airLockService.getUserName();
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
        if(this._stream.name  == null || this._stream.name.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._stream.name = this._stream.name.trim();
            this.loading = true;
            this._airLockService.createStream(this.seasonId, this._stream).
            then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onStreamAdded.emit(result);
                    this.close()
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New Stream added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Stream name is required.')
        }
    }

    open(){
        this.initStream();
        this.title = "Add Stream";
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
        console.log(this._stream.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._stream.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._stream.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.modal.open('md');
        }
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Stream. Please try again.";
        console.log("handleError in addStreamModal:"+errorMessage);
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
        this.toastrService.error(message, "Stream creation failed", {
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

