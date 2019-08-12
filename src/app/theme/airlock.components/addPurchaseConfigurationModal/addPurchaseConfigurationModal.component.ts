import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {BaThemeSpinner} from "../../../theme/services/baThemeSpinner/baThemeSpinner.service";
import {AirlockService} from "../../../services/airlock.service";
import {BaCard} from '../../../theme/components';
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Feature} from "../../../model/feature";
import {Rule} from "../../../model/rule";

import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {BaCheckbox} from "../../components/baCheckbox/baCheckbox.component";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import {Branch} from "../../../model/branch";
import {InAppPurchase} from "../../../model/inAppPurchase";

@Component({
  selector: 'add-purchase-configuration-modal',
  providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
  styles: [require('./addPurchaseConfigurationModal.scss')],
  // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,BaCard,BaCheckbox,DROPDOWN_DIRECTIVES, SimpleNotificationsComponent, POPOVER_DIRECTIVES, AirlockTooltip],
  template: require('./addPurchaseConfigurationModal.html'),
  encapsulation: ViewEncapsulation.None

})
/*export class FeaturesPage {
    constructor() {

    }
}*/
export class AddPurchaseConfigurationModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    title:string = "Add Feature";
    isConfiguraion:boolean = true;
    isOrderRule:boolean = false;
    subFeatureParentName:string = null;
    loading: boolean = false;
    branchId: string;
    feature:InAppPurchase;
    @Input() valid:boolean;
    otherFeatureToCreateMX:Feature=null;
    mxGroupToAdd : Feature = null;
    mxItemNames:Array<string>=[];
    parentType: string;
    groups:string = "";
    @Input() seasonId: string;
    @Input() rootId: string;
    @Input()
    possibleGroupsList :Array<any> = [];
    @Input()
    parentId:string = "";
    @Output() onAddFeature= new EventEmitter<any>();
    newItemInMXIndex:number=0
    private showNameSpaceInTitle:boolean = true;



    constructor(private _spinner:BaThemeSpinner, private _airLockService:AirlockService,private _featureUtils:FeatureUtilsService,private authorizationService:AuthorizationService,
         private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this.loading = true;
        this.initFeature();
    }
    getParentTypeForPresentation(){
        if(this.parentType === "ENTITLEMENT"){
            return "Entitlement";
        }
        if(this.parentType === "PURCHASE_OPTIONS"){
            return "Purchase option";
        }
        return "Feature";
    }
    isViewer(){
        return this._airLockService.isViewer();
    }
    initFeature(){
        this.feature = new InAppPurchase();
        this.feature.name = "";
        this.feature.namespace="";
        this.feature.stage="DEVELOPMENT";
        if(this.isConfiguraion) {
            this.feature.type = "CONFIGURATION_RULE";
        }else{
            this.feature.type = "ORDERING_RULE";
        }
        this.feature.rule= new Rule();
        this.feature.configuration = "{}";
        this.feature.rule.ruleString="";
        this.feature.defaultIfAirlockSystemIsDown=false;
        this.feature.description="";
        this.feature.parent= null;
        this.feature.enabled = false;
        this.feature.rolloutPercentage=100;
        this.feature.creator=this._airLockService.getUserName();
        this.feature.owner=this._airLockService.getUserName();
        this.feature.minAppVersion="";
        this.feature.internalUserGroups=[];
        this.groups = "";
        this.parentType="ENTITLEMENT";
        this.loading = false;
    }
    isShownADDButton(){
        return (!this.isViewer());
    }
    isValid(){
        if(this.feature.name  == null || this.feature.name.length == 0){
            return false;
        }
        if(this.feature.namespace  == null || this.feature.namespace.length == 0){
            return false;
        }

        return true;
    }
    saveNewMXGWithNewFeatureAndOther(){
        this.loading = true;
        var mxGroup:InAppPurchase = new InAppPurchase();
        mxGroup.seasonId=this.seasonId;
        mxGroup.type="ENTITLEMENT_MUTUAL_EXCLUSION_GROUP";
        console.log(this.feature);
        var newFeature:InAppPurchase = InAppPurchase.clone(this.feature);
        console.log(newFeature);
        console.log("before add MX");
        var otherFeature:Feature = this.otherFeatureToCreateMX;
        //clean for next time
        this.otherFeatureToCreateMX = null;
        var branchId:string = this.branchId;
        console.log(branchId);
        //Add MX,New Feature and then change MX feature to be other and the new features
        this._airLockService.addInAppPurchase(mxGroup, this.seasonId, this.branchId, this.parentId).then(result => {
            var fetchedMX = (result as InAppPurchase);
            console.log("after add MX");
            console.log(fetchedMX);
            var mxId:string = fetchedMX.uniqueId;


            this._airLockService.addInAppPurchase(newFeature, this.seasonId, branchId, mxId).then(result => {
                console.log("after add new feature");
                var newFetchedFeature:InAppPurchase = (result as InAppPurchase);
                console.log("newFeature");

                this._airLockService.getFeature(mxId, branchId).then(result => {
                    fetchedMX = (result as InAppPurchase);
                    this._airLockService.getInAppPurchase(newFetchedFeature.uniqueId, branchId).then(result => {
                        newFetchedFeature = (result as InAppPurchase);
                        if(this.isConfiguraion) {
                            fetchedMX.configurationRules = [otherFeature, newFetchedFeature];
                        }else{
                            fetchedMX.orderingRules = [otherFeature, newFetchedFeature];
                        }
                        this._airLockService.updateInAppPurchase(fetchedMX, branchId).then(result => {
                            this.loading = false;
                            this.onAddFeature.emit(null);
                            this.close()
                        }).catch(
                            error => {
                                console.log(`Failed to add entitlement: ${error}`);
                                this.handleError(error);
                            }
                        );;
                    }).catch(
                        error => {
                            console.log(`Failed to add entitlement: ${error}`);
                            this.handleError(error);
                        }
                    );;

                }).catch(
                    error => {
                        console.log(`Failed to add entitlement: ${error}`);
                        this.handleError(error);
                    }
                );;


            }).catch(
                error => {
                    console.log(`Failed to add entitlement configuration: ${error}`);
                    this.handleError(error);
                }
            );;
        }).catch(
            error => {
                console.log(`Failed to add entitlement configuration: ${error}`);
                this.handleError(error);
            }
        );
    }
    saveInExistingMX(){
        this.loading = true;
        var newFeature:InAppPurchase = InAppPurchase.clone(this.feature);
        var mxId:string = this.parentId;

        var newItemPlace:number = this.newItemInMXIndex;
        var localmxGroupToAdd:Feature = this.mxGroupToAdd;
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;

        console.log("new place:"+newItemPlace);
        var branchId:string = this.branchId;
        console.log(branchId);
        this._airLockService.addInAppPurchase(newFeature, this.seasonId, this.branchId, this.parentId).then(result => {
            console.log("after add new feature");
            var newFetchedFeature: InAppPurchase = (result as InAppPurchase);
            this._airLockService.getInAppPurchase(localmxGroupToAdd.uniqueId, branchId).then(result => {
                var fetchedMX: InAppPurchase = (result as InAppPurchase);
                this._airLockService.getInAppPurchase(newFetchedFeature.uniqueId, branchId).then(result => {
                    newFetchedFeature = result;
                    if(this.isConfiguraion) {
                        fetchedMX.configurationRules.splice(newItemPlace, 0, newFetchedFeature);
                        fetchedMX.configurationRules.splice(fetchedMX.configurationRules.length - 1, 1);
                    }else{
                        fetchedMX.orderingRules.splice(newItemPlace, 0, newFetchedFeature);
                        fetchedMX.orderingRules.splice(fetchedMX.orderingRules.length - 1, 1);
                    }
                    console.log(fetchedMX);
                    this._airLockService.updateInAppPurchase(fetchedMX, branchId).then(result => {
                        this.loading = false;
                        this.onAddFeature.emit(null);
                        this.close()
                    }).catch(
                        error => {
                            console.log(`Failed to add configuration: ${error}`);
                            this.handleError(error);
                        }
                    );
                }).catch(
                    error => {
                        console.log(`Failed to add configuration: ${error}`);
                        this.handleError(error);
                    }
                );;
            }).catch(
                error => {
                    console.log(`Failed to add entitlement configuration: ${error}`);
                    this.handleError(error);
                }
            );;
        }).catch(
            error => {
                console.log(`Failed to add entitlement configuration: ${error}`);
                this.handleError(error);
            }
        );
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    save() {
        if(this.isValid()) {
            this.feature.name = this.feature.name.trim();
            let featName = this.feature.name;
            this.loading = true;
            // this.feature.internalUserGroups = this.groups.split(",");
            if(this.otherFeatureToCreateMX != null){
                console.log("saveNewMXGWithNewFeatureAndOther");
                this.saveNewMXGWithNewFeatureAndOther();
            }else if(this.mxGroupToAdd != null){
                console.log("saveInExistingMX");
                this.saveInExistingMX();
            }else {
                this._airLockService.addInAppPurchase(this.feature, this.seasonId, this.branchId, this.parentId).then(result => {
                    this.loading = false;
                    this.onAddFeature.emit(null);
                    var successMessage:string = "Added the "+ ((this.isOrderRule)?"ordering rule ":"configuration ")+featName;
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:successMessage});
                }).catch(
                    error => {
                        console.log(`Failed to add configuration: ${error}`);
                        this.handleError(error);
                    }
                );
            }

        }else{
            console.log("namespace:"+this.feature.namespace);
            this.create("Configuration name is required.");
        }
    }
    openAsAddWithOtherFeatureToMX(parentId:string,otherFeature:Feature,isConfiguration:boolean = true,isOrderRule:boolean = false){
        this.isConfiguraion = isConfiguration;
        this.isOrderRule = isOrderRule;
        this.clean();
        if(!this.isOrderRule) {
            this.title = "Add Configuration To New Mutual Exclusion Group";
        }else{
            this.title = "Add Ordering Rule To New Mutual Exclusion Group";
        }
        this.otherFeatureToCreateMX=otherFeature;

        this.openWithoutClean(parentId);

    }
    clean(){
        this.initFeature();
        this.removeAll();
        if(!this.isOrderRule) {
            this.title = "Add Configuration";
        }else{
            this.title = "Add Ordering Rule";
        }
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;
        this.showNameSpaceInTitle=true;
        this.otherFeatureToCreateMX=null;
        this.subFeatureParentName=null;
        this.showNameSpaceInTitle=true;
    }
    selectItemToBeAfter(index:number){
        console.log("index:"+index);
        this.newItemInMXIndex=index;
    }
    openInExistingXM(mxGroupToAdd:Feature,branchId:string,isConfiguration:boolean = true,isOrderRule:boolean = false){
        console.log("openInExistingXM New");
        console.log(branchId);
        this.isConfiguraion = isConfiguration;
        this.isOrderRule = isOrderRule;
        this.clean();

        this.branchId=branchId;
        this.showNameSpaceInTitle = true;

        this.mxGroupToAdd = mxGroupToAdd;

        this.mxItemNames = ["-- Add As First --"];
        if(this.isConfiguraion) {
            this.title = "Add Configuration To Mutual Exclusion Group";
            for(let item of mxGroupToAdd.configurationRules){
                if (item.namespace) {
                    this.feature.namespace = item.namespace;
                }
                this.mxItemNames.push(item.name);
            }
        }else{
            if(this.isOrderRule){
                this.title = "Add Ordering rule To Mutual Exclusion Group";
                for(let item of mxGroupToAdd.orderingRules){
                    if (item.namespace) {
                        this.feature.namespace = item.namespace;
                    }
                    this.mxItemNames.push(item.name);
                }
            }
        }

        this.openWithoutClean(mxGroupToAdd.uniqueId, 'lg');
    }
    openAsAddSubFeatureWithParent(branchId: string, parentFeature:Feature, namespace:string , isConfiguraion:boolean = true , isOrderRule:boolean = false){
        this.openAsAddSubFeature(branchId,parentFeature.uniqueId,this._featureUtils.getFeatureDisplayName(parentFeature),namespace,isConfiguraion,isOrderRule,parentFeature.type);
    }
    openAsAddSubFeature(branchId: string, parentId:string,parentName:string, namespace:string , isConfiguraion:boolean = true , isOrderRule:boolean = false,parentType:string="ENTITLEMENT"){
        console.log("openAsAddSubFeature New");
        console.log(branchId);
        this.isConfiguraion = isConfiguraion;

        this.isOrderRule = isOrderRule;
        this.clean();
        this.parentType = parentType;

        var newNamespace = "";

        if(namespace == null || parentName == null){
            newNamespace = "";
            this.showNameSpaceInTitle = false;
        }else {
            newNamespace = namespace + parentName;
            newNamespace = newNamespace.replace(/\s/g, '');
            newNamespace = newNamespace.replace(/\W/g, '');
            this.showNameSpaceInTitle = true;
        }
        this.feature.namespace = newNamespace;
        this.branchId = branchId;

        console.log("isConfiguraion,isOrderRule");
        console.log(this.isConfiguraion);
        console.log(this.isOrderRule);
        this.subFeatureParentName = parentName;
        this.openWithoutClean(parentId);
    }
    open(parentId:string){
        this.clean();
        this.title = "Add Configuration";
        this.openWithoutClean(parentId);
    }
    openWithoutClean(parentId:string, size='md'){
        this.parentId=parentId;
        var $exampleMulti =  $$(".js_example").select2(
            {
                tags: true,
                tokenSeparators: [',', ' ']
            }
        );


        $$('.js_example').on(
            'change',
            (e) => {
                if(this.feature != null){
                    this.feature.internalUserGroups = jQuery(e.target).val();
                    console.log("change this.feature.internalUserGroups");
                    console.log(this.feature.internalUserGroups);
                }

            }
        );
        if(this.feature != null){
            $exampleMulti.val(this.feature.internalUserGroups).trigger("change");
        }

        // console.log(this.elementRef.nativeElement.querySelector("editModal"));
        // this.elementRef.nativeElement.querySelector("editModal").open();
        // element(by.tagName('editModal'));
        // $$("#editModal").open();
        if(this.modal != null) {
            this.modal.open(size);
        }
    }

    close(){

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
        let objectName;
        let titleMsg;
        if(this.isConfiguraion){
            objectName = "Configuration";
            titleMsg = "Configuration creation failed";
            // this.feature.type="CONFIGURATION_RULE";
        }else{
            objectName = "Add Ordering Rule";
            titleMsg = "Ordering Rule creation failed";
            // this.feature.type="ORDERING_RULE";
        }
        let errorMessage = this._airLockService.parseErrorMessage(error,"Failed to add "+objectName+". Please try again.");//error._body || "Failed to add feature. Please try again.";
        // var errorMessage = error._body || "Failed to add Configuration. Please try again.";
        // console.log("handleError in addConfigurationModal:"+errorMessage);
        // console.log(error);
        // if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
        //     errorMessage = errorMessage.substring(1,errorMessage.length -1);
        // }
        this.create(errorMessage,titleMsg);
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

    create(message:string,title:string = "Configuration creation failed") {
        this.toastrService.error(message, title, {
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

