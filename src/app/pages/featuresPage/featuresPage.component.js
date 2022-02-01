"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeaturesPage = void 0;
var core_1 = require("@angular/core");
var animations_1 = require("@angular/animations");
var feature_1 = require("../../model/feature");
var airlock_service_1 = require("../../services/airlock.service");
var addFeatureModal_component_1 = require("../../theme/airlock.components/addFeatureModal/addFeatureModal.component");
var editFeatureModal_component_1 = require("../../theme/airlock.components/editFeatureModal/editFeatureModal.component");
var core_2 = require("@angular/core");
var transparentSpinner_service_1 = require("../../theme/airlock.components/transparentSpinner/transparentSpinner.service");
var reorderMXGroupModal_component_1 = require("../../theme/airlock.components/reorderMXGroupModal/reorderMXGroupModal.component");
var addFeatureToGroupModal_component_1 = require("../../theme/airlock.components/addFeatureToGroupModal/addFeatureToGroupModal.component");
var addConfigurationModal_component_1 = require("../../theme/airlock.components/addConfigurationModal/addConfigurationModal.component");
var global_state_1 = require("../../global.state");
var importFeaturesModal_component_1 = require("../../theme/airlock.components/importFeaturesModal/importFeaturesModal.component");
var verifyActionModal_component_1 = require("../../theme/airlock.components/verifyActionModal/verifyActionModal.component");
var wlAttributesModal_component_1 = require("../../theme/airlock.components/wlAttributesModal/wlAttributesModal.component");
var editInputSchemaModal_component_1 = require("../../theme/airlock.components/editInputSchemaModal/editInputSchemaModal.component");
var documentlinksModal_component_1 = require("../../theme/airlock.components/documentlinksModal/documentlinksModal.component");
var wlContextModal_component_1 = require("../../theme/airlock.components/wlContextModal/wlContextModal.component");
var featureUtils_service_1 = require("../../services/featureUtils.service");
var analyticsDisplay_1 = require("../../model/analyticsDisplay");
var verifyRemoveFromBranchModal_component_1 = require("../../theme/airlock.components/verifyRemoveFromBranchModal/verifyRemoveFromBranchModal.component");
var editUtilityModal_component_1 = require("../../theme/airlock.components/editUtilityModal/editUtilityModal.component");
var showEncryptionKeyModal_1 = require("../../theme/airlock.components/showEncryptionKeyModal");
var selectLocaleForRuntimeModal_1 = require("../../theme/airlock.components/selectLocaleForRuntimeModal");
var FeaturesPage = /** @class */ (function () {
    function FeaturesPage(_airLockService, _appState, _featureUtils, modal) {
        this._airLockService = _airLockService;
        this._appState = _appState;
        this._featureUtils = _featureUtils;
        this.modal = modal;
        this.checkModel = { left: false, middle: true, right: false };
        this.possibleUserGroupsList = [];
        this.valid = true;
        this.showConfig = true;
        this.showOrdering = true;
        this.showNotInBranch = true;
        this.showDevFeatures = true;
        this.showAdvancedSearch = false;
        this.filterlistDict = { string: [] };
        this.editDialogOpen = false;
        this.rootId = "";
        this.root = null;
        this.groups = [];
        this.loading = false;
        this.openFeatures = [];
        this.filteredFeatures = new Array();
        this.showDialog = false;
        this.searchQueryString = null;
        this.seasonSupportAnalytics = true;
        this.importExportSupport = true;
        this.selectedFeatureId = null;
        this.scrolledToSelected = false;
        this.selectedFeatureIndex = -1;
        this.staticMode = false;
        this.DUMMY_APP_MAX_VERSION = '100';
        this.status = { isopen: false };
        this.loading = true;
        this.staticMode = this._airLockService.isStaticMode();
        console.log("isStaticMode:" + this._airLockService.isStaticMode());
    }
    FeaturesPage_1 = FeaturesPage;
    FeaturesPage.prototype.setEditDialog = function (isOpen) {
        this.editDialogOpen = isOpen;
    };
    FeaturesPage.prototype.isShowPaste = function () {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer() && (this._airLockService.getCopiedFeature() != null);
    };
    FeaturesPage.prototype.reorder = function () {
        this.reorderMXGroupModal.open(this.selectedBranch, feature_1.Feature.clone(this.root), null, true);
    };
    FeaturesPage.prototype.onShowDocumentLinks = function () {
        console.log("ON Show Documents " + this.selectedSeason.name);
        this._documentLinksModal.open(this.selectedSeason.uniqueId, this.selectedSeason.platforms);
    };
    FeaturesPage.prototype.downloadRuntimeDefaults = function () {
        console.log("ON Select Locale for Runtime " + this.selectedSeason.name);
        console.log(this);
        this._selectLocaleForRuntimeModal.open(this.selectedSeason.uniqueId);
        // this._airLockService.downloadRuntimeDefaultFiles(this.selectedSeason.uniqueId);
    };
    FeaturesPage.prototype.isShowOptions = function () {
        if (this.selectedSeason == null) {
            return false;
        }
        return (!this._airLockService.isViewer());
    };
    FeaturesPage.prototype.isViewer = function () {
        return this._airLockService.isViewer();
    };
    FeaturesPage.prototype.onEditUtilities = function () {
        var _this = this;
        this.loading = true;
        this._airLockService.getUtilities(this.selectedSeason.uniqueId)
            .then(function (response) {
            console.log("utils");
            console.log(response);
            _this._editUtilityModal.open(response, _this.selectedSeason, "MAIN_UTILITY");
            _this.loading = false;
        })
            .catch(function (error) {
            _this.loading = false;
            var errorMessage = _this._airLockService.parseErrorMessage(error, "Failed to load utilities");
            _this._airLockService.notifyDataChanged("error-notification", errorMessage);
            // alert(`Failed to update product: ${error}`)
            // this._airLockService.notifyDataChanged("error-notification",`Failed to load utilities: ${error}`);
        });
    };
    FeaturesPage.prototype.onShowEncryptionKey = function () {
        var _this = this;
        this.loading = true;
        this._airLockService.getEncryptionKey(this.selectedSeason)
            .then(function (response) {
            _this.loading = false;
            var message = response.encryptionKey;
            _this.showKeyModal.open(message);
        })
            .catch(function (error) {
            _this.loading = false;
            var errorMessage = _this._airLockService.parseErrorMessage(error, "Failed retrieve encription key");
            _this._airLockService.notifyDataChanged("error-notification", errorMessage);
        });
    };
    FeaturesPage.prototype.onEditInputSchema = function (editMode) {
        var _this = this;
        if (editMode === void 0) { editMode = true; }
        this.loading = true;
        this._airLockService.getInputSchema(this.selectedSeason.uniqueId)
            .then(function (response) {
            console.log("inputschema");
            console.log(response);
            _this._editInputSchemaModal.open(response, _this.selectedSeason, editMode);
            _this.loading = false;
        })
            .catch(function (error) {
            _this.loading = false;
            var errorMessage = _this._airLockService.parseErrorMessage(error, "Failed to retrieve input schema");
            _this._airLockService.notifyDataChanged("error-notification", errorMessage);
            // alert(`Failed to update product: ${error}`)
        });
    };
    FeaturesPage.prototype.onShowContext = function () {
        var _this = this;
        console.log('in onShowContext');
        this.loading = true;
        this._airLockService.getAnalyticsGlobalDataCollection(this.selectedSeason.uniqueId, this.selectedBranch.uniqueId).then(function (result) {
            _this.analyticData = result;
            console.log('getAnalyticsGlobalDataCollection:');
            console.log(_this.analyticData);
            _this._airLockService.getInputSample(_this.selectedSeason.uniqueId, "DEVELOPMENT", _this.DUMMY_APP_MAX_VERSION).then(function (result) {
                _this.ruleInputSchemaSample = result;
                console.log('Input Schema Sample');
                console.log(_this.ruleInputSchemaSample);
                _this.wlContextModalConteinetDialog.open(_this.ruleInputSchemaSample, _this.analyticData, _this.selectedSeason, _this.selectedBranch);
                _this.loading = false;
            }).catch(function (error) {
                _this.loading = false;
                var errorMessage = _this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                _this._airLockService.notifyDataChanged("error-notification", errorMessage);
            });
        }).catch(function (error) {
            console.log('Error in getting UtilityInfo');
            _this.loading = false;
            var errorMessage = _this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            _this._airLockService.notifyDataChanged("error-notification", errorMessage);
        });
    };
    FeaturesPage.prototype.isShowImport = function () {
        if (!this.importExportSupport) {
            return false;
        }
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer();
    };
    FeaturesPage.prototype.isShowEditSchema = function () {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer() && !this._airLockService.isEditor();
    };
    FeaturesPage.prototype.isShowViewSchema = function () {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this.isShowEditSchema();
    };
    FeaturesPage.prototype.isShowEditUtil = function () {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airLockService.isViewer();
    };
    FeaturesPage.prototype.toggleDataCollectionDetails = function () {
        this.showDialog = !this.showDialog;
    };
    FeaturesPage.prototype.canImportExport = function () {
        return this._airLockService.canExportImport();
    };
    FeaturesPage.prototype.isSupportAnalytics = function () {
        if (!this._airLockService.canUseAnalytics()) {
            return false;
        }
        if (this.selectedSeason) {
            if (Number(this.selectedSeason.serverVersion) < FeaturesPage_1.SERVER_ANALYTICS_SUPPORT_VERSION)
                return false;
            else
                return true;
        }
        return false;
    };
    FeaturesPage.prototype.toggleTestExperiments = function () {
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
    };
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
    FeaturesPage.prototype.getWhitelistCount = function () {
        var count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.productionItemsReportedToAnalytics;
        }
        return count;
    };
    FeaturesPage.prototype.getWhitelistDevCount = function () {
        var count = 0;
        if (this.analyticDataForDisplay && this.analyticDataForDisplay.analyticsDataCollection) {
            count = this.analyticDataForDisplay.analyticsDataCollection.developmentItemsReportedToAnalytics;
        }
        return count;
    };
    FeaturesPage.prototype.updateWhitelist = function (currentSeason) {
        var _this = this;
        if (!currentSeason) {
            currentSeason = this.selectedSeason;
        }
        this.analyticDataForDisplay = new analyticsDisplay_1.AnalyticsDisplay();
        //this.whitelistBtn.nativeElement.setAttribute("data-count", 0);
        if (currentSeason && currentSeason.uniqueId) {
            if (Number(currentSeason.serverVersion) < FeaturesPage_1.SERVER_ANALYTICS_SUPPORT_VERSION || this.staticMode)
                return;
            this.analyticDataForDisplay = new analyticsDisplay_1.AnalyticsDisplay();
            this._airLockService.getAnalyticsForDisplay(currentSeason.uniqueId, this.selectedBranch.uniqueId).then(function (result) {
                _this.analyticDataForDisplay = result;
                _this.totalAnaliticsCount = _this.getWhitelistCount();
                _this.totalAnaliticsDevCount = _this.getWhitelistDevCount();
                //this.whitelistBtn.nativeElement.setAttribute("data-count", count);
                //if (count > FeaturesPage.WHITELIST_THRESHOLD) this.whitelistBtn.nativeElement.setAttribute("style", "background: red;");
            }).catch(function (error) {
                console.log('Error in getting UtilityInfo');
                _this.totalAnaliticsCount = 0;
                _this.totalAnaliticsDevCount = 0;
                //this._airLockService.notifyDataChanged("error-notification", "Failed to get Utilitystring");
            });
            this._airLockService.getQuota(currentSeason.uniqueId).then(function (result) {
                _this.totalAnaliticsQuota = result;
                _this.totalCountQuota = _this.totalAnaliticsQuota.analyticsQuota;
            }).catch(function (error) {
                console.log('Error in getting UtilityInfo');
                //this._airLockService.notifyDataChanged("error-notification", "Failed to get Utilitystring");
            });
        }
    };
    FeaturesPage.getCurrentProductFromBranch = function (products, currentBranch) {
        if (currentBranch) {
            console.log("branch's seasonID:" + currentBranch.seasonId);
            if (products.length > 0) {
                for (var _i = 0, products_1 = products; _i < products_1.length; _i++) {
                    var p = products_1[_i];
                    var currProd = p;
                    console.log(currProd.uniqueId);
                    console.log(currentBranch.seasonId);
                    if (p.seasons) {
                        for (var _a = 0, _b = p.seasons; _a < _b.length; _a++) {
                            var season = _b[_a];
                            if (season.uniqueId == currentBranch.seasonId) {
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
        }
        else {
            console.log("return null from getCurrentProductFromSeason");
            return null;
        }
    };
    FeaturesPage.getCurrentSeasonFromBranch = function (seasons, currentBranch) {
        if (currentBranch) {
            console.log("branch's seasonID:" + currentBranch.seasonId);
            if (seasons.length > 0) {
                for (var _i = 0, seasons_1 = seasons; _i < seasons_1.length; _i++) {
                    var s = seasons_1[_i];
                    var currSeason = s;
                    console.log(currentBranch.seasonId);
                    if (currSeason.uniqueId == currentBranch.seasonId) {
                        console.log("yay");
                        return currSeason;
                    }
                }
            }
        }
        if (seasons.length > 0) {
            console.log("return last");
            return seasons[seasons.length - 1];
        }
        else {
            console.log("return null from getCurrentSeasonFromBranch");
            return null;
        }
    };
    FeaturesPage.getCurrentProductFromSeason = function (products, currentSeason) {
        if (currentSeason) {
            console.log("trying to find products! - products:");
            console.log(products);
            console.log("season's productID:" + currentSeason.productId);
            if (products.length > 0) {
                console.log("products.length > 0!");
                for (var _i = 0, products_2 = products; _i < products_2.length; _i++) {
                    var p = products_2[_i];
                    var currProd = p;
                    console.log(currProd.uniqueId);
                    console.log(currentSeason.productId);
                    if (currProd.uniqueId == currentSeason.productId) {
                        console.log("yay");
                        return currProd;
                    }
                    else {
                        console.log("nah");
                    }
                }
            }
        }
        if (products.length > 0) {
            console.log("return first product");
            return products[0];
        }
        else {
            console.log("return null from getCurrentProductFromSeason");
            return null;
        }
    };
    FeaturesPage.getCurrentSeasonFromSeason = function (seasons, currentSeason) {
        if (currentSeason) {
            for (var _i = 0, seasons_2 = seasons; _i < seasons_2.length; _i++) {
                var s = seasons_2[_i];
                var currSeas = s;
                if (currSeas.uniqueId == currentSeason.uniqueId) {
                    return currSeas;
                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length - 1];
        }
        else {
            return null;
        }
    };
    FeaturesPage.prototype.ngOnInit = function () {
        var _this = this;
        if (this._airLockService.isCohortsMode()) {
            //get to cohorts page
            this._airLockService.redirectToFeaturesPage();
        }
        this.loading = false;
        var currProduct = this._appState.getData('features.currentProduct');
        this.selectedProduct = currProduct;
        var currSeason = this._appState.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        var currBranch = this._appState.getData('features.currentBranch');
        this.selectedBranch = currBranch;
        this._airLockService.setCapabilities(this.selectedProduct);
        if (this.selectedBranch) {
            this.onBranchSelection(this.selectedBranch);
        }
        console.log("got saved season!!!");
        this._appState.subscribe('features.currentSeason', 'features', function (season) {
            _this.selectedSeason = season;
        });
        this._appState.subscribe('features.currentProduct', 'features', function (product) {
            _this.selectedProduct = product;
        });
        this._appState.subscribe('features.currentBranch', 'features', function (branch) {
            _this.onBranchSelection(branch);
        });
    };
    FeaturesPage.prototype.ngOnDestroy = function () {
        this._appState.unsubcribe('features.currentSeason', 'features');
        this._appState.unsubcribe('features.currentProduct', 'features');
        this._appState.unsubcribe('features.currentBranch', 'features');
    };
    FeaturesPage.prototype.featureChangedStatus = function (featureID) {
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            this.openFeatures.splice(index, 1);
        }
        else {
            this.openFeatures.push(featureID);
        }
    };
    FeaturesPage.prototype.featureIsInFilter = function (featureID) {
        // this.filteredFeatures.add(featureID);
    };
    FeaturesPage.prototype.createFilteredList = function () {
        this.filteredFeatures = [];
        this.selectedFeatureId = null;
        this.scrolledToSelected = false;
        this.selectedFeatureIndex = -1;
        var term = this.searchQueryString;
        if (term && term.length > 0) {
            for (var _i = 0, _a = this.groups; _i < _a.length; _i++) {
                var feature = _a[_i];
                this.isFilteredOut(feature);
            }
            // jQuery('html, body').animate({scrollTop:700}, {duration:3.0});
        }
    };
    FeaturesPage.prototype.showNextSearchResult = function (forward) {
        if (this.filteredFeatures.length > 0) {
            if (forward) {
                if (this.selectedFeatureIndex >= (this.filteredFeatures.length - 1)) {
                    this.selectedFeatureIndex = 0;
                }
                else {
                    this.selectedFeatureIndex++;
                }
            }
            else {
                if (this.selectedFeatureIndex == 0) {
                    this.selectedFeatureIndex = this.filteredFeatures.length - 1;
                }
                else {
                    this.selectedFeatureIndex--;
                }
            }
            this.selectedFeatureId = this.filteredFeatures[this.selectedFeatureIndex];
            this.scrolledToSelected = false;
        }
    };
    FeaturesPage.prototype.featureIsSelected = function (featureObj) {
        if (featureObj.id && featureObj.id == this.selectedFeatureId && !this.scrolledToSelected) {
            var y = featureObj.offset;
            // jQuery('html, body').animate({scrollTop:y - 200}, {duration:3.0});
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    };
    FeaturesPage.prototype.checkIfInView = function (top) {
        var windowScroll = jQuery(window).scrollTop();
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
    };
    FeaturesPage.prototype.isPartOfSearch = function (term, feature) {
        if (!term || term == "") {
            return true;
        }
        var lowerTerm = term.toLowerCase();
        var displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        var fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";
        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    };
    FeaturesPage.prototype.shouldFeatureBeFilteredOut = function (feature) {
        if (!this.filterlistDict) {
            return false;
        }
        var keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        if (feature.type == 'MUTUAL_EXCLUSION_GROUP' || feature.type == 'CONFIG_MUTUAL_EXCLUSION_GROUP' || feature.type == 'ORDERING_RULE_MUTUAL_EXCLUSION_GROUP') {
            //if this is MTX - filter out unless some children are not filtered
            isFilteredOut = true;
        }
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            var valuesArr = this.filterlistDict[key];
            // console.log("values to filter out");
            // console.log(valuesArr);
            // console.log(feature[key]);
            if (feature[key] && valuesArr) {
                for (var _a = 0, valuesArr_1 = valuesArr; _a < valuesArr_1.length; _a++) {
                    var value = valuesArr_1[_a];
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        //now check if has children which are not being filtered out
        if (feature.features) {
            for (var _b = 0, _c = feature.features; _b < _c.length; _b++) {
                var subFeat = _c[_b];
                var isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.configurationRules) {
            for (var _d = 0, _e = feature.configurationRules; _d < _e.length; _d++) {
                var subFeat = _e[_d];
                var isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        if (feature.orderingRules) {
            for (var _f = 0, _g = feature.orderingRules; _f < _g.length; _f++) {
                var subFeat = _g[_f];
                var isFiltered = this.shouldFeatureBeFilteredOut(subFeat);
                if (!isFiltered) {
                    isFilteredOut = false;
                    break;
                }
            }
        }
        return isFilteredOut;
    };
    FeaturesPage.prototype.isFilteredOut = function (feature) {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldFeatureBeFilteredOut(feature)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        var hasSearchHit = this.isPartOfSearch(this.searchQueryString, feature);
        if (hasSearchHit) {
            this.filteredFeatures.push(feature.uniqueId);
        }
        if (feature.configurationRules) {
            for (var _i = 0, _a = feature.configurationRules; _i < _a.length; _i++) {
                var sub = _a[_i];
                this.isFilteredOut(sub);
            }
        }
        if (feature.orderingRules) {
            for (var _b = 0, _c = feature.orderingRules; _b < _c.length; _b++) {
                var sub = _c[_b];
                this.isFilteredOut(sub);
            }
        }
        if (feature.features) {
            for (var _d = 0, _e = feature.features; _d < _e.length; _d++) {
                var sub = _e[_d];
                this.isFilteredOut(sub);
            }
        }
        return !hasSearchHit;
    };
    FeaturesPage.prototype.isCellOpen = function (featureID) {
        // console.log("isCellOpen:"+featureID);
        var index = this.openFeatures.indexOf(featureID, 0);
        return index > -1;
    };
    FeaturesPage.prototype.setShowConfig = function (show) {
        this.showConfig = show;
        if (!this.filterlistDict["type"]) {
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(function (x) {
                return ((x != "CONFIG_MUTUAL_EXCLUSION_GROUP") && (x != "CONFIGURATION_RULE"));
            });
        }
        else {
            // this.filterlistDict["type"].push(["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"]);
            this.filterlistDict["type"].push("CONFIG_MUTUAL_EXCLUSION_GROUP");
            this.filterlistDict["type"].push("CONFIGURATION_RULE");
        }
        this.createFilteredList();
    };
    FeaturesPage.prototype.setShowOrdering = function (show) {
        console.log("show orderigng in feature page");
        this.showOrdering = show;
        if (!this.filterlistDict["type"]) {
            this.filterlistDict["type"] = [];
        }
        if (show) {
            this.filterlistDict["type"] = this.filterlistDict["type"].filter(function (x) {
                return ((x != "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") && (x != "ORDERING_RULE"));
            });
            console.log(this.filterlistDict["type"]);
        }
        else {
            this.filterlistDict["type"].push("ORDERING_RULE");
            this.filterlistDict["type"].push("ORDERING_RULE_MUTUAL_EXCLUSION_GROUP");
            console.log(this.filterlistDict["type"]);
        }
        this.createFilteredList();
    };
    FeaturesPage.prototype.setShowNotInBranch = function (show) {
        this.showNotInBranch = show;
        if (show || (this.selectedBranch && this.selectedBranch.uniqueId && this.selectedBranch.uniqueId.toLowerCase() == "master")) {
            this.filterlistDict["branchStatus"] = [];
        }
        else {
            this.filterlistDict["branchStatus"] = ["NONE"];
        }
        this.createFilteredList();
    };
    FeaturesPage.prototype.setShowDevFeatures = function (show) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        }
        else {
            this.filterlistDict["stage"] = ["development"];
        }
        this.createFilteredList();
    };
    FeaturesPage.prototype.setSelectedBranch = function (branch) {
        this.selectedBranch = branch;
        // this._appState.notifyDataChanged('features.currentSeason', this.selectedSeason);
    };
    FeaturesPage.prototype.onSearchQueryChanged = function (term) {
        var _this = this;
        if (term == null || term.length <= 0) {
            var gps = this.groups;
            var sseason_1 = this.selectedSeason;
            this.selectedSeason = null;
            // this.groups = [];
            this.loading = true;
            setTimeout(function () {
                // this.groups = gps;
                _this.selectedSeason = sseason_1;
                _this.loading = false, 0.5;
            });
        }
        this.filteredFeatures = [];
        this.searchQueryString = term;
        this.createFilteredList();
    };
    FeaturesPage.prototype.resetFilters = function () {
        this.filterlistDict = { string: [] };
        this.showDevFeatures = true;
        this.showNotInBranch = true;
        this.showConfig = true;
        this.showOrdering = true;
        this.createFilteredList();
    };
    FeaturesPage.prototype.onBranchSelection = function (branch) {
        var _this = this;
        if (this.selectedProduct) {
            this._airLockService.getUserGroups(this.selectedProduct).then(function (response) {
                console.log(response);
                _this.possibleUserGroupsList = response.internalUserGroups;
            });
        }
        this.setSelectedBranch(branch);
        if (branch != null && this.selectedSeason != null) {
            this.loading = true;
            this.seasonSupportAnalytics = this.isSupportAnalytics();
            this.importExportSupport = this.canImportExport();
            this._airLockService.getFeatures(this.selectedSeason, this.selectedBranch).then(function (resp) {
                console.log(resp);
                _this.groups = resp.features;
                _this.rootId = resp.uniqueId;
                _this.root = resp;
                _this.loading = false;
                _this.valid = true;
                _this.resetFilters();
            });
            this.updateWhitelist(this.selectedSeason);
        }
        else {
            this.valid = false;
            this.groups = [];
            this.loading = false;
        }
    };
    FeaturesPage.prototype.toggleAdvancedSearch = function () {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    };
    FeaturesPage.prototype.refreshTable = function () {
        var _this = this;
        console.log("refresh table");
        console.log(this.openFeatures);
        if (this.selectedSeason == null || this.selectedBranch == null) {
            return;
        }
        this.loading = true;
        this._airLockService.getFeatures(this.selectedSeason, this.selectedBranch).then(function (resp) {
            console.log(resp);
            _this.groups = resp.features;
            _this.rootId = resp.uniqueId;
            _this.root = resp;
            _this.loading = false;
            _this.valid = true;
        });
        this.updateWhitelist(this.selectedSeason);
    };
    FeaturesPage.prototype.beforeUpdate = function () {
        this.loading = true;
    };
    FeaturesPage.prototype.afterUpdate = function () {
        this.loading = false;
    };
    FeaturesPage.prototype.deleteFeature = function (feature) {
        var _this = this;
        this.loading = true;
        this._airLockService.deleteFeature(feature, this.selectedBranch).then(function (resp) {
            _this.refreshTable();
        });
    };
    FeaturesPage.prototype.changeStateHandler = function (feature) {
        var _this = this;
        console.log('in changeFeatureState():' + this._airLockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        }
        else {
            feature.stage = 'PRODUCTION';
        }
        this._airLockService.updateFeature(feature, this.selectedBranch.uniqueId).then(function (resp) {
            _this.refreshTable();
        });
    };
    var FeaturesPage_1;
    FeaturesPage.SERVER_ANALYTICS_SUPPORT_VERSION = 2.5;
    __decorate([
        core_2.ViewChild('editFeatureModal'),
        __metadata("design:type", editFeatureModal_component_1.EditFeatureModal)
    ], FeaturesPage.prototype, "editFeatureModal", void 0);
    __decorate([
        core_2.ViewChild('verifyActionModal'),
        __metadata("design:type", verifyActionModal_component_1.VerifyActionModal)
    ], FeaturesPage.prototype, "verifyActionModal", void 0);
    __decorate([
        core_2.ViewChild('showKeyModal'),
        __metadata("design:type", showEncryptionKeyModal_1.ShowEncryptionKeyModal)
    ], FeaturesPage.prototype, "showKeyModal", void 0);
    __decorate([
        core_2.ViewChild('verifyRemoveFromBranchModal'),
        __metadata("design:type", verifyRemoveFromBranchModal_component_1.VerifyRemoveFromBranchModal)
    ], FeaturesPage.prototype, "verifyRemoveFromBranchModal", void 0);
    __decorate([
        core_2.ViewChild('addFeatureModal'),
        __metadata("design:type", addFeatureModal_component_1.AddFeatureModal)
    ], FeaturesPage.prototype, "addFeatureModal", void 0);
    __decorate([
        core_2.ViewChild('importFeaturesModal'),
        __metadata("design:type", importFeaturesModal_component_1.ImportFeaturesModal)
    ], FeaturesPage.prototype, "importFeaturesModal", void 0);
    __decorate([
        core_2.ViewChild('addConfigurationModal'),
        __metadata("design:type", addConfigurationModal_component_1.AddConfigurationModal)
    ], FeaturesPage.prototype, "addConfigurationModal", void 0);
    __decorate([
        core_2.ViewChild('wlAttributesModalDialog'),
        __metadata("design:type", wlAttributesModal_component_1.wlAttributesModal)
    ], FeaturesPage.prototype, "wlAttributesModalDialog", void 0);
    __decorate([
        core_2.ViewChild('reorderMxGroupModal'),
        __metadata("design:type", reorderMXGroupModal_component_1.ReorderMXGroupModal)
    ], FeaturesPage.prototype, "reorderMXGroupModal", void 0);
    __decorate([
        core_2.ViewChild('addToMXGroupModal'),
        __metadata("design:type", addFeatureToGroupModal_component_1.AddFeatureToGroupModal)
    ], FeaturesPage.prototype, "addToMXGroupModal", void 0);
    __decorate([
        core_2.ViewChild('btn_whitelist'),
        __metadata("design:type", core_1.ElementRef)
    ], FeaturesPage.prototype, "whitelistBtn", void 0);
    __decorate([
        core_2.ViewChild('editInputSchemaModal'),
        __metadata("design:type", editInputSchemaModal_component_1.EditInputSchemaModal)
    ], FeaturesPage.prototype, "_editInputSchemaModal", void 0);
    __decorate([
        core_2.ViewChild('editUtilityModal'),
        __metadata("design:type", editUtilityModal_component_1.EditUtilityModal)
    ], FeaturesPage.prototype, "_editUtilityModal", void 0);
    __decorate([
        core_2.ViewChild('documentLinksModal'),
        __metadata("design:type", documentlinksModal_component_1.DocumentlinksModal)
    ], FeaturesPage.prototype, "_documentLinksModal", void 0);
    __decorate([
        core_2.ViewChild('selectLocaleForRuntimeModal'),
        __metadata("design:type", selectLocaleForRuntimeModal_1.SelectLocaleForRuntimeModal)
    ], FeaturesPage.prototype, "_selectLocaleForRuntimeModal", void 0);
    __decorate([
        core_2.ViewChild('pwlContextModalDialog'),
        __metadata("design:type", wlContextModal_component_1.wlContextModal)
    ], FeaturesPage.prototype, "wlContextModalConteinetDialog", void 0);
    FeaturesPage = FeaturesPage_1 = __decorate([
        core_1.Component({
            selector: 'featuresPage',
            providers: [transparentSpinner_service_1.TransparentSpinner, featureUtils_service_1.FeatureUtilsService],
            styles: [require('./featuresStyle.scss'), require('./sideNavStyle.scss')],
            template: require('./featuresPage.html'),
            animations: [
                animations_1.trigger('slideInOut', [
                    animations_1.state('in', animations_1.style({
                        transform: 'translate3d(0, 0, 0)'
                    })),
                    animations_1.state('out', animations_1.style({
                        transform: 'translate3d(100%, 0, 0)'
                    })),
                    animations_1.transition('in => out', animations_1.animate('400ms ease-in-out')),
                    animations_1.transition('out => in', animations_1.animate('400ms ease-in-out'))
                ]),
            ]
        }),
        __metadata("design:paramtypes", [airlock_service_1.AirlockService,
            global_state_1.GlobalState,
            featureUtils_service_1.FeatureUtilsService, Object])
    ], FeaturesPage);
    return FeaturesPage;
}());
exports.FeaturesPage = FeaturesPage;
var Container = /** @class */ (function () {
    function Container(id, name, widgets) {
        this.id = id;
        this.name = name;
        this.widgets = widgets;
    }
    return Container;
}());
var Widget = /** @class */ (function () {
    function Widget(name) {
        this.name = name;
    }
    return Widget;
}());
//# sourceMappingURL=featuresPage.component.js.map