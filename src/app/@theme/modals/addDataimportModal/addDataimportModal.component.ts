import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Dataimport} from "../../../model/dataimport";

@Component({
    selector: 'add-dataimport-modal',
    styleUrls: ['./addDataimportModal.scss'],
    templateUrl: './addDataimportModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddDataimportModal {
    productId: string;
    title: string = "Add Data-import Job";
    loading: boolean = false;
    private isShow: boolean = true;
    _job: Dataimport;

    possibleTableNames = [];
    isOnlyDisplayMode: boolean = false;
    destinationTableName: string = 'Choose table name';

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService, protected modalRef: NbDialogRef<AddDataimportModal>) {
        this.loading = true;
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    ngOnInit(){
        this.initImport();
    }

    initImport() {
        this._job = new Dataimport();
        this._job.creator = this._airLockService.getUserName();
        this._job.overwrite = true;
        if (this.possibleTableNames.length === 0) {
            this._airLockService.getImportTablesList(this.productId).then(tables => {
                this.possibleTableNames = tables as string[];
            });
        }
        this.loading = false;
    }

    isPlaceHolderVisible(text: string) {
        let isIt = (!text || text.length <= 0);
        return isIt
    }

    showS3PathHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.z6mpm8its324');
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }

    destinationTableChosen(key) {
        this.destinationTableName = key;
        this._job.targetTable = key;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._job.s3File == null || this._job.s3File.length == 0 || this._job.targetTable === null || this._job.s3File.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this.loading = true;
            this._airLockService.createDataImport(this.productId, this._job).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.close("refresh");
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
            this.create('S3 path is required.')
        }
    }

    open() {
        this.initImport();
        this.title = "Send Data-import Job";

        /*this.openWithoutClean(parentId);*/
        // this.openWithoutClean();
    }

    // openWithoutClean() {
    //
    //     //this.parentId=parentId;
    //     if (this.modal != null) {
    //         this.modal.open('md');
    //     }
    // }

    close(value) {
        this.modalRef.close(value);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create job. Please try again.";
        console.log("handleError in addDataimportModal:" + errorMessage);
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
        this.toastrService.danger(message, "Data import job creation failed", {
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

