import {Component, EventEmitter, HostListener, Input, Output, ViewChild} from '@angular/core';
import {Product} from "../../../model/product";
import {Season} from "../../../model/season";
import {GlobalState} from "../../../global.state";
import {StickyViewDirective} from "../../directives/stickyView/sticky-view.directive";

export interface FilterOption {
    id: string;
    label: string;
    selected: boolean;
}

@Component({
    selector: 'custom-airlock-header',
    templateUrl: './customAirlockHeader.html',
    styleUrls: ['./customAirlockHeader.scss', './ng2-select.scss', './glyphicons.scss'],
})

export class CustomAirlockHeader {
    private DEV_ID = "Development";
    private DISABLED_ID = "Disabled";
    private CONFIGURATION_ID = "Configuration";
    private ORDERING_ID = "Ordering";
    private NOT_IN_BRANCH_ID = "Features not in branch";
    optionsLength = 0;
    @Input() products: Array<Product>;
    @Input() seasons: Array<Season>;
    @Input() selectedProduct: Product;
    @Input() selectedSeason: Season;
    @Input() showConfig: boolean;
    @Input() showOrdering: boolean;
    @Input() changedWidth: boolean;
    @Input() showDisabled: boolean;
    @Input() showSearch: boolean;
    @Input() showNotInBranch: boolean;
    @Input() showAnalytics: boolean;
    @Input() showAddAuthUser: boolean = false;
    @Input() hideColumns: boolean = false;
    @Input() simpleSearch: boolean = false;
    @Input() showCohorts: boolean = false;
    @Input() showDataimport: boolean = false;
    @ViewChild(StickyViewDirective) stickyViewDirective;

    @Input()
    set showExperiments(showExperiments: boolean) {
        if (showExperiments) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true},
                {id: this.DISABLED_ID, label: "Disabled", selected: true}
            ];
            this.showExperimentsHeader = true;
            this.showStreamsHeader = false;
            this.showPollsHeader = false;
            this.showNotificationsHeader = false;
        } else if (this.showPollsHeader) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true},
                {id: this.DISABLED_ID, label: "Disabled", selected: true}
            ];
            this.showExperimentsHeader = false;
            this.showStreamsHeader = false;
            this.showPollsHeader = true;
            this.showNotificationsHeader = false;
        } else if (this.showStreamsHeader) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true}
            ];
            this.showExperimentsHeader = false;
            this.showStreamsHeader = true;
            this.showPollsHeader = false;
            this.showNotificationsHeader = false;
        } else {
            let currBranch = this._appState.getData('features.currentBranch');
            if (currBranch && currBranch.uniqueId.toLowerCase() == "master") {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true}
                ];
            } else {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true},
                    {id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true}
                ];
            }

            this.showExperimentsHeader = false;
        }
    }

    @Input()
    set showOrderingOption(showOrderingOption: boolean) {
        this.hideOrderingRules = !showOrderingOption;
        if (!showOrderingOption) {
            this.mFilters = [
                {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true}
            ];
            this.showStreamsHeader = false;
            this.showExperimentsHeader = false;
            this.showNotificationsHeader = false;
        }
    }

    @Input()
    set showNotifications(showNotifications: boolean) {
        if (showNotifications) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true}
            ];
            this.showStreamsHeader = false;
            this.showExperimentsHeader = false;
            this.showNotificationsHeader = true;
        }
    }

    @Input()
    set showPolls(showPolls: boolean) {
        if (showPolls) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true},
                {id: this.DISABLED_ID, label: "Disabled", selected: true}
            ];
            this.showPollsHeader = true;
            this.showStreamsHeader = false;
            this.showExperimentsHeader = false;
            this.showNotificationsHeader = false;
        }
    }

    @Input()
    set showPurchasesPage(show: boolean) {
        if (show) {
            this.showPurchases = true;
            let currBranch = this._appState.getData('features.currentBranch');
            if (currBranch && currBranch.uniqueId.toLowerCase() == "master") {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true}
                ];
                if (this.hideOrderingRules) {
                    this.mFilters = [
                        {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                        {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true}
                    ];
                }
            } else {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true},
                    {id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true}
                ];
                if (this.hideOrderingRules) {
                    this.mFilters = [
                        {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                        {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                        {id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true}
                    ];
                }
            }
        }
    }

    @Input()
    set showStreams(showStreams: boolean) {
        if (showStreams) {
            this.mFilters = [
                {id: this.DEV_ID, label: "Development", selected: true}
            ];
            this.showStreamsHeader = true;
            this.showExperimentsHeader = false;
        } else {
            let currBranch = this._appState.getData('features.currentBranch');
            if (currBranch && currBranch.uniqueId.toLowerCase() == "master") {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true}
                ];
            } else {
                this.mFilters = [
                    {id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true},
                    {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
                    {id: this.ORDERING_ID, label: 'Ordering rules', selected: true},
                    {id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true}
                ];
            }
            this.showStreamsHeader = false;
        }
    }

    @Input() showDisplayOptions: boolean = true;
    @Input() showPurchases: boolean = false;
    @Input() showModeSelector: boolean = false;
    @Input() showTranslationFilters: boolean = false;
    @Input() showTableHeader: boolean = true;
    @Input() showDevFeatures: boolean;
    @Input() currentLayout: string;
    @Input() numSearchResults: number = 0;
    @Input() selectedResultNum: number;
    @Input() featuresList: Array<any> = [];
    @Input() orderByList: Array<any> = [];
    @Input() filterDateList: Array<any> = [];
    localeOptions: any[] = [];
    @Output() onShowConfigChanged = new EventEmitter<boolean>();
    @Output() onShowOrderingChanged = new EventEmitter<boolean>();
    @Output() onShowDisabledChanged = new EventEmitter<boolean>();
    @Output() onShowDevFeaturesChanged = new EventEmitter<boolean>();
    @Output() onShowNotInBranchChanged = new EventEmitter<boolean>();
    @Output() onProductSelected = new EventEmitter<Product>();
    @Output() onSeasonSelected = new EventEmitter<Season>();
    @Output() onLayoutSelected = new EventEmitter<string>();
    @Output() onFeatureSelected = new EventEmitter<string>();
    @Output() onOrderBySelected = new EventEmitter<string>();
    @Output() onDateFilterSelected = new EventEmitter<string>();
    @Output() onQueryChanged = new EventEmitter<string>();
    @Output() onSearchQueryChanged = new EventEmitter<string>();
    @Output() onLocalesChanged = new EventEmitter<Array<string>>();
    @Output() onNextSearchResult = new EventEmitter<boolean>();
    @Output() onAddUserClicked = new EventEmitter<any>();
    @Output() onShowAdvancedSearch = new EventEmitter<any>()
    @ViewChild('headerDiv') input;
    private lastSearchTime;
    private hideOrderingRules = false;
    private value: any = [];
    public checkModel: any = {left: false, middle: true, right: false};
    filterOptions: Array<String> = ["Stage", "Configuration"];
    selectedFilter: string = "Stage";
    filterOn: boolean = this.showDevFeatures;
    productDropDownWidth: string = '1000px';
    filterQuery: string = null;
    showExperimentsHeader: boolean;
    showPollsHeader: boolean;
    showNotificationsHeader: boolean;
    showStreamsHeader: boolean;
    searchQuery: string = null;

    private mFilters: FilterOption[] = [
        {id: this.DEV_ID, label: "Development", selected: true},
        {id: this.CONFIGURATION_ID, label: 'Configurations', selected: true},
        {id: this.ORDERING_ID, label: 'Ordering rules', selected: true}
    ];
    private items: Array<any> = [{id: "id1", text: "text1"}, {id: "id2", text: "text2"}, {id: "id3", text: "text3"}];
    optionsModel: string[];

    @Input()
    set availableLocales(locales: any[]) {
        this.localeOptions = locales;
    }

    @Input()
    set selectedLocales(locales: any[]) {
        this.optionsModel = locales.map(function (locale) {
            return locale.id;
        });
    }

    // ngOnInit() {
    //     this.optionsLength = this.mFilters.length;
    // }

    // ngAfterViewInit() {
    //     this.optionsLength = this.mFilters.length;
    // }

    getDevelopmentFeaturesLabel() {
        if (this.showPurchases) {
            return "Development";
        } else {
            return "Development Features";
        }
    }

    getFetauresInBranchLabel() {
        //Features not in branch
        if (this.showPurchases) {
            return "Entitlements not in branch";
        } else {
            return "Features not in branch";
        }
    }

    mySettings: any = {
        pullRight: false,
        enableSearch: true,
        checkedStyle: 'checkboxes',
        buttonClasses: 'btn btn-default btn-secondary',
        selectionLimit: 0,
        closeOnSelect: false,
        autoUnselect: false,
        showCheckAll: true,
        showUncheckAll: true,
        fixedTitle: true,
        dynamicTitleMaxItems: 3,
        maxHeight: '300px',
    };
    myTexts: any = {
        checkAll: 'Select all',
        uncheckAll: 'Clear all',
        checked: 'checked',
        checkedPlural: 'checked',
        searchPlaceholder: 'Search...',
        defaultTitle: 'Selected Locales',
        allSelected: 'Selected Locales: All',
    };

    selectedFilters: String[] = ["Configuration", "Development", "Ordering", "Disabled"];
    private filterSettings: any = {
        buttonClasses: ['btn', 'btn-default'],
        maxInline: 0,
        showCheckAll: false,
        showUncheckAll: false,
        defaultButtonText: 'Display Options',
        allSelected: true
    };

    private mockFeaturesList: Array<any> = [
        {value: "Item1", label: "Item1"}, {value: "ShabatShalom", label: "ShabatShalom"}, {
            value: "Hello World",
            label: "Hello World"
        }
    ];


    /////// filter select values
    public selected(value: any): void {
        this.onFeatureSelected.emit(value.value);
    }

    public removed(value: any): void {
        this.onFeatureSelected.emit("");
    }

    public orderBySelected(event: any): void {
        this.onOrderBySelected.emit(event.value);
    }

    public orderByRemoved(value: any): void {
        this.onOrderBySelected.emit("");
    }

    public dateFilterSelected(event: any): void {
        this.onDateFilterSelected.emit(event.value);
    }

    public dateFilterRemoved(value: any): void {
        this.onDateFilterSelected.emit("");
    }

    public typed(value: any): void {
        // console.log('New search input: ', value);
    }

    public refreshValue(value: any): void {
        // this.value = value;
        this.onFeatureSelected.emit(value.id);
    }

    public itemsToString(value: Array<any> = []): string {
        return value
            .map((item: any) => {
                return item.text;
            }).join(',');
    }

    constructor(private _appState: GlobalState) {
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentBranch', 'header');
    }

    showConfiguration(show: boolean) {
        this.showConfig = show;
        this.onShowConfigChanged.emit(show);
    }

    toggleConfiguration() {
        this.showConfig = !this.showConfig;
        this.onShowConfigChanged.emit(this.showConfig);
    }

    toggleShowDevFeatures() {
        this.showDevFeatures = !this.showDevFeatures;
        this.onShowDevFeaturesChanged.emit(this.showDevFeatures);
    }

    getIsKeyIndex(key: String): number {
        var i = 0;
        for (i = 0; i < this.mFilters.length; ++i) {
            if (this.mFilters[i].id === key) {
                return i;
            }
        }
        return -1;
    }

    displayConfigChanged(event) {
        // console.log(this.mFilters);
        let devInd = this.getIsKeyIndex(this.DEV_ID);
        let confInd = this.getIsKeyIndex(this.CONFIGURATION_ID);
        let disabledInd = this.getIsKeyIndex(this.DISABLED_ID);
        let orderinfInd = this.getIsKeyIndex(this.ORDERING_ID);
        let outbranchInd = this.getIsKeyIndex(this.NOT_IN_BRANCH_ID);
        if (outbranchInd > -1) {
            // let showNotInBranch = this.mFilters[outbranchInd].selected;
            // if (showNotInBranch != this.showNotInBranch) {
            //     this.showNotInBranch = !this.showNotInBranch;
            //     this.onShowNotInBranchChanged.emit(this.showNotInBranch);
            // }
        }

        if (this.showExperimentsHeader) {
            let showDisabled = (disabledInd > -1) ? this.mFilters[disabledInd].selected : false;
            if (showDisabled != this.showDisabled) {
                this.showDisabled = !this.showDisabled;
                this.onShowDisabledChanged.emit(this.showDisabled);
            }

        } else {
            let showConfig = (confInd > -1) ? this.mFilters[confInd].selected : false;
            if (showConfig != this.showConfig) {
                this.showConfig = !this.showConfig;
                this.onShowConfigChanged.emit(this.showConfig);
            }
            let showOrdering = (orderinfInd > -1) ? this.mFilters[orderinfInd].selected : false;
            if (showOrdering != this.showOrdering) {
                this.showOrdering = !this.showOrdering;
                this.onShowOrderingChanged.emit(this.showOrdering);
            }
        }


        if (devInd > -1) {
            let showDevFeatures = this.mFilters[devInd].selected;
            if (showDevFeatures != this.showDevFeatures) {
                this.showDevFeatures = !this.showDevFeatures;
                this.onShowDevFeaturesChanged.emit(this.showDevFeatures);
            }
        }

    }

    getShowDevFeaturesString() {
        if (this.showDevFeatures) {
            return "All";
        } else {
            return "Production";
        }
    }

    getShowConfigString() {
        if (this.showConfig) {
            return "Visible";
        } else {
            return "Hidden";
        }
    }

    getElementTop(element) {
        var subjectRect = element.getBoundingClientRect()
        return subjectRect.top; // + document.documentElement.scrollTop
    }

    onProductsClick() {
        var longestProdName;
        var longestProdSize = 0;
        for (var i = 0; i < this.products.length; i++) {
            if (this.products[i].name.length > longestProdSize) {
                longestProdSize = this.products[i].name.length;
                longestProdName = this.products[i].name;
            }
        }
        this.productDropDownWidth = (9 * longestProdSize).toString() + 'px';
    }

    selectProduct(item: Product) {
        this.onProductSelected.emit(item);
    }

    selectSeason(item: Season) {
        this.onSeasonSelected.emit(item);
    }

    getSeasonName(item: Season) {
        if (item) {
            let max = item.maxVersion ? item.maxVersion : "";
            let min = item.minVersion ? item.minVersion : "";
            if (max == "") {
                return min + " and up";
            } else {
                return min + " to " + max + " (not including " + max + ")";
            }
        } else {
            return "";
        }
    }

    selectFilter(filter: string) {
        if (this.selectedFilter == filter) {
            return;
        }
        if (filter == 'Stage') {
            this.showConfig = true;
        } else if (filter == 'Configuration') {
            this.showDevFeatures = true;
        }
        this.selectedFilter = filter;
        this.onShowConfigChanged.emit(this.showConfig);
        this.onShowDevFeaturesChanged.emit(this.showDevFeatures);
    }

    setLayout(layout: string) {
        this.onLayoutSelected.emit(layout);
    }

    filterStrings() {
        this.onQueryChanged.emit(this.filterQuery);
    }

    filterFeatures() {
        var now = Date.now();
        this.lastSearchTime = now;
        setTimeout(() => {
            if (now == this.lastSearchTime) {
                this.onSearchQueryChanged.emit(this.searchQuery);
            }
        }, 500, now);
    }

    onLocalesChange(event) {
        var selected = event.selected;
        var eventLocale = event.value;
        var sortedLocales = [];
        for (var locale of this.localeOptions) {
            if (locale.id === eventLocale){
                if (selected) {
                    sortedLocales.push(locale.id);
                    if (this.optionsModel.indexOf(locale.id) === -1){
                        this.optionsModel.push(eventLocale);
                    }
                }else{
                    this.optionsModel = this.optionsModel.filter(x=>(x !== eventLocale));
                }
            } else if (this.optionsModel.indexOf(locale.id) > -1){
                sortedLocales.push(locale.id);
            }
        }
        this.onLocalesChanged.emit(sortedLocales);
    }

    getNumResults(numResults: number): string {
        if (this.searchQuery && this.searchQuery.length > 0) {
            if (numResults == 0) return "no results";
            var indexStr = "";
            if (this.selectedResultNum >= 0) {
                indexStr = "" + (this.selectedResultNum + 1) + " out of "
            }
            if (numResults == 1) return indexStr + "1 result";
            return indexStr + numResults + " results";
        } else {
            return "";
        }
    }

    clearSearch() {
        this.searchQuery = null;
        this.filterFeatures();
    }

    getNextResult() {
        this.onNextSearchResult.emit(true);
    }

    getPreviousResult() {
        this.onNextSearchResult.emit(false);
    }

    addUserClicked(event) {
        this.onAddUserClicked.emit(true);
    }

    showAdvancedSearchClicked(event) {
        this.onShowAdvancedSearch.emit(null);
    }

    handleSelectionChange(event: any) {
        if (event.selected && this.optionsLength < this.mFilters.length){
            this.optionsLength++;
        }else{
            this.optionsLength--;
        }
        if (event.value === "Ordering"){
            if (event.selected !== this.showOrdering){
                this.showOrdering = !this.showOrdering;
                this.onShowOrderingChanged.emit(this.showOrdering);
            }
        }
        if (event.value === "Configuration"){
            if (event.selected !== this.showConfig){
                this.showConfig = !this.showConfig;
                this.onShowConfigChanged.emit(this.showConfig);
            }
        }
        if (event.value === "Disabled"){
            if (event.selected !== this.showDisabled){
                this.showDisabled = !this.showDisabled;
                this.onShowDisabledChanged.emit(this.showDisabled);
            }
        }
        if (event.value === "Development"){
            if (event.selected !== this.showDevFeatures){
                this.showDevFeatures = !this.showDevFeatures;
                this.onShowDevFeaturesChanged.emit(this.showDevFeatures);
            }
        }

    }
}
