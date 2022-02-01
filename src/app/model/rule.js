"use strict";
/**
 * Created by yoavmac on 10/08/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rule = void 0;
var Rule = /** @class */ (function () {
    function Rule() {
    }
    Rule.clone = function (rule) {
        if (rule == null) {
            return null;
        }
        var toRet = new Rule();
        toRet.ruleString = rule.ruleString;
        return toRet;
    };
    return Rule;
}());
exports.Rule = Rule;
//# sourceMappingURL=rule.js.map