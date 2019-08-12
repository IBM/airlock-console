import { Rule } from './rule';

export class AirlockNotification {
    uniqueId: string;
    seasonId: string;
    name: string;
    displayName:string;
    lastModified: number;
    stage: string;
    description: string;
    enabled: boolean;
    minAppVersion: string;
    rolloutPercentage: number;
    creator: string;
    creationDate: number;
    internalUserGroups: string[];
    owner: string;
    configuration: string;
    cancellationRule: Rule;
    registrationRule: Rule;
    maxNotifications;
    minInterval: number;
    static cloneToAirlockNotification(src: AirlockNotification,target:AirlockNotification){
        target.uniqueId = src.uniqueId;

        target.seasonId = src.seasonId;
        target.name = src.name;
        target.lastModified = src.lastModified;
        target.stage = src.stage;
        target.description = src.description;
        target.enabled = src.enabled;
        target.minAppVersion = src.minAppVersion;
        target.rolloutPercentage = src.rolloutPercentage;
        target.creator = src.creator;
        target.creationDate = src.creationDate;
        target.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        target.owner = src.owner;
        target.configuration = src.configuration;
        target.cancellationRule = Rule.clone(src.cancellationRule);
        target.registrationRule = Rule.clone(src.registrationRule);
        target.maxNotifications = src.maxNotifications;
        target.minInterval = src.minInterval;
    }

    static clone(src: AirlockNotification) : AirlockNotification {
        let toRet:AirlockNotification = new AirlockNotification();
        toRet.uniqueId = src.uniqueId;
        toRet.seasonId = src.seasonId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.stage = src.stage;
        toRet.description = src.description;
        toRet.enabled = src.enabled;
        toRet.minAppVersion = src.minAppVersion;
        toRet.rolloutPercentage = src.rolloutPercentage;
        toRet.creator = src.creator;
        toRet.creationDate = src.creationDate;
        toRet.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        toRet.owner = src.owner;
        toRet.configuration = src.configuration;
        toRet.cancellationRule = Rule.clone(src.cancellationRule);
        toRet.registrationRule = Rule.clone(src.registrationRule);
        toRet.maxNotifications = src.maxNotifications;
        toRet.minInterval = src.minInterval;
        return toRet;
    }
    setFromAirlockNotification(src: AirlockNotification){
        this.uniqueId = src.uniqueId;
        this.seasonId = src.seasonId;
        this.name = src.name;
        this.lastModified = src.lastModified;
        this.stage = src.stage;
        this.description = src.description;
        this.enabled = src.enabled;
        this.minAppVersion = src.minAppVersion;
        this.rolloutPercentage = src.rolloutPercentage;
        this.creator = src.creator;
        this.creationDate = src.creationDate;
        this.internalUserGroups = AirlockNotification.duplicateArrayString(src.internalUserGroups);
        this.owner = src.owner;
        this.configuration = src.configuration;
        this.cancellationRule = Rule.clone(src.cancellationRule);
        this.registrationRule = Rule.clone(src.registrationRule);
        this.maxNotifications = src.maxNotifications;
        this.minInterval = src.minInterval;
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