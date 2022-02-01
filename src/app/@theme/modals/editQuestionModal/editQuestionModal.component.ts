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
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {AceModal} from "../aceModal/aceModal.component";
import {AceExpandDialogType} from "../../../app.module";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {LayoutService} from "../../../@core/utils";
import {SaveActionModal} from "../saveActionModal";
import {AvailableBranches} from "../../../model/branch";
import {Poll} from "../../../model/poll";
import {Question} from "../../../model/question";
import {QuestionCell} from "../../airlock.components/questionCell";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";
import {Visualization} from "../../../model/visualization";

@Component({
    selector: 'edit-question-modal',
    styleUrls: ['./editQuestionModal.scss'],
    templateUrl: './editQuestionModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditQuestionModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    loading: boolean = false;
    product: Product;
    @Input() question: Question;
    poll: Poll;
    @Input() rootFeatuteGroups: Array<Feature>;
    @Input() visible = false;
    @ViewChild('general') generalTab;
    @ViewChild('ruleTab') ruleTab;
    @ViewChild('descriptionTab') descriptionTab;
    @Output() onEditQuestion = new EventEmitter<any>();
    @Output() onShowFeature = new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate: EventEmitter<any> = new EventEmitter();
    @Input() rootId: string;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    originalQuestion: Question;
    useDynamicText = false;
    useDynamicSubmitText = false;
    possibleGroupsList: Array<any> = [];
    private elementRef: ElementRef;
    availableBranches: AvailableBranches;
    availableBranchesForSelect: any[] = [];
    creationDate: Date;
    inputSampleLoaded = false;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    settingsTabActive: boolean = false;
    ruleTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    questionCell: QuestionCell = null;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(450);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    private sub: any = null;
    modalHeight: string;
    modalWidth: string;
    gotoOptions = [
        {id: "next", name: "Next"},
        {id: "end", name: "End"}];
    types = [
        {
            id: "STRING", name: "String"
        },
        {
            id: "DATE", name: "Date"
        },
        {
            id: "BOOLEAN", name: "Boolean"
        },
        {
            id: "INTEGER", name: "Integer"
        },
        {
            id: "NUMBER", name: "Number"
        }
    ];

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<EditQuestionModal>,
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
        if (this.question != null && this.question.visualization == null) {
            this.question.visualization = new Visualization();
            this.question.visualization.type = 'BAR'
        }
    }

    isDirty(): boolean {
        return this.question && this.originalQuestion && !FeatureUtilsService.isQuestionIdentical(this.question, this.originalQuestion);
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
        this.originalQuestion = null;
        this.generalTabActive = true;
        this.settingsTabActive = false;
        this.ruleTabActive = false;
        this.isShowHirarchy = false;

    }

    isValid() {
        if (this.question.questionId == null || this.question.questionId.length == 0) {
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
            if (this.question.stage == 'DEVELOPMENT' && (this.question.internalUserGroups == null || this.question.internalUserGroups.length <= 0)) {
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
                if (this.question.stage == 'PRODUCTION') {
                    console.log("open verifyActionModal");
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            question: this.question,
                            text: "Are you sure you want to change this question in production",
                            verifyModalDialogType: VerifyDialogType.QUESTION_TYPE,
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
        if (!this.question.internalUserGroups) {
            this.question.internalUserGroups = [];
        }

        var questionToUpdate: Question = this.question;


        questionToUpdate.rolloutPercentage = Number(questionToUpdate.rolloutPercentage);
        this._airLockService.updatePollQuestion(questionToUpdate).then(result => {
            this.loading = true;
            this.onEditQuestion.emit(true);
            if (dontClose) {
                questionToUpdate.lastModified = result.lastModified;
                this.refreshEditScreen(questionToUpdate);
                if (callback) {
                    this.loading = false;
                    callback(true);
                }
            } else {
                this.loading = false;
                this.close(true);
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: Question) {
        this.originalQuestion = updated;
        this.question = Question.clone(updated);
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

    close(wasUpdated = null) {
        this.visible = false;
        this.inlineMode = false;
        this.isOpen = false;
        this.onShowFeature.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close(wasUpdated);
        this.onClose.emit(wasUpdated);
    }

    canMoveOn(callback: (answer: boolean) => any) {
        if (this.loaded && this.isDirty()) {
            let message = this.question.questionId + ' has changed and not saved. do you wish to save it now?';
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
                    this.refreshEditScreen(this.originalQuestion);
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
    }

    open(question: Question, poll: Poll, availableBranches: AvailableBranches, strInputSchemaSample: string, strUtilitiesInfo: string, questionCell: QuestionCell = null) {
        if (this.loaded && this.isDirty()) {
            let message = this.question.questionId + ' has changed and not saved. do you wish to save it now?';
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
                    this._open(question, poll, availableBranches, strInputSchemaSample, strUtilitiesInfo, questionCell);
                }
            });
        } else {
            this._open(question, poll, availableBranches, strInputSchemaSample, strUtilitiesInfo, questionCell);
        }
    }
    _open(question: Question, poll: Poll, availableBranches: AvailableBranches, strInputSchemaSample: string, strUtilitiesInfo: string, questionCell: QuestionCell = null) {
        if (!question.internalUserGroups) {
            question.internalUserGroups = [];
        }
        this.visible = true;
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.originalQuestion = question;
        this.loading = false;
        this.question = Question.clone(question);

        this.poll = Poll.clone(poll);
        this.title = this.getString("edit_question_screen_title");
        this.availableBranches = availableBranches;
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.questionCell = questionCell;
        this.useDynamicText = (this.question.dynamicTitle && question.dynamicTitle.length > 0);
        this.useDynamicSubmitText = this.question.dynamicQuestionSubmitText && question.dynamicQuestionSubmitText.length > 0;
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.question.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate = new Date(this.question.creationDate);
        this.lastModificationDate = new Date(this.question.lastModified);

        this.loaded = true;
        this.ruleTabActive = false;
        //this.hirarchyTabActive = false;
        this.settingsTabActive = false;
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

    generateDynamic() {

    }

    dynamicTextUpdated(event) {
        this.question.dynamicTitle = event;
    }

    dynamicSubmitButtonTextUpdated(event) {
        this.question.dynamicQuestionSubmitText = event;
    }
    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let loadPhase2 = (result: boolean): void => {
            this._airLockService.getPollInputSample(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result3 => {
                this.ruleInputSchemaSample = result3 as string;
                this.loading = false;
                if (this.ruleUtilitiesInfo) {
                    this.inputSampleLoaded = true;
                }
            }).catch(error => {
                console.log('Error in getting Experiment  Input Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get poll Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
        this._airLockService.getPollUtilitiesInfo(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result2 => {
            this.ruleUtilitiesInfo = result2 as string;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting experiment utilities info');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get poll Utilities info ");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
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

    dynamicTextChanged(event) {
        if (!this.useDynamicText) {
            this.question.dynamicTitle = null;
        }
    }

    dynamicSubmitButtonTextChanged(event) {
        if (!this.useDynamicSubmitText) {
            this.question.dynamicQuestionSubmitText = null;
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

    addAnswer() {
        let answer = new PredefinedAnswer();
        let answers = this.question.predefinedAnswers || [];
        answers.push(answer);
        this.question.predefinedAnswers = answers;

    }
    ruleUpdated(event) {
        this.question.rule.ruleString = event;
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
    visualizationTypes = [{id: "PIE", name: "Pie"}, {id: "BAR", name: "Bar"}, {id: "TEXT", name: "Text"}];

    create(message: string) {
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }


    openAceEditorRuleExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.question.questionId;
        this.aceModalContainerDialog.showAceModal(this.question.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorExpandForDynamicTitle() {
        this.aceModalContainerDialog.showAceModal(this.question.dynamicTitle, "Dynamic Title", this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorExpandForDynamicSubmitButtonTitle() {
        this.aceModalContainerDialog.showAceModal(this.question.dynamicQuestionSubmitText, "Dynamic Question Submit Text", this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
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
                this.settingsTabActive = false;
                break;
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.ruleTabActive = true;
                this.settingsTabActive = false;
                break;
            case  'Settings':
                this.generalTabActive = false;
                this.ruleTabActive = false;
                this.settingsTabActive = true;
                break;
        }
    }

    removeAnswer(event) {
        let index = event;
        this.question.predefinedAnswers.splice(index, 1);
    }
    getInternalUserGroups() {
        return this.question?.internalUserGroups;
    }

    openOnNewTab() {
        window.open('/#/pages/polls/questions/' + this._appState.getCurrentProduct() + '/' + this.question.uniqueId);
    }
}



