export class StringToTranslate {
    /**
     {
      "translations": [],
      "value": "value5",
      "uniqueId": "13ebf9a2-04e7-4d8b-bb0d-b10866bdd336",
      "key": "key5",
      "status": "NEW_STRING"
    },
     {
  "owner": null,
  "lastSourceModification": 1490781771828,
  "stage": "PRODUCTION",
  "internationalFallback": "CLEAR",
  "smartlingId": "",
  "seasonId": "c402ba71-bf49-4ba2-8b34-14644158e848",
  "lastModified": 1484469352386,
  "value": "CLEAR",
  "uniqueId": "405077f7-9746-431f-90f5-a3a4dfe1d550",
  "key": "HeadsUp.Clear",
  "status": "IN_TRANSLATION"
}
     */
    owner: string;
    lastSourceModification: string;
    stage: string;
    internationalFallback: string;
    translationInstruction: string;
    smartlingId: string;
    seasonId: string;
    lastModified: string;
    creator: string;
    key: string;
    value: string;
    status: string;
    uniqueId: string;
    translations: any[];
    maxStringSize: number;
    prettyStage: string;
    translatedSummary: string;

    constructor(s?: StringToTranslate) {

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
        } else {
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

    setFromString(s: any) {
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
}
