import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'reorder-variants-modal',
    styleUrls: ['./reorderVariantsModal.scss'],
    templateUrl: './reorderVariantsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ReorderVariantsModal {

    _experiment: Experiment = null;
    _selectedIndex: number = 0;
    _selectedTarget: Experiment = null;
    loading: boolean = false;
    private sub: any = null;
    @Output() onReorderVariants = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderVariantsModal>) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(experiment: Experiment) {
        // if (this.modal){
        //
        // this._experiment = Experiment.clone(experiment);
        // this.modal.open();
        // }
    }

    getName(item: Experiment): string {
        if (item && item.name) {
            return item.name;
        }
        return "";
    }

    shouldShowMaxOnSection(): boolean {

        return false;
    }


    getChildren(): Variant[] {
        if (this._experiment && this._experiment.variants) {
            return this._experiment.variants;
        } else {
            return null;
        }

    }


    selectTarget(experiment: Experiment, index: number) {

        if (this._selectedTarget == experiment && this._selectedIndex == index) {
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = experiment;
            this._selectedIndex = index;
        }
    }

    save() {
        this._save();
    }

    _save() {

        this.loading = true;
        this._airLockService.updateExperiment(this._experiment).then(result => {
            this.loading = false;
            this.onReorderVariants.emit(null);
            this.close();
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

    close() {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.modalRef.close();
    }

    moveUp() {
        if (this._selectedIndex == 0 || this._selectedTarget == null) {

        } else {
            var oldVal: Variant = this.getChildren()[this._selectedIndex - 1];
            this.getChildren()[this._selectedIndex - 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex--;
        }
    }

    moveDown() {
        if (this._selectedIndex == this.getChildren().length - 1 || this._selectedTarget == null) {

        } else {
            var oldVal: Variant = this.getChildren()[this._selectedIndex + 1];
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


    //////////////////////////////////////////

}

