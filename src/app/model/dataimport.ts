/*
private UUID productId = null;
    private UUID uniqueId = null;
    private Date creationDate = null; //nc + u (not changed)
    private String creator = null;	//c+u (creator not changed)
    private Date lastModified = null; // required in update. forbidden in create
    private String description = null; //opt in c+u (if missing or null in update don't change)
    //file path
    private String s3File;
    //status
    private JobStatus status;
    private String statusMessage;
    private String detailedMessage;
    private Long successfulImports;
 */
export class Dataimport {
    productId: string;
    uniqueId: string;
    name: string;
    lastModified: number;
    description: string;
    creator: string;
    creationDate: number;
    s3File: string;
    status: string;
    statusMessage: string;
    detailedMessage: string;
    successfulImports: number;
    affectedColumns: string[];
    targetTable: string;
    overwrite: boolean;

    public noNullStatus(): string {
        if (!status) {
            return "";
        }
        return status;
    }
}
