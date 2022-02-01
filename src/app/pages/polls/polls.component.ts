import {Component, ViewChild} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {Analytic} from "../../model/analytic";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {AnalyticsDisplay} from "../../model/analyticsDisplay";
import {AnalyticsQuota} from "../../model/analyticsQuota";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {NbDialogService, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {ActivatedRoute} from "@angular/router";
import {AddPollModal} from "../../@theme/modals/addPollModal";
import {Poll} from "../../model/poll";
import {Question} from "../../model/question";
import {EditPollModal} from "../../@theme/airlock.components/editPollModal";
import {EditQuestionModal} from "../../@theme/modals/editQuestionModal";
import {PollQuestionPair} from "../../model/pollQuestionPair";
import {EditAnswerModal} from "../../@theme/modals/editAnswerModal";
import {QuestionAnswerPoll} from "../../model/questionAnswerPoll";
import {PredefinedAnswer} from "../../model/predefinedAnswer";
import {EditOpenAnswerModal} from "../../@theme/modals/editOpenAnswerModal/editOpenAnswerModal.component";
import {ImportPollsModal} from "../../@theme/modals/importPollsModal";
import {LimitPollsModal} from "../../@theme/modals/limitPollsModal";
import {AirlockPolls} from "../../model/airlockPolls";
import {PollsCalendarViewModal} from "../../@theme/airlock.components/pollCalendarViewModal";

@Component({
    selector: 'pollsPage',
    styleUrls: ['./polls.scss', './sideNavStyle.scss'],
    templateUrl: './polls.html'
})


export class PollsPage {
    @ViewChild("editInline") editPollInline: EditPollModal;
    @ViewChild("editQuestionInline") editQuestionInline: EditQuestionModal;
    @ViewChild("calendarViewInline") calendarViewInline: PollsCalendarViewModal;
    @ViewChild("editAnswerInline") editAnswerInline: EditAnswerModal;
    @ViewChild("editOpenAnswerInline") editOpenAnswerInline: EditOpenAnswerModal;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    inlineMode: boolean = false;
    inlineQuestionMode: boolean = false;
    inlineCalendarMode: boolean = false;
    inlineAnswerMode: boolean = false;
    inlineOpenAnswerMode: boolean = false;
    public checkModel: any = {left: false, middle: true, right: false};
    possibleUserGroupsList: Array<string> = [];
    valid: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    selectedProduct: Product;
    loading: boolean = false;
    openPolls: Array<string> = [];
    filteredItems: Array<string> = new Array<string>();
    showDialog = false;
    searchQueryString: string = null;
    analyticDataForDisplay: AnalyticsDisplay;
    selectedId = null;
    selectedIndex = -1;
    polls: Poll[];
    airlockPolls: AirlockPolls;
    scrolledToSelected = false;
    totalAnaliticsQuota: AnalyticsQuota;
    analyticData: Analytic;
    private DUMMY_APP_MAX_VERSION: string = '100';
    showAnalytics: boolean = true;
    canImportExport: boolean = true;

    public status: { isopen: boolean } = {isopen: false};
    private pathPollId: any;
    private pathQuestionId: any;
    private pathAnswerId: any;
    private isOpenAnswerIdDeepLink: boolean;


    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalService: NbDialogService,
                private route: ActivatedRoute) {
        this.loading = true;
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions() {
        if (this.selectedProduct == null) {
            return false;
        }
        return (!this._airlockService.isViewer());
    }

    isViewer(): boolean {
        return this._airlockService.isViewer();
    }


    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest: boolean) {

    }

    hasSomeData(): boolean {
        if (this.searchQueryString && this.searchQueryString.length > 0) {
            return (this.filteredItems.length) > 0;
        }
        return true;
    }

    getWhitelistCount() {
        let count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.productionItemsReportedToAnalytics;
        }
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.developmentItemsReportedToAnalytics;
        }
        return count;
    }


    static getCurrentProductFromSeason(products: Product[], currentSeason: Season): Product {
        if (currentSeason) {
            if (products.length > 0) {
                console.log("products.length > 0!");
                for (let p of products) {
                    let currProd: Product = p;
                    if (currProd.uniqueId == currentSeason.productId) {
                        return currProd;
                    }
                }
            }
        }
        if (products.length > 0) {
            console.log("return first product");
            return products[0];
        } else {
            console.log("return null from getCurrentProductFromSeason");
            return null;
        }
    }

    static getCurrentSeasonFromSeason(seasons: Season[], currentSeason: Season): Season {
        if (currentSeason) {
            for (let s of seasons) {
                let currSeas: Season = s;
                if (currSeas.uniqueId == currentSeason.uniqueId) {
                    return currSeas;
                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length - 1];
        } else {
            return null;
        }
    }

    ngOnInit() {
        this.showAnalytics = this._appState.canUseAnalytics();
        //let currSeason = this._appState.getData('features.currentSeason');
        // let isLatestStr = this._appState.getData('features.isLatestSeason');
        // let currProduct = this._appState.getData('features.currentProduct');
        this._appState.subscribe('features.currentProduct', 'exp', (product) => {
            this.onProductSelection(product);
        });
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let pollId = params.pollId;
            let questionId = params.questionId;
            let answerId = params.answerId;
            let openAnswerId = params.openAnswerId;
            if (prodId) {
                console.log("going to edit mode")
                this._appState.notifyDataChanged('features.pathProductId', prodId);
                this.pathPollId = pollId;
                this.pathQuestionId = questionId;
                this.pathAnswerId = answerId;
                this.isOpenAnswerIdDeepLink = openAnswerId != null;
            } else {
                this.onProductSelection(this._appState.getData('features.currentProduct'));
                this.pathPollId = null;
                this.pathQuestionId = null;
                this.pathAnswerId = null;
                this.isOpenAnswerIdDeepLink = false;
            }
        });
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'exp');
    }

    onProductSelection(product: Product) {
        if (product.uniqueId != this.selectedProduct?.uniqueId || !this.polls) {
            this.selectedProduct = product;
            this.showAnalytics = this._appState.canUseAnalytics();
            this._airlockService.getUserGroups(this.selectedProduct).then(response => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
            this.getPolls();
        }
    }

    getPolls(poll: Poll = null) {
        if (this.selectedProduct) {
            this.loading = true;
            this._airlockService.getPolls(this.selectedProduct.uniqueId).then((airlockPolls) => {
                this.airlockPolls = airlockPolls;
                this.polls = airlockPolls.polls;
                if (this.pathPollId) {
                    let pathPoll = this.getItemWithId(this.pathPollId);
                    if (pathPoll) {
                        this.showEditPoll(pathPoll);
                    }
                    this.pathPollId = null;
                }
                if (poll != null) {
                    this.showEditInline(this.getItemWithId(poll.uniqueId));
                }
                if (this.pathAnswerId) {
                    console.log("showEditAnswer")
                    let pathQuestion = this.getQuestionWithId(this.pathQuestionId);
                    let answer = this.getAnswerWithId(pathQuestion, this.pathAnswerId);
                    this.showEditAnswer(pathQuestion, answer);
                } else if (this.isOpenAnswerIdDeepLink) {
                    let pathQuestion = this.getQuestionWithId(this.pathQuestionId);
                    this.showOpenAnswerEdit(pathQuestion);
                } else {
                    if (this.pathQuestionId) {
                        let pathQuestion = this.getQuestionWithId(this.pathQuestionId);
                        if (pathQuestion) {
                            this.showEditQuestion(pathQuestion);
                        }
                    }
                }
                this.loading = false;
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    getItemWithId(fId: string): Poll {
        for (let poll of this.polls) {
            if (poll.uniqueId === fId) {
                return poll
            }
        }
        return null;
    }

    private getQuestionWithId(pathQuestionId: any) {
        for (let poll of this.polls) {
            for (let question of poll.questions) {
                if (question.uniqueId === pathQuestionId) {
                    return question;
                }
            }
        }
        return null;
    }

    pollChangedStatus(pollID: string) {
        console.log("poll changed status:" + pollID);
        var index = this.openPolls.indexOf(pollID, 0);
        if (index > -1) {
            this.openPolls.splice(index, 1);
        } else {
            this.openPolls.push(pollID);
        }
    }

    isCellOpen(expID: string): boolean {
        var index = this.openPolls.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddExperiment() {
        return !this._airlockService.isViewer();
    }

    public addPoll() {
        this.modalService.open(AddPollModal, {
            context: {
            }
        }).onClose.subscribe(poll => {
            if (poll != null ) {
                this.refreshTable(poll);
            }
        });
    }

    setShowConfig(show: boolean) {
        this.showConfig = show;
        if (show) {
            this.filterlistDict["type"] = [];
        } else {
            this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        }
        this.createFilteredList();
    }

    setShowDevFeatures(show: boolean) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        } else {
            this.filterlistDict["stage"] = ["development"];
        }
        this.createFilteredList();
    }

    setShowDisabled(show: boolean) {
        this.showDisabled = show;
        if (show) {
            this.filterlistDict["enabled"] = [];
        } else {
            this.filterlistDict["enabled"] = [false];
        }
        this.createFilteredList();
    }


    public refreshTable(poll = null) {
        this.getPolls(poll);
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }

    public deleteFeature(feature: Feature) {

    }

    public changeStateHandler(feature: Experiment) {
        console.log('in changeFeatureState():' + this._airlockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage = 'PRODUCTION';
        }
    }

    experimentIsInFilter(expID: string) {
        // this.filteredExperiments.push(expID);
    }

    variantIsNotInFilter(varID: string) {
        // this.filteredExperiments.push(varID);
        // this.filteredVariants.push(varID);
    }

    public experimentAdded(experiment: Experiment) {
        this.getPolls();
    }

    public updateExperiment(experiment: Experiment) {
        this.getPolls();
    }

    public variantAdded() {
        this.getPolls();
    }

    public onSearchQueryChanged(term: string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    reorder() {
        // this.modalService.open(ReorderExperimentsModal, {
        //     closeOnBackdropClick: false,
        //     context: {
        //         _experimentsContainer: ExperimentsContainer.clone(this.experimentsContainer)
        //     }
        // })
    }

    experimentsReordered(obj: any) {
        this.getPolls();
    }

    itemIsSelected(itemObj: any) {
        itemObj.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    checkIfInView(top: number) {
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if (offset > window.innerHeight || offset < 0) {
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top - 200;
                return false;
            }
        }
        return true;
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to load Experiments. Please try again.";
        console.log("handleError in Experiments:" + errorMessage);
        this.create(errorMessage);
    }

    createFilteredList() {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0 && this.polls) {
            for (var exp of this.polls) {
                this.isFilteredOut(exp);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    shouldExperimentBeFilteredOut(feature: any): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    console.log(feature[key]);
                    if (feature[key].toString().toLowerCase() == value.toString().toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        //now check if has children which are not being filtered out
        if (feature.variants) {
            for (var subFeat of feature.variants) {
                let isFiltered = this.shouldExperimentBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }

        return isFilteredOut;
    }

    isFilteredOut(experiment: Poll): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldExperimentBeFilteredOut(experiment)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, experiment);
        if (hasSearchHit) {
            this.filteredItems.push(experiment.uniqueId);
        }
        if (experiment.questions) {
            for (var sub of experiment.questions) {
                this.isVariantFilteredOut(sub);
            }
        }

        return !hasSearchHit;
    }

    isVariantFilteredOut(variant: Question): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldExperimentBeFilteredOut(variant)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isVariantPartOfSearch(this.searchQueryString, variant);
        if (hasSearchHit) {
            this.filteredItems.push(variant.uniqueId);
        }
        return !hasSearchHit;
    }

    isPartOfSearch(term: string, experiment: Poll): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = experiment.pollId;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.title;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    isVariantPartOfSearch(term: string, variant: Question): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = variant.pollId || "";
        let name = variant.title || "";
        if ((!displayName && !name)) {
            return false;
        }
        return displayName.toLowerCase().includes(lowerTerm) || name.toLowerCase().includes(lowerTerm);
    }


    showNextSearchResult(forward: boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length - 1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length - 1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    create(message: string) {
        this.toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }


    private showEditQuestion(pathQuestion: any) {
        let poll = this.getItemWithId((pathQuestion as Question).pollId);
            this.modalService.open(EditQuestionModal, {
                closeOnBackdropClick: false,
                context: {
                    inlineMode: false,
                    visible: true,
                    question: Question.clone(pathQuestion),
                    poll: Poll.clone(poll),
                    title: this.getString("edit_question_title"),
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.refreshTable();
                }
            });
    }

    private showEditAnswer(pathQuestion: any, pathAnswer: any) {
        console.log("showEditAnswer")
        this.modalService.open(EditAnswerModal, {
            closeOnBackdropClick: false,
            context: {
                inlineMode: false,
                visible: true,
                question: Question.clone(pathQuestion),
                answer: PredefinedAnswer.clone(pathAnswer),
                origAnswer: PredefinedAnswer.clone(pathAnswer),
                title: this.getString("edit_question_title"),
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
    }

    private showOpenAnswerEdit(pathQuestion: any) {
        console.log("showEditAnswer")
        this.modalService.open(EditOpenAnswerModal, {
            closeOnBackdropClick: false,
            context: {
                answer: pathQuestion.openAnswer,
                inlineMode: false,
                visible: true,
                question: Question.clone(pathQuestion),
                title: this.getString("edit_question_title"),
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
    }



    private showEditPoll(pathPoll: Poll) {
        this.modalService.open(EditPollModal, {
            closeOnBackdropClick: false,
            context: {
                inlineMode: false,
                visible: true,
                poll: pathPoll
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
    }

    // private getQuestionWithId(pathVariantId: any) {
    //     for (let poll of this.polls) {
    //         for (let question of poll.questions) {
    //             if (question.uniqueId === pathVariantId) {
    //                 return {
    //                     question: question,
    //                     poll: poll
    //                 }
    //             }
    //         }
    //     }
    //     return null;
    // }

    toggleCalendarView() {
        if (this.inlineCalendarMode) {
            this.inlineCalendarMode = false;
            this.inlineMode = false;
        } else {
            this.showCalendarView();
        }
    }

    reorderPolls() {

    }
    showCalendarView() {
        let callback = (result: boolean): void => {
            if (result) {
                this.inlineMode = true;
                this.inlineAnswerMode = false;
                this.inlineOpenAnswerMode = false;
                this.inlineQuestionMode = false;
                this.inlineCalendarMode = true;
                this.calendarViewInline.open(this.polls);
            }
        }
        if (this.inlineQuestionMode) {
            this.editQuestionInline.canMoveOn(callback);
        } else if (this.inlineAnswerMode) {
            this.editAnswerInline.canMoveOn(callback);
        } else if (this.inlineOpenAnswerMode) {
            this.editOpenAnswerInline.canMoveOn(callback);
        } else if (this.inlineMode) {
            this.editPollInline.canMoveOn(callback);
        } else {
            callback(true);
        }
    }
    showEditQuestionInline(item: any) {
        let callback = (result: boolean): void => {
            if (result) {
                let pair = item as PollQuestionPair;
                let question = item.question;
                let poll = item.poll;
                this.inlineQuestionMode = true;
                this.inlineMode = true;
                this.inlineAnswerMode = false;
                this.inlineOpenAnswerMode = false;
                this.inlineCalendarMode = false;
                this.editQuestionInline.open(question, poll, null, null, null);
            }
        }
        if (this.inlineAnswerMode) {
            this.editAnswerInline.canMoveOn(callback);
        } else if (this.inlineOpenAnswerMode) {
            this.editOpenAnswerInline.canMoveOn(callback);
        } else if (this.inlineMode) {
            this.editPollInline.canMoveOn(callback);
        } else {
            callback(true);
        }

    }

    showEditAnswerInline(questionAnswerPoll: QuestionAnswerPoll) {
        let callback = (result: boolean): void => {
            if (result) {
                this.inlineQuestionMode = false;
                this.inlineMode = true;
                this.inlineAnswerMode = false;
                this.inlineOpenAnswerMode = false;
                this.inlineCalendarMode = false;
                if (questionAnswerPoll.answer != null) {
                    this.inlineAnswerMode = true;
                    this.editAnswerInline.open(questionAnswerPoll.answer, questionAnswerPoll.question, questionAnswerPoll.poll,  null, null, null);
                } else if (questionAnswerPoll.openAnswer != null) {
                    this.inlineOpenAnswerMode = true;
                    this.editOpenAnswerInline.open(questionAnswerPoll.openAnswer, questionAnswerPoll.question, questionAnswerPoll.poll,  null, null, null);
                }
            }
        }
        if (this.inlineQuestionMode) {
            this.editQuestionInline.canMoveOn(callback);
        } else if (this.inlineAnswerMode) {
            this.editAnswerInline.canMoveOn(callback);
        } else if (this.inlineOpenAnswerMode) {
            this.editOpenAnswerInline.canMoveOn(callback);
        } else if (this.inlineMode) {
            this.editPollInline.canMoveOn(callback);
        } else {
            callback(true);
        }


    }
    showEditInline(item: any) {
        // console.log("showEditExperimentInline");
        //
        let callback = (result: boolean): void => {
            if (result) {
                this.inlineQuestionMode = false;
                this.inlineOpenAnswerMode = false;
                this.inlineAnswerMode = false;
                this.inlineCalendarMode = false;
                this.inlineMode = true;
                this.editPollInline.open(item, null, null, null);
            }
        }
        if (this.inlineQuestionMode) {
            this.editQuestionInline.canMoveOn(callback);
        } else if (this.inlineAnswerMode) {
            this.editAnswerInline.canMoveOn(callback);
        } else if (this.inlineOpenAnswerMode) {
            this.editOpenAnswerInline.canMoveOn(callback);
        } else {
            callback(true);
        }
    }
    closeEditInline(wasUpdated) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.inlineQuestionMode = false;
        this.inlineAnswerMode = false;
        this.inlineCalendarMode = false;
        this.loading = false;
        if (wasUpdated) {
            this.getPolls();
        }
    }

    private getAnswerWithId(pathQuestion: Question, pathAnswerId: any) {
        for (let answer of pathQuestion.predefinedAnswers) {
            if (answer.answerId === pathAnswerId) {
                return answer;
            }
        }
        return null;
    }

    importPoll() {
        this.popover.hide();
        this.modalService.open(ImportPollsModal, {
            closeOnBackdropClick: false,
            context: {
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

    canLimitPolls() {
        return true;
    }

    limitPolls() {
        let airlockPolls = this.airlockPolls;
        this.modalService.open(LimitPollsModal, {
            closeOnBackdropClick: false,
            context: {
                _polls: airlockPolls
            }
        })
    }
}

