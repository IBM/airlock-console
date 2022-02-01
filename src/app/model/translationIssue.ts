export class TranslationIssue {
    //resolvedByUserUid: string;
    //projectId: string;
    //resolvedDate: string;
    //"issueTextModifiedDate":

    stringId: string;
    locale: string;
    issueId: string;
    comments: any[];
    issueSubTypeCode: string; //"DOES_NOT_FIT_SPACE"
    issueText: string;
    createdDate: string; //"2017-06-07T09:20:04Z"
    issueStateCode: string//"RESOLVED",
    issueTypeCode: string; // "TRANSLATION",

    constructor(i?: TranslationIssue) {

        if (i) {

            this.stringId = i.stringId;
            this.locale = i.locale;
            this.issueId = i.issueId;
            this.issueSubTypeCode = i.issueSubTypeCode;
            this.issueText = i.issueText;
            this.createdDate = i.createdDate;
            this.issueStateCode = i.issueStateCode;
            this.issueTypeCode = i.issueTypeCode;
            this.comments = [];
            for (var j = 0; j < i.comments.length; j++) {
                this.comments[j] = i.comments[j];
            }
        }
    }


}
