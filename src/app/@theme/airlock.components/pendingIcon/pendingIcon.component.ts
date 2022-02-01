import {Component, Input} from '@angular/core';

@Component({
    selector: 'pending-icon',
    styleUrls: ['./pendingIcon.scss'],
    template: './pendingIcon.html'
})
export class PendingIcon {
    @Input() animated: boolean;

    constructor() {
    }
}
