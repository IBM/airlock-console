import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {Variant} from "../../../model/variant";
import {Feature} from "../../../model/feature";
import {Experiment} from "../../../model/experiment";
import {AvailableBranches} from "../../../model/branch";
import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {GlobalState} from "../../../global.state";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {EditVariantModal} from "../../modals/editVariantModal";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {Question} from "../../../model/question";
import {Poll} from "../../../model/poll";
import {EditQuestionModal} from "../../modals/editQuestionModal";
import {PollQuestionPair} from "../../../model/pollQuestionPair";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";
import {QuestionAnswerPoll} from "../../../model/questionAnswerPoll";
import {AddQuestionModal} from "../../modals/addQuestionModal";
import {AddAnswerModal} from "../../modals/addAnswerModal";
import {ReorderQuestionsModal} from "../../modals/reorderQuestionsModal";
import {ReorderAnswersModal} from "../../modals/reorderAnswersModal";
import {OpenAnswer} from "../../../model/openAnswer";
import {AddOpenAnswerModal} from "../../modals/addOpenAnswerModal";

//Modal views
// import {EditVariantModal} from "../editVariantModal/editVariantModal.component";
// import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
//

// styleUrls: ['./style.scss', './variantCell.scss', './dnd.scss'],

@Component({
    selector: 'question-cell',
    styleUrls: ['./questionCell.scss', './dnd.scss'],
    templateUrl: './questionCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionCell {
    @ViewChild('questionCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() question: Question;
    @Input() level: number = 0;
    // @Input() editVariantModal: EditVariantModal;
    @Input() insideMX: boolean;
    @Input() shouldOpenCell: boolean;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() showDevFeatures: boolean;
    @Input() showDisabled: boolean;
    @Input() inlineMode: boolean;
    // @Input() verifyActionModal: VerifyActionModal;
    // @Input() addVariantModal: AddVariantModal;
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() variantIndex: number = 0;
    @Input() poll: Poll;
    @Input() selectedId: string = "";
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onDummySearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onEditQuestionInline: EventEmitter<Question> = new EventEmitter<Question>();
    @Output() onEditAnswerInline: EventEmitter<QuestionAnswerPoll> = new EventEmitter<QuestionAnswerPoll>();
    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    ruleInputSchemaSample: string = null;
    ruleUtilitieInfo: string = null;
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    loading: boolean = false;
    highlighted = '';
    highlightedBranch = '';

    public status: { isopen: boolean } = {isopen: false};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _appState: GlobalState,
                private _featureUtils: FeatureUtilsService,
                private modalService: NbDialogService,
                ) {
        this.nextLevel = this.level + 1;
        this.containerClass = "panel panel-warning";
    }

    ngOnInit() {
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5
            });
        } else {
        }
    }

    isMainConfigCell(): boolean {
        return false;
    }

    hasSomeResults(): boolean {
        var toRet = false;
        let isDev = false
        if (this.question.stage === "PRODUCTION") {
            isDev = true
        }
        if (this.question.openAnswer) {
            if (isDev && this.question.openAnswer.nominalDev && this.question.openAnswer.nominalDev > 0) {
                toRet = true;
                return true;
            } else if (!isDev && this.question.openAnswer.nominalProd && this.question.openAnswer.nominalProd > 0) {
                toRet = true;
                return true;
            }
        }
        for (let index = 0; index < this.question.predefinedAnswers.length; index++) {
            let value = this.question.predefinedAnswers[index];
            if (isDev && value.nominalDev && value.nominalDev > 0) {
                toRet = true;
                return true;
            } else if (!isDev && value.nominalProd && value.nominalProd > 0) {
                toRet = true;
                return true;
            }
        }
        return toRet;
    }

    getLastUpdatedTime() {
        if (this.poll.stage == 'PRODUCTION') {
            return this.poll.lastResultsUpdateTimeProd;
        } else {
            return this.poll.lastResultsUpdateTimeDev;
        }
    }

    hasLastUpdatedTime(): boolean {
        return !!this.getLastUpdatedTime();
    }

    getBranchName(branchName: string) {
        if (!branchName) return null;
        let name = branchName;
        if (name == "MASTER") {
            name = "MAIN";
        }
        return name;
    }

    isAddDevelopmentSubConfig() {
        if (this.question == null) {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    isShowOptions() {
        if (this.question.stage == 'PRODUCTION') {
            var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false);
        } else {
            return (!this.isViewer());
        }

    }

    isPartOfSearch(term: string, question: Question): boolean {
        if (!term || term == "") {
            return true;
        }
        var hasDisplayNameMatch = false;
        var hasNameMatch = false;
        let lowerTerm = term.toLowerCase();
        let displayName = this.getDisplayName();
        if (displayName) {
            hasDisplayNameMatch = displayName.toLowerCase().includes(lowerTerm);
        }
        let name = this.question.questionId;
        if (name) {
            hasNameMatch = name.toLowerCase().includes(lowerTerm);
        }

        return hasDisplayNameMatch || hasNameMatch;
    }

    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.variant.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            this.updateHighlight(false);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.question);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit) {
            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.question.uniqueId), 0.5
                });

            }
            return false;
        } else {
            if (this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onDummySearchHit.emit(this.question.uniqueId), 0.5
                });

            }
            return false;
        }
    }

    getDisplayName() {
        return this.question.questionId || "";
    }

    updateHighlight(hasHit: boolean) {
        let allText = this.getDisplayName();
        if (!allText || allText.length <= 0) {
            // return;
        } else {
            this.highlighted = hasHit
                ? allText.replace(new RegExp('(' + this.searchTerm + ')', 'ig'),
                    '<span class=highlight>$1</span>')
                : allText;
        }
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
            if (this.question.hasOwnProperty(key) && valuesArr) {
                if ((typeof this.question[key] === 'string' || this.question[key] instanceof String)) {
                    for (var value of valuesArr) {
                        if (this.question[key].toLowerCase() == value.toLowerCase()) {
                            return true;
                        }
                    }
                } else if ((typeof this.question[key] === 'boolean' || this.question[key] instanceof Boolean)) {
                    for (var value of valuesArr) {
                        if (this.question[key] == value) {
                            return true;
                        }
                    }
                }
            }

        }

        // if this is MTX - iterate over all the features and see if someone is not filtered out
        return false;
    }

    isFeatureFilteredOut(feature: Feature): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
    }

    public mySearchHit(obj: any) {
        this.onSearchHit.emit(obj);
    }

    isInProduction(): boolean {
        return this.question.stage == 'PRODUCTION';
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getConfigString(): string {
        return this.question.description;
        // let toRet = "";
        // if (this.variant.configuration) {
        //     toRet = JSON.stringify(this.variant.configuration);
        // }
        // return toRet;
    }


    isShowReleaseToProduction() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isShowSendToAnalytic() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isFeatureSendToAnalytics() {
        return false;
    }

    isViewer() {
        return this._airlockService.isViewer();
    }

    isEditor() {
        return this._airlockService.isEditor();
    }

    isShowAddToGroup() {
        return (!this.isViewer());
    }

    isShowReorder() {
        return (!this.isViewer());
    }

    public myDummySearchHit(obj: any) {
        this.onDummySearchHit.emit(obj);
    }

    getMasterTooltip(): string {
        return this.getString('experiment_cell_master_variant')
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

    showEditInline(answer: PredefinedAnswer) {
        console.log("showEditInline");
        let triple = new QuestionAnswerPoll();
        triple.question = this.question;
        triple.answer = answer;
        triple.poll = this.poll;
        this.onEditAnswerInline.emit(triple);
    }

    showEditOpenAnswerInline(answer: OpenAnswer) {
        console.log("showEditInline");
        let triple = new QuestionAnswerPoll();
        triple.question = this.question;
        triple.openAnswer = answer;
        triple.poll = this.poll;
        this.onEditAnswerInline.emit(triple);
    }

    public mySelected(obj: any) {
        this.onSelected.emit(obj);
    }

    isShowAddAnswer() {
        return this.isShowOptions();
    }

    isShowAddOpenAnswer() {
        return this.isShowAddAnswer() && !this.question.openAnswer;
    }

    reorder() {
        this.modalService.open(ReorderAnswersModal, {
            closeOnBackdropClick: false,
            context: {
                _question: Question.clone(this.question)
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(null);
            }
        });
    }

    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }

    }

    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,240,256," + opac + ")";
        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133," + 1.0 + ")";
            } else {
                toRet = "rgba(220, 224, 199," + 1.0 + ")";
            }

        }
        return toRet;
    }

    colors = ["rgba(61, 126, 14, 0.9)",
        "rgba(126, 17, 10, 0.9)",
        "rgba(187, 185, 51, 0.9)",
        "rgba(42, 48, 187, 0.9)",
        "rgba(119, 167, 147, 0.9)",
        "rgba(255, 47, 49, 0.9)",
        "rgba(219, 110, 207, 0.9)",
        "rgba(78, 39, 71, 0.9)", ];

    getVariantColor() {
        var index = 3; //this.variantIndex % 8;
        if (this.isDefalut()) {
            return "darkslategray";
        }
        return this.colors[index];
    }

    getHeadBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,225,225," + 1 + ")";
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

    getHeadColorStyle() {
        let constRet = "rgba(0,0,0,1)"
        return constRet;
    }

    isQuestionActive() {
        return this.question.stage == "PRODUCTION" && this.question.enabled && this.question.rolloutPercentage > 0;
    }
    getNextBackgroundStyle() {
        return "";
        // if (!this.isOpen || this.variant.configurationRules==null || this.variant.configurationRules.length <=0) {
        //     return "";//this.getBackgroundStyle();
        // } else {
        //     var trans = this.nextLevel*0.1;
        //     let toRet = "rgba(0,0,0,"+trans+")";
        //     return toRet;
        // }

    }

    getNextLevel() {
        return this.level;
    }

    getNextColorStyle() {
        return this.getColorStyle();
        // if (!this.isOpen || this.variant.configurationRules==null || this.variant.configurationRules.length <=0) {
        //     return this.getColorStyle();
        // } else {
        //     var trans = this.nextLevel*0.1;
        //     var num = Math.floor(trans*256);
        //     let toRet = "rgba("+num+","+num+","+num+",1.0)";
        //     return toRet;
        // }

    }

    getNextFeaturePath() {
        return [...this.featuresPath, this.question];
    }

    showExpand(): boolean {
        return true;
    }

    cellClicked() {
        if (!this.isOpen) {
            this.remove = false;
            console.log("featureCell changed status:" + this.question.uniqueId);
            this.onCellClick.emit(this.question.uniqueId);
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck(), 0.5});
        } else {
            // setTimeout(() => this.isOpen = false, 0.3);
            this.isOpen = false;
            this.remove = true;
            this.onCellClick.emit(this.question.uniqueId);
        }
        this.cd.markForCheck();
    }

    transitionEnd() {
        // console.log('transitionEnd');
        if (!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {

    }

    openAddOpenAnswerDialog() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this.modalService.open(AddOpenAnswerModal, {
            closeOnBackdropClick: false,
            context: {
                poll: this.poll,
                question: this.question,
                title: "Add Open Answer",
            }
        }).onClose.subscribe(item => {
            if (item) {
                let triple = new QuestionAnswerPoll();
                triple.question = this.question;
                triple.openAnswer = item;
                triple.poll = this.poll;
                this.onEditAnswerInline.emit(triple);
            }
            this.onUpdate.emit(null);
        });
    }

    openAddAnswerDialog() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this.modalService.open(AddAnswerModal, {
            closeOnBackdropClick: false,
            context: {
                poll: this.poll,
                question: this.question,
                title: "Add Answer",
            }
        }).onClose.subscribe(item => {
            if (item) {
                let triple = new QuestionAnswerPoll();
                triple.question = this.question;
                triple.answer = item;
                triple.poll = this.poll;
                this.onEditAnswerInline.emit(triple);
            }
            this.onUpdate.emit(null);
        });
    }

    getPopularAnswerIdx() {
        let toRet = -1;
        let currPercentage = 0.0;
        let answers = this.question.predefinedAnswers || [];
        let ansLength = answers.length;
        for (let i = 0 ; i < ansLength; ++i) {
            let ans = answers[i];
            if (this.poll.stage === "PRODUCTION") {
                if (ans.percentageProd && ans.percentageProd > currPercentage) {
                    currPercentage = ans.percentageProd;
                    toRet = i;
                }
            } else {
                if (ans.percentageDev && ans.percentageDev > currPercentage) {
                    currPercentage = ans.percentageDev;
                    toRet = i;
                }
            }

        }

        if (this.poll.stage === "PRODUCTION") {
            if (this.question.openAnswer && this.question.openAnswer.percentageProd && this.question.openAnswer.percentageProd > currPercentage) {
                toRet = ansLength;
            }
        } else {
            if (this.question.openAnswer && this.question.openAnswer.percentageDev && this.question.openAnswer.percentageDev > currPercentage) {
                toRet = ansLength;
            }
        }

        return toRet;
    }

    isDefalut() {
        return false;
    }

    openEditDialog(event: Event, isInline: boolean = true) {
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            this.onEditQuestionInline.emit(this.question);
            return;
        }

        if (this.ruleUtilitieInfo != null && this.ruleInputSchemaSample != null) {
            console.log("SKIPPING utilities and inputSchema");
            this.modalService.open(EditQuestionModal, {
                closeOnBackdropClick: false,
                context: {
                    question: null,
                    title: this.getString("edit_variant_title"),
                    ruleInputSchemaSample: this.ruleInputSchemaSample,
                    ruleUtilitiesInfo: this.ruleUtilitieInfo,
                }
            })
            // this.editVariantModal.open(this.variant, this.availableBranches.availableInAllSeasons, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this);
        } else {
            console.log("RETRIEVING utilities and inputSchema");
            console.log(this.ruleUtilitieInfo);
            console.log(this.ruleInputSchemaSample);
            this.beforeUpdate.emit(null);
            this._airlockService.getExperimentUtilitiesInfo(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result1 => {
                this.ruleUtilitieInfo = result1 as string;
                console.log('UtilityInfo:');
                console.log(this.ruleUtilitieInfo);
                this._airlockService.getExperimentInputSample(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result2 => {
                    this.ruleInputSchemaSample = result2 as string;
                    console.log('Input Schema Sample');
                    console.log(this.ruleInputSchemaSample);
                    this.hideIndicator.emit(this.question);
                    this.modalService.open(EditVariantModal, {
                        closeOnBackdropClick: false,
                        context: {
                            variant: null,
                            title: this.getString("edit_variant_title"),
                            ruleInputSchemaSample: this.ruleInputSchemaSample,
                            ruleUtilitiesInfo: this.ruleUtilitieInfo,
                            variantCell: null,
                        }
                    }).onClose.subscribe(reload => {
                        if (reload) {
                            this.onUpdate.emit(null);
                        }
                    });
                    // this.editVariantModal.open(this.variant, this.availableBranches.availableInAllSeasons, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this);
                }).catch(error => {
                    console.log('Error in getting Experiment Input Schema Sample');
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
        }
    }

    openDefault() {
        // this.beforeUpdate.emit(null);
        // this._airlockService.getUtilitiesInfo(this.variant.seasonId, this.variant.stage, this.variant.minAppVersion).then(result => {
        //     this.ruleUtilitieInfo = result;
        //     console.log('UtilityInfo:');
        //     console.log(this.ruleUtilitieInfo);
        //     this._airlockService.getInputSample(this.variant.seasonId, this.variant.stage, this.variant.minAppVersion).then(result => {
        //         this.ruleInputSchemaSample = result;
        //         console.log('Input Schema Sample');
        //         console.log(this.ruleInputSchemaSample);
        //         this.hideIndicator.emit(this.variant);
        //         this.editFeatureModal.open(this.branch, this.sourceFeature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, null, true);
        //     }).catch(error => {
        //         console.log('Error in getting Input Schema Sample');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
        //         this._airlockService.notifyDataChanged("error-notification",errorMessage);
        //         this.hideIndicator.emit(error);
        //     });
        // }).catch(error => {
        //     console.log('Error in getting Input Schema Sample');
        //     let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get UtilityString");
        //     this._airlockService.notifyDataChanged("error-notification",errorMessage);
        //     this.hideIndicator.emit(error);
        // });

    }

    openAddDialog() {
        //console.log('BEFORE OPEN CONFIG ADD:', this.variant);
        //console.log('BEFORE OPEN CONFIG ADD PARENT FEATURE:', this.variant.parent);
        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.variant.uniqueId,this.variant.name, this.variant.namespace);
    }

    shouldStyleCell() {
        return false;
        // if ((this.variant.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.variant.configurationRules.length > 1)) {
        //     return true;
        // }
        // else if (this.insideMX && !this.isOpen) {
        //     return false;
        // }/*else  if (this.level > 0 && !this.insideMX) {
        //     return true;
        // }*/
        // else if (this.level==0 || this.isOpen==true || (this.variant.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' && this.variant.configurationRules.length > 1)) {
        //     return true;
        // } else {
        //     return false;
        // }
    }

    isSubFeature() {
        if (this.level > 0 && !this.insideMX) {
            return true;
        } else {
            return false;
        }
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

    isCellOpen(featureID: string): boolean {
        var index = this.openFeatures.indexOf(featureID, 0);
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
        if (this.question.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this question to development?';
        } else {
            message = 'Are you sure you want to release this question to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the question id to validate your decision.`;
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                question: this.question,
                text: message,
                verifyModalDialogType: VerifyDialogType.QUESTION_TYPE,
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
        if (this.question.stage == 'PRODUCTION') {
            this.question.stage = 'DEVELOPMENT';
            isRevert = true;
        } else {
            this.question.stage = 'PRODUCTION';
        }

        this._airlockService.updatePollQuestion(this.question).then(question => {
            this.question = question;
            this.onUpdate.emit(this.question);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Question stage changed successfully"
            });
        }).catch(error => {
            let defErrorMessage = "Failed to change Question stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change variant stage. If this item has variants or sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    getDeleteColor() {
        if (this.question.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    delete() {
        this.popover.hide();
        if (this.question.stage == 'PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this question (' + this.getDisplayName() + ")?";

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
        let variantName = this.getDisplayName();
        this._airlockService.deletePollQuestion(this.question.uniqueId).then(resp => {
            this.onUpdate.emit(resp);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "The question " + variantName + " was deleted"
            });


        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete variant");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    changeSendToAnalytic() {
        // if (this.isFeatureSendToAnalytics()){
        //     this.beforeUpdate.emit(null);
        //     console.log('delete variant from send to Analytic');
        //     this._airlockService.deleteFeatureSendToAnalytic(this.variant).then(feature => {
        //         this.variant = feature;
        //         this.onUpdate.emit(this.variant);
        //     }).catch(error => {
        //         console.log('Error in delete variant to send to Analytic');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic");
        //         this._airlockService.notifyDataChanged("error-notification", errorMessage);
        //         this.hideIndicator.emit(error);
        //     });
        // }
        // else {
        //     this.beforeUpdate.emit(null);
        //     console.log('update variant to send to Analytic');
        //     this._airlockService.updateFeatureSendToAnalytic(this.variant).then(feature => {
        //         this.variant = feature;
        //         this.onUpdate.emit(this.variant);
        //     }).catch(error => {
        //         console.log('Error in update variant to send to Analytic');
        //         let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
        //         this._airlockService.notifyDataChanged("error-notification", errorMessage);
        //         this.hideIndicator.emit(error);
        //
        //     });
        // }
    }

    shouldShowUserGroups() {
        if (this.question.stage == 'DEVELOPMENT' &&
            !(this.question.internalUserGroups == null || this.question.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.question.internalUserGroups == null || this.question.internalUserGroups.length <= 0)) {
            toRet = this.question.internalUserGroups.toString();
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {
        let message = this.isFeatureSendToAnalytics() ? this.getString('analytics_stop_report_config') + this.getDisplayName() + this.getString('analytics_report_config_suffix') : this.getString('analytics_report_config') + this.getDisplayName() + this.getString('analytics_report_config_suffix');
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this.changeSendToAnalytic();
            }
        });
    }

    isPartOfBranch(): boolean {
        return true;
    }

    partOfBranch() {
        return true;
    }

    isSelected() {
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.question.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.question.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.question);
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
        if (this.selectedId && this.selectedId.length > 0 && this.selectedId == this.question.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.question.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }

    getSubtitleMessage(): string {
        return this.question?.title;
    }
}
