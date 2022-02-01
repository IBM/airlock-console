import {
    Component,
    ViewEncapsulation,
    ViewChild,
    Input,
    Output,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';

import { EventEmitter } from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { StringsService } from "../../../services/strings.service";
import { Subject } from 'rxjs';
import { AirlockNotification } from "../../../model/airlockNotification";
import {Cohort} from "../../../model/cohort";
import {CohortExport} from "../../../model/cohortExport";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'rename-cohort-export-modal',
    styleUrls: ['./renameCohortExportModal.scss'],
    templateUrl: './renameCohortExportModal.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class RenameCohortExportModal {
    loading: boolean = false;
    validationNameString: string = "";
    exportItem:CohortExport;
    cohort: Cohort = null;
    notification: AirlockNotification = null;
    text: string;
    title: string;
    exportKey: string;
    showDiscard: boolean;
    // @Output() onActionApproved = new EventEmitter();
    private actionApproved = new Subject<string>();
    actionApproved$ = this.actionApproved.asObservable();
    private actionCanceld = new Subject<string>();
    actionCanceld$ = this.actionCanceld.asObservable();
    private actionDiscard = new Subject<string>();
    actionDiscard$ = this.actionDiscard.asObservable();

    constructor(private _airLockService: AirlockService,
                private cd: ChangeDetectorRef,
                private toastrService: NbToastrService,
                private _stringsSrevice: StringsService,
                private modalRef: NbDialogRef<RenameCohortExportModal>) {
    }

    approve(value: string) {
        this.actionApproved.next(value);
    }

    ngOnInit(){
        this.cd.markForCheck();
    }


    open(text: string = "Are you sure you want to perform this action?", cohort: Cohort, exportItem: CohortExport, title: string = "Attention", showDiscard: boolean = false) {
        this.text = text;
        this.title = title;
        this.showDiscard = showDiscard;
        this.cohort=cohort;
        this.exportItem=exportItem;
        this.cd.markForCheck();
    }

    save() {
        // if (this.confirmSubfeatureStageChange) {
        //     if (!this.validationNameString && this.feature != null || !this.confirmRecursiveStageChange) {
        //         return;
        //     }
        // }
        if (this.isValid()) {
            this.approve(this.validationNameString);
            // this.onActionApproved.emit(null);
            this.close();
        } else {
            this.create('Please choose non empty name');
        }
    }

    getType(): string {
        return "exportName";
    }

    getName(): string {
        return this.exportKey;
    }

    isValid(): boolean {
        return this.validationNameString && this.validationNameString.length > 0;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    cancel() {
        this.actionCanceld.next(null);
        this.close();
    }

    discard() {
        this.actionDiscard.next(null);
        this.close();
    }

    close() {
        this.validationNameString = "";
        this.modalRef.close();
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
        });

    }

    onCreate(event) {
    }

    onDestroy(event) {
    }


    //////////////////////////////////////////
}

