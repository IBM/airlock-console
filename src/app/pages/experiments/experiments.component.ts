import {Component, Injectable, trigger, state, transition, animate, style, ElementRef} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {AddFeatureModal} from "../../theme/airlock.components/addFeatureModal/addFeatureModal.component";
import {EditFeatureModal} from "../../theme/airlock.components/editFeatureModal/editFeatureModal.component";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {ReorderMXGroupModal} from "../../theme/airlock.components/reorderMXGroupModal/reorderMXGroupModal.component";
import {AddFeatureToGroupModal} from "../../theme/airlock.components/addFeatureToGroupModal/addFeatureToGroupModal.component";
import {AddConfigurationModal} from "../../theme/airlock.components/addConfigurationModal/addConfigurationModal.component";
import {GlobalState} from "../../global.state";
import {ImportFeaturesModal} from "../../theme/airlock.components/importFeaturesModal/importFeaturesModal.component";
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {Analytic} from "../../model/analytic";
import {wlAttributesModal} from "../../theme/airlock.components/wlAttributesModal/wlAttributesModal.component";
import {EditInputSchemaModal} from "../../theme/airlock.components/editInputSchemaModal/editInputSchemaModal.component";
import {DocumentlinksModal} from "../../theme/airlock.components/documentlinksModal/documentlinksModal.component";
import {wlContextModal} from "../../theme/airlock.components/wlContextModal/wlContextModal.component";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {AnalyticsDisplay} from "../../model/analyticsDisplay";
import {AnalyticsQuota} from "../../model/analyticsQuota";
import {Experiment} from "../../model/experiment";
import {AddExperimentModal} from "../../theme/airlock.components/addExperimentModal/addExperimentModal.component";
import {StringsService} from "../../services/strings.service";
import {ExperimentsContainer} from "../../model/experimentsContainer";
import {ReorderExperimentsModal} from "../../theme/airlock.components/reorderExperimentsModal/reorderExperimentsModal.component";
import {ReorderVariantsModal} from "../../theme/airlock.components/reorderVariantsModal/reorderVariantsModal.component";
import {Variant} from "../../model/variant";
import {ShowDashboardModal} from "../../theme/airlock.components/showDashboardModal/showDashboardModal.component";
import {ToastrService} from "ngx-toastr";
@Component({
    selector: 'experimentsPage',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./experiments.scss'), require('./sideNavStyle.scss')],
    template: require('./experiments.html'),
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
    @ViewChild('addExperimentModal') _addExperimentModal : AddExperimentModal;
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;

    @ViewChild('reorderExperimentsModal') _reorderExperimentsModal : ReorderExperimentsModal;
    @ViewChild('reorderVariantsModal') _reorderVariantsModal : ReorderVariantsModal;

    public checkModel:any = {left: false, middle: true, right: false};
    //selectedSeason: Season;
    possibleUserGroupsList :Array<string> = [];
    //selectedEditedFeature:Feature;
    valid: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    //rootId:string = "";
    // experiments: Array<Experiment> = [];
    experimentsContainer: ExperimentsContainer;
    selectedProduct: Product;
    loading: boolean = false;
    openExperiments: Array<string> = [];
    filteredItems: Array<string> = new Array<string>();
    showDialog = false;
    searchQueryString: string = null;
    analyticDataForDisplay:AnalyticsDisplay;
    selectedId = null;
    selectedIndex = -1;
    scrolledToSelected = false;
    totalAnaliticsQuota:AnalyticsQuota;
    analyticData:Analytic;
    private DUMMY_APP_MAX_VERSION : string = '100';
    showAnalytics: boolean = true;


    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService,private toastrService: ToastrService) {
        this.loading = true;
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions(){
        if(this.selectedProduct == null){
            return false;
        }
        return (!this._airLockService.isViewer());
    }

    isViewer():boolean {
        return this._airLockService.isViewer();
    }


    toggleDataCollectionDetails(){
        this.showDialog = !this.showDialog;
    }
    initData(currentSeason: Season, isSeasonLatest:boolean) {

    }

    hasSomeData():boolean {
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


    static getCurrentProductFromSeason(products:Product[], currentSeason:Season): Product {
        if (currentSeason) {
            console.log("trying to find products! - products:");
            console.log(products);
            console.log("season's productID:"+currentSeason.productId);
            if (products.length > 0) {
                console.log("products.length > 0!");
                for (let p of products) {
                    let currProd:Product = p;
                    console.log(currProd.uniqueId);
                    console.log(currentSeason.productId);
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
    static getCurrentSeasonFromSeason(seasons: Season[], currentSeason: Season) : Season {
        if (currentSeason) {
            for (let s of seasons) {
                let currSeas:Season = s;
                if (currSeas.uniqueId == currentSeason.uniqueId) {
                    return currSeas;
                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length-1];
        } else {
            return null;
        }
    }
    ngOnInit() {
        this.showAnalytics = this._airLockService.canUseAnalytics();
        //let currSeason = this._appState.getData('features.currentSeason');
        let isLatestStr = this._appState.getData('features.isLatestSeason');
        let currProduct = this._appState.getData('features.currentProduct');
        console.log("got saved season!!!");
        //console.log(currSeason);
        //this.selectedSeason = currSeason;
        // this.initData(currSeason, isLatest);
        this.onProductSelection(currProduct);
        this._appState.subscribe('features.currentProduct','exp',(product) => {
            this.onProductSelection(product);
        });
    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct','exp');
    }
    onProductSelection(product:Product) {
        this.selectedProduct = product;
        this.showAnalytics = this._airLockService.canUseAnalytics();
        this._airLockService.getUserGroups(this.selectedProduct).then(response  => {
            console.log(response);
            this.possibleUserGroupsList = response.internalUserGroups;
        });
        this.getExperiments();
    }

    getExperiments() {
        if(!this._airLockService.getCapabilities().includes("EXPERIMENTS")){
            this.loading = false;
            this._airLockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedProduct) {
            this.loading = true;
            this._airLockService.getExperiments(this.selectedProduct.uniqueId).then((container) => {
                // this.experiments = products;
                this.experimentsContainer = container;
                this.loading = false;
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }

    }


    experimentChangedStatus(expID:string) {
        console.log("variant changed status:"+expID);
        var index = this.openExperiments.indexOf(expID, 0);
        if (index > -1) {
            this.openExperiments.splice(index, 1);
        } else {
            this.openExperiments.push(expID);
        }
    }

    isCellOpen(expID:string): boolean {
        var index = this.openExperiments.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddExperiment(){
        return !this._airLockService.isViewer();
    }
    public addExperiment(){
        this._addExperimentModal.open();
    }
    setShowConfig(show:boolean) {
        this.showConfig = show;
        if (show) {
            this.filterlistDict["type"] = [];
        } else {
            this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        }
        this.createFilteredList();
    }

    setShowDevFeatures(show:boolean) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        } else {
            this.filterlistDict["stage"] = ["development"];
        }
        this.createFilteredList();
    }

    setShowDisabled(show:boolean) {
        this.showDisabled = show;
        if (show) {
            this.filterlistDict["enabled"] = [];
        } else {
            this.filterlistDict["enabled"] = [false];
        }
        this.createFilteredList();
    }


    public refreshTable() {
        this.getExperiments();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }
    public deleteFeature(feature:Feature) {

    }

    public changeStateHandler(feature:Experiment) {
        console.log('in changeFeatureState():'+this._airLockService);
        this.loading = true;
        if (feature.stage=='PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage='PRODUCTION';
        }
    }
    /*
     public editFeature(variant:Feature, featurePath: Array<Feature>){
     this.editFeatureModal.open(variant,featurePath);
     }
     */

    experimentIsInFilter(expID:string) {
        // this.filteredExperiments.push(expID);
    }

    variantIsNotInFilter(varID:string) {
        // this.filteredExperiments.push(varID);
        // this.filteredVariants.push(varID);
    }

    public experimentAdded(experiment : Experiment) {
        this.getExperiments();
    }

    public updateExperiment(experiment : Experiment) {
        this.getExperiments();
    }

    public variantAdded() {
        this.getExperiments();
    }

    public onSearchQueryChanged(term:string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    reorder() {
        this._reorderExperimentsModal.open(this.experimentsContainer);
    }

    experimentsReordered(obj:any) {
        this.getExperiments();
    }

    itemIsSelected(itemObj:any) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            let y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if(offset > window.innerHeight  || offset < 0){
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top-200;
                return false;
            }
        }
        return true;
    }
    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to load Experiments. Please try again.";
        console.log("handleError in Experiments:"+errorMessage);
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

    shouldExperimentBeFilteredOut(feature:any): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    console.log(feature[key]);
                    if (feature[key].toString().toLowerCase()==value.toString().toLowerCase()) {
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

    isFilteredOut(experiment:Experiment): boolean {
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

    isVariantFilteredOut(variant:Variant): boolean {
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

    isPartOfSearch(term:string, experiment:Experiment):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = experiment.displayName;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = experiment.name;
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    isVariantPartOfSearch(term:string, variant:Variant):boolean {
        if (!term || term=="") {
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


    showNextSearchResult(forward:boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length-1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length-1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }
    create(message:string) {
        this.toastrService.error(message, "Error", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }
}

