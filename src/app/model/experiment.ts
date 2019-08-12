import { Rule } from './rule';
import {Variant} from "./variant";
import {IndexingInfo, IndexRange} from "./indexingInfo";
export class Experiment {
    uniqueId: string;
    productId: string;
    name: string;
    displayName: string;
    lastModified: number;
    stage: string;
    ranges:IndexRange[];
    description: string;
    hypothesis: string;
    measurements: string;
    enabled: boolean;
    indexingInfo:IndexingInfo;
    minVersion: string;
    maxVersion: string;
    rule: Rule;
    rolloutPercentage: number;
    variants: Variant[];
    creator: string;
    indexExperiment:boolean = false;
    creationDate: number;
    internalUserGroups: string[];
    controlGroupVariants: string[];

    static cloneToExperiment(exp: Experiment,target:Experiment){
        target.uniqueId = exp.uniqueId;
        target.productId = exp.productId;
        target.name = exp.name;
        target.displayName = exp.displayName;
        target.lastModified = exp.lastModified;
        target.stage = exp.stage;
        target.ranges = IndexingInfo.duplicateArrayRange(exp.ranges);
        target.description = exp.description;
        target.hypothesis = exp.hypothesis;
        target.measurements = exp.measurements;
        target.enabled = exp.enabled;
        target.indexingInfo = IndexingInfo.clone(exp.indexingInfo);
        target.minVersion = exp.minVersion;
        target.maxVersion = exp.maxVersion;
        target.rule = Rule.clone(exp.rule);
        target.rolloutPercentage = exp.rolloutPercentage;
        target.variants = Experiment.duplicateArray(exp.variants);
        target.creator = exp.creator;
        target.creationDate = exp.creationDate;
        target.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        target.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
        target.indexExperiment = exp.indexExperiment;
    }

    static clone(exp: Experiment) : Experiment {
        let toRet:Experiment = new Experiment();
        toRet.uniqueId = exp.uniqueId;
        toRet.productId = exp.productId;
        toRet.name = exp.name;
        toRet.displayName = exp.displayName;
        toRet.lastModified = exp.lastModified;
        toRet.stage = exp.stage;
        toRet.ranges = IndexingInfo.duplicateArrayRange(exp.ranges);
        toRet.description = exp.description;
        toRet.hypothesis = exp.hypothesis;
        toRet.measurements = exp.measurements;
        toRet.enabled = exp.enabled;
        toRet.indexingInfo = IndexingInfo.clone(exp.indexingInfo);
        toRet.minVersion = exp.minVersion;
        toRet.maxVersion = exp.maxVersion;
        toRet.rule = Rule.clone(exp.rule);
        toRet.rolloutPercentage = exp.rolloutPercentage;
        toRet.variants = Experiment.duplicateArray(exp.variants);
        toRet.creator = exp.creator;
        toRet.creationDate = exp.creationDate;
        toRet.indexExperiment = exp.indexExperiment;
        toRet.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        toRet.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
        return toRet;
    }
    setFromExperiment(exp: Experiment){
        this.uniqueId = exp.uniqueId;
        this.productId = exp.productId;
        this.name = exp.name;
        this.displayName = exp.displayName;
        this.lastModified = exp.lastModified;
        this.stage = exp.stage;
        this.ranges = IndexingInfo.duplicateArrayRange(exp.ranges);
        this.description = exp.description;
        this.hypothesis = exp.hypothesis;
        this.measurements = exp.measurements;
        this.enabled = exp.enabled;
        this.indexingInfo = IndexingInfo.clone(exp.indexingInfo);
        this.minVersion = exp.minVersion;
        this.maxVersion = exp.maxVersion;
        this.rule = Rule.clone(exp.rule);
        this.indexExperiment = exp.indexExperiment;
        this.rolloutPercentage = exp.rolloutPercentage;
        this.variants = Experiment.duplicateArray(exp.variants);
        this.creator = exp.creator;
        this.creationDate = exp.creationDate;
        this.internalUserGroups = Experiment.duplicateArrayString(exp.internalUserGroups);
        this.controlGroupVariants = Experiment.duplicateArrayString(exp.controlGroupVariants);
    }
    static duplicateArrayString(array:Array<string>): Array<string> {
        let arr = [];
        if(array != null) {
            array.forEach((x) => {
                arr.push(x);
            })
        }
        return arr;
    }
    static duplicateArray(array:Array<any>): Array<any> {
        let arr = [];
        if(array != null) {
            array.forEach((x) => {
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }
}