import {
    Component,
    ElementRef,
    EventEmitter,
    Inject, Input,
    NgZone, Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {AirlockNotification} from "../../../model/airlockNotification";
import {isNumeric} from 'rxjs/util/isNumeric';
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {NotificationCell} from "../../airlock.components/notificationCell";
import {AceModal} from "../aceModal/aceModal.component";
import {AceExpandDialogType} from "../../../app.module";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {LayoutService} from "../../../@core/utils";
import {NotificationsPage} from "../../../pages/notifications/notifications.component";
import {SaveActionModal} from "../saveActionModal";
import {Feature} from "../../../model/feature";

@Component({
    selector: 'edit-notification-modal',
    styleUrls: ['./editNotificationModal.scss'],
    templateUrl: './editNotificationModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditNotificationModal {
    @Input() visible = false;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('general') General;
    @ViewChild('ruleTab') RuleTab;
    @ViewChild('configTab') ConfigTab;
    @Output() onEditNotification = new EventEmitter<any>();
    @Output() onClose = new EventEmitter<any>();
    possibleGroupsList: Array<any> = [];
    loading: boolean = false;
    notification: AirlockNotification;
    originalNotification: AirlockNotification = null;
    schema;
    notificationsPage: NotificationsPage = null;
    inlineMode: boolean = false;
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    inputSampleLoaded = false;
    minAppVersionForSample = "";
    ruleTabActive: boolean = false;
    configTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    notificationCell: NotificationCell = null;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    ruleInputSchemaSample: string;
    notificationInputSample: any;
    cancellationRuleInputSchemaSample;
    ruleUtilitiesInfo: string;
    schemaUtilitiesInfo: string;
    schemaInputSchemaSample: string;
    totalCountQuota: number;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(500, 2);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "125px";
    // aceEditorConfigurationHeight: string = "136px";
    configurationStr: string;
    private sub: any = null;
    minIntervalButtonText: string;
    intervalValues: string[] = ["total", "every hour", "every day", "every week", "every month"];
    isChecked: boolean;
    modalHeight: string;
    modalWidth: string;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<EditNotificationModal>,
                private modalService: NbDialogService
    ) {
        this.elementRef = elementRef;
        this.possibleGroupsList = this._appState.getAvailableGroups();

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.title = this.getString("edit_notification_title");
        if (this.ruleInputSchemaSample != null) {
            try {
                //clone ruleInputSchemaSample
                this.cancellationRuleInputSchemaSample = JSON.parse(JSON.stringify(this.ruleInputSchemaSample));
                if (this.notificationInputSample) {
                    if (this.notificationInputSample.notification) {
                        this.cancellationRuleInputSchemaSample["notification"] = this.notificationInputSample.notification;
                    }
                }
            } catch (e) {
                console.log("edit notification modal: failed to clone ruleInputSchemaSample");
                this.cancellationRuleInputSchemaSample = this.ruleInputSchemaSample;
            }
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.notification.stage == "PRODUCTION"));

        if (this.notification?.minInterval !== undefined) {
            this.minIntervalButtonText = this.getIntervalFromMinutes(this.notification.minInterval);
        }

        this.isChecked = this.notification?.maxNotifications != -1 || this.notification?.minInterval != -1;
        if (this.notification?.maxNotifications == -1) {
            this.notification.maxNotifications = "";
        }

        this.schema = this.stringify(this.schema);
        this.configurationStr = this.notification?.configuration;
        this.configurationStr = this.addMissingFields(this.configurationStr, this.schema);

        //change dates to better format
        this.creationDate = new Date(this.notification?.creationDate);
        this.lastModificationDate = new Date(this.notification?.lastModified);

        if (this.schema == "{}") {
            this.schema = "{\n\t\n}";
        } else {
            this.schema = this.beautifyString(this.schema);
        }


        if (this.configurationStr == "{}") {
            this.configurationStr = "{\n\t\n}";
        } else {
            this.configurationStr = this.beautifyString(this.configurationStr);
        }

        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth = LayoutService.calculateModalWidth();
        
        if (this.modalRef != null) {
            this.zone.run(() => {
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.generalTabActive = true;
                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
            });
        }
    }

    initAfterClose() {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.notification = null;
        this.generalTabActive = true;
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.isShowHirarchy = false;
    }

    isValid() {
        if (this.notification.name == null || this.notification.name.length == 0) {
            return "name is required";
        }
        if (this.notification.minAppVersion) {
            this.notification.minAppVersion = this.notification.minAppVersion.trim();
        }
        if (this.notification.stage == "PRODUCTION" && !this.notification.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }
        return "";
    }


    validate() {

    }

    save(dontClose = false) {
        const validError: string = this.isValid();
        if (validError.length == 0) {
            if (this.notification.stage == 'DEVELOPMENT' && (this.notification.internalUserGroups == null || this.notification.internalUserGroups.length <= 0)) {
                let message = 'This notification will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed) {
                        this._save(dontClose);
                    }
                });
                // modalAlert.confirm()
                //     .title(message)
                //     .open()
                //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                //     .then(() => {
                //         this._save();
                //     }) // if were here ok was clicked.
                //     .catch(err => {
                //         this.loading = false;
                //         this.handleError(err);
                //     });


            } else {
                if (this.notification.stage == 'PRODUCTION') {
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            title: this._stringsSrevice.getString("edit_change_production_notification"),
                            notification: this.notification,
                            verifyModalDialogType: VerifyDialogType.NOTIFICATION_TYPE,
                        }
                    }).onClose.subscribe(confirmed => {
                        if (confirmed) {
                            this._save(dontClose);
                        }
                    });
                } else {
                    this._save(dontClose);
                }
            }
        } else {
            this.create(validError);
        }
    }

    selectIntervalValue(index) {
        console.log('Selected interval value is: ', index);
        this.minIntervalButtonText = this.intervalValues[index];
        this.notification.minInterval = this.getIntervalByIndex(index);
    }

    getIntervalByIndex(index: number) {
        if (index == 0)
            return -1;
        if (index == 1)
            return 60; //hour
        if (index == 2)
            return 1440; //day
        if (index == 3)
            return 10080; //week
        if (index == 4)
            return 43200; //month = 30 days
        return -1
    }

    getIntervalFromMinutes(min: number) {
        if (min == -1)
            return "total"
        if (min < 1440) {
            return "every hour";
        }
        if (min < 10080) {
            return "every day";
        }
        if (min < 44640) {
            return "every week";
        }
        return "every month";
    }

    removeNullValues(str: string, schema: string) {
        let output = (' ' + str).slice(1);
        try {
            const schemaObj = JSON.parse(schema);
            if (schemaObj.properties !== undefined && schemaObj.properties.notification !== undefined) {
                for (let property in schemaObj.properties.notification.properties) {
                    if (schemaObj.properties.notification.properties.hasOwnProperty(property)) {
                        var patt = new RegExp('"' + property + '"\\s*:\\s*null\\s*,?');
                        output = output.replace(patt, "")
                    }
                }
            }
            patt = new RegExp(',\\s*}\\s*$');
            output = output.replace(patt, "}")
            output = "{\"notification\":" + output + "}";
            return output;
        } catch (e) {
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

    _save(dontClose = false) {
        //this.notification.configuration = JSON.stringify(configObj);
        this.notification.configuration = this.removeNullValues(this.configurationStr, this.schema);
        this.loading = true;
        if (!this.notification.internalUserGroups) {
            this.notification.internalUserGroups = [];
        }

        const notificationToUpdate: AirlockNotification = AirlockNotification.clone(this.notification);

        notificationToUpdate.rolloutPercentage = Number(notificationToUpdate.rolloutPercentage);
        if (!this.isChecked) {
            notificationToUpdate.maxNotifications = -1;
            notificationToUpdate.minInterval = -1
        } else {
            if (notificationToUpdate.maxNotifications == "") {
                notificationToUpdate.maxNotifications = -1;
            } else {
                if (isNumeric(notificationToUpdate.maxNotifications)) {
                    notificationToUpdate.maxNotifications = Number(notificationToUpdate.maxNotifications)
                } else {
                    notificationToUpdate.maxNotifications = -1;
                }
            }
        }


        let notificationStr = JSON.stringify(notificationToUpdate);
        console.log("notificationStr:", notificationStr);
        this._airLockService.updateNotification(notificationToUpdate).then((res) => {
            this.loading = false;
            this.onEditNotification.emit(null);
            this.notificationsPage?.loadNotifications();
            if (dontClose) {
                notificationToUpdate.lastModified = res.lastModified;
                this.refreshEditScreen(notificationToUpdate);
            } else {
                this.close();
            }

        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: AirlockNotification) {
        this.originalNotification = updated;
        this.notification = AirlockNotification.clone(updated);
        this.loading = false;
    }
    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            let fnBody;
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
        let toRet = "";
        let tabCount = 0;
        let inStringContext = false;
        let latestStringChar = null;
        let i = 0;
        const len = str?.length;
        for (; i < len; i++) {
            let curr = str[i];

            if (inStringContext) {
                // do not add tabs and new lines if inside a string
                toRet += curr;
                if (curr == latestStringChar) {
                    inStringContext = false;
                    latestStringChar = null;
                }
            } else if (curr == "\"" /*|| curr=="\'"*/) {
                toRet += curr;
                inStringContext = true;
                latestStringChar = curr;
            } else if (curr == "{") {
                toRet += "{";
                toRet += "\n";
                tabCount++;
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == ",") {
                toRet += ",";
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == "}") {
                tabCount--;
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
                toRet += "}"
            } else if (curr == "\n" || curr == '\t') {
                //do not add the new lines or tabs we come with
            } else {
                toRet += curr;
            }
        }
        return toRet;
    }

    handleError(error: any) {
        this.loading = false;
        if (error == null) {
            return;
        }

        const errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editNotificationModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    parseErrorMessage(error: any): string {
        let errorMessage = error._body || "Request failed, try again later.";
        try {
            const jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }
        return errorMessage;
    }

    close() {
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }

    addMissingFields(config: string, schema) {
        if (config == null || schema == null) {
            return ' ';
        }
        try {
            let output = (' ' + config).slice(1);
            const schemaObj = JSON.parse(schema);
            if (schemaObj.properties !== undefined && schemaObj.properties.notification !== undefined) {
                for (let property in schemaObj.properties.notification.properties) {
                    if (schemaObj.properties.notification.properties.hasOwnProperty(property)) {
                        const patt = new RegExp('"' + property + '"\\s*:');
                        if (output.search(patt) == -1) {
                            const pattB = new RegExp('\\s*}\\s*}\\s*$');
                            const i = output.search(pattB);
                            output = output.substr(0, i) + ",\"" + property + "\":null\n}}"
                        }
                    }
                }
            }
            //removing {"notifications":
            let pattC = new RegExp('^\\s*{\\s*"notification"\\s*:\\s*');
            output = output.replace(pattC, "")
            pattC = new RegExp('}\\s*$');
            output = output.replace(pattC, "");
            return output;
        } catch (e) {
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
    open(notification: AirlockNotification, strInputSchemaSample: string, strUtilitiesInfo: string, notificationSample, schema) {
        if (this.loaded && this.isDirty()) {
            let message = this.notification.name + ' has changed and not saved. do you wish to save it now?';
            this.modalService.open(SaveActionModal, {
                closeOnBackdropClick: false,
                context: {
                    title: message,
                }
            }).onClose.subscribe(status => {
                if (status === 'cancel') {
                    //do nothing
                } else if (status === 'save') {
                    this.save(true);
                } else if (status === 'discard') {
                    this._open(notification, strInputSchemaSample, strUtilitiesInfo, notificationSample, schema);
                }
            });
        } else {
            this._open(notification, strInputSchemaSample, strUtilitiesInfo, notificationSample, schema);
        }
    }
    _open(notification: AirlockNotification, strInputSchemaSample: string, strUtilitiesInfo: string, notificationSample, schema) {
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.notification = AirlockNotification.clone(notification);
        this.originalNotification = AirlockNotification.clone(notification);
        this.title = this.getString("edit_notification_title");
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.ruleInputSchemaSample = strInputSchemaSample;
        try {
            //clone ruleInputSchemaSample
            this.cancellationRuleInputSchemaSample = JSON.parse(JSON.stringify(strInputSchemaSample));
            if (notificationSample) {
                if (notificationSample.notification) {
                    this.cancellationRuleInputSchemaSample["notification"] = notificationSample.notification;
                }
            }
        } catch (e) {
            console.log("edit notification modal: failed to clone ruleInputSchemaSample");
            this.cancellationRuleInputSchemaSample = strInputSchemaSample;
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.notification.stage == "PRODUCTION"));

        if (notification.minInterval !== undefined) {
            this.minIntervalButtonText = this.getIntervalFromMinutes(notification.minInterval);
        }

        this.isChecked = this.notification.maxNotifications != -1 || this.notification.minInterval != -1;
        if (this.notification.maxNotifications == -1) {
            this.notification.maxNotifications = "";
        }

        this.schema = this.stringify(schema);
        this.configurationStr = this.notification.configuration;
        this.configurationStr = this.addMissingFields(this.configurationStr, this.schema);

        //change dates to better format
        this.creationDate = new Date(this.notification.creationDate);
        this.lastModificationDate = new Date(this.notification.lastModified);

        if (this.schema == "{}") {
            this.schema = "{\n\t\n}";
        } else {
            this.schema = this.beautifyString(this.schema);
        }


        if (this.configurationStr == "{}") {
            this.configurationStr = "{\n\t\n}";
        } else {
            this.configurationStr = this.beautifyString(this.configurationStr);
        }

        this.ruleTabActive = false;
        this.configTabActive = false;
        this.generalTabActive = true;

        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }

        if (!this.ruleInputSchemaSample || !this.ruleUtilitiesInfo || !this.notificationInputSample) {
            this.inputSampleLoaded = false;
            this.loadAutoComplete(true);
        } else {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.notification.minAppVersion;
        }
        this.loaded = true;
    }


    defaultConfigurationUpdated(event) {
        // this.defaultConfigurationString = event;
    }

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
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.363ue557y7d0');
    }

    showConfigurationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.igpio3q4s3ui');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    convertToString(obj: any) {
        return JSON.stringify(obj);
    }

    _isEmptyObject(obj: any) {
        for (let prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }

    showNotificationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.dair8e34qlnt');
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

    create(message: string) {
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }



    openAceEditorCancellationRuleExpand() {
        const expandDialogTitle = "Cancellation Rule - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.notification.cancellationRule.ruleString, expandDialogTitle, this.cancellationRuleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.NOTIFICATION_CANCELLATION_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorRegistrationRuleExpand() {
        const expandDialogTitle = "Registration Rule - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.notification.registrationRule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.NOTIFICATION_REGISTRATION_RULE, this.isOnlyDisplayMode);
    }


    openAceEditorConfigurationSchemaExpand() {
        const expandDialogTitle = this.getString('edit_notification_configuration_configuration_edit_title') + " - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.schema, expandDialogTitle, "", "", AceExpandDialogType.CONFIG_SCHEMA, true);
    }

    openAceEditorInputSchemaExpand() {
        const expandDialogTitle = this.getString('edit_notification_input_schema_edit_title') + " - " + this.notification.name;
        this.aceModalContainerDialog.showAceModal(this.configurationStr, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, false);
    }

    openWhiteListEditor() {
        console.log('Open White List');
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.ruleTabActive = false;
                this.configTabActive = false;
                break;
            // this.generalTab.nativeElement.scrollIntoView({behavior: 'smooth'});
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.ruleTabActive = true;
                this.configTabActive = false;
                break;
            case  'Config':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.ruleTabActive = false;
                this.configTabActive = true;
                break;
        }
    }

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || !this.ruleUtilitiesInfo || this.minAppVersionForSample != this.notification.minAppVersion) {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.notification.minAppVersion;
            this.loadAutoComplete();
        } else {
            this.loading = false;
        }
    }

    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let feature = this.notification;
        let loadPhase3 = (result: boolean): void => {
            this._airLockService.getNotificationsOutputsample(this.notification.seasonId).then(result1 => {
                this.notificationInputSample = result1 as string;
                if (this.ruleInputSchemaSample && this.ruleUtilitiesInfo && this.notificationInputSample && this.minAppVersionForSample === this.notification.minAppVersion) {
                    this.inputSampleLoaded = true;
                }
                this.loading = false;
            }).catch(error => {
                console.log('Error in getting notification Input Schema Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get notification Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
        let loadPhase2 = (result: boolean): void => {
            this._airLockService.getInputSample(feature.seasonId, feature.stage, feature.minAppVersion).then(resultSample => {
                this.ruleInputSchemaSample = resultSample as string;
                this.cancellationRuleInputSchemaSample = this.ruleInputSchemaSample;
                console.log('Input Schema Sample');
                console.log(this.ruleInputSchemaSample);
                loadPhase3(true);
            }).catch(error => {
                console.log('Error in getting Input Schema Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                loadPhase3(false);
            });
        }
        this._airLockService.getUtilitiesInfo(feature.seasonId, feature.stage, feature.minAppVersion).then(result => {
            let ruleUtilitieInfo = result as string;
            console.log('UtilityInfo:');
            console.log(ruleUtilitieInfo);
            this.ruleUtilitiesInfo = ruleUtilitieInfo;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
    }

    openOnNewTab() {
        window.open('/#/pages/notifications/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason() + '/' + this._appState.getCurrentBranch() + '/' + this.notification
            .uniqueId);
    }

    isDirty(): boolean {
        return this.notification && this.originalNotification && !FeatureUtilsService.isNotificationIdentical(this.notification, this.originalNotification);
    }
}



