import {Component, Injectable, ViewEncapsulation, ViewChild, Input, AfterViewInit, NgZone} from "@angular/core";
import {BaThemeSpinner} from "../../../theme/services/baThemeSpinner/baThemeSpinner.service";
import {AirlockService} from "../../../services/airlock.service";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import {Feature} from "../../../model/feature";
import {Rule} from "../../../model/rule";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {Season} from "../../../model/season";
import * as $$ from 'jquery';
import 'select2';
import {} from "@angular/core";
import {Inject} from "@angular/core";
import {ElementRef} from "@angular/core";
import {UserGroups} from "../../../model/user-groups";
import {FeatureUtilsService,FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {AceEditor} from "../aceEditor/aceEditor";
//import {Markdown} from "../aceEditor/markdown";
import {HirarchyTree} from "../hirarchyTree/hirarchyTree.component";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AirlockTooltip} from "../airlockTooltip/airlockTooltip.component";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {ShowMessageModal} from "../showMessageModal/showMessageModal.component";
import {ToastrService} from "ngx-toastr";
import {Utility} from "../../../model/utility";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {AceExpandDialogType} from "../../../app.module";


export function getTabsetConfig(): TabsetConfig {
    return Object.assign(new TabsetConfig(), {type: 'pills'});
}

@Component({
    selector: 'edit-utility-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editUtilityModal.scss'),require('select2/dist/css/select2.css')],
    // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,DROPDOWN_DIRECTIVES,TAB_DIRECTIVES,ACCORDION_DIRECTIVES,
    //         BUTTON_DIRECTIVES, ButtonRadioDirective, TOOLTIP_DIRECTIVES, AceEditor, /*Markdown,*/ HirarchyTree,
    //         SimpleNotificationsComponent, AirlockTooltip, AceModal],

    template: require('./editUtilityModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class EditUtilityModal{
    @ViewChild('editUtilityModal')
    modal: ModalComponent;
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog : AceModal;
    @ViewChild('plainVersion') plainVersion: ElementRef;
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
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
    loading: boolean = false;
    private elementRef:ElementRef;
    private utilities:Utility[];
    private isAddNewMode:boolean = false;
    private type:string = "";
    loaded = false;
    isOpen:boolean = false;
    selectedIndex:number = 0;
    selectedUtility:Utility = null;
    curUtilityString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    isDirty:boolean = false;
    title: string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "180px";
    private season:Season;


    constructor(private _spinner:BaThemeSpinner, private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                private authorizationService:AuthorizationService, private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal, private toastrService: ToastrService) {
        this.elementRef = elementRef;
    }
    createNewUtil(){
        this.isAddNewMode = true;
        this.selectedUtility = new Utility();
        this.selectedUtility.seasonId = this.season.uniqueId;
        this.selectedUtility.type = this.type;


        this.curUtilityString = "//Enter new utility code and click Save";
        this.selectedUtility.utility=this.curUtilityString;
        this.selectedUtility.stage  = "DEVELOPMENT";
        this.utilities.push(this.selectedUtility);
        this.selectedIndex = this.utilities.length -1;
        this.selectedUtility.name = "<New Utility>"
    }
    askIfToSaveDirty(newIndex:number){
        let message = "Do you want to save '" + this.getUtilName(this.selectedIndex) + "'?";
        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this.selectedUtility.utility = this.curUtilityString;
                console.log(this.utilities);
                this.saveCurrentUtil(newIndex,this.utilities[this.utilities.length -1],false);
            });
        this.verifyActionModal.actionDiscard$.subscribe(
            astronaut => {
                console.log(this.utilities);
                this.moveToUtility(newIndex);
            });
        this.verifyActionModal.actionCanceld$.subscribe(
            astronaut => {
                console.log(this.utilities);
                // this.moveToUtility(newIndex);
            });
        console.log("open verifyActionModal for change changed util");
        this.verifyActionModal.open(message,null, VeryfyDialogType.STRING_TYPE, false," ",true);
    }
    reloadData(newSelectedIndex:number,newUtil:Utility = null){
        this.loading=true;
        this._airLockService.getUtilities(this.season.uniqueId)
            .then(response  => {
                console.log("utils");
                console.log(response);
                this.isDirty = false;
                if(newUtil != null){
                    response.push(newUtil);
                }
                this.loadData(response,newSelectedIndex);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                console.log(error);
                this._airLockService.notifyDataChanged("error-notification",`Failed to load utilities: ${error}`);
            });
    }
    deleteUtility(){
        this.loading = true;
        this._airLockService.deleteUtil(this.selectedUtility.uniqueId).then(result => {
            this.loading = false;
            // this.onEditFeature.emit(null);
            // this.close()
            this.reloadData(0);
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:this.getString("edit_utils_message_succuss_delete")});
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    changeUtilityStage(){
        if(this.selectedUtility.stage == "PRODUCTION"){
            this.selectedUtility.stage = "DEVELOPMENT";
        }else{
            this.selectedUtility.stage = "PRODUCTION";
        }
        this.loading = true;
        this._airLockService.updateUtil(this.selectedUtility).then(
            res => {
                this.loading = false;
                this.reloadData(this.selectedIndex);
                var message:string = ""
                if(this.selectedUtility.stage == "PRODUCTION"){
                    message = this.getString("edit_utils_message_succuss_move_to_prod");
                }else{
                    message = this.getString("edit_utils_message_succuss_move_to_dev");

                }
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:message});
                // this.selectedUtility.lastModified = res.lastmodified;
            }
        ).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }
    initAfterClose(){
        this.removeAll();
    }

    canAddNewUtil(){
        return !this._airLockService.isViewer() && !this.isAddNewMode;
    }
    canSave(){
        if(this.selectedUtility == null && this.type != "STREAMS_UTILITY"){
            return false;
        }
        if(this.selectedUtility != null && this.selectedUtility.stage == "PRODUCTION"){
            return !(this._airLockService.isViewer() || this._airLockService.isEditor());
        }
        return !this._airLockService.isViewer();
    }

    canChangeStage() {
        return !(this._airLockService.isViewer() || this._airLockService.isEditor());
    }
    canDelete(){
        if(this.selectedUtility.stage == "PRODUCTION"){
            return false;
        }
        return !this._airLockService.isViewer();
    }

    saveCurrentUtil(moveToIndex:number,addNewUtil:Utility,closeAfter:boolean ){
        this._airLockService.updateUtil(this.selectedUtility).then(result => {
            this.loading = false;
            if(!closeAfter) {
                this.reloadData(moveToIndex, addNewUtil);
            }
            this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:this.getString("edit_utils_message_succuss_updated")});
            if(closeAfter){
                this.close();
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }
    save() {
        if((this.type != "STREAMS_UTILITY" && this.selectedUtility == null) || this.curUtilityString == null || this.curUtilityString.length == 0){
            this.showMessageModal.open("Error","Save Failed - No utility code was entered.");
            return;
        }

        this.loading=true;
        try {
            this.selectedUtility.utility = this.curUtilityString;
        }catch(e){
            this.create("Error","Utility is not valid");
            this.loading=false;
            return
        }
        if(!this.isAddNewMode) {
            this.saveCurrentUtil(this.selectedIndex,null,true);
        }else{
            this._airLockService.createUtil(this.selectedUtility).then(result => {
                this.loading = false;
                this.isAddNewMode=false;
                // this.reloadData(-1);
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:this.getString("edit_utils_message_succuss_added")});
                this.close();
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            });
        }
    }

    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            var fnBody;
            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    };

    handleError(error: any,title:string = "Save Failed") {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = this._airLockService.parseErrorMessage(error,"Request failed, try again later.");
        console.log(error);
        this.showMessageModal.open(title,errorMessage);
    }
    close(){
        this.isOpen = false;
        this.curUtilityString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }
    validate(){

    }
    changeStage() {
        let message = "";
        if (this.selectedUtility.stage=='PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this utility \''+this.getUtilName(this.selectedIndex)+'\' to development?';
            message += `\n This operation can impact your app in production.`;
        } else {
            message = 'Are you sure you want to release this utility \''+this.getUtilName(this.selectedIndex)+'\' to production?';
            message += `\n This operation can impact your app in production.`;
        }

        this.verifyActionModal.actionApproved$.subscribe(
            astronaut => {
                this.changeUtilityStage();
            });
        console.log("open verifyActionModal");
        this.verifyActionModal.open(message,null, VeryfyDialogType.STRING_TYPE, false," ");

    }
    openAceEditorOutputConfigurationExpand(){
        var expandDialogTitle = this.title;
        this.aceModalContainerDialog.showAceModal(this.curUtilityString, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, false);
    }
    showRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/utilities');
    }
    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }
    moveToUtility(index:number){
        this.isDirty =false;
        this.selectedIndex = index;
        this.selectedUtility = new Utility(this.utilities[this.selectedIndex]);
        this.selectedUtility.name = this.getUtilName(this.selectedIndex);
        try {
            this.curUtilityString = this.selectedUtility.utility;
        }catch (e){
            console.log(e);
        }
    }

    selectUtility(index:number){
        var isChanged = this.isDirty ;
        console.log(isChanged);
        console.log(this.curUtilityString);
        //update new util text
        if(this.isAddNewMode && this.selectedIndex == this.utilities.length -1 && isChanged){
            this.utilities[this.selectedIndex].utility = this.curUtilityString;
            this.moveToUtility(index);
        }else{
            if(isChanged){
                this.askIfToSaveDirty(index);
            }else{
                this.moveToUtility(index);
            }
        }

    }
    markDirtyName(){
        this.isDirty = true;
    }
    loadData(utilities:Utility[],newSelectedIndex:number){
        //this.isAddNewMode = false;

        this.utilities = (utilities == null)?[]:utilities.filter( util => util.type == this.type);
        if(newSelectedIndex != -1) {
            this.selectedIndex = newSelectedIndex;
        }else{
            this.selectedIndex = this.utilities.length - 1;
        }
        if(this.utilities.length >0){
            this.selectedUtility = this.utilities[this.selectedIndex];
            this.selectedUtility.name = this.getUtilName(this.selectedIndex);
            try {
                this.curUtilityString = this.selectedUtility.utility;
            }catch (e){
                console.log(e);
            }
        }
        if(this.type == "STREAMS_UTILITY" && this.utilities.length == 0){
            console.log("new STREAMS_UTILITY");
            this.selectedUtility = new Utility();
            this.selectedUtility.name = "StreamsUtils";
            this.selectedUtility.type = "STREAMS_UTILITY";
            this.selectedUtility.seasonId = this.season.uniqueId;
            this.selectedUtility.stage = "DEVELOPMENT";
            this.isAddNewMode=true;
            try {
                this.curUtilityString = this.selectedUtility.utility;
            }catch (e){
                console.log(e);
            }
        }
    }

    getUtilName(index:number){
        if(this.utilities[index].name){
            return this.utilities[index].name;
        }else{
            return "Utility " + (index + 1);
        }
    }
    open(utilities:Utility[],season:Season,type:string) {
        this.loading = false;
        this.title = this.getString("edit_utils_title");
        this.isOpen = true;
        this.season = season;
        this.type=type;
        this.isDirty=false;
        this.isAddNewMode=false;
        //filter utils based on type since it returns all
        this.loadData(utilities,0);
        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.modal.open('lg');
            });

        }
    }

    isInNewUtil():boolean{
        return (this.isAddNewMode && this.selectedIndex == this.utilities.length -1);
    }
    curUtilityUpdatedExpanded(event) {
        this.curUtilityString = event;
        this.isDirty = true;

    }
    curUtilityUpdated(event) {
        console.log("update curUtilityUpdated");
        console.log(event);
        let isChanged = event.diff;
        this.curUtilityString = event.value;
        if(isChanged){
            this.isDirty = true;
        }
    }
    create(title:string,message:string) {
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
}



