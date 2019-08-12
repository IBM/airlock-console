import {Rule} from './rule';
export class Variant {
    uniqueId: string;
    name: string;
    displayName:string;
    lastModified: number;
    stage: string;
    description: string;
    branchName: string;
    experimentId:string;
    enabled: boolean;
    rule: Rule;
    rolloutPercentage: number;
    creator: string;
    internalUserGroups: string[];
    creationDate: number;

    static cloneToVariant(variant: Variant,target:Variant){
        target.uniqueId = variant.uniqueId;
        target.name = variant.name;
        target.displayName = variant.displayName;
        target.lastModified = variant.lastModified;
        target.stage = variant.stage;
        target.description = variant.description;
        target.branchName = variant.branchName;
        target.experimentId = variant.experimentId;
        target.enabled = variant.enabled;
        target.rule = Rule.clone(variant.rule);
        target.rolloutPercentage = variant.rolloutPercentage;
        target.creator = variant.creator;
        target.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        target.creationDate = variant.creationDate;

    }

    static clone(variant: Variant) : Variant {
        let toRet:Variant = new Variant();

        toRet.uniqueId = variant.uniqueId;
        toRet.name = variant.name;
        toRet.displayName = variant.displayName;
        toRet.lastModified = variant.lastModified;
        toRet.stage = variant.stage;
        toRet.description = variant.description;
        toRet.branchName = variant.branchName;
        toRet.experimentId = variant.experimentId;
        toRet.enabled = variant.enabled;
        toRet.rule = Rule.clone(variant.rule);
        toRet.rolloutPercentage = variant.rolloutPercentage;
        toRet.creator = variant.creator;
        toRet.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        toRet.creationDate = variant.creationDate;

        return toRet;
    }
    setFromExperiment(variant: Variant){

        this.uniqueId = variant.uniqueId;
        this.name = variant.name;
        this.displayName = variant.displayName;
        this.lastModified = variant.lastModified;
        this.stage = variant.stage;
        this.description = variant.description;
        this.branchName = variant.branchName;
        this.experimentId = variant.experimentId;
        this.enabled = variant.enabled;
        this.rule = Rule.clone(variant.rule);
        this.rolloutPercentage = variant.rolloutPercentage;
        this.creator = variant.creator;
        this.internalUserGroups = Variant.duplicateArrayString(variant.internalUserGroups);
        this.creationDate = variant.creationDate;

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