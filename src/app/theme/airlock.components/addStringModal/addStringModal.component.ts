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
  selector: 'add-string-modal',
  providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
  styles: [require('./addStringModal.scss')],
  // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,BaCard,BaCheckbox,DROPDOWN_DIRECTIVES, SimpleNotificationsComponent, POPOVER_DIRECTIVES, AirlockTooltip],

  template: require('./addStringModal.html'),
  // template: /*require('./sample.template.html')*/'<div> </div>'
})
/*export class FeaturesPage {
    constructor() {

    }
}*/
export class AddStringModal {
    @ViewChild('myModal')
    modal: ModalComponent;
    title:string = "Add String";
    subFeatureParentName:string = null;
    loading: boolean = false;
    feature:Feature;
    valid:boolean;
    otherFeatureToCreateMX:Feature=null;
    mxGroupToAdd : Feature = null;
    mxItemNames:Array<string>=[];
    groups:string = "";
    @Input() seasonId: string;
    @Output() onAddString= new EventEmitter<any>();
    newItemInMXIndex:number=0;

    private key:string = "";
    private value:string = "";
    private stage:string = "DEVELOPMENT";
    private fallback:string = "";
    private translationInstruction:string = "";
    private maxStringSize:number;
     constructor(private _airLockService:AirlockService,
         private _notificationService: NotificationsService, private _stringsSrevice: StringsService, private toastrService: ToastrService) {
        this.loading = true;
        this.initFeature();
    }

    isViewer(){
        return this._airLockService.isViewer();
    }
    initFeature(){
        this.key ="";
        this.value="";
        this.stage="DEVELOPMENT";
        this.fallback="";
        this.loading = false;
        this.translationInstruction="";
        this.maxStringSize = null;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue.replace(/\s/g, '') =="") {
            return true;
        }
        else
            return false;
    }

    isPositiveInteger(num) {
        return num>0 && Number.isInteger(num);
    }

    isValid() {
        if ((this.key == null || this.key.length == 0 || this.key.replace(/\s/g, '') == "") || (this.value == null || this.value.length == 0 || this.value.replace(/\s/g, '') == "")
            || (this.translationInstruction == null || this.translationInstruction.length == 0 || this.translationInstruction.replace(/\s/g, '') == "")) {
            this.create("String ID, String Value and Instructions are required.");
            return false;
        }
        if (this.maxStringSize !== undefined && this.maxStringSize !== null) {
            if (!this.isPositiveInteger(this.maxStringSize)) {
                this.create("Max translation length must be positive integer.");
                return false;
            }
        }
        return true;
    }

    save() {
        if(this.isValid()) {
            this.loading = true;
            var obj = {"key":this.key.trim(),"value":this.value.trim(),"stage":this.stage,"internationalFallback":this.fallback,"translationInstruction":this.translationInstruction,"creator":this._airLockService.getUserName()};
            if(this.maxStringSize !== undefined && this.maxStringSize !== null){
                obj["maxStringSize"]=this.maxStringSize;
            }
                this._airLockService.addStringToTranslation( this.seasonId,obj).then(() => {
                    this.loading = false;
                    this.onAddString.emit(null);
                    this.close();
                    this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Added the string "+this.key});
                }).catch(
                    error => {
                        console.log(`Failed to add string: ${error}`);
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

    open(){
        this.clean();
        this.valid = true;
        if(this.modal != null) {
            this.modal.open();
        }
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
        this.toastrService.error(message, "String creation failed", {
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

