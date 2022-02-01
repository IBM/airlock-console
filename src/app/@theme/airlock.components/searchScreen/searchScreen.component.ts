import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "../../../model/feature";
import {StringsService} from "../../../services/strings.service";
import {animate, style, transition, trigger} from "@angular/animations";

@Component({
    selector: 'search-screen',
    templateUrl: 'searchScreen.html',
    styleUrls: ['searchScreen.scss'],
    animations: [
        trigger('dialog', [
            transition('void => *', [
                style({transform: 'scale3d(.3, .3, .3)'}),
                animate(100)
            ]),
            transition('* => void', [
                animate(100, style({transform: 'scale3d(.0, .0, .0)'}))
            ])
        ])
    ]
})

export class SearchScreen implements OnInit {
    @Input() closable = true;
    @Input() visible: boolean;
    @Input() features: Feature[];
    private searchQuery: string;
    private numSearchResults: number;
    private selectedResultNum: number;

    constructor(private _stringsSrevice: StringsService) {
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
    }

    filterFeatures() {

    }

    getNextResult() {

    }

    getPreviousResult() {

    }

    clearSearch() {
        this.searchQuery = null;
        this.filterFeatures();
    }

    getNumResults(numResults: number): string {
        if (this.searchQuery && this.searchQuery.length > 0) {
            if (numResults == 0) return "no results";
            var indexStr = "";
            if (this.selectedResultNum >= 0) {
                indexStr = "" + (this.selectedResultNum + 1) + " out of "
            }
            if (numResults == 1) return indexStr + "1 result";
            return indexStr + numResults + " results";
        } else {
            return "";
        }
    }

    getAttributeDeletedTooltip() {
        return this.getString('analytics_summary_attribute_deleted_warning');
    }


    /* isIndicatorFeatures(feature:AnalyticsDataCollectionByFeatureNames){
         if (this.selectedBranch.name == "MASTER") {
             if (feature.sendToAnalytics)
                 return true;
             else
                 return false;

         }
         else{
             if (feature.sendToAnalytics && feature.branchName != "MASTER")
                 return true;
             else
                 return false;
         }

     }*/


    close() {
        this.visible = false;
    }
}
