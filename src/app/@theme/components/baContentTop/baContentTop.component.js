"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaContentTop = void 0;
var core_1 = require("@angular/core");
var strings_service_1 = require("../../../services/strings.service");
var global_state_1 = require("../../../global.state");
var BaContentTop = /** @class */ (function () {
    function BaContentTop(_state, _stringsSrevice) {
        var _this = this;
        this._state = _state;
        this._stringsSrevice = _stringsSrevice;
        this.activePageTitle = '';
        this.activePageSubTitle = '';
        console.log("BaContentTop cstr");
        var activeLink = this._state.getStringFromLocalStorage('menu.activeLink');
        console.log("activeLink");
        console.log(activeLink);
        if (activeLink) {
            var activeTitle = this.getString(activeLink + "_title");
            if (activeTitle == "") {
                activeTitle = activeLink;
            }
            console.log("activeLink setvalue");
            this.activePageTitle = activeTitle;
            this.activePageSubTitle = this.getString(activeLink);
            console.log(this.activePageTitle);
            console.log(this.activePageSubTitle);
        }
        this._state.subscribe('menu.activeLink', 'batop', function (activeLink) {
            console.log("BaContentTop in subscribe");
            if (activeLink) {
                console.log("activeLink!");
                console.log(activeLink);
                var activeTitle = _this.getString(activeLink.title + "_title");
                if (activeTitle == "") {
                    activeTitle = activeLink.title;
                }
                _this.activePageTitle = activeTitle;
                _this.activePageSubTitle = _this.getString(activeLink.title);
            }
        });
    }
    BaContentTop.prototype.getString = function (name) {
        console.log("getString:" + name);
        return this._stringsSrevice.getString(name);
    };
    BaContentTop = __decorate([
        core_1.Component({
            selector: 'ba-content-top',
            styles: [require('./baContentTop.scss')],
            template: require('./baContentTop.html'),
        }),
        __metadata("design:paramtypes", [global_state_1.GlobalState, strings_service_1.StringsService])
    ], BaContentTop);
    return BaContentTop;
}());
exports.BaContentTop = BaContentTop;
//# sourceMappingURL=baContentTop.component.js.map