import {Question} from "./question";
import {PredefinedAnswer} from "./predefinedAnswer";
import {Poll} from "./poll";
import {OpenAnswer} from "./openAnswer";

export class QuestionAnswerPoll {
    poll: Poll;
    question: Question;
    answer: PredefinedAnswer;
    openAnswer: OpenAnswer;
}
