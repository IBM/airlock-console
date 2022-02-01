import {Rule} from './rule';

export class Feature {

    uniqueId: string;
    enabled: boolean;
    noCachedResults: boolean;
    lastModified: number;
    parent: string;
    type: string;
    stage: string;
    additionalInfo: any;
    namespace: string;
    creator: string;
    creationDate: number;
    internalUserGroups: string[];
    isCurrentUserFollower: boolean;
    description: string;
    rule: Rule;
    minAppVersion: string;
    name: string;
    displayName: string;
    seasonId: string;
    features: Feature[];
    configurationRules: Feature[];
    orderingRules: Feature[];
    owner: string;
    defaultConfiguration: string;
    configurationSchema: {};
    configuration: string;
    defaultIfAirlockSystemIsDown: boolean = false;
    rolloutPercentage: number;
    rolloutPercentageBitmap: string;
    maxFeaturesOn: number;
    branchStatus: string;
    sendToAnalytics: boolean = false;
    configAttributesToAnalytics: string[];
    premium: boolean;
    entitlement: string;
    premiumRule: Rule;

    static cloneToFeature(feat: Feature, target: Feature) {
        target.uniqueId = feat.uniqueId;
        target.enabled = feat.enabled;
        target.lastModified = feat.lastModified;
        target.parent = feat.parent;
        target.type = feat.type;
        target.stage = feat.stage;
        target.additionalInfo = feat.additionalInfo;
        target.namespace = feat.namespace;
        target.creator = feat.creator;
        target.creationDate = feat.creationDate;
        target.description = feat.description;
        target.rule = Rule.clone(feat.rule);
        target.minAppVersion = feat.minAppVersion;
        target.name = feat.name;
        target.displayName = feat.displayName;
        target.features = Feature.duplicateArray(feat.features);
        target.configurationRules = Feature.duplicateArray(feat.configurationRules);
        target.orderingRules = Feature.duplicateArray(feat.orderingRules);

        target.owner = feat.owner;
        target.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        target.rolloutPercentage = feat.rolloutPercentage;
        target.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        target.uniqueId = feat.uniqueId;
        target.seasonId = feat.seasonId;
        target.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        target.isCurrentUserFollower = feat.isCurrentUserFollower;
        target.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        target.defaultConfiguration = feat.defaultConfiguration;
        target.configurationSchema = feat.configurationSchema;
        target.configuration = feat.configuration;
        target.maxFeaturesOn = feat.maxFeaturesOn;
        target.noCachedResults = feat.noCachedResults;
        target.sendToAnalytics = feat.sendToAnalytics;
        target.branchStatus = feat.branchStatus;
        target.premium = feat.premium;
        target.entitlement = feat.entitlement;
        target.premiumRule = Rule.clone(feat.premiumRule);

    }

    static clone(feat: Feature): Feature {
        let toRet: Feature = new Feature();
        toRet.uniqueId = feat.uniqueId;
        toRet.enabled = feat.enabled;
        toRet.lastModified = feat.lastModified;
        toRet.parent = feat.parent;
        toRet.type = feat.type;
        toRet.stage = feat.stage;
        toRet.additionalInfo = feat.additionalInfo;
        toRet.namespace = feat.namespace;
        toRet.creator = feat.creator;
        toRet.creationDate = feat.creationDate;
        toRet.description = feat.description;
        toRet.rule = Rule.clone(feat.rule);
        toRet.minAppVersion = feat.minAppVersion;
        toRet.name = feat.name;
        toRet.displayName = feat.displayName;

        toRet.features = Feature.duplicateArray(feat.features);
        toRet.configurationRules = Feature.duplicateArray(feat.configurationRules);
        toRet.orderingRules = Feature.duplicateArray(feat.orderingRules);
        toRet.owner = feat.owner;
        toRet.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        toRet.rolloutPercentage = feat.rolloutPercentage;
        toRet.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        toRet.uniqueId = feat.uniqueId;
        toRet.seasonId = feat.seasonId;
        toRet.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        toRet.isCurrentUserFollower = feat.isCurrentUserFollower;
        toRet.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        toRet.defaultConfiguration = feat.defaultConfiguration;
        toRet.configurationSchema = feat.configurationSchema;
        toRet.configuration = feat.configuration;
        toRet.maxFeaturesOn = feat.maxFeaturesOn;
        toRet.noCachedResults = feat.noCachedResults;
        toRet.sendToAnalytics = feat.sendToAnalytics;
        toRet.branchStatus = feat.branchStatus;
        toRet.premium = feat.premium;
        toRet.entitlement = feat.entitlement;
        toRet.premiumRule = Rule.clone(feat.premiumRule);
        return toRet;
    }

    setFromFeature(feat: Feature) {
        this.uniqueId = feat.uniqueId;
        this.enabled = feat.enabled;
        this.lastModified = feat.lastModified;
        this.parent = feat.parent;
        this.type = feat.type;
        this.stage = feat.stage;
        this.additionalInfo = feat.additionalInfo;
        this.namespace = feat.namespace;
        this.creator = feat.creator;
        this.creationDate = feat.creationDate;
        this.description = feat.description;
        this.rule = Rule.clone(feat.rule);
        this.minAppVersion = feat.minAppVersion;
        this.name = feat.name;
        this.displayName = feat.displayName;
        this.features = Feature.duplicateArray(feat.features);
        this.configurationRules = Feature.duplicateArray(feat.configurationRules);
        this.orderingRules = Feature.duplicateArray(feat.orderingRules);
        this.owner = feat.owner;
        this.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown) ? false : feat.defaultIfAirlockSystemIsDown;
        this.rolloutPercentage = feat.rolloutPercentage;
        this.rolloutPercentageBitmap = feat.rolloutPercentageBitmap;
        this.uniqueId = feat.uniqueId;
        this.seasonId = feat.seasonId;
        this.internalUserGroups = Feature.duplicateArrayString(feat.internalUserGroups);
        this.isCurrentUserFollower = feat.isCurrentUserFollower;
        this.configAttributesToAnalytics = Feature.duplicateArrayString(feat.configAttributesToAnalytics);
        this.defaultConfiguration = feat.defaultConfiguration;
        this.configurationSchema = feat.configurationSchema;
        this.configuration = feat.configuration;
        this.maxFeaturesOn = feat.maxFeaturesOn;
        this.noCachedResults = feat.noCachedResults;
        this.sendToAnalytics = feat.sendToAnalytics;
        this.branchStatus = feat.branchStatus;
        this.premium = feat.premium;
        this.entitlement = feat.entitlement;
        this.premiumRule = Rule.clone(feat.premiumRule);
    }

    static duplicateArrayString(array: Array<string>): Array<string> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(x);
            })
        }
        return arr;
    }

    static duplicateArray(array: Array<any>): Array<any> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }


}
