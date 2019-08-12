

import {
    Component, ViewEncapsulation, ViewChild, Input, Output, AfterViewInit,
    ChangeDetectionStrategy
} from '@angular/core';

@Component({
    selector: 'string-status',
    styles: [require('./stringStatus.scss')],
    template: require('./stringStatus.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class StringStatus implements AfterViewInit{

    @Input() status: string = '';
    @Input() addPadding:boolean = false;

    constructor() {
    }

    getValue() {
        if(this.status == 'TRANSLATION_COMPLETE')
            return 100;
        if(this.status == 'IN_TRANSLATION')
            return 75;
        if(this.status == 'REVIEWED_FOR_TRANSLATION'){
            return 50;
        }
        if(this.status == 'READY_FOR_TRANSLATION'){
            return 20;
        }
        if(this.status == 'NEW_STRING')
            return 0;

        return 0;
    }

    getType() {
        if(this.status == 'TRANSLATION_COMPLETE')
            return "success";
        if(this.status == 'IN_TRANSLATION')
            return "primary";
        if(this.status == 'REVIEWED_FOR_TRANSLATION'){
            return "danger";
        }
        if(this.status == 'READY_FOR_TRANSLATION'){
            return "warning";
        }
        if(this.status == 'NEW_STRING')
            return "danger";

        return "danger";
    }
    ngAfterViewInit() {
    }


}

