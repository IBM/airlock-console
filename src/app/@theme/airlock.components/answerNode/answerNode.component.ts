import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input, NgZone, Optional,
    Output, ViewChild
} from '@angular/core';
import {Poll} from "../../../model/poll";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";
import {AirlockService} from "../../../services/airlock.service";
import {NbDialogRef, NbDialogService, NbMenuService, NbToastrService} from "@nebular/theme";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {GlobalState} from "../../../global.state";
import {AceExpandDialogType} from "../../../app.module";
import {AceModal} from "../../modals/aceModal/aceModal.component";
import {Question} from "../../../model/question";

@Component({
    selector: 'answer-node',
    styleUrls: ['./answerNode.scss'],
    templateUrl: './answerNode.html',
    // changeDetection: ChangeDetectionStrategy.OnPush
})

export class AnswerNode implements AfterViewInit {

    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    loading: boolean = false;
    aceEditorConfigurationHeight: string = "48px";
    useDynamicText = false;
    @Input() isOnlyDisplayMode: boolean = false;
    currAnswer: PredefinedAnswer;
    @Input() index: number;
    @Input() ruleInputSchemaSample = "";
    @Input() ruleUtilitiesInfo = "";
    @Input() question: Question;
    @Output() onDelete = new EventEmitter<any>();
    gotoOptions = [{id: "end", name: "End"},
        {id: "next", name: "Next"}];
    constructor(private _airLockService: AirlockService,
                private _featureUtils: FeatureUtilsService,
                private _stringsSrevice: StringsService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<AnswerNode>,
                private modalService: NbDialogService) {

    }
    @Input()
    set answer(ans: PredefinedAnswer) {
        this.currAnswer = ans;
        this.useDynamicText = (ans.dynamicTitle && ans.dynamicTitle.length > 0);
    }
    @Input()
    set otherQuestions(questions: Question[]) {
        let newGoto = [{id: "end", name: "End"},
            {id: "next", name: "Next"}];
        if (questions) {
            let length = questions.length;
            for (let i = 0; i < length; ++i) {
                let question = questions[i];
                if (this.question && question.uniqueId !== this.question.uniqueId) {
                    newGoto.push({id: question.uniqueId, name: question.questionId});
                }
            }
        }
        this.gotoOptions = newGoto;
    }
    isInputWarningOn(fieldValue: string) {
        return fieldValue === undefined || fieldValue === null || fieldValue == "";
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngAfterViewInit() {

    }

    openAceEditorExpand(index: number) {
        ///zzzzzzzz
        this.aceModalContainerDialog.showAceModal(this.currAnswer.dynamicTitle, "Dynamic Text", "", "", AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }

    delete() {
        this.onDelete.emit(this.index);
    }

    dynamicTextUpdated(event) {
        this.currAnswer.dynamicTitle = event;
    }
    generateDynamic() {

    }
}

