import {AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {Poll} from "../../../model/poll";

@Component({
    selector: 'poll-overview',
    styleUrls: ['./pollOverview.scss'],
    templateUrl: './pollOverview.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class PollOverview implements AfterViewInit {

    loading: boolean = false;
    @Input() poll: Poll;


    constructor() {
    }

    ngAfterViewInit() {

    }
}

