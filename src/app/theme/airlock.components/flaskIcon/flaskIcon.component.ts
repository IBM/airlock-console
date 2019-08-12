
import {Component, Injectable, Input, EventEmitter, Output, ElementRef, ViewChild} from '@angular/core';

@Component({
    selector: 'flask-icon',
    styles: [require('./flaskIcon.scss')],
    template: require('./flaskIcon.html')
})
export class FlaskIcon {
    @Input() animated:boolean;
    constructor() {
    }
}
