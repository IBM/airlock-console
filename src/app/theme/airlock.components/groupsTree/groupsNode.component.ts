
import {Component, Injectable, Input, EventEmitter, Output, ElementRef, ViewChild} from '@angular/core';

import {TreeModel} from "ng2-branchy";

@Component({
    selector: 'group-node',
    styles: [require('./groupsNode.scss')],
    template: require('./groupsNode.html')
})
export class GroupsNode {
    @Input() tree:TreeModel;
    isItOpen: boolean = false;
    constructor() {
    }

    toggleOpen() {
        console.log("toggleOpen");
        this.isItOpen = !this.isItOpen;
    }
}
