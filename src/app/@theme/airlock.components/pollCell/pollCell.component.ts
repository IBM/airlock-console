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
import {NbDialogService, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AvailableBranches, Branch} from "../../../model/branch";
import {Feature} from "../../../model/feature";
import {FeatureAnalyticAttributes} from "../../../model/analytic";
import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {GlobalState} from "../../../global.state";
import {Poll} from "../../../model/poll";
import {Question} from "../../../model/question";
import { PollsPage } from 'app/pages/polls';
import {AddQuestionModal} from "../../modals/addQuestionModal";
import {PollQuestionPair} from "../../../model/pollQuestionPair";
import {EditPollModal} from "../editPollModal";
import {Cohort} from "../../../model/cohort";
import {ReorderQuestionsModal} from "../../modals/reorderQuestionsModal";
import {QuestionAnswerPoll} from "../../../model/questionAnswerPoll";
import {ImportFeaturesModal} from "../../modals/importFeaturesModal";
import {ImportPollsModal} from "../../modals/importPollsModal";


@Component({
    providers: [DatePipe],
    selector: 'poll-cell',
    styleUrls: ['./pollCell.scss', './dnd.scss', './animations.scss'],
    templateUrl: './pollCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollCell {
    @ViewChild('experimentCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() poll: Poll;
    @Input() branch: Branch;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() showConfig: boolean;
    @Input() showDisabled: boolean;
    @Input() showDevFeatures: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() openPolls: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() selectedId: string = "";
    @Input() inlineMode: boolean;
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() questionAdded: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDummySearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditInline: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditQuestionInline: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditAnswerInline: EventEmitter<any> = new EventEmitter<any>();

    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    userRole: string = "";
    userEmail: string = "";
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    ruleInputSchemaSample: string;
    highlighted = '';
    dashboardIcon: string = "tachometer-running-6";
    featureAnalyticAttributes: FeatureAnalyticAttributes;
    ruleUtilitieInfo: string;
    availableBranches: AvailableBranches;
    public status: { isopen: boolean } = {isopen: false};
    showAnalytics: boolean;
    canImportExport: boolean = true;

    constructor(private _airlockService: AirlockService,
                private _state: GlobalState,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private _datePipe: DatePipe,
                private _toastrService: NbToastrService,
                private _pollsPage: PollsPage,
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
        return this._stringsSrevice.getString("poll_cell_questions_title");
    }

    isShowCopy() {
        return !this.isViewer();
    }

    canShowPaste() {
        return !this.isViewer() && this.partOfBranch();
    }

    isShowOptions() {
        if (this.poll?.stage == 'PRODUCTION') {
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
        if (this.poll.stage == 'PRODUCTION') {
            return !(this.isViewer() || this.isEditor());
        } else {
            return true;
        }
    }

    openDashboard() {

        // window.open(encodeURIComponent('https://airlytics-dash.airlock.twcmobile.weather.com/dashboard/poll-dashboard-in-development-?p_poll_id='+this.poll.pollId));
        // window.open('https://airlytics-dash.airlock.twcmobile.weather.com/dashboard/poll-dashboard-in-development-?p_poll_id=Churn%20Reason');
        window.open('https://airlytics-dash.airlock.twcmobile.weather.com/dashboard/poll-dashboard-in-development-?p_poll_id=' + encodeURI(this.poll.pollId));
    }
    changeIndexExperiment() {
        // this.popover.hide();
        // let message = this.poll.indexExperiment ? this.getString('experiment_stop_indexing') + this._featureUtils.getExperimentDisplayName(this.poll) + this.getString('experiment_stop_indexing_suffix') : this.getString('experiment_start_indexing') + this._featureUtils.getExperimentDisplayName(this.poll) + this.getString('experiment_start_indexing_suffix');
        // if (this.poll.stage == 'PRODUCTION') {
        //     this.modalService.open(VerifyActionModal, {
        //         closeOnBackdropClick: false,
        //         context: {
        //             experiment: this.poll,
        //             text: message,
        //             verifyModalDialogType: VerifyDialogType.EXPERIMENT_TYPE,
        //         }
        //     }).onClose.subscribe(confirmed => {
        //         if (confirmed){
        //             this._changeIndexExperiment();
        //         }
        //     });
        // } else {
        //     if (this.poll.stage == 'PRODUCTION') {
        //         return;
        //     }
        //     this.modalService.open(ConfirmActionModal, {
        //         closeOnBackdropClick: false,
        //         context: {
        //             title: message,
        //         }
        //     }).onClose.subscribe(confirmed => {
        //         if (confirmed){
        //             this._changeIndexExperiment();
        //         }
        //     });
        // }
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.poll);
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
        return false;
    }

    isAnalyticsViewer(): boolean {
        return this._airlockService.isUserHasAnalyticsViewerRole();
    }

    isIndexingPaused(): boolean {
        return;
    }

    getDashboardColor(): string {
        return "rgba(72, 76, 79, 0.3)";
    }

    getDashboardIcon(): string {
        return "tachometer-disabled";
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
        if (this.popover) {
            this.popover.hide();
        }
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                title: this.getString("reset_dashboard_alert_title"),
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._pollsPage.loading = true;
                this._airlockService.resetDashboard(this.poll.uniqueId).then(result => {
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "Dashboard reset"
                    });
                    this._pollsPage.loading = false;
                });
            }
        });
    }

    getSharedDomainPart(url1: string) {
        var curDomain = window.location.hostname;

    }

    showDashboard() {
    }

    getSubtitle(): string {
        return this.poll.title || "" ;
    }

    getLastIndexedMessage(): string {
        return "N/A";
    }

    hasIndexingData(): boolean {
        return false;
    }

    getLastIndexedPopover(): string {
        return "n/a";
    }

    hasTitle(): boolean {
        return this.poll.title && this.poll.title.trim().length > 0;
    }

    getLastIndexedTitle(): string {
        return "n/a";
    }

    isSendingSomethingToAnalytics(): boolean {
        return false;
    }

    getMissingDashboardTooltip(): string {
        return "N/A";
    }

    getDashboardTooltip(): string {
        if (this.isAnalyticsViewer() && this.hasDashboard()) {
            return "Click to view dashboard";
        } else if (!this.isAnalyticsViewer() && this.hasDashboard()) {
            return "Not enough permissions to view dashboard";
        }

    }

    getStartIndexingTooltip(): string {
        return "n/a";
    }

    getTooltipForPausedIndexing(): string {
        return this._stringsSrevice.getString('experiment_indexing_was_paused');
    }

    getTooltipForWhyUserCantDoAction(): string {
        return "n/a";
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

    isShowAddQuestion() {
        return (!this.isViewer() && !(this.isEditor() && this.isInProduction()))
    }

    isShowReorder() {
        return (!this.isViewer());
    }

    isShowReorderConfig() {
        return (!this.isViewer());
    }

    public updateFeature(newFeature: Poll) {
        console.log("updatePoll");
        console.log(newFeature);
        this.poll = Poll.clone(newFeature);
        setTimeout(() => {
            this.tick = !this.tick;
            this.cd.markForCheck(), 0.5
        });
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
        this.modalService.open(ReorderQuestionsModal, {
            closeOnBackdropClick: false,
            context: {
                _poll: Poll.clone(this.poll)
            }
        }).onClose.subscribe(reload => {
           this.refresh();
        });
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
        if (!this.isOpen || this.poll.questions == null || this.poll.questions.length <= 0) {
            return this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextColorStyle() {
        if (!this.isOpen || this.poll.questions == null || this.poll.questions.length <= 0) {
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
            console.log("cell changed status:" + this.poll.uniqueId);
            this.onCellClick.emit(this.poll.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck()
            },500);
        } else {
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.poll.uniqueId);
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

    openEditDialog(event: Event, isInline: boolean = true) {
        if (this.popover) {
            this.popover.hide();
        }
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            this.onEditInline.emit(this.poll)
            return;
        }
        this.beforeUpdate.emit(null);
        this._airlockService.getExperimentUtilitiesInfo(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result2 => {
            this.ruleUtilitieInfo = result2 as string;
            this._airlockService.getPollInputSample(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result3 => {
                this.ruleInputSchemaSample = result3 as string;
                this.hideIndicator.emit(this.poll);
                this.modalService.open(EditPollModal, {
                    closeOnBackdropClick: false,
                    context: {
                        poll: this.poll,
                        ruleInputSchemaSample: this.ruleInputSchemaSample,
                        ruleUtilitiesInfo: this.ruleUtilitieInfo,
                        pollCell: this
                    },
                }).onClose.subscribe(reload => {
                    if (reload) {
                        this.refresh();
                    }
                });
                // this.editExperimentModal.open(this.experiment, this.analyticsExperimentQuota, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this.analyticExperiment, this);
            }).catch(error => {
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Poll Input Sample Schema");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Utilitystring");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.hideIndicator.emit(error);
        });

    }

    openAddQuestionDialog() {
        if (this.popover) {
            this.popover.hide();
        }
        this.beforeUpdate.emit(null);
        this.modalService.open(AddQuestionModal, {
            closeOnBackdropClick: false,
            context: {
                poll: this.poll,
                title: "Add Question",
            }
        }).onClose.subscribe(item => {
            if (item) {
                this.onUpdate.emit(item);
                this.questionAdded.emit(item);
                this._pollsPage.refreshTable();
                if (!this.isOpen) {
                    this.remove = false;
                    console.log("cell changed status:" + this.poll.uniqueId);
                    this.onCellClick.emit(this.poll.uniqueId);
                    setTimeout(() => {
                        this.isOpen = true;
                        this.cd.markForCheck()
                    },500);
                }
            }
            this.onUpdate.emit(null);
        });
    }

    refreshIndexingInfo() {

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


    isPartOfSearch(term: string, poll: Poll): boolean {
        if (!term || term == "") {
            return true;
        }

        let lowerTerm = term.toLowerCase();
        let displayName = poll.pollId;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = poll.title;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    isQuestionPartOfSearch(term: string, question: Question): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = question.questionId || "";
        let name = question.title || "";
        if ((!displayName && !name)) {
            return false;
        }
        return displayName.toLowerCase().includes(lowerTerm) || name.toLowerCase().includes(lowerTerm);
    }

    hasSubElementWithTerm(term: string, experiment: Poll): boolean {
        if (!term || term == "") {
            return false;
        }
        if (experiment.questions) {
            for (var variant of experiment.questions) {
                if (this.isQuestionPartOfSearch(term, variant)) {
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
        let hasSubElements = this.hasSubElementWithTerm(this.searchTerm, this.poll);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.poll);
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
                    this.onSearchHit.emit(this.poll.uniqueId), 0.5
                });

            }

            return false;
        }
        return false;
    }

    updateHighlight(hasHit: boolean) {
        let allText = this._featureUtils.getPollDisplayName(this.poll);
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
            if (this.poll.hasOwnProperty(key) && valuesArr) {
                if ((typeof this.poll[key] === 'string' || this.poll[key] instanceof String)) {
                    for (var value of valuesArr) {
                        if (this.poll[key].toLowerCase() == value.toLowerCase()) {
                            return true;
                        }
                    }
                } else if ((typeof this.poll[key] === 'boolean' || this.poll[key] instanceof Boolean)) {
                    for (var value of valuesArr) {
                        if (this.poll[key] == value) {
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
        return this.poll.stage == 'PRODUCTION';
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
        var index = this.openPolls.indexOf(expID, 0);
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
        if (this.popover) {
            this.popover.hide();
        }
        let message = "";
        let isRevert = false;
        if (this.poll.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this poll to development?';
            isRevert = true;
        } else {
            message = 'Are you sure you want to release this poll to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the poll name to validate your decision.`;
        console.log("open verifyActionModal");
            this.modalService.open(VerifyActionModal, {
                context: {
                    poll: this.poll,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.POLL_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._changeStage();
                }
            });
        }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var isRevert = false;
        if (this.poll.stage == 'PRODUCTION') {
            this.poll.stage = 'DEVELOPMENT';
            isRevert = true;
        } else {
            this.poll.stage = 'PRODUCTION';
            if (this.poll.minVersion == null || this.poll.minVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this poll to production because a minimum app version is not specified. Edit the variant to specify a minimum app version.");
                this.onUpdate.emit(this.poll);
                return;
            }
        }
        this._pollsPage.loading = true;
        this._airlockService.updatePoll(this.poll).then(poll => {
            this.poll = poll;
            this._pollsPage.loading = false;
            this.onUpdate.emit(this.poll);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Poll stage changed successfully"
            });
        }).catch(error => {
            this._pollsPage.loading = false;
            let defErrorMessage = "Failed to change poll stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change poll stage. If this item has variants or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    getDeleteColor() {
        if (this.poll.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }


    delete() {
        if (this.popover) {
            this.popover.hide();
        }
        if (this.poll.stage == 'PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this poll (' + this._featureUtils.getPollDisplayName(this.poll) + ")?";
        if (this.poll.stage == 'PRODUCTION') {
            return;
        }
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Delete"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._delete();
            }
        });
    }

    _delete() {
        this.beforeUpdate.emit(null);
        this._airlockService.deletePoll(this.poll.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "The poll " + this._featureUtils.getPollDisplayName(this.poll) + " was deleted"
            });
        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete poll");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    shouldShowUserGroups() {
        if (this.poll.stage == 'DEVELOPMENT' &&
            !(this.poll.internalUserGroups == null || this.poll.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.poll.internalUserGroups == null || this.poll.internalUserGroups.length <= 0)) {
            toRet = this.poll.internalUserGroups.join(", ");
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {

    }

    isPollRunning() {
        return this.poll.stage == "PRODUCTION" && this.poll.enabled && this.poll.rolloutPercentage > 0;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.poll.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.poll.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
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
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.poll.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.poll.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    isPausedIndexing(): boolean {
        return false;
    }

    canClickStartIndexing(): boolean {
        return false;
    }

    _haveIndexedData(): boolean {
        return false;
    }

    shouldSuggestIndexing(): boolean {
        return false;
    }

    showEditInline(question: Question) {
        let pair = new PollQuestionPair();
        pair.poll = this.poll;
        pair.question = question;
        this.onEditQuestionInline.emit(pair);
    }

    showEditAnswerInline(questionAnswerPoll: QuestionAnswerPoll) {
        this.onEditAnswerInline.emit(questionAnswerPoll);
    }

    private refresh() {
        this._airlockService.getPoll(this.poll.uniqueId).then(result => {
            this.poll = result;
        });
    }

    importPoll(poll: Poll) {
        if (this.popover) {
            this.popover.hide();
        }
        this.modalService.open(ImportPollsModal, {
            closeOnBackdropClick: false,
            context: {
                poll: poll,
                isOpen: true,
                isClear: true,
                isShowSuffix: false,
                isShowMinApp: false,
                loading: false,
                referenceOpen: true,
                previewOpen: false,
            }
        }).onClose.subscribe(reload => {
            if (reload) {

            }
        });
        
    }
}
