import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'airlock-tooltip',
    styleUrls: ['./airlockTooltip.scss'],
    templateUrl: './airlockTooltip.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class AirlockTooltip implements AfterViewInit {

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

