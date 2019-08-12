import {Component, Injectable, trigger, state, transition, animate, style, ElementRef} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {GlobalState} from "../../global.state";
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {Analytic} from "../../model/analytic";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {AnalyticsDisplay} from "../../model/analyticsDisplay";
import {AnalyticsQuota} from "../../model/analyticsQuota";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {ReorderExperimentsModal} from "../../theme/airlock.components/reorderExperimentsModal/reorderExperimentsModal.component";
import {ReorderVariantsModal} from "../../theme/airlock.components/reorderVariantsModal/reorderVariantsModal.component";
import {Variant} from "../../model/variant";
import {ToastrService} from "ngx-toastr";
import {AddProductModal} from "../../theme/airlock.components/addProductModal";
import {Branch} from "../../model/branch";
import {InAppPurchase} from "../../model/inAppPurchase";
import {AddPurchaseModal} from "../../theme/airlock.components/addPurchaseModal";
import {PurchaseOptions} from "../../model/purchaseOptions";
import {FeaturesPage} from "../featuresPage";
import { ImportPurchasesModal } from '../../theme/airlock.components/importPurchasesModal';
@Component({
    selector: 'purchasesPage',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./purchases.scss'), require('./sideNavStyle.scss')],
    template: require('./purchases.html'),
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


export class PurchasesPage {
    @ViewChild('addPurchaseModal') _addPurchaseModal : AddPurchaseModal;
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;

    @ViewChild('reorderExperimentsModal') _reorderExperimentsModal : ReorderExperimentsModal;
    @ViewChild('reorderVariantsModal') _reorderVariantsModal : ReorderVariantsModal;
    @ViewChild('importFeaturesModal') importFeaturesModal : ImportPurchasesModal;

    public checkModel:any = {left: false, middle: true, right: false};
    selectedSeason: Season;
    possibleUserGroupsList :Array<string> = [];
    selectedEditedFeature:Feature;
    valid: boolean = true;
    showNotInBranch: boolean = true;

    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    rootId:string = "";
    // experiments: Array<Experiment> = [];
    purchasesRoot: InAppPurchase;
    selectedProduct: Product;
    totalAnaliticsCount : number;
    seasonSupportAnalytics: boolean = true;
    totalAnaliticsDevCount : number;
    totalCountQuota : number;
    selectedBranch: Branch;
    importExportSupport: boolean = true;
    loading: boolean = false;
    openPurchases: Array<string> = [];
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
    canImportExport(){
        return this._airLockService.canExportImport();
    }
    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }
    isShowPaste(){
        if(this.purchasesRoot == null){
            return false;
        }
        return !this._airLockService.isViewer() && (this._airLockService.getCopiedPurchase() != null);
    }
    isShowImport(){
        if(!this.importExportSupport){
            return false;
        }
        if(this.selectedSeason == null){
            return false;
        }
        return !this._airLockService.isViewer();
    }
    isShowOptions(){
        if(this.selectedProduct == null){
            return false;
        }
        return (!this._airLockService.isViewer());
    }
    resetFilters() {
        this.filterlistDict = {string:[]};
        this.showDevFeatures = true;
        this.showNotInBranch = true;
        this.showConfig = true;
        this.createFilteredList();
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
        let currBranch = this._appState.getData('features.currentBranch');
        let currSeason = this._appState.getData('features.currentSeason');
        this.selectedBranch = currBranch;
        console.log("got saved season!!!");
        //console.log(currSeason);
        this.selectedSeason = currSeason;
        this.updateWhitelist(this.selectedSeason);
        // this.initData(currSeason, isLatest);
        this.onProductSelection(currProduct);
        this.onBranchSelection(currBranch);
        this._appState.subscribe('features.currentProduct','entitlements',(product) => {
            this.onProductSelection(product);
        });
        this._appState.subscribe('features.currentBranch','entitlements',(branch) => {
            this.onBranchSelection(branch);
        });
        this._appState.subscribe('features.currentSeason','entitlements',(season) => {
            this.selectedSeason = season;
            this.updateWhitelist(this.selectedSeason);
        });

    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct','entitlements');
        this._appState.unsubcribe('features.currentSeason','entitlements');
        this._appState.unsubcribe('features.currentBranch','entitlements');
    }
    onProductSelection(product:Product) {
        if(product) {
            this.selectedProduct = product;
            this.showAnalytics = this._airLockService.canUseAnalytics();
            this._airLockService.getUserGroups(this.selectedProduct).then(response => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
        }
    }

    public onBranchSelection(branch:Branch) {
        this.selectedBranch = branch;
        this.importExportSupport = this.canImportExport();
        this.seasonSupportAnalytics = this.isSupportAnalytics();
        this.getPurchases();
    }

    getPurchases() {
        if(!this._airLockService.getCapabilities().includes("ENTITLEMENTS")){
            this.loading = false;
            this._airLockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedBranch) {
            this.loading = true;
            this._airLockService.getInAppPurchases(this.selectedBranch.seasonId, this.selectedBranch).then((root) => {
                this.purchasesRoot = root;
                this.rootId=root.uniqueId;
                this.loading = false;
                this.resetFilters();
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }

    }


    purchaseChangedStatus(expID:string) {
        console.log("variant changed status:"+expID);
        var index = this.openPurchases.indexOf(expID, 0);
        if (index > -1) {
            this.openPurchases.splice(index, 1);
        } else {
            this.openPurchases.push(expID);
        }
    }

    isCellOpen(expID:string): boolean {
        var index = this.openPurchases.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddPurchase(){
        return !this._airLockService.isViewer();
    }
    public addPurchase(){
        this._addPurchaseModal.open(this.purchasesRoot);
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
    onShowNotInBranchChanged(show:boolean) {
        this.showNotInBranch = show;
        if (show || (this.selectedBranch && this.selectedBranch.uniqueId && this.selectedBranch.uniqueId.toLowerCase()=="master")) {
            this.filterlistDict["branchStatus"] = [];
        } else {
            this.filterlistDict["branchStatus"] = ["NONE"];
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
        this.getPurchases();
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

    purchaseIsInFilter(expID:string) {
        // this.filteredExperiments.push(expID);
    }

    variantIsNotInFilter(varID:string) {
        // this.filteredExperiments.push(varID);
        // this.filteredVariants.push(varID);
    }

    private updateWhitelist(currentSeason: Season) {
        if(!currentSeason){
            currentSeason = this.selectedSeason;
        }

        this.analyticDataForDisplay = new AnalyticsDisplay();
        //this.whitelistBtn.nativeElement.setAttribute("data-count", 0);
        if (currentSeason && currentSeason.uniqueId && this.selectedBranch) {
            if (Number(currentSeason.serverVersion) < FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION)
                return;

            this.analyticDataForDisplay = new AnalyticsDisplay();
            this._airLockService.getAnalyticsForDisplay(currentSeason.uniqueId, this.selectedBranch.uniqueId).then(result => {
                this.analyticDataForDisplay = result;
                this.totalAnaliticsCount = this.getWhitelistCount();
                this.totalAnaliticsDevCount = this.getWhitelistDevCount();
                //this.whitelistBtn.nativeElement.setAttribute("data-count", count);
                //if (count > FeaturesPage.WHITELIST_THRESHOLD) this.whitelistBtn.nativeElement.setAttribute("style", "background: red;");
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                this.totalAnaliticsCount = 0;
                this.totalAnaliticsDevCount = 0;
                //this._airLockService.notifyDataChanged("error-notification", "Failed to get Utilitystring");
            });
            this._airLockService.getQuota(currentSeason.uniqueId).then(result => {
                this.totalAnaliticsQuota = result;
                this.totalCountQuota = this.totalAnaliticsQuota.analyticsQuota;
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                //this._airLockService.notifyDataChanged("error-notification", "Failed to get Utilitystring");
            });
        }
    }

    public purchaseAdded(purchase : InAppPurchase) {
        this.getPurchases();
    }

    public purchaseOptionAdded(option: PurchaseOptions) {
        this.getPurchases();
    }
    public updateExperiment(experiment : Experiment) {
        this.getPurchases();
    }

    public variantAdded() {
        this.getPurchases();
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
        // this._reorderExperimentsModal.open(this.experimentsContainer);
    }

    experimentsReordered(obj:any) {
        this.getPurchases();
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
        if (term && term.length > 0 && this.purchasesRoot && this.purchasesRoot.entitlements) {
            for (var purchase of this.purchasesRoot.entitlements) {
                this.isFilteredOut(purchase);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    shouldPurchaseBeFilteredOut(feature:any): boolean {
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
        if (feature.entitlements) {
            for (var subFeat of feature.entitlements) {
                let isFiltered = this.shouldPurchaseBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }

        if (feature.purchaseOptions) {
            for (var subFeat of feature.purchaseOptions) {
                let isFiltered = this.shouldPurchaseBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }

        return isFilteredOut;
    }
    isSupportAnalytics(){
        if(!this._airLockService.canUseAnalytics()){
            return false;
        }
        if (this.selectedSeason){
            if (Number(this.selectedSeason.serverVersion) < FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION)
                return false;
            else
                return true;
        }
        return false;
    }
    isFilteredOutOptions(purchaseOptions:PurchaseOptions): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldPurchaseBeFilteredOut(purchaseOptions)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, purchaseOptions);
        if (hasSearchHit) {
            this.filteredItems.push(purchaseOptions.uniqueId);
        }
        // if (purchase.entitlements) {
        //     for (var sub of purchase.entitlements) {
        //         this.isFilteredOut(sub);
        //     }
        // }
        if (purchaseOptions.purchaseOptions) {
            for (var opt of purchaseOptions.purchaseOptions) {
                this.isFilteredOutOptions(opt);
            }
        }

        return !hasSearchHit;
    }
    isFilteredOut(purchase:InAppPurchase): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldPurchaseBeFilteredOut(purchase)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, purchase);
        if (hasSearchHit) {
            this.filteredItems.push(purchase.uniqueId);
        }
        if (purchase.entitlements) {
            for (var sub of purchase.entitlements) {
                this.isFilteredOut(sub);
            }
        }
        if (purchase.purchaseOptions) {
            for (var opt of purchase.purchaseOptions) {
                this.isFilteredOutOptions(opt);
            }
        }

        return !hasSearchHit;
    }

    isVariantFilteredOut(variant:Variant): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldPurchaseBeFilteredOut(variant)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isVariantPartOfSearch(this.searchQueryString, variant);
        if (hasSearchHit) {
            this.filteredItems.push(variant.uniqueId);
        }
        return !hasSearchHit;
    }

    isPartOfSearch(term:string, purchase:Feature):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = purchase.displayName;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = purchase.name;
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

