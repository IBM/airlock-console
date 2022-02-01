/*
private UUID productId = null;
    private UUID uniqueId = null; //nc + u
    private String name = null; //c+u
    private String exportName = null;
    private String description = null; //opt in c+u (if missing or null in update don't change)
    private Date creationDate = null; //nc + u (not changed)
    private String creator = null;	//c+u (creator not changed)
    private String queryCondition = null;
    private String queryAdditionalValue = null;
    private CohortCalculationFrequency updateFrequency = CohortCalculationFrequency.ONCE;
    private boolean export = false;
    private boolean enabled;
    private Date lastModified = null; // required in update. forbidden in create
    private JobStatus status;
    private String statusMessage;
    private String statusDetails;
    private Date lastExportTime;
    private Long usersNumber = null;
 */
import {Cohort} from "./cohort";

export class CohortsData {
    productId: string;
    dbApplicationName: string;
    cohorts: Cohort[];
    lastModified: number;


    static cloneToCohortsData(src: CohortsData, target: CohortsData) {

        target.productId = src.productId;
        target.lastModified = src.lastModified;
        target.dbApplicationName = src.dbApplicationName;
        target.cohorts = Cohort.duplicateArray(src.cohorts);
    }

    static clone(src: CohortsData): CohortsData {
        let toRet: CohortsData = new CohortsData();
        toRet.productId = src.productId;
        toRet.lastModified = src.lastModified;
        toRet.dbApplicationName = src.dbApplicationName;
        toRet.cohorts = Cohort.duplicateArray(src.cohorts);
        return toRet;
    }

    setFromCohortsData(src: CohortsData) {
        this.productId = src.productId;
        this.lastModified = src.lastModified;
        this.dbApplicationName = src.dbApplicationName;
        this.cohorts = Cohort.duplicateArray(src.cohorts);
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
}
