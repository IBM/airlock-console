"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationIssue = void 0;
var TranslationIssue = /** @class */ (function () {
    function TranslationIssue(i) {
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
    return TranslationIssue;
}());
exports.TranslationIssue = TranslationIssue;
//# sourceMappingURL=translationIssue.js.map