
import { Rule } from './rule';
import {Feature} from "./feature";
import {PurchaseOptions} from "./purchaseOptions";

export class InAppPurchase extends Feature{
    includedEntitlements: string[];
    purchaseOptions: PurchaseOptions[];
    entitlements: InAppPurchase[];
    static cloneToFeature(feat: InAppPurchase,target:InAppPurchase){
        Feature.cloneToFeature(feat, target);
        target.includedEntitlements = Feature.duplicateArrayString(feat.includedEntitlements);
        target.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
        target.entitlements = Feature.duplicateArray(feat.entitlements);

    }
    static clone(feat: InAppPurchase) : InAppPurchase {
        let toRet:InAppPurchase = new InAppPurchase();//(InAppPurchase)Feature.clone(feat);
        toRet.setFromFeature(feat);
        toRet.includedEntitlements = Feature.duplicateArrayString(feat.includedEntitlements);
        toRet.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
        toRet.entitlements = Feature.duplicateArray(feat.entitlements);
        return toRet;
    }
    setFromFeature(feat: InAppPurchase){
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
        this.defaultIfAirlockSystemIsDown = (!feat.defaultIfAirlockSystemIsDown)?false:feat.defaultIfAirlockSystemIsDown;
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
        this.includedEntitlements = Feature.duplicateArrayString(feat.includedEntitlements);
        this.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
        this.entitlements = Feature.duplicateArray(feat.entitlements);
    }

}