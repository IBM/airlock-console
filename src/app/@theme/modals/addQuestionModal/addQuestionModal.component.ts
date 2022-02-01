import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Experiment} from "../../../model/experiment";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {Poll} from "../../../model/poll";
import {Question} from "../../../model/question";
import {OpenAnswer} from "../../../model/openAnswer";
import {Visualization} from "../../../model/visualization";


@Component({
    selector: 'add-question-modal',
    styleUrls: ['./addQuestionModal.scss'],
    templateUrl: './addQuestionModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddQuestionModal {
    @Input() productId: string;
    poll: Poll;
    possibleGroupsList: Array<any> = [];
    title: string = "Add Question";
    loading: boolean = false;
    loaded: boolean = false;
    _question: Question;
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

    @Output() onQuestionAdded = new EventEmitter();

    _rule: Rule;

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                private modalRef: NbDialogRef<AddQuestionModal>) {
        this.loading = true;
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this.initQuestion();
    }

    ngOnInit() {

    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initQuestion() {
        this._question = new Question();
        this._rule = new Rule();
        this._question.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._question.rule = this._rule;
        this._question.pi = false;
        this._question.enabled = true;
        this._question.type = "STRING";
        // this._question.openAnswer = new OpenAnswer();
        // this._question.openAnswer.type = "STRING";
        // this._question.openAnswer.enabled = true;

        this._question.stage = "DEVELOPMENT";
        this._question.enabled = true;
        this._question.internalUserGroups = [];
        this._question.creator = this._airLockService.getUserName();
        this._question.visualization = new Visualization();
        this._question.visualization.type = 'BAR';

        this.loading = false;

    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        return !(this._question.questionId == null || this._question.questionId.length == 0);

    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._question.pollId = this.poll.uniqueId;
            this._question.title = this._question.title?.trim();
            this.loading = true;
            this._airLockService.createPollQuestion(this.poll.uniqueId, this._question).then(
                result => {
                    this._airLockService.getPollQuestion(result.uniqueId).then(res => {
                        this.loading = false;
                        let toRet = res;
                        console.log(toRet);
                        this.onQuestionAdded.emit(toRet);
                        this.close(toRet);
                        this._airLockService.notifyDataChanged("success-notification", {
                            title: "Success",
                            message: "New question added"
                        });
                    }).catch(err => {
                        this.loading = false;
                        let toRet = Question.clone(this._question);
                        toRet.lastModified = result.lastModified || 0;
                        toRet.creationDate = toRet.creationDate || 0;
                        toRet.uniqueId = result.uniqueId;
                        console.log(toRet);
                        this.onQuestionAdded.emit(toRet);
                        this.close(toRet);
                        this._airLockService.notifyDataChanged("success-notification", {
                            title: "Success",
                            message: "New question added"
                        });
                    });

                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Question id is required.')
        }
    }

    open(experiment: Experiment, availableBranches: string[]) {

    }

    openWithoutClean() {

        // //this.parentId=parentId;
        // var $exampleMulti = $$(".js_example").select2(
        //     {
        //         tags: true,
        //         tokenSeparators: [',', ' ']
        //     }
        // );
        // console.log("internalGroups");
        // console.log(this._variant.internalUserGroups);
        //
        // $$('.js_example').on(
        //     'change',
        //     (e) => {
        //         this._variant.internalUserGroups = e.target as any;
        //
        //     }
        // );
        // $exampleMulti.val(this._variant.internalUserGroups).trigger("change");
        //
        // if (this.modal != null) {
        //     this.loaded = true;
        //     this.modal.open('md');
        // }
    }



    getBranchName(branchName: string) {
        if (!branchName) return null;
        let name = branchName;
        if (name == "MASTER") {
            name = "MAIN";
        }
        return name;
    }

    close(result = null) {
        this.loaded = false;
        this.modalRef.close(result);
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }


    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in addQuestionModal:" + errorMessage);
        this.create(errorMessage);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message: string) {
        this.toastrService.danger(message, "Question creation failed", {
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


    //////////////////////////////////////////

}

