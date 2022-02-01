export class Branch {
    uniqueId: string;
    seasonId: string;
    name: string;
    creator: string;
    lastModified: number;
    description: string;
    creationDate: number;

    public static clone(other: Branch): Branch {
        var retObj: Branch = new Branch();
        retObj.uniqueId = other.uniqueId;
        retObj.seasonId = other.seasonId;
        retObj.name = other.name;
        retObj.creationDate = other.creationDate;
        retObj.lastModified = other.lastModified;
        retObj.description = other.description;
        retObj.creator = other.creator;
        return retObj;
    }
}

export class AvailableBranches {
    availableInAllSeasons: string[];
    availableInSomeSeasons: string[];
}
