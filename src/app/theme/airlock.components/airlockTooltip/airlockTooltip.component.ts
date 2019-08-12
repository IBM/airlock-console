
import {
    Component, ViewEncapsulation, ViewChild, Input, Output, AfterViewInit,
    ChangeDetectionStrategy
} from '@angular/core';
// import {COMMON_DIRECTIVES} from '@angular/common';
import {  ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";
import {CommonModule} from "@angular/common";
// import {POPOVER_DIRECTIVES} from "ng2-popover";


@Component({
    selector: 'airlock-tooltip',
    styles: [require('./airlockTooltip.scss')],
    // directives: [COMMON_DIRECTIVES, POPOVER_DIRECTIVES],
    template: require('./airlockTooltip.html'),
    // encapsulation: ViewEncapsulation.None
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AirlockTooltip implements AfterViewInit{

    loading: boolean = false;
    @Input() content: string = 'content';
    lines: string[];
    @Input() title: string = '';
    @Input() placement: string = "left";
    @Output() onActionApproved = new EventEmitter();

    constructor() {
    }

    ngAfterViewInit() {
        this.lines = this.content.split('\n');
    }


}

