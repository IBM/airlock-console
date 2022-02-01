/**
 * Created by yoavmac on 01/08/2016.
 */

import {Component} from '@angular/core';
import {Group} from "./group";
import {AuthorizationService} from "../../services/authorization.service";
import {GroupUsage} from "../../model/groupUsage";


@Component({
    selector: 'groups',
    styleUrls: ['./groups.scss'],
    templateUrl: './groups.html',
})
export class Groups {
    selectedGroup: Group;
    selectedUsage: GroupUsage;

    constructor(private authorizationService: AuthorizationService) {
    }

    featureSelected(group: Group) {
        this.selectedGroup = group;
    }

    usageSelected(usage: GroupUsage) {
        this.selectedUsage = usage;
    }

    getTitle() {
        if (this.selectedGroup) {
            return this.selectedGroup.name;
        } else {
            return '';
        }
    }

}
