import { Component,
  Input,
  ElementRef,
  ViewChild,
  Renderer,
  forwardRef,
  OnInit } from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {StringsService} from "../../../services/strings.service";

const INLINE_EDIT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => InlineEditComponent),
  multi: true
};

@Component({
  selector: 'inline-edit',
  templateUrl: './inline-edit.component.html',
  providers: [INLINE_EDIT_CONTROL_VALUE_ACCESSOR],
  styleUrls: ['./inline-edit.component.css']
})

export class InlineEditComponent implements ControlValueAccessor, OnInit {
  public static ARRAY_TYPE = 'ARRAY';
  public static CUSTOM_TYPE = 'CUSTOM';

  @ViewChild('inlineEditControl') inlineEditControl: ElementRef; // input DOM element
  @Input() label: string = '';  // Label value for input element
  @Input() type: string = 'text'; // The type of input element
  @Input() required: boolean = false; // Is input requried?
  @Input() disabled: boolean = false; // Is input disabled?
  private _value: string = ''; // Private variable for input value
  private preValue: string = ''; // The value before clicking to edit
  @Input() editing: boolean = false; // Is Component in edit mode?
  public onChange: any = Function.prototype; // Trascend the onChange event
  public onTouched: any = Function.prototype; // Trascend the onTouch event

  // Control Value Accessors for ngModel
  get value(): any {
    if (!this._value && !this.editing) {
      return this.getString('analytics_edit_this_value');
    }
    return this._value;
  }

  set value(v: any) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(v);

      if (this.type == InlineEditComponent.ARRAY_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
        this.inlineEditControl.nativeElement.focus();
        this.inlineEditControl.nativeElement.placeholder='e.g. 1-5, 8, 11-13';
      }
      else if (this.type == InlineEditComponent.CUSTOM_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
        this.inlineEditControl.nativeElement.focus();
        this.inlineEditControl.nativeElement.placeholder='e.g. big.label.size[5]';
      }
    }
  }

  constructor(element: ElementRef, private _renderer: Renderer, private _stringsSrevice: StringsService) {
  }

  getString(name: string) {
    return this._stringsSrevice.getString(name);
  }

  ngAfterViewInit() {
    if (this.type == InlineEditComponent.ARRAY_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
      this.inlineEditControl.nativeElement.focus();
      this.inlineEditControl.nativeElement.placeholder='e.g. 1-5, 8, 11-13';
    }
    else if (this.type == InlineEditComponent.CUSTOM_TYPE && this.inlineEditControl && this.inlineEditControl.nativeElement) {
      this.inlineEditControl.nativeElement.placeholder='e.g. big.label.size[5]';
    }
  }

  tooltip() {
    let tooltip = "";
    if (this.type) {
      if (this.type == InlineEditComponent.ARRAY_TYPE)
        tooltip = tooltip + this.getString('analytics_array_attribute');
      else if (this.type == InlineEditComponent.CUSTOM_TYPE)
        tooltip =  tooltip +  this.getString('analytics_custom_attribute');
    }
    return tooltip;
  }

  array() {
    return this.type && this.type == InlineEditComponent.ARRAY_TYPE;
  }

  custom() {
    return this.type && this.type == InlineEditComponent.CUSTOM_TYPE;
  }

  // Required for ControlValueAccessor interface
  writeValue(value: any) {
    this._value = value;
  }

  // Required forControlValueAccessor interface
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  // Required forControlValueAccessor interface
  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  // Do stuff when the input element loses focus
  onBlur($event: Event) {
    this.editing = false;
  }

  // Start the editting process for the input element
  edit(value) {
    if (this.disabled) {
      return;
    }
    this.preValue = value;
    this.editing = true;
    setTimeout(_ => this._renderer.invokeElementMethod(this.inlineEditControl.nativeElement, 'focus', []));
  }

  ngOnInit() {
  }
}
