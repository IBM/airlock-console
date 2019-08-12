/**
 * Created by michaeld on 14/03/2017.
 */
import {Component, Input, OnDestroy, Directive} from '@angular/core';
import {DisplayAttribute} from "../../model/analytic";
import {InlineEditComponent} from "./inlinedit/inline-edit.component"
import {StringsService} from "../../services/strings.service";

@Component({
    selector: 'wl-attributes',
    templateUrl: 'wlattributes.component.html',
    styleUrls: ['wlattributes.component.css']
})
export class WhitelistAttributes  {
    isGroupOpen = false;
    @Input() featureAnalyticDisplayAttributes: DisplayAttribute[]
    panels: Array<any> = [];

    constructor(private _stringsSrevice: StringsService) {
        this.panels = [
            {
                heading: '',
                content: [{'name':'a', 'selected':true}, {'name':'b', 'selected':false}, {'name':['precip', 'value'], 'arraypattern': ['[]'], 'selected':false, 'type': InlineEditComponent.ARRAY_TYPE}]
            }
        /*,
         {
         heading: 'custom attributes',
         content: [{'name':'a*', 'selected':true}, {'name':'b*', 'selected':false}, {'name':'c*', 'selected':false}]
         }
         */
        ]
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    editable(attribute: any) {
        return (attribute.type && (attribute.type == InlineEditComponent.ARRAY_TYPE || attribute.type == InlineEditComponent.CUSTOM_TYPE));
    }

    array(attribute: any) {
        return (attribute.type && attribute.type == InlineEditComponent.ARRAY_TYPE);
    }

    custom(attribute: any) {
        return (attribute.type && attribute.type == InlineEditComponent.CUSTOM_TYPE);
    }

    onCheckboxChange(attribute: any) { //alert(this.panels[0].content[0].selected);alert(this.panels[0].content[1].selected);
    }

    removeAngularAccordionGroup() {
        this.panels.splice(1,1);
    }

    addAngularAccordionGroup() {
        let accordionGroupContent = {heading:'Hi New Content !', content:'Content angular 2 accordion '};
        this.panels.splice(1,0,accordionGroupContent);
    }

    addCustomAttribute() {
        let customContent = {name:[], selected:true, type: InlineEditComponent.CUSTOM_TYPE, arrayPattern:[]};
        this.featureAnalyticDisplayAttributes.splice(this.featureAnalyticDisplayAttributes.length,0,customContent);
    }

    removeCustomAttribute(index) {
        this.featureAnalyticDisplayAttributes.splice(index,1);
    }
}

@Component({
    selector: 'accordion-all',
    template:`
  <ng-content></ng-content>
          `,
    host: {
        'class': 'panel-group'
    }
})
export class Accordion {
    panels: Array<AccordionGroup> = [];

    addGroup(group: AccordionGroup): void {
        this.panels.push(group);
    }

    closeOthers(openGroup: AccordionGroup): void {
        this.panels.forEach((group: AccordionGroup) => {
            if (group !== openGroup) {
                group.isOpen = false;
            }
        });
    }

    removeGroup(group: AccordionGroup): void {
        const index = this.panels.indexOf(group);
        if (index !== -1) {
            this.panels.splice(index, 1);
        }
    }
}

@Component({
    selector: 'accordion-section',
    template:`
                <div class="panel panel-default" [ngClass]="{'panel-open': isOpen}">
                  <div class="panel-heading" (click)="toggleOpen($event)">
                    <h4 class="panel-title">
                      <a href tabindex="0"><span>{{heading}}</span></a>
                       <!--div class="control" (click)="editing=!editing" style="float:left;position:relative;top:1px;left: 5px; height: 7px"><i class="ion-android-arrow-dropleft" style="font-size: 18px"></i></div-->
                    </h4>
                  </div>
                  <div class="panel-collapse" [hidden]="!isOpen">
                    <div class="panel-body">
                        <ng-content></ng-content>
                    </div>
                  </div>
                </div>
          `,

})
export class AccordionGroup implements OnDestroy {
    private _isOpen:boolean = true;

    @Input() heading: string;

    @Input()
    set isOpen(value: boolean) {
        this._isOpen = value;
        if (value) {
            //this.accordion.closeOthers(this);
        }
    }

    get isOpen() {
        return this._isOpen;
    }

    constructor(private accordion: Accordion) {
        this.accordion.addGroup(this);
    }

    ngOnDestroy() {
        this.accordion.removeGroup(this);
    }

    toggleOpen(event: MouseEvent): void {
        event.preventDefault();
        this.isOpen = !this.isOpen;
    }
}