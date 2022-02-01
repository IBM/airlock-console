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
import {AnalyticsExperimentQuota} from "../../../model/analyticsQuota";
import {Feature} from "../../../model/feature";
import {Product} from "../../../model/product";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Experiment} from "../../../model/experiment";
import {AnalyticsDataCollectionByFeatureNames, AnalyticsExperiment} from "../../../model/analyticsExperiment";
import {AceExpandDialogType} from "../../../app.module";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {ExperimentCell} from "../../experimentCell";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {LayoutService} from "../../../@core/utils";
import {SaveActionModal} from "../saveActionModal";
import {Stream} from "../../../model/stream";

@Component({
    selector: 'edit-experiment-modal',
    styleUrls: ['./editExperimentModal.scss'],
    templateUrl: './editExperimentModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditExperimentModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('general') generalTab;
    @ViewChild('rule') ruleTab;
    @ViewChild('description') descriptionTab;
    @ViewChild('analytics') analyticsTab;
    @Input() product: Product;
    @Input() rootFeatureGroups: Array<Feature>;
    @Input() rootId: string;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() visible = false;
    @Output() onEditExperiment = new EventEmitter<any>();
    @Output() onShowExperiment = new EventEmitter<any>();
    @Output() onClose = new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate: EventEmitter<any> = new EventEmitter();
    inlineMode: boolean = false;
    loading: boolean = false;
    experiment: Experiment;
    originalExperiment: Experiment;
    possibleGroupsList: Array<any> = [];
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    descriptionTabActive: boolean = false;
    ruleTabActive: boolean = false;
    analyticsTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    experimentCell: ExperimentCell = null;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    inputSampleLoaded = false;
    minAppVersionForSample = "";
    stageForSample = null;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    analyticsExperiment: AnalyticsExperiment;
    totalCountQuota: number;
    totalAnaliticsCount: number;
    totalAnaliticsDevCount: number;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    private sub: any = null;
    canUseAnalytics: boolean;
    modalHeight: string;
    modalWidth: string;

    constructor(private _airlockService: AirlockService,
                private _state: GlobalState,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<EditExperimentModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
        this.possibleGroupsList = _appState.getAvailableGroups();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    isDirty(): boolean {
        return this.experiment && this.originalExperiment && !FeatureUtilsService.isExperimentIdentical(this.experiment, this.originalExperiment);
    }

    ngOnInit() {
        this.canUseAnalytics = this._state.canUseAnalytics();
        this.isOpen = true;
        this.loading = false;
        this.title = this.getString("edit_experiment_title");
        console.log("this.analyticsExperiment", this.analyticsExperiment);
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        this.isOnlyDisplayMode = (this._airlockService.isViewer() || (this._airlockService.isEditor() && this.experiment?.stage == "PRODUCTION"));
        this.creationDate = new Date(this.experiment?.creationDate);
        this.lastModificationDate = new Date(this.experiment?.lastModified);
        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth = LayoutService.calculateModalWidth();

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.ruleTabActive = false;
                this.analyticsTabActive = false;
                this.descriptionTabActive = false;
                this.generalTabActive = true;
                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowExperiment.emit(true);
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
        this.experiment = null;
        this.originalExperiment = null;
        this.generalTabActive = true;
        this.descriptionTabActive = false;
        this.ruleTabActive = false;
        this.analyticsTabActive = false;
        this.isShowHirarchy = false;

    }

    isValid() {
        if (this.experiment.name == null || this.experiment.name.length == 0) {
            return "name is required";
        }
        if (this.experiment.minVersion) {
            this.experiment.minVersion = this.experiment.minVersion.trim();
        }
        if (this.experiment.stage == "PRODUCTION" && !this.experiment.minVersion) {
            return "Cannot remove minimum app version in production"
        }

        try {
            if (this._isMinVersionGreaterThanMaxSeason()) {
                return this.getString("edit_experiment_error_min_experiment_bigger_max_version");
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
        return "";
    }

    _isMinVersionGreaterThanMaxSeason(): boolean {
        var minAppArr = this.experiment.minVersion.split('.');
        var maxSeasonArr = this.experiment.maxVersion.split('.');
        let maxNum = Math.max(minAppArr.length, maxSeasonArr.length);
        for (var i = 0; i < maxNum; i++) {
            var minAppNum = 0;
            if (i < minAppArr.length) {
                minAppNum = Number(minAppArr[i]);
            }
            var maxSeasonNum = 0;
            if (i < maxSeasonArr.length) {
                maxSeasonNum = Number(maxSeasonArr[i]);
            }
            if (!maxSeasonNum || !minAppNum) {
                return false;
            }

            if (minAppNum > maxSeasonNum) {
                return true;
            } else if (minAppNum < maxSeasonNum) {
                return false;
            }
        }
        return true;
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
            if (this.experiment.stage == 'DEVELOPMENT' && (this.experiment.internalUserGroups == null || this.experiment.internalUserGroups.length <= 0)) {
                let message = 'This experiment will not be visible to users because no user groups are specified. Are you sure want to continue?';
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
                if (this.experiment.stage == 'PRODUCTION') {
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            experiment: this.experiment,
                            text: this._stringsSrevice.getString("edit_change_production_experiment"),
                            verifyModalDialogType: VerifyDialogType.EXPERIMENT_TYPE,
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
        if (!this.experiment.internalUserGroups) {
            this.experiment.internalUserGroups = [];
        }

        var experimentToUpdate: Experiment = this.experiment;
        experimentToUpdate.rolloutPercentage = Number(experimentToUpdate.rolloutPercentage);
        let experimentStr = JSON.stringify(experimentToUpdate);
        console.log("experimentStr:", experimentStr);
        this._airlockService.updateExperiment(experimentToUpdate).then(result => {
            this.loading = true;
            this.onEditExperiment.emit(null);
            if (dontClose) {
                experimentToUpdate.lastModified = result.lastModified;
                this.refreshEditScreen(experimentToUpdate);
                if (callback) {
                    callback(true);
                }
            } else {
                this.onClose.emit();
                this.close();
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: Experiment) {
        this.originalExperiment = updated;
        this.experiment = Experiment.clone(updated);
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
        this.onShowExperiment.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close();
        this.inlineMode = false;
        this.onClose.emit();
    }

    canMoveOn(callback: (answer: boolean) => any) {
        if (this.loaded && this.isDirty()) {
            let message = this._featureUtils.getExperimentDisplayName(this.experiment) + ' has changed and not saved. do you wish to save it now?';
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
                    this.refreshEditScreen(this.originalExperiment);
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
    }

    open(experiment: Experiment, analyticsExperimentQuota: AnalyticsExperimentQuota, strInputSchemaSample: string, strUtilitiesInfo: string, analyticsExperiment: AnalyticsExperiment, experimentCell: ExperimentCell = null) {
        if (this.loaded && this.isDirty()) {
            let message = this._featureUtils.getExperimentDisplayName(this.experiment) + ' has changed and not saved. do you wish to save it now?';
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
                    this._open(experiment, analyticsExperimentQuota, strInputSchemaSample, strUtilitiesInfo, analyticsExperiment, experimentCell);
                }
            });
        } else {
            this._open(experiment, analyticsExperimentQuota, strInputSchemaSample, strUtilitiesInfo, analyticsExperiment, experimentCell);
        }
    }
    _open(experiment: Experiment, analyticsExperimentQuota: AnalyticsExperimentQuota, strInputSchemaSample: string, strUtilitiesInfo: string, analyticsExperiment: AnalyticsExperiment, experimentCell: ExperimentCell = null) {
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.originalExperiment = experiment;
        this.experiment = Experiment.clone(experiment);
        this.title = this.getString("edit_experiment_title");
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.analyticsExperiment = analyticsExperiment;
        console.log("this.analyticsExperiment", this.analyticsExperiment);
        this.totalCountQuota = analyticsExperimentQuota?.analyticsQuota;
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        this.experimentCell = experimentCell;
        this.isOnlyDisplayMode = (this._airlockService.isViewer() || (this._airlockService.isEditor() && this.experiment.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate = new Date(this.experiment.creationDate);
        this.lastModificationDate = new Date(this.experiment.lastModified);
        this.loaded = true;
        this.ruleTabActive = false;
        this.analyticsTabActive = false;
        this.descriptionTabActive = false;
        this.generalTabActive = true;
        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        this.onShowExperiment.emit(true);

        let loadAutoCompletePhase = (result: boolean): void => {
            this.loading = false;
            if (!this.ruleUtilitiesInfo || ! this.ruleInputSchemaSample) {
                this.inputSampleLoaded = false;
                this.loadAutoComplete(true);
            } else {
                this.inputSampleLoaded = true;
                this.minAppVersionForSample = this.experiment.minVersion;
                this.stageForSample = this.experiment.stage;
            }
        }
        let loadPhase2 = (result: boolean): void => {
            this._airlockService.getAnalyticsForDisplayExperiment(this.experiment.uniqueId).then(result1 => {
                this.analyticsExperiment = result1;
                loadAutoCompletePhase(true);
            }).catch(error => {
                console.log('Error in getting stream  Input Sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get analytics for display Input Sample Schema ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                loadAutoCompletePhase(false);
            });
        }
        if (this.analyticsExperiment == null || !this.totalCountQuota) {
            this.loading = true;
            this._airlockService.getExperimentQuota(this.experiment.uniqueId).then(result => {
                let analyticsExperimentQuota1 = result;
                this.totalCountQuota = analyticsExperimentQuota1.analyticsQuota;
                loadPhase2(true);
            }).catch(error => {
                console.log('Error in getting Experiments quota');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get experiment quota");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                loadPhase2(false);
            });
        } else {
            loadAutoCompletePhase(true);
        }
    }

    getWhitelistCount() {
        let count = 0;
        if (this.analyticsExperiment) {
            count = this.analyticsExperiment.productionItemsReportedToAnalytics;
        }
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        if (this.analyticsExperiment) {
            count = this.analyticsExperiment.developmentItemsReportedToAnalytics;
        }
        return count;
    }

    ruleUpdated(event) {
        this.experiment.rule.ruleString = event;
    }

    showAnaliticsHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.lal9wm6w3zm7');
    }

    isFeatureSendToAnalytics(feature: AnalyticsDataCollectionByFeatureNames) {
        return feature.sendToAnalytics;
    }

    isFeatureExistInAllBranches(feature: AnalyticsDataCollectionByFeatureNames) {
        if (feature && feature.branches != undefined) {
            return false;
        } else
            return true;
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

    create(message: string) {
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    openAceEditorRuleExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.experiment.name;
        this.aceModalContainerDialog.showAceModal(this.experiment.rule.ruleString,
            expandDialogTitle,
            this.ruleInputSchemaSample,
            this.ruleUtilitiesInfo,
            AceExpandDialogType.FEATURE_RULE,
            this.isOnlyDisplayMode);
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
                this.analyticsTabActive = false;
                break;
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.ruleTabActive = true;
                this.descriptionTabActive = false;
                this.analyticsTabActive = false;
                break;
            case  'Description':
                this.generalTabActive = false;
                this.ruleTabActive = false;
                this.descriptionTabActive = true;
                this.analyticsTabActive = false;
                break;
            case  'Analytics':
                this.generalTabActive = false;
                this.ruleTabActive = false;
                this.descriptionTabActive = false;
                this.analyticsTabActive = true;
                break;
        }
    }

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || !this.ruleUtilitiesInfo ||
            this.minAppVersionForSample != this.experiment.minVersion ||
            this.stageForSample != this.experiment.stage) {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.experiment.minVersion;
            this.stageForSample = this.experiment.stage;
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
            this._airlockService.getExperimentInputSample(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result3 => {
                this.ruleInputSchemaSample = result3 as string;
                this.loading = false;
                if (this.ruleUtilitiesInfo) {
                    this.stageForSample = this.experiment.stage;
                    this.minAppVersionForSample = this.experiment.minVersion;
                    this.inputSampleLoaded = true;
                }
            }).catch(error => {
                console.log('Error in getting Experiment  Input Sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
        this._airlockService.getExperimentUtilitiesInfo(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result2 => {
            this.ruleUtilitiesInfo = result2 as string;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting experiment utilities info');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get experiments Utilities info ");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
    }
    getInputFieldsForAnalytics() {
        if (this.analyticsExperiment == null) {
            this.loading = true;
            this._airlockService.getExperimentQuota(this.experiment.uniqueId).then(result => {
                let analyticsExperimentQuota = result;
                this._airlockService.getAnalyticsForDisplayExperiment(this.experiment.uniqueId).then(result1 => {
                    this.analyticsExperiment = result1;
                    this.loading = false;
                });
            });
        } else return this.analyticsExperiment.inputFieldsForAnalytics;
    }

    openOnNewTab() {
        window.open('/#/pages/experiments/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason() + '/' + this._appState.getCurrentBranch() + '/' + this.experiment
            .uniqueId);
    }
}



