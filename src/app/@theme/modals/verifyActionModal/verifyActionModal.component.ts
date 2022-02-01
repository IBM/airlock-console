import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { AirlockService } from "../../../services/airlock.service";
import { Feature } from "../../../model/feature";
import { Experiment } from "../../../model/experiment";
import { Variant } from "../../../model/variant";
import { StringsService } from "../../../services/strings.service";

import { Subject } from 'rxjs';
import { Stream } from "../../../model/stream";
import { AirlockNotification } from "../../../model/airlockNotification";
import {Cohort} from "../../../model/cohort";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Poll} from "../../../model/poll";
import {Question} from "../../../model/question";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";
import {OpenAnswer} from "../../../model/openAnswer";

export enum VerifyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE,
    STREAM_TYPE,
    NOTIFICATION_TYPE,
    ORDERING_RULE_TYPE,
    ENTITELMENT_TYPE,
    PURCHASE_OPTION_TYPE,
    STREAMS_HISTORY_TYPE,
    COHORT_TYPE,
    POLL_TYPE,
    QUESTION_TYPE,
    ANSWER_TYPE,
    OPEN_ANSWER_TYPE,
    DELETE_USER_TYPE
}

@Component({
    selector: 'verify-action-modal',
    styleUrls: ['./verifyActionModal.scss'],
    templateUrl: './verifyActionModal.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerifyActionModal {
    loading: boolean = false;
    validationNameString: string = "";
    feature: Feature = null;
    experiment: Experiment = null;
    variant: Variant = null;
    stream: Stream = null;
    answer: PredefinedAnswer = null;
    openAnswer: OpenAnswer = null;
    cohort: Cohort = null;
    poll: Poll = null;
    question: Question = null;
    notification: AirlockNotification = null;
    confirmSubfeatureStageChange: boolean = false;
    confirmRecursiveStageChange: boolean = false;
    title: string = 'Attention';
    verifyModalDialogType: VerifyDialogType = VerifyDialogType.FEATURE_TYPE;
    text: string = 'Are you sure you want to perform this action?';
    showDiscard: boolean = false;
    // @Output() onActionApproved = new EventEmitter();
    // private actionApproved = new Subject<string>();
    // actionApproved$ = this.actionApproved.asObservable();
    // private actionCanceld = new Subject<string>();
    // actionCanceld$ = this.actionCanceld.asObservable();
    // private actionDiscard = new Subject<string>();
    // actionDiscard$ = this.actionDiscard.asObservable();

    constructor(private _airLockService: AirlockService,
                private cd: ChangeDetectorRef, private toastrService: NbToastrService, private _stringsSrevice: StringsService,
                protected modalRef: NbDialogRef<VerifyActionModal>) {
    }

    approve(value: string) {
        // this.actionApproved.next(value);
    }

    ngOnInit() {
        console.log("VerifyActionModal inside open");
        if (this.modalRef) {
            this.cd.markForCheck();

        }
    }


    open(text: string = "Are you sure you want to perform this action?", selectedObject: any = null, dialogType: VerifyDialogType = VerifyDialogType.FEATURE_TYPE, confirmSubfeatureStageChange: boolean = false, title: string = "Attention", showDiscard: boolean = false) {
        console.log("VerifyActionModal inside open");
        this.text = text;
        this.title = title;
        this.verifyModalDialogType = dialogType;
        this.confirmSubfeatureStageChange = confirmSubfeatureStageChange;
        this.confirmRecursiveStageChange = false;
        this.showDiscard = showDiscard;
        console.log("what type:", typeof selectedObject);

        switch (this.verifyModalDialogType) {
            case VerifyDialogType.FEATURE_TYPE:
                this.feature = selectedObject;
                break;
            case VerifyDialogType.PURCHASE_OPTION_TYPE:
                this.feature = selectedObject;
                break;
            case VerifyDialogType.ENTITELMENT_TYPE:
                this.feature = selectedObject;
                break;
            case VerifyDialogType.CONFIGURATION_TYPE:
                this.feature = selectedObject;
                break;
            case VerifyDialogType.ORDERING_RULE_TYPE:
                this.feature = selectedObject;
                break;

            case VerifyDialogType.EXPERIMENT_TYPE:
                this.experiment = selectedObject;
                break;
            case VerifyDialogType.POLL_TYPE:
                this.poll = selectedObject;
                break;
            case VerifyDialogType.QUESTION_TYPE:
                this.question = selectedObject;
                break;
            case VerifyDialogType.ANSWER_TYPE:
                this.answer = selectedObject;
                break;
            case VerifyDialogType.OPEN_ANSWER_TYPE:
                this.openAnswer = selectedObject;
                break;
            case VerifyDialogType.VARIANT_TYPE:
                this.variant = selectedObject;
                break;
            case VerifyDialogType.STREAM_TYPE:
                this.stream = selectedObject;
                break;
            case VerifyDialogType.NOTIFICATION_TYPE:
                this.notification = selectedObject;
                break;
            case VerifyDialogType.STRING_TYPE:
                break;
            case VerifyDialogType.COHORT_TYPE:
                this.cohort = selectedObject;
                break;
            default:
                console.log('Failed to detect the VerifyDialogType');
                break;
        }

        // if (this.modal) {
        //     this.cd.markForCheck();
        //
        //     this.modal.open();
        // }
    }

    getConfirmTitle() {
        if (this.confirmSubfeatureStageChange && this.validationNameString && !this.confirmRecursiveStageChange) {
            return this.getString('confirm_recursive_tooltip');
        }
        return "";
    }

    save() {
        if (this.confirmSubfeatureStageChange) {
            if (!this.validationNameString && this.feature != null || !this.confirmRecursiveStageChange) {
                return;
            }
        }
        console.log("VerifyActionModal save");
        if (this.isValid()) {
            this.approve(null);
            // this.onActionApproved.emit(null);
            this.close(1);
        } else {
            this.create('Please re-type the validation name to perform the selected action');
        }
    }

    getType(): string {
        switch (this.verifyModalDialogType) {
            case VerifyDialogType.FEATURE_TYPE:
                return "feature";
            case VerifyDialogType.PURCHASE_OPTION_TYPE:
                return "purchase option";
            case VerifyDialogType.ENTITELMENT_TYPE:
                return "entitlement";
            case VerifyDialogType.CONFIGURATION_TYPE:
                return "configuration";
            case VerifyDialogType.ORDERING_RULE_TYPE:
                return "ordering rule";
            case VerifyDialogType.EXPERIMENT_TYPE:
                return "experiment";
            case VerifyDialogType.POLL_TYPE:
                return "poll";
            case VerifyDialogType.QUESTION_TYPE:
                return "question";
            case VerifyDialogType.ANSWER_TYPE:
                return "answer";
            case VerifyDialogType.OPEN_ANSWER_TYPE:
                return "answer";
            case VerifyDialogType.VARIANT_TYPE:
                return "variant";
            case VerifyDialogType.STREAM_TYPE:
                return "stream";
            case VerifyDialogType.NOTIFICATION_TYPE:
                return "notification";
            case VerifyDialogType.STRING_TYPE:
                return "string";
            case VerifyDialogType.STREAMS_HISTORY_TYPE:
                return "your user";
            default:
                console.log('Failed to detect the VerifyDialogType');
                return "item";
        }
    }

    getName(): string {
        switch (this.verifyModalDialogType) {
            case VerifyDialogType.FEATURE_TYPE:
                return this.feature.name;
            case VerifyDialogType.PURCHASE_OPTION_TYPE:
                return this.feature.name;
            case VerifyDialogType.ENTITELMENT_TYPE:
                return this.feature.name;
            case VerifyDialogType.CONFIGURATION_TYPE:
                return this.feature.name;
            case VerifyDialogType.ORDERING_RULE_TYPE:
                return this.feature.name;
            case VerifyDialogType.EXPERIMENT_TYPE:
                return this.experiment.name;
            case VerifyDialogType.POLL_TYPE:
                return this.poll.pollId;
            case VerifyDialogType.QUESTION_TYPE:
                return this.question.questionId;
            case VerifyDialogType.ANSWER_TYPE:
                return this.answer.answerId;
            case VerifyDialogType.OPEN_ANSWER_TYPE:
                return "yes";
            case VerifyDialogType.VARIANT_TYPE:
                return this.variant.name;
            case VerifyDialogType.STREAM_TYPE:
                return this.stream.name;
            case VerifyDialogType.COHORT_TYPE:
                return this.cohort.name;
            case VerifyDialogType.NOTIFICATION_TYPE:
                return this.notification.name;
            case VerifyDialogType.STREAMS_HISTORY_TYPE:
                return this._airLockService.getUserName();
            default:
                console.log('Failed to detect the VerifyDialogType');
                break;
        }
    }

    isValid(): boolean {
        switch (this.verifyModalDialogType) {
            case VerifyDialogType.FEATURE_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VerifyDialogType.PURCHASE_OPTION_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VerifyDialogType.ENTITELMENT_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VerifyDialogType.CONFIGURATION_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VerifyDialogType.ORDERING_RULE_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;

            case VerifyDialogType.EXPERIMENT_TYPE:
                if (this.experiment == null) {
                    return false;
                }
                return this.validationNameString == this.experiment.name;
            case VerifyDialogType.POLL_TYPE:
                if (this.poll == null) {
                    return false;
                }
                return this.validationNameString == this.poll.pollId;
            case VerifyDialogType.QUESTION_TYPE:
                if (this.question == null) {
                    return false;
                }
                return this.validationNameString == this.question.questionId;
            case VerifyDialogType.ANSWER_TYPE:
                if (this.answer == null) {
                    return false;
                }
                return this.validationNameString == this.answer.answerId;
            case VerifyDialogType.OPEN_ANSWER_TYPE:
                if (this.openAnswer == null) {
                    return false;
                }
                return this.validationNameString == "yes";
            case VerifyDialogType.VARIANT_TYPE:
                if (this.variant == null) {
                    return false;
                }
                return this.validationNameString == this.variant.name;
            case VerifyDialogType.STREAM_TYPE:
                if (this.stream == null) {
                    return false;
                }
                return this.validationNameString == this.stream.name;
            case VerifyDialogType.COHORT_TYPE:
                if (this.cohort == null) {
                    return false;
                }
                return this.validationNameString == this.cohort.name;
            case VerifyDialogType.NOTIFICATION_TYPE:
                if (this.notification == null) {
                    return false;
                }
                return this.validationNameString == this.notification.name;
            case VerifyDialogType.STRING_TYPE:
                return true;
            case VerifyDialogType.STREAMS_HISTORY_TYPE:
                return this.validationNameString == this._airLockService.getUserName();
            case VerifyDialogType.DELETE_USER_TYPE:
                return true;
            default:
                return false;

        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    cancel() {
        // this.actionCanceld.next(null);
        this.close();
    }

    discard() {
        // this.actionDiscard.next(null);
        this.close(2);
    }

    close(confirmed: number = 0) {
        // this.actionApproved = new Subject<string>();
        // this.actionApproved$ = this.actionApproved.asObservable();
        // this.actionCanceld = new Subject<string>();
        // this.actionCanceld$ = this.actionCanceld.asObservable();
        // this.actionDiscard = new Subject<string>();
        // this.actionDiscard$ = this.actionDiscard.asObservable();
        this.validationNameString = "";
        this.modalRef.close(confirmed);
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to add product. Please try again.";
        console.log("handleError in addProductModal:" + errorMessage);
        console.log(error);
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
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
        position: ["right", "bottom"]
    };

    capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    create(message: string) {
        this.toastrService.danger(message, this.capitalizeFirstLetter(this.getType()) + " name does not match", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    removeAll() {
        // this._notificationService.remove();
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////
}

