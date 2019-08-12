import {Component, ViewEncapsulation, Input} from '@angular/core';
import { AccordionModule } from 'ng2-bootstrap';
import {GroupUsage, SeasonUsage} from "../../../../model/groupUsage";
import {BranchyComponent, TreeModel, NodeEvent} from "ng2-branchy";
@Component({
  selector: 'usage-detail',
  styles: [require('./usageDetail.scss')],
  template: require('./usageDetail.html')
})
export class UsageDetail {
  
    @Input() usage: GroupUsage;
  constructor() {
  }


    getSeasonName(item:SeasonUsage) {
        if (item) {
            let max = item.maxVersion? item.maxVersion : "";
            let min = item.minVersion? item.minVersion : "";
            if (max=="") {
                return "Version range: " + min + " and up";
            } else {
                return "Version range: " +  min + " to " +max;
            }
        } else {
            return "";
        }
    }
}
