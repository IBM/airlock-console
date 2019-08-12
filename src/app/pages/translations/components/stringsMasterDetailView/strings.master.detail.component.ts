import {Component, Input,Output, ViewEncapsulation,EventEmitter} from '@angular/core';
import {StringToTranslate} from "../../../../model/stringToTranslate";
import {Season} from "../../../../model/season";
import {OnChanges} from "@angular/core";
import {SimpleChanges} from "@angular/core";
import { Subject }    from 'rxjs/Subject';
import {VerifyActionModal} from "../../../../theme/airlock.components/verifyActionModal/verifyActionModal.component";

@Component({
    selector: 'strings-master-detail',
    styles: [require('./strings.master.detail.scss')],
    template: require('./strings.master.detail.html'),
})
export class StringsMasterDetail  {
    @Input() selectedStrings: StringToTranslate[];
    @Input() selectedSeason: Season;

    @Input() supportedLocales: string[];
    @Input()
    parentSubject:Subject<any>;
    selectedStringToTranslate:StringToTranslate;
    @Output() reloadTranslations : EventEmitter<any> = new EventEmitter();
    @Input() verifyActionModal:  VerifyActionModal;

    constructor() {
    }
    reloadParentTranslations(event:any){
        this.reloadTranslations.emit(null);
    }
    stringSelectionChanged(stringToTranslate:StringToTranslate){
        console.log("StringsMasterDetail stringSelectionChanged");
            this.selectedStringToTranslate=stringToTranslate;
    }
    // ngOnChanges(changes: SimpleChanges) {
    //     console.log("StringsMasterDetail ngOnChanges");
    //     // changes.prop contains the old and the new value...
    //     this.selectedStringToTranslate = null;
    // }
}