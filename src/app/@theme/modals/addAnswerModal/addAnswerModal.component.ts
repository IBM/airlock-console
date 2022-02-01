import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Experiment} from "../../../model/experiment";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {Poll} from "../../../model/poll";
import {Question} from "../../../model/question";
import {OpenAnswer} from "../../../model/openAnswer";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";


@Component({
    selector: 'add-question-modal',
    styleUrls: ['./addAnswerModal.scss'],
    templateUrl: './addAnswerModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddAnswerModal {
    @Input() productId: string;
    poll: Poll;
    question: Question;
    possibleGroupsList: Array<any> = [];
    title: string = "Add Answer";
    loading: boolean = false;
    loaded: boolean = false;
    _answer: PredefinedAnswer;

    @Output() onAnswerAdded = new EventEmitter();

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                private modalRef: NbDialogRef<AddAnswerModal>) {
        this.loading = true;
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this.initAnswer();
    }

    ngOnInit() {

    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initAnswer() {
        this._answer = new PredefinedAnswer();
        this._answer.onAnswerGoto = "next";
        this._answer.enabled = true;
        this.loading = false;

    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._answer.answerId == null || this._answer.answerId.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._answer.title = this._answer.title.trim();
            let questionToUpdate = Question.clone(this.question);
            let answers = questionToUpdate.predefinedAnswers || [];
            answers.push(this._answer);
            questionToUpdate.predefinedAnswers = answers;
            this.loading = true;
            this._airLockService.updatePollQuestion(questionToUpdate).then(
                result => {
                    this.loading = false;
                    let toRet = PredefinedAnswer.clone(this._answer);
                    this.close(toRet);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New answer added"
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

    close(val = null) {
        this.loading = false;
        this.modalRef.close(val);
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

