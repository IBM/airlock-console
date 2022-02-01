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
export class CohortStatusDetails {
    /*
    "statusDetails": {
    "activityId": "string",
    "detailedMessage": "string",
    "failedImports": 0,
    "parsedImports": 0,
    "successfulImports": 0,
    "totalImports": 0
  },

  JobStatus status;
    private String activityId;
    private String detailedMessage;
    private Long failedImports;
    private Long parsedImports;
    private Long successfulImports;
    private Long totalImports;
     */
    activityId: string;
    detailedMessage: string;
    failedImports: number;
    parsedImports: number;
    successfulImports: number;
    totalImports: number;
    status: string;


    static cloneToCohortStatusDetails(src: CohortStatusDetails, target: CohortStatusDetails) {

        target.activityId = src.activityId;
        target.detailedMessage = src.detailedMessage;
        target.failedImports = src.failedImports;
        target.parsedImports = src.parsedImports;
        target.successfulImports = src.successfulImports;
        target.totalImports = src.totalImports;
        target.status = src.status;
    }

    static clone(src: CohortStatusDetails): CohortStatusDetails {
        let toRet: CohortStatusDetails = new CohortStatusDetails();
        if (!src) return toRet;
        toRet.activityId = src.activityId;
        toRet.detailedMessage = src.detailedMessage;
        toRet.failedImports = src.failedImports;
        toRet.parsedImports = src.parsedImports;
        toRet.successfulImports = src.successfulImports;
        toRet.totalImports = src.totalImports;
        toRet.status = src.status;
        return toRet;
    }

    setFromCohortStatusDetails(src: CohortStatusDetails) {
        this.activityId = src.activityId;
        this.detailedMessage = src.detailedMessage;
        this.failedImports = src.failedImports;
        this.parsedImports = src.parsedImports;
        this.successfulImports = src.successfulImports;
        this.totalImports = src.totalImports;
        this.status = src.status;
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
