import {Component, ViewChild} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {Analytic} from "../../model/analytic";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {AnalyticsDisplay} from "../../model/analyticsDisplay";
import {AnalyticsQuota} from "../../model/analyticsQuota";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {Cohort} from "../../model/cohort";
import {timer} from "rxjs";
import {DataimportsData} from "../../model/dataimportsData";
import {Dataimport} from "../../model/dataimport";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {AddDataimportModal} from "../../@theme/modals/addDataimportModal";
import {ActivatedRoute} from "@angular/router";
import {EditDataimportModal} from "../../@theme/modals/editDataimportModal";

@Component({
    selector: 'dataimportPage',
    styleUrls: ['./dataimport.scss', './sideNavStyle.scss'],
    templateUrl: './dataimport.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})


export class DataimportPage {
    @ViewChild("editInline") editInline: EditDataimportModal;
    inlineMode: boolean = false;
    public checkModel: any = {left: false, middle: true, right: false};
    //selectedSeason: Season;
    possibleUserGroupsList: Array<string> = [];
    //selectedEditedFeature:Feature;
    valid: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    //rootId:string = "";
    // experiments: Array<Experiment> = [];
    dataimportsData: DataimportsData;
    originalDataimportsData: DataimportsData;
    selectedProduct: Product;
    loading: boolean = false;
    openExperiments: Array<string> = [];
    filteredItems: Array<string> = new Array<string>();
    showDialog = false;
    searchQueryString: string = null;
    analyticDataForDisplay: AnalyticsDisplay;
    selectedId = null;
    selectedIndex = -1;
    scrolledToSelected = false;
    totalAnaliticsQuota: AnalyticsQuota;
    analyticData: Analytic;
    private DUMMY_APP_MAX_VERSION: string = '100';
    showAnalytics: boolean = false;
    showCohorts: boolean = false;
    showDataimport: boolean = true;
    orderByList = ["Name", "Creator", "Last Modified", "Creation Date", "Status"];
    modifiedDateList = ["All", "Last 24 Hours", "Last Week", "Last Month"];
    currentOrderBy = "Creation Date";
    currentIsReverse = false;
    currModifiedBy = "Last Week";


    public status: { isopen: boolean } = {isopen: false};
    private pathDataimportId: any;

    constructor(private _airLockService: AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalService: NbDialogService,
                private route: ActivatedRoute) {
        this.loading = true;
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions() {
        if (this.selectedProduct == null) {
            return false;
        }
        return (!this._airLockService.isViewer());
    }

    isViewer(): boolean {
        return !this._airLockService.isUserHasAnalyticsEditorRole();
    }

    isAllowedToSeePage() {
        return this._airLockService.isUserHasAnalyticsViewerRole() || this._airLockService.isUserHasAnalyticsEditorRole();
    }

    getFilteredJobs(): DataimportsData {
        let toRet = DataimportsData.clone(this.originalDataimportsData);
        this.filterDateBy(toRet);
        this.filterOrderBy(toRet);
        return toRet;
    }

    dateFilterSelected(selected: string) {
        this.currModifiedBy = selected;
        this.dataimportsData = this.getFilteredJobs();
    }

    orderBySelected(selected: string) {
        if (this.currentOrderBy == selected) {
            this.currentIsReverse = !this.currentIsReverse;
        }
        this.currentOrderBy = selected;
        this.dataimportsData = this.getFilteredJobs();
    }

    filterOrderBy(dataimportsData: DataimportsData) {
        let selected = this.currentOrderBy;
        let isReverse = this.currentIsReverse;
        if (selected == "Name") {
            if (isReverse) {
                dataimportsData.jobs.sort((a, b) => b.name.localeCompare(a.name));
            } else {
                dataimportsData.jobs.sort((a, b) => a.name.localeCompare(b.name));
            }

        } else if (selected == "Creator") {
            if (isReverse) {
                dataimportsData.jobs.sort((a, b) => b.creator.localeCompare(a.creator));
            } else {
                dataimportsData.jobs.sort((a, b) => a.creator.localeCompare(b.creator));
            }
        } else if (selected == "Last Modified") {
            if (isReverse) {
                dataimportsData.jobs.sort((a, b) => b.lastModified - a.lastModified);
            } else {
                dataimportsData.jobs.sort((a, b) => a.lastModified - b.lastModified);
            }
        } else if (selected == "Creation Date") {
            if (isReverse) {
                dataimportsData.jobs.sort((a, b) => b.creationDate - a.creationDate);
            } else {
                dataimportsData.jobs.sort((a, b) => a.creationDate - b.creationDate);
            }
        } else if (selected == "Status") {
            if (isReverse) {
                dataimportsData.jobs.sort((a: Dataimport, b: Dataimport) => this.compareStrings(b.status, a.status));
            } else {
                dataimportsData.jobs.sort((a: Dataimport, b: Dataimport) => this.compareStrings(a.status, b.status));
            }
        }
    }

    filterJobsByDate(dataimportsData: DataimportsData, filterFunc) {
        let newJobs = [];
        for (let i = 0; i < dataimportsData.jobs.length; ++i) {
            let job = dataimportsData.jobs[i];
            if (filterFunc(job)) {
                newJobs.push(job);
            }
        }
        dataimportsData.jobs = newJobs;
    }

    isWithin24Hours(element: Dataimport) {
        let now = Date.now();
        let lastModified = element.creationDate;
        if (element.lastModified) {
            lastModified = element.lastModified;
        }
        let elapsed = (now - lastModified) / (1000.0 * 60 * 60);
        return (elapsed < 24);
    }

    isWithinWeek(element: Dataimport) {
        let now = Date.now();
        let lastModified = element.creationDate;
        if (element.lastModified) {
            lastModified = element.lastModified;
        }
        let elapsed = (now - lastModified) / (1000.0 * 60 * 60);
        return (elapsed < 24 * 7);
    }

    isWithinMonth(element: Dataimport) {
        let now = Date.now();
        let lastModified = element.creationDate;
        if (element.lastModified) {
            lastModified = element.lastModified;
        }
        let elapsed = (now - lastModified) / (1000.0 * 60 * 60);
        return (elapsed < 24 * 30);
    }

    filterDateBy(dataimportsData: DataimportsData) {
        let selected = this.currModifiedBy;
        //"All", "Last 24 Hours", "Last Week", "Last Month"];
        if (selected == "All" || this.pathDataimportId != null) {
            //do nothing

        } else if (selected == "Last 24 Hours") {
            this.filterJobsByDate(dataimportsData, this.isWithin24Hours);
            // dataimportsData.jobs.filter(job => job.creator == "esteban ziaaaa");
        } else if (selected == "Last Week") {
            this.filterJobsByDate(dataimportsData, this.isWithinWeek);
        } else if (selected == "Last Month") {
            this.filterJobsByDate(dataimportsData, this.isWithinMonth);
        }

    }

    compareStrings(a: string, b: string): number {
        if (!a) {
            a = "";
        }
        if (!b) {
            b = "";
        }
        return a.localeCompare(b);
    }

    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest: boolean) {

    }

    isShowReorder() {
        return (!this.isViewer());
    }

    hasSomeData(): boolean {
        if (this.searchQueryString && this.searchQueryString.length > 0) {
            return (this.filteredItems.length) > 0;
        }
        return true;
    }

    getWhitelistCount() {
        let count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.productionItemsReportedToAnalytics;
        }
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.developmentItemsReportedToAnalytics;
        }
        return count;
    }


    static getCurrentProductFromSeason(products: Product[], currentSeason: Season): Product {
        if (currentSeason) {
            console.log("trying to find products! - products:");
            console.log(products);
            console.log("season's productID:" + currentSeason.productId);
            if (products.length > 0) {
                console.log("products.length > 0!");
                for (let p of products) {
                    let currProd: Product = p;
                    if (currProd.uniqueId == currentSeason.productId) {
                        return currProd;
                    }
                }
            }
        }
        if (products.length > 0) {
            console.log("return first product");
            return products[0];
        } else {
            console.log("return null from getCurrentProductFromSeason");
            return null;
        }
    }

    static getCurrentSeasonFromSeason(seasons: Season[], currentSeason: Season): Season {
        if (currentSeason) {
            for (let s of seasons) {
                let currSeas: Season = s;
                if (currSeas.uniqueId == currentSeason.uniqueId) {
                    return currSeas;
                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length - 1];
        } else {
            return null;
        }
    }

    ngOnInit() {
        this.showAnalytics = this._appState.canUseAnalytics();
        let currProduct = this._appState.getData('features.currentProduct');
        this.onProductSelection(currProduct);
        this._appState.subscribe('features.currentProduct', 'dataimport', (product) => {
            this.onProductSelection(product);
        });
        let timerRunner = timer(1 * 60 * 1000, 1 * 60 * 1000); //refresh every 1 minutes
        timerRunner.subscribe(t => this.refreshJobs());
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let dataimportId = params.dataimportId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId && dataimportId) {
                this.currModifiedBy = params.currModifiedBy;
                console.log("going to edit mode")
                this.pathDataimportId = dataimportId;
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
            } else {
                this.pathDataimportId = null;
            }
        });
    }

    refreshJobs() {
        if (this.selectedProduct) {
            this._airLockService.getDataImports(this.selectedProduct.uniqueId).then((container) => {
                this.originalDataimportsData = container;
                this.dataimportsData = this.getFilteredJobs();
            }).catch(
                error => {
                    console.log("error refrehing data import jobs:" + error);
                }
            );
        }
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'dataimport');
    }

    onProductSelection(product: Product) {
        this.selectedProduct = product;
        this.showAnalytics = this._appState.canUseAnalytics();
        this.getJobs();
    }

    getJobs() {
        if (!this._appState.canUseDataImport(true)) {
            this.loading = false;
            this._airLockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedProduct) {
            this.loading = true;
            this._airLockService.getDataImports(this.selectedProduct.uniqueId).then((container) => {
                this.originalDataimportsData = container;
                this.dataimportsData = this.getFilteredJobs();
                this.loading = false;
                if (this.pathDataimportId !== null){
                    let pathDataimport = this.getItemWithId(this.pathDataimportId);
                    if (pathDataimport) {
                        this.showEditDataimport(pathDataimport);
                    }
                    this.pathDataimportId = null;
                }
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    getItemWithId(fId: string): Dataimport {
        for (let dataimport of this.dataimportsData.jobs) {
            if (dataimport.uniqueId === fId){
                return dataimport
            }
        }
        return null;
    }

    experimentChangedStatus(expID: string) {
        console.log("variant changed status:" + expID);
        var index = this.openExperiments.indexOf(expID, 0);
        if (index > -1) {
            this.openExperiments.splice(index, 1);
        } else {
            this.openExperiments.push(expID);
        }
    }

    isCellOpen(expID: string): boolean {
        var index = this.openExperiments.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddJob() {
        return this._airLockService.isUserHasAnalyticsEditorRole();
    }

    public addDataimportJob() {
        this.modalService.open(AddDataimportModal, {
            context: {
                productId: this._appState.getData('features.currentProduct').uniqueId
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
    }

    setShowConfig(show: boolean) {
        this.showConfig = show;
        if (show) {
            this.filterlistDict["type"] = [];
        } else {
            this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        }
        this.createFilteredList();
    }

    setShowDevFeatures(show: boolean) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        } else {
            this.filterlistDict["stage"] = ["development"];
        }
        this.createFilteredList();
    }

    setShowDisabled(show: boolean) {
        this.showDisabled = show;
        if (show) {
            this.filterlistDict["enabled"] = [];
        } else {
            this.filterlistDict["enabled"] = [false];
        }
        this.createFilteredList();
    }


    public refreshTable() {
        this.getJobs();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }

    public deleteFeature(feature: Feature) {

    }

    public changeStateHandler(feature: Experiment) {
        console.log('in changeFeatureState():' + this._airLockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage = 'PRODUCTION';
        }
    }

    /*
     public editFeature(variant:Feature, featurePath: Array<Feature>){
     this.editFeatureModal.open(variant,featurePath);
     }
     */

    experimentIsInFilter(expID: string) {
        // this.filteredExperiments.push(expID);
    }

    variantIsNotInFilter(varID: string) {
        // this.filteredExperiments.push(varID);
        // this.filteredVariants.push(varID);
    }

    public jobAdded(experiment: Cohort) {
        this.getJobs();
    }

    public updateCohort(experiment: Cohort) {
        this.getJobs();
    }

    public variantAdded() {
        this.getJobs();
    }

    showSettings() {
    }

    public onSearchQueryChanged(term: string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    reorder() {
        // this._reorderCohortsModal.open(this.cohortsData);
    }


    itemIsSelected(itemObj: any) {
        itemObj.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    checkIfInView(top: number) {
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if (offset > window.innerHeight || offset < 0) {
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top - 200;
                return false;
            }
        }
        return true;
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to load Experiments. Please try again.";
        console.log("handleError in Experiments:" + errorMessage);
        this.create(errorMessage);
    }

    createFilteredList() {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0 && this.dataimportsData && this.dataimportsData.jobs) {
            for (var job of this.dataimportsData.jobs) {
                this.isFilteredOut(job);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    shouldExperimentBeFilteredOut(feature: Dataimport): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    console.log(feature[key]);
                    if (feature[key].toString().toLowerCase() == value.toString().toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }

        return isFilteredOut;
    }

    isFilteredOut(experiment: Dataimport): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldExperimentBeFilteredOut(experiment)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, experiment);
        if (hasSearchHit) {
            this.filteredItems.push(experiment.uniqueId);
        }

        return !hasSearchHit;
    }

    isPartOfSearch(term: string, experiment: Dataimport): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = experiment.uniqueId;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        let s3Path = experiment.s3File;
        s3Path = s3Path ? s3Path.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm)) || s3Path.includes(lowerTerm);
    }


    showNextSearchResult(forward: boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length - 1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length - 1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    create(message: string) {
        this.toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }

    private showEditDataimport(pathDataimport: Dataimport) {
        this.modalService.open(EditDataimportModal, {
            closeOnBackdropClick: false,
            context: {
                inlineMode: false,
                visible: true,
                job: pathDataimport
            },
        }).onClose.subscribe(reload => {
            if (reload) {
                // this.onUpdate.emit(null);
            }
        });
    }

    showEditInline(dataimport: Dataimport) {
        console.log("showEditExperimentInline");
        this.inlineMode = true;
        this.editInline.open(dataimport, this.currModifiedBy);
    }
    closeEditInline(value) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.loading = false;
    }
}

