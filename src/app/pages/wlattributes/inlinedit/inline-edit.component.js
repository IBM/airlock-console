"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InlineEditComponent = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var strings_service_1 = require("../../../services/strings.service");
var INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
    provide: forms_1.NG_VALUE_ACCESSOR,
    useExisting: core_1.forwardRef(function () { return InlineEditComponent; }),
    multi: true
};
var InlineEditComponent = /** @class */ (function () {
    function InlineEditComponent(element, _renderer, _stringsSrevice) {
        this._renderer = _renderer;
        this._stringsSrevice = _stringsSrevice;
        this.label = ''; // Label value for input element
        this.type = 'text'; // The type of input element
        this.required = false; // Is input requried?
        this.disabled = false; // Is input disabled?
        this._value = ''; // Private variable for input value
        this.preValue = ''; // The value before clicking to edit
        this.editing = false; // Is Component in edit mode?
        this.onChange = Function.prototype; // Trascend the onChange event
        this.onTouched = Function.prototype; // Trascend the onTouch event
    }
    InlineEditComponent_1 = InlineEditComponent;
    Object.defineProperty(InlineEditComponent.prototype, "value", {
        // Control Value Accessors for ngModel
        get: function () {
            if (!this._value && !this.editing) {
                return this.getString('analytics_edit_this_value');
            }
            return this._value;
        },
        set: function (v) {
            if (v !== this._value) {
                this._value = v;
                this.onChange(v);
                if (this.type == InlineEditComponent_1.ARRAY_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
                    this.inlineEditControl.nativeElement.focus();
                    this.inlineEditControl.nativeElement.placeholder = 'e.g. 1-5, 8, 11-13';
                }
                else if (this.type == InlineEditComponent_1.CUSTOM_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
                    this.inlineEditControl.nativeElement.focus();
                    this.inlineEditControl.nativeElement.placeholder = 'e.g. big.label.size[5]';
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    InlineEditComponent.prototype.getString = function (name) {
        return this._stringsSrevice.getString(name);
    };
    InlineEditComponent.prototype.ngAfterViewInit = function () {
        if (this.type == InlineEditComponent_1.ARRAY_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
            this.inlineEditControl.nativeElement.focus();
            this.inlineEditControl.nativeElement.placeholder = 'e.g. 1-5, 8, 11-13';
        }
        else if (this.type == InlineEditComponent_1.CUSTOM_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
            this.inlineEditControl.nativeElement.placeholder = 'e.g. big.label.size[5]';
        }
    };
    InlineEditComponent.prototype.tooltip = function () {
        var tooltip = "";
        if (this.type) {
            if (this.type == InlineEditComponent_1.ARRAY_TYPE)
                tooltip = tooltip + this.getString('analytics_array_attribute');
            else if (this.type == InlineEditComponent_1.CUSTOM_TYPE)
                tooltip = tooltip + this.getString('analytics_custom_attribute');
        }
        return tooltip;
    };
    InlineEditComponent.prototype.array = function () {
        return this.type && this.type == InlineEditComponent_1.ARRAY_TYPE;
    };
    InlineEditComponent.prototype.custom = function () {
        return this.type && this.type == InlineEditComponent_1.CUSTOM_TYPE;
    };
    // Required for ControlValueAccessor interface
    InlineEditComponent.prototype.writeValue = function (value) {
        this._value = value;
    };
    // Required forControlValueAccessor interface
    InlineEditComponent.prototype.registerOnChange = function (fn) {
        this.onChange = fn;
    };
    // Required forControlValueAccessor interface
    InlineEditComponent.prototype.registerOnTouched = function (fn) {
        this.onTouched = fn;
    };
    // Do stuff when the input element loses focus
    InlineEditComponent.prototype.onBlur = function ($event) {
        this.editing = false;
    };
    // Start the editting process for the input element
    InlineEditComponent.prototype.edit = function (value) {
        var _this = this;
        if (this.disabled) {
            return;
        }
        this.preValue = value;
        this.editing = true;
        setTimeout(function (_) { return _this._renderer.invokeElementMethod(_this.inlineEditControl.nativeElement, 'focus', []); });
    };
    InlineEditComponent.prototype.ngOnInit = function () {
    };
    var InlineEditComponent_1;
    InlineEditComponent.ARRAY_TYPE = 'ARRAY';
    InlineEditComponent.CUSTOM_TYPE = 'CUSTOM';
    __decorate([
        core_1.ViewChild('inlineEditControl'),
        __metadata("design:type", core_1.ElementRef)
    ], InlineEditComponent.prototype, "inlineEditControl", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], InlineEditComponent.prototype, "label", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], InlineEditComponent.prototype, "type", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], InlineEditComponent.prototype, "required", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], InlineEditComponent.prototype, "disabled", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], InlineEditComponent.prototype, "editing", void 0);
    InlineEditComponent = InlineEditComponent_1 = __decorate([
        core_1.Component({
            selector: 'inline-edit',
            templateUrl: './inline-edit.component.html',
            providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
            styleUrls: ['./inline-edit.component.css']
        }),
        __metadata("design:paramtypes", [core_1.ElementRef, core_1.Renderer, strings_service_1.StringsService])
    ], InlineEditComponent);
    return InlineEditComponent;
}());
exports.InlineEditComponent = InlineEditComponent;
//# sourceMappingURL=inline-edit.component.js.map