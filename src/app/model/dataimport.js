"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dataimport = void 0;
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
var Dataimport = /** @class */ (function () {
    function Dataimport() {
    }
    Dataimport.prototype.noNullStatus = function () {
        if (!status) {
            return "";
        }
        return status;
    };
    return Dataimport;
}());
exports.Dataimport = Dataimport;
//# sourceMappingURL=dataimport.js.map