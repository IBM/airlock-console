import {Poll} from "./poll";

export class AirlockPolls {
    lastModified: number;
    productId: string;
    secondsBetweenPolls: number;
    sessionsBetweenPolls: number;
    polls: Poll[];

    static clone(airlockPolls: AirlockPolls): AirlockPolls {
        if (airlockPolls == null) {
            return null;
        }
        let toRet: AirlockPolls = new AirlockPolls();
        toRet.lastModified = airlockPolls.lastModified;
        toRet.productId = airlockPolls.productId;
        if (airlockPolls.polls != null) {
            toRet.polls = [];
            for (var i = 0; i < airlockPolls.polls.length; i++) {
                toRet.polls.push(Poll.clone(airlockPolls.polls[i]));
            }
        } else {
            toRet.polls = null
        }
        toRet.secondsBetweenPolls = airlockPolls.secondsBetweenPolls;
        toRet.sessionsBetweenPolls = airlockPolls.sessionsBetweenPolls;
        return toRet;
    }
}
