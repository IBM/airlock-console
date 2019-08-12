
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Branch} from "../../../model/branch";
import {InAppPurchase} from "../../../model/inAppPurchase";
import {ReorderMXGroupModal} from "../reorderMXGroupModal";



@Component({
    selector: 'reorder-purchase-mx-group-modal',
    providers: [TransparentSpinner, NotificationsService, FeatureUtilsService],
    styles: [require('./reorderPurchaseMXGroupModal.scss')],
    template: require('./reorderPurchaseMXGroupModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class ReorderPurchaseMXGroupModal {

    @ViewChild('reorderMXGroupModal') modal: ModalComponent;
    @Input() verifyActionModal: VerifyActionModal;

    _branch: Branch = null;
    isFeature:boolean = false;
    _mxGroup: InAppPurchase = null;
    _configParent: InAppPurchase = null;
    _selectedTarget:InAppPurchase = null;
    _selectedIndex:number=0;
    isConfig:boolean = false;
    isPurchaseOption:boolean = false;
    isOrderRule:boolean = false;
    loading:boolean = false;
    private sub:any = null;
    @Output() onReorderMX = new EventEmitter();

    constructor(private _airLockService:AirlockService, private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private _featureUtils:FeatureUtilsService, private toastrService: ToastrService) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    private isShowMaxForOrderRule:boolean = false;
    open(branch: Branch, mxGroup:InAppPurchase, configParent:InAppPurchase = null, isFeature:boolean = false,isConfig:boolean = false,isOrderRule:boolean = false,isShowMaxForOrderRule:boolean = false, isPurchaseOption:boolean = false) {
        if (this.modal){
            this.removeAll();
            this._configParent = configParent;
            this._branch = branch;
            this._mxGroup = mxGroup;
            this.isFeature = isFeature;
            this.isOrderRule = isOrderRule;
            this.isConfig = isConfig;
            this.isPurchaseOption = isPurchaseOption;
            this.isShowMaxForOrderRule = isShowMaxForOrderRule;
            console.log("this._configParent");
            console.log(this._configParent);
            console.log("this._mxGroup");
            console.log(this._mxGroup);
            this.modal.open();
        }
    }

    isConfigMode(): boolean {
        return this.isConfig  || this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP"
    }
    isOrderMode(): boolean {
        return this.isOrderRule ||  this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP"
    }
    shouldShowMaxOnSection(): boolean {
        return ( (this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" && this._configParent == null) || (this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP" &&  this.isShowMaxForOrderRule) ||
            this._mxGroup.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP" || this._mxGroup.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP")
    }

    // This will return true if the dialog is shown for the root configuration under the feature so it has a reorder
    // but it is not a regular MX group so no "max on" field for example
    isConfigurationsRoot(): boolean {

        return ((this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" || this._mxGroup.type =="ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") && this._configParent != null)
    }

    getType(isCapitalized:boolean) {
        let retVal:string = "";
        if (this.isConfigMode()) {
            retVal = "Configuration Rule";
        } else {
            retVal = "Feature";
        }

        if (!isCapitalized)
            return retVal.toLocaleLowerCase();
        else
            return retVal;
    }

    getChildren(fromItem: Feature): Feature[] {
        if (fromItem) {
            if (this.isConfiguration()) {
                return fromItem.configurationRules;
            } else if(this.isPurchaseOptions()) {
                let purchase = fromItem as InAppPurchase;
                return purchase.purchaseOptions;
            }else {
                if(this.isOrderingRule()){
                    return fromItem.orderingRules;
                } else {
                    let purchase = fromItem as InAppPurchase;
                    return purchase.entitlements;
                }

            }
        } else {
            return null;
        }

    }

    getFeatureType() {
        if (this.isConfig ||  this._mxGroup && this._mxGroup.type=="CONFIG_MUTUAL_EXCLUSION_GROUP") {
            return "configuration";
        } else if (this.isPurchaseOption){
            return "purchaseOptions";
        } else {
            if (this.isOrderRule ||  this._mxGroup && this._mxGroup.type=="ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") {
                return "order";
            } else {
                return "feature";
            }
        }
    }

    isConfiguration() {
        return this.getFeatureType()=="configuration";
    }
    isOrderingRule() {
        return this.getFeatureType()=="order";
    }
    isPurchaseOptions() {
        return this.getFeatureType()=="purchaseOptions";
    }
    selectTarget(feature:InAppPurchase,index:number){

        if (this._selectedTarget == feature && this._selectedIndex == index){
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = feature;
            this._selectedIndex = index;
        }
    }
    save() {

        if (this._mxGroup.maxFeaturesOn < 1 /*|| this._mxGroup.maxFeaturesOn > this.getChildren(this._mxGroup).length*/) {
            console.log(`INVALID MAX FEATURES ON IN MX`);
            this.handleError("INVALID MAX FEATURES ON IN MX");
            return;
        }
        let firstProdFeatureInMxGroup = this.getFirstProdFeatureInMxGroup();
        if (firstProdFeatureInMxGroup != null) {
            this.sub = this.verifyActionModal.actionApproved$.subscribe(
                astronaut => {
                    this._save();
                });
            console.log("open verifyActionModal");
            this.verifyActionModal.open(this._stringsSrevice.getString("reorder_mx_change_production_feature"), firstProdFeatureInMxGroup, VeryfyDialogType.FEATURE_TYPE);

        }else {
            this._save();
        }
    }
    _save(){

            this.loading = true;
            let featureToUpdate:InAppPurchase = this.getFeatureToUpdate();
            console.log()
            this._airLockService.updateInAppPurchase(featureToUpdate, this._branch.uniqueId).then(result => {
                this.loading = false;
                this.onReorderMX.emit(null);
                this.close();
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Reorder succeeded"});
            }).catch(
                    error => {
                        console.log(`Failed to reorder: ${error}`);
                        this.handleError(error);
                    }
                );
       }
    getFirstProdFeatureInMxGroup():Feature{
        //not relevant to reorder features only to mx
        if(this.isFeature && (this._mxGroup.type == "ENTITLEMENT" || this._mxGroup.type == "ROOT")){
            return null;
        }
        if((this.isConfigMode()  || this.isOrderMode() )&& this._configParent != null) {
            let arr:Array<Feature> = (this.isConfigMode())?this._mxGroup.configurationRules:this._mxGroup.orderingRules;
            for(let curFeature of arr){
                if(curFeature.stage == 'PRODUCTION'){
                    return curFeature;
                }
            }
            return null;
        } else {
            let arr:Feature[] = this._mxGroup.features;
            for(let curFeature of arr){
                if(curFeature.stage == 'PRODUCTION'){
                    return curFeature;
                }
            }
            return null;
        }
    }
    getFeatureToUpdate(): InAppPurchase {
        if((this.isConfigMode()  || this.isOrderMode())&& this._configParent != null) {
            if(this.isConfigMode()) {
                let arr: Array<Feature> = this._mxGroup.configurationRules;
                this._configParent.configurationRules = arr;
            }else{
                let arr: Array<Feature> = this._mxGroup.orderingRules;
                this._configParent.orderingRules = arr;
                if(this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP"){
                    this._configParent.maxFeaturesOn =this._mxGroup.maxFeaturesOn;
                }
            }
            /*if (this.isConfiguration()) {
                this._configParent.configurationRules = finalArray;
            } else {
                this._configParent.features = finalArray;
            }*/

            return this._configParent;
        } else {
            return this._mxGroup;
        }
    }

    getName(feature:Feature) {
        if (!feature) {
            return null;
        }
        if (this.isMXgroup(feature)) {
            return this.getToolTip(feature);
        } else {
            //return feature.name;
            return this._featureUtils.getFeatureDisplayName(feature);
        }
    }

    isMXgroup(item:Feature) {
        return item && item.type && (item.type=="CONFIG_MUTUAL_EXCLUSION_GROUP" || item.type=="ORDERING_RULE_MUTUAL_EXCLUSION_GROUP"  || item.type=="MUTUAL_EXCLUSION_GROUP"  || item.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || item.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP");
    }

    isEmptyMX(item:Feature) {
        return item && this.isMXgroup(item) && this.getChildren(item) && this.getChildren(item).length <= 0;
    }

    getToolTip(feature:Feature) {
        let sons = "";;
        let items = this.getChildren(feature);
        if(items != null) {
            for (let item of items) {
                let subfeat: Feature = item;
                if (sons == "") {
                    sons = "Group: " + this.getName(subfeat);
                } else {
                    sons += " \\ " + this.getName(subfeat);
                }
            }
            return sons;
        }else{
            return "Empty MX";
        }
    }

    getSubFeatures(feature:Feature) {
        let feat = feature;
        let toRet = [];
        if (this.isConfiguration()) {
            toRet = feat.configurationRules
        } else if (this.isPurchaseOptions()) {
            let purchase = feat as InAppPurchase;
            toRet = purchase.purchaseOptions;
        } else {
            if(this.isOrderRule){
                toRet = feat.orderingRules;
            } else {
                toRet = feat.features;
            }
        }
        return toRet;
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
    scrollToSelectedItem(){
        let itemIndex = this._selectedIndex;
        //list-group-item
        console.log(jQuery(".list-group-item"));
        jQuery(".mainAccordion").each(function(indexMain,itemMain){
            jQuery(".list-group-item").each(function(index,item){
                if(index == itemIndex ){
                    console.log(jQuery(".mainAccordion"));
                    let windowScroll = jQuery(".mainAccordion").scrollTop();
                    let offsetParent = itemMain.offsetTop;
                    let offsetHeight = itemMain.offsetHeight;
                    console.log(offsetParent);
                    console.log(offsetHeight);
                    console.log("windowScroll");
                    console.log(windowScroll);
                    console.log(item.offsetTop);
                    console.log(windowScroll- offsetParent + offsetHeight);
                    if(windowScroll + offsetHeight < item.offsetTop + item.offsetHeight){
                        console.log("first case");
                        jQuery(".mainAccordion").scrollTop(item.offsetTop + item.offsetHeight);
                    }else {
                        if (item.offsetTop < windowScroll + item.offsetHeight) {
                            console.log("second case");
                            jQuery(".mainAccordion").scrollTop(item.offsetTop - item.offsetHeight);
                        }
                    }
                    console.log("after windowScroll");
                    console.log(jQuery(".mainAccordion").scrollTop());
                    console.log(item.offsetTop);


                }
            });

        });
    }
    moveUp(){
        if(this._selectedIndex == 0 || this._selectedTarget == null){

        }else{
            var oldVal:Feature = this.getChildren(this._mxGroup)[this._selectedIndex -1];
            let length =
            this.getChildren(this._mxGroup)[this._selectedIndex -1] = this.getChildren(this._mxGroup)[this._selectedIndex];
            this.getChildren(this._mxGroup)[this._selectedIndex] = oldVal;
            this._selectedIndex--;
            this.scrollToSelectedItem();

        }
    }
    moveDown(){
        if(this._selectedIndex == this.getChildren(this._mxGroup).length -1 || this._selectedTarget == null){

        }else{
            var oldVal:Feature = this.getChildren(this._mxGroup)[this._selectedIndex +1];
            this.getChildren(this._mxGroup)[this._selectedIndex +1] = this.getChildren(this._mxGroup)[this._selectedIndex];
            this.getChildren(this._mxGroup)[this._selectedIndex] = oldVal;
            this._selectedIndex++;
            this.scrollToSelectedItem();

        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder. Please make sure you specify a valid number of maximal features that can be on.";
        console.log("handleError in reorderMXGroupModal:"+errorMessage);
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
        this.toastrService.error(message, "Reorder failed", {
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

