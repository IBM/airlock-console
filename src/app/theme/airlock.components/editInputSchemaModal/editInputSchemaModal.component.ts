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
import {AceExpandDialogType} from "../../../app.module";

export function getTabsetConfig(): TabsetConfig {
    return Object.assign(new TabsetConfig(), {type: 'pills'});
}

@Component({
    selector: 'edit-input-schema-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editInputSchemaModal.scss'),require('select2/dist/css/select2.css')],
    // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,DROPDOWN_DIRECTIVES,TAB_DIRECTIVES,ACCORDION_DIRECTIVES,
    //         BUTTON_DIRECTIVES, ButtonRadioDirective, TOOLTIP_DIRECTIVES, AceEditor, /*Markdown,*/ HirarchyTree,
    //         SimpleNotificationsComponent, AirlockTooltip, AceModal],

    template: require('./editInputSchemaModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class EditInputSchemaModal{
    @ViewChild('editInputSchemaModal')
    modal: ModalComponent;
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog : AceModal;
    @ViewChild('plainVersion') plainVersion: ElementRef;
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
    private inputSchema:any;
    loaded = false;
    isOpen:boolean = false;
    inputSchemaString :string;
    isOnlyDisplayMode:boolean = false;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "330px";
    private season:Season;


    constructor(private _spinner:BaThemeSpinner, private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                private authorizationService:AuthorizationService, private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal, private toastrService: ToastrService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }
    initAfterClose(){
        this.removeAll();
    }

    save() {


                // let message = 'This feature will not be visible to users because no user groups are specified. Are you sure want to continue?';
                // this.modalAlert.confirm()
                //     .title(message)
                //     .open()
                //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                //     .then(result => {
                        this._save();
                    // }) // if were here ok was clicked.
                    // .catch(err => {
                    //     this.loading = false;
                    //     this.handleError(err);
                    // });
    }

    _save() {
        this.loading=true;
        try {
            this.inputSchema.inputSchema = JSON.parse(this.inputSchemaString);
        }catch(e){
            this.create("Error","Schema is not a valid JSON");
            this.loading=false;
            return
        }
        //updateInputSchema
            this._airLockService.updateInputSchema(this.inputSchema).then(result => {
                this.loading = false;
                // this.onEditFeature.emit(null);
                this.close()
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            });
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

    beautifyString(str: string) {
        var toRet = "";
        var tabCount = 0;
        var inStringContext = false;
        var latestStringChar = null;
        for (var i = 0, len = str.length; i < len; i++) {
            let curr = str[i];
            if (inStringContext) {
                // do not add tabs and new lines if inside a string
                toRet += curr;
                if (curr==latestStringChar) {
                    inStringContext = false;
                    latestStringChar = null;
                }
            } else if (curr=="\"" /*|| curr=="\'"*/) {
                toRet += curr;
                inStringContext = true;
                latestStringChar=curr;
            }
            else if(curr=="{") {
                toRet +="{";
                if(i +1 < len && str[i +1] != "\n"){
                    toRet += "\n";
                }
                tabCount++;
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if(curr==",") {
                toRet +=",";
                if(i +1 < len && str[i +1] != "\n"){
                    toRet += "\n";
                }
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if (curr=="}") {
                tabCount--;
                if(i -1  > 0 && str[i  - 1] != "\n"){
                    toRet += "\n";
                }
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
                toRet += "}"
            } else {
                toRet += curr;
            }
        }
        return toRet;
    }
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
        this.inputSchemaString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }
    validate(){
        this.loading = true;
        // this.inputSchema.inputSchema = JSON.parse(this.inputSchemaString);
        //updateInputSchema
        try {
            let jsonObj = JSON.parse(this.inputSchemaString);
        }catch(e){
            this.create("Error","Schema is not a valid JSON");
            this.loading=false;
            return
        }
        this._airLockService.validateInputSchema(this.season.uniqueId,this.inputSchemaString).then(result => {
            this.loading = false;
            var isError:boolean = false;
            if(result.brokenConfigurations != null && result.brokenConfigurations.length > 0){
                isError = true;
            }
            if(result.brokenRules != null && result.brokenRules.length > 0){
                isError = true;
            }
            if(isError){
                var errorBody:string = "";
                try{
                    errorBody = JSON.stringify(result);
                }catch (e){

                }
                this.showMessageModal.open("Validation Error",errorBody);
            }else {
                // this._notificationService.success("Validation", "The schema is valid");
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Valid Schema"});
            }
            //     , {
            //     timeOut: 4000,
            //     showProgressBar: true
            // });
            // this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Valid Schema"});
            // this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error,"Validation Failed");
        });
    }
    openAceEditorOutputConfigurationExpand(){
        var expandDialogTitle = this.title;
        this.aceModalContainerDialog.showAceModal(this.inputSchemaString, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }
    showRuleHelp() {
        window.open('http://jsonviewer.stack.hu/');
    }
    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }
    open(inputSchema:any,season:Season, editMode: boolean) {
        this.loading = false;
        this.title = this.getString("edit_input_schema_title");
        this.isOpen = true;
        this.season = season;
        this.isOnlyDisplayMode = !editMode;
        this.inputSchema = inputSchema;
        try {
            this.inputSchemaString = JSON.stringify(inputSchema.inputSchema);
            this.inputSchemaString = this.beautifyString(this.inputSchemaString);
        }catch (e){
            console.log(e);
        }
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

    inputSchemaUpdated(event) {
        console.log("update inputSchemaUpdated");
        this.inputSchemaString = event;
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



