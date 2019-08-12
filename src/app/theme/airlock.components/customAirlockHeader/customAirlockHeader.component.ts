import {Component, Input, ViewChild, ChangeDetectorRef, HostListener} from '@angular/core';
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {Product} from "../../../model/product";
import {Season} from "../../../model/season";
import { IDropdownItem } from 'ng2-dropdown-multiselect';
import {IMultiselectConfig} from "ng2-dropdown-multiselect/lib";
import { IMultiSelectOption, IMultiSelectSettings, IMultiSelectTexts} from 'angular-2-dropdown-multiselect';
import {GlobalState} from "../../../global.state";
@Component({
    selector: 'custom-airlock-header',
    template: require('./customAirlockHeader.html'),
    styles: [require('./customAirlockHeader.scss'), require('./ng2-select.scss'), require('./glyphicons.scss')],
})
export class CustomAirlockHeader {
    private  DEV_ID = "Development";
    private  DISABLED_ID = "Disabled";
    private  CONFIGURATION_ID = "Configuration";
    private  ORDERING_ID = "Ordering";
    private  NOT_IN_BRANCH_ID = "Features not in branch";
    @Input() staticMode:boolean = false;

    @Input() products:Array<Product>;
    @Input() seasons:Array<Season>;
    @Input() selectedProduct:Product;
    @Input() selectedSeason:Season;
    @Input() showConfig:boolean;
    @Input() showOrdering:boolean;
    // @Input() showOrderingOption:boolean;
    @Input() showDisabled:boolean;
    @Input() showSearch:boolean;
    @Input() showNotInBranch:boolean;
    @Input() showAnalytics:boolean;
    @Input() showAddAuthUser:boolean = false;
    @Input() hideColumns:boolean = false;
    @Input() simpleSearch:boolean = false;

    @Input()
    set showExperiments(showExperiments:boolean){
        if (showExperiments) {
            this.mFilters = [
                { id: this.DEV_ID, label: "Development", selected: true },
                { id: this.DISABLED_ID, label: "Disabled", selected: true }
            ];
            this.showExperimentsHeader = true;
            this.showStreamsHeader = false;
        }
        else if (this.showStreamsHeader) {
            this.mFilters = [
                { id: this.DEV_ID, label: "Development", selected: true }
            ];
            this.showExperimentsHeader = false;
            this.showStreamsHeader = true;
        }else {
            let currBranch = this._appState.getData('features.currentBranch');
            if (currBranch && currBranch.uniqueId.toLowerCase()=="master") {
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                    { id: this.ORDERING_ID, label: 'Ordering rules', selected: true }
                ];
            } else {
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                    { id: this.ORDERING_ID, label: 'Ordering rules', selected: true },
                    { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
                ];
            }

            this.showExperimentsHeader = false;
        }
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }
    }
    @Input()
    set showOrderingOption(showOrderingOption:boolean){
        this.hideOrderingRules = !showOrderingOption;
        if (!showOrderingOption) {
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true }
            ];
            this.showStreamsHeader = false;
            this.showExperimentsHeader = false;
            this.showNotificationsHeader = false;
        }
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }
    }

    @Input()
    set showNotifications(showNotifications:boolean){
        if (showNotifications) {
            this.mFilters = [
                { id: this.DEV_ID, label: "Development", selected: true }
            ];
            this.showStreamsHeader = false;
            this.showExperimentsHeader = false;
            this.showNotificationsHeader = true;
        }
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }
    }
    @Input()
    set showPurchasesPage(show:boolean){
    if(show){
        this.showPurchases = true;
        let currBranch = this._appState.getData('features.currentBranch');
        if (currBranch && currBranch.uniqueId.toLowerCase()=="master") {
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                { id: this.ORDERING_ID, label: 'Ordering rules', selected: true }
            ];
            if(this.hideOrderingRules){
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true }
                ];
            }
        } else {
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                { id: this.ORDERING_ID, label: 'Ordering rules', selected: true },
                { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
            ];
            if(this.hideOrderingRules){
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                    { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
                ];
            }
        }
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }

    }
    }
    @Input()
    set showStreams(showStreams:boolean){
        if (showStreams) {
            this.mFilters = [
                { id: this.DEV_ID, label: "Development", selected: true }
            ];
            this.showStreamsHeader = true;
            this.showExperimentsHeader = false;
        } else {
            let currBranch = this._appState.getData('features.currentBranch');
            if (currBranch && currBranch.uniqueId.toLowerCase()=="master") {
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                    { id: this.ORDERING_ID, label: 'Ordering rules', selected: true }
                ];
            } else {
                this.mFilters = [
                    { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                    { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                    { id: this.ORDERING_ID, label: 'Ordering rules', selected: true },
                    { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
                ];
            }
            this.showStreamsHeader = false;
        }
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }

    }
    @Input() showDisplayOptions:boolean = true;
    @Input() showPurchases:boolean = false;
    @Input() showModeSelector:boolean = false;
    @Input() showTranslationFilters:boolean = false;
    @Input() showTableHeader:boolean = true;
    @Input() showDevFeatures:boolean;
    @Input() currentLayout:string;
    @Input() numSearchResults:number = 0;
    @Input() selectedResultNum:number;
    @Input() featuresList: Array<any> = [];
    localeOptions: IMultiSelectOption[] = [];
    @Output() onShowConfigChanged = new EventEmitter<boolean>();
    @Output() onShowOrderingChanged = new EventEmitter<boolean>();
    @Output() onShowDisabledChanged = new EventEmitter<boolean>();
    @Output() onShowDevFeaturesChanged = new EventEmitter<boolean>();
    @Output() onShowNotInBranchChanged = new EventEmitter<boolean>();
    @Output() onProductSelected = new EventEmitter<Product>();
    @Output() onSeasonSelected = new EventEmitter<Season>();
    @Output() onLayoutSelected = new EventEmitter<string>();
    @Output() onFeatureSelected = new EventEmitter<string>();
    @Output() onQueryChanged = new EventEmitter<string>();
    @Output() onSearchQueryChanged = new EventEmitter<string>();
    @Output() onLocalesChanged = new EventEmitter<Array<string>>();
    @Output() onNextSearchResult = new EventEmitter<boolean>();
    @Output() onAddUserClicked = new EventEmitter<any>();
    @ViewChild('headertable') input;
    tableWidth:number;
    private lastSearchTime;
    private hideOrderingRules = false;
    private value:any = [];
    lastTableWidth:String = "";
    useCustomWidth:boolean;
    public checkModel:any = {left: false, middle: true, right: false};
    filterOptions:Array<String> = ["Stage", "Configuration"];
    selectedFilter: string = "Stage";
    filterOn: boolean = this.showDevFeatures;
    productDropDownWidth: string = '1000px';
    filterQuery:string = null;
    showExperimentsHeader:boolean;
    showNotificationsHeader:boolean;
    showStreamsHeader:boolean;
    searchQuery:string = null;
    private mFilters: IDropdownItem[] = [
        { id: this.DEV_ID, label: "Development", selected: true },
        { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
        { id: this.ORDERING_ID, label: 'Ordering rules', selected: true }
    ];
    private items:Array<any> = [{id:"id1",text:"text1"},{id:"id2",text:"text2"},{id:"id3",text:"text3"}];
    optionsModel: string[];
    @Input()
    set availableLocales(locales: IMultiSelectOption[]) {
        this.localeOptions = locales;
    }
    @Input()
    set selectedLocales(locales: IMultiSelectOption[]) {
        this.optionsModel = locales.map(function(locale){
            return locale.id;
        });
    }
    getDevelopmentFeaturesLabel(){
        if(this.showPurchases){
            return "Development";
        }else{
            return "Development Features";
        }
    }

    getFetauresInBranchLabel(){
        //Features not in branch
        if(this.showPurchases){
            return "Entitlements not in branch";
        }else{
            return "Features not in branch";
        }
    }
    mySettings: IMultiSelectSettings = {
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
    myTexts: IMultiSelectTexts = {
        checkAll: 'Select all',
        uncheckAll: 'Clear all',
        checked: 'checked',
        checkedPlural: 'checked',
        searchPlaceholder: 'Search...',
        defaultTitle: 'Selected Locales',
        allSelected: 'Selected Locales: All',
    };

    selectedFilters:String[] = ["Configurations","Development","Ordering"];
    private filterSettings: IMultiselectConfig = {
        buttonClasses: ['btn', 'btn-default'],
        maxInline: 0,
        showCheckAll: false,
        showUncheckAll: false,
        defaultButtonText: 'Display Options',
        allSelected: true
    };

    private mockFeaturesList:Array<any> = [
        {value:"Item1",label:"Item1"},{value:"ShabatShalom",label:"ShabatShalom"},{value:"Hello World",label:"Hello World"}
    ];


    /////// filter select values
    public selected(value:any):void {
        console.log('Selected value is: ', value);
        this.onFeatureSelected.emit(value.id);
    }

    public removed(value:any):void {
        console.log('Removed value is: ', value);
        this.onFeatureSelected.emit("");
    }

    public typed(value:any):void {
        // console.log('New search input: ', value);
    }

    public refreshValue(value:any):void {
        // this.value = value;
        console.log("data: ", value);
        this.onFeatureSelected.emit(value.id);
    }

    public itemsToString(value:Array<any> = []):string {
        return value
            .map((item:any) => {
                return item.text;
            }).join(',');
    }

    constructor(private _appState: GlobalState) {
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }
    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentBranch','header');
    }
    ngOnInit() {
        this._appState.subscribe('features.currentBranch','header',(branch) => {
            if (this.showExperimentsHeader || this.showStreamsHeader || this.showNotificationsHeader) {

            } else {
                let currBranch = this._appState.getData('features.currentBranch');
                if (currBranch && currBranch.uniqueId.toLowerCase()=="master") {
                    this.mFilters = [
                        { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                        { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                        { id: this.ORDERING_ID, label: 'Ordering rules', selected: true }
                    ];
                    if(this.hideOrderingRules){
                        this.mFilters = [
                            { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                            { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true }
                        ];
                    }
                } else {
                    this.mFilters = [
                        { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                        { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                        { id: this.ORDERING_ID, label: 'Ordering rules', selected: true },
                        { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
                    ];
                    if(this.hideOrderingRules){
                        this.mFilters = [
                            { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true },
                            { id: this.CONFIGURATION_ID, label: 'Configurations', selected: true },
                            { id: this.NOT_IN_BRANCH_ID, label: this.getFetauresInBranchLabel(), selected: true }
                        ];
                    }
                }
                if(this.staticMode){
                    this.mFilters = [
                        { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
                    ];
                }
            }
        });
        if(this.staticMode){
            this.mFilters = [
                { id: this.DEV_ID, label: this.getDevelopmentFeaturesLabel(), selected: true }
            ];
        }
    }
    ngAfterViewInit() {
        // console.log("shuboing2:"+this.getElementTop(this.input.nativeElement));
        // this.tableWidth = this.input.nativeElement.width;
    }

    showConfiguration(show:boolean) {
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
    getIsKeyIndex(key:String):number{
        var i =0;
        for(i =0;i <this.mFilters.length;++i){
            if(this.mFilters[i].id === key){
                return i;
            }
        }
        return -1;
    }
    displayConfigChanged(event) {
        console.log("displayConfigChanged");
        console.log(this.mFilters);
        let devInd = this.getIsKeyIndex(this.DEV_ID);
        let confInd = this.getIsKeyIndex(this.CONFIGURATION_ID);
        let disabledInd = this.getIsKeyIndex(this.DISABLED_ID);
        let orderinfInd = this.getIsKeyIndex(this.ORDERING_ID);
        let outbranchInd = this.getIsKeyIndex(this.NOT_IN_BRANCH_ID);
        if (outbranchInd > -1) {
            let showNotInBranch =  this.mFilters[outbranchInd].selected;
            if (showNotInBranch!=this.showNotInBranch) {
                this.showNotInBranch = !this.showNotInBranch;
                this.onShowNotInBranchChanged.emit(this.showNotInBranch);
            }
        }

            if(this.showExperimentsHeader) {
                let showDisabled = (disabledInd > -1) ? this.mFilters[disabledInd].selected : false;
                if (showDisabled != this.showDisabled) {
                    this.showDisabled = !this.showDisabled;
                    this.onShowDisabledChanged.emit(this.showDisabled);
                }

            } else {
                let showConfig = (confInd > -1) ? this.mFilters[confInd].selected : false;
                if (showConfig!=this.showConfig) {
                    this.showConfig = !this.showConfig;
                    this.onShowConfigChanged.emit(this.showConfig);
                }
                console.log("before show ordering");
                let showOrdering = (orderinfInd > -1) ? this.mFilters[orderinfInd].selected : false;
                if (showOrdering!=this.showOrdering) {
                    console.log("in show ordering");
                    this.showOrdering = !this.showOrdering;
                    console.log("in show ordering:"+this.showOrdering);
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
    getTableWidth() {
        return this.lastTableWidth;
    }
    @HostListener('window:resize')
    _onWindowResize():void {
        if(!this.tableWidth || !this.useCustomWidth) {
            this.lastTableWidth = "";
            // return this.lastTableWidth;
        }
        this.lastTableWidth = this.tableWidth+"px"
    }

    @HostListener('window:scroll')
    _onWindowScroll():void {
        if(!this.tableWidth || !this.useCustomWidth) {
            this.lastTableWidth = "";
            // return this.lastTableWidth;
        }
        this.lastTableWidth = this.tableWidth+"px"
    }

    getSearchWidth() {
        if(!this.tableWidth) {
            return "";
        }
        var width = this.tableWidth;
        var myWidth = Math.round(width*0.7);
        return myWidth+"px";
    }


    getElementTop(element) {
        var subjectRect  =element.getBoundingClientRect()
        return subjectRect.top;// + document.documentElement.scrollTop
    }

    isOverScrolled() {
        // console.log("nativeElement:"+this.input.nativeElement.getBoundingClientRect().width);
        this.tableWidth = this.input.nativeElement.getBoundingClientRect().width + 15;
        var top = this.getElementTop(this.input.nativeElement);
        // console.log('shazlong:'+top);
        if (top < 0) {
            this.useCustomWidth=true;
            return true;
        } else {
            this.useCustomWidth=false;
            return false;
        }
    }

    onProductsClick(){
        var longestProdName;
        var longestProdSize = 0;
        for (var i = 0; i < this.products.length; i++){
            if (this.products[i].name.length > longestProdSize){
                longestProdSize = this.products[i].name.length;
                longestProdName = this.products[i].name;
            }
        }
        this.productDropDownWidth = (9 * longestProdSize).toString() +'px';
        console.log('productDropDownWidth:', this.productDropDownWidth);
    }
    selectProduct(item:Product){
        this.onProductSelected.emit(item);
    }
    selectSeason(item:Season){
        this.onSeasonSelected.emit(item);
    }

    getSeasonName(item:Season) {
        if (item) {
            let max = item.maxVersion? item.maxVersion : "";
            let min = item.minVersion? item.minVersion : "";
            if (max=="") {
                return min + " and up";
            } else {
                return min + " to " + max + " (not including " + max + ")";
            }
        } else {
            return "";
        }
    }

    selectFilter(filter:string) {
        if (this.selectedFilter==filter) {
            return;
        }
        if(filter=='Stage') {
            this.showConfig = true;
        } else if (filter=='Configuration') {
            this.showDevFeatures = true;
        }
        this.selectedFilter = filter;
        this.onShowConfigChanged.emit(this.showConfig);
        this.onShowDevFeaturesChanged.emit(this.showDevFeatures);
    }

    setLayout(layout:string) {
        this.onLayoutSelected.emit(layout);
    }

    filterStrings() {
        this.onQueryChanged.emit(this.filterQuery);
    }

    filterFeatures() {
        var now = Date.now();
        this.lastSearchTime = now;
        setTimeout(() => {
            if(now == this.lastSearchTime ) {
                this.onSearchQueryChanged.emit(this.searchQuery);
            }
        }, 500,now);
    }

    onLocalesChange() {
        console.log(this.optionsModel);
        var sortedLocales = [];
        for (var locale of this.localeOptions) {
            if (this.optionsModel.indexOf(locale.id) > -1) {
                sortedLocales.push(locale.id);
            }
        }
        this.onLocalesChanged.emit(sortedLocales);
        // this.onLocalesChanged.emit(this.optionsModel);
    }

    getNumResults(numResults:number):string {
        if (this.searchQuery && this.searchQuery.length > 0) {
            if (numResults==0) return "no results";
            var indexStr = "";
            if (this.selectedResultNum >= 0) {
                indexStr = ""+(this.selectedResultNum+1) + " out of "
            }
            if (numResults==1) return indexStr + "1 result";
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
}
