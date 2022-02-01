import {Rule} from './rule';
import {BasePoll} from "./basePoll";
import {Visualization} from "./visualization";
import {PredefinedAnswer} from "./predefinedAnswer";
import {OpenAnswer} from "./openAnswer";

export class Question extends BasePoll {

    /*
    private String questionId;
	private UUID pollId;
	private boolean pi;
	private String text;
	private String dynamicText;
	private Integer maxAnswers;
	private Visualization visualization;
	private Boolean correctIncorrect; //opt
	private Boolean shuffleAnswers; //Optional, default is false
	private Boolean multipleAnswers;  //Optional, default is false
	private LinkedList<PredefinedAnswer> predefinedAnswers = new LinkedList<>(); //opt
	private OpenAnswer openAnswer; //opt
	private String userAttribute; //Optional
	private String dbColumn; //c+u
     */
    pollId: string;
    questionId: string;
    pi: boolean;
    title: string;
    dynamicTitle: string;
    maxAnswers: number;
    visualization: Visualization;
    correctIncorrect: boolean;
    shuffleAnswers: boolean;
    multipleAnswers: boolean;
    predefinedAnswers: PredefinedAnswer[];
    openAnswer: OpenAnswer;
    userAttribute: string;
    dbColumn: string;
    type: string;
    dynamicQuestionSubmitText: string;

    static clone(feat: Question): Question {
        let toRet: Question = new Question();
        BasePoll.cloneToBasePoll(feat, toRet);
        toRet.pollId = feat.pollId;
        toRet.questionId = feat.questionId;
        toRet.pi = feat.pi;
        toRet.title = feat.title;
        toRet.dynamicTitle = feat.dynamicTitle;
        toRet.maxAnswers = feat.maxAnswers;
        if (feat.visualization != null) {
            toRet.visualization = Visualization.clone(feat.visualization);
        } else {
            toRet.visualization = feat.visualization;
        }
        toRet.correctIncorrect = feat.correctIncorrect;
        toRet.shuffleAnswers = feat.shuffleAnswers;
        toRet.multipleAnswers = feat.multipleAnswers;
        toRet.predefinedAnswers = Question.duplicateArray(feat.predefinedAnswers);
        toRet.openAnswer = OpenAnswer.clone(feat.openAnswer);
        toRet.userAttribute = feat.userAttribute;
        toRet.dbColumn = feat.dbColumn;
        toRet.type = feat.type;
        toRet.dynamicQuestionSubmitText = feat.dynamicQuestionSubmitText;
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
