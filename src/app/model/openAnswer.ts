import {Rule} from './rule';

export class OpenAnswer {

    /*
    private String text; //optional
	private String dynamicText; //optional
	private String onAnswerGoto; //Optional, default is “next” (end/ next/ uuid) TODO: verify no loops
	private AnswerType answerType;
     */
    title: string;
    dynamicTitle: string;
    onAnswerGoto: string;
    type: string;
    userAttribute: string;
    nominalDev: number;
    nominalProd: number;
    percentageDev: number;
    percentageProd: number;
    enabled: boolean;

    static clone(feat: OpenAnswer): OpenAnswer {
        if (!feat) return feat;
        let toRet: OpenAnswer = new OpenAnswer();
        toRet.title = feat.title;
        toRet.dynamicTitle = feat.dynamicTitle;
        toRet.onAnswerGoto = feat.onAnswerGoto;
        toRet.type = feat.type;
        toRet.userAttribute = feat.userAttribute;
        toRet.nominalDev = feat.nominalDev;
        toRet.nominalProd = feat.nominalProd;
        toRet.percentageDev = feat.percentageDev;
        toRet.percentageProd = feat.percentageProd;
        toRet.enabled = feat.enabled;
        return toRet;
    }


}
