import {Component, Input} from '@angular/core';
import {Group} from "../../group";
// import {TreeModel} from "tree-ngx";

@Component({
    selector: 'group-detail',
    styleUrls: ['./groupDetail.scss'],
    templateUrl: './groupDetail.html'
})
export class GroupDetail {

    @Input() group: Group;

    constructor() {
    }

    ngOnInit() {

    }

    // private tree: TreeModel;

    getFeatures() {
        if (this.group) {
            return {};
            // return this.group.features;TODO Eitan
        } else {
            return {};
        }
    }

}
