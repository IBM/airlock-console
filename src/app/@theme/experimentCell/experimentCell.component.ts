import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import {timer} from "rxjs";
import {DatePipe} from "@angular/common";
import * as moment from "moment";
import {NbDialogService, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {Experiment} from "../../model/experiment";
import {AvailableBranches, Branch} from "../../model/branch";
import {Feature} from "../../model/feature";
import {AnalyticsExperiment} from "../../model/analyticsExperiment";
import {AnalyticsExperimentQuota} from "../../model/analyticsQuota";
import {FeatureAnalyticAttributes} from "../../model/analytic";
import {AirlockService} from "../../services/airlock.service";
import {AuthorizationService} from "../../services/authorization.service";
import {StringsService} from "../../services/strings.service";
import {ExperimentsPage} from "../../pages/experiments";
import {Variant} from "../../model/variant";
import {EditExperimentModal} from "../modals/editExperimentModal";
import {AddVariantModal} from "../modals/addVariantModal";
import {VerifyActionModal, VerifyDialogType} from "../modals/verifyActionModal";
import {ConfirmActionModal} from "../modals/confirmActionModal";
import {ReorderVariantsModal} from "../modals/reorderVariantsModal";
import {GlobalState} from "../../global.state";
import {ExperimentVariantPair} from "../../model/experimentVariantPair";

// styleUrls: ['./style.scss', './experimentCell.scss', './dnd.scss', './animations.scss'],

@Component({
    providers: [DatePipe],
    selector: 'experiment-cell',
    styleUrls: ['./experimentCell.scss', './dnd.scss', './animations.scss'],
    templateUrl: './experimentCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCell {
    @ViewChild('experimentCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() seasonSupportAnalytics: boolean = true;
    @Input() experiment: Experiment;
    @Input() branch: Branch;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() showConfig: boolean;
    @Input() showDisabled: boolean;
    @Input() showDevFeatures: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() openExperiments: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedId: string = "";
    @Input() inlineMode: boolean;
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDummySearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditInline: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditVariantInline: EventEmitter<any> = new EventEmitter<any>();

    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    userRole: string = "";
    userEmail: string = "";
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    ruleInputSchemaSample: string;
    analyticExperiment: AnalyticsExperiment;
    analyticsExperimentQuota: AnalyticsExperimentQuota;
    highlighted = '';
    dashboardIcon: string = "tachometer-running-6";
    featureAnalyticAttributes: FeatureAnalyticAttributes;
    ruleUtilitieInfo: string;
    availableBranches: AvailableBranches;
    public status: { isopen: boolean } = {isopen: false};
    showAnalytics: boolean;


    constructor(private _airlockService: AirlockService,
                private _state:GlobalState,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private _datePipe: DatePipe,
                private _toastrService: NbToastrService,
                private _experimentsPage: ExperimentsPage,
                private modalService: NbDialogService,
                ) {
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
        if (this.experiment?.stage == 'PRODUCTION') {
            var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false && this.partOfBranch());
        } else {
            return (!this.isViewer() && this.partOfBranch());
        }

    }

    isShowIndex() {
        return this.isShowOptions() && this.canClickStartIndexing();
    }

    canDoActionInProduction(): boolean {
        if (this.experiment.stage == 'PRODUCTION') {
            return !(this.isViewer() || this.isEditor());
        } else {
            return true;
        }
    }

    changeIndexExperiment() {
        this.popover.hide();
        let message = this.experiment.indexExperiment ? this.getString('experiment_stop_indexing') + this._featureUtils.getExperimentDisplayName(this.experiment) + this.getString('experiment_stop_indexing_suffix') : this.getString('experiment_start_indexing') + this._featureUtils.getExperimentDisplayName(this.experiment) + this.getString('experiment_start_indexing_suffix');
        if (this.experiment.stage == 'PRODUCTION') {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    experiment: this.experiment,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.EXPERIMENT_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed){
                    this._changeIndexExperiment();
                }
            });
        } else {
            if (this.experiment.stage == 'PRODUCTION') {
                return;
            }
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    message: message,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed){
                    this._changeIndexExperiment();
                }
            });
        }
    }

    _changeIndexExperiment() {
        this.beforeUpdate.emit(null);
        var cloneExp = Experiment.clone(this.experiment);
        var isRevert = false;
        if (this.experiment.indexExperiment == true) {
            isRevert = true;
        }
        cloneExp.indexExperiment = !this.experiment.indexExperiment;

        this._airlockService.updateExperiment(cloneExp).then(experiment => {
            this.experiment = experiment;
            this.onUpdate.emit(this.experiment);
            let message = isRevert ? "Paused indexing successfully" : "Experiment started indexing successfully";
            this._airlockService.notifyDataChanged("success-notification", {title: "Success", message: message});
        }).catch(error => {
            let defErrorMessage = "Failed to start indexing. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to pause indexing";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.experiment);
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
        return (this.experiment?.indexingInfo && this.experiment.indexingInfo?.dashboardURL
            && this.experiment.indexingInfo?.dashboardURL.length > 0);
    }

    isAnalyticsViewer(): boolean {
        return this._airlockService.isUserHasAnalyticsViewerRole();
    }

    isIndexingPaused(): boolean {
        return;
    }

    getDashboardColor(): string {

        if (!this.hasDashboard()) {
            return "rgba(72, 76, 79, 0.3)";
        }
        if (!this.experiment.indexingInfo || !this.experiment.indexExperiment || this.experiment.indexingInfo.indexingProgress || this.experiment.indexingInfo.indexingProgress.totalNumberOfBuckets <= 0) {
            return "rgba(72, 76, 79, 1.0)";
        }
        let percentage = 100.0 * this.experiment.indexingInfo.indexingProgress.numberOfDoneBuckets / this.experiment.indexingInfo.indexingProgress.totalNumberOfBuckets;
        if (percentage <= 20.0) {
            return "rgba(red,0.8)";
        } else if (percentage <= 40.0) {
            return "rgba(yellow,0.8)";
        } else if (percentage <= 60.0) {
            return "rgba(darkseagreen,0.8)";
        } else {
            return "rgba(green,0.8)"
        }
    }

    getDashboardIcon(): string {
        if (!this.hasDashboard()) {
            return "tachometer-disabled";
        }
        if (!this.experiment.indexingInfo /*|| !this.experiment.indexExperiment*/ || !this.experiment.indexingInfo.indexingProgress || this.experiment.indexingInfo.indexingProgress.totalNumberOfBuckets <= 0) {
            return "tachometer";
        }
        let percentage = 100.0 * this.experiment.indexingInfo.indexingProgress.numberOfDoneBuckets / this.experiment.indexingInfo.indexingProgress.totalNumberOfBuckets;
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

    private setCookie(name: string, value: string, expireDays: number, path: string = '', domain: string = '') {
        let d: Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires: string = `expires=${d.toUTCString()}`;
        let cpath: string = path ? `; path=${path}` : '';
        let cdomain: string = domain ? `; domain=${domain}` : '';
        let str: string = `${name}=${value}; ${expires}${cpath}${cdomain};`;
        console.log(str);
        document.cookie = str;
        console.log(document.cookie);
    }

    resetDashboard() {
        this.popover.hide();
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                title: this.getString("reset_dashboard_alert_title"),
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._experimentsPage.loading = true;
                this._airlockService.resetDashboard(this.experiment.uniqueId).then(result => {
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "Dashboard reset"
                    });
                    this._experimentsPage.loading = false;
                });
            }
        });
    }

    getSharedDomainPart(url1: string) {
        var curDomain = window.location.hostname;

    }

    showDashboard() {
        this.setCookie("airlock_token", this._airlockService.getJWT(), 1, "/", ".weather.com");
        console.log(this.experiment.indexingInfo);
        if (this.experiment.indexingInfo && this.experiment.indexingInfo.dashboardURL) {
            console.log(this.experiment.indexingInfo.dashboardURL);
            window.open(this.experiment.indexingInfo.dashboardURL, "_blank");
        }
        // window.open(this._airlockService.getAnalyticsUrl(),"_blank");
        // if (!this.hasDashboard()) {
        //     return;
        // }
        //window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        // this.showDashboardModal.open("https://analytics1.airlock.twcmobile.weather.com:6060/app/kibana#/dashboard/analytics-dry-run-index-Dashboard");
    }

    getRunningMessage(): string {
        if (this.experiment.indexingInfo && this.experiment.indexingInfo.startDate) {
            // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
            return "Running for " + moment(this.experiment.indexingInfo.startDate).fromNow(true);
        } else {
            return "Not running";
        }
    }

    getLastIndexedMessage(): string {
        if (this.experiment.indexingInfo && this.experiment.indexingInfo.endDate) {
            // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
            return "Indexed up to " + this._datePipe.transform(this.experiment.indexingInfo.endDate, "MMM dd, yyyy, h:mm a");
        } else {
            return "";
        }
    }

    hasIndexingData(): boolean {
        return (this.experiment.indexingInfo && this.experiment.indexingInfo.indexingProgress && this.experiment.indexingInfo.indexingProgress.totalNumberOfBuckets >= 0);
    }

    getLastIndexedPopover(): string {
        if (this.experiment.indexingInfo && this.experiment.indexingInfo.endDate) {
            // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
            return moment(this.experiment.indexingInfo.endDate).fromNow();
        } else {
            return null;
        }
    }

    getLastIndexedTitle(): string {
        if (this.experiment.indexingInfo && this.experiment.indexingInfo.endDate) {
            // return "Running since "+this._datePipe.transform(new Date(this.experiment.indexingInfo.startDate),'medium')
            return "Last indexed"
        } else {
            return "Not indexed";
        }
    }

    isSendingSomethingToAnalytics(): boolean {
        return false;
    }

    getMissingDashboardTooltip(): string {
        if (this.hasDashboard()) {
            return "Click to view dashboard"
        } else {
            var message = "Dashboard not available";
            if (this.experiment.indexingInfo && this.experiment.indexingInfo.missingDashboardExplanation && this.experiment.indexingInfo.missingDashboardExplanation.length > 0) {
                message += ": " + this.experiment.indexingInfo.missingDashboardExplanation;
            }
            return message;
        }

    }

    getDashboardTooltip(): string {
        if (this.isAnalyticsViewer() && this.hasDashboard()) {
            return "Click to view dashboard";
        } else if (!this.isAnalyticsViewer() && this.hasDashboard()) {
            return "Not enough permissions to view dashboard";
        }

    }

    getStartIndexingTooltip(): string {
        if (!(this.experiment?.ranges != null && this.experiment?.ranges.length > 0)) {
            if (this.experiment.variants == null || this.experiment.variants.length <= 0) {
                return this._stringsSrevice.getString('experiment_cant_start_indexing_variants');
            } else {
                if (!this.experiment.enabled) {
                    return this._stringsSrevice.getString('experiment_cant_start_indexing_enable');
                } else {
                    return this._stringsSrevice.getString('experiment_cant_start_indexing_old_version');
                }
            }
        } else {
            return this._stringsSrevice.getString('experiment_start_indexing_tooltip');
        }
    }

    getTooltipForPausedIndexing(): string {
        return this._stringsSrevice.getString('experiment_indexing_was_paused');
    }

    getTooltipForWhyUserCantDoAction(): string {
        if (!(this.experiment?.ranges != null && this.experiment?.ranges.length > 0)) {
            if (this.experiment.variants == null || this.experiment.variants.length <= 0) {
                return this._stringsSrevice.getString('experiment_cant_start_indexing_variants');
            } else {
                if (!this.experiment.enabled) {
                    return this._stringsSrevice.getString('experiment_cant_start_indexing_enable');
                } else {
                    return this._stringsSrevice.getString('experiment_cant_start_indexing_old_version');
                }
            }
        } else {
            return this.getMissingDashboardTooltip();
        }
        // return "";
    }

    _isSendingExtraStuffToAnalytics(): boolean {
        return false;
    }

    _hasConfigurationsToAnalytics() {
        return false;
    }

    getSendToAnalyticsTooltip(): string {
        if (this.allowAddToAnalytics()) {
            if (!this.isFeatureSendToAnalytics() && !this._isSendingExtraStuffToAnalytics()) {
                return this.getString('feature_cell_click_to_send_to_analytics');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_not_send_to_analytics');
                    } else {
                        return this.getString('feature_cell_click_to_not_send_to_analytics');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_send_to_analytics');
                    } else {
                        return this.getString('feature_cell_click_to_send_to_analytics');
                    }
                }
            }
        } else {
            //the button is disabled
            if (!this.isFeatureSendToAnalytics() && !this._isSendingExtraStuffToAnalytics()) {
                return this.getString('feature_cell_click_to_send_to_analytics_disabled');
            } else {
                if (this.isFeatureSendToAnalytics()) {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_not_send_to_analytics_disabled');
                    } else {
                        return this.getString('feature_cell_click_to_not_send_to_analytics_disabled');
                    }
                } else {
                    if (this._isSendingExtraStuffToAnalytics()) {
                        return this.getString('feature_cell_sending_something_click_to_send_to_analytics_disabled');
                    } else {
                        return this.getString('feature_cell_click_to_send_to_analytics_disabled');
                    }
                }
            }
        }

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

    isViewer() {
        return this._airlockService.isViewer();
    }

    allowAddToAnalytics() {
        return !(this.isViewer()) && !(this.isEditor() && this.isInProduction());
    }

    isEditor() {
        return this._airlockService.isEditor();
    }

    isShowAddToGroup() {
        return (!this.isViewer());
    }

    isShowAddVariant() {
        return (!this.isViewer() && !(this.isEditor() && this.isInProduction()))
    }

    isShowReorder() {
        return (!this.isViewer());
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

    ngOnInit() {
        this.showAnalytics = this._state.canUseAnalytics();
        // console.log("ngOnInit:"+this.variant.name);
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
        }
        let timerRunner = timer(60 * 60 * 1000, 60 * 60 * 1000); //refresh every hour
        timerRunner.subscribe(t => this.refreshIndexingInfo());
        // this.refreshIndexingInfo(); //DELETE ME after we will get the indexing data the first time
    }

    getBranchName(branch: Branch) {
        if (!branch) return null;
        let name = branch.name;
        if (name == "MASTER") {
            name = "MAIN";
        }
        return name;
    }

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
        this.modalService.open(ReorderVariantsModal, {
            closeOnBackdropClick: false,
            context: {
                _experiment: Experiment.clone(this.experiment)
            }
        }).onClose.subscribe(reorder=> {
            this.onUpdate.emit(true);
        })
        // this.reorderVariantsModal.open(this.experiment);
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
        this.onSelected.emit({"event": obj, "id": this.experiment.uniqueId, "nativeElement": this._selector.nativeElement});
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
        if (!this.isOpen || this.experiment.variants == null || this.experiment.variants.length <= 0) {
            return this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen || this.experiment.variants == null || this.experiment.variants.length <= 0) {
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
            console.log("cell changed status:" + this.experiment.uniqueId);
            this.onCellClick.emit(this.experiment.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
            // setTimeout(() => this.isOpen = false, 0.3);
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.experiment.uniqueId);
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

    addNewFeatureToMXGroup() {
        // console.log("add to MX Group");
        // this.addFeatureModal.openInExistingXM(this.variant);
    }

    addNewFeatureToMXGroupWithCurrentFeature() {
        // this.addFeatureModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId,this.variant);
    }

    addFeatureToMXGroup() {
        // this.beforeUpdate.emit(null);
        // this.variant.parent = this.parentFeatureId;
        // this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(parent => {
        //     let parentFeature: Feature = parent;
        //     this.hideIndicator.emit(null);
        //     this.addToMXGroupModal.open(this.branch, this.variant, parentFeature);
        // });

    }

    openEditDialog(event: Event, isInline: boolean = true){
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            this.onEditInline.emit(this.experiment)
            return;
        }
        this.beforeUpdate.emit(null);
        this._airlockService.getExperimentQuota(this.experiment.uniqueId).then(result => {
            this.analyticsExperimentQuota = result;
            this._airlockService.getAnalyticsForDisplayExperiment(this.experiment.uniqueId).then(result1 => {
                this.analyticExperiment = result1;
                this._airlockService.getExperimentUtilitiesInfo(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result2 => {
                    this.ruleUtilitieInfo = result2 as string;
                    this._airlockService.getExperimentInputSample(this.experiment.uniqueId, this.experiment.stage, this.experiment.minVersion).then(result3 => {
                        this.ruleInputSchemaSample = result3 as string;
                        this.hideIndicator.emit(this.experiment);
                        this.modalService.open(EditExperimentModal, {
                            closeOnBackdropClick: false,
                            context: {
                                experiment: Experiment.clone(this.experiment),
                                totalCountQuota: this.analyticsExperimentQuota.analyticsQuota,
                                ruleInputSchemaSample: this.ruleInputSchemaSample,
                                ruleUtilitiesInfo: this.ruleUtilitieInfo,
                                analyticsExperiment: this.analyticExperiment,
                                experimentCell: this,
                                /*
                                @Input() product: Product;
                                @Input() experiment: Experiment;
                                @Input() rootFeatuteGroups: Array<Feature>;
                                @Input() rootId: string;
                                @Input() verifyActionModal: VerifyActionModal;
                                @Input() possibleGroupsList: Array<any> = [];
                                 */
                            },
                        }).onClose.subscribe(reorder=> {
                            this.onUpdate.emit(true);
                        })
                        // this.editExperimentModal.open(this.experiment, this.analyticsExperimentQuota, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this.analyticExperiment, this);
                    }).catch(error => {
                        let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema");
                        this._airlockService.notifyDataChanged("error-notification", errorMessage);
                        this.hideIndicator.emit(error);
                    });
                }).catch(error => {
                    console.log('Error in getting UtilityInfo');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Utilitystring");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    this.hideIndicator.emit(error);
                });
            }).catch(error => {
                console.log('Error in getting getAnalyticsGlobalDataCollectionExperiment');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Global Data collection for experiment");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
            });
        }).catch(error => {
            console.log('Error in getting analyticsExperimentQuota');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get analyticsExperimentQuota for experiment");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
        });
    }

    openAddVariantDialog() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this._airlockService.getAvailableBranches(this.experiment.uniqueId).then(result => {
            this.availableBranches = result;
            this.hideIndicator.emit(null);
            this.modalService.open(AddVariantModal, {
                closeOnBackdropClick: false,
                context: {
                    experiment: this.experiment,
                    availableBranches: this.availableBranches.availableInAllSeasons,
                    title: "Add Variant",
                }
            }).onClose.subscribe(item=> {
                if (item!= null) {
                    if (!this.isOpen) {
                        this.cellClicked();
                    }
                    this.showEditInline(item);
                    this.onUpdate.emit(item);
                }
            });
            // this.addVariantModal.open(this.experiment, this.availableBranches.availableInAllSeasons);
        }).catch(error => {
            console.log('Error in getting Available Branches for experiment');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get  Available Branches for experiment");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.hideIndicator.emit(error);
        });
    }

    refreshIndexingInfo() {
        this._airlockService.getExperimentIndexingInfo(this.experiment.uniqueId).then(result => {
            this.experiment.indexingInfo = result;
            console.log('got indexing info', result);
        }).catch(error => {
            console.log('Error in getting IndexingInfo for experiment ' + this.experiment.name);
            //fail silently
        });
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


    isPartOfSearch(term: string, experiment: Experiment): boolean {
        if (!term || term == "") {
            return true;
        }

        let lowerTerm = term.toLowerCase();
        let displayName = experiment.displayName;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    isVariantPartOfSearch(term: string, variant: Variant): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = variant.displayName || "";
        let name = variant.name || "";
        let branchName = variant.branchName || "";
        if ((!displayName && !name) || !branchName) {
            return false;
        }
        return displayName.toLowerCase().includes(lowerTerm) || branchName.toLowerCase().includes(lowerTerm) || name.toLowerCase().includes(lowerTerm);
    }

    hasSubElementWithTerm(term: string, experiment: Experiment): boolean {
        if (!term || term == "") {
            return false;
        }
        if (experiment.variants) {
            for (var variant of experiment.variants) {
                if (this.isVariantPartOfSearch(term, variant)) {
                    return true;
                }
            }
        }
        return false;

    }

    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            // console.log("variant is filtered:"+this.variant.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = this.hasSubElementWithTerm(this.searchTerm, this.experiment);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.experiment);
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
                    this.onSearchHit.emit(this.experiment.uniqueId), 0.5
                });

            }

            return false;
        }
        return false;
    }

    updateHighlight(hasHit: boolean) {
        let allText = this._featureUtils.getExperimentDisplayName(this.experiment);
        if (!allText || allText.length <= 0) {
            return;
        }
        this.highlighted = hasHit
            ? allText.replace(new RegExp('(' + this.searchTerm + ')', 'ig'),
                '<span class=highlight>$1</span>')
            : allText;
    }

    _isFilteredOut(): boolean {
        if (this.experiment.name == "krishna test") {
            this.experiment.name;
        }
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (this.experiment.hasOwnProperty(key) && valuesArr) {
                if ((typeof this.experiment[key] === 'string' || this.experiment[key] instanceof String)) {
                    for (var value of valuesArr) {
                        if (this.experiment[key].toLowerCase() == value.toLowerCase()) {
                            return true;
                        }
                    }
                } else if ((typeof this.experiment[key] === 'boolean' || this.experiment[key] instanceof Boolean)) {
                    for (var value of valuesArr) {
                        if (this.experiment[key] == value) {
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
        return this.experiment.stage == 'PRODUCTION';
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
        var index = this.openExperiments.indexOf(expID, 0);
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
        this.popover.hide();
        let message = "";
        let isRevert = false;
        if (this.experiment.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this experiment to development?';
            isRevert = true;
        } else {
            message = 'Are you sure you want to release this experiment to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the experiment name to validate your decision.`;
        // this.verifyActionModal.actionApproved$.subscribe(
        //     astronaut => {
        //         this._changeStage();
        //     });
        console.log("open verifyActionModal");
        if (!(this.experiment.controlGroupVariants && this.experiment.controlGroupVariants.length > 0) && !isRevert) {
            let controlGroupMessage = this.getString('experiment_move_to_production_without_control');
            if (this.experiment.stage == 'PRODUCTION') {
                return;
            }
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    experiment: this.experiment,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.EXPERIMENT_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._changeStage();
                }
            });
        } else {
            this.modalService.open(VerifyActionModal, {
                context:{
                    experiment: this.experiment,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.EXPERIMENT_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed){
                    this._changeStage();
                }
            });
        }
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var isRevert = false;
        if (this.experiment.stage == 'PRODUCTION') {
            this.experiment.stage = 'DEVELOPMENT';
            isRevert = true;
        } else {
            this.experiment.stage = 'PRODUCTION';
            if (this.experiment.minVersion == null || this.experiment.minVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this experiment to production because a minimum app version is not specified. Edit the variant to specify a minimum app version.");
                this.onUpdate.emit(this.experiment);
                return;
            }
        }
        this._experimentsPage.loading = true;
        this._airlockService.updateExperiment(this.experiment).then(experiment => {
            this.experiment = experiment;
            this._experimentsPage.loading = false;
            this.onUpdate.emit(this.experiment);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Experiment stage changed successfully"
            });
        }).catch(error => {
            this._experimentsPage.loading = false;
            let defErrorMessage = "Failed to change experiment stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change experiment stage. If this item has variants or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    getDeleteColor() {
        if (this.experiment.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }


    delete() {
        this.popover.hide();
        if (this.experiment.stage == 'PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this experiment (' + this._featureUtils.getExperimentDisplayName(this.experiment) + ")?";
        if (this.experiment.stage == 'PRODUCTION') {
            return;
        }
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
        this._airlockService.deleteExperiment(this.experiment.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "The experiment " + this._featureUtils.getExperimentDisplayName(this.experiment) + " was deleted"
            });
        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete experiment");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldShowUserGroups() {
        if (this.experiment.stage == 'DEVELOPMENT' &&
            !(this.experiment.internalUserGroups == null || this.experiment.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.experiment.internalUserGroups == null || this.experiment.internalUserGroups.length <= 0)) {
            toRet = this.experiment.internalUserGroups.join(", ");
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {

    }

    isExperimentRunning() {
        return this.experiment.stage == "PRODUCTION" && this.experiment.enabled && this.experiment.rolloutPercentage > 0;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.experiment.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.experiment.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
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
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.experiment.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.experiment.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    isPausedIndexing(): boolean {
        return (this.experiment?.ranges != null && this.experiment?.ranges.length > 0 && this.experiment?.indexExperiment == false);
    }

    canClickStartIndexing(): boolean {
        return (this.experiment?.ranges != null && this.experiment?.ranges.length > 0)
    }

    _haveIndexedData(): boolean {
        return (this.experiment?.indexingInfo && this.experiment?.indexingInfo.indexingProgress && this.experiment?.indexingInfo.indexingProgress.numberOfDoneBuckets > 0);
    }

    shouldSuggestIndexing(): boolean {
        if (!this.experiment?.indexExperiment && !this._haveIndexedData() && !(this.experiment?.indexingInfo && this.experiment?.indexingInfo.dashboardURL != null)) {
            return true;
        }
        return false;
    }

    showEditInline(variant: Variant) {
        let pair = new ExperimentVariantPair();
        pair.experiment = this.experiment;
        pair.variant = variant;
        this.onEditVariantInline.emit(pair);
    }
}
