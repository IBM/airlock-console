"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaCard = void 0;
var core_1 = require("@angular/core");
var BaCard = /** @class */ (function () {
    function BaCard() {
    }
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], BaCard.prototype, "title", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], BaCard.prototype, "baCardClass", void 0);
    BaCard = __decorate([
        core_1.Component({
            selector: 'ba-card',
            styles: [require('./baCard.scss')],
            template: require('./baCard.html'),
            encapsulation: core_1.ViewEncapsulation.None
        })
    ], BaCard);
    return BaCard;
}());
exports.BaCard = BaCard;
//# sourceMappingURL=baCard.component.js.map