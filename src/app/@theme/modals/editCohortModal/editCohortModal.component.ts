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
import {AnalyticsDataCollectionByFeatureNames} from "../../../model/analyticsExperiment";
import {Cohort} from "../../../model/cohort";
import {CohortExport} from "../../../model/cohortExport";
import {AirCohortsResponse} from "../../../model/airCohortsResponse";
import {CohortCell} from "../../airlock.components/cohortCell";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {ConfirmActionModal} from "../confirmActionModal";
import {ShowErrorModal} from "../showErrorModal";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {RenameCohortExportModal} from "../renameCohortExportModal";
import {GlobalState} from "../../../global.state";
import {LayoutService} from "../../../@core/utils";
import {SaveActionModal} from "../saveActionModal";
import {Stream} from "../../../model/stream";

@Component({
    selector: 'edit-cohort-modal',
    styleUrls: ['./editCohortModal.scss'],
    templateUrl: './editCohortModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditCohortModal {
    loading: boolean = false;
    @Input() product: Product;
    @Input() cohort: Cohort;
    @Input() allCohorts: Cohort[];
    @Input() rootFeatuteGroups: Array<Feature>;
    @ViewChild('general') generalTab;
    @ViewChild('queryTab') queryTab;
    @ViewChild('exportsTab') exportsTab;
    @Output() onEditCohort = new EventEmitter<any>();
    @Output() onShowCohort = new EventEmitter<any>();
    @Output() onRefreshCohort = new EventEmitter<any>();
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    //featurePath: Array<Feature> = [];
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    queryTabActive: boolean = true;
    exportsTabActive: boolean = true;
    private isShowHirarchy: boolean = false;
    private enableExportChanges: boolean = false;
    lastModificationDate: Date;
    lastExportDate: Date;
    cohortCell: CohortCell = null;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    showValueExpression: boolean = false;
    totalAnaliticsCount: number;
    assesedNumberOfUsers: number;
    tablesOptions: any[] = [];
    // tablesOptions: IMultiSelectOption[] = [];
    validatingQuery: boolean = false;
    validationResponse: AirCohortsResponse;
    dirtyMode: boolean = false;
    validationError: any = null;
    totalAnaliticsDevCount: number;
    originalCohort: Cohort;
    isExportEmpty: boolean = false;
    aceEditorRuleHeight: string = "150px";
    aceEditorAdditionalHeight: string = "80px";
    selectedExport: CohortExport;
    private sub: any = null;
    columnNames: any;
    calculatedColumnNames: any;
    selectedExportKey: string = "";
    possibleExportKeys = ["Amplitude", "UPS", "Braze", "DB Only"];
    exportKeys: string[];
    canUseAnalytics: boolean;
    // tablesSettings: IMultiSelectSettings = {
    //     pullRight: false,
    //     enableSearch: true,
    //     checkedStyle: 'checkboxes',
    //     buttonClasses: 'btn btn-default btn-secondary',
    //     selectionLimit: 0,
    //     closeOnSelect: false,
    //     autoUnselect: false,
    //     showCheckAll: true,
    //     showUncheckAll: true,
    //     fixedTitle: true,
    //     dynamicTitleMaxItems: 3,
    //     maxHeight: '300px',
    // };
    // tables: IMultiSelectTexts = {
    //     checkAll: 'Select all',
    //     uncheckAll: 'Clear all',
    //     checked: 'checked',
    //     checkedPlural: 'checked',
    //     searchPlaceholder: 'Search...',
    //     defaultTitle: 'Select Additional Tables',
    //     allSelected: 'Selected Tables: All',
    // };
    // statusDetailsStr:string;
    frequencyValues: string[] = ["MANUAL", "HOURLY", "DAILY", "WEEKLY", "MONTHLY"];
    modalHeight: string;
    modalWidth: string;

    constructor(private _airLockService: AirlockService,
                private _state:GlobalState,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                @Optional() private modalRef: NbDialogRef<EditCohortModal>,
                private modalService: NbDialogService
                ) {
        this.elementRef = elementRef;

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.canUseAnalytics = this._state.canUseAnalytics();
        this.isOpen = true;
        this.loading = false;
        if (this.cohort != null){
            this.originalCohort = Cohort.clone(this.cohort);
        }
        this.calculatedColumnNames = this.calculateColumnNames();
        this.tablesOptions = this.calculateTableOptions();
        this.title = this.getString("edit_cohort_title");
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        this.validatingQuery = false;
        this.dirtyMode = false;
        this.validationResponse = null;
        this.validationError = null;
        if (this.cohort?.queryAdditionalValue && this.cohort?.queryAdditionalValue.length > 0 && this.cohort?.queryAdditionalValue != "'true'") {
            this.showValueExpression = true;
        } else {
            this.showValueExpression = false;
        }
        if (this.cohort != null && (!this.cohort?.queryAdditionalValue || this.cohort?.queryAdditionalValue.length <= 0)) {
            this.cohort.queryAdditionalValue = "'true'";
        }
        this.assesedNumberOfUsers = null;

        this.calculateExportKeys();
        this.selectFirstExportIfExists();
        let exp = this.originalCohort?.exports[this.selectedExportKey];
        this.isExportEmpty = this.findIfExportIsEmpty(exp);
        this.isOnlyDisplayMode = !this._airLockService.isUserHasAnalyticsEditorRole();

        //change dates to better format
        if (this.cohort != null){
            this.creationDate = new Date(this.cohort.creationDate);
            this.lastModificationDate = new Date(this.cohort.lastModified);
        }

        //create groups combo box with tags
        // setTimeout(() => {
        //     var $exampleMulti = $$(".js_example").select2(
        //         {
        //             tags: true,
        //             tokenSeparators: [',', ' ']
        //         }
        //     );
        //     $$('.numberInput').trigger("change");
        // }, 100);

        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth= LayoutService.calculateModalWidth();

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.generalTabActive = true;
                this.queryTabActive = false;
                this.exportsTabActive = false;
                // if (this.aceModalContainerDialog) {
                //     this.aceModalContainerDialog.closeDontSaveDialog();
                // }
                this.onShowCohort.emit(true);
            });
        }
    }


    isDirty(): boolean {
        return this.cohort && this.originalCohort && !FeatureUtilsService.isCohortIdentical(this.cohort, this.originalCohort);
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
        this.cohort = null;
        this.generalTabActive = true;
        this.queryTabActive = false;
        this.exportsTabActive = false;
        this.isShowHirarchy = false;
        this.selectedExport = null;
        this.selectedExportKey = null;
        this.exportKeys = null;
        this.validationResponse = null;
        this.validationError = null;
        this.validatingQuery = false;

    }

    isValid() {
        if (this.cohort.name == null || this.cohort.name.length == 0) {
            return "name is required";
        }

        if (!this.cohort.queryCondition || this.cohort.queryCondition == "") {
            return "Cannot have empty query condition";
        }

        return "";
    }

    removeDuplicateSon(item: Feature, parentId: string, itemId: string) {
        if (item.uniqueId === parentId) {
            for (let i = 0; i < item.features.length; ++i) {
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

    isExportNameUsed(): string {
        let type = this.selectedExportKey;
        let name = this.getExportName(this.cohort);
        if (this.allCohorts && name != null && type != null) {
            for (let i = 0; i < this.allCohorts.length; i++) {
                let currCohort: Cohort = this.allCohorts[i];
                if (currCohort.uniqueId != this.cohort.uniqueId) {
                    let currType = this.getExportType(currCohort);
                    if (currType && currType == type) {
                        let currName = this.getExportName(currCohort);
                        if (currName && currName == name) {
                            return "Cohort with this " + type + " attribute name already exists. Do you want to save anyway?";
                        }
                    }
                }

            }
        }
        return "";
    }

    getExportName(cohort: Cohort): string {
        if (cohort.exports) {
            let exportKeys = Object.keys(cohort.exports);
            if (exportKeys.length > 0) {
                let key = exportKeys[0];
                let exp: CohortExport = cohort.exports[key];
                return exp.exportName;
            }
        }
        return null;
    }

    getExportType(cohort: Cohort): string {
        if (cohort.exports) {
            let exportKeys = Object.keys(cohort.exports);
            if (exportKeys.length > 0) {
                let key = exportKeys[0];
                return key;
            }
        }
        return null;
    }

    save(dontClose = false) {
        const validError: string = this.isValid();
        if (validError.length == 0) {
            let duplicateStr: string = this.isExportNameUsed();
            if (duplicateStr.length > 0) {
                let message = duplicateStr;
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed) {
                        this._save(dontClose);
                        this.modalRef.close();
                    }
                });
                // modalAlert.confirm()
                //     .title(message)
                //     .open()
                //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                //     .then(() => {
                //         this.doSave();
                //     }) // if were here ok was clicked.
                //     .catch(err => {
                //         this.loading = false;
                //         this.handleError(err);
                //     });
            } else {
                this.doSave(dontClose);
                this.modalRef?.close();
            }
        } else {
            this.create(validError);
        }
    }

    doSave(dontClose = false) {
        if (!this.cohort.enabled) {
            this._save(dontClose);
        } else {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    cohort: this.cohort,
                    text: this._stringsSrevice.getString("edit_cohort_alert"),
                    verifyModalDialogType: VerifyDialogType.COHORT_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._save(dontClose);
                }
            });
        }
    }

    showError() {
        this.modalService.open(ShowErrorModal, {
            closeOnBackdropClick: false,
            context: {
                errorStr: JSON.stringify(this.validationError, null, 2),
                text: "Validation Error"
            }
        })
    }

    showDetails() {
        console.log("showDetails");
        console.log(this.validationResponse);
        console.log(JSON.stringify(this.validationResponse, null, 2));
        this.modalService.open(ShowErrorModal, {
            closeOnBackdropClick: false,
            context: {
                errorStr: JSON.stringify(this.validationResponse, null, 2),
                text: "Validation Response"
            }
        });
        // this.errorModal.open(JSON.stringify(this.validationResponse, null, 2), "Validation Response");
    }

    _save(dontClose = false) {
        this.loading = true;
        if (!this.showValueExpression) {
            this.cohort.queryAdditionalValue = null;
        }
        if (this.dirtyMode) {
            this._airLockService.validateCohortQueryBeforeSave(this.cohort.productId, this.cohort.queryCondition, this.cohort.queryAdditionalValue, this.cohort.joinedTables, this.getExportType(this.cohort)).then((response) => {
                if (response && response.status && response.status == "COMPLETED") {
                    this.dirtyMode = false;
                    this._actuallySave(dontClose);
                } else {
                    this.loading = false;
                    console.log("error validating query:" + response);
                    this.create(response.status + ":" + response.statusMessage);
                }
            }).catch(
                error => {
                    console.log("error validating query:" + error);
                    this.handleError(error);
                }
            );
        } else {
            this._actuallySave(dontClose);
        }
    }

    _actuallySave(dontClose = false) {
        const cohortToUpdate: Cohort = this.cohort;
        let cohortStr = JSON.stringify(cohortToUpdate);
        console.log("cohortStr:", cohortStr);
        this._airLockService.updateCohort(cohortToUpdate).then(result => {
            this.loading = false;
            this.onEditCohort.emit(null);
            if (dontClose) {
                cohortToUpdate.lastModified = result.lastModified;
                this.refreshEditScreen(cohortToUpdate);
            } else {
                this.close()
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: Cohort) {
        this.originalCohort = Cohort.clone(updated);
        this.cohort = Cohort.clone(updated);
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
        const len = str.length;
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
        console.log("handleError in editFeatureModal:" + errorMessage);
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
        this.onShowCohort.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }

    assesUsers() {
        this.validatingQuery = true;
        this.validationError = null;
        this.validationResponse = null;
        this._airLockService.validateCohortQuery(this.cohort.productId, this.cohort.queryCondition, this.cohort.queryAdditionalValue, this.cohort.joinedTables, this.getExportType(this.cohort)).then((response) => {
            console.log("validationResponse:" + response);
            this.validationResponse = response;
            this.validatingQuery = false;
            this.dirtyMode = false;
        }).catch(
            error => {
                console.log("error validating query:" + error);
                this.validatingQuery = false;
                this.validationError = error.message;
            }
        );
    }

    hasValidResponse(): boolean {
        return this.validationResponse && this.validationResponse.status && this.validationResponse.status === "COMPLETED";
    }

    onTablesChange(event) {
        console.log(this.cohort.joinedTables);
        this.calculatedColumnNames = this.calculateColumnNames();
    }

    hasInvalidResponse(): boolean {
        return this.validationResponse && this.validationResponse.status && this.validationResponse.status === "FAILED";
    }

    open(cohort: Cohort, cohortCell: CohortCell = null, columnNames: string) {
        if (this.loaded && this.isDirty()) {
            let message = this.cohort.name + ' has changed and not saved. do you wish to save it now?';
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
                    this._open(cohort, cohortCell, columnNames);
                }
            });
        } else {
            this._open(cohort, cohortCell, columnNames);
        }
    }

    _open(cohort: Cohort, cohortCell: CohortCell = null, columnNames: string) {
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.columnNames = columnNames;
        this.cohort = Cohort.clone(cohort);
        this.originalCohort = Cohort.clone(cohort);
        this.calculatedColumnNames = this.calculateColumnNames();
        this.tablesOptions = this.calculateTableOptions();
        this.title = this.getString("edit_cohort_title");
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        this.cohortCell = cohortCell;
        this.validatingQuery = false;
        this.dirtyMode = false;

        this.validationResponse = null;
        this.validationError = null;
        if (this.cohort.queryAdditionalValue && this.cohort.queryAdditionalValue.length > 0 && this.cohort.queryAdditionalValue != "'true'") {
            this.showValueExpression = true;
        } else {
            this.showValueExpression = false;
        }
        if (!this.cohort.queryAdditionalValue || this.cohort.queryAdditionalValue.length <= 0) {
            this.cohort.queryAdditionalValue = "'true'";
        }
        this.assesedNumberOfUsers = null;

        this.calculateExportKeys();
        this.selectFirstExportIfExists();
        let exp = this.originalCohort.exports[this.selectedExportKey];
        this.isExportEmpty = this.findIfExportIsEmpty(exp);
        this.isOnlyDisplayMode = !this._airLockService.isUserHasAnalyticsEditorRole();

        //change dates to better format
        this.creationDate = new Date(this.cohort.creationDate);
        this.lastModificationDate = new Date(this.cohort.lastModified);
        this.loaded = true;
        this.queryTabActive = false;
        this.exportsTabActive = false;
        this.generalTabActive = true;
        this.onShowCohort.emit(true);
    }

    calculateColumnNames(): any {
        if (!this.columnNames) return null;
        let toRet = this.columnNames.users;
        if (this.cohort.joinedTables) {
            for (let i = 0; i < this.cohort.joinedTables.length; ++i) {
                let currTableName = this.cohort.joinedTables[i];
                let currTable = this.columnNames[currTableName];
                toRet = Object.assign({}, toRet, currTable);
            }
        }
        return toRet;
    }

    // calculateTableOptions(): IMultiSelectOption[] {
    //     let toRet = [];
    //     //[{id:"users.purchases", name:"purchases"},{id:"users.user_cohorts", name:"user_cohorts"}];
    //     if (this.columnNames) {
    //         let tableNames = Object.keys(this.columnNames);
    //         for (let i = 0; i < tableNames.length; ++i) {
    //             let currTableName = tableNames[i];
    //             if (currTableName != "users") {
    //                 toRet.push({id: currTableName, name: currTableName});
    //             }
    //
    //         }
    //     }
    //     return toRet;
    // }

    getWhitelistCount() {
        let count = 0;
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        return count;
    }

    queryConditionUpdated(event) {
        this.cohort.queryCondition = event;
        if (this.cohort.queryCondition != this.originalCohort.queryCondition || this.cohort.queryAdditionalValue != this.originalCohort.queryAdditionalValue) {
            this.dirtyMode = true;
        } else {
            this.dirtyMode = false;
        }
    }

    queryAdditionalValueUpdated(event) {
        this.cohort.queryAdditionalValue = event;
        if (this.cohort.queryCondition != this.originalCohort.queryCondition || this.cohort.queryAdditionalValue != this.originalCohort.queryAdditionalValue) {
            this.dirtyMode = true;
        } else {
            this.dirtyMode = false;
        }
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

    /*defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }
*/
    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    selectExport(i: number) {
        let key = this.exportKeys[i];
        this.selectExportItem(key);
    }

    selectExportItem(exportKey: string) {
        this.selectedExport = this.cohort.exports[exportKey];
        this.selectedExportKey = exportKey;
        if (this.selectedExport.lastExportTime && this.selectedExport.lastExportTime > 0) {
            this.lastExportDate = new Date(this.selectedExport.lastExportTime);
        } else {
            this.lastExportDate = null;
        }
    }

    removeCurrentExport() {
        if (this.isNewExportItem()) {
            this.cohort.exports[this.selectedExportKey] = null;
            delete this.cohort.exports[this.selectedExportKey];
            this.selectedExport = null;
            this.selectedExportKey = null;
            this.calculateExportKeys();
            this.selectFirstExportIfExists();
        } else {
            this.loading = true;
            this._airLockService.deleteCohortExport(this.cohort.uniqueId, this.selectedExportKey).then(result => {
                this.loading = false;
                this.refreshCohort();
            }).catch(error => {
                this.loading = false;
                this.handleError(error);
            });
        }
    }

    refreshCohort() {
        this.onRefreshCohort.emit(null);
        this.loading = true;
        this._airLockService.getCohort(this.cohort.uniqueId).then(result => {
            let cohort: Cohort = result;
            this.originalCohort = Cohort.clone(cohort);
            this.cohort = Cohort.clone(cohort);
            this.selectedExport = null;
            this.selectedExportKey = null;
            this.dirtyMode = false;
            this.calculateExportKeys();
            this.selectFirstExportIfExists();
            this.loading = false;
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    selectFirstExportIfExists() {
        if (this.exportKeys && this.exportKeys.length > 0) {
            let key = this.exportKeys[0];
            this.selectExportItem(key);
        }
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
        // this._notificationService.bare("Save failed", message);
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    isNewExportItem() {
        return this.isExportEmpty;
        // let exp = this.originalCohort.exports[this.selectedExportKey];
        // return !exp.exportName || exp.exportName.length <= 0;
    }

    exportNameFocus() {
        if (!this.selectedExport.exportName || this.selectedExport.exportName.length <= 0) {
            this.selectedExport.exportName = "air";
        }
    }

    findIfExportIsEmpty(exp: CohortExport) {
        return !exp || !exp.exportName || exp.exportName.length <= 0;
    }

    renameExportName() {
        this.modalService.open(RenameCohortExportModal, {
            closeOnBackdropClick: false,
            context: {
                text: "Renaming exportName will affect the export provider",
                title: "Attention",
                showDiscard: false,
                cohort: this.cohort,
                exportItem: this.selectedExport,
            }
        })

        // open(text: string = "Are you sure you want to perform this action?", cohort: Cohort, exportItem: CohortExport, title: string = "Attention", showDiscard: boolean = false) {
        //     this.text = text;
        //     this.title = title;
        //     this.showDiscard = showDiscard;
        //     this.cohort=cohort;
        //     this.exportItem=exportItem;
        //     this.cd.markForCheck();
        // }

        // this.sub = this.renameCohortExportModal.actionApproved$.subscribe(
        //     newExportName => {
        //         this.loading = true;
        //         this._airLockService.renameCohortExport(this.cohort.uniqueId, this.selectedExportKey, this.selectedExport.exportName, newExportName).then(result => {
        //             this.selectedExport.exportName = newExportName
        //             this.loading = false;
        //             this.refreshCohort();
        //         }).catch(error => {
        //             this.loading = false;
        //             this.handleError(error);
        //         });
        //     }
        // );
        // this.renameCohortExportModal.open("Renaming exportName will affect the export provider", this.cohort, this.selectedExport);
    }



    openAceEditorRuleExpand() {
        const expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.cohort.name;
    }

    noMoreExportsAvailable(): boolean {
        return this.exportKeys.length == this.possibleExportKeys.length;
    }

    hasExportKey(i: number) {
        let thisKey = this.possibleExportKeys[i];
        for (let key of this.exportKeys) {
            if (key == thisKey) return true;
        }
        return false;
    }

    addExportKey(i: number) {
        let thisKey = this.possibleExportKeys[i];
        let exportConfig = new CohortExport();
        this.cohort.exports[thisKey] = exportConfig;
        this.calculateExportKeys();
        this.selectExportItem(thisKey);
    }

    calculateExportKeys() {
        if (this.cohort != null) {
            this.exportKeys = Object.keys(this.cohort.exports);
        }
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

    // calculateTableOptions():IMultiSelectOption[] {
    calculateTableOptions() {
        let toRet = [];
        //[{id:"users.purchases", name:"purchases"},{id:"users.user_cohorts", name:"user_cohorts"}];
        if (this.columnNames) {
            let tableNames = Object.keys(this.columnNames);
            // for (let i=0; i< tableNames.length; ++i) {
            //     let currTableName = tableNames[i];
            //     if (currTableName != "users") {
            //         toRet.push({id:currTableName, name:currTableName});
            //     }
            //
            // }
        }
        return toRet;
    }

    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.queryTabActive = false;
                this.exportsTabActive = false;
                break;
            // this.generalTab.nativeElement.scrollIntoView({behavior: 'smooth'});
            case  'Query':
                this.generalTabActive = false;
                this.queryTabActive = true;
                this.exportsTabActive = false;
                break;
            case  'Exports':
                this.generalTabActive = false;
                this.queryTabActive = false;
                this.exportsTabActive = true;
                break;
        }
    }


    openOnNewTab() {
        window.open('/#/pages/cohorts/' + this._state.getCurrentProduct() + '/' + this._state.getCurrentSeason()+'/' + this._state.getCurrentBranch() + '/' + this.cohort
            .uniqueId);
    }
}



