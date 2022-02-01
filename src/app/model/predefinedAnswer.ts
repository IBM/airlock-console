import {Rule} from './rule';

export class PredefinedAnswer {

    /*
    private String text;
	private String dynamicText; //opt - javascript
	private Boolean correctAnswer;
	private String onAnswerGoto; //Optional, default is “next” TODO: verify no loops  (can be uuid/next/end)
	private String answerId;
     */
    title: string;
    dynamicTitle: string;
    correctAnswer: boolean;
    onAnswerGoto: string;
    answerId: string;
    enabled: boolean;
    nominalDev: number;
    nominalProd: number;
    percentageDev: number;
    percentageProd: number;

    static clone(feat: PredefinedAnswer): PredefinedAnswer {
        let toRet: PredefinedAnswer = new PredefinedAnswer();
        toRet.title = feat.title;
        toRet.dynamicTitle = feat.dynamicTitle;
        toRet.correctAnswer = feat.correctAnswer;
        toRet.onAnswerGoto = feat.onAnswerGoto;
        toRet.answerId = feat.answerId;
        toRet.enabled = feat.enabled;
        toRet.nominalDev = feat.nominalDev;
        toRet.nominalProd = feat.nominalProd;
        toRet.percentageDev = feat.percentageDev;
        toRet.percentageProd = feat.percentageProd;
        return toRet;
    }


}
