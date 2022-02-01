import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StringToTranslate} from "../../../../model/stringToTranslate";
import {Season} from "../../../../model/season";
import {Subject} from 'rxjs';

@Component({
    selector: 'strings-master-detail',
    styleUrls: ['./strings.master.detail.scss'],
    templateUrl: './strings.master.detail.html',
})
export class StringsMasterDetail {
    @Input() selectedStrings: StringToTranslate[];
    @Input() selectedSeason: Season;
    @Input() supportedLocales: string[];
    @Input() parentSubject: Subject<any>;
    @Output() reloadTranslations: EventEmitter<any> = new EventEmitter();

    selectedStringToTranslate: StringToTranslate;


    constructor() {
    }

    ngOnInit(){
    }

    reloadParentTranslations(event: any) {
        this.reloadTranslations.emit(null);
    }

    stringSelectionChanged(stringToTranslate: StringToTranslate) {
        this.selectedStringToTranslate = stringToTranslate;
    }

    // ngOnChanges(changes: SimpleChanges) {
    //     console.log("StringsMasterDetail ngOnChanges");
    //     // changes.prop contains the old and the new value...
    //     this.selectedStringToTranslate = null;
    // }
}
