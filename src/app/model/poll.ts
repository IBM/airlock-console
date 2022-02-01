import {Rule} from './rule';
import {BasePoll} from "./basePoll";
import {Question} from "./question";

export class Poll extends BasePoll {

    /*
    private String pollId; //c+u
	private UUID productId = null; //nc + u
	private String title; //opt - def none
	private String subTitle; //opt - def none
	private LinkedList<Question> questions = new LinkedList<Question>();
     */
    pollId: string;
    productId: string;
    title: string;
    subTitle: string;
    questions: Question[];
    minVersion: string;
    maxVersion: string;
    startDate: string;
    endDate: string;
    usedOnlyByPushCampaign: boolean;
    numberOfViewsBeforeDismissal: number;
    lastResultsUpdateTimeDev: number;
    lastResultsUpdateTimeProd: number;

    static clone(feat: Poll): Poll {
        let toRet: Poll = new Poll();
        BasePoll.cloneToBasePoll(feat, toRet);
        toRet.pollId = feat.pollId;
        toRet.productId = feat.productId;
        toRet.title = feat.title;
        toRet.subTitle = feat.subTitle;
        toRet.questions = Poll.duplicateArray(feat.questions);
        toRet.minVersion = feat.minVersion;
        toRet.maxVersion = feat.maxVersion;
        toRet.endDate = feat.endDate;
        toRet.startDate = feat.startDate;
        toRet.usedOnlyByPushCampaign = feat.usedOnlyByPushCampaign;
        toRet.numberOfViewsBeforeDismissal = feat.numberOfViewsBeforeDismissal;
        toRet.lastResultsUpdateTimeDev = feat.lastResultsUpdateTimeDev;
        toRet.lastResultsUpdateTimeProd = feat.lastResultsUpdateTimeProd;
        return toRet;
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
