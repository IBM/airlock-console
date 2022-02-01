"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringToTranslate = void 0;
var StringToTranslate = /** @class */ (function () {
    function StringToTranslate(s) {
        if (s) {
            this.uniqueId = s.uniqueId;
            this.owner = s.owner;
            this.creator = s.creator;
            this.lastModified = s.lastModified;
            this.lastSourceModification = s.lastSourceModification;
            this.seasonId = s.seasonId;
            this.smartlingId = s.smartlingId;
            this.internationalFallback = s.internationalFallback;
            this.key = s.key;
            this.status = s.status;
            this.value = s.value;
            this.translations = [];
            this.stage = s.stage;
            this.translationInstruction = s.translationInstruction;
            this.maxStringSize = s.maxStringSize;
            if (s.translations) {
                for (var i = 0; i < s.translations.length; i++) {
                    this.translations[i] = s.translations[i];
                }
            }
        }
        else {
            this.translations = [];
            this.uniqueId = '';
            this.key = '';
            this.status = '';
            this.creator = '';
            this.value = '';
            this.owner = null;
            this.lastModified = null;
            this.lastSourceModification = null;
            this.seasonId = null;
            this.smartlingId = null;
            this.internationalFallback = '';
            this.translationInstruction = '';
            this.stage = 'DEVELOPMENT';
            this.maxStringSize = null;
        }
    }
    StringToTranslate.prototype.setFromString = function (s) {
        this.uniqueId = s.uniqueId;
        this.owner = s.owner;
        this.creator = s.creator;
        this.lastModified = s.lastModified;
        this.lastSourceModification = s.lastSourceModification;
        this.seasonId = s.seasonId;
        this.smartlingId = s.smartlingId;
        this.internationalFallback = s.internationalFallback;
        this.key = s.key;
        this.status = s.status;
        this.value = s.value;
        this.translations = [];
        this.stage = s.stage;
        this.translationInstruction = s.translationInstruction;
        this.maxStringSize = s.maxStringSize;
        if (s.translations) {
            for (var i = 0; i < s.translations.length; i++) {
                this.translations[i] = s.translations[i];
            }
        }
    };
    return StringToTranslate;
}());
exports.StringToTranslate = StringToTranslate;
//# sourceMappingURL=stringToTranslate.js.map