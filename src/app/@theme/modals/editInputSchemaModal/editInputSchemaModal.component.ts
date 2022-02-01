import {Component, ElementRef, Inject, NgZone, ViewChild, ViewEncapsulation} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";


import {Season} from "../../../model/season";
// import 'select2';
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
// import {ShowMessageModal} from "../showMessageModal/showMessageModal.component";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {TabsetConfig} from "ngx-bootstrap/tabs";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
// import {BaThemeSpinner} from "../../services/baThemeSpinner";
import {AceExpandDialogType} from "../../../app.module";
import {ConfirmActionModal} from "../confirmActionModal";

export function getTabsetConfig(): TabsetConfig {
    return Object.assign(new TabsetConfig(), {type: 'pills'});
}

@Component({
    selector: 'edit-input-schema-modal',
    styleUrls: ['./editInputSchemaModal.scss'],
    templateUrl: './editInputSchemaModal.html',
    encapsulation: ViewEncapsulation.None

})

export class EditInputSchemaModal {

    // @ViewChild('showMessageModal')
    // showMessageModal: ShowMessageModal;
    @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog: AceModal;
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
    private elementRef: ElementRef;
    inputSchema: any;
    loaded = false;
    isOpen: boolean = false;
    inputSchemaString: string;
    isOnlyDisplayMode: boolean = false;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "330px";
    season: Season;


    constructor(
        // private _spinner: BaThemeSpinner,
        private _airLockService: AirlockService,
        @Inject(ElementRef) elementRef: ElementRef,
        private _featureUtils: FeatureUtilsService,
        private authorizationService: AuthorizationService,
        private zone: NgZone
        , private _stringsSrevice: StringsService,
        private toastrService: NbToastrService,
        private modalRef: NbDialogRef<EditInputSchemaModal>,
        private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.loading = false;
        this.title = this.getString("edit_input_schema_title");
        this.isOpen = true;
        try {
            this.inputSchemaString = JSON.stringify(this.inputSchema.inputSchema);
            this.inputSchemaString = this.beautifyString(this.inputSchemaString);
        } catch (e) {
            console.log(e);
        }
        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
            });
        }
    }

    initAfterClose() {

    }

    save() {
        this._save();
    }

    _save() {
        this.loading = true;
        try {
            this.inputSchema.inputSchema = JSON.parse(this.inputSchemaString);
        } catch (e) {
            this.create("Error", "Schema is not a valid JSON");
            this.loading = false;
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
                if (i + 1 < len && str[i + 1] != "\n") {
                    toRet += "\n";
                }
                tabCount++;
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == ",") {
                toRet += ",";
                if (i + 1 < len && str[i + 1] != "\n") {
                    toRet += "\n";
                }
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == "}") {
                tabCount--;
                if (i - 1 > 0 && str[i - 1] != "\n") {
                    toRet += "\n";
                }
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
                toRet += "}"
            } else {
                toRet += curr;
            }
        }
        return toRet;
    }

    handleError(error: any, title: string = "Save Failed") {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = this._airLockService.parseErrorMessage(error, "Request failed, try again later.");
        console.log(error);
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                shouldDisplaySubmit: false,
                title: title,
                message: errorMessage,
                defaultTitle: 'OK'
            }
        })
        // this.showMessageModal.open(title, errorMessage);
    }

    close() {
        this.isOpen = false;
        this.inputSchemaString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }

    validate() {
        this.loading = true;
        // this.inputSchema.inputSchema = JSON.parse(this.inputSchemaString);
        //updateInputSchema
        try {
            let jsonObj = JSON.parse(this.inputSchemaString);
        } catch (e) {
            this.create("Error", "Schema is not a valid JSON");
            this.loading = false;
            return
        }
        this._airLockService.validateInputSchema(this.season.uniqueId, this.inputSchemaString).then(result => {
            this.loading = false;
            var isError: boolean = false;
            if ((result as any).brokenConfigurations != null && (result as any).brokenConfigurations.length > 0) {
                isError = true;
            }
            if ((result as any).brokenRules != null && (result as any).brokenRules.length > 0) {
                isError = true;
            }
            if (isError) {
                var errorBody: string = "";
                try {
                    errorBody = JSON.stringify(result);
                } catch (e) {

                }
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        shouldDisplaySubmit: false,
                        title: "Validation Error",
                        message: errorBody,
                        defaultTitle: 'OK'
                    }
                })
                // this.showMessageModal.open("Validation Error", errorBody);
            } else {
                // this._notificationService.success("Validation", "The schema is valid");
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "Valid Schema"
                });
            }
            //     , {
            //     timeOut: 4000,
            //     showProgressBar: true
            // });
            // this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Valid Schema"});
            // this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error, "Validation Failed");
        });
    }

    openAceEditorOutputConfigurationExpand() {
        var expandDialogTitle = this.title;
        this.aceModalContainerDialog.showAceModal(this.inputSchemaString, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }

    showRuleHelp() {
        window.open('http://jsonviewer.stack.hu/');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    open(inputSchema: any, season: Season, editMode: boolean) {

    }

    inputSchemaUpdated(event) {
        console.log("update inputSchemaUpdated");
        this.inputSchemaString = event;
    }

    create(title: string, message: string) {
        this.toastrService.danger(message, "title", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }


    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }
}



