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
import {PurchaseOptions} from "../../../model/purchaseOptions";
import {StoreProductId} from "../../../model/storeProductId";
import { Modal } from 'angular2-modal/plugins/bootstrap/modal';

export class StoreTypes {
    static IOS = "Apple App Store";
    static ANDROID = "Google Play Store";
}
@Component({
    selector: 'add-purchase-option-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./addPurchaseOptionModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./addPurchaseOptionModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class AddPurchaseOptionModal {
    @ViewChild('addPurchaseOptionModal') modal: ModalComponent;
    @Input() branch: Branch;
    @Input() possibleGroupsList :Array<any> = [];
    title:string = "Add Purchase Option";
    loading: boolean = false;
    private isShow:boolean = true;
    _purchaseOption: PurchaseOptions;
    subFeatureParentName:string = null;
    otherFeatureToCreateMX:PurchaseOptions=null;
    mxGroupToAdd : PurchaseOptions = null;
    mxItemNames:Array<string>=[];
    parentId:string = "";
    storeProduct:string = "Apple App Store";
    productId:string = "";
    newItemInMXIndex:number=0;
    storeType: StoreTypes[] = [StoreTypes.IOS, StoreTypes.ANDROID]
    @Output() onPurchaseOptionsAdded = new EventEmitter();

    _rule: Rule;


    constructor(private _airLockService:AirlockService, private _featureUtils:FeatureUtilsService,
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService, public modalAlert: Modal) {
        this.loading = true;
        this.initPurchaseOptions(null);
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initPurchaseOptions(parent: Feature){
        this._purchaseOption = new PurchaseOptions();
        this._rule = new Rule();
        this.productId = "";
        this.storeProduct = "Apple App Store";
        this._purchaseOption.storeProductIds = [];
        this._purchaseOption.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._purchaseOption.rule = this._rule;
        this._purchaseOption.stage = "DEVELOPMENT";
        this._purchaseOption.storeProductIds = [new StoreProductId()];
        this._purchaseOption.storeProductIds[0].storeType = "Apple App Store";
        this._purchaseOption.storeProductIds[0].productId = "";
        this._purchaseOption.enabled = true;
        this._purchaseOption.namespace = "airlockEntitlement";
        this._purchaseOption.internalUserGroups=[];
        this._purchaseOption.type = "PURCHASE_OPTIONS";
        this._purchaseOption.creator=this._airLockService.getUserName();
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
        if(this._purchaseOption.name  == null || this._purchaseOption.name.length == 0){
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save(){
        if(this.productId === "") {
            let message = 'Product id does not specified. Are you sure want to continue?';
            this.modalAlert.confirm()
                .title(message)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(() => {
                    this._save();
                }) // if were here ok was clicked.
                .catch(err => {
                    // this.loading = false;
                    // this.handleError(err);
                });
        }else{
            this._save();
        }
    }
    _save() {
        if(this.isValid()) {
            this._purchaseOption.name = this._purchaseOption.name.trim();
            this.loading = true;
            if(this.productId === ""){
                this._purchaseOption.storeProductIds = [];
            }else{
                this._purchaseOption.storeProductIds = [new StoreProductId()];
                this._purchaseOption.storeProductIds[0].storeType = this.storeProduct;
                this._purchaseOption.storeProductIds[0].productId = this.productId;

            }

            this._airLockService.addPurchaseOptions(this._purchaseOption,this.branch.seasonId,this.branch.uniqueId,this.parentId).
            then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onPurchaseOptionsAdded.emit(result);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"New purchase option added"});
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Purchase option name is required.');
        }
    }

    open(parent:Feature){
        this.initPurchaseOptions(parent);
        this.title = "Add Purchase Option";
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
        console.log(this._purchaseOption.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this._purchaseOption.internalUserGroups = jQuery(e.target).val();

            }
        );
        $exampleMulti.val(this._purchaseOption.internalUserGroups).trigger("change");

        if(this.modal != null) {
            this.modal.open(size);
        }
    }

    openAsAddWithOtherFeatureToMX(parentId:string,otherFeature:PurchaseOptions){
        this.clean(otherFeature);
        this.title = "Add Purchase Option To New Mutual Exclusion Group";
        this.otherFeatureToCreateMX=otherFeature;
        this.openWithoutClean(parentId);
    }
    clean(parent: Feature){
        this.initPurchaseOptions(parent);
        this.removeAll();
        this.title = "Add Purchase Option";
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;
        this.otherFeatureToCreateMX=null;
        this.subFeatureParentName=null;
    }
    selectItemToBeAfter(index:number){
        console.log("index:"+index);
        this.newItemInMXIndex=index;
    }
    openInExistingXM(mxGroupToAdd:PurchaseOptions){
        this.clean(mxGroupToAdd);
        this.title = "Add Purchase Option To Mutual Exclusion  Group";
        this.mxGroupToAdd = mxGroupToAdd;
        this.mxItemNames = ["-- Add As First --"];
        for(let item of mxGroupToAdd.purchaseOptions){
            if (item.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
                this.mxItemNames.push(this._featureUtils.getPurchaseOptionsMXDisplayName(item));
            } else {
                this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
        this.openWithoutClean(mxGroupToAdd.uniqueId, 'lg');
    }
    openAsAddSubFeature(parentId:string,parentName:string, parentNamespace:string){
        this.clean(null);
        this.title = "Add SubOption";
        this.subFeatureParentName = parentName;
        this._purchaseOption.namespace = parentNamespace + parentName;
        this.openWithoutClean(parentId);
    }

    close(){

        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create option. Please try again.";
        console.log("handleError in addPurchaseOptionModal:"+errorMessage);
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
        this.toastrService.error(message, "Purchase option creation failed", {
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
    selectStoreType(type:string){
        this.storeProduct = type;
    }

    getStoreTypeForSelect():any[] {
        var toRet = [];
        // if (this.selectedPurchase) {
        //     let selected = {id:this.selectedPurchase, text:this.getStoreTypeDisplayName(this.selectedPurchase)};
        //     toRet.push(selected);
        // }
        // if (this.inAppPurchases) {
        //     for (var purchase of this.entitlements) {
        //         if(this.selectedPurchase == null || purchase.uniqueId!=this.selectedPurchase.uniqueId) {
        //             let productObj = {id:purchase,
        //                 text:this.getStoreTypeDisplayName(purchase)};
        //             toRet.push(productObj);
        //         }
        //     }
        // }
        for (var type of this.storeType) {
            let productObj = {id:type,
                text:type};
            toRet.push(productObj);
        }
        return toRet;
    }

    getStoreTypeDisplayName(purchase: PurchaseOptions) {
        return this._featureUtils.getFeatureDisplayName(purchase);
    }
    selectStoreTypeFromSelect(storeObj:any) {
        if (storeObj) {
            if (storeObj.id) {
                this.selectStoreType(storeObj.id);
            }
        }
    }
    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

