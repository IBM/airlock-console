import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
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
    selector: 'add-variant-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addVariantModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addVariantModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddVariantModal {
    @ViewChild('addVariantModal') modal: ModalComponent;
    @Input() productId: string;
    experiment: Experiment;
    @Input() possibleGroupsList :Array<any> = [];
    title:string = "Add Variant";
    loading: boolean = false;
    loaded: boolean = false;
    availableBranches: string[];
    _variant: Variant;

    @Output() onVariantAdded = new EventEmitter();

    _rule: Rule;


    constructor(private _airLockService:AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService) {
        this.loading = true;
        this.initVariant();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initVariant(){
        this._variant = new Variant();
        this._rule = new Rule();
        this._variant.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._variant.rule = this._rule;
        this._variant.stage = "DEVELOPMENT";
        this._variant.enabled = true;
        this._variant.internalUserGroups=[];
        this._variant.creator=this._airLockService.getUserName();
        this.loading = false;

    }

    isShownADDButton(){
        return (!this.isViewer());
    }
    isValid(){
        if(this._variant.name  == null || this._variant.name.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._variant.name = this._variant.name.trim();
            this.loading = true;
            this._airLockService.addVariant(this._variant, this.experiment.uniqueId).
            then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onVariantAdded.emit(result);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New variant added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Variant name is required.')
        }
    }

    open(experiment: Experiment, availableBranches: string[] ){
        this.experiment = experiment;
        this.availableBranches = availableBranches;
        this.initVariant();
        this.title = "Add Variant";
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
        console.log(this._variant.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._variant.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._variant.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.loaded = true;
            this.modal.open('md');
        }
    }

    getBranchesForSelect():any[] {
        var toRet = [];
        if (this.availableBranches) {
            for (var branch of this.availableBranches) {
                toRet.push(branch);
            }
        }
        return toRet;
    }

    selectBranchFromSelect(branchObj:any) {
        if (branchObj)  {
            this._variant.branchName =  branchObj.text;
        }
    }

    close(){
        this.loaded = false;
        this.modal.close();
    }

    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue=="") {
            return true;
        }
        else
            return false;
    }


    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in addVariantModal:"+errorMessage);
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
        this.toastrService.error(message, "Variant creation failed", {
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

