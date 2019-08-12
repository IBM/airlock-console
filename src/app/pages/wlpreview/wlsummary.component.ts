import { Component, OnInit, Input, Output, OnChanges, EventEmitter, trigger, style, animate, transition } from '@angular/core';
import {AnalyticsDisplay, InputFieldsForAnalytics, AnalyticsDataCollectionByFeatureNames,ConfigurationRules, Atributes,OrderingRules} from "../../model/analyticsDisplay";
import {StringsService} from "../../services/strings.service";
import {Branch} from "../../model/branch";
export enum FeatureDisplayType {
    FEATURE_NOT_SEND,
    FEATURE_SEND_IN_MASTER,
    FEATURE_SEND_NOT_IN_BRANCH,
    FEATURE_SEND_IN_BRANCH
}
@Component({
    selector: 'wl-summary',
    templateUrl: 'wlsummary.component.html',
    styleUrls: ['wlsummary.component.css'],
    animations: [
        trigger('dialog', [
            transition('void => *', [
                style({ transform: 'scale3d(.3, .3, .3)' }),
                animate(100)
            ]),
            transition('* => void', [
                animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
            ])
        ])
    ]
})

export class WhitelistSummary implements OnInit{
    @Input() closable = true;
    @Input() visible: boolean;
    @Input() totalCount: number;
    @Input() totalCountDev: number;
    @Input() totalCountQuota: number;
    @Input() analyticDataForDisplay:AnalyticsDisplay;
    @Input() selectedBranch: Branch;

    @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private _stringsSrevice: StringsService) {
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
    }

    showAnaliticsHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/analytics');
    }

    getAttributeDeletedTooltip(){
        return this.getString('analytics_summary_attribute_deleted_warning');
    }

    isMasterIndicator(attribute:InputFieldsForAnalytics){
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (attribute.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    }

    isMasterBranch(){
        return (this.selectedBranch.name === "MASTER")
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

    isIndicatorFeatures(feature:AnalyticsDataCollectionByFeatureNames){
        if (!feature.sendToAnalytics)
            return FeatureDisplayType.FEATURE_NOT_SEND;
        if (feature.sendToAnalytics && this.selectedBranch.name == "MASTER") {
            return FeatureDisplayType.FEATURE_SEND_IN_MASTER;
        }
        else{
            if (feature.branchName === "MASTER")
                return FeatureDisplayType.FEATURE_SEND_NOT_IN_BRANCH;
            else
                return FeatureDisplayType.FEATURE_SEND_IN_BRANCH;
        }

    }

    isMasterIndicatorConfigurations(conf:ConfigurationRules){
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (conf.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    }
    isMasterIndicatorOrderingRule(conf:OrderingRules){
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (conf.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    }
    isMasterIndicatorAtributes(atr:Atributes){
        if (this.selectedBranch.name == "MASTER")
            return false;
        if (atr.branchName == "MASTER") {
            return true;
        }
        else
            return false;
    }

    close() {
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }
}