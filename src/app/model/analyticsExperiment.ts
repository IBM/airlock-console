export class AnalyticsExperiment {
    analyticsDataCollectionByFeatureNames: AnalyticsDataCollectionByFeatureNames[];
    inputFieldsForAnalytics: InputFieldsForAnalytics[];
    developmentItemsReportedToAnalytics: number;
    productionItemsReportedToAnalytics: number;

    constructor() {
        this.analyticsDataCollectionByFeatureNames = [];
        this.inputFieldsForAnalytics = [];
    }
}

export class InputFieldsForAnalytics {
    name: string;
    branchName: string;
}

export class AnalyticsDataCollectionByFeatureNames {
    name: string;
    branches: Branches[];
    sendToAnalytics: boolean;
    configurationRules: ConfigurationRules[];
    orderingRules: OrderingRule[];
    attributes: string[];

    constructor() {
        this.configurationRules = [];
        this.attributes = [];
        this.orderingRules = [];
    }
}

export class ConfigurationRules {
    name: string;
    branches: Branches[];
}

export class OrderingRule {
    name: string;
    branches: Branches[];
}

export class Branches {
    branch: string;
    season: string;
}
