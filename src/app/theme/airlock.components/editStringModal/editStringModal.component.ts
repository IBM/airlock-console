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
import {StringToTranslate} from "../../../model/stringToTranslate";


@Component({
  selector: 'edit-string-modal',
  providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
  styles: [require('./editStringModal.scss')],
  // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,BaCard,BaCheckbox,DROPDOWN_DIRECTIVES, SimpleNotificationsComponent, POPOVER_DIRECTIVES, AirlockTooltip],

  template: require('./editStringModal.html'),
  // template: /*require('./sample.template.html')*/'<div> </div>'
})
/*export class FeaturesPage {
    constructor() {

    }
}*/
export class EditStringModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    title:string = "Edit String";
    subFeatureParentName:string = null;
    loading: boolean = false;
    feature:Feature;
    valid:boolean;
    otherFeatureToCreateMX:Feature=null;
    mxGroupToAdd : Feature = null;
    mxItemNames:Array<string>=[];
    groups:string = "";
    @Output() onEditString= new EventEmitter<any>();
    newItemInMXIndex:number=0;

    private key:string = "";
    private value:string = "";
    private stage:string = "DEVELOPMENT";
    private fallback:string = "";
    private translationInstruction:string = "";
    private objToSend:any = null;
    private maxStringSize:number;
     constructor(private _airLockService:AirlockService,
         private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this.loading = true;
        this.initFeature();
    }

    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue.replace(/\s/g, '') =="") {
            return true;
        }
        else
            return false;
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initFeature(){
        this.key ="";
        this.value="";
        this.stage="DEVELOPMENT";
        this.fallback="";
        this.translationInstruction="";
        this.loading = false;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    isValid(){
        if((this.objToSend.key  == null || this.objToSend.key.length == 0 || this.objToSend.key.replace(/\s/g, '') == "")
            || (this.objToSend.value == null || this.objToSend.value.length == 0 || this.objToSend.value.replace(/\s/g, '') == "")){
            this.create("String ID and String Value are required.");
            return false;
        }
        if (this.objToSend.maxStringSize !== undefined && this.objToSend.maxStringSize !== null) {
            if (!this.isPositiveInteger(this.objToSend.maxStringSize)) {
                this.create("Max translation length must be positive integer.");
                return false;
            }
        }
        return true;

    }

    isPositiveInteger(num) {
        return num>0 && Number.isInteger(num);
    }

    save() {
        if(this.isValid()) {
            this.loading = true;
                this._airLockService.updateStringToTranslation( this.objToSend.uniqueId,this.objToSend).then(() => {
                    this.loading = false;
                    this.onEditString.emit(null);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Edited the string "+this.key});
                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );
        }
    }

    clean(){
        this.initFeature();
        this.removeAll();
    }
    selectItemToBeAfter(index:number){
        console.log("index:"+index);
        this.newItemInMXIndex=index;
    }

    open(str:StringToTranslate){
        this.clean();
        this.valid = true;
        this.loading=true;
        this._airLockService.getStringFullInformation(str.uniqueId).then(res => {
            this.loading=false;
            this.objToSend = res;
            if(this.modal != null) {
                this.modal.open();
            }
        }).catch(error => {

        });

    }


    close(){
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in addFeatureModal:"+errorMessage);
        console.log(error);
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
        this.toastrService.error(message, "String edit failed", {
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

