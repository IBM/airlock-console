import {Component, EventEmitter, HostListener, Output, ViewChild} from '@angular/core';
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
import {ExperimentsContainer} from "../../model/experimentsContainer";
import {Variant} from "../../model/variant";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {AddExperimentModal} from "../../@theme/modals/addExperimentModal";
import {ReorderExperimentsModal} from "../../@theme/modals/reorderExperimentsModal";
import {ActivatedRoute} from "@angular/router";
import {EditExperimentModal} from "../../@theme/modals/editExperimentModal";
import {EditVariantModal} from "../../@theme/modals/editVariantModal";
import {ExperimentVariantPair} from "../../model/experimentVariantPair";

@Component({
    selector: 'experimentsPage',
    styleUrls: ['./experiments.scss', './sideNavStyle.scss'],
    templateUrl: './experiments.html',
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


export class ExperimentsPage {
    @ViewChild("editInline") editExperimentInline: EditExperimentModal;
    @ViewChild("editVariantInline") editVarianttInline: EditVariantModal;
    inlineMode: boolean = false;
    inlineVariantMode: boolean = false;

    public checkModel: any = {left: false, middle: true, right: false};
    //selectedSeason: Season;
    possibleUserGroupsList: Array<string> = [];
    valid: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    experimentsContainer: ExperimentsContainer;
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
    showAnalytics: boolean = true;

    public status: { isopen: boolean } = {isopen: false};
    private pathExperimentId: any;
    private pathVariantId: any;

    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService,
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
        return this._airlockService.isViewer();
    }


    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest: boolean) {

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
        //let currSeason = this._appState.getData('features.currentSeason');
        let isLatestStr = this._appState.getData('features.isLatestSeason');
        let currProduct = this._appState.getData('features.currentProduct');
        //this.selectedSeason = currSeason;
        // this.initData(currSeason, isLatest);
        this.onProductSelection(currProduct);
        this._appState.subscribe('features.currentProduct', 'exp', (product) => {
            this.onProductSelection(product);
        });
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let branchId = params.branchId;
            let experimentId = params.experimentId;
            let variantId = params.variantId;

            if (prodId && seasonId && branchId) {
                console.log("going to edit mode")
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
                this.pathExperimentId = experimentId;
                this.pathVariantId = variantId;
            } else {
                this.pathExperimentId = null;
                this.pathVariantId = null;
            }
        });
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'exp');
    }

    onProductSelection(product: Product) {
        if (product.uniqueId != this.selectedProduct?.uniqueId || this.experimentsContainer == null) {
            this.selectedProduct = product;
            this.showAnalytics = this._appState.canUseAnalytics();
            this._airlockService.getUserGroups(this.selectedProduct).then(response => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
            this.getExperiments();
        }
    }

    getExperiments(item: any = null) {
        if (this.selectedProduct) {
            this.loading = true;
            this._airlockService.getExperiments(this.selectedProduct.uniqueId).then((container) => {
                // this.experiments = products;
                this.experimentsContainer = container;
                if (item != null) {
                    if (item instanceof Experiment){
                        this.showEditInline(this.getItemWithId((item as Experiment).uniqueId));
                    }
                } else if (this.pathExperimentId) {
                    let pathExperiment = this.getItemWithId(this.pathExperimentId);
                    if (pathExperiment) {
                        this.showEditExperiment(pathExperiment);
                    }
                    this.pathExperimentId = null;
                } else if (this.pathVariantId){
                    let pathVariant = this.getvariantWithId(this.pathVariantId);
                    if (pathVariant) {
                        this.showEditVariant(pathVariant);
                    }
                    this.pathExperimentId = null;
                }
                this.loading = false;
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    getItemWithId(fId: string): Experiment {
        for (let experiment of this.experimentsContainer.experiments) {
            if (experiment.uniqueId === fId){
                return experiment
            }
        }
        return null;
    }

    experimentChangedStatus(expID: string) {
        var index = this.openExperiments.indexOf(expID, 0);
        if (index > -1) {
            this.openExperiments.splice(index, 1);
        } else {
            this.openExperiments.push(expID);
        }
    }

    openExperimentCell(expID: string) {
        var index = this.openExperiments.indexOf(expID, 0);
        if (index == -1) {
            this.openExperiments.push(expID);
        }
    }

    isCellOpen(expID: string): boolean {
        var index = this.openExperiments.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddExperiment() {
        return !this._airlockService.isViewer();
    }

    public addExperiment() {
        this.modalService.open(AddExperimentModal, {
            context: {
                experimentsPage: this
            }
        }).onClose.subscribe(experiment => {
            this.experimentAdded(experiment);
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


    public refreshTable(event) {
        this.getExperiments(event);
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

    public experimentAdded(experiment: Experiment) {
        this.getExperiments(experiment);
    }

    public updateExperiment(experiment: Experiment) {
        this.getExperiments();
    }

    public variantAdded() {
        this.getExperiments();
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
        this.modalService.open(ReorderExperimentsModal, {
            closeOnBackdropClick: false,
            context: {
                _experimentsContainer: ExperimentsContainer.clone(this.experimentsContainer)
            }
        })
        // this._reorderExperimentsModal.open(this.experimentsContainer);
    }

    experimentsReordered(obj: any) {
        this.getExperiments();
    }

    itemIsSelected(itemObj: any) {
        // if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
        //     let y = itemObj.offset;
        //     this.checkIfInView(y);
        //     this.scrolledToSelected = true;
        // }
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
        if (term && term.length > 0 && this.experimentsContainer && this.experimentsContainer.experiments) {
            for (var exp of this.experimentsContainer.experiments) {
                this.isFilteredOut(exp);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    shouldExperimentBeFilteredOut(feature: any): boolean {
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
        //now check if has children which are not being filtered out
        if (feature.variants) {
            for (var subFeat of feature.variants) {
                let isFiltered = this.shouldExperimentBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }

        return isFilteredOut;
    }

    isFilteredOut(experiment: Experiment): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldExperimentBeFilteredOut(experiment)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, experiment);
        if (hasSearchHit) {
            this.filteredItems.push(experiment.uniqueId);
        }
        if (experiment.variants) {
            for (var sub of experiment.variants) {
                this.isVariantFilteredOut(sub);
            }
        }

        return !hasSearchHit;
    }

    isVariantFilteredOut(variant: Variant): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldExperimentBeFilteredOut(variant)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isVariantPartOfSearch(this.searchQueryString, variant);
        if (hasSearchHit) {
            this.filteredItems.push(variant.uniqueId);
        }
        return !hasSearchHit;
    }

    isPartOfSearch(term: string, experiment: Experiment): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = experiment.displayName;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    isVariantPartOfSearch(term: string, variant: Variant): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = variant.displayName || "";
        let name = variant.name || "";
        let branchName = variant.branchName || "";
        if ((!displayName && !name) || !branchName) {
            return false;
        }
        return displayName.toLowerCase().includes(lowerTerm) || branchName.toLowerCase().includes(lowerTerm) || name.toLowerCase().includes(lowerTerm);
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


    private showEditVariant(pathVariant: any) {
        console.log("RETRIEVING utilities and inputSchema");
        this._airlockService.getAvailableBranches(pathVariant.experiment.uniqueId).then(result => {
            let availableBranches = result;
            this._airlockService.getExperimentUtilitiesInfo(pathVariant.experiment.uniqueId, pathVariant.experiment.stage, pathVariant.experiment.minVersion).then(result1 => {
                let ruleUtilitieInfo = result1 as string;
                this._airlockService.getExperimentInputSample(pathVariant.experiment.uniqueId, pathVariant.experiment.stage, pathVariant.experiment.minVersion).then(result2 => {
                    let ruleInputSchemaSample = result2 as string;
                    this.modalService.open(EditVariantModal, {
                        closeOnBackdropClick: false,
                        context: {
                            inlineMode: false,
                            visible: true,
                            variant: Variant.clone(pathVariant.variant),
                            experiment: Experiment.clone(pathVariant.experiment),
                            title: this.getString("edit_variant_title"),
                            availableBranches: availableBranches,
                            ruleInputSchemaSample: ruleInputSchemaSample,
                            ruleUtilitiesInfo: ruleUtilitieInfo,
                            variantCell: null,
                        }
                    })
                    // this.editVariantModal.open(this.variant, this.availableBranches.availableInAllSeasons, this.ruleInputSchemaSample, this.ruleUtilitieInfo, this);
                }).catch(error => {
                    console.log('Error in getting Experiment Input Schema Sample');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                });
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Utilitystring");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
            });
        }).catch(error => {
            console.log('Error in getting Feature Attributes');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Feature Attributes");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
        });
    }

    private showEditExperiment(pathExperiment: Experiment) {
        this._airlockService.getExperimentQuota(pathExperiment.uniqueId).then(result => {
            let analyticsExperimentQuota = result;
            this._airlockService.getAnalyticsForDisplayExperiment(pathExperiment.uniqueId).then(result1 => {
                let analyticExperiment = result1;
                this._airlockService.getExperimentUtilitiesInfo(pathExperiment.uniqueId, pathExperiment.stage, pathExperiment.minVersion).then(result2 => {
                    let ruleUtilitieInfo = result2 as string;
                    this._airlockService.getExperimentInputSample(pathExperiment.uniqueId, pathExperiment.stage, pathExperiment.minVersion).then(result3 => {
                        let ruleInputSchemaSample = result3 as string;
                        this.modalService.open(EditExperimentModal, {
                            closeOnBackdropClick: false,
                            context: {
                                inlineMode: false,
                                visible: true,
                                experiment: Experiment.clone(pathExperiment),
                                totalCountQuota: analyticsExperimentQuota.analyticsQuota,
                                ruleInputSchemaSample: ruleInputSchemaSample,
                                ruleUtilitiesInfo: ruleUtilitieInfo,
                                analyticsExperiment: analyticExperiment,
                                // experimentCell: this,
                            },
                        });
                    }).catch(error => {
                        let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Input Sample Schema");
                        this._airlockService.notifyDataChanged("error-notification", errorMessage);
                        // this.hideIndicator.emit(error);
                    });
                }).catch(error => {
                    console.log('Error in getting UtilityInfo');
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Experiment Utilitystring");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                });
            }).catch(error => {
                console.log('Error in getting getAnalyticsGlobalDataCollectionExperiment');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Global Data collection for experiment");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
            });
        }).catch(error => {
            console.log('Error in getting analyticsExperimentQuota');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get analyticsExperimentQuota for experiment");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
        });
    }

    private getvariantWithId(pathVariantId: any) {
        for (let experiment of this.experimentsContainer.experiments) {
            for (let variant of experiment.variants) {
                if (variant.uniqueId === pathVariantId) {
                    return {
                        variant: variant,
                        experiment: experiment
                    }
                }
            }
        }
        return null;
    }

    showEditVariantInline(item: any) {
        let pair = item as ExperimentVariantPair;
        let variant = item.variant;
        let experiment = item.experiment;
        let callback = (result: boolean): void => {
            if (result) {
                this.inlineVariantMode = true;
                this.inlineMode = true;
                this.editVarianttInline.open(variant, experiment, null, null, null);
            }
        }
        if (this.inlineMode && !this.inlineVariantMode) {
            //moving from experiment
            this.editExperimentInline.canMoveOn(callback);
        } else {
            callback(true);
        }
    }
    showEditInline(item: any) {
        // this.openExperimentCell
        console.log("showEditExperimentInline");

        if (item.variants !== undefined) {
            let callback = (result: boolean): void => {
                if (result) {
                    this.inlineVariantMode = false;
                    this.inlineMode = true;
                    this.editExperimentInline.open(item, null, null, null, null);
                }
            }
            if (this.inlineVariantMode) {
                //moving from edit variant
                this.editVarianttInline.canMoveOn(callback);
            } else {
                callback(true);
            }

        } else {
            let callback = (result: boolean): void => {
                if (result) {
                    this.inlineVariantMode = true;
                    this.inlineMode = true;
                    this.editVarianttInline.open(item, null, null, null, null);
                }
            }
            if (this.inlineMode && !this.inlineVariantMode) {
                //moving from experiment
                this.editExperimentInline.canMoveOn(callback);
            } else {
                callback(true);
            }
        }
    }
    closeEditInline(value) {
        this.inlineMode = false;
        this.inlineVariantMode = false;
        this.loading = false;
    }
}

