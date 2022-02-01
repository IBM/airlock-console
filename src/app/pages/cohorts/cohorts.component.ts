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
import {CohortsData} from "../../model/cohortsData";
import {Cohort} from "../../model/cohort";
import {Subscription, timer} from "rxjs";
import {CohortExport} from "../../model/cohortExport";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {AddCohortModal} from "../../@theme/modals/addCohortModal";
import {ReorderCohortsModal} from "../../@theme/modals/reorderCohortsModal";
import {ActivatedRoute} from "@angular/router";
import {EditCohortModal} from "../../@theme/modals/editCohortModal";

@Component({
    selector: 'cohortsPage',
    styleUrls: ['./cohorts.scss', './sideNavStyle.scss'],
    templateUrl: './cohorts.html',
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


export class CohortsPage {
    @ViewChild("editInline") editInline: EditCohortModal;
    inlineMode: boolean = false;
    public checkModel: any = {left: false, middle: true, right: false};
    possibleUserGroupsList: Array<string> = [];
    valid: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    cohortsData: CohortsData;
    selectedProduct: Product;
    loading: boolean = false;
    openExperiments: Array<string> = [];
    filteredItems: Array<string> = new Array<string>();
    showDialog = false;
    searchQueryString: string = null;
    analyticDataForDisplay: AnalyticsDisplay;
    selectedId = null;
    selectedIndex = -1;
    subscription: Subscription;
    refreshRateSeconds = 60;
    scrolledToSelected = false;
    totalAnaliticsQuota: AnalyticsQuota;
    analyticData: Analytic;
    showAnalytics: boolean = false;
    showCohorts: boolean = true;

    public status: { isopen: boolean } = {isopen: false};
    private pathCohortId: null;

    constructor(private _airlockService: AirlockService,
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
        return (!this._airlockService.isViewer());
    }

    isViewer(): boolean {
        return !this._airlockService.isUserHasAnalyticsEditorRole();
    }

    isAllowedToSeePage() {
        return this._airlockService.isUserHasAnalyticsViewerRole() || this._airlockService.isUserHasAnalyticsEditorRole();
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
                        console.log("yay");
                        return currProd;
                    } else {
                        console.log("nah");
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
        this._appState.subscribe('features.currentProduct', 'cohorts', (product) => {
            this.onProductSelection(product);
        });
        let timerRunner = timer(this.refreshRateSeconds * 1000, this.refreshRateSeconds * 1000); //refresh every 1 minutes
        this.subscription = timerRunner.subscribe(t => this.refreshCohorts());
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let cohortId = params.cohortId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId && cohortId) {
                console.log("going to edit mode")
                this.pathCohortId = cohortId;
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
            } else {
                this.pathCohortId = null;
            }
        });
    }

    refreshCohorts() {
        if (this.selectedProduct) {
            this._airlockService.getCohorts(this.selectedProduct.uniqueId).then((container) => {
                this.cohortsData = container;
                let refreshRate = 60;
                if (this.hasActiveExports()) {
                    refreshRate = 10;
                }
                if (refreshRate != this.refreshRateSeconds) {
                    this.subscription.unsubscribe();
                    this.refreshRateSeconds = refreshRate;
                    let timerRunner = timer(this.refreshRateSeconds * 1000, this.refreshRateSeconds * 1000); //refresh every 10/60 seconds
                    this.subscription = timerRunner.subscribe(t => this.refreshCohorts());
                }
            }).catch(
                error => {
                    console.log("error refreshing cohorts:" + error);
                }
            );
        }
    }

    hasActiveExports(): boolean {
        let cohorts = this.cohortsData.cohorts;
        if (cohorts) {
            let len = cohorts.length;
            for (let i = 0; i < len; ++i) {
                let cohort = cohorts[i];
                if (cohort.exports) {
                    let exps = Object.values(cohort.exports);
                    if (exps.length > 0) {
                        let exp: CohortExport = exps[0];
                        if (exp.exportStatusDetails && (exp.exportStatusDetails.status == "RUNNING" || exp.exportStatusDetails.status == "PENDING")) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'cohorts');
    }

    onProductSelection(product: Product) {
        this.selectedProduct = product;
        this.showAnalytics = this._appState.canUseAnalytics();
        this.getCohorts();
    }

    getCohorts() {
        if (!this._appState.canUseCohorts(true)) {
            this.loading = false;
            this._airlockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedProduct) {
            this.loading = true;
            this._airlockService.getCohorts(this.selectedProduct.uniqueId).then((container) => {
                this.cohortsData = container;
                this.loading = false;
                if (this.pathCohortId !== null){
                    let pathCohort = this.getItemWithId(this.pathCohortId);
                    if (pathCohort) {
                        this.showEditCohort(pathCohort);
                    }
                    this.pathCohortId = null;
                }
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    getItemWithId(fId: string): Cohort {
        for (let cohort of this.cohortsData.cohorts) {
            if (cohort.uniqueId === fId){
                return cohort
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

    public isShowAddCohort() {
        return this._airlockService.isUserHasAnalyticsEditorRole();
    }

    public addCohort() {
        this.modalService.open(AddCohortModal, {
            context: {
                cohortsPage: this
            }
        }).onClose.subscribe(item=> {
            if (item) {
                this.showEditInline(item);
                this.refreshTable();
            }
        })
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
        this.getCohorts();
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
        console.log('in changeFeatureState():' + this._airlockService);
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

    public cohortAdded(experiment: Cohort) {
        this.getCohorts();
    }

    public updateCohort(experiment: Cohort) {
        this.getCohorts();
    }

    public variantAdded() {
        this.getCohorts();
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
        this.modalService.open(ReorderCohortsModal, {
            closeOnBackdropClick: false,
            context: {
                _cohortsData: CohortsData.clone(this.cohortsData)
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
        // this._reorderCohortsModal.open(this.cohortsData);
    }

    experimentsReordered(obj: any) {
        this.getCohorts();
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
        if (term && term.length > 0 && this.cohortsData && this.cohortsData.cohorts) {
            for (var cohort of this.cohortsData.cohorts) {
                this.isFilteredOut(cohort);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    shouldExperimentBeFilteredOut(feature: Cohort): boolean {
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

    isFilteredOut(experiment: Cohort): boolean {
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

    isPartOfSearch(term: string, experiment: Cohort): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = experiment.name;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
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

    private showEditCohort(pathCohort: Cohort) {
        let columns: []
        this._airlockService.getCohortsDbColumns(this.selectedProduct.uniqueId).then(columns => {
                this.modalService.open(EditCohortModal, {
                    closeOnBackdropClick: false,
                    context: {
                        inlineMode: false,
                        visible: true,
                        cohort: Cohort.clone(pathCohort),
                    //     cohortCell: this,
                        columnNames: columns
                    },
                }).onClose.subscribe(reload => {
                    // if (reload) {
                    //     this.onUpdate.emit(null);
                    // }
                });
            }
        ).catch(error => {
            this.modalService.open(EditCohortModal, {
                closeOnBackdropClick: false,
                context: {
                    inlineMode: false,
                    visible: true,
                    cohort: Cohort.clone(pathCohort),
                    //     cohortCell: this,
                    columnNames: columns
                },
            }).onClose.subscribe(reload => {
                // if (reload) {
                //     this.onUpdate.emit(null);
                // }
            });
        });
    }

    showEditInline(cohort: Cohort) {
        console.log("showEditExperimentInline");
        this.inlineMode = true;
        this.editInline.open(cohort, null, null);
    }
    closeEditInline(value) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.loading = false;
    }
}

