import {Component, Input, OnInit} from '@angular/core';
import {Feature} from "../../../model/feature";
import {StringsService} from "../../../services/strings.service";
import {animate, style, transition, trigger} from "@angular/animations";
import {SearchResult} from "../../../model/searchResult";

@Component({
    selector: 'airlock-search',
    templateUrl: 'airlockSearch.html',
    styleUrls: ['airlockSearch.scss']
})

export class AirlockSearch implements OnInit {
    @Input() closable = true;
    @Input() visible: boolean;
    @Input() features: Feature[];
    @Input() searchTerm: string;
    @Input() results: Array<SearchResult>;
    loading: boolean;
    private numSearchResults: number;
    private selectedResultNum: number;

    constructor(private _stringsSrevice: StringsService) {
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    close(val) {

    }
    ngOnInit() {
    }
}
