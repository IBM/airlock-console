import {
    Component,
    Injectable,
    ViewEncapsulation,
    ViewChild,
    Input,
    AfterViewInit,
    NgZone,
    Output,
    EventEmitter,
    Inject,
    ElementRef,
    ChangeDetectorRef
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Feature} from "../../../model/feature";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import * as $$ from "jquery";
import "select2";
import {FeatureUtilsService, FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {NotificationCell} from "../notificationCell/notificationCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {AirlockNotification} from "../../../model/airlockNotification";
import {isNumeric} from "rxjs/util/isNumeric";
import {AceExpandDialogType} from "../../../app.module";

@Component({
    selector: 'edit-notification-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editNotificationModal.scss'),require('select2/dist/css/select2.css'),require('../customAirlockHeader/ng2-select.scss'),require('../customAirlockHeader/glyphicons.scss')],
    template: require('./editNotificationModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditNotificationModal{
    @ViewChild('editModal') modal: ModalComponent;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog : AceModal;
    loading: boolean = false;
    @Input() notification: AirlockNotification;
    schema;
    @Output() onEditNotification= new EventEmitter<any>();
    @Input() verifyActionModal: VerifyActionModal;
    @Input() possibleGroupsList :Array<any> = [];
    private elementRef:ElementRef;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private ruleTabActive:boolean = false;
    private configTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    lastModificationDate:Date;
    notificationCell: NotificationCell = null;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode:boolean = false;
    ruleInputSchemaSample: string;
    cancellationRuleInputSchemaSample;
    ruleUtilitiesInfo:string;
    schemaUtilitiesInfo:string;
    schemaInputSchemaSample:string;
    totalCountQuota : number;
    aceEditorRuleHeight: string = "125px";
    aceEditorConfigurationHeight: string = "136px";
    configurationStr:string;
    private sub:any = null;
    minIntervalButtonText:string;
    intervalValues:string[] = ["total","every hour","every day","every week","every month"];
    isChecked:boolean;

    constructor( private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                 private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal,
                 private toastrService: ToastrService) {
        this.elementRef = elementRef;

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }

    initAfterClose(){
        try{
            if(this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        }catch (e){
            console.log(e);
        }
        this.notification = null;
        this.generalTabActive = true;
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.isShowHirarchy  = false;
        this.removeAll();
    }

    isValid(){
        if(this.notification.name  == null || this.notification.name.length == 0){
            return "name is required";
        }
        if(this.notification.minAppVersion) {
            this.notification.minAppVersion = this.notification.minAppVersion.trim();
        }
        if(this.notification.stage=="PRODUCTION" && !this.notification.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }
        return "";
    }



    validate(){

    }
    save() {
        var validError:string = this.isValid();
        if(validError.length == 0) {
            if (this.notification.stage=='DEVELOPMENT' && (this.notification.internalUserGroups==null || this.notification.internalUserGroups.length <=0)) {
                let message = 'This notification will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalAlert.confirm()
                    .title(message)
                    .open()
                    .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                    .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                    .then(() => {
                        this._save();
                    }) // if were here ok was clicked.
                    .catch(err => {
                        this.loading = false;
                        this.handleError(err);
                    });


            } else {
                if(this.notification.stage == 'PRODUCTION'){
                    this.sub = this.verifyActionModal.actionApproved$.subscribe(
                        astronaut => {

                            this._save();

                        });
                    console.log("open verifyActionModal");
                    this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_notification"),this.notification, VeryfyDialogType.NOTIFICATION_TYPE);
                }else {
                    this._save();
                }
            }
        }else{
            this.create(validError);
        }
    }

    selectIntervalValue(index){
        console.log('Selected interval value is: ', index);
        this.minIntervalButtonText = this.intervalValues[index];
        this.notification.minInterval = this.getIntervalByIndex(index);
    }

    getIntervalByIndex(index:number){
        if(index == 0)
            return -1;
        if(index == 1)
            return 60; //hour
        if(index == 2)
            return 1440; //day
        if(index == 3)
            return 10080; //week
        if(index == 4)
            return 43200; //month = 30 days
        return -1
    }

    getIntervalFromMinutes(min:number){
        if(min == -1)
            return "total"
        if(min < 1440){
            return "every hour";
        }
        if(min < 10080){
            return "every day";
        }
        if(min < 44640){
            return "every week";
        }
        return "every month";
    }

    removeNullValues(str: string,schema: string){
        var output = (' ' + str).slice(1);
        try{
            var schemaObj = JSON.parse(schema);
            if(schemaObj.properties !== undefined && schemaObj.properties.notification !== undefined){
                for (var property in schemaObj.properties.notification.properties) {
                    if (schemaObj.properties.notification.properties.hasOwnProperty(property)) {
                        var patt = new RegExp('"'+property+'"\\s*:\\s*null\\s*,?');
                        output = output.replace(patt,"")
                    }
                }
            }
            patt = new RegExp(',\\s*}\\s*$');
            output = output.replace(patt,"}")
            output = "{\"notification\":" + output+"}";
            return output;
        }
        catch (e){
            console.log("Failed to remove null values from the configuration");
            console.log(e);
            return str;
        }


        // var configObj;
        // try{
        //     configObj = JSON.parse(this.configurationStr);
        // }
        // catch (e){
        //     console.log(e);
        //     var errorMessage = "Invalid JSON Configuration";
        //     this.create(errorMessage);
        //     return;
        // }
        // for (var property in configObj) {
        //     if (configObj.hasOwnProperty(property) && configObj[property] === null) {
        //         delete configObj[property];
        //     }
        // }
        //
        // return JSON.stringify(configObj);
    }

    _save() {
        //this.notification.configuration = JSON.stringify(configObj);
        this.notification.configuration = this.removeNullValues(this.configurationStr,this.schema);
        this.loading = true;
        if (!this.notification.internalUserGroups) {
            this.notification.internalUserGroups = [];
        }

        var notificationToUpdate: AirlockNotification = AirlockNotification.clone(this.notification);

        notificationToUpdate.rolloutPercentage = Number(notificationToUpdate.rolloutPercentage);
        if(!this.isChecked){
            notificationToUpdate.maxNotifications = -1;
            notificationToUpdate.minInterval = -1
        }
        else{
            if(notificationToUpdate.maxNotifications == ""){
                notificationToUpdate.maxNotifications = -1;
            }
            else{
                if(isNumeric(notificationToUpdate.maxNotifications)){
                    notificationToUpdate.maxNotifications = Number(notificationToUpdate.maxNotifications)
                }
                else{
                    notificationToUpdate.maxNotifications = -1;
                }
            }
        }



        let notificationStr = JSON.stringify(notificationToUpdate);
        console.log("notificationStr:", notificationStr);
        this._airLockService.updateNotification(notificationToUpdate).then(result => {
            this.loading = false;
            this.onEditNotification.emit(null);
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
                toRet += "\n";
                tabCount++;
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if(curr==",") {
                toRet +=",";
                toRet += "\n";
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if (curr=="}") {
                tabCount--;
                toRet += "\n";
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
                toRet += "}"
            } else if(curr=="\n" || curr=='\t') {
                //do not add the new lines or tabs we come with
            }
            else {
                toRet += curr;
            }
        }
        return toRet;
    }

    handleError(error: any) {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = this.parseErrorMessage(error);
        console.log("handleError in editNotificationModal:"+errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    parseErrorMessage(error: any): string {
        var errorMessage = error._body || "Request failed, try again later.";
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch(err) {
            if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                errorMessage = errorMessage.substring(1,errorMessage.length -1);
            }
        }
        return errorMessage;
    }
    close(){
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modal.close();
    }

    addMissingFields(config:string, schema){
        try{
            var output =  (' ' + config).slice(1);
            var schemaObj = JSON.parse(schema);
            if(schemaObj.properties !== undefined && schemaObj.properties.notification !== undefined){
                for (var property in schemaObj.properties.notification.properties) {
                    if (schemaObj.properties.notification.properties.hasOwnProperty(property)) {
                        var patt = new RegExp('"'+property+'"\\s*:');
                        if(output.search(patt)==-1){
                            var pattB = new RegExp('\\s*}\\s*}\\s*$');
                            var i = output.search(pattB)
                            output = output.substr(0,i)+",\""+property+"\":null\n}}"
                        }
                    }
                }
            }
            //removing {"notifications":
            var pattC = new RegExp('^\\s*{\\s*"notification"\\s*:\\s*');
            output = output.replace(pattC,"")
            pattC = new RegExp('}\\s*$');
            output = output.replace(pattC,"");
            return output;
        }
        catch (e){
            console.log("Failed to add missing configuration fields");
            console.log(e);
            return config;
        }


        // try{
        //     var output = JSON.parse(config);
        //     var schemaObj = JSON.parse(schema);
        //     if(schemaObj.properties !== undefined){
        //         for (var property in schemaObj.properties) {
        //             if (schemaObj.properties.hasOwnProperty(property)) {
        //                 if(!output.hasOwnProperty(property)){
        //                     output[property]=null;
        //                 }
        //             }
        //         }
        //     }
        //     return this.stringify(output);
        // }
        // catch (e){
        //     console.log("Failed to add missing configuration fields");
        //     console.log(e);
        //     return config;
        // }

    }

    open(notification: AirlockNotification,strInputSchemaSample:string,strUtilitiesInfo:string,notificationSample, schema) {
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.notification = AirlockNotification.clone(notification);
        this.title = this.getString("edit_notification_title");
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.ruleInputSchemaSample = strInputSchemaSample;
        try{
            //clone ruleInputSchemaSample
            this.cancellationRuleInputSchemaSample = JSON.parse(JSON.stringify(strInputSchemaSample));
            if(notificationSample){
                if(notificationSample.notification){
                    this.cancellationRuleInputSchemaSample["notification"] = notificationSample.notification;
                }
            }
        }
        catch (e){
            console.log("edit notification modal: failed to clone ruleInputSchemaSample");
            this.cancellationRuleInputSchemaSample = strInputSchemaSample;
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.notification.stage == "PRODUCTION"));

        if(notification.minInterval !== undefined){
            this.minIntervalButtonText = this.getIntervalFromMinutes(notification.minInterval);
        }

        this.isChecked= this.notification.maxNotifications!=-1 || this.notification.minInterval!=-1;
        if(this.notification.maxNotifications == -1){
            this.notification.maxNotifications = "";
        }

        this.schema=this.stringify(schema);
        this.configurationStr = this.notification.configuration;
        this.configurationStr = this.addMissingFields(this.configurationStr,this.schema);

        //change dates to better format
        this.creationDate= new Date(this.notification.creationDate);
        this.lastModificationDate = new Date(this.notification.lastModified);

        if (this.schema=="{}") {
            this.schema = "{\n\t\n}";
        } else {
            this.schema = this.beautifyString(this.schema);
        }


        if (this.configurationStr=="{}") {
            this.configurationStr = "{\n\t\n}";
        } else {
            this.configurationStr = this.beautifyString(this.configurationStr);
        }

        //create groups combo box with tags
        setTimeout(() => {
            var $exampleMulti =  $$(".js_example").select2(
                {
                    tags: true,
                    tokenSeparators: [',', ' ']
                }
            );
            $$('.numberInput').on(
                'change',
                (e) => {
                    $$('.numberInput').val(parseFloat($$('.numberInput').val()).toFixed(4));
                    this.notification.rolloutPercentage = $$('.numberInput').val();
                    //$$('.numberInput').mask('000.0000', { reverse: true });
                }
            );
            $$('.js_example').on(
                'change',
                (e) => {
                    if(this.notification != null) {
                        this.notification.internalUserGroups = jQuery(e.target).val();
                    }
                }
            );
            $exampleMulti.val(this.notification.internalUserGroups).trigger("change");
            $$('.numberInput').trigger("change");
        },100);


        if(this.modal != null) {
            this.zone.run(() => {
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.generalTabActive = true;

                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.modal.open('lg');
            });

        }


    }






    /*defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }
*/
    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    cancellationRuleUpdated(event) {
        this.notification.cancellationRule.ruleString = event;
    }

    registrationRuleUpdated(event) {
        this.notification.registrationRule.ruleString = event;
    }

    inputSchemaUpdated(event) {
        this.configurationStr = event;
        //this.notification.configuration = JSON.stringify(event);
    }

    schemaUpdated(event) {
        //this.no.resultsSchema = event;
    }

    showRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/rules');
    }
    showConfigurationHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/configurations');
    }
    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    convertToString(obj:any) {
        return JSON.stringify(obj);
    }
    _isEmptyObject(obj:any) {
        for(var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }

    showNotificationHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/notifications');
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
        // this._notificationService.bare("Save failed", message);
        this.toastrService.error(message, "Save failed",  {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-notification bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }

    openAceEditorCancellationRuleExpand(){
        var expandDialogTitle = "Cancellation Rule - "+this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.notification.cancellationRule.ruleString, expandDialogTitle, this.cancellationRuleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.NOTIFICATION_CANCELLATION_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorRegistrationRuleExpand(){
        var expandDialogTitle = "Registration Rule - "+this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.notification.registrationRule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.NOTIFICATION_REGISTRATION_RULE, this.isOnlyDisplayMode);
    }



    openAceEditorConfigurationSchemaExpand(){
        var expandDialogTitle = this.getString('edit_notification_configuration_configuration_edit_title') + " - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.schema, expandDialogTitle, "", "", AceExpandDialogType.CONFIG_SCHEMA, true);
    }

    openAceEditorInputSchemaExpand(){
        var expandDialogTitle = this.getString('edit_notification_input_schema_edit_title') + " - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.configurationStr, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, false);
    }

    openWhiteListEditor(){
        console.log('Open White List');
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


}



