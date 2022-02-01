import {
    Component,
    EventEmitter,
    Input,
    Output, QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {Cohort} from "../../../model/cohort";
import {CohortExport} from "../../../model/cohortExport";
import {NbDialogRef, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {GlobalState} from "../../../global.state";
import {CohortsPage} from "../../../pages/cohorts/cohorts.component";


@Component({
    selector: 'add-cohort-modal',
    styleUrls: ['./addCohortModal.scss'],
    templateUrl: './addCohortModal.html',
    encapsulation: ViewEncapsulation.None
})

export class AddCohortModal {
    productId: string;
    title: string = "Add Cohort";
    loading: boolean = false;
    possibleExportKeys = ["Amplitude", "UPS", "Braze", "mParticle", "DB Only"];
    exportKey: string = "Choose Type";
    private isShow: boolean = true;
    _cohort: Cohort;
    @ViewChildren(NbPopoverDirective) popovers: QueryList<NbPopoverDirective>;
    @Output() onCohortAdded = new EventEmitter();
    cohortsPage: CohortsPage = null;
    possibleValueTypes = ["String", "Boolean", "Integer Number", "Floating Point Number", "Date", "Array", "JSON"];
    _rule: Rule;


    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private _appState: GlobalState,
                private toastrService: NbToastrService,
    protected modalRef: NbDialogRef<AddCohortModal>) {
        this.productId = this._appState.getCurrentProduct();
        this.loading = true;
        this.initCohort();
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initCohort() {
        this._cohort = new Cohort();
        this._rule = new Rule();
        this._rule.ruleString = 'true';
        this._cohort.enabled = false;
        this._cohort.updateFrequency = "MANUAL";
        this._cohort.queryAdditionalValue = "'true'";
        this._cohort.valueType = 'String';

        let newExports = {} as { string: CohortExport };
        this.exportKey = "Choose Type";
        this._cohort.exports = newExports;
        this._cohort.joinedTables = [];
        this._cohort.creator = this._airLockService.getUserName();
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
        if (this._cohort.name == null || this._cohort.name.length == 0) {
            return false;
        }
        return true;
    }

    hasExportKey(): boolean {
        return this.exportKey != null && this.exportKey.length > 0 && this._cohort.exports[this.exportKey] != null;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid() && this.hasExportKey()) {
            this._cohort.name = this._cohort.name.trim();
            this.loading = true;
            this._airLockService.createCohort(this.productId, this._cohort).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this._cohort.productId = this.productId;
                    this._cohort.creationDate = result.creationDate;
                    this._cohort.lastModified = result.lastModified;
                    let res = Cohort.clone(this._cohort);
                    this.onCohortAdded.emit(res);
                    this.cohortsPage?.refreshTable();
                    this.close(res);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New cohort added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            if (!this.hasExportKey()) {
                this.create('Choose export type.')
            } else {
                this.create('Cohort name is required.')
            }
        }
    }

    exportKeyChosen(key) {
        this.exportKey = key;
        let newExports = {} as { string: CohortExport };
        newExports[key] = new CohortExport();
        this._cohort.exports = newExports;
        // this.popover.hide();
        this.popovers.forEach(pop => {
            pop.hide();
        });
    }

    // open() {
    //     this.initCohort();
    //     this.title = "Add Cohort";
    //
    //     /*this.openWithoutClean(parentId);*/
    //     this.openWithoutClean();
    // }

    // openWithoutClean() {
    //
    //     //this.parentId=parentId;
    //     if (this.modal != null) {
    //         this.modal.open('md');
    //     }
    // }

    close(item = null) {
        this.modalRef.close(item);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create cohort. Please try again.";
        console.log("handleError in addCohortModal:" + errorMessage);
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
        this.toastrService.danger(message, "Cohort creation failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    valueTypeChosen(newVal, event: TemplateRef<any>) {
        this.popovers.forEach(pop => {
            pop.hide();
        });
        this._cohort.valueType = newVal;
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

