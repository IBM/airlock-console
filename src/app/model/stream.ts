
export class Stream {
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
    filter: string;
    maxQueuedEvents: number;
    queueSizeKB: number;
    owner: string;
    processor: string;
    resultsSchema: string;
    static cloneToStream(src: Stream,target:Stream){
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
        target.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        target.filter = src.filter;
        target.maxQueuedEvents = src.maxQueuedEvents;
        target.queueSizeKB = src.queueSizeKB;
        target.owner = src.owner;
        target.processor = src.processor;
        target.resultsSchema = src.resultsSchema;
    }

    static clone(src: Stream) : Stream {
        let toRet:Stream = new Stream();
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
        toRet.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        toRet.filter = src.filter;
        toRet.maxQueuedEvents = src.maxQueuedEvents;
        toRet.queueSizeKB = src.queueSizeKB;
        toRet.owner = src.owner;
        toRet.processor = src.processor;
        toRet.resultsSchema = src.resultsSchema;
        return toRet;
    }
    setFromStream(src: Stream){
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
        this.internalUserGroups = Stream.duplicateArrayString(src.internalUserGroups);
        this.filter = src.filter;
        this.maxQueuedEvents = src.maxQueuedEvents;
        this.queueSizeKB = src.queueSizeKB;
        this.owner = src.owner;
        this.processor = src.processor;
        this.resultsSchema = src.resultsSchema;
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