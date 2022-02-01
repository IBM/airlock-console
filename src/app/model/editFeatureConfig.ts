import {Feature} from "./feature";
import {Branch} from "./branch";
import {FeatureCell} from "../@theme/airlock.components/featureCell";
import {ConfigurationCell} from "../@theme/airlock.components/configurationCell";
import {OrderCell} from "../@theme/airlock.components/orderCell";
import {InAppPurchase} from "./inAppPurchase";

export class EditFeatureConfig {
    branch: Branch;
    feature: Feature;
    featurePath: Array<Feature>;
    strInputSchemaSample: string;
    strUtilitiesInfo: string;
    featureCell: FeatureCell = null;
    configurationCell: ConfigurationCell = null;
    showConfiguration: boolean = false;
    sourceFeature: Feature = null;
    orderCell: OrderCell = null;
    inAppPurchases: InAppPurchase[] = []

    constructor(branch: Branch,
                feature: Feature,
                featurePath: Array<Feature>,
                strInputSchemaSample: string,
                strUtilitiesInfo: string,
                featureCell: FeatureCell,
                configurationCell: ConfigurationCell,
                showConfiguration: boolean,
                sourceFeature: Feature,
                orderCell: OrderCell,
                inAppPurchases: InAppPurchase[] = []) {
        this.branch = branch;
        this.feature = feature;
        this.featurePath = featurePath;
        this.strInputSchemaSample = strInputSchemaSample;
        this.strUtilitiesInfo = strUtilitiesInfo;
        this.featureCell = featureCell;
        this.configurationCell = configurationCell;
        this.showConfiguration = showConfiguration;
        this.sourceFeature = sourceFeature;
        this.orderCell = orderCell;
        this.inAppPurchases = inAppPurchases;
    }
}
