import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone, Optional,
    Output,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {ConfirmActionModal} from "../confirmActionModal";
import {GlobalState} from "../../../global.state";
import {ShowConflictsModal} from "../showConflictsModal";
import {Poll} from "../../../model/poll";

@Component({
    selector: 'import-features-modal',
    styleUrls: ['./importPollsModal.scss'],
    templateUrl: './importPollsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ImportPollsModal {
    private uploadedFileContent: string;
    isClear: boolean = false;
    private heading: string;
    loading: boolean = false;
    poll: Poll;
    @Output() onImportFeatures = new EventEmitter<any>();
    rootId: string;
    @Input() featurePath: Array<Feature> = [];
    previewFeaturePath: Array<Feature> = [];
    private elementRef: ElementRef;
    isShowSuffix: boolean = false;
    isShowMinApp: boolean = false;
    isShowWarning: boolean = false;
    hasReviewedWarning = false;
    suffix: string;
    showImportFile: boolean = false;
    minAppVersion: string;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    isPaste: boolean = false;
    parent: Feature;
    copiedFeatureTitlePrefix: string;
    copiedFeatureTitleMain: string;
    copiedFeatureTitleSuffix: string;
    newFeatureId: string = null;
    canShowPreview: boolean = false;
    private generalTabActive: boolean = true;
    private hirarchyTabActive: boolean = false;
    title: string;
    canSave: boolean;
    saveText = "Save";
    referenceOpen: boolean = false;
    previewOpen: boolean = false;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private zone: NgZone,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                @Optional() private modalRef: NbDialogRef<ImportPollsModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    ngOnInit(){

        this.showImportFile = true;
        this.title = 'Import poll from CMS';
        this.heading = this.getString("import_features_tab_title");
        this.saveText = "Import"

        this.loaded = true;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    initAfterClose() {
        this.poll = null;
        this.referenceOpen = true;
        this.previewOpen = false;
        this.showImportFile = false;
        this.isPaste = false;
        this.isClear = false;
        this.uploadedFileContent = null;
        this.suffix = null;
        this.minAppVersion = null;
        this.generalTabActive = true;
        this.canShowPreview = false;
        this.hirarchyTabActive = false;
        this.copiedFeatureTitlePrefix = "";
        this.copiedFeatureTitleMain = "";
        this.copiedFeatureTitleSuffix = "";
        this.canSave = false;
        this.previewFeaturePath = [];
        this.newFeatureId = null;
        this.isShowWarning = false;
        this.hasReviewedWarning = false;

    }

    selectGeneralPage() {
        this.generalTabActive = true;
        this.hirarchyTabActive = false;
    }

    moveToPreviewTab() {
        this.canShowPreview = true;
        this.generalTabActive = false;
        this.hirarchyTabActive = true;
    }

    validate(dontPopValidationErrors: boolean = false) {
        if (!this.isPaste && this.uploadedFileContent == null) {
            this.create(this._stringsSrevice.getString("import_features_select_file"), "Validation Failed");
            return;
        }
        this.validateImport();
    }

    validateImport() {

    }

    openWarning() {
        this.modalService.open(ShowConflictsModal, {
            closeOnBackdropClick: false,
            context: {
                title: "Conflicting Assets",
                message: ""
            }
        })
        // this.showConflictsModal.open("Conflicting Assets", this.conflictingStringsMessage);
        this.hasReviewedWarning = true
        if (this.isPaste) {
            this.saveText = "Paste (Ignore Warnings)"
        } else {
            this.saveText = "Import (Ignore Warnings)"
        }
    }

    handleValidationError(dontPopValidationErrors: boolean = false, error: any) {
        console.log(error);
        this.loading = false;
        var shouldShowGeneralErrorMessgae: boolean = true;
        var serverErrorMessage: any = error.error
        // if (serverErrorMessage.startsWith('{')) {
            try {
                var errorMessage: string = "";
                if (serverErrorMessage.illegalMinAppVersion != null && serverErrorMessage.illegalMinAppVersion.length > 0) {
                    if (this.minAppVersion == null) {
                        errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
                    } else {
                        errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
                    }
                    this.isShowMinApp = true;
                }
                if (serverErrorMessage.illegalGivenMinAppVersion != null) {
                    errorMessage += this._stringsSrevice.getString("import_features_provide_minapp_exceed_max");
                }
                if (serverErrorMessage.illegalName != null && serverErrorMessage.illegalName.length > 0) {
                    if (this.suffix == null) {
                        errorMessage += this._stringsSrevice.getString("import_features_provide_suffix");
                    } else {
                        errorMessage += this._stringsSrevice.getString("import_features_change_suffix");
                    }
                    this.isShowSuffix = true;
                }
                if (serverErrorMessage.error != null) {
                    errorMessage += serverErrorMessage.error;
                }

                var isMissingUtilities = (serverErrorMessage.missingUtilities != null && serverErrorMessage.missingUtilities.length > 0);
                if (isMissingUtilities) {
                    errorMessage += this._stringsSrevice.getString("import_features_missing_utils");
                    for (let util of serverErrorMessage.missingUtilities) {
                        errorMessage += util + '\n';
                    }
                }
                var isMissingContextFields = (serverErrorMessage.missingFields != null && serverErrorMessage.missingFields.length > 0);
                if (isMissingContextFields) {
                    errorMessage += this._stringsSrevice.getString("import_features_missing_fields");
                    for (let field of serverErrorMessage.missingFields) {
                        errorMessage += field + '\n';
                    }

                }
                var isMissingAssets = (serverErrorMessage.missingAssets != null && serverErrorMessage.missingAssets.length > 0);
                if (isMissingAssets) {
                    errorMessage += this._stringsSrevice.getString("import_features_missing_assets");
                    for (let asset of serverErrorMessage.missingAssets) {
                        errorMessage += asset.name + '\n';
                    }

                }
                //{"missingFields":[],"missingUtilities":["isTrue"]}

                //show pop up message if needed and mute the general error in case dontPopValidationErrors is true
                //and this is expected error (suffix,min version or missing assets)
                if (serverErrorMessage.error != null || isMissingAssets || isMissingUtilities || isMissingContextFields || !dontPopValidationErrors) {
                    // this.showMessageModal.open("Validation Failed", errorMessage);
                    shouldShowGeneralErrorMessgae = false;
                } else {
                    shouldShowGeneralErrorMessgae = ((dontPopValidationErrors && errorMessage != "") == false);
                }

            } catch (e) {
                console.log(e);
            }
        // } else {
        //     shouldShowGeneralErrorMessgae = false;
        //     errorMessage = serverErrorMessage;
        // }


        if (shouldShowGeneralErrorMessgae) {
            errorMessage = 'Request failed, try again later.'
            // this.showMessageModal.open("Validation Failed", "Request failed, try again later.");
        }
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                shouldDisplaySubmit: false,
                title: "Validation Failed",
                message: errorMessage,
                defaultTitle: 'OK',
            }
        })


    }

    handleValidationSucceed(res: any) {
        console.log(res);

        this.loading = false;
        this.canSave = true;
        this.newFeatureId = res.newSubTreeId;
        this.moveToPreviewTab();
        this.loading = false;
        this.referenceOpen = false;
        this.previewOpen = true;
    }


    save() {
        this.modalRef.close();
        // if (this.isShowWarning == true && this.hasReviewedWarning == false) {
        //     this.openWarning();
        //     return;
        // }
        // if (!this.isPaste && this.uploadedFileContent == null) {
        //     this.create(this._stringsSrevice.getString("import_features_select_file"));
        //     return;
        // }
        //
        // console.log(this.uploadedFileContent);
        // this._saveImported();
    }


    _saveImported() {
        this.modalRef.close();
        this.loading = true;
    }


    openFile(event) {
        let input = event.target;
        for (var index = 0; index < input.files.length; index++) {
            let reader = new FileReader();
            reader.onload = () => {
                var text = reader.result;
                this.uploadedFileContent = text as string;
                console.log(text);
            };
            reader.readAsText(input.files[index]);
        }
    }

    handleError(error: any, title: string = "Save failed") {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = error._body || "Request failed, try again later.";
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
        console.log("handleError in import features:" + errorMessage);
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
        // this.showMessageModal.open(title,errorMessage);
    }

    close(reload = false) {
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }

    getPreviewTitle() {
        if (this.canShowPreview) {
            return this.getString("import_feature_preview_accordion_title_available");
        } else {
            return this.getString("import_feature_preview_accordion_title_not_available");
        }
    }

    open(isPaste: boolean, parent: Feature) {

        this.isPaste = isPaste;
        this.parent = parent;
        this.isOpen = true;
        this.isClear = true;
        this.isShowSuffix = false;
        this.isShowMinApp = false;
        this.loading = false;
        this.referenceOpen = true;
        this.previewOpen = false;
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

    create(message: string, title: string = "Save failed") {
        this.toastrService.danger(message, title, {
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



