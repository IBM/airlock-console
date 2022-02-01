import {Component, Input} from '@angular/core';

// import {TreeModel} from "ng2-branchy";

@Component({
    selector: 'group-node',
    styleUrls: ['./groupsNode.scss'],
    templateUrl: './groupsNode.html'
})
export class GroupsNode {
    // @Input() tree: TreeModel;
    isItOpen: boolean = false;

    constructor() {
    }

    toggleOpen() {
        this.isItOpen = !this.isItOpen;
    }
}
