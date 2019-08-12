
import { Rule } from './rule';
import {Feature} from "./feature";
import {StoreProductId} from "./storeProductId";

export class PurchaseOptions extends Feature{
    storeProductIds: StoreProductId[];
    purchaseOptions: PurchaseOptions[];
    static cloneToFeature(feat: PurchaseOptions,target:PurchaseOptions){
        Feature.cloneToFeature(feat, target);
        target.storeProductIds = Feature.duplicateArray(feat.storeProductIds);
        target.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
    }
    static clone(feat: PurchaseOptions) : PurchaseOptions {
        let toRet:PurchaseOptions = new PurchaseOptions();
        toRet.setFromFeature(feat);
        toRet.storeProductIds = Feature.duplicateArray(feat.storeProductIds);
        toRet.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
        return toRet;
    }
    setFromFeature(feat: PurchaseOptions){
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
        this.storeProductIds = Feature.duplicateArray(feat.storeProductIds);
        this.purchaseOptions = Feature.duplicateArray(feat.purchaseOptions);
    }

}