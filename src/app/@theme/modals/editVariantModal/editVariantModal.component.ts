import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone, Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";

import {Feature} from "../../../model/feature";

import {Product} from "../../../model/product";

import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {Variant} from "../../../model/variant";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {VariantCell} from "../../airlock.components/variantCell";
import {AceModal} from "../aceModal/aceModal.component";
import {AceExpandDialogType} from "../../../app.module";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {LayoutService} from "../../../@core/utils";
import {SaveActionModal} from "../saveActionModal";
import {Stream} from "../../../model/stream";
import {Experiment} from "../../../model/experiment";
import {AvailableBranches} from "../../../model/branch";

@Component({
    selector: 'edit-variant-modal',
    styleUrls: ['./editVariantModal.scss'],
    templateUrl: './editVariantModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditVariantModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    loading: boolean = false;
    product: Product;
    @Input() variant: Variant;
    experiment: Experiment;
    @Input() rootFeatuteGroups: Array<Feature>;
    @Input() visible = false;
    @ViewChild('general') generalTab;
    @ViewChild('ruleTab') ruleTab;
    @ViewChild('descriptionTab') descriptionTab;
    @Output() onEditVariant = new EventEmitter<any>();
    @Output() onShowFeature = new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate: EventEmitter<any> = new EventEmitter();
    @Input() rootId: string;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    originalVariant: Variant;
    possibleGroupsList: Array<any> = [];
    private elementRef: ElementRef;
    availableBranches: AvailableBranches;
    availableBranchesForSelect: any[] = [];
    creationDate: Date;
    inputSampleLoaded = false;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    descriptionTabActive: boolean = false;
    ruleTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    variantCell: VariantCell = null;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    private sub: any = null;
    modalHeight: string;
    modalWidth: string;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<EditVariantModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
        this.product = this._appState.getCurrentProduct();
        this.possibleGroupsList = this._appState.getAvailableGroups();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.isOpen = true;
        this.setBranchesForSelect();
        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth = LayoutService.calculateModalWidth();
    }

    isDirty(): boolean {
        return this.variant && this.originalVariant && !FeatureUtilsService.isVariantIdentical(this.variant, this.originalVariant);
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
        this.originalVariant = null;
        this.generalTabActive = true;
        this.descriptionTabActive = false;
        this.ruleTabActive = false;
        this.isShowHirarchy = false;

    }

    isValid() {
        if (this.variant.name == null || this.variant.name.length == 0) {
            return "name is required";
        }

        return "";
    }

    removeDuplicateSon(item: Feature, parentId: string, itemId: string) {
        if (item.uniqueId === parentId) {
            for (var i = 0; i < item.features.length; ++i) {
                if (item.features[i].uniqueId == itemId) {
                    item.features.splice(i, 1);
                    return;
                }
            }
        } else {
            item.features.forEach((curSon) => {
                    this.removeDuplicateSon(curSon, parentId, itemId);
                }
            );
        }
    }

    validate() {

    }

    save(dontClose = false, callback: (answer: boolean) => any = null) {
        var validError: string = this.isValid();
        if (validError.length == 0) {
            if (this.variant.stage == 'DEVELOPMENT' && (this.variant.internalUserGroups == null || this.variant.internalUserGroups.length <= 0)) {
                let message = 'This variant will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed) {
                        this._save(dontClose, callback);
                    }
                });
            } else {
                if (this.variant.stage == 'PRODUCTION') {
                    console.log("open verifyActionModal");
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            variant: this.variant,
                            text: this._stringsSrevice.getString("edit_change_production_variant"),
                            verifyModalDialogType: VerifyDialogType.VARIANT_TYPE,
                        }
                    }).onClose.subscribe(confirmed => {
                        if (confirmed) {
                            this._save(dontClose, callback);
                        }
                    });
                } else {
                    this._save(dontClose, callback);
                }
            }
        } else {
            this.create(validError);
        }
    }

    _save(dontClose = false, callback: (answer: boolean) => any = null) {
        this.loading = true;
        if (!this.variant.internalUserGroups) {
            this.variant.internalUserGroups = [];
        }

        var variantToUpdate: Variant = this.variant;


        variantToUpdate.rolloutPercentage = Number(variantToUpdate.rolloutPercentage);
        this._airLockService.updateVariant(variantToUpdate).then(result => {
            this.loading = true;
            this.onEditVariant.emit(null);
            if (dontClose) {
                variantToUpdate.lastModified = result.lastModified;
                this.refreshEditScreen(variantToUpdate);
                if (callback) {
                    callback(true);
                }
            } else {
                this.close();
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: Variant) {
        this.originalVariant = updated;
        this.variant = Variant.clone(updated);
        this.loading = false;
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

    // for open
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

        var errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editFeatureModal:" + errorMessage);
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
        } catch (err) {
            if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }
        return errorMessage;
    }

    close() {
        this.isOpen = false;
        this.onShowFeature.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }

    canMoveOn(callback: (answer: boolean) => any) {
        if (this.loaded && this.isDirty()) {
            let message = this.variant.name + ' has changed and not saved. do you wish to save it now?';
            this.modalService.open(SaveActionModal, {
                closeOnBackdropClick: false,
                context: {
                    title: message,
                }
            }).onClose.subscribe(status => {
                if (status === 'cancel') {
                    callback(false);
                } else if (status === 'save') {
                    this.save(true, callback);
                } else if (status === 'discard') {
                    this.refreshEditScreen(this.originalVariant);
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
    }

    open(variant: Variant, experiment: Experiment, availableBranches: AvailableBranches, strInputSchemaSample: string, strUtilitiesInfo: string, variantCell: VariantCell = null) {
        if (this.loaded && this.isDirty()) {
            let message = this.variant.name + ' has changed and not saved. do you wish to save it now?';
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
                    this._open(variant, experiment, availableBranches, strInputSchemaSample, strUtilitiesInfo, variantCell);
                }
            });
        } else {
            this._open(variant, experiment, availableBranches, strInputSchemaSample, strUtilitiesInfo, variantCell);
        }
    }
    _open(variant: Variant, experiment: Experiment, availableBranches: AvailableBranches, strInputSchemaSample: string, strUtilitiesInfo: string, variantCell: VariantCell = null) {
        if (!variant.internalUserGroups) {
            variant.internalUserGroups = [];
        }
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.originalVariant = variant;
        this.loading = false;
        this.variant = Variant.clone(variant);
        this.experiment = Experiment.clone(experiment);
        this.title = this.getString("edit_variant_title");
        this.availableBranches = availableBranches;
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.variantCell = variantCell;
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.variant.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate = new Date(this.variant.creationDate);
        this.lastModificationDate = new Date(this.variant.lastModified);

        this.loaded = true;
        this.ruleTabActive = false;
        //this.hirarchyTabActive = false;
        this.descriptionTabActive = false;
        this.generalTabActive = true;

        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        if (!this.ruleInputSchemaSample || !this.ruleUtilitiesInfo) {
            this.inputSampleLoaded = false;
            this.loadAutoComplete(true);
        } else {
            this.inputSampleLoaded = true;
        }
        this.onShowFeature.emit(true);
    }

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || !this.ruleUtilitiesInfo) {
            this.inputSampleLoaded = true;
            this.loadAutoComplete();
        } else {
            this.loading = false;
        }
    }

    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let loadPhase2 = (result: boolean): void => {
            this._airLockService.getExperimentInputSample(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result3 => {
                this.ruleInputSchemaSample = result3 as string;
                loadPhase3(true);
            }).catch(error => {
                console.log('Error in getting Experiment  Input Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                loadPhase3(false);
            });
        }
        this._airLockService.getExperimentUtilitiesInfo(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result2 => {
            this.ruleUtilitiesInfo = result2 as string;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting experiment utilities info');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get experiments Utilities info ");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
        let loadPhase3 = (result4: boolean): void => {
            this._airLockService.getAvailableBranches(this.experiment.uniqueId).then(resultB => {
                this.availableBranches = resultB as AvailableBranches;
                this.loading = false;
                if (this.ruleUtilitiesInfo && this.ruleInputSchemaSample) {
                    this.inputSampleLoaded = true;
                }
            }).catch(error => {
                console.log('Error in getting experiment utilities info');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get experiments Utilities info ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
    }
    getBranchesForSelect(): any[] {
        var toRet = [];
        if (this.availableBranches) {
            for (var branch of this.availableBranches.availableInAllSeasons) {
                let selected = {
                    id: branch,
                    text: this.getBranchName(branch)
                };
                toRet.push(selected);
            }
        }
        return toRet;
    }

    setBranchesForSelect() {
        if (this.availableBranches) {
            for (var branch of this.availableBranches.availableInAllSeasons) {
                let selected = {
                    id: branch,
                    text: this.getBranchName(branch)
                };
                this.availableBranchesForSelect.push(selected);
            }
        }
    }

    selectBranchFromSelect(branchObj: any) {
        if (branchObj) {
            this.variant.branchName = branchObj.id;
        }
    }

    getBranchName(branchName: string) {
        if (!branchName) return null;
        let name = branchName;
        if (name == "MASTER") {
            name = "MAIN";
        }
        return name;
    }

    ruleUpdated(event) {
        this.variant.rule.ruleString = event;
    }


    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }

    defaultConfigurationUpdated(event) {

    }

    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
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


    openAceEditorRuleExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.variant.name;
        this.aceModalContainerDialog.showAceModal(this.variant.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
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
                this.descriptionTabActive = false;
                break;
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.ruleTabActive = true;
                this.descriptionTabActive = false;
                break;
            case  'Description':
                this.generalTabActive = false;
                this.ruleTabActive = false;
                this.descriptionTabActive = true;
                break;
        }
    }

    getInternalUserGroups() {
        return this.variant?.internalUserGroups;
    }

    openOnNewTab() {
        window.open('/#/pages/experi' +
            'ments/variants/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason()  + '/' + this._appState.getCurrentBranch() + '/' + this.variant
            .uniqueId);
    }
}



