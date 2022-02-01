import {CohortStatusDetails} from "./cohortStatusDetails";

export class CohortExport {
    /*
    private boolean exportEnabled;
    private String exportName;
    private JobStatus exportStatus;
    private String exportStatusMessage;
    private StatusDetails exportStatusDetails;
    private Date lastExportTime;
    private Map<String, StatusDetails> statuses = new HashMap<>();
     */
    exportEnabled: boolean;
    exportName: string;
    exportStatus: string;
    exportStatusMessage: string;
    exportStatusDetails: CohortStatusDetails;
    lastExportTime: number;
    statuses: { string: CohortStatusDetails };

    constructor() {
        this.exportEnabled = false;
    }

    static clone(src: CohortExport): CohortExport {
        let toRet: CohortExport = new CohortExport();
        if (!src) return toRet;
        toRet.exportEnabled = src.exportEnabled;
        toRet.exportName = src.exportName;
        toRet.exportStatus = src.exportStatus;
        toRet.exportStatusDetails = CohortStatusDetails.clone(src.exportStatusDetails);
        toRet.exportStatusMessage = src.exportStatusMessage;
        toRet.lastExportTime = src.lastExportTime;
        toRet.statuses = CohortExport.duplicateMap(src.statuses);
        return toRet;
    }

    static duplicateMap(src: { string: CohortStatusDetails }): { string: CohortStatusDetails } {
        return Object.assign({}, src);
    }
}
