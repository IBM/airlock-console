/**
 * Created by yoavmac on 10/08/2016.
 */

export class Rule {
    ruleString: string;

    static clone(rule: Rule): Rule {
        if (rule == null) {
            return null;
        }
        let toRet: Rule = new Rule();
        toRet.ruleString = rule.ruleString;
        return toRet;
    }
}
