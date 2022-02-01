import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

@Component({
    selector: 'ba-action-card',
    styleUrls: ['./baActionCard.scss'],
    templateUrl: './baActionCard.html',
    encapsulation: ViewEncapsulation.None
})
export class BaActionCard {
    @Input() title: String;
    @Input() baCardClass: String;
    @Input() showAction: boolean = false;
    @Output() onActionClicked: EventEmitter<any> = new EventEmitter();

    actionClicked() {
        this.onActionClicked.emit(null);
    }
}


