import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Experiment} from "../../../model/experiment";
import {Rule} from "../../../model/rule";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";


@Component({
    selector: 'add-experiment-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addExperimentModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addExperimentModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddExperimentModal {
    @ViewChild('addExperimentModal') modal: ModalComponent;
    @Input() productId: string;
    @Input() possibleGroupsList :Array<any> = [];
    title:string = "Add Experiment";
    loading: boolean = false;
    private isShow:boolean = true;
    _experiment: Experiment;

    @Output() onExperimentAdded = new EventEmitter();

    _rule: Rule;


    constructor(private _airLockService:AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService) {
        this.loading = true;
        this.initExperiment();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initExperiment(){
        this._experiment = new Experiment();
        this._rule = new Rule();
        this._experiment.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._experiment.rule = this._rule;
        this._experiment.stage = "DEVELOPMENT";
        this._experiment.enabled = false;
        this._experiment.internalUserGroups=[];
        this._experiment.creator=this._airLockService.getUserName();
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
        if(this._experiment.name  == null || this._experiment.name.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._experiment.name = this._experiment.name.trim();
            this.loading = true;
            this._airLockService.createExperiment(this.productId, this._experiment).
            then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onExperimentAdded.emit(result);
                    this.close()
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New experiment added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Experiment name is required.')
        }
    }

    open(){
        this.initExperiment();
        this.title = "Add Experiment";
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
        console.log(this._experiment.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._experiment.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._experiment.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.modal.open('md');
        }
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create experiment. Please try again.";
        console.log("handleError in addExperimentModal:"+errorMessage);
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
        this.toastrService.error(message, "Experiment creation failed", {
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

