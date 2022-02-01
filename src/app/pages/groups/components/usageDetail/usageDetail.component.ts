import {Component, Input} from '@angular/core';
import {GroupUsage, SeasonUsage} from "../../../../model/groupUsage";

@Component({
    selector: 'usage-detail',
    styleUrls: ['./usageDetail.scss'],
    templateUrl: './usageDetail.html'
})
export class UsageDetail {

    @Input() usage: GroupUsage;

    constructor() {
    }


    getSeasonName(item: SeasonUsage) {
        if (item) {
            let max = item.maxVersion ? item.maxVersion : "";
            let min = item.minVersion ? item.minVersion : "";
            if (max == "") {
                return "Version range: " + min + " and up";
            } else {
                return "Version range: " + min + " to " + max;
            }
        } else {
            return "";
        }
    }
}
