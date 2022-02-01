import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef, TemplateRef
} from '@angular/core';
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

// @ts-ignore
@Component({
    selector: 'confirm-action-modal',
    styleUrls: ['./confirmActionModal.scss'],
    templateUrl: './confirmActionModal.html',
})
export class ConfirmActionModal {
    title: any;
    message: string;
    shouldDisplaySubmit: boolean = true;
    defaultTitle: string = 'Cancel';
    defaultActionTitle: string = 'Submit';
    constructor(private modalRef: NbDialogRef<ConfirmActionModal>) {
    }

    submit(status) {
        this.modalRef.close(status);
    }
}
