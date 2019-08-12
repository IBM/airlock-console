import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Feature} from "../../../model/feature";
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
  selector: 'add-feature-modal',
  providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
  styles: [require('./addFeatureModal.scss')],
  // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,BaCard,BaCheckbox,DROPDOWN_DIRECTIVES, SimpleNotificationsComponent, POPOVER_DIRECTIVES, AirlockTooltip],
  template: require('./addFeatureModal.html'),
  encapsulation: ViewEncapsulation.None

    // template: /*require('./sample.template.html')*/'<div> </div>'
})
/*export class FeaturesPage {
    constructor() {

    }
}*/
export class AddFeatureModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    title:string = "Add Feature";
    subFeatureParentName:string = null;
    loading: boolean = false;
    feature:Feature;
    @Input() valid:boolean;
    @Input() staticMode:boolean = false;
    otherFeatureToCreateMX:Feature=null;
    mxGroupToAdd : Feature = null;
    mxItemNames:Array<string>=[];
    groups:string = "";
    @Input() seasonId: string;
    @Input() branchId: string;
    @Input() rootId: string;
    @Input()
    possibleGroupsList :Array<any> = [];
    @Input()
    parentId:string = "";
    @Output() onAddFeature= new EventEmitter<any>();
    newItemInMXIndex:number=0;

     constructor(private _airLockService:AirlockService,private _featureUtils:FeatureUtilsService,
         private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                 private toastrService: ToastrService) {
        this.loading = true;
        this.initFeature();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initFeature(){
        this.feature = new Feature();
        this.feature.name = "";
        this.feature.namespace="";
        this.feature.stage="DEVELOPMENT";
        this.feature.type="FEATURE";
        this.feature.rule= new Rule();
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
        this.feature.orderingRules=[];
        this.groups = "";
        this.loading = false;
    }
    isShownADDButton(){
        return (!this.isViewer());
    }
    isValid(){
        if(this.feature.name  == null || this.feature.name.length == 0){
            return false;
        }
        return !(this.feature.namespace == null || this.feature.namespace.length == 0);


    }
    saveNewMXGWithNewFeatureAndOther(){
        this.loading = true;
        var mxGroup:Feature = new Feature();
        mxGroup.seasonId=this.seasonId;
        mxGroup.type="MUTUAL_EXCLUSION_GROUP";
        console.log(this.feature);
        var newFeature:Feature = Feature.clone(this.feature);
        console.log(newFeature);
        console.log("before add MX");
        var otherFeature:Feature = this.otherFeatureToCreateMX;
        //clean for next time
        this.otherFeatureToCreateMX = null;
        //Add MX,New Feature and then change MX feature to be other and the new features
        this._airLockService.addFeature(mxGroup, this.seasonId,this.branchId, this.parentId).then(result => {
            var fetchedMX = (result as Feature);
            console.log("after add MX");
            console.log(fetchedMX);
            var mxId:string = fetchedMX.uniqueId;


            this._airLockService.addFeature(newFeature, this.seasonId,this.branchId, mxId).then(result => {
                console.log("after add new feature");
                var newFetchedFeature:Feature = (result as Feature);
                console.log("newFeature");

                this._airLockService.getFeature(mxId, this.branchId).then(result => {
                    fetchedMX = (result as Feature);
                    this._airLockService.getFeature(newFetchedFeature.uniqueId, this.branchId).then(result => {
                        newFetchedFeature = (result as Feature);
                        fetchedMX.features = [otherFeature,newFetchedFeature];
                        this._airLockService.updateFeature(fetchedMX, this.branchId).then(() => {
                            this.loading = false;
                            this.onAddFeature.emit(null);
                            this.close()
                        }).catch(
                            error => {
                                console.log(`Failed to add feature: ${error}`);
                                this.handleError(error);
                            }
                        );
                    }).catch(
                        error => {
                            console.log(`Failed to add feature: ${error}`);
                            this.handleError(error);
                        }
                    );

                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );


            }).catch(
                error => {
                    console.log(`Failed to add feature: ${error}`);
                    this.handleError(error);
                }
            );
        }).catch(
            error => {
                console.log(`Failed to add feature: ${error}`);
                this.handleError(error);
            }
        );
    }
    saveInExistingMX(){
        this.loading = true;
        var newFeature:Feature = Feature.clone(this.feature);
        var newItemPlace:number = this.newItemInMXIndex;
        var localmxGroupToAdd:Feature = this.mxGroupToAdd;
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;

        console.log("new place:"+newItemPlace);
        this._airLockService.addFeature(newFeature, this.seasonId, this.branchId, this.parentId).then(result => {
            console.log("after add new feature");
            var newFetchedFeature: Feature = (result as Feature);
            this._airLockService.getFeature(localmxGroupToAdd.uniqueId, this.branchId).then(result => {
                var fetchedMX: Feature = (result as Feature);
                this._airLockService.getFeature(newFetchedFeature.uniqueId, this.branchId).then(result => {
                    newFetchedFeature = result;
                    fetchedMX.features.splice(newItemPlace, 0, newFetchedFeature);
                    fetchedMX.features.splice(fetchedMX.features.length - 1, 1);
                    console.log(fetchedMX);
                    this._airLockService.updateFeature(fetchedMX, this.branchId).then(() => {
                        this.loading = false;
                        this.onAddFeature.emit(null);
                        this.close()
                    }).catch(
                        error => {
                            console.log(`Failed to add feature: ${error}`);
                            this.handleError(error);
                        }
                    );
                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );
            }).catch(
                error => {
                    console.log(`Failed to add feature: ${error}`);
                    this.handleError(error);
                }
            );
        }).catch(
            error => {
                console.log(`Failed to add feature: ${error}`);
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
                this.saveNewMXGWithNewFeatureAndOther();
            }else if(this.mxGroupToAdd != null){
                this.saveInExistingMX();
            }else {
                this._airLockService.addFeature(this.feature, this.seasonId,this.branchId, this.parentId).then(() => {
                    this.loading = false;
                    this.onAddFeature.emit(null);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Added the feature "+featName});
                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );
            }

        }else{
            this.create("Feature name and namespace are required.");
        }
    }
    openAsAddWithOtherFeatureToMX(parentId:string,otherFeature:Feature){
        this.clean();
        this.title = "Add Feature To New Mutual Exclusion Group";
        this.otherFeatureToCreateMX=otherFeature;
        this.openWithoutClean(parentId);
    }
    clean(){
        this.initFeature();
        this.removeAll();
        this.title = "Add Feature";
        this.mxGroupToAdd=null;
        this.newItemInMXIndex=0;
        this.otherFeatureToCreateMX=null;
        this.subFeatureParentName=null;
    }
    selectItemToBeAfter(index:number){
        console.log("index:"+index);
        this.newItemInMXIndex=index;
    }
    openInExistingXM(mxGroupToAdd:Feature){
        this.clean();
        this.title = "Add Feature To Mutual Exclusion  Group";
        this.mxGroupToAdd = mxGroupToAdd;
        this.mxItemNames = ["-- Add As First --"];
        for(let item of mxGroupToAdd.features){
            if (item.type == 'MUTUAL_EXCLUSION_GROUP') {
                this.mxItemNames.push(this._featureUtils.getMXDisplayName(item));
            } else {
                this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
        this.openWithoutClean(mxGroupToAdd.uniqueId, 'lg');
    }
    openAsAddSubFeature(parentId:string,parentName:string, parentNamespace:string){
        this.clean();
        this.title = "Add Subfeature";
        this.subFeatureParentName = parentName;
        this.feature.namespace = parentNamespace;
        this.openWithoutClean(parentId);
    }
    open(parentId:string){
        this.clean();
        this.title = "Add Feature";
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
        console.log("internalGroups");
        console.log(this.feature.internalUserGroups);

        $$('.js_example').on(
            'change',
            (e) => {
                this.feature.internalUserGroups = jQuery(e.target).val();
                console.log("change this.feature.internalUserGroups");
                console.log(this.feature.internalUserGroups);
                console.log('parent feature:', this.parentId);
            }
        );
        $exampleMulti.val(this.feature.internalUserGroups).trigger("change");
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
        console.log("handleError error Add FEATURE");
        this.loading = false;
        
        let errorMessage = this._airLockService.parseErrorMessage(error,"Failed to add feature. Please try again.")//error._body || "Failed to add feature. Please try again.";
        console.log("handleError in addFeatureModal:"+errorMessage);
        // console.log(error);
        // if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
        //     errorMessage = errorMessage.substring(1,errorMessage.length -1);
        // }
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
        this.toastrService.error(message, "Feature creation failed", {
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

