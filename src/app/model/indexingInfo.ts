

export class IndexingInfo {

    owner: string;
    dashboardURL: string;
    missingDashboardExplanation: string;
    productId: string;
    ranges:IndexRange[];
    endDate: number;
    description: string;
    variants: string[];
    productName: string;
    indexExperiment: boolean;
    controlGroupVariants: string[];
    stage: string;
    indexingProgress:IndexingProgress;
    uniqueUsers:{string:number};
    name: string;
    experimentId: string;
    hypothesis: string;
    variantsDescriptions: string[];
    startDate: number;

    static clone(info: IndexingInfo) : IndexingInfo {
        let toRet:IndexingInfo = new IndexingInfo();
        if (info) {
            toRet.owner = info.owner;
            toRet.dashboardURL = info.dashboardURL;
            toRet.missingDashboardExplanation = info.missingDashboardExplanation;
            toRet.productId = info.productId;
            toRet.ranges = IndexingInfo.duplicateArrayRange(info.ranges);
            toRet.endDate = info.endDate;
            toRet.description = info.description;
            toRet.variants = IndexingInfo.duplicateArrayString(info.variants);
            toRet.productName = info.productName;
            toRet.indexExperiment = info.indexExperiment;
            toRet.controlGroupVariants = IndexingInfo.duplicateArrayString(info.controlGroupVariants);
            toRet.stage = info.stage;
            toRet.indexingProgress = IndexingProgress.clone(info.indexingProgress);
            if(info.uniqueUsers != null) {
                toRet.uniqueUsers = JSON.parse(JSON.stringify(info.uniqueUsers));
            }
            toRet.name = info.name;
            toRet.experimentId = info.experimentId;
            toRet.hypothesis = info.hypothesis;
            toRet.variantsDescriptions = IndexingInfo.duplicateArrayString(info.variantsDescriptions);
            toRet.startDate = info.startDate;
            return toRet;
        } else {
            return null;
        }

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

    static duplicateArrayRange(array:Array<IndexRange>): Array<IndexRange> {
        let arr = [];
        if(array != null) {
            array.forEach((x) => {
                arr.push(IndexRange.clone(x));
            })
        } else {
            return null
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

export class IndexRange {
    start: number;
    end:number;
    public static clone(other:IndexRange):IndexRange{
        var retObj:IndexRange = new IndexRange();
        retObj.start = other.start;
        retObj.end = other.end;
        return retObj;
    }
}

export class IndexingProgress {
    totalNumberOfBuckets:number;
    numberOfDoneBuckets:number;
    numberOfErrorBuckets:number;
    public static clone(other:IndexingProgress):IndexingProgress{
        var retObj:IndexingProgress = new IndexingProgress();
        if (other) {
            retObj.totalNumberOfBuckets = other.totalNumberOfBuckets;
            retObj.numberOfDoneBuckets = other.numberOfDoneBuckets;
            retObj.numberOfErrorBuckets = other.numberOfErrorBuckets;
        }
        return retObj;
    }
}