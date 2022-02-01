import {ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {StringToTranslate} from "../../../../model/stringToTranslate";
import {Season} from "../../../../model/season";
import {AirlockService} from "../../../../services/airlock.service";
import {StringsService} from "../../../../services/strings.service";
import {NbPopoverDirective} from "@nebular/theme";
import {CustomStatusComponent} from "./smartTableCustom/custom.status.compunent";
import {CustomTranslationComponent} from "./smartTableCustom/custom.translation.component";
import {CustomActionComponent} from "./smartTableCustom/custom.action.component";

interface TreeNode<T> {
    data: T;
    children?: TreeNode<T>[];
    expanded?: boolean;
}

@Component({
    selector: 'strings-table',
    styleUrls: ['./strings.table.scss'],
    templateUrl: './strings.table.html',
})
export class StringsTableView implements OnInit {
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() selectedStrings: StringToTranslate[];
    @Input() selectedSeason: Season;
    @Input() supportedLocales: string[];
    selectedStringToTranslate: StringToTranslate;
    // @Output() reloadTranslations: EventEmitter<any> = new EventEmitter();
    @Output() onSelectedChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

    actionsColumn = 'actions';
    statusColumn = 'status';
    allColumns = [];
    sortColumn: string;

    public data;
    private staticColumns = {
        actions: {
            filter: false,
            title: '',
            type: 'custom',
            renderComponent: CustomActionComponent,
            width: '88px'
        },
        key: {
            title: 'String ID',
        },
        value: {
            title: 'String Value'
        },
        translatedSummary: {
            filter: false,
            title: 'Translated'
        },
        prettyStage: {
            filter: false,
            title: 'Stage'
        },
        status: {
            filter: false,
            title: 'Status',
            type: 'custom',
            renderComponent: CustomStatusComponent,
        }
    };
    public settings = {
        pager: {
            display: true,
            perPage: 25
        },
        actions: false,
        // hideSubHeader: true,
        columns: this.staticColumns
        };
    loading: boolean = false;
    private sub: any = null;
    private showTranslations = {};
    curSelectedStringID: string = null;
    selectedRowsIDs: string[] = [];

    constructor(private _airlockService: AirlockService,
                private cd: ChangeDetectorRef,
                private _stringsService: StringsService) {
    }

    ngOnInit(): void {
        for (let locale of this.supportedLocales){
            (this.settings.columns as any).locale = { title: locale,
                type: 'custom',
                renderComponent: CustomTranslationComponent}
        }
    }

    ngOnChanges(change: any): void {
        this.data = this.selectedStrings;
        if (change.supportedLocales !== undefined){

            if (change.supportedLocales.currentValue?.length < change.supportedLocales.previousValue?.length){
                for (let locale of change.supportedLocales.previousValue){
                    let exists = false;
                    for (let newLocale of change.supportedLocales.currentValue){
                        if (locale === newLocale){
                            exists = true;
                        }
                    }
                    if (!exists){
                        delete this.settings.columns[locale];
                        break;
                    }
                }
            }
        }
        if (this.data != undefined && this.data.length > 0) {
            for (let locale of this.supportedLocales){
                (this.settings.columns as any)[locale] = { title: locale,
                    type: 'custom',
                    filter: false,
                    width: '40px',
                    renderComponent: CustomTranslationComponent}
            }
            for (let selectedStrings of this.selectedStrings){
                selectedStrings.prettyStage = selectedStrings.stage.charAt(0).toUpperCase() + selectedStrings.stage.substring(1).toLowerCase();
                selectedStrings.translatedSummary = "(" + this.getNumberOfTranslatedLocales(selectedStrings) + "/" + selectedStrings.translations.length + ")";
                for (let locale of this.supportedLocales){
                    (selectedStrings as any)[locale] =  locale;
                }
            }
            this.loaded = Promise.resolve(true); // Setting the Promise as resolved after I have the needed data
            this.loading = false;
        }
    }

    getShowOn(index: number) {
        const minWithForMultipleColumns = 400;
        const nextColumnStep = 100;
        return minWithForMultipleColumns + (nextColumnStep * index);
    }

    getNotShowingTranslationWithStatus(item: StringToTranslate, status: String): any {
        for (let translation of item.translations) {
            if (typeof (this.showTranslations[translation.locale]) === 'undefined') {
                if (translation.translationStatus === status){
                    return translation;
                }
            } else {
                if (!this.showTranslations[translation.locale] && translation.translationStatus === status){
                    return translation;
                }
            }
        }
        return undefined;
    }

    isTranslationWithNoneStatuses(item: StringToTranslate, status1: String, status2: String): boolean {
        for (let translation of item.translations) {
            if (translation.translationStatus !== status1 && translation.translationStatus !== status2) {
                return true;
            }
        }
        return false;
    }

    localeClicked(locale): void {
        if (typeof (this.showTranslations[locale]) === 'undefined') {
            this.showTranslations[locale] = true;
        } else {
            this.showTranslations[locale] = !this.showTranslations[locale];
        }
    }

    ngOnDestroy() {
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
    }

    getNumberOfTranslatedLocales(stringToTranslate: StringToTranslate) {
        let counter: number = 0;
        for (let item of stringToTranslate.translations) {
            if (item.translationStatus == 'TRANSLATED' || item.translationStatus == 'OVERRIDE') {
                counter++;
            }
        }
        return counter;
    }

    isSupportedLocale(locale: string) {
        if (!this.supportedLocales) {
            return true;
        }
        return this.supportedLocales.some(x => x == locale);
    }

    rowSelected(stringToTranslateID: string) {
        console.log("rowSelected");
        this.curSelectedStringID = stringToTranslateID;
        if (this.isRowSelected(stringToTranslateID)) {
            let index = this.selectedRowsIDs.indexOf(stringToTranslateID);
            this.selectedRowsIDs.splice(index, 1);
        } else {
            this.selectedRowsIDs.push(stringToTranslateID);
        }
        this.onSelectedChanged.emit(this.selectedRowsIDs);
    }

    clearSelected() {
        this.selectedRowsIDs = [];
        this.onSelectedChanged.emit(this.selectedRowsIDs);
    }

    isRowSelected(stringToTranslateID: string): boolean {
        return this.selectedRowsIDs.indexOf(stringToTranslateID) > -1;
    }
    loaded: Promise<boolean>;
}
