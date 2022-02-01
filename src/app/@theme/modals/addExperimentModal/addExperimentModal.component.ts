import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Experiment} from "../../../model/experiment";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {ExperimentsPage} from "../../../pages/experiments";


@Component({
    selector: 'add-experiment-modal',
    styleUrls: ['./addExperimentModal.scss'],
    templateUrl: './addExperimentModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddExperimentModal {
    productId: string;
    possibleGroupsList: Array<any> = [];
    title: string = "Add Experiment";
    loading: boolean = false;
    private isShow: boolean = true;
    _experiment: Experiment;
    _rule: Rule;
    experimentsPage: ExperimentsPage = null;

    @Output() onExperimentAdded = new EventEmitter();


    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<AddExperimentModal>) {
        this.loading = true;

        this.initExperiment();
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initExperiment() {
        this.productId = this._appState.getCurrentProduct();
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this._experiment = new Experiment();
        this._rule = new Rule();
        this._experiment.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._experiment.rule = this._rule;
        this._experiment.stage = "DEVELOPMENT";
        this._experiment.enabled = false;
        this._experiment.internalUserGroups = [];
        this._experiment.creator = this._airLockService.getUserName();
        this.loading = false;
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._experiment.name == null || this._experiment.name.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._experiment.name = this._experiment.name.trim();
            this.loading = true;
            this._airLockService.createExperiment(this.productId, this._experiment).then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onExperimentAdded.emit(result);
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New experiment added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Experiment name is required.')
        }
    }

    open() {
        this.initExperiment();
        this.title = "Add Experiment";

        /*this.openWithoutClean(parentId);*/
        // this.openWithoutClean();
    }

    // openWithoutClean() {
    //
    //     //this.parentId=parentId;
    //     var $exampleMulti = $$(".js_example").select2(
    //         {
    //             tags: true,
    //             tokenSeparators: [',', ' ']
    //         }
    //     );
    //     console.log("internalGroups");
    //     console.log(this._experiment.internalUserGroups);
    //
    //     $$('.js_example').on(
    //         'change',
    //         (e) => {
    //             this._experiment.internalUserGroups = e.target as any;
    //
    //         }
    //     );
    //     $exampleMulti.val(this._experiment.internalUserGroups).trigger("change");
    //
    //     // if (this.modal != null) {
    //     //     this.modal.open('md');
    //     // }
    // }

    close(result = null) {
        this.modalRef.close(result);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create experiment. Please try again.";
        console.log("handleError in addExperimentModal:" + errorMessage);
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
        this.toastrService.danger(message, "Experiment creation failed", {
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

