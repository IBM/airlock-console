import {Component, ViewChild, ViewChildren} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {Analytic} from "../../model/analytic";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {AnalyticsDisplay} from "../../model/analyticsDisplay";
import {AnalyticsQuota} from "../../model/analyticsQuota";
import {Branch} from "../../model/branch";
import {NbDialogService, NbPopoverDirective, NbSearchService} from "@nebular/theme";
import {AddFeatureModal} from "../../@theme/modals/addFeatureModal";
import {EditInputSchemaModal} from "../../@theme/modals/editInputSchemaModal";
import {EditUtilityModal} from "../../@theme/modals/editUtilityModal";
import {DocumentlinksModal} from "../../@theme/airlock.components/documentlinksModal/documentlinksModal.component";
import {ShowEncryptionKeyModal} from "../../@theme/modals/showEncryptionKeyModal";
import {ReorderMXGroupModal} from "../../@theme/modals/reorderMXGroupModal";
import {wlContextModal} from "../../@theme/modals/wlContextModal";
import {ImportFeaturesModal} from "../../@theme/modals/importFeaturesModal";
import {Utility} from "../../model/utility";
import {SearchHit, SearchLocation, SearchResult} from "../../model/searchResult";
import {ActivatedRoute} from "@angular/router";
import { InAppPurchase } from 'app/model/inAppPurchase';
import {EditFeaturePage} from "../../@theme/airlock.components/editFeaturePage";
import {EditFeatureConfig} from "../../model/editFeatureConfig";
import {StickyViewDirective} from "../../@theme/directives/stickyView/sticky-view.directive";

@Component({
    selector: 'featuresPage',
    styleUrls: ['./featuresStyle.scss', './sideNavStyle.scss'],
    templateUrl: './featuresPage.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)',
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)',
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out')),
        ]),
    ],
})


export class FeaturesPage {
    public checkModel: any = {left: false, middle: true, right: false};
    possibleUserGroupsList: Array<string> = [];
    selectedEditedFeature: Feature;
    valid: boolean = true;
    showConfig: boolean = true;
    showOrdering: boolean = true;
    showNotInBranch: boolean = true;
    showDevFeatures: boolean = true;
    showAdvancedSearch: boolean = false;
    pathFeatureId: string = null;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    rootId: string = "";
    root: Feature = null;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @ViewChild("editInline") editInline: EditFeaturePage;
    inlineMode: boolean = false;
    features: Array<Feature> = [];
    selectedProduct: Product;
    selectedSeason: Season;
    selectedBranch: Branch;
    searchOpen: boolean = true;
    loading: boolean = false;
    openFeatures: Array<string> = [];
    filteredFeatures: Array<string> = new Array<string>();
    searchResults: Array<SearchResult> = new Array();
    showDialog = false;
    analyticDataForDisplay: AnalyticsDisplay;
    totalAnaliticsQuota: AnalyticsQuota;
    analyticData: Analytic;
    ruleInputSchemaSample: string;
    totalAnaliticsCount: number;
    totalAnaliticsDevCount: number;
    totalCountQuota: number;
    searchQueryString: string = null;
    seasonSupportAnalytics: boolean = true;
    importExportSupport: boolean = true;
    selectedFeatureId = null;
    scrolledToSelected = false;
    selectedFeatureIndex = -1;
    searchValue = "";
    private DUMMY_APP_MAX_VERSION: string = '100';
    static SERVER_ANALYTICS_SUPPORT_VERSION: number = 2.5;
    public status: { isopen: boolean } = {isopen: false};
    encryptionSupport: boolean = false;

    constructor(private _airLockService: AirlockService,
                private _appState: GlobalState,
                private _featureUtils: FeatureUtilsService,
                private modalService: NbDialogService,
                private searchService: NbSearchService,
                private route: ActivatedRoute
                ) {
        this.loading = true;
        this.selectedSeason = _appState.getCurrentSeason();
        this.selectedProduct = _appState.getCurrentProduct();
        this.selectedBranch = _appState.getCurrentBranch();
        this.searchService.onSearchSubmit()
            .subscribe((data: any) => {
                this.searchValue = data.term;
                this.createSearchResults();
            })
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowPaste() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer() && (this._airLockService.getCopiedFeature() != null);
    }

    reorder() {
        // this.reorderMXGroupModal.open(this.selectedBranch, Feature.clone(this.root), null, true);
        this.modalService.open(ReorderMXGroupModal, {
            closeOnBackdropClick: false,
            context: {
                _branch: this.selectedBranch,
                _mxGroup: Feature.clone(this.root),
                _configParent: null,
                isFeature: true,
                isConfig: false,
                isOrderRule: false,
                isShowMaxForOrderRule: false,
                isPurchases: false,
                isPurchaseOptions: false,
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.refreshTable();
            }
        });
        this.loading = false;
    }

    onShowDocumentLinks() {
        this.modalService.open(DocumentlinksModal, {
            closeOnBackdropClick: false,
            context: {
                seasonId: this.selectedSeason.uniqueId,
                platforms: this.selectedSeason.platforms,
            }
        })
        this.loading = false;
        // this._documentLinksModal.open(this.selectedSeason.uniqueId, this.selectedSeason.platforms);
    }

    downloadRuntimeDefaults() {
    }

    isShowOptions() {
        if (this.selectedSeason == null) {
            return false;
        }
        return (!this._airLockService.isViewer());
    }

    isViewer(): boolean {
        return this._airLockService.isViewer();
    }

    onEditUtilities() {
        this.loading = true;
        this._airLockService.getUtilities(this.selectedSeason.uniqueId)
            .then(response => {
                var utilitiesResponse = response as Utility[];
                utilitiesResponse = (utilitiesResponse == null) ? [] : utilitiesResponse.filter( util => util.type == 'MAIN_UTILITY');

                this.modalService.open(EditUtilityModal, {
                    closeOnBackdropClick: false,
                    context: {
                        utilities: utilitiesResponse,
                        season: this.selectedSeason,
                        type: 'MAIN_UTILITY',
                    }
                });
                // this._editUtilityModal.open(response, this.selectedSeason, "MAIN_UTILITY");
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to load utilities");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                // alert(`Failed to update product: ${error}`)
                // this._airLockService.notifyDataChanged("error-notification",`Failed to load utilities: ${error}`);
            });
    }

    openImportFeatureModal(isPaste: boolean) {
        this.root;
        //        <import-features-modal [targetBranch] = "selectedBranch" [rootFeatuteGroups]="groups"  [season]="selectedSeason" [rootId]="rootId" [root]="root" #importFeaturesModal (onImportFeatures)="refreshTable($event)"></import-features-modal>
        this.modalService.open(ImportFeaturesModal, {
            closeOnBackdropClick: false,
            context: {
                isPaste: isPaste,
                parent: this.root,
                isOpen: true,
                isClear: true,
                isShowSuffix: false,
                isShowMinApp: false,
                loading: false,
                referenceOpen: true,
                previewOpen: false,
                rootFeatureGroups: this.features,
                rootId: this.rootId,
                root: this.root,
                targetBranch: this.selectedBranch,
            }
        });
        this.loading = false;
    }

    onShowEncryptionKey() {
        this.loading = true;
        this._airLockService.getEncryptionKey(this.selectedSeason)
            .then(response => {
                this.loading = false;
                let message = (response as any).encryptionKey;
                this.modalService.open(ShowEncryptionKeyModal, {
                    closeOnBackdropClick: false,
                    context: {
                        encryptionKey: message
                    }
                })
                this.loading = false;
                // this.showKeyModal.open(message);
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed retrieve encription key");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
            });
    }

    onEditInputSchema(editMode: boolean = true) {
        this.loading = true;
        this._airLockService.getInputSchema(this.selectedSeason.uniqueId)
            .then(response => {
                this.modalService.open(EditInputSchemaModal, {
                    closeOnBackdropClick: false,
                    context: {
                        season: this.selectedSeason,
                        isOnlyDisplayMode: !editMode,
                        inputSchema: response,
                    },
                });
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to retrieve input schema");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                // alert(`Failed to update product: ${error}`)
            });
    }

    hidePopover() {
        this.popover.hide();
    }

    onShowContext() {
        this.loading = true;
        this._airLockService.getAnalyticsGlobalDataCollection(this.selectedSeason.uniqueId, this.selectedBranch.uniqueId).then(result => {
            this.analyticData = result;
            this._airLockService.getInputSample(this.selectedSeason.uniqueId, "DEVELOPMENT", this.DUMMY_APP_MAX_VERSION).then(result1 => {
                this.ruleInputSchemaSample = result1 as string;
                this.modalService.open(wlContextModal, {
                    closeOnBackdropClick: false,
                    context: {
                        totalCountQuota: this.totalAnaliticsQuota.analyticsQuota,
                        totalCount: this.totalAnaliticsCount,
                        totalCountDev: this.totalAnaliticsDevCount,
                        ruleInputSchemaSample: this.ruleInputSchemaSample,
                        analyticData: this.analyticData,
                        season: this.selectedSeason,
                        seasonId: this.selectedSeason.uniqueId,
                        branch: this.selectedBranch,
                        branchId: this.selectedBranch.uniqueId
                    }
                })
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
            });
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            this.loading = false;
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
        });
    }

    isShowImport() {
        if (!this.importExportSupport) {
            return false;
        }
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer();
    }

    isShowEditSchema() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer() && !this._airLockService.isEditor();
    }

    isShowViewSchema() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this.isShowEditSchema();
    }

    isShowEditUtil() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer();
    }

    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    canImportExport() {
        return this._appState.canExportImport();
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

    toggleTestExperiments() {

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

    public updateWhitelist(currentSeason: Season) {
        if (!currentSeason) {
            currentSeason = this.selectedSeason;
        }

        this.analyticDataForDisplay = new AnalyticsDisplay();
        //this.whitelistBtn.nativeElement.setAttribute("data-count", 0);
        if (currentSeason && currentSeason.uniqueId) {
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

    static getCurrentProductFromBranch(products: Product[], currentBranch: Branch): Product {
        if (currentBranch) {
            if (products.length > 0) {
                for (let p of products) {
                    let currProd: Product = p;
                    if (p.seasons) {
                        for (let season of p.seasons) {
                            if (season.uniqueId === currentBranch.seasonId) {
                                return currProd;
                            }
                        }
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

    static getCurrentSeasonFromBranch(seasons: Season[], currentBranch: Branch): Season {
        if (currentBranch) {
            if (seasons.length > 0) {
                for (let s of seasons) {
                    let currSeason: Season = s;
                    if (currSeason.uniqueId === currentBranch.seasonId) {
                        return currSeason;
                    }

                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length - 1];
        } else {
            return null;
        }
    }

    static getCurrentProductFromSeason(products: Product[], currentSeason: Season): Product {
        if (currentSeason) {
            if (products.length > 0) {
                for (let p of products) {
                    let currProd: Product = p;
                    if (currProd.uniqueId === currentSeason.productId) {
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
                if (currSeas.uniqueId === currentSeason.uniqueId) {
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

    static getCurrentSeasonFromSeasonPath(seasons: Season[], currentSeasonId: string): Season {
        if (currentSeasonId) {
            for (let s of seasons) {
                let currSeas: Season = s;
                if (currSeas.uniqueId === currentSeasonId) {
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
        this.loading = false;
        let currProduct = this._appState.getData('features.currentProduct');
        this.selectedProduct = currProduct;
        this.encryptionSupport = this.canSupportEncryption();
        let currSeason = this._appState.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        let currBranch = this._appState.getData('features.currentBranch');
        this.selectedBranch = currBranch;
        // this._airLockService.setCapabilities(this.selectedProduct);
        if (this.selectedBranch) {
            this.onBranchSelection(this.selectedBranch);
        }
        this._appState.subscribe('features.currentSeason', 'features', (season) => {
            this.selectedSeason = season;
        });
        this._appState.subscribe('features.currentProduct', 'features', (product) => {
            this.selectedProduct = product;
            this.encryptionSupport = this.canSupportEncryption();

        });
        this._appState.subscribe('features.currentBranch', 'features', (branch) => {
            this.onBranchSelection(branch);
        });

        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let featureId = params.featureId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId && featureId) {
                console.log("going to edit mode")
                this.pathFeatureId = featureId;
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathFeatureId', featureId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
            } else {
                this.pathFeatureId = null;
            }
        });
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason', 'features');
        this._appState.unsubcribe('features.currentProduct', 'features');
        this._appState.unsubcribe('features.currentBranch', 'features');
    }

    featureChangedStatus(featureID: string) {
        let index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            this.openFeatures.splice(index, 1);
        } else {
            this.openFeatures.push(featureID);
        }
    }

    featureStatusOpen(featureID: string) {
        let index = this.openFeatures.indexOf(featureID, 0);
        if (index == -1) {
            this.openFeatures.push(featureID);
        }
    }


    featureIsInFilter(featureID: string) {
        // this.filteredFeatures.add(featureID);
    }

    createSearchResults() {
        this.searchResults = [];
        let term = this.searchValue;
        if (term && term.length > 0) {
            for (let feature of this.features) {
                this.addFeatureToSearch(feature, term);
            }
        }
        console.log("searchResults:")
        console.log(this.searchResults);

    }
    createFilteredList() {
        this.filteredFeatures = [];
        this.selectedFeatureId = null;
        this.scrolledToSelected = false;
        this.selectedFeatureIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0 ) {
            for (let feature of this.features) {
                this.isFilteredOut(feature);
            }
        }
    }

    showNextSearchResult(forward: boolean) {
        if (this.filteredFeatures.length > 0) {
            if (forward) {
                if (this.selectedFeatureIndex >= (this.filteredFeatures.length - 1)) {
                    this.selectedFeatureIndex = 0;
                } else {
                    this.selectedFeatureIndex++;
                }
            } else {
                if (this.selectedFeatureIndex === 0) {
                    this.selectedFeatureIndex = this.filteredFeatures.length - 1;
                } else {
                    this.selectedFeatureIndex--;
                }
            }

            this.selectedFeatureId = this.filteredFeatures[this.selectedFeatureIndex];
            this.scrolledToSelected = false;
        }
    }

    featureIsSelected(featureObj: any) {
        featureObj.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    searchForTerm(term: string, feature: Feature): Array<SearchHit> {
        if (!term || term === "") {
            return [];
        }
        let toRet = [];
        let lowerTerm = term.toLowerCase();
        let name = feature.name ? feature.name.toLowerCase() : "";
        if (name.includes(term)) {
            let sRes = new SearchHit();
            sRes.location = SearchLocation.NAME;
            sRes.hit = name;
            toRet.push(sRes);
        }
        let displayName = feature.displayName ? feature.displayName.toLowerCase() : "";
        if (displayName.includes(term)) {
            let sRes = new SearchHit();
            sRes.location = SearchLocation.DISPLAY_NAME;
            sRes.hit = displayName;
            toRet.push(sRes);
        }
        let rule = (feature.rule && feature.rule.ruleString) ? feature.rule.ruleString.toLowerCase() : "";
        if (rule.includes(term)) {
            let sRes = new SearchHit();
            sRes.location = SearchLocation.RULE;
            sRes.hit = rule;
            toRet.push(sRes);
        }
        let config = feature.defaultConfiguration ? feature.defaultConfiguration.toLowerCase() : "";
        if (config.includes(term)) {
            let sRes = new SearchHit();
            sRes.location = SearchLocation.CONFIGURATION_VALUES;
            sRes.hit = config;
            toRet.push(sRes);
        }
        let description = feature.description ? feature.description.toLowerCase() : "";
        if (description.includes(term)) {
            let sRes = new SearchHit();
            sRes.location = SearchLocation.DESCRIPTION;
            sRes.hit = description;
            toRet.push(sRes);
        }
        return toRet;
    }
    isPartOfSearch(term: string, feature: Feature): boolean {
        if (!term || term === "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    shouldFeatureBeFilteredOut(feature: Feature): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        let isFilteredOut = false;
        if (feature.type === 'MUTUAL_EXCLUSION_GROUP' || feature.type === 'CONFIG_MUTUAL_EXCLUSION_GROUP' || feature.type === 'ORDERING_RULE_MUTUAL_EXCLUSION_GROUP') {
            //if this is MTX - filter out unless some children are not filtered
            isFilteredOut = true;
        }
        for (let key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (let value of valuesArr) {
                    if (feature[key].toLowerCase() === value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        //now check if has children which are not being filtered out
        if (feature.features) {
            for (let subFeat of feature.features) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.configurationRules) {
            for (let subFeat of feature.configurationRules) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.orderingRules) {
            for (let subFeat of feature.orderingRules) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        return isFilteredOut;
    }

    addFeatureToSearch(feature: Feature, term: string) {
        let hitsArr = this.searchForTerm(term, feature)
        // let hasSearchHit = this.isPartOfSearch(term, feature);
        if (hitsArr && hitsArr.length > 0) {
            let sRes: SearchResult = new SearchResult();
            sRes.obj = feature;
            sRes.type = feature.type;
            sRes.searchHits = hitsArr;
            this.searchResults.push(sRes);
        }

        if (feature.configurationRules) {
            for (let sub of feature.configurationRules) {
                this.addFeatureToSearch(sub, term);
            }
        }
        if (feature.orderingRules) {
            for (let sub of feature.orderingRules) {
                this.addFeatureToSearch(sub, term);
            }
        }
        if (feature.features) {
            for (let sub of feature.features) {
                this.addFeatureToSearch(sub, term);
            }
        }
    }
    isFilteredOut(feature: Feature): boolean {
        if (this.shouldFeatureBeFilteredOut(feature)) {
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, feature);
        if (hasSearchHit) {
            this.filteredFeatures.push(feature.uniqueId);
        }
        if (feature.configurationRules) {
            for (let sub of feature.configurationRules) {
                this.isFilteredOut(sub);
            }
        }
        if (feature.orderingRules) {
            for (let sub of feature.orderingRules) {
                this.isFilteredOut(sub);
            }
        }
        if (feature.features) {
            for (let sub of feature.features) {
                this.isFilteredOut(sub);
            }
        }

        return !hasSearchHit;
    }


    isCellOpen(featureID: string): boolean {
        let index = this.openFeatures.indexOf(featureID, 0);
        return index > -1;
    }

    setShowConfig(show: boolean) {
        this.showConfig = show;
        if (!this.filterlistDict["type"]) {
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(x => {
                return ((x !== "CONFIG_MUTUAL_EXCLUSION_GROUP") && (x !== "CONFIGURATION_RULE"));
            });
        } else {
            // this.filterlistDict["type"].push(["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"]);
            this.filterlistDict["type"].push("CONFIG_MUTUAL_EXCLUSION_GROUP");
            this.filterlistDict["type"].push("CONFIGURATION_RULE");
        }
        this.createFilteredList();
    }

    setShowOrdering(show: boolean) {
        this.showOrdering = show;
        if (!this.filterlistDict["type"]) {
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(x => {
                return ((x !== "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") && (x !== "ORDERING_RULE"));
            });
        } else {
            this.filterlistDict["type"].push("ORDERING_RULE");
            this.filterlistDict["type"].push("ORDERING_RULE_MUTUAL_EXCLUSION_GROUP");
        }
        this.createFilteredList();
    }

    setShowNotInBranch(show: boolean) {
        this.showNotInBranch = show;
        if (show || (this.selectedBranch && this.selectedBranch.uniqueId && this.selectedBranch.uniqueId.toLowerCase() === "master")) {
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

    setSelectedBranch(branch: Branch) {
        this.selectedBranch = branch;
    }

    public onSearchQueryChanged(term: string) {
        if (term === null || term.length <= 0) {
            let gps = this.features;
            let sseason = this.selectedSeason;
            this.selectedSeason = null;
            // this.groups = [];
            this.loading = true;
            setTimeout(() => {
                // this.groups = gps;
                this.selectedSeason = sseason;
                this.loading = false, 0.5;
            });

        }
        this.filteredFeatures = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }

    resetFilters() {
        this.filterlistDict = {string: []};
        this.showDevFeatures = true;
        this.showNotInBranch = true;
        this.showConfig = true;
        this.showOrdering = true;
        this.createFilteredList();
    }

    public onBranchSelection(branch: Branch) {
        if (this.selectedBranch != null && branch != null && this.selectedBranch.uniqueId === branch.uniqueId && this.features.length > 0){
            return;
        }
        if (this.selectedProduct) {
            this._airLockService.getUserGroups(this.selectedProduct).then(response => {
                this.possibleUserGroupsList = response.internalUserGroups;
            });
        }
        this.setSelectedBranch(branch);
        if (branch != null && this.selectedSeason != null) {
            this.loading = true;
            this.seasonSupportAnalytics = this.isSupportAnalytics();
            this.importExportSupport = this.canImportExport();
            this._airLockService.getFeatures(this.selectedSeason, this.selectedBranch).then(resp => {
                this.features = resp.features as Feature[];
                this.rootId = resp.uniqueId;
                this.root = resp;
                this.loading = false;
                this.valid = true;
                this.resetFilters();
                if (this.pathFeatureId) {
                    let items = this.getItemWithId(this.pathFeatureId);
                    let pathFeature = items[0];
                    let arr = items[1];
                    if (pathFeature) {
                        this.showEditFeature(pathFeature, arr);
                    }
                    this.pathFeatureId = null;
                }
            });
            this.updateWhitelist(this.selectedSeason);
        } else {
            this.valid = false;
            this.features = [];
            this.loading = false;
        }
    }

    getItemWithId(fId: string): [Feature, Array<Feature>] {
        for (let feature of this.features) {
            let res = this._getItemWithId(feature, fId, [this.root]);
            if (res[0] != null) {
                return res;
            }
        }
        return [null, null];
    }
    _getItemWithId(feature: Feature, fId: string, arr: Array<Feature>): [Feature, Array<Feature>] {
        if (feature.uniqueId === fId) {
            return [feature, arr];
        }
        let newArr: Array<Feature> = arr.concat([feature]);
        if (feature.features) {
            for (let sub of feature.features) {
                let res = this._getItemWithId(sub, fId, newArr);
                if (res[0] != null) {
                    return res;
                }
            }
        }
        if (feature.configurationRules) {
            for (let sub of feature.configurationRules) {
                let res = this._getItemWithId(sub, fId, newArr);
                if (res[0] != null) {
                    return res;
                }
            }
        }
        if (feature.orderingRules) {
            for (let sub of feature.orderingRules) {
                let res = this._getItemWithId(sub, fId, newArr);
                if (res[0] != null) {
                    return res;
                }
            }
        }
        return [null, arr];
    }

    showEditFeature(feature: Feature, featuresPath: Array<Feature>) {
        console.log("RETRIEVING utilities and inputSchema");
        this.loading = true;
        this._airLockService.getUtilitiesInfo(feature.seasonId, feature.stage, feature.minAppVersion).then(result => {
            let ruleUtilitieInfo = result as string;
            console.log('UtilityInfo:');
            console.log(ruleUtilitieInfo);
            this._airLockService.getInputSample(feature.seasonId, feature.stage, feature.minAppVersion).then(resultSample => {
                let ruleInputSchemaSample = resultSample as string;
                console.log('Input Schema Sample');
                console.log(ruleInputSchemaSample);
                this._airLockService.getInAppPurchases(this.selectedBranch.seasonId, this.selectedBranch).then(purchasesResult => {
                    this.loading = false;
                    let purchases: InAppPurchase[] = purchasesResult.entitlements;
                    this._showEditFeature(feature, featuresPath, ruleInputSchemaSample, ruleUtilitieInfo, purchases);
                }).catch(error => {
                    console.log('Error in getting InAppPurchases');
                    this.loading = false;
                    this._showEditFeature(feature, featuresPath, ruleInputSchemaSample, ruleUtilitieInfo, null);

                });
            }).catch(error => {
                console.log('Error in getting Input Schema Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
                this._showEditFeature(feature, featuresPath, "", ruleUtilitieInfo, null);
            });
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            this._showEditFeature(feature, featuresPath, "", "", null);
            this.loading = false;
        });
    }
    _showEditFeature(feature: Feature, featuresPath: Array<Feature>, ruleInputSchemaSample: string, ruleUtilitieInfo: string, purchases: InAppPurchase[]) {
        console.log("showing edit feature page");
        this.modalService.open(EditFeaturePage, {
            closeOnBackdropClick: false,
            context: {
                inlineMode: false,
                visible: true,
                originalFeature: feature,
                branch: this.selectedBranch,
                featurePath: featuresPath,
                inAppPurchases: purchases,
                feature: Feature.clone(feature),
                ruleInputSchemaSample: ruleInputSchemaSample,
                ruleUtilitiesInfo: ruleUtilitieInfo,
                featureCell: null,
                configurationCell: null,
                orderCell: null,
                sourceFeature: null,
                rootFeatuteGroups: this.features,
                rootId: this.rootId,
                root: this.root,
                modalWidth: EditFeaturePage.calculateModalSize()
            },
        }).onClose.subscribe((value) => {
            if (value) {
                if (value == "onEditFeature") {
                    this.refreshTable();
                }
                if (value == "outputEventWhiteListUpdate") {
                    this.updateWhitelist(null);
                    this.refreshTable();
                }
            }
            this.setEditDialog(false);

        });
    }
    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }

    public refreshTable(newFeature = null, parentFeatureId = null) {
        // this.openEditId = newFeature?.uniqueId;
        if (parentFeatureId !== null) {
            this.featureStatusOpen(parentFeatureId);
        }
        if (this.selectedSeason === null || this.selectedBranch === null) {
            return;
        }
        this.loading = true;
        this._airLockService.getFeatures(this.selectedSeason, this.selectedBranch).then(resp => {
            this.features = resp.features as Feature[];
            this.rootId = resp.uniqueId;
            this.root = resp;
            this.loading = false;
            this.valid = true;
            if (newFeature != null){
                if (newFeature.seasonId === null || newFeature.seasonId === undefined){
                    newFeature.seasonId = this.selectedSeason.uniqueId;
                }
                let editConfig = new EditFeatureConfig(this.selectedBranch, newFeature, null, this.ruleInputSchemaSample, null, null, null, false, null, null, null);
                this.showEditInline(editConfig);
            }
        });
        this.updateWhitelist(this.selectedSeason);
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }

    public deleteFeature(feature: Feature) {
        this.loading = true;
        this._airLockService.deleteFeature(feature, this.selectedBranch).then(resp => {
            this.refreshTable();
        });
    }

    public changeStateHandler(feature: Feature) {
        this.loading = true;
        if (feature.stage === 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage = 'PRODUCTION';
        }
        this._airLockService.updateFeature(feature, this.selectedBranch.uniqueId).then(resp => {
            this.refreshTable();
        });
    }

    public addFeature() {
        this.searchOpen = !this.searchOpen;
        this.modalService.open(AddFeatureModal, {
            closeOnBackdropClick: false,
            context: {
                title: "Add Feature",
                parentId: this.rootId
            }
        }).onClose.subscribe((value) => {
            if (value && value != null) {
                this.refreshTable(value);
            }
        });
        this.loading = false;
    }

    showEditInline(config: EditFeatureConfig) {
        console.log("showEditFeatureInline");
        this.inlineMode = true;
        this.editInline.open(this.selectedSeason, config.branch, config.feature, config.featurePath, config.strInputSchemaSample, config.strUtilitiesInfo, config.featureCell, config.configurationCell,
            config.showConfiguration, config.sourceFeature, config.orderCell, config.inAppPurchases, this.root, true);
    }
    closeEditInline(value) {
        this.inlineMode = false;
    }

    private canSupportEncryption() {
        return this._appState.canSupportEncryption();
    }

    isShowEncryption() {
        return this.encryptionSupport;
    }
}

class Container {
    constructor(public id: number, public name: string, public widgets: Array<Widget>) {
    }
}

class Widget {
    constructor(public name: string) {
    }
}

