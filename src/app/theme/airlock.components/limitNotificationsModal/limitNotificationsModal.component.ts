
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {ToastrService} from "ngx-toastr";
import {AirlockNotifications,NotificationLimitations} from "../../../model/airlockNotifications";
import {AirlockNotification} from "../../../model/airlockNotification";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";



@Component({
    selector: 'limit-notifications-modal',
    providers: [TransparentSpinner, NotificationsService, FeatureUtilsService],
    styles: [require('./limitNotificationsModal.scss')],
    template: require('./limitNotificationsModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class LimitNotificationsModal {

    @ViewChild('limitModal') modal: ModalComponent;

    intervalValues: string[] = ["total","every hour","every day","every week","every month"];
    usedIntervals: boolean[];
    usedIntervalsCount: number;
    usedIntervalsText: string[];
    _notifications: AirlockNotifications = null;
    loading:boolean = false;
    private sub:any = null;
    @Output() onChangeNotificationsLimit = new EventEmitter();

    constructor(private _airLockService:AirlockService, private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private _featureUtils:FeatureUtilsService, private toastrService: ToastrService,public modalAlert: Modal) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    open(notifications: AirlockNotifications) {
        if (this.modal){
            this._notifications = AirlockNotifications.clone(notifications);
            this.init();
            this.modal.open();
        }
    }

    save() {
        this._save();
    }

    isLimitationsValid(limitations: NotificationLimitations[]){
        for(var i=0; i<limitations.length; i++) {
            if (limitations[i].minInterval == undefined) {
                let error = "The Interval field is missing";
                console.log(error);
                this.loading = false;
                this.create(error);
                return false;
            }

            if (limitations[i].maxNotifications == undefined) {
                let error = "The Maximum Notifications field is missing";
                console.log(error);
                this.loading = false;
                this.create(error);
                return false;
            }
        }

            var limitationsB = new Array(this.intervalValues.length).fill(-10);
            for(var j=0; j<limitations.length;j++){
                var interval = this.getIntervalFromMinutes(limitations[j].minInterval);
                var index = this.intervalValues.indexOf(interval);
                //put total last
                if(index == 0){
                    index = this.intervalValues.length -1;
                }
                else{
                    index = index -1;
                }
                limitationsB[index] = limitations[j].maxNotifications;
            }

            var limitationsC = [];
            for(var j=0; j<limitationsB.length;j++) {
                if (limitationsB[j] != -10) {
                    limitationsC.push(limitationsB[j]);
                }
            }

            for (var i = 0; i < limitationsC.length-1; i++) {
                if (limitationsC[i] > limitationsC[i+1]) {
                    let error = "Maximum Notifications for an Interval can't be greater than Maximum Notifications of longer Interval"
                    console.log(error);
                    this.loading = false;
                    this.create(error);
                    return false;
                }
            }

        return true;
    }

    _save(){
            this.loading = true;

            var notificationsToUpdate = AirlockNotifications.clone(this._notifications);
            notificationsToUpdate.notificationsLimitations = [];
            for(var i=0; i<this._notifications.notificationsLimitations.length; i++){
              if(this._notifications.notificationsLimitations[i].maxNotifications != undefined ||
                  this._notifications.notificationsLimitations[i].minInterval != undefined){
                  notificationsToUpdate.notificationsLimitations.push(this._notifications.notificationsLimitations[i]);
              }
            }

            if(this.isLimitationsValid(notificationsToUpdate.notificationsLimitations)){
                this._airLockService.updateoNotifications(notificationsToUpdate).then(result => {
                    this.loading = false;
                    this.onChangeNotificationsLimit.emit(null);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Notification Limitations changed successfully"});
                }).catch(
                    error => {
                        console.log(`Failed to change Notification Limitations: ${error}`);
                        this.handleError(error);
                    }
                );
            }

       }



    close(){
        try{
            if(this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        }catch (e){
            console.log(e);
        }
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to change Notification Limitations.";
        console.log("handleError in LimitNotificationsModal:"+errorMessage);
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
        this.toastrService.error(message, "Failed to change Notification Limitations", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-notification bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }


    selectIntervalValue(limit: NotificationLimitations,intervalIndex: number,limitationIndex: number, limitationText: string){
        console.log('Selected interval value is: ', intervalIndex);
        var oldIntervalText = this.usedIntervalsText[limitationIndex];
        var oldIntervalValue = this.intervalValues.indexOf(oldIntervalText);
        this.usedIntervals[oldIntervalValue]=false;
        limit.minInterval = this.getIntervalByIndex(intervalIndex);
        this.usedIntervalsText[limitationIndex] = limitationText;
        this.usedIntervals[intervalIndex]=true;
    }

    addLimitation(){
        if(this._notifications.notificationsLimitations.length == this.intervalValues.length){
            let message = this.getString("have_max_limitations");
            this.modalAlert.alert()
                .title(message)
                .open();
        }
        else{
            this._notifications.notificationsLimitations.push(new NotificationLimitations());
        }
    }

    removeLimitation(limitationIndex: number){
        var oldIntervalText = this.usedIntervalsText[limitationIndex];
        var oldIntervalValue = this.intervalValues.indexOf(oldIntervalText);
        this.usedIntervals[oldIntervalValue]=false;
        this._notifications.notificationsLimitations.splice(limitationIndex,1);
        this.usedIntervalsCount--;
        this.usedIntervalsText.splice(limitationIndex,1);
    }

    getIntervalByIndex(index:number){
        if(index == 0)
            return -1;
        if(index == 1)
            return 60; //hour
        if(index == 2)
            return 1440; //day
        if(index == 3)
            return 10080; //week
        if(index == 4)
            return 43200; //month = 30 days
        return -1
    }

    getIntervalFromMinutes(min:number){
        if(min == -1)
            return "total"
        if(min < 1440){
            return "every hour";
        }
        if(min < 10080){
            return "every day";
        }
        if(min < 44640){
            return "every week";
        }
        return "every month";
    }

    init() {
        this._notificationService.remove();
        this.usedIntervals = new Array(this.intervalValues.length).fill(false);
        this.usedIntervalsCount = 0;
        this.usedIntervalsText = [];
        for(var i=0; i<this._notifications.notificationsLimitations.length; i++){
            var intervalValue = this._notifications.notificationsLimitations[i].minInterval;
            var intervalText = this.getIntervalFromMinutes(intervalValue);
            var index = this.intervalValues.indexOf(intervalText);
            if(index != -1){
                this.usedIntervalsCount++;
                this.usedIntervals[index] = true;
                this.usedIntervalsText.push(intervalText);
            }

        }
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

}

