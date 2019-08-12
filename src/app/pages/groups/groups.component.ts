/**
 * Created by yoavmac on 01/08/2016.
 */

import {Component, ViewEncapsulation} from '@angular/core';
import {BaCard} from "../../theme/components/baCard/baCard.component";
import {GroupList} from "./components/groupList/groupList.component";
import {GroupDetail} from "./components/groupDetail/groupDetail.component";
import {Group} from "./group";
import {AuthorizationService} from "../../services/authorization.service";
import {GroupUsage} from "../../model/groupUsage";


@Component({
    selector: 'groups',
    styles: [require('./groups.scss')],
    template: require('./groups.html'),
})
export class Groups {
    selectedGroup: Group;
    selectedUsage: GroupUsage;
    constructor(private authorizationService:AuthorizationService) {
    }

    featureSelected(group:Group) {
        this.selectedGroup = group;
    }
    usageSelected(usage:GroupUsage) {
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
