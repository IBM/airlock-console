import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Rule} from "../../../model/rule";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {InAppPurchase} from "../../../model/inAppPurchase";
import {Branch} from "../../../model/branch";
import {Feature} from "../../../model/feature";


@Component({
    selector: 'add-purchase-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addPurchaseModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addPurchaseModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddPurchaseModal {
    @ViewChild('addPurchaseModal') modal: ModalComponent;
    @Input() branch: Branch;
    @Input() possibleGroupsList :Array<any> = [];
    title:string = "Add Entitlement";
    loading: boolean = false;
    parent:InAppPurchase;
    private isShow:boolean = true;
    _purchase: InAppPurchase;
    subFeatureParentName:string = null;
    otherFeatureToCreateMX:InAppPurchase=null;
    mxGroupToAdd : InAppPurchase = null;
    mxItemNames:Array<string>=[];
    parentId:string = "";
    newItemInMXIndex:number=0;

    @Output() onPurchaseAdded = new EventEmitter();

    _rule: Rule;


    constructor(private _airLockService:AirlockService, private _featureUtils:FeatureUtilsService,
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService) {
        this.loading = true;
        this.initPurchase();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initPurchase(){
        this._purchase = new InAppPurchase();
        this._rule = new Rule();
        this._purchase.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._purchase.rule = this._rule;
        this._purchase.stage = "DEVELOPMENT";
        this._purchase.enabled = false;
        this._purchase.includedEntitlements = [];
        this._purchase.namespace = "airlockEntitlement";
        this._purchase.internalUserGroups=[];
        this._purchase.type = "ENTITLEMENT";
        this._purchase.creator=this._airLockService.getUserName();
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
        if(this._purchase.name  == null || this._purchase.name.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this._purchase.name = this._purchase.name.trim();
            this.loading = true;
            this._airLockService.addInAppPurchase(this._purchase,this.branch.seasonId,this.branch.uniqueId,this.parentId).
            then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onPurchaseAdded.emit(result);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New entitlement added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Entitlement name is required.')
        }
    }

    open(parent:InAppPurchase){
        this.parent=parent;
        this.initPurchase();
        this.title = "Add Entitlement";
        this.removeAll();
        /*this.openWithoutClean(parentId);*/
        this.openWithoutClean(parent.uniqueId);
    }

    openWithoutClean(parentId:string, size='md'){

        this.parentId=parentId;
        var $exampleMulti =  $$(".js_example").select2(
            {
                tags: true,
                tokenSeparators: [',', ' ']
            }
        );
        console.log("internalGroups");
        console.log(this._purchase.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._purchase.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._purchase.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.modal.open(size);
        }
    }

    openAsAddWithOtherFeatureToMX(parentId:string,otherFeature:InAppPurchase){
        this.clean();
        this.title = "Add Entitlement To New Mutual Exclusion Group";
        this.otherFeatureToCreateMX=otherFeature;
        this.openWithoutClean(parentId);
    }
    clean(){
        this.initPurchase();
        this.removeAll();
        this.title = "Add Entitlement";
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;
        this.otherFeatureToCreateMX=null;
        this.subFeatureParentName=null;
    }
    selectItemToBeAfter(index:number){
        console.log("index:"+index);
        this.newItemInMXIndex=index;
    }
    openInExistingXM(mxGroupToAdd:InAppPurchase){
        this.clean();
        this.title = "Add Entitlement To Mutual Exclusion  Group";
        this.mxGroupToAdd = mxGroupToAdd;
        this.mxItemNames = ["-- Add As First --"];
        for(let item of mxGroupToAdd.entitlements){
            if (item.type == 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP') {
                this.mxItemNames.push(this._featureUtils.getPurchaseMXDisplayName(item));
            } else {
                this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
        this.openWithoutClean(mxGroupToAdd.uniqueId, 'lg');
    }
    openAsAddSubFeature(parentId:string,parentName:string, parentNamespace:string){
        this.clean();
        this.title = "Add Subpurchase";
        this.subFeatureParentName = parentName;
        this._purchase.namespace = parentNamespace;
        this.openWithoutClean(parentId);
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create purchase. Please try again.";
        console.log("handleError in addPurchaseModal:"+errorMessage);
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
        this.toastrService.error(message, "Entitlement creation failed", {
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

