import {Component, Input, OnInit} from "@angular/core";
import {ViewCell} from "ng2-smart-table";

@Component({
    template: `
        <string-status [status]="rowData.status" [nbTooltip]="getStringStatus(rowData.status)" nbTooltipStatus="primary" [addPadding]="true"></string-status>
  `,
})
export class CustomStatusComponent implements ViewCell, OnInit {
    @Input() value: string | number;
    @Input() rowData: any;

    ngOnInit(): void {
    }
    getStringStatus(status: string): string {
        if (status == 'TRANSLATION_COMPLETE')
            return "Translation Completed";
        if (status == 'IN_TRANSLATION')
            return "In Translation";
        if (status == 'NEW_STRING')
            return "New String";
        if (status == 'READY_FOR_TRANSLATION') {
            return "Ready for Review";
        }
        if (status == 'REVIEWED_FOR_TRANSLATION') {
            return "Review Complete";
        }
        return status;
    }
}
