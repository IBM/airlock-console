import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";


@Component({
    selector: 'add-variant-modal',
    styleUrls: ['./addVariantModal.scss'],
    templateUrl: './addVariantModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddVariantModal {
    @Input() productId: string;
    experiment: Experiment;
    possibleGroupsList: Array<any> = [];
    title: string = "Add Variant";
    loading: boolean = false;
    loaded: boolean = false;
    availableBranches: string[];
    _variant: Variant;
    selectedBranch: any;

    @Output() onVariantAdded = new EventEmitter();

    _rule: Rule;

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                private modalRef: NbDialogRef<AddVariantModal>) {
        this.loading = true;
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this.initVariant();
    }

    ngOnInit(){
        if (this.availableBranches.length > 0){
            this.selectedBranch = this.availableBranches[0];
        }
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initVariant() {
        this._variant = new Variant();
        this._rule = new Rule();
        this._variant.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._variant.rule = this._rule;
        this._variant.stage = "DEVELOPMENT";
        this._variant.enabled = true;
        this._variant.internalUserGroups = [];
        this._variant.creator = this._airLockService.getUserName();
        this.loading = false;

    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._variant.name == null || this._variant.name.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._variant.branchName = this.selectedBranch
            this._variant.name = this._variant.name.trim();
            this.loading = true;
            this._airLockService.addVariant(this._variant, this.experiment.uniqueId).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onVariantAdded.emit(result);
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New variant added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Variant name is required.')
        }
    }

    open(experiment: Experiment, availableBranches: string[]) {
        // this.experiment = experiment;
        // this.availableBranches = availableBranches;
        // this.initVariant();
        // this.title = "Add Variant";
        //
        // /*this.openWithoutClean(parentId);*/
        // this.openWithoutClean();
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

    getBranchesForSelect(): any[] {
        var toRet = [];
        if (this.availableBranches) {
            for (var branch of this.availableBranches) {
                let selected = {
                    id: branch,
                    text: this.getBranchName(branch)
                };
                toRet.push(selected);
            }
        }
        return toRet;
    }

    getBranchName(branchName: string) {
        if (!branchName) return null;
        let name = branchName;
        if (name == "MASTER") {
            name = "MAIN";
        }
        return name;
    }

    selectBranchFromSelect(branchObj: any) {
        if (branchObj) {
            this._variant.branchName = branchObj.id;
        }
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
        console.log("handleError in addVariantModal:" + errorMessage);
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
        this.toastrService.danger(message, "Variant creation failed", {
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

