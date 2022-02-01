import {
    Component,
    ChangeDetectionStrategy,
    ChangeDetectorRef, TemplateRef
} from '@angular/core';
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

// @ts-ignore
@Component({
    selector: 'save-action-modal',
    styleUrls: ['./saveActionModal.scss'],
    templateUrl: './saveActionModal.html',
})
export class SaveActionModal {
    title: any;
    message: string;
    shouldDisplaySubmit: boolean = true;
    defaultTitle: string = 'Cancel';
    defaultActionTitle: string = 'Save';
    defaultDiscardTitle: string = 'Discard changes';
    constructor(private modalRef: NbDialogRef<SaveActionModal>) {
    }

    submit(status) {
        this.modalRef.close(status);
    }
}
