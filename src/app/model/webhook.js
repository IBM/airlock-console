"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Webhook = void 0;
var Webhook = /** @class */ (function () {
    function Webhook() {
    }
    Webhook.clone = function (src) {
        var toRet = new Webhook();
        toRet.uniqueId = src.uniqueId;
        toRet.name = src.name;
        toRet.lastModified = src.lastModified;
        toRet.creator = src.creator;
        toRet.minStage = src.minStage;
        toRet.sendRuntime = src.sendRuntime;
        toRet.sendAdmin = src.sendAdmin;
        toRet.creationDate = src.creationDate;
        toRet.url = src.url;
        toRet.products = Webhook.duplicateArrayString(src.products);
        return toRet;
    };
    Webhook.duplicateArrayString = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(x);
            });
        }
        return arr;
    };
    Webhook.duplicateArray = function (array) {
        var arr = [];
        if (array != null) {
            array.forEach(function (x) {
                arr.push(Object.assign({}, x));
            });
        }
        return arr;
    };
    return Webhook;
}());
exports.Webhook = Webhook;
//# sourceMappingURL=webhook.js.map