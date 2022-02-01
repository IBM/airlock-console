"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExperimentsContainer = void 0;
var experiment_1 = require("./experiment");
var ExperimentsContainer = /** @class */ (function () {
    function ExperimentsContainer() {
    }
    ExperimentsContainer.clone = function (container) {
        var toRet = new ExperimentsContainer;
        toRet.productId = container.productId;
        toRet.lastModified = container.lastModified;
        toRet.maxExperimentsOn = container.maxExperimentsOn;
        toRet.experiments = [];
        for (var _i = 0, _a = container.experiments; _i < _a.length; _i++) {
            var exp = _a[_i];
            var expClone = experiment_1.Experiment.clone(exp);
            toRet.experiments.push(expClone);
        }
        return toRet;
    };
    return ExperimentsContainer;
}());
exports.ExperimentsContainer = ExperimentsContainer;
//# sourceMappingURL=experimentsContainer.js.map