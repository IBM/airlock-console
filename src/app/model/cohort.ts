/*
private UUID productId = null;
    private UUID uniqueId = null; //nc + u
    private String name = null; //c+u
    private String description = null; //opt in c+u (if missing or null in update don't change)
    private Date creationDate = null; //nc + u (not changed)
    private String creator = null;	//c+u (creator not changed)
    private String queryCondition = null;
    private String queryAdditionalValue = null;
    private JobStatus calculationStatus;
    private String calculationStatusMessage;
    private CohortCalculationFrequency updateFrequency = CohortCalculationFrequency.MANUAL;
    private boolean enabled;
    private Date lastModified = null; // required in update. forbidden in create

    private Map<String, CohortExportItem> exports = new HashMap<>();
 */

import {CohortExport} from "./cohortExport";

export class Cohort {
    productId: string;
    uniqueId: string;
    name: string;
    lastModified: number;
    description: string;
    enabled: boolean;
    creator: string;
    creationDate: number;
    queryCondition: string;
    queryAdditionalValue: string;
    updateFrequency: string;
    calculationStatus: string;
    calculationStatusMessage: string;
    usersNumber: number;
    valueType: string;
    joinedTables: string[];
    exports: { string: CohortExport };


    static cloneToCohort(src: Cohort, target: Cohort) {
        target.uniqueId = src.uniqueId;
        target.productId = src.productId;
        target.name = src.name;
        target.lastModified = src.lastModified;
        target.description = src.description;
        target.enabled = src.enabled;
        target.queryCondition = src.queryCondition;
        target.creator = src.creator;
        target.creationDate = src.creationDate;
        target.queryAdditionalValue = src.queryAdditionalValue;
        target.updateFrequency = src.updateFrequency;
        target.calculationStatusMessage = src.calculationStatusMessage;
        target.usersNumber = src.usersNumber;
        target.calculationStatus = src.calculationStatus;
        target.valueType = src.valueType;
        target.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        target.exports = Cohort.duplicateExports(src.exports);
    }

    static clone(src: Cohort): Cohort {
        let toRet: Cohort = new Cohort();
        toRet.uniqueId = src.uniqueId;
        toRet.productId = src.productId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.description = src.description;
        toRet.enabled = src.enabled;
        toRet.queryCondition = src.queryCondition;
        toRet.creator = src.creator;
        toRet.creationDate = src.creationDate;
        toRet.queryAdditionalValue = src.queryAdditionalValue;
        toRet.updateFrequency = src.updateFrequency;
        toRet.calculationStatusMessage = src.calculationStatusMessage;
        toRet.usersNumber = src.usersNumber;
        toRet.calculationStatus = src.calculationStatus;
        toRet.valueType = src.valueType;
        toRet.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        toRet.exports = Cohort.duplicateExports(src.exports);
        return toRet;
    }

    setFromCohort(src: Cohort) {
        this.uniqueId = src.uniqueId;
        this.productId = src.productId;
        this.name = src.name;
        this.lastModified = src.lastModified;
        this.description = src.description;
        this.enabled = src.enabled;
        this.queryCondition = src.queryCondition;
        this.creator = src.creator;
        this.creationDate = src.creationDate;
        this.queryAdditionalValue = src.queryAdditionalValue;
        this.updateFrequency = src.updateFrequency;
        this.calculationStatusMessage = src.calculationStatusMessage;
        this.usersNumber = src.usersNumber;
        this.calculationStatus = src.calculationStatus;
        this.valueType = src.valueType;
        this.joinedTables = Cohort.duplicateArrayString(src.joinedTables);
        this.exports = Cohort.duplicateExports(src.exports);
    }

    static duplicateArrayString(array: Array<string>): Array<string> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(x);
            })
        }
        return arr;
    }

    static duplicateArray(array: Array<any>): Array<any> {
        let arr = [];
        if (array != null) {
            array.forEach((x) => {
                arr.push(Object.assign({}, x));
            })
        }
        return arr;
    }

    static duplicateMap(src: { string: CohortExport }): { string: CohortExport } {
        return Object.assign({}, src);
    }

    static duplicateExports(src: { string: CohortExport }): { string: CohortExport } {
        if (!src) return src;
        let keys = Object.keys(src);
        let toRet: { string: CohortExport } = {} as { string: CohortExport };
        let length = keys.length;
        for (let i = 0; i < length; ++i) {
            let key = keys[i];
            toRet[key] = Object.assign({}, src[key]);
        }
        return toRet;
    }
}
