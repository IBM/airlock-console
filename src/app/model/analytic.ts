import { Rule } from './rule';
export class Analytic {
    seasonId: string;
    rule: Rule;
    lastModified: number;
    analyticsDataCollection: analyticsDataCollection;
    rolloutPercentage: number;
    rolloutPercentageBitmap:string;
}
//TODO  change class name
export class analyticsDataCollection {
    featuresAttributesForAnalytics: FeatureAnalyticAttributes[];
    featuresAndConfigurationsForAnalytics: string[];
    inputFieldsForAnalytics: string[];
}

export class FeatureAnalyticAttributes {
    id: string;
    attributes: Attribute[];

}

export class Attribute {
    name: string;
    warning: string;
    type: string;
}

export class DisplayAttribute {
    name: string[];
    arrayPattern: string[];
    type: string;
    selected:boolean;
}