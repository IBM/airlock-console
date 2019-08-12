
export class SeasonUsage {
    features: FeatureUsage[];
    minVersion: string;
    maxVersion: string;
    seasonId: string;
    branches: BranchesUsage[];
}
export class BranchesUsage {
    name: string;
    uniqueId: string;
    features: FeatureUsage[];
}
export class ExperimentUsage {
    name: string;
    displayName: string;
    uniqueId: string;
    inUse: boolean;
    variants: VariantUsage[];
}
export class  VariantUsage {
    name: string;
    displayName: string;
    uniqueId: string;
}
export class FeatureUsage {
    name: string;
    namespace: string;
    type: string;
    uniqueId: string;
}
export class GroupUsage {

    internalUserGroup: string;
    seasons: SeasonUsage[];
    experiments: ExperimentUsage[];

}