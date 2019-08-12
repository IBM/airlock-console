import { Rule } from './rule';

export class AnalyticsDisplay {
    analyticsDataCollection: AnalyticsDataCollection = null;
    lastModified: number = 0;
    rule: Rule = null;
    seasonId: string = "";
    rolloutPercentage: number = 0;

    constructor(){
        this.analyticsDataCollection = new AnalyticsDataCollection();
    }
}
export class AnalyticsDataCollection {
    analyticsDataCollectionByFeatureNames: AnalyticsDataCollectionByFeatureNames[];
    //inputFieldsForAnalytics: string[];
    inputFieldsForAnalytics: InputFieldsForAnalytics[];
    developmentItemsReportedToAnalytics: number;
    productionItemsReportedToAnalytics: number;

    constructor(){
        this.analyticsDataCollectionByFeatureNames = [];
        this.inputFieldsForAnalytics = [];
    }
}

export class InputFieldsForAnalytics {
    name: string;
    branchName: string;
}

export class AnalyticsDataCollectionByFeatureNames {
    id: string;
    name: string;
    branchName: string;
    warning:string;
    sendToAnalytics: boolean;
    configurationRules: ConfigurationRules[];
    attributes: Atributes[];
    orderingRules: OrderingRules[];
    constructor(){
        this.configurationRules = [];
        this.attributes = [];
        this.orderingRules = [];
    }
}

export class ConfigurationRules {
    name: string;
    branchName: string;
}
export class OrderingRules {
    name: string;
    branchName: string;
}
export class Atributes {
    name: string;
    branchName: string;
}