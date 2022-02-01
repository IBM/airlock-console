import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import {Feature} from "../../../model/feature";
import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {FeatureAnalyticAttributes} from "../../../model/analytic";
import {DatePipe} from "@angular/common";
import {Cohort} from "../../../model/cohort";
import {CohortExport} from "../../../model/cohortExport";
import {CohortStatusDetails} from "../../../model/cohortStatusDetails";
import {NbDialogService, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {EditCohortModal} from "../../modals/editCohortModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";

@Component({
    providers: [FeatureUtilsService, DatePipe],
    selector: 'cohort-cell',
    // styleUrls: ['./style.scss'],
    styleUrls: ['./cohortCell.scss', './dnd.scss', './animations.scss'],
    templateUrl: './cohortCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CohortCell {
    @ViewChild('cohortCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

    @Input() cohort: Cohort;
    @Input() level: number = 0;
    @Input() showConfig: boolean;
    @Input() showDisabled: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() openCohorts: Array<string> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedId: string = "";
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDummySearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditInline: EventEmitter<Cohort> = new EventEmitter<Cohort>();

    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    insideMX: boolean = false;
    remove: boolean = true;
    userRole: string = "";
    userEmail: string = "";
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    ruleInputSchemaSample: string;
    exportsItems = [{"key": "Localytics", "value": null}, {"key": "Amplitude", "value": null}, {
        "key": "Braze",
        "value": null
    }];
    highlighted = '';
    dashboardIcon: string = "tachometer-running-6";
    featureAnalyticAttributes: FeatureAnalyticAttributes;
    ruleUtilitieInfo: string;
    public status: { isopen: boolean } = {isopen: false};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private _datePipe: DatePipe,
                private _toastrService: NbToastrService,
                private modalService: NbDialogService) {
        this.userRole = this._airlockService.getUserRole();
        this.userEmail = this._airlockService.getUserEmail();
        this.nextLevel = this.level + 1;
        if (this.level == 0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
    }

    // importFeature(){
    //     this.importFeaturesModal.open(false,this.variant);
    // }
    // pasteFeature(){
    //     this.importFeaturesModal.open(true,this.variant);
    // }
    createError(message: string) {
        this._toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            //toastClass: 'airlock-toast simple-webhook bare toast',
            // titleClass: 'airlock-toast-title',
            // messageClass: 'airlock-toast-text',
        });

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }

    getMXTitle(): string {
        return this._stringsSrevice.getString("experiment_cell_variants_title");
    }

    isShowCopy() {
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions() {
        return !this.isViewer();

    }

    isShowChangeEnableState() {
        return !this.isViewer();
    }

    changeEnableState() {
        this.popover.hide();
        let cohortToUpdate = Cohort.clone(this.cohort);
        let isActionEnable = !this.isEnabled();
        this.changeEnabledState(cohortToUpdate, isActionEnable);
        this.beforeUpdate.emit(null);
        this._airlockService.updateCohort(cohortToUpdate).then(result => {
            let str = "disabled";
            if (isActionEnable) {
                str = "enabled";
            }
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Cohort " + str + " successfully"
            });
            this.onUpdate.emit(result);
        }).catch(error => {
            this.onUpdate.emit(null);
            this.handleError(error);
        });

    }

    handleError(error: any) {
        if (error == null) {
            return;
        }

        var errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log(error);
        this.create(errorMessage);
    }

    create(message: string) {
        this._toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            //toastClass: 'airlock-toast simple-webhook bare toast',
            // titleClass: 'airlock-toast-title',
            // messageClass: 'airlock-toast-text',
        });

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

    changeEnabledState(cohort: Cohort, enabledValue: boolean) {
        cohort.enabled = enabledValue;
        let keys = Object.keys(this.getExports());
        keys.forEach((key) => {
            let value = this.cohort.exports[key];
            value.exportEnabled = enabledValue
        });
    }

    getSelectedExportKey(): string {
        if (!this.cohort) return "";
        let exportKeys = Object.keys(this.cohort.exports);
        if (exportKeys.length > 0) {
            return exportKeys[0];
        }
        return "";
    }

    getStatuses() {
        let toRet = [];
        let exp = this.getFirstExportData();
        if (exp) {
            toRet = Object.values(exp.statuses);
        }
        return toRet;
    }

    hasFailedUsers(exportItem: CohortExport) {
        let toRet = false;
        if (exportItem.statuses) {
            let statuses = Object.values(exportItem.statuses);
            if (statuses) {
                for (let i = 0; i < statuses.length; i++) {
                    let status: CohortStatusDetails = statuses[i];
                    if (status.failedImports && status.failedImports > 0) {
                        return true;
                    }
                }
            }

        }
    }

    getFailedUsers(exportItem: CohortExport): number {
        let toRet = 0;
        if (exportItem.statuses) {
            let statuses = Object.values(exportItem.statuses);
            if (statuses) {
                for (let i = 0; i < statuses.length; i++) {
                    let status: CohortStatusDetails = statuses[i];
                    if (status.failedImports && status.failedImports > 0) {
                        toRet += status.failedImports;
                    }
                }
            }

        }
        return toRet;
    }

    getSuccessfulUsers(exportItem: CohortExport): number {
        let toRet = 0;
        if (this.getSelectedExportKey() == "UPS") {
            toRet += exportItem.exportStatusDetails.successfulImports;
        } else if (exportItem.statuses) {
            let statuses = Object.values(exportItem.statuses);
            if (statuses) {
                for (let i = 0; i < statuses.length; i++) {
                    let status: CohortStatusDetails = statuses[i];
                    if (status.successfulImports && status.successfulImports > 0) {
                        toRet += status.successfulImports;
                    }
                }
            }

        }
        return toRet;
    }

    getExportColor() {
        let key = this.getSelectedExportKey();
        if (key == "Localytics") {
            return "#0005b6";
        } else {
            return "#008bb6"
        }
    }

    isEnabled(): boolean {
        let cohortEnabled = this.cohort.enabled;
        let exportsEnabled = true;
        let keys = Object.keys(this.getExports());
        keys.forEach((key) => {
            let value = this.cohort.exports[key];
            if (!value.exportEnabled) {
                exportsEnabled = false;
            }
        });
        return cohortEnabled && exportsEnabled;
    }

    isStatusEnabled(): boolean {
        let cohortEnabled = this.cohort.enabled;
        return cohortEnabled;
    }

    canEnable(): boolean {
        let toRet = true;
        let keys = Object.keys(this.getExports());
        keys.forEach((key) => {
            let value: CohortExport = this.cohort.exports[key];
            if (!value.exportName || value.exportName.length <= 0) {
                toRet = false;
            }
        });
        return toRet;
    }

    isShowIndex() {
        return this.isShowOptions() && this.canClickStartIndexing();
    }

    canDoActionInProduction(): boolean {
        return true;
    }


    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.cohort);
    }

    isShowReleaseToProduction() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false) && this.partOfBranch();
    }

    isShowSendToAnalytic() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isFeatureSendToAnalytics() {
        // if (this.variant.sendToAnalytics === true)
        //     return true;
        // else
        return false;
    }

    isExperiment(): boolean {
        return true;
    }

    showExpand(): boolean {
        return true;
    }

    shouldStyleAsMTX(): boolean {
        return false;
    }

    hasDashboard(): boolean {
        return this.getFirstExportData() != null;
    }

    isAnalyticsViewer(): boolean {
        return this._airlockService.isUserHasAnalyticsViewerRole();
    }

    performExport() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this._airlockService.exportCohort(this.cohort).then(cohort => {
            this.cohort = cohort;
            this.onUpdate.emit(this.cohort);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Export process started"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to start export process. Please try again.";
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    isIndexingPaused(): boolean {
        return;
    }

    getDashboardColor(): string {

        if (!this.hasDashboard()) {
            return "rgba(72, 76, 79, 0.3)";
        }
        // if (!this.cohort.indexingInfo || !this.cohort.indexExperiment || this.cohort.indexingInfo.indexingProgress || this.cohort.indexingInfo.indexingProgress.totalNumberOfBuckets <= 0) {
        //     return "rgba(72, 76, 79, 1.0)";
        // }
        // let percentage = 100.0* this.cohort.indexingInfo.indexingProgress.numberOfDoneBuckets/ this.cohort.indexingInfo.indexingProgress.totalNumberOfBuckets;
        // if (percentage <= 20.0) {
        //     return "rgba(red,0.8)";
        // } else if (percentage <= 40.0) {
        //     return "rgba(yellow,0.8)";
        // } else if (percentage <= 60.0) {
        //     return "rgba(darkseagreen,0.8)";
        // } else {
        //     return "rgba(green,0.8)"
        // }
    }

    getDashboardIconForExport(item: CohortExport): string {
        if (!this.hasStatusData()) {
            return "tachometer-disabled";
        }
        if (!item || !item.exportStatusDetails || item.exportStatusDetails.totalImports <= 0) {
            return "tachometer";
        }
        let exportData = item;
        let sumSuccessful = this.getSuccessfulUsers(item);
        if (sumSuccessful == 0 && this.isOldCohortsStyle(exportData)) {
            sumSuccessful = exportData.exportStatusDetails.successfulImports;
        }
        let percentage = 100.0 * sumSuccessful / exportData.exportStatusDetails.totalImports;
        if (percentage <= 20.0) {
            return "tachometer-running-1";
        } else if (percentage <= 33.0) {
            return "tachometer-running-2";
        } else if (percentage <= 50.0) {
            return "tachometer-running-3";
        } else if (percentage <= 67.0) {
            return "tachometer-running-4";
        } else if (percentage <= 84.0) {
            return "tachometer-running-5";
        } else {
            return "tachometer-running-6"
        }
    }

    isOldCohortsStyle(exportData: CohortExport): boolean {
        if (!exportData || !exportData.statuses || !Object.keys(exportData.statuses) || Object.keys(exportData.statuses).length <= 0) {
            return true;
        }
        return false;
    }

    isItOldCohortStyle(): boolean {
        let exp = this.getFirstExportData();
        if (exp) {
            return this.isOldCohortsStyle(exp);
        }
        return false;
    }

    getDashboardIcon(): string {

        if (!this.getSelectedExportKey() || this.getSelectedExportKey() === "") {
            return "tachometer";
        }
        let exportData = this.getFirstExportData();
        if (!exportData || !exportData.exportStatusDetails || exportData.exportStatusDetails.totalImports <= 0) {
            return "tachometer";
        }
        let sumSuccessful = this.getSuccessfulUsers(exportData);
        if (sumSuccessful == 0 && this.isOldCohortsStyle(exportData)) {
            sumSuccessful = exportData.exportStatusDetails.successfulImports;
        }
        let percentage = 100.0 * sumSuccessful / exportData.exportStatusDetails.totalImports;
        if (percentage <= 20.0) {
            return "tachometer-running-1";
        } else if (percentage <= 33.0) {
            return "tachometer-running-2";
        } else if (percentage <= 50.0) {
            return "tachometer-running-3";
        } else if (percentage <= 67.0) {
            return "tachometer-running-4";
        } else if (percentage <= 84.0) {
            return "tachometer-running-5";
        } else {
            return "tachometer-running-6"
        }
    }

    getListedExported() {
        var toRet = [];
        let exports = this.getExports();
        let keys = Object.keys(exports);
        for (let key of keys) {
            let obj = {"key": key, "value": exports[key]};
            toRet.push(obj);
        }
        return toRet;
    }

    getFirstExportData(): CohortExport {
        let keys = Object.keys(this.getExports());
        let toRet = null;
        keys.forEach((key) => {
            let value = this.cohort.exports[key];
            if (!toRet) {
                toRet = value;
            }
        });
        return toRet;
    }

    getExports() {
        if (this.cohort.exports) {
            return this.cohort.exports;
        } else {
            return {};
        }
    }

    private setCookie(name: string, value: string, expireDays: number, path: string = '', domain: string = '') {
        let d: Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires: string = `expires=${d.toUTCString()}`;
        let cpath: string = path ? `; path=${path}` : '';
        let cdomain: string = domain ? `; domain=${domain}` : '';
        let str: string = `${name}=${value}; ${expires}${cpath}${cdomain};`;
        document.cookie = str;
    }

    getSharedDomainPart(url1: string) {
        var curDomain = window.location.hostname;
    }

    showDashboard() {
    }

    getRunningMessage(): string {
        if (this.cohort.usersNumber && this.cohort.usersNumber > 0) {
            return this.numberWithCommas(this.cohort.usersNumber) + " users";
        } else if (this.cohort.usersNumber && this.cohort.usersNumber <= 0) {
            return "No users";
        }
        return "Unknown until first export";
        // if (this.cohort.indexingInfo && this.cohort.indexingInfo.startDate) {
        //     // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
        //     return "Running for "+moment(this.cohort.indexingInfo.startDate).fromNow(true);
        // } else {
        //     return "Not running";
        // }
    }

    numberWithCommas(x) {
        let ret = x.toString();
        ret = ret.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return ret;
    }

    getStatusMessage(): string {
        if (this.cohort != null) {
            return this.cohort.calculationStatusMessage;
        }
        return "";
        // if (this.cohort.indexingInfo && this.cohort.indexingInfo.endDate) {
        //     // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
        //     return "Indexed up to "+this._datePipe.transform(this.cohort.indexingInfo.endDate,"MMM dd, yyyy, h:mm a");
        // } else {
        //     return "";
        // }
    }

    hasStatusData(): boolean {
        let hasData = false;
        let keys = Object.keys(this.getExports());
        keys.forEach((key) => {
            let value = this.cohort.exports[key];
            if (value.exportStatusDetails != null) {
                hasData = true;
                return true;
            }
        });
        return hasData;
    }

    hasStatusDataForItem(item: CohortExport): boolean {
        return item && item.exportStatusDetails != null;
        // return (this.cohort.indexingInfo && this.cohort.indexingInfo.indexingProgress && this.cohort.indexingInfo.indexingProgress.totalNumberOfBuckets >= 0);
    }

    getLastIndexedPopover(): string {
        return "getLastIndexedPopover";
        // if (this.cohort.indexingInfo && this.cohort.indexingInfo.endDate) {
        //     // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
        //     return moment(this.cohort.indexingInfo.endDate).fromNow();
        // } else {
        //     return null;
        // }
    }

    getLastIndexedTitle(): string {
        return "Last Indexed Title";
        // if (this.cohort.indexingInfo && this.cohort.indexingInfo.endDate) {
        //     // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
        //     return "Last indexed"
        // } else {
        //     return "Not indexed";
        // }
    }

    isSendingSomethingToAnalytics(): boolean {
        return false;
    }

    getMissingDashboardTooltip(): string {
        return "getMissingDashboardTooltip";
        // if (this.hasDashboard()) {
        //     return "Click to view dashboard"
        // } else {
        //     var message = "Dashboard not available";
        //     if (this.cohort.indexingInfo && this.cohort.indexingInfo.missingDashboardExplanation && this.cohort.indexingInfo.missingDashboardExplanation.length > 0) {
        //         message += ": " + this.cohort.indexingInfo.missingDashboardExplanation;
        //     }
        //     return message;
        // }

    }

    getStatusTooltip(): string {
        if (this.cohort && this.cohort.calculationStatus) {
            return this.getStatusFor(this.cohort.calculationStatus);
        }
        return "Status not available";
        // if (this.isAnalyticsViewer() && this.hasDashboard()) {
        //     return "Click to view dashboard";
        // } else if (!this.isAnalyticsViewer() && this.hasDashboard()) {
        //     return "Not enough permissions to view dashboard";
        // }

    }

    getExportStatus(): string {
        if (this.cohort) {
            let exp = this.getFirstExportData();
            if (exp) {
                return exp.exportStatusDetails.status;
            }
        }
        return null;
    }

    getStatusFor(status: string): string {
        if (!status) return "";
        if (status == "PENDING") {
            return "Waiting in Queue"
        } else {
            return status;
        }
    }

    getExportStatusTooltip(): string {
        if (this.shouldSuggestExport()) {
            return this.getStartExportTooltip();
        }
        if (this.cohort && this.cohort.calculationStatus) {
            let status = "Calculation: " + this.getStatusFor(this.cohort.calculationStatus);
            if (this.isExportRunning()) {
                status += "\n Export status: RUNNING";
            } else if (this.isExportPending()) {
                status += "\n Export status: PENDING";
            }
            return status;
        }
        return "Status not available";
    }

    capitalize(word) {
        if (!word) return "";
        return word[0].toUpperCase() + word.slice(1).toLowerCase();
    }

    getRelevantExportKeys(): string {
        let exports = this.getExports();
        let keys = Object.keys(exports);
        let toRet = "";
        let isFirst = true;
        for (let key of keys) {
            let config: CohortExport = exports[key];
            if (config.exportEnabled) {

                if (!isFirst) {
                    toRet += ", ";
                }
                toRet += key;
                isFirst = false;
            }
        }
        return toRet;
    }

    getStartExportTooltip(): string {
        return "Export cohort to:" + this.getRelevantExportKeys();
    }

    getTooltipForPausedIndexing(): string {
        return this._stringsSrevice.getString('experiment_indexing_was_paused');
    }

    getTooltipForWhyUserCantDoAction(): string {
        // if (!(this.cohort.ranges != null && this.cohort.ranges.length > 0)){
        //     if(this.cohort.variants == null || this.cohort.variants.length <=0){
        //         return this._stringsSrevice.getString('experiment_cant_start_indexing_variants');
        //     }else{
        //         if(!this.cohort.enabled){
        //             return this._stringsSrevice.getString('experiment_cant_start_indexing_enable');
        //         }else{
        //             return this._stringsSrevice.getString('experiment_cant_start_indexing_old_version');
        //         }
        //     }
        // }else{
        //     return this.getMissingDashboardTooltip();
        // }
        return "";
    }

    _isSendingExtraStuffToAnalytics(): boolean {
        return false;
    }

    _hasConfigurationsToAnalytics() {
        return false;
    }

    _isConfigInAnalytics(configRule: Feature): boolean {
        if (configRule.sendToAnalytics) {
            return true;
        }
        for (let subConf of configRule.configurationRules) {
            if (this._isConfigInAnalytics(subConf)) {
                return true;
            }
        }
        return false;
    }

    analyticsTooltip(): string {
        return "Status being sent to analytics";
    }

    isViewer(): boolean {
        return !this._airlockService.isUserHasAnalyticsEditorRole();
    }

    isEditor() {
        return this._airlockService.isUserHasAnalyticsEditorRole();
    }


    isShowReorderConfig() {
        return (!this.isViewer());
    }

    public updateFeature(newFeature: Feature) {
        // console.log("updateFeature");
        // console.log(newFeature);
        // Feature.cloneToFeature(newFeature,this.variant);
        // setTimeout(() => {
        //     this.tick = !this.tick;
        //     this.cd.markForCheck(), 0.5
        // });
    }

    getParentConfiguration(): Feature {
        // let parent = Feature.clone(this.variant)
        // parent.type = "CONFIG_MUTUAL_EXCLUSION_GROUP";
        // parent.configurationRules = this.getConfigs();
        // return parent;
        return null;
    }

    isShowAddConfiguration() {
        return (!this.isViewer());
    }
        // this.refreshIndexingInfo(); //DELETE ME after we will get the indexing data the first time
    // }

    isShowAddToBranch() {
        return !this.partOfBranch();
    }

    isPartOfBranch(): boolean {
        return true; //this.variant && this.variant.branchStatus && (this.variant.branchStatus=="CHECKED_OUT" || this.variant.branchStatus=="NEW");
    }

    partOfBranch() {
        return true;
    }

    isDeleted() {

    }

    addToBranch() {

    }

    removeFromBranch() {

    }

    ngOnChanges() {
    }

    reorder() {
        // this.reorderVariantsModal.open(this.cohort);
    }

    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }
    }

    getMasterTooltip(): string {
        return this.getString('experiment_cell_master_variant')
    }

    getFeatureFollowTooltip(isfollowed: boolean) {
        if (!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if (isfollowed) {
            return this.getString("notifications_unfollow_tooltip");
        } else {
            return this.getString("notifications_follow_tooltip");
        }
    }

    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256," + opac + ")";
        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133," + startPoint + ")";
            } else {
                toRet = "rgba(237, 245, 197," + startPoint + ")";
            }

        }
        return toRet;
    }

    public mySelected(obj: any) {
        this.onSelected.emit(obj);
    }

    getMasterBackgroundStyle() {
        var level = this.level + 1;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        let startPoint = this.partOfBranch() ? 1.0 : 0.5;
        var opac = startPoint - trans;
        let toRet = "rgba(256,256,256," + opac + ")";
        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }

    getConfigBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(210,210,210," + opac + ")";
        return toRet;
    }

    getIdentBackground() {
        var trans = this.level * 0.1;
        let toRet = "rgba(0,0,0," + trans + ")";
        return toRet;
    }

    getCellWidth(cell: number) {
        var identWidth = this.level * 2;
        if (cell == 0) {
            return identWidth + "%";
        } else if (cell == 3) {
            //return (30-identWidth)+"%";
            return "30%";
        } else {
            return "";
        }
    }

    getColorStyle() {
        var trans = this.level * 0.15;
        var num = Math.floor(trans * 256);
        var num1 = Math.floor(this.level * 0.4 * 256);
        var num2 = Math.floor(this.level * 0.3 * 256);
        let toRet = "rgba(" + num + "," + num1 + "," + num2 + ",1.0)";
        let constRet = "rgba(0,0,0,1,0)"
        return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen) {
            return this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            var num = Math.floor(trans * 256);
            let toRet = "rgba(" + num + "," + num + "," + num + ",1.0)";
            return toRet;
        }

    }

    // getNextFeaturePath() {
    //     return [...this.featuresPath,this.variant];
    // }

    cellClicked() {
        if (!this.isOpen) {
            this.remove = false;
            this.onCellClick.emit(this.cohort.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
            // setTimeout(() => this.isOpen = false, 0.3);
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.cohort.uniqueId);
        }
        this.cd.markForCheck();

    }

    // starClicked(event, f: Feature){
    //     console.log("star-clicked");
    //     if(event) {
    //         event.stopPropagation();
    //     }
    //     if(!this._airlockService.isHaveJWTToken())
    //         return;
    //     if (f.isCurrentUserFollower){
    //         this.beforeUpdate.emit(null);
    //         this._featuresPage.loading = true;
    //         this._airlockService.unfollowFeature(f.uniqueId)
    //             .then(response  => {
    //                 console.log(response);
    //                 f.isCurrentUserFollower = false;
    //                 this.onUpdate.emit(f);
    //                 this._featuresPage.loading = false;
    //                 setTimeout(() => {
    //                     this.tick = !this.tick;
    //                     this.cd.markForCheck(), 0.5
    //                 });
    //                 this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_unfollow_feature_success",f.name)});
    //             })
    //             .catch(error => {
    //                 this._featuresPage.loading = false;
    //                 console.log('Error in unfollow variant');
    //                 let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_unfollow_feature_error"));
    //                 this._airlockService.notifyDataChanged("error-notification", errorMessage);
    //                 this.hideIndicator.emit(error);
    //             });
    //     }
    //     else{
    //         this.beforeUpdate.emit(null);
    //         this._featuresPage.loading = true;
    //         this._airlockService.followFeature(f.uniqueId)
    //             .then(response  => {
    //                 console.log(response);
    //                 f.isCurrentUserFollower = true;
    //                 setTimeout(() => {
    //                     this.tick = !this.tick;
    //                     this.cd.markForCheck(), 0.5
    //                 });
    //                 this.onUpdate.emit(f);
    //                 this._featuresPage.loading = false;
    //                 this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:this.getStringWithFormat("notifications_follow_feature_success",f.name)});
    //             })
    //             .catch(error => {
    //                 this._featuresPage.loading = false;
    //                 console.log('Error in follow variant');
    //                 let errorMessage = this._airlockService.parseErrorMessage(error, this.getString("notifications_follow_feature_error"));
    //                 this._airlockService.notifyDataChanged("error-notification", errorMessage);
    //                 this.hideIndicator.emit(error);
    //             });
    //     }
    // }

    transitionEnd() {
        // console.log('transitionEnd');
        if (!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }

    openEditDialog(event: Event) {
        this.onEditInline.emit(this.cohort);
        return;
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        this.beforeUpdate.emit(null);
        let columns: []
        this._airlockService.getCohortsDbColumns(this.cohort.productId).then(columns => {
            this.modalService.open(EditCohortModal, {
                closeOnBackdropClick: false,
                context: {
                    cohort: Cohort.clone(this.cohort),
                    cohortCell: this,
                    columnNames: columns
                },
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(null);
                }
            });
            this.hideIndicator.emit(null);
            }
        ).catch(error => {
            this.modalService.open(EditCohortModal, {
                closeOnBackdropClick: false,
                context: {
                    cohort: Cohort.clone(this.cohort),
                    cohortCell: this,
                    columnNames: columns
                },
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(null);
                }
            });
            this.hideIndicator.emit(this.cohort);
        });
    }

    openAddVariantDialog() {
    }

    refreshIndexingInfo() {
        // this._airlockService.getExperimentIndexingInfo(this.cohort.uniqueId).then(result => {
        //     this.cohort.indexingInfo = result;
        //     console.log('got indexing info', result);
        // }).catch(error => {
        //     console.log('Error in getting IndexingInfo for experiment '+this.cohort.name);
        //     //fail silently
        // });
    }

    openAddDialog() {
    }

    copyFeature() {
    }

    exportFeature() {
    }

    openAddConfigurationDialog() {
    }

    openAnalyticAttributesDialog() {


    }

    shouldStyleCell() {
        // if ((this.variant.type=='MUTUAL_EXCLUSION_GROUP' && this.variant.features.length > 1)) {
        //     return true;
        // }

        // if (this.insideMX && !this.isOpen) {
        //     return false;
        // }
        // else if (this.level==0 || this.isOpen==true || (this.variant.type=='MUTUAL_EXCLUSION_GROUP' && this.variant.features.length > 1)) {
        //     return true;
        // } else {
        //     return false;
        // }
        return true;
    }

    shouldShowConfig(): boolean {
        // var showConfig = !(this.filterlistDict && this.filterlistDict["type"] && this.filterlistDict["type"].some(x=> x=="CONFIGURATION_RULE"));
        // return (showConfig && ((this.getConfigs() && this.getConfigs().length > 0) || (this.variant.defaultConfiguration && this.variant.defaultConfiguration != {})));
        return true;
    }


    isPartOfSearch(term: string, experiment: Cohort): boolean {
        if (!term || term == "") {
            return true;
        }

        let lowerTerm = term.toLowerCase();
        let displayName = experiment.name;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    hasSubElementWithTerm(term: string, experiment: Cohort): boolean {
        return false;

    }

    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            // console.log("variant is filtered:"+this.variant.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = this.hasSubElementWithTerm(this.searchTerm, this.cohort);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.cohort);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit || hasSubElements) {
            if (hasSubElements && !this.isOpen && !this.shouldOpenCellForSearch) {
                // console.log("now we know we should open the cell:"+this.variant.name);
                this.shouldOpenCellForSearch = true;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });

            } else if (!hasSubElements && this.isOpen && this.shouldOpenCellForSearch) {
                // console.log("now we know we should close the cell:"+this.variant.name);
                this.shouldOpenCellForSearch = false;
                setTimeout(() => {
                    this.cellClicked(), 0.5
                });
            }

            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.cohort.uniqueId), 0.5
                });

            }

            return false;
        }
        return false;
    }

    updateHighlight(hasHit: boolean) {
        let allText = this.cohort.name;
        if (!allText || allText.length <= 0) {
            return;
        }
        this.highlighted = hasHit
            ? allText.replace(new RegExp('(' + this.searchTerm + ')', 'ig'),
                '<span class=highlight>$1</span>')
            : allText;
    }

    _isFilteredOut(): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (this.cohort.hasOwnProperty(key) && valuesArr) {
                if ((typeof this.cohort[key] === 'string' || this.cohort[key] instanceof String)) {
                    for (var value of valuesArr) {
                        if (this.cohort[key].toLowerCase() == value.toLowerCase()) {
                            return true;
                        }
                    }
                } else if ((typeof this.cohort[key] === 'boolean' || this.cohort[key] instanceof Boolean)) {
                    for (var value of valuesArr) {
                        if (this.cohort[key] == value) {
                            return true;
                        }
                    }
                }

            }
        }
        return false;
    }


    public mySearchHit(obj: any) {
        this.onSearchHit.emit(obj);
    }

    public myDummySearchHit(obj: any) {
        this.onDummySearchHit.emit(obj);
    }

    isInProduction(): boolean {
        return true;
    }

    isSubFeature() {
        // if (this.level > 0 && !this.insideMX) {
        //     return true;
        // } else {
        //     return false;
        // }
        return false;
    }

    shouldNotStyleCell() {
        return !this.shouldStyleCell();
    }

    public myBeforeUpdate(obj: any) {
        this.beforeUpdate.emit(obj);
    }

    public myFeatureChangedStatus(obj: string) {
        this.onCellClick.emit(obj);
    }

    isCellOpen(expID: string): boolean {
        var index = this.openCohorts.indexOf(expID, 0);
        if (index > -1) {
            return true;
        } else {
            return false;
        }
    }

    public myOnUpdate(obj: any) {
        this.onUpdate.emit(obj);
    }

    public myHideIndicator(obj: any) {
        this.hideIndicator.emit(obj);
    }

    changeStage() {
    }


    getDeleteColor() {
        return "red";
    }


    delete() {
        this.popover.hide();
        let message = 'Are you sure you want to delete this cohort (' + this.cohort.name + ")?";
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Delete"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed){
                this._delete();
            }
        });
    }

    _delete() {
        this.beforeUpdate.emit(null);
        this._airlockService.deleteCohort(this.cohort.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "The cohort " + this.cohort.name + " was deleted"
            });
        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete cohort");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldShowUserGroups() {
        return false;
    }

    userGroupsText() {
        var toRet = "";
        return toRet;
    }

    promptChangeSendToAnalytics() {

    }

    isExperimentRunning() {
        return true;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.cohort.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.cohort.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    getOffset() {
        if (this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }

    isSelectedFeature() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.cohort.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.cohort.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    isPausedIndexing(): boolean {
        return false;
    }

    canClickStartIndexing(): boolean {
        return true;
    }

    _haveIndexedData(): boolean {
        return true;
    }

    shouldSuggestExport(): boolean {
        if (this.isViewer()) {
            return false;
        }
        let notRunning = !this.isExportRunning();
        let notPending = !this.isExportPending();
        let exports = this.getExports();
        let keys = Object.keys(exports);
        let hasEnabledExports = this.isHaveEnabledExports();
        return notRunning && notPending && keys.length > 0;
    }

    isHaveEnabledExports() {
        let exports = this.getExports();
        let keys = Object.keys(exports);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let exp: CohortExport = exports[key];
            if (exp.exportEnabled) {
                return true;
            }
        }
        return false;
    }



    isExportRunning(): boolean {
        return this.cohort.calculationStatus && !(this.cohort.calculationStatus == "COMPLETED" || this.cohort.calculationStatus == "FAILED");
    }

    isExportPending(): boolean {
        if (this.isExportRunning()) return false;
        let exports = this.getExports();
        let keys = Object.keys(exports);
        let toRet = false;
        for (let key of keys) {
            let currExport: CohortExport = exports[key];
            if (currExport.exportEnabled) {
                if (currExport.exportStatus == "RUNNING") return false;
                else if (currExport.exportStatus == "PENDING") toRet = true;
            }
        }
        return toRet || (this.cohort.calculationStatus && this.cohort.calculationStatus === "PENDING");

    }
}
