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
import {Variant} from "../../model/variant";
import {Branch} from "../../model/branch";
import {InAppPurchase} from "../../model/inAppPurchase";
import {PurchaseOptions} from "../../model/purchaseOptions";
import {FeaturesPage} from "../featuresPage";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {AddPurchaseModal} from "../../@theme/modals/addPurchaseModal";
import {ActivatedRoute} from "@angular/router";
import {EditPurchaseModal} from "../../@theme/modals/editPurchaseModal";
import {EditPurchaseOptionsModal} from "../../@theme/modals/editPurchaseOptionsModal";
import {EditFeatureConfig} from "../../model/editFeatureConfig";
import {EditFeaturePage} from "../../@theme/airlock.components/editFeaturePage";

@Component({
    selector: 'purchasesPage',
    styleUrls: ['./purchases.scss', './sideNavStyle.scss'],
    templateUrl: './purchases.html',
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

    @ViewChild("editInline") editInline: EditPurchaseModal;
    @ViewChild("editPOInline") editPOInline: EditPurchaseOptionsModal;
    @ViewChild("editConfigInline") editConfigInline: EditFeaturePage;
    inlineMode: boolean = false;
    inlinePOMode: boolean = false;
    inlineConfigMode: boolean = false;
    public checkModel: any = {left: false, middle: true, right: false};
    selectedSeason: Season;
    possibleUserGroupsList: Array<string> = [];
    selectedEditedFeature: Feature;
    valid: boolean = true;
    showNotInBranch: boolean = true;
    showConfig: boolean = true;
    showDevFeatures: boolean = true;
    showDisabled: boolean = true;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    rootId: string = "";
    purchasesRoot: InAppPurchase;
    selectedProduct: Product;
    totalAnaliticsCount: number;
    seasonSupportAnalytics: boolean = true;
    totalAnaliticsDevCount: number;
    totalCountQuota: number;
    selectedBranch: Branch;
    importExportSupport: boolean = true;
    loading: boolean = false;
    openPurchases: Array<string> = [];
    filteredItems: Array<string> = new Array<string>();
    showDialog = false;
    searchQueryString: string = null;
    analyticDataForDisplay: AnalyticsDisplay;
    selectedId = null;
    selectedIndex = -1;
    scrolledToSelected = false;
    totalAnaliticsQuota: AnalyticsQuota;
    analyticData: Analytic;
    showAnalytics: boolean = true;

    public status: { isopen: boolean } = {isopen: false};
    private pathPurchaseId: any;
    private pathPurchaseOptionId: any;

    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private modalService: NbDialogService,
                private route: ActivatedRoute) {
        this.loading = true;
    }

    canImportExport() {
        return this._appState.canExportImport();
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowPaste() {
        if (this.purchasesRoot == null) {
            return false;
        }
        return !this._airlockService.isViewer() && (this._airlockService.getCopiedPurchase() != null);
    }

    isShowImport() {
        if (!this.importExportSupport) {
            return false;
        }
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    isShowOptions() {
        if (this.selectedProduct == null) {
            return false;
        }
        return (!this._airlockService.isViewer());
    }

    resetFilters() {
        this.filterlistDict = {string: []};
        this.showDevFeatures = true;
        this.showNotInBranch = true;
        this.showConfig = true;
        this.createFilteredList();
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
                for (let p of products) {
                    let currProd: Product = p;
                    if (currProd.uniqueId == currentSeason.productId) {
                        return currProd;
                    }
                }
            }
        }
        if (products.length > 0) {
            return products[0];
        } else {
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
        let currBranch = this._appState.getData('features.currentBranch');
        let currSeason = this._appState.getData('features.currentSeason');
        this.selectedBranch = currBranch;
        this.selectedSeason = currSeason;
        this.updateWhitelist(this.selectedSeason);
        this.onProductSelection(currProduct);
        this.onBranchSelection(currBranch);
        this._appState.subscribe('features.currentProduct', 'entitlements', (product) => {
            this.onProductSelection(product);
        });
        this._appState.subscribe('features.currentBranch', 'entitlements', (branch) => {
            this.onBranchSelection(branch);
        });
        this._appState.subscribe('features.currentSeason', 'entitlements', (season) => {
            this.selectedSeason = season;
            this.updateWhitelist(this.selectedSeason);
        });
        this.loading = false;
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let purchaseId = params.purchaseId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId) {//} && purchaseId) {
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
                if (params.purchaseId) {
                    console.log("going to purchase edit mode")
                    this.pathPurchaseId = params.purchaseId;
                    this.pathPurchaseOptionId = null;
                } else if (params.purchaseOptionId) {
                    console.log("going to purchase option edit mode")
                    this.pathPurchaseOptionId = params.purchaseOptionId;
                    this.pathPurchaseId = null;
                }
            } else {
                this.pathPurchaseId = null;
            }
        });
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'entitlements');
        this._appState.unsubcribe('features.currentSeason', 'entitlements');
        this._appState.unsubcribe('features.currentBranch', 'entitlements');
    }

    onProductSelection(product: Product) {
        if (product) {
            this.selectedProduct = product;
            this.showAnalytics = this._appState.canUseAnalytics();
            this._airlockService.getUserGroups(this.selectedProduct).then(response => {
                this.possibleUserGroupsList = response.internalUserGroups;
            });
        }
    }

    public onBranchSelection(branch: Branch) {
        if (branch.uniqueId != this.selectedBranch?.uniqueId || this.purchasesRoot == null ) {
            this.selectedBranch = branch;
            this.importExportSupport = this.canImportExport();
            this.seasonSupportAnalytics = this.isSupportAnalytics();
            this.getPurchases();
        }
    }

    getPurchases(item = null) {
        if (!this.selectedProduct?.capabilities.includes("ENTITLEMENTS")) {
            this.loading = false;
            this._airlockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedBranch) {
            this.loading = true;
            this._airlockService.getInAppPurchases(this.selectedBranch.seasonId, this.selectedBranch).then((root) => {
                this.purchasesRoot = root;
                this.rootId = root.uniqueId;
                this.loading = false;
                this.resetFilters();
                if (this.pathPurchaseId !== null) {
                    let patPurchase = this.getPurchaseItemWithId(this.pathPurchaseId);
                    if (patPurchase) {
                        this.showEditPurchase(patPurchase);
                    }
                    this.pathPurchaseId = null;
                    return;
                }
                if (this.pathPurchaseOptionId !== undefined) {
                    let patPurchaseOption = this.getPurchaseOptionItemWithId(this.pathPurchaseOptionId);
                    if (patPurchaseOption) {
                        this.showEditPurchaseOption(patPurchaseOption);
                    }
                    this.pathPurchaseId = null;
                    return;
                }
                if (item != null){
                    let purchase = this.getPurchaseItemWithId(item.uniqueId);
                    this.showEditInline(purchase);
                }
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    getPurchaseItemWithId(fId: string): InAppPurchase {
        for (let purchase of this.purchasesRoot.entitlements) {
            if (purchase.uniqueId === fId) {
                return purchase
            }
        }
        return null;
    }

    getPurchaseOptionItemWithId(fId: string): PurchaseOptions {
        for (let purchase of this.purchasesRoot.entitlements) {
            for (let purchaseOption of purchase.purchaseOptions) {
                if (purchaseOption.uniqueId === fId) {
                    return purchaseOption
                }
            }
        }
        return null;
    }

    purchaseChangedStatus(expID: string) {
        var index = this.openPurchases.indexOf(expID, 0);
        if (index > -1) {
            this.openPurchases.splice(index, 1);
        } else {
            this.openPurchases.push(expID);
        }
    }

    purchaseStatusOpen(featureID: string) {
        let index = this.openPurchases.indexOf(featureID, 0);
        if (index == -1) {
            this.openPurchases.push(featureID);
        }
    }

    isCellOpen(expID: string): boolean {
        var index = this.openPurchases.indexOf(expID, 0);
        return index > -1;
    }

    public isShowAddPurchase() {
        return !this._airlockService.isViewer();
    }

    public addPurchase() {
        this.modalService.open(AddPurchaseModal, {
            closeOnBackdropClick: false,
            context: {
                purchasesPage: this,
                parentId: this.purchasesRoot.uniqueId,
                parent: this.purchasesRoot,
                title: "Add Entitlement",
            }
        }).onClose.subscribe(item=>{
            if (item != null){
                this.refreshTable(item);
                this.getPurchases(item);
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

    onShowNotInBranchChanged(show: boolean) {
        this.showNotInBranch = show;
        if (show || (this.selectedBranch && this.selectedBranch.uniqueId && this.selectedBranch.uniqueId.toLowerCase() == "master")) {
            this.filterlistDict["branchStatus"] = [];
        } else {
            this.filterlistDict["branchStatus"] = ["NONE"];
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


    public refreshTable(parentItem = null, item = null) {
        if (parentItem !== null){
            this.purchaseStatusOpen(parentItem);
        }
        if (item !== null){
            this.showEditInline(item);
        }
        this.getPurchases();
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

    purchaseIsInFilter(expID: string) {
        // this.filteredExperiments.push(expID);
    }

    variantIsNotInFilter(varID: string) {
        // this.filteredExperiments.push(varID);
        // this.filteredVariants.push(varID);
    }

    private updateWhitelist(currentSeason: Season) {
        if (!currentSeason) {
            currentSeason = this.selectedSeason;
        }

        this.analyticDataForDisplay = new AnalyticsDisplay();
        //this.whitelistBtn.nativeElement.setAttribute("data-count", 0);
        if (currentSeason && currentSeason.uniqueId && this.selectedBranch) {
            if (Number(currentSeason.serverVersion) < FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION)
                return;

            this.analyticDataForDisplay = new AnalyticsDisplay();
            this._airlockService.getAnalyticsForDisplay(currentSeason.uniqueId, this.selectedBranch.uniqueId).then(result => {
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
            this._airlockService.getQuota(currentSeason.uniqueId).then(result => {
                this.totalAnaliticsQuota = result;
                this.totalCountQuota = this.totalAnaliticsQuota.analyticsQuota;
            }).catch(error => {
                console.log('Error in getting UtilityInfo');
                //this._airLockService.notifyDataChanged("error-notification", "Failed to get Utilitystring");
            });
        }
    }

    public purchaseAdded(purchase: InAppPurchase) {
        this.getPurchases();
    }

    public purchaseOptionAdded(option: PurchaseOptions) {
        this.getPurchases();
    }

    public updateExperiment(experiment: Experiment) {
        this.getPurchases();
    }

    public variantAdded() {
        this.getPurchases();
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
        // this._reorderExperimentsModal.open(this.experimentsContainer);
    }

    experimentsReordered(obj: any) {
        this.getPurchases();
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
        if (term && term.length > 0 && this.purchasesRoot && this.purchasesRoot.entitlements) {
            for (var purchase of this.purchasesRoot.entitlements) {
                this.isFilteredOut(purchase);
            }
        }
    }

    shouldPurchaseBeFilteredOut(feature: any): boolean {
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
                    if (feature[key].toString().toLowerCase() == value.toString().toLowerCase()) {
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

    isSupportAnalytics() {
        if (!this._appState.canUseAnalytics()) {
            return false;
        }
        if (this.selectedSeason) {
            if (Number(this.selectedSeason.serverVersion) < FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION)
                return false;
            else
                return true;
        }
        return false;
    }

    isFilteredOutOptions(purchaseOptions: PurchaseOptions): boolean {
        if (this.shouldPurchaseBeFilteredOut(purchaseOptions)) {
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

    isFilteredOut(purchase: InAppPurchase): boolean {
        if (this.shouldPurchaseBeFilteredOut(purchase)) {
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

    isVariantFilteredOut(variant: Variant): boolean {
        if (this.shouldPurchaseBeFilteredOut(variant)) {
            return true;
        }
        let hasSearchHit = this.isVariantPartOfSearch(this.searchQueryString, variant);
        if (hasSearchHit) {
            this.filteredItems.push(variant.uniqueId);
        }
        return !hasSearchHit;
    }

    isPartOfSearch(term: string, purchase: Feature): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = purchase.displayName;
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = purchase.name;
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

    private showEditPurchase(pathPurchase: InAppPurchase) {
        this._airlockService.getUtilitiesInfo(pathPurchase.seasonId, pathPurchase.stage, pathPurchase.minAppVersion).then(result => {
            let ruleUtilitieInfo = result as string;
            this._airlockService.getInputSample(pathPurchase.seasonId, pathPurchase.stage, pathPurchase.minAppVersion).then(result1 => {
                let ruleInputSchemaSample = result1 as string;
                // this.hideIndicator.emit(pathPurchase);
                let purchases: InAppPurchase[] = this.purchasesRoot.entitlements;
                this.modalService.open(EditPurchaseModal,
                    {
                        closeOnBackdropClick: false,
                        context: {
                            purchasesPage: this,
                            inlineMode: false,
                            visible: true,
                            season: this.selectedSeason,
                            possibleGroupsList: this.possibleUserGroupsList,
                            rootId: this.rootId,
                            root: this.purchasesRoot,
                            rootFeatuteGroups: this.purchasesRoot?.entitlements,
                            branch: this.selectedBranch,
                            feature: InAppPurchase.clone(pathPurchase),
                            featurePath: [],
                            ruleInputSchemaSample: ruleInputSchemaSample,
                            ruleUtilitiesInfo: ruleUtilitieInfo,
                            // featureCell: this,
                            configurationCell: null,
                            showConfiguration: false,
                            sourceFeature: null,
                            orderCell: null,
                            inAppPurchases: purchases,
                        },
                    }
                )
            }).catch(error => {
                console.log('Error in getting InAppPurchases');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Purchases ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                // this.hideIndicator.emit(error);
            });
        });
    }

    private showEditPurchaseOption(pathPurchaseOption: PurchaseOptions) {
        this._airlockService.getUtilitiesInfo(pathPurchaseOption.seasonId, pathPurchaseOption.stage, pathPurchaseOption.minAppVersion).then(result => {
            let ruleUtilitieInfo = result as any;
            this._airlockService.getInputSample(pathPurchaseOption.seasonId, pathPurchaseOption.stage, pathPurchaseOption.minAppVersion).then(result1 => {
                let ruleInputSchemaSample = result1 as any;
                this.modalService.open(EditPurchaseOptionsModal, {
                        closeOnBackdropClick: false,
                        context: {
                            purchasesPage: this,
                            inlineMode: false,
                            visible: true,
                            root: this.purchasesRoot,
                            rootId: this.rootId,
                            title: this.getString("edit_purchase_option_title"),
                            branch: this.selectedBranch,
                            feature: PurchaseOptions.clone(pathPurchaseOption),
                            // parentPurchaseId: this.parentFeatureId,
                            // featurePath: this.featuresPath,
                            ruleInputSchemaSample: ruleInputSchemaSample,
                            ruleUtilitiesInfo: ruleUtilitieInfo,
                            // featureCell: this,
                            configurationCell: null,
                            showConfiguration: false,
                            sourceFeature: null,
                            orderCell: null,
                            inAppPurchases: [],
                        },
                    }
                )
            }).catch(error => {
                console.log('Error in getting InAppPurchases');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Purchases ");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                // this.hideIndicator.emit(error);
            });
        });
    }

    showEditInline(item: any) {
        console.log("showEditExperimentInline");
        this.inlineMode = true;
        if (item.type === 'ENTITLEMENT' ) {
            this.inlineMode = true;
            this.inlinePOMode = false;
            this.inlineConfigMode = false;
            this.editInline.open(this.selectedBranch, item, this.purchasesRoot, [], null, null);
        } else if (item.type === 'PURCHASE_OPTIONS' ) {
            this.inlinePOMode = true;
            this.inlineConfigMode = false;
            //open(branch: Branch, feature: PurchaseOptions, parentPurchaseId: string, featurePath: Array<Feature>, strInputSchemaSample: string, strUtilitiesInfo: string,
            this.editPOInline.open(this.selectedBranch, item, this.purchasesRoot, this.purchasesRoot.uniqueId, [], null, null);
        } else if (item instanceof EditFeatureConfig) {
            this.inlineConfigMode = true;
            this.inlinePOMode = false;
            console.log("showEditExperimentConfigInline");
            this.editConfigInline.open(this.selectedSeason, item.branch, item.feature, item.featurePath, item.strInputSchemaSample, item.strUtilitiesInfo, item.featureCell, item.configurationCell,
                item.showConfiguration, item.sourceFeature, item.orderCell, item.inAppPurchases, this.purchasesRoot);
        } else if (item.type === 'CONFIGURATION_RULE'){
            this.inlineConfigMode = true;
            this.inlinePOMode = false;
            item.seasonId = this.selectedSeason.uniqueId;
            this.editConfigInline.open(this.selectedSeason, this.selectedBranch, item, item.featurePath, item.strInputSchemaSample, item.strUtilitiesInfo, item.featureCell, item.configurationCell,
                item.showConfiguration, item.sourceFeature, item.orderCell, item.inAppPurchases, this.purchasesRoot);
        }
    }
    closeEditInline(value) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.inlinePOMode = false;
        this.inlineConfigMode = false;
        this.loading = false;
    }

    clearPathVariables() {
        this.pathPurchaseOptionId = null;
        this.pathPurchaseId = null;
    }

}

