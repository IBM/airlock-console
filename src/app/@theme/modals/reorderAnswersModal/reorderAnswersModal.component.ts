import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Poll} from "../../../model/poll";
import {PredefinedAnswer} from "../../../model/predefinedAnswer";
import {Question} from "../../../model/question";


@Component({
    selector: 'reorder-answers-modal',
    styleUrls: ['./reorderAnswersModal.scss'],
    templateUrl: './reorderAnswersModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ReorderAnswersModal {

    _question: Question = null;
    _selectedIndex: number = 0;
    _selectedTarget: Poll = null;
    loading: boolean = false;
    private sub: any = null;
    @Output() onReorderQuestions = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderAnswersModal>) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    // open(question: Question) {
        // if (this.modal){
        //
        // this._experiment = Experiment.clone(experiment);
        // this.modal.open();
        // }
    // }

    getId(item: PredefinedAnswer): string {
        if (item && item.answerId) {
            return item.answerId;
        }
        return "";
    }

    shouldShowMaxOnSection(): boolean {

        return false;
    }


    getChildren(): PredefinedAnswer[] {
        if (this._question) {
            return this._question.predefinedAnswers;
        } else {
            return null;
        }

    }

    selectTarget(poll: Poll, index: number) {

        if (this._selectedTarget == poll && this._selectedIndex == index) {
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = poll;
            this._selectedIndex = index;
        }
    }

    save() {
        this._save();
    }

    _save() {

        this.loading = true;
        this._airLockService.updatePollQuestion(this._question).then(result => {
            this.loading = false;
            this.onReorderQuestions.emit(true);
            this.close(true);
            this._airLockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Reorder succeeded"
            });
        }).catch(
            error => {
                console.log(`Failed to reorder: ${error}`);
                this.handleError(error);
            }
        );
    }

    close(doRefressh = false) {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.modalRef.close(doRefressh);
    }

    moveUp() {
        if (this._selectedIndex == 0 || this._selectedTarget == null) {

        } else {
            var oldVal: PredefinedAnswer = this.getChildren()[this._selectedIndex - 1];
            this.getChildren()[this._selectedIndex - 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex--;
        }
    }

    moveDown() {
        if (this._selectedIndex == this.getChildren().length - 1 || this._selectedTarget == null) {

        } else {
            var oldVal: PredefinedAnswer = this.getChildren()[this._selectedIndex + 1];
            this.getChildren()[this._selectedIndex + 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex++;
        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder.";
        console.log("handleError in reorderMXGroupModal:" + errorMessage);
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

    create(message: string) {
        this.toastrService.danger(message, "Reorder failed", {
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
}

