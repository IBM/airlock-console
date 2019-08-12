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
import {Branch} from "../../model/branch";
import {VerifyRemoveFromBranchModal} from "../../theme/airlock.components/verifyRemoveFromBranchModal/verifyRemoveFromBranchModal.component";
import {EditUtilityModal} from "../../theme/airlock.components/editUtilityModal/editUtilityModal.component";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {ShowEncryptionKeyModal} from "../../theme/airlock.components/showEncryptionKeyModal";
import {SelectLocaleForRuntimeModal} from "../../theme/airlock.components/selectLocaleForRuntimeModal";

@Component({
    selector: 'featuresPage',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./featuresStyle.scss'), require('./sideNavStyle.scss')],
    template: require('./featuresPage.html'),
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


export class FeaturesPage {
    @ViewChild('editFeatureModal')
    editFeatureModal:  EditFeatureModal;
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
    @ViewChild('showKeyModal')
    showKeyModal:  ShowEncryptionKeyModal;
    @ViewChild('verifyRemoveFromBranchModal')
    verifyRemoveFromBranchModal:  VerifyRemoveFromBranchModal;
    @ViewChild('addFeatureModal')
    addFeatureModal:  AddFeatureModal;
    @ViewChild('importFeaturesModal')
    importFeaturesModal:  ImportFeaturesModal;
    @ViewChild('addConfigurationModal')
    addConfigurationModal:  AddConfigurationModal;
    @ViewChild('wlAttributesModalDialog')wlAttributesModalDialog:  wlAttributesModal;
    @ViewChild('reorderMxGroupModal')
    reorderMXGroupModal:  ReorderMXGroupModal;
    @ViewChild('addToMXGroupModal')
    addToMXGroupModal:  AddFeatureToGroupModal;
    @ViewChild('btn_whitelist') whitelistBtn:ElementRef;
    @ViewChild('editInputSchemaModal') _editInputSchemaModal : EditInputSchemaModal;
    @ViewChild('editUtilityModal') _editUtilityModal : EditUtilityModal;
    @ViewChild('documentLinksModal') _documentLinksModal : DocumentlinksModal;
    @ViewChild('selectLocaleForRuntimeModal') _selectLocaleForRuntimeModal : SelectLocaleForRuntimeModal;
    @ViewChild('pwlContextModalDialog') wlContextModalConteinetDialog : wlContextModal;


    public checkModel:any = {left: false, middle: true, right: false};
    possibleUserGroupsList :Array<string> = [];
    selectedEditedFeature:Feature;
    valid: boolean = true;
    showConfig: boolean = true;
    showOrdering: boolean = true;
    showNotInBranch: boolean = true;
    showDevFeatures: boolean = true;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    rootId:string = "";
    root: Feature = null;
    groups: Array<Feature> = [];
    selectedProduct: Product;
    selectedSeason: Season;
    selectedBranch: Branch;
    loading: boolean = false;
    openFeatures: Array<string> = [];
    filteredFeatures: Array<string> = new Array<string>();
    showDialog = false;
    analyticDataForDisplay:AnalyticsDisplay;
    totalAnaliticsQuota:AnalyticsQuota;
    analyticData:Analytic;
    ruleInputSchemaSample : string;
    totalAnaliticsCount : number;
    totalAnaliticsDevCount : number;
    totalCountQuota : number;
    searchQueryString: string = null;
    seasonSupportAnalytics: boolean = true;
    importExportSupport: boolean = true;
    selectedFeatureId = null;
    scrolledToSelected = false;
    selectedFeatureIndex = -1;
    staticMode:boolean = false;
    private DUMMY_APP_MAX_VERSION : string = '100';
    static SERVER_ANALYTICS_SUPPORT_VERSION: number = 2.5;



    public status: {isopen: boolean} = {isopen: false};
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState,
                private _featureUtils:FeatureUtilsService,
                public modal: Modal) {
        this.loading = true;
        this.staticMode = this._airLockService.isStaticMode();
        console.log("isStaticMode:"+this._airLockService.isStaticMode());
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }
    isShowPaste(){
        if(this.selectedSeason == null){
            return false;
        }
        return !this._airLockService.isViewer() && (this._airLockService.getCopiedFeature() != null);
    }
    reorder() {
        this.reorderMXGroupModal.open(this.selectedBranch, Feature.clone(this.root),null,true);
    }
    onShowDocumentLinks(){

        console.log(`ON Show Documents ${this.selectedSeason.name}`);


        this._documentLinksModal.open(this.selectedSeason.uniqueId, this.selectedSeason.platforms);
    }


    downloadRuntimeDefaults(){

        console.log(`ON Select Locale for Runtime ${this.selectedSeason.name}`);

        console.log(this);

        this._selectLocaleForRuntimeModal.open(this.selectedSeason.uniqueId);

        // this._airLockService.downloadRuntimeDefaultFiles(this.selectedSeason.uniqueId);
    }

    isShowOptions(){
        if(this.selectedSeason == null){
            return false;
        }
        return (!this._airLockService.isViewer());
    }

    isViewer():boolean {
        return this._airLockService.isViewer();
    }
    onEditUtilities(){
        this.loading = true;
        this._airLockService.getUtilities(this.selectedSeason.uniqueId)
            .then(response  => {
                console.log("utils");
                console.log(response);
                this._editUtilityModal.open(response,this.selectedSeason,"MAIN_UTILITY");
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to load utilities");
                this._airLockService.notifyDataChanged("error-notification",errorMessage);
                // alert(`Failed to update product: ${error}`)
                // this._airLockService.notifyDataChanged("error-notification",`Failed to load utilities: ${error}`);
            });
    }
    onShowEncryptionKey() {
        this.loading = true;
        this._airLockService.getEncryptionKey(this.selectedSeason)
            .then(response => {
                this.loading = false;
                let message = response.encryptionKey;
                this.showKeyModal.open(message);
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed retrieve encription key");
                this._airLockService.notifyDataChanged("error-notification",errorMessage);
            })
    }
    onEditInputSchema(editMode:boolean = true){
        this.loading = true;
        this._airLockService.getInputSchema(this.selectedSeason.uniqueId)
            .then(response  => {
                console.log("inputschema");
                console.log(response);
                this._editInputSchemaModal.open(response,this.selectedSeason, editMode);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to retrieve input schema");
                this._airLockService.notifyDataChanged("error-notification",errorMessage);
                // alert(`Failed to update product: ${error}`)
            });
    }

    onShowContext(){
        console.log('in onShowContext');
        this.loading = true;
        this._airLockService.getAnalyticsGlobalDataCollection(this.selectedSeason.uniqueId, this.selectedBranch.uniqueId).then(result => {
            this.analyticData = result;
            console.log('getAnalyticsGlobalDataCollection:');
            console.log(this.analyticData);
            this._airLockService.getInputSample(this.selectedSeason.uniqueId, "DEVELOPMENT", this.DUMMY_APP_MAX_VERSION).then(result => {
                this.ruleInputSchemaSample = result;
                console.log('Input Schema Sample');
                console.log(this.ruleInputSchemaSample);
                this.wlContextModalConteinetDialog.open(this.ruleInputSchemaSample, this.analyticData,this.selectedSeason, this.selectedBranch);
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                this._airLockService.notifyDataChanged("error-notification",errorMessage);
            });
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            this.loading = false;
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airLockService.notifyDataChanged("error-notification",errorMessage);
        });
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
    isShowEditSchema(){
        if(this.selectedSeason == null){
            return false;
        }
        return !this._airLockService.isViewer() && !this._airLockService.isEditor();
    }
    isShowViewSchema() {
        if(this.selectedSeason == null){
            return false;
        }
        return !this.isShowEditSchema();
    }
    isShowEditUtil(){
        if(this.selectedSeason == null){
            return false;
        }
        return !this._airLockService.isViewer();
    }
    toggleDataCollectionDetails(){
        this.showDialog = !this.showDialog;
    }

    canImportExport(){
        return this._airLockService.canExportImport();
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

    toggleTestExperiments(){
        console.log('in toggleTestExperiments ');
/*        if (this.selectedProduct) {
            console.log('product for Experiments', this.selectedProduct);
            this._airLockService.getExperiments(this.selectedProduct.uniqueId).then(resp =>{
                console.log('got season');
                this.experiments = resp.experiments as Experiment[];
                console.log('my experiments', this.experiments);
            }).catch(
                error => {
                    //this.handleError(error);
                    console.log('error in toggleTestExperiments');
                }
            );
        }*/

        /*if (this.selectedProduct) {
            console.log('product for Experiments', this.selectedProduct);
            this._airLockService.checkoutFeature1("32d06661-b7ae-4d1d-9dcc-4c9d8cdd087e", "30ab9d85-a988-4bd8-add8-1a5fac8f1600").then(resp =>{
                console.log('checkout feature');
                //this.experiments = resp.exp; eriments as Experiment[];
                console.log('checkout feature', resp);
            }).catch(
                error => {
                    //this.handleError(error);
                    console.log('error:', error);
                }
            );
        }*/

    }

    /*initData(currentBranch:Branch,currentSeason: Season, isSeasonLatest:boolean) {
        this._airLockService.getProducts().then(response  => {
            console.log("got products");
            console.log(response);
            this.products = response;
            console.log(this.products[0]);
            this.selectedProduct = FeaturesPage.getCurrentProductFromSeason(this.products,currentSeason);
            if (this.selectedProduct) {
                console.log("this is the selected product!!!!:  "+this.selectedProduct.name);
                this.seasons = this.selectedProduct.seasons;
                this.selectedSeason=FeaturesPage.getCurrentSeasonFromSeason(this.seasons,currentSeason);
                if (isSeasonLatest && !this.isCurrentSeasonLast() && this.seasons && this.seasons.length > 0) {
                    //this._airLockService.notifyDataChanged("info-webhook",{title:"New version range",message:"New version range created for this product"});
                }
            } else {
                this.seasons = null;
                this.selectedSeason = null;
            }
            this.seasonSupportAnalytics = this.isSupportAnalytics();
            this._appState.notifyDataChanged('features.currentSeason', this.selectedSeason);
            let isLatest = this.isCurrentSeasonLast() ? "true" : "false";
            this._appState.notifyDataChanged('features.isLatestSeason', isLatest);
            if (this.selectedSeason) {
                // console.log('getting season');
                // this._airLockService.getFeatures(this.selectedSeason).then(resp =>{
                //     console.log('got season');
                //     console.log(resp);
                //     this.groups = resp.features as Feature[];
                //     this.rootId=resp.uniqueId;
                //     this.root = resp;
                //     this.loading = false;
                //     this.valid = true;
                // }).catch(
                //     error => {
                //         //this.handleError(error);
                //         this.loading = false;
                //         this.valid = false;
                //     }
                // );
            } else {
                this.loading = false;
                this.valid = false;
            }
        });
        this.updateWhitelist(currentSeason);
    }*/

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

    private updateWhitelist(currentSeason: Season) {
        if(!currentSeason){
            currentSeason = this.selectedSeason;
        }

        this.analyticDataForDisplay = new AnalyticsDisplay();
        //this.whitelistBtn.nativeElement.setAttribute("data-count", 0);
        if (currentSeason && currentSeason.uniqueId) {
            if (Number(currentSeason.serverVersion) < FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION || this.staticMode)
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

    static getCurrentProductFromBranch(products:Product[], currentBranch:Branch): Product {
        if (currentBranch) {
            console.log("branch's seasonID:"+currentBranch.seasonId);
            if (products.length > 0) {
                for (let p of products) {
                    let currProd:Product = p;
                    console.log(currProd.uniqueId);
                    console.log(currentBranch.seasonId);
                    if (p.seasons) {
                        for (var season of p.seasons) {
                            if (season.uniqueId== currentBranch.seasonId) {
                                return currProd;
                            }
                        }
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

    static getCurrentSeasonFromBranch(seasons:Season[], currentBranch:Branch): Season {
        if (currentBranch) {
            console.log("branch's seasonID:"+currentBranch.seasonId);
            if (seasons.length > 0) {
                for (let s of seasons) {
                    let currSeason:Season = s;
                    console.log(currentBranch.seasonId);
                    if (currSeason.uniqueId== currentBranch.seasonId) {
                        console.log("yay");
                        return currSeason;
                    }

                }
            }
        }
        if (seasons.length > 0) {
            console.log("return last");
            return seasons[seasons.length-1];
        } else {
            console.log("return null from getCurrentSeasonFromBranch");
            return null;
        }
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
        this.loading = false;
        let currProduct = this._appState.getData('features.currentProduct');
        this.selectedProduct = currProduct;
        let currSeason = this._appState.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        let currBranch = this._appState.getData('features.currentBranch');
        this.selectedBranch = currBranch;
        this._airLockService.setCapabilities(this.selectedProduct);
        if (this.selectedBranch) {
            this.onBranchSelection(this.selectedBranch);
        }
        console.log("got saved season!!!");

        this._appState.subscribe('features.currentSeason','features',(season) => {
            this.selectedSeason = season;
        });
        this._appState.subscribe('features.currentProduct','features',(product) => {
            this.selectedProduct = product;
        });
        this._appState.subscribe('features.currentBranch','features',(branch) => {
            this.onBranchSelection(branch);
        });
    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason','features');
        this._appState.unsubcribe('features.currentProduct','features');
        this._appState.unsubcribe('features.currentBranch','features');
    }

    featureChangedStatus(featureID:string) {
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            this.openFeatures.splice(index, 1);
        } else {
            this.openFeatures.push(featureID);
        }
    }

    featureIsInFilter(featureID:string) {
        // this.filteredFeatures.add(featureID);
    }

    createFilteredList() {
        this.filteredFeatures = [];
        this.selectedFeatureId = null;
        this.scrolledToSelected = false;
        this.selectedFeatureIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0) {
            for (var feature of this.groups) {
                this.isFilteredOut(feature);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }

    }

    showNextSearchResult(forward:boolean) {
        if (this.filteredFeatures.length > 0) {
            if (forward) {
                if (this.selectedFeatureIndex >= (this.filteredFeatures.length-1)) {
                    this.selectedFeatureIndex = 0;
                } else {
                    this.selectedFeatureIndex++;
                }
            } else {
                if (this.selectedFeatureIndex == 0) {
                    this.selectedFeatureIndex = this.filteredFeatures.length-1;
                } else {
                    this.selectedFeatureIndex--;
                }
            }

            this.selectedFeatureId = this.filteredFeatures[this.selectedFeatureIndex];
            this.scrolledToSelected = false;
        }
    }

    featureIsSelected(featureObj:any) {
        if (featureObj.id && featureObj.id == this.selectedFeatureId && !this.scrolledToSelected) {
            let y = featureObj.offset;
            // jQuery('html, body').animate({scrollTop:y - 200}, {duration:3.0});
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if(offset > window.innerHeight || offset < 0){
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

    isPartOfSearch(term:string, feature:Feature):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    shouldFeatureBeFilteredOut(feature:Feature): boolean {
        if(!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if(!keys) {
            return false;
        }
        var isFilteredOut = false;
        if (feature.type=='MUTUAL_EXCLUSION_GROUP' || feature.type=='CONFIG_MUTUAL_EXCLUSION_GROUP' || feature.type=='ORDERING_RULE_MUTUAL_EXCLUSION_GROUP') {
            //if this is MTX - filter out unless some children are not filtered
            isFilteredOut = true;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            // console.log("values to filter out");
            // console.log(valuesArr);
            // console.log(feature[key]);
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase()==value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        //now check if has children which are not being filtered out
        if (feature.features) {
            for (var subFeat of feature.features) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.configurationRules) {
            for (var subFeat of feature.configurationRules) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.orderingRules) {
            for (var subFeat of feature.orderingRules) {
                let isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        return isFilteredOut;
    }

    isFilteredOut(feature:Feature): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldFeatureBeFilteredOut(feature)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, feature);
        if (hasSearchHit) {
            this.filteredFeatures.push(feature.uniqueId);
        }
        if (feature.configurationRules) {
            for (var sub of feature.configurationRules) {
                this.isFilteredOut(sub);
            }
        }
        if (feature.orderingRules) {
            for (var sub of feature.orderingRules) {
                this.isFilteredOut(sub);
            }
        }
        if (feature.features) {
            for (var sub of feature.features) {
                this.isFilteredOut(sub);
            }
        }


        return !hasSearchHit;
    }


    isCellOpen(featureID:string): boolean {
        // console.log("isCellOpen:"+featureID);
        var index = this.openFeatures.indexOf(featureID, 0);
        return index > -1;
    }

    setShowConfig(show:boolean) {
        this.showConfig = show;
        if(!this.filterlistDict["type"]){
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(x => {
                return ((x != "CONFIG_MUTUAL_EXCLUSION_GROUP") && (x!= "CONFIGURATION_RULE"));
            });
        } else {
            // this.filterlistDict["type"].push(["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"]);
            this.filterlistDict["type"].push("CONFIG_MUTUAL_EXCLUSION_GROUP");
            this.filterlistDict["type"].push("CONFIGURATION_RULE");
        }
        this.createFilteredList();
    }
    setShowOrdering(show:boolean) {
        console.log("show orderigng in feature page")
        this.showOrdering = show;
        if(!this.filterlistDict["type"]){
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(x => {
                return ((x != "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") && (x!= "ORDERING_RULE"));
            });
            console.log(this.filterlistDict["type"]);
        } else {
            this.filterlistDict["type"].push("ORDERING_RULE");
            this.filterlistDict["type"].push("ORDERING_RULE_MUTUAL_EXCLUSION_GROUP");
            console.log(this.filterlistDict["type"]);

        }
        this.createFilteredList();
    }
    setShowNotInBranch(show:boolean) {
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

    setSelectedBranch(branch:Branch) {
        this.selectedBranch = branch;
        // this._appState.notifyDataChanged('features.currentSeason', this.selectedSeason);
    }


    public onSearchQueryChanged(term:string) {
        if (term==null || term.length <=0) {
            let gps = this.groups;
            let sseason = this.selectedSeason;
            this.selectedSeason = null;
            // this.groups = [];
            this.loading = true;
            setTimeout(() => {
                // this.groups = gps;
                this.selectedSeason = sseason;
                this.loading = false, 0.5
            });

        }
        this.filteredFeatures = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }
    resetFilters() {
        this.filterlistDict = {string:[]};
        this.showDevFeatures = true;
        this.showNotInBranch = true;
        this.showConfig = true;
        this.showOrdering = true;
        this.createFilteredList();
    }
    public onBranchSelection(branch:Branch) {
        if(this.selectedProduct) {
            this._airLockService.getUserGroups(this.selectedProduct).then(response => {
                console.log(response);
                this.possibleUserGroupsList = response.internalUserGroups;
            });
        }
        this.setSelectedBranch(branch);
        if(branch != null && this.selectedSeason != null) {
            this.loading = true;
            this.seasonSupportAnalytics = this.isSupportAnalytics();
            this.importExportSupport = this.canImportExport();
            this._airLockService.getFeatures(this.selectedSeason, this.selectedBranch).then(resp => {
                console.log(resp);
                this.groups = resp.features as Feature[];
                this.rootId = resp.uniqueId;
                this.root = resp;
                this.loading = false;
                this.valid = true;
                this.resetFilters();
            });
            this.updateWhitelist(this.selectedSeason);
        }else{
            this.valid = false;
            this.groups = [];
            this.loading = false;
        }
    }


    public refreshTable() {
        console.log("refresh table");
        console.log(this.openFeatures);
        if(this.selectedSeason == null || this.selectedBranch == null){
            return;
        }
        this.loading = true;
        this._airLockService.getFeatures(this.selectedSeason,this.selectedBranch).then(resp =>{
            console.log(resp);
            this.groups = resp.features as Feature[];
            this.rootId=resp.uniqueId;
            this.root = resp;
            this.loading = false;
            this.valid = true;
        });
        this.updateWhitelist(this.selectedSeason);
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }
    public deleteFeature(feature:Feature) {
        this.loading = true;
        this._airLockService.deleteFeature(feature,this.selectedBranch).then(resp => {
            this.refreshTable();
        });
    }

    public changeStateHandler(feature:Feature) {
        console.log('in changeFeatureState():'+this._airLockService);
        this.loading = true;
        if (feature.stage=='PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage='PRODUCTION';
        }
        this._airLockService.updateFeature(feature, this.selectedBranch.uniqueId).then(resp => {
            this.refreshTable();
        });
    }
    /*
     public editFeature(feature:Feature, featurePath: Array<Feature>){
     this.editFeatureModal.open(feature,featurePath);
     }
     */

}

class Container {
    constructor(public id: number, public name: string, public widgets: Array<Widget>) {}
}

class Widget {
    constructor(public name: string) {}
}

