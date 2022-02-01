import {Component, Input} from '@angular/core';

@Component({
    selector: 'loading-icon',
    styleUrls: ['./loadingIcon.scss'],
    templateUrl: './loadingIcon.html'
})
export class LoadingIcon {
    @Input() animated: boolean;

    constructor() {
    }
}
