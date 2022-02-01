import {Component, Input} from '@angular/core';

@Component({
    selector: 'flask-icon',
    styleUrls: ['./flaskIcon.scss'],
    templateUrl: './flaskIcon.html'
})
export class FlaskIcon {
    @Input() animated: boolean;

    constructor() {
    }
}
