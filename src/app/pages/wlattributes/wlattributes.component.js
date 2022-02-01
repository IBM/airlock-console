"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccordionGroup = exports.Accordion = exports.WhitelistAttributes = void 0;
/**
 * Created by michaeld on 14/03/2017.
 */
var core_1 = require("@angular/core");
var inline_edit_component_1 = require("./inlinedit/inline-edit.component");
var strings_service_1 = require("../../services/strings.service");
var WhitelistAttributes = /** @class */ (function () {
    function WhitelistAttributes(_stringsSrevice) {
        this._stringsSrevice = _stringsSrevice;
        this.isGroupOpen = false;
        this.panels = [];
        this.panels = [
            {
                heading: '',
                content: [{ 'name': 'a', 'selected': true }, { 'name': 'b', 'selected': false }, { 'name': ['precip', 'value'], 'arraypattern': ['[]'], 'selected': false, 'type': inline_edit_component_1.InlineEditComponent.ARRAY_TYPE }]
            }
            /*,
             {
             heading: 'custom attributes',
             content: [{'name':'a*', 'selected':true}, {'name':'b*', 'selected':false}, {'name':'c*', 'selected':false}]
             }
             */
        ];
    }
    WhitelistAttributes.prototype.getString = function (name) {
        return this._stringsSrevice.getString(name);
    };
    WhitelistAttributes.prototype.editable = function (attribute) {
        return (attribute.type && (attribute.type == inline_edit_component_1.InlineEditComponent.ARRAY_TYPE || attribute.type == inline_edit_component_1.InlineEditComponent.CUSTOM_TYPE));
    };
    WhitelistAttributes.prototype.array = function (attribute) {
        return (attribute.type && attribute.type == inline_edit_component_1.InlineEditComponent.ARRAY_TYPE);
    };
    WhitelistAttributes.prototype.custom = function (attribute) {
        return (attribute.type && attribute.type == inline_edit_component_1.InlineEditComponent.CUSTOM_TYPE);
    };
    WhitelistAttributes.prototype.onCheckboxChange = function (attribute) {
    };
    WhitelistAttributes.prototype.removeAngularAccordionGroup = function () {
        this.panels.splice(1, 1);
    };
    WhitelistAttributes.prototype.addAngularAccordionGroup = function () {
        var accordionGroupContent = { heading: 'Hi New Content !', content: 'Content angular 2 accordion ' };
        this.panels.splice(1, 0, accordionGroupContent);
    };
    WhitelistAttributes.prototype.addCustomAttribute = function () {
        var customContent = { name: [], selected: true, type: inline_edit_component_1.InlineEditComponent.CUSTOM_TYPE, arrayPattern: [] };
        this.featureAnalyticDisplayAttributes.splice(this.featureAnalyticDisplayAttributes.length, 0, customContent);
    };
    WhitelistAttributes.prototype.removeCustomAttribute = function (index) {
        this.featureAnalyticDisplayAttributes.splice(index, 1);
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", Array)
    ], WhitelistAttributes.prototype, "featureAnalyticDisplayAttributes", void 0);
    WhitelistAttributes = __decorate([
        core_1.Component({
            selector: 'wl-attributes',
            templateUrl: 'wlattributes.component.html',
            styleUrls: ['wlattributes.component.css']
        }),
        __metadata("design:paramtypes", [strings_service_1.StringsService])
    ], WhitelistAttributes);
    return WhitelistAttributes;
}());
exports.WhitelistAttributes = WhitelistAttributes;
var Accordion = /** @class */ (function () {
    function Accordion() {
        this.panels = [];
    }
    Accordion.prototype.addGroup = function (group) {
        this.panels.push(group);
    };
    Accordion.prototype.closeOthers = function (openGroup) {
        this.panels.forEach(function (group) {
            if (group !== openGroup) {
                group.isOpen = false;
            }
        });
    };
    Accordion.prototype.removeGroup = function (group) {
        var index = this.panels.indexOf(group);
        if (index !== -1) {
            this.panels.splice(index, 1);
        }
    };
    Accordion = __decorate([
        core_1.Component({
            selector: 'accordion-all',
            template: "\n  <ng-content></ng-content>\n          ",
            host: {
                'class': 'panel-group'
            }
        })
    ], Accordion);
    return Accordion;
}());
exports.Accordion = Accordion;
var AccordionGroup = /** @class */ (function () {
    function AccordionGroup(accordion) {
        this.accordion = accordion;
        this._isOpen = true;
        this.accordion.addGroup(this);
    }
    Object.defineProperty(AccordionGroup.prototype, "isOpen", {
        get: function () {
            return this._isOpen;
        },
        set: function (value) {
            this._isOpen = value;
            if (value) {
                //this.accordion.closeOthers(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    AccordionGroup.prototype.ngOnDestroy = function () {
        this.accordion.removeGroup(this);
    };
    AccordionGroup.prototype.toggleOpen = function (event) {
        event.preventDefault();
        this.isOpen = !this.isOpen;
    };
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], AccordionGroup.prototype, "heading", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], AccordionGroup.prototype, "isOpen", null);
    AccordionGroup = __decorate([
        core_1.Component({
            selector: 'accordion-section',
            template: "\n                <div class=\"panel panel-default\" [ngClass]=\"{'panel-open': isOpen}\">\n                  <div class=\"panel-heading\" (click)=\"toggleOpen($event)\">\n                    <h4 class=\"panel-title\">\n                      <a href tabindex=\"0\"><span>{{heading}}</span></a>\n                       <!--div class=\"control\" (click)=\"editing=!editing\" style=\"float:left;position:relative;top:1px;left: 5px; height: 7px\"><i class=\"ion-android-arrow-dropleft\" style=\"font-size: 18px\"></i></div-->\n                    </h4>\n                  </div>\n                  <div class=\"panel-collapse\" [hidden]=\"!isOpen\">\n                    <div class=\"panel-body\">\n                        <ng-content></ng-content>\n                    </div>\n                  </div>\n                </div>\n          ",
        }),
        __metadata("design:paramtypes", [Accordion])
    ], AccordionGroup);
    return AccordionGroup;
}());
exports.AccordionGroup = AccordionGroup;
//# sourceMappingURL=wlattributes.component.js.map