"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringsService = void 0;
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var strings_1 = require("./strings");
/**
 * Created by elikk on 26/09/2016.
 */
var StringsService = /** @class */ (function () {
    function StringsService(http) {
        this.http = http;
        this.strings = strings_1.globalStrings;
    }
    StringsService.prototype.getString = function (name) {
        var str = this.strings[name];
        if (!str)
            str = "";
        return str;
    };
    StringsService.prototype.getStringWithFormat = function (name) {
        var format = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            format[_i - 1] = arguments[_i];
        }
        var str = this.getString(name);
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof format[number] != 'undefined'
                ? format[number]
                : match;
        });
    };
    StringsService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.Http])
    ], StringsService);
    return StringsService;
}());
exports.StringsService = StringsService;
//# sourceMappingURL=strings.service.js.map