import {Component, ViewEncapsulation, Input} from '@angular/core';

import {TransparentSpinner} from "../../../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {UserGroups} from "../../../../model/user-groups";
import {Group} from "../../group";
import {Feature} from "../../../../model/feature";
import {BaThemeConfigProvider} from "../../../../theme/theme.configProvider";
import {BranchyComponent, TreeModel, NodeEvent} from "ng2-branchy";
import {GroupsNode} from "../../../../theme/airlock.components/groupsTree/groupsNode.component";

@Component({
  selector: 'group-detail',
  styles: [require('./groupDetail.scss')],
  template: require('./groupDetail.html')
})
export class GroupDetail {
  
    @Input() group: Group;
  constructor() {
  }

  ngOnInit() {

  }

    private tree: TreeModel;

    getFeatures() {
        if (this.group) {
            return this.group.features;
        } else {
            return {};
        }
    }

}
