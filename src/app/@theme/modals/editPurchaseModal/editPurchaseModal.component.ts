import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone, Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {Season} from "../../../model/season";
import * as $$ from "jquery";

import {FeatureUtilsService, InAppPurchaseInFlatList} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {Branch} from "../../../model/branch";
import {InAppPurchase} from "../../../model/inAppPurchase";
import {Rule} from "../../../model/rule";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {PurchaseCell} from "../../airlock.components/purchaseCell";
import {ConfigurationCell} from "../../airlock.components/configurationCell";
import {OrderCell} from "../../airlock.components/orderCell";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {GlobalState} from "../../../global.state";
import {AceExpandDialogType} from "../../../app.module";
import {AceModal} from "../aceModal/aceModal.component";
import {ConfirmActionModal} from "../confirmActionModal";
import {LayoutService} from "../../../@core/utils";
import {PurchasesPage} from "../../../pages/purchases";

@Component({
    selector: 'edit-purchase-modal',
    styleUrls: ['./editPurchaseModal.scss'],
    templateUrl: './editPurchaseModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditPurchaseModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;

    @ViewChild('general') generalTab;
    @ViewChild('hierarchyTab') hierarchyTab;
    @ViewChild('ruleTab') ruleTab;
    @ViewChild('configTab') configTab;
    @ViewChild('purchaseTab') purchaseTab;

    @Input() rootFeatuteGroups: Array<InAppPurchase>;
    @Input() root: InAppPurchase;
    @Input() rootId: string;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    purchasesPage: PurchasesPage = null;
    loading: boolean = false;
    parentFeatureInFlatList: Array<InAppPurchaseInFlatList> = [];
    selectedParent: InAppPurchaseInFlatList;
    season: Season;

    possibleGroupsList: Array<any> = [];
    feature: InAppPurchase;
    branch: Branch;
    @Output() onEditFeature = new EventEmitter<any>();
    @Output() onShowFeature = new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate: EventEmitter<any> = new EventEmitter();
    selectedSubFeatureToAdd: Feature = null;
    featurePath: Array<InAppPurchase> = [];
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    configTabActive: boolean = false;
    ruleTabActive: boolean = false;
    // private descriptionTabActive: boolean = false;
    premiumTabActive: boolean = false;
    private hirarchyTabActive: boolean = false;
    // private includedTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    private curExpandedIndex: number = 0;
    lastModificationDate: Date;
    featureCell: PurchaseCell = null;
    showConfiguration: boolean = false;
    purchasesForSelect: any[] = null;
    configurationCell: ConfigurationCell = null;
    inputSampleLoaded = false;
    minAppVersionForSample = "";
    configurationSchemaString: string;
    defaultConfigurationString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    originalFeature: InAppPurchase = null;
    sourceFeature: InAppPurchase = null;
    title: string;
    isOnlyDisplayMode: boolean = false;
    allowChangeParent: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    aceEditorConfigurationHeightForOrder: string = "48px";
    orderRules: Array<any> = [];
    possibleSubFeaturesToAdd: Array<Feature> = [];
    orderCell: OrderCell = null;
    inAppPurchases: InAppPurchase[] = [];
    selectedPurchase: InAppPurchase;
    private sub: any = null;
    modalWidth: String;
    modalHeight: String;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                @Optional() private modalRef: NbDialogRef<EditPurchaseModal>,
                private modalService: NbDialogService,
                private _appState: GlobalState) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.season = this._appState.getCurrentSeason();
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this.originalFeature = this.feature;
        this.isOpen = true;
        this.loading = false;
        this.setSelectedPurchaseFromFeature();
        this.title = this.getString("edit_purchase_title");
        if (this.isConfigurationRule()) {
            this.title = this.getString("edit_configuration_title");
            if (!this.feature.configuration || this.feature.configuration == "") {
                this.feature.configuration = "{}";
            }
            try {
                this.outputConfigurationString = this.stringify(JSON.parse(this.feature.configuration)); //this.stringify(this.feature.configuration, undefined, 4);
            } catch (e) {
                console.log(e);
                this.outputConfigurationString = this.feature.configuration;
            }
            if (this.outputConfigurationString == "{}") {
                this.outputConfigurationString = "{\n\t\n}";
            } else {
                this.outputConfigurationString = this.beautifyString(this.outputConfigurationString);
            }
            var contextSchema = {};
            if (this.sourceFeature && this.sourceFeature.configurationSchema) {
                contextSchema = this.sourceFeature.configurationSchema;
            }
            try {
                this.referenceSchemaString = this.stringify(contextSchema); //JSON.stringify(contextSchema, undefined, 4);
            } catch (e) {
                console.log(e);
            }
            if (this.referenceSchemaString == "{}") {
                this.referenceSchemaString = "{\n\t\n}";
            } else {
                this.referenceSchemaString = this.beautifyString(this.referenceSchemaString);
            }
            this.referenceOpen = false;
        } else {
            if (this.feature == null){
                return;
            }
            if (!this.feature.configurationSchema) {
                this.feature.configurationSchema = {};
            }
            if (!this.feature?.defaultConfiguration || this.feature?.defaultConfiguration == "") {
                this.feature.defaultConfiguration = "{}";
            }
            try {
                this.configurationSchemaString = this.stringify(this.feature.configurationSchema); //JSON.stringify(this.feature.configurationSchema, undefined, 4);
            } catch (e) {
                console.log(e);
            }

            if (this.configurationSchemaString == "{}") {
                this.configurationSchemaString = "{\n\t\n}";
            } else {
                this.configurationSchemaString = this.beautifyString(this.configurationSchemaString);
            }
            try {
                this.defaultConfigurationString = this.stringify(JSON.parse(this.feature.defaultConfiguration)); //JSON.stringify(this.feature.defaultConfiguration, undefined, 4);
            } catch (e) {
                console.log(e);
                this.defaultConfigurationString = this.feature.defaultConfiguration;
            }

            if (this.defaultConfigurationString == "{}") {
                this.defaultConfigurationString = "{\n\t\n}";
            } else {
                this.defaultConfigurationString = this.beautifyString(this.defaultConfigurationString);
            }
        }
        if (this.isOrderRule()) {
            console.log("is order rule");
            console.log(this.feature.configuration);
            console.log("is order rule ddd");
            this.title = this.getString("edit_ordering_rule_title");
            this.orderRules = this.parseOrderRules(this.feature.configuration);
            // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
            this.updatemapSubFeaturesIdsToOrderIndex();
            console.log(this.orderRules);
        }
        let canChangeParent = !(this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        let notInBranch = this.branch.uniqueId.toLowerCase() != "master" && this.feature.branchStatus == "NONE";
        this.isOnlyDisplayMode = (notInBranch || this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        this.allowChangeParent = canChangeParent && notInBranch;
        //change dates to better format
        this.creationDate = new Date(this.feature.creationDate);
        this.lastModificationDate = new Date(this.feature.lastModified);
        this.parentFeatureInFlatList = this._featureUtils.getPossiblePurchaseParentsInFlatList(this.rootFeatuteGroups, this.rootId);

        var curFeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList, this.feature.uniqueId);
        if (curFeatureInFlatList == null) {
            this.selectedParent = null;
        } else {
            if (curFeatureInFlatList.parent != null) {
                this.selectedParent = this._featureUtils.getInAppPurchaseInFlatListById(this.parentFeatureInFlatList, curFeatureInFlatList.parent.uniqueId);
            } else { //set parent to root
                this.selectedParent = this.parentFeatureInFlatList[0];
            }
        }

        //create groups combo box with tags
        setTimeout(() => {
            // var $exampleMulti = $$(".js_example").select2(
            //     {
            //         tags: true,
            //         tokenSeparators: [',', ' ']
            //     }
            // );
            // $$('.numberInput').on(
            //     'change',
            //     (e) => {
            //         $$('.numberInput').val(parseFloat($$('.numberInput').val()).toFixed(4));
            //         this.feature.rolloutPercentage = $$('.numberInput').val();
            //         //$$('.numberInput').mask('000.0000', { reverse: true });
            //     }
            // );
            // $$('.js_example').on(
            //     'change',
            //     (e) => {
            //         if (this.feature != null) {
            //             this.feature.internalUserGroups = jQuery(e.target).val();
            //         }
            //     }
            // );
            // $exampleMulti.val(this.feature.internalUserGroups).trigger("change");
            // $$('.numberInput').trigger("change");
        }, 100);

        console.log("this.sourceFeature");
        console.log(this.sourceFeature);
        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth= LayoutService.calculateModalWidth();

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.showConfiguration) {
                    this.generalTabActive = false;
                    this.hirarchyTabActive = false;
                    this.ruleTabActive = false;
                    this.configTabActive = true;
                    this.premiumTabActive = false;
                } else {
                    this.generalTabActive = true;
                    this.hirarchyTabActive = false;
                    this.ruleTabActive = false;
                    this.configTabActive = false;
                    this.premiumTabActive = false;
                }
                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowFeature.emit(true);
                // this.modal.open('lg');
            });
        }
    }

    initAfterClose() {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }

        this.feature = null;
        this.configurationCell = null;
        this.orderCell = null;
        this.featureCell = null;
        this.generalTabActive = true;
        this.configTabActive = false;
        this.ruleTabActive = false;
        this.hirarchyTabActive = false;
        // this.includedTabActive = false;
        this.isShowHirarchy = false;
        this.orderRules = [];
        this.possibleSubFeaturesToAdd = [];
        this.selectedSubFeatureToAdd = null;

    }

    isConfigMode() {
        return (this.feature && this.feature.type == "CONFIGURATION_RULE")
    }

    isValid() {
        if (this.feature.name == null || this.feature.name.length == 0) {
            return "name and namespace are required";
        }
        if (this.feature.namespace == null || this.feature.namespace.length == 0) {
            return "name and namespace are required";
        }
        if (this.feature.minAppVersion) {
            this.feature.minAppVersion = this.feature.minAppVersion.trim();
        }
        if (this.feature.stage == "PRODUCTION" && !this.feature.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }

        try {
            // var minFeature = Number(this.feature.minAppVersion);
            // var maxSeason = Number(this.season.maxVersion);
            // if(maxSeason != null && minFeature != null){
            //     if(maxSeason != 0 && maxSeason < minFeature){
            //         return this.getString("edit_feature_error_min_feature_bigger_max_version");
            //     }
            // }
            if (this._isMinVersionGreaterThanMaxSeason()) {
                return this.getString("edit_feature_error_min_feature_bigger_max_version");
            }
        } catch (e) {
            console.log("ERROR:" + e);
        }
        return "";
    }

    _isMinVersionGreaterThanMaxSeason(): boolean {
        if (!this.season.maxVersion || this.season.maxVersion == "" || this.season.maxVersion == "0" ||
            !this.feature.minAppVersion || this.feature.minAppVersion == "") {
            return false;
        }
        var minAppArr = this.feature.minAppVersion.split('.');
        var maxSeasonArr = this.season.maxVersion.split('.');
        let maxNum = Math.max(minAppArr.length, maxSeasonArr.length);
        for (var i = 0; i < maxNum; i++) {
            var minAppNum = 0;
            if (i < minAppArr.length) {
                minAppNum = Number(minAppArr[i]);
            }
            var maxSeasonNum = 0;
            if (i < maxSeasonArr.length) {
                maxSeasonNum = Number(maxSeasonArr[i]);
            }
            if (!maxSeasonNum || !minAppNum || maxSeasonNum == null || minAppNum == null) {
                return false;
            }

            if (minAppNum > maxSeasonNum) {
                return true;
            } else if (minAppNum < maxSeasonNum) {
                return false;
            }
        }
        return true;
    }

    removeDuplicateSon(item: InAppPurchase, parentId: string, itemId: string) {
        if (item.uniqueId === parentId) {
            for (var i = 0; i < item.entitlements.length; ++i) {
                if (item.entitlements[i].uniqueId == itemId) {
                    item.entitlements.splice(i, 1);
                    return;
                }
            }
        } else {
            item.entitlements.forEach((curSon) => {
                    this.removeDuplicateSon(curSon, parentId, itemId);
                }
            );
        }
    }

    validate() {

    }

    getTypeAsString(): string {
        if (this.isConfigMode()) {
            return "configuration";
        } else {
            return "entitlement";
        }
    }

    save() {
        var validError: string = this.isValid();
        if (validError.length == 0) {
            if (this.feature.stage == 'DEVELOPMENT' && (this.feature.internalUserGroups == null || this.feature.internalUserGroups.length <= 0)) {
                let message = 'This ' + this.getTypeAsString() + ' will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed){
                        this._save();
                    }
                });
            } else {
                if (this.feature.stage == 'PRODUCTION') {
                    var textCode = "edit_change_production_entitlement";
                    var dialogType = VerifyDialogType.ENTITELMENT_TYPE;
                    if (this.isOrderRule()) {
                        textCode = "edit_change_production_ordering_rule";
                        dialogType = VerifyDialogType.ORDERING_RULE_TYPE;
                    } else {
                        if (this.isConfigMode()) {
                            textCode = "edit_change_production_configuration";
                            dialogType = VerifyDialogType.CONFIGURATION_TYPE;
                        }
                    }
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            feature: this.feature,
                            text: this._stringsSrevice.getString(textCode),
                            verifyModalDialogType: dialogType,
                        }
                    }).onClose.subscribe(confirmed => {
                        if (confirmed){
                            this._save();
                        }
                    });
                } else {
                    this._save();
                }
            }
        } else {
            this.create(validError);
        }
    }

    deleteOrderRule(id: string) {
        this.orderRules = this.orderRules.filter(x => x.id != id);
        // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
        this.updatemapSubFeaturesIdsToOrderIndex();
    }

    private mapSubFeaturesIdsToOrderIndex: any = {};
    private isShowSubFeatures: any = {};

    updatemapSubFeaturesIdsToOrderIndex() {
        let mapIdsToNames = {};
        let showIds = {};
        for (var i = 0; i < this.sourceFeature.entitlements.length; ++i) {
            mapIdsToNames[this.sourceFeature.entitlements[i].uniqueId] = -1;
            showIds[this.sourceFeature.entitlements[i].uniqueId] = false;
        }
        for (var i = 0; i < this.orderRules.length; ++i) {
            mapIdsToNames[this.orderRules[i]["id"]] = i;
            showIds[this.orderRules[i]["id"]] = true;
        }
        this.isShowSubFeatures = showIds;

        this.mapSubFeaturesIdsToOrderIndex = mapIdsToNames;
    }

    getFilterExisitngSubFeature() {
        console.log("getFilterExisitngSubFeature");
        let mapIdsToNames = {};
        for (var i = 0; i < this.orderRules.length; ++i) {
            mapIdsToNames[this.orderRules[i]["id"]] = true;
        }
        console.log(mapIdsToNames);
        return this.sourceFeature.entitlements.filter(x => {
            console.log(x.uniqueId);
            return (mapIdsToNames[x.uniqueId] == null)
        });
    }

    getOrderRulesAsJsonObjedct(): string {
        var retObj = {};
        console.log("getOrderRulesAsJsonObjedct");
        console.log(this.orderRules);
        for (var i = 0; i < this.orderRules.length; ++i) {
            let item: any = this.orderRules[i];
            let id: string = item.id;
            let value = item.value;
            // retObj[id] = "@" + value.replace(/"/g, '#') + "@";
            retObj[id] = value;
            console.log(retObj[id]);
        }
        console.log("retObj");
        console.log(retObj);
        // return this.stringify(retObj).replace(new RegExp("\"@", 'g'),"").replace(new RegExp("@\"", 'g'),"").replace(/\\#/g, '\"').replace(/#/g, '"');
        return this.stringify(retObj);

    }

    isOrderRulesValid(): boolean {

        for (var i = 0; i < this.orderRules.length; ++i) {
            let item: any = this.orderRules[i];
            let id: string = item.id;
            let value = item.value;
            if (value == null || value.length == 0) {
                return false;
            }
        }
        return true;
    }

    _save() {
        this.loading = true;
        if (!this.isOnlyDisplayMode) {
            this.feature.additionalInfo = {};
            if (!this.feature.internalUserGroups) {
                this.feature.internalUserGroups = [];
            }
        }

        if (this.isConfigurationRule()) {
            if (this.feature.configuration) {
                try {
                    this.feature.configuration = this.outputConfigurationString;
                } catch (e) {
                    console.log(e);
                    e._body = "Invalid json of configuration ";
                    this.handleError(e);
                    return;
                }

            }


        } else {
            if (this.isOrderRule()) {
                if (this.feature.configuration) {
                    try {
                        if (!this.isOrderRulesValid()) {
                            this.loading = false;
                            this.create(this.getString("edit_feature_empty_ordering_rule_value_error"));
                            return;
                        } else {
                            this.feature.configuration = this.getOrderRulesAsJsonObjedct();
                            console.log(this.feature.configuration);
                        }
                    } catch (e) {
                        console.log(e);
                        e._body = "Invalid json of configuration ";
                        this.handleError(e);
                        return;
                    }

                }


            } else {
                try {
                    if (!this.isOnlyDisplayMode) {
                        if (this.defaultConfigurationString == "{}" || this.defaultConfigurationString == "" || this.defaultConfigurationString == "{\n\t\n}") {
                            this.feature.defaultConfiguration = null;
                        } else {
                            this.feature.defaultConfiguration = this.defaultConfigurationString;
                        }
                    }

                } catch (e) {
                    console.log(e);
                    e._body = "Invalid json of default configuration ";
                    this.handleError(e);
                    return;
                }

                try {
                    if (!this.isOnlyDisplayMode) {
                        if (this.configurationSchemaString == "{}" || this.configurationSchemaString == "" || this.configurationSchemaString == "{\n\t\n}") {
                            this.feature.configurationSchema = null;
                        } else {
                            this.feature.configurationSchema = JSON.parse(this.configurationSchemaString);
                        }
                    }

                } catch (e) {
                    console.log(e);
                    e._body = "Invalid json of configuration schema";
                    this.handleError(e);
                    return;
                }
            }
        }
        var featureToUpdate: InAppPurchase = this.feature;

        if (this.selectedParent == null || this.selectedParent.feature.uniqueId == null) {
            this.feature.parent = null;
        } else {
            var curFeatureInFlatList: InAppPurchaseInFlatList = this._featureUtils.getInAppPurchaseInFlatListById(this.parentFeatureInFlatList, this.feature.uniqueId);
            if ((curFeatureInFlatList.parent == null && this.selectedParent.feature != null && this.selectedParent.feature.uniqueId != this.rootId) || (curFeatureInFlatList.parent != null && curFeatureInFlatList.parent.uniqueId != this.selectedParent.feature.uniqueId)) {
                featureToUpdate = this.selectedParent.feature;
                var newSonFeature = this.feature;
                if (!this.isOnlyDisplayMode) {
                    newSonFeature.rolloutPercentage = Number(newSonFeature.rolloutPercentage);
                } else {
                    newSonFeature = this.originalFeature;
                }
                this._airLockService.getInAppPurchase(featureToUpdate.uniqueId, this.branch.uniqueId).then(result => {
                    featureToUpdate = result;
                    if (curFeatureInFlatList.parent != null) {
                        this.removeDuplicateSon(featureToUpdate, curFeatureInFlatList.parent.uniqueId, curFeatureInFlatList.feature.uniqueId);
                    }
                    featureToUpdate.entitlements.push(newSonFeature);
                    this._airLockService.updateInAppPurchase(featureToUpdate, this.branch.uniqueId).then(() => {
                        this.loading = false;
                        //reload needed since we moved it in the tree
                        this.onEditFeature.emit(null);
                        this.outputEventWhiteListUpdate.emit(this.season);
                        this.purchasesPage?.refreshTable();
                        this.close()
                    }).catch(error => {
                        this.loading = false;
                        this.handleError(error);
                    });
                }).catch(error => {
                    this.loading = false;
                    this.handleError(error);
                });
                return;
            }

        }
        featureToUpdate.rolloutPercentage = Number(featureToUpdate.rolloutPercentage);
        this._airLockService.updateInAppPurchase(featureToUpdate, this.branch.uniqueId).then(result => {
            this.loading = true;
            if (this.featureCell != null) {
                this.featureCell.updateFeature(result);
            } else {
                if (this.configurationCell != null) {
                    this.configurationCell.updateFeature(result);
                } else {
                    if (this.orderCell != null) {
                        this.loading = false;
                        this.orderCell.updateFeature(result);
                    } else {
                        this.onEditFeature.emit(null);
                    }
                }
            }
            this.purchasesPage?.refreshTable();
            this.outputEventWhiteListUpdate.emit(this.season);
            this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            var fnBody;
            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    };

    beautifyString(str: string) {
        var toRet = "";
        var tabCount = 0;
        var inStringContext = false;
        var latestStringChar = null;
        for (var i = 0, len = str.length; i < len; i++) {
            let curr = str[i];

            if (inStringContext) {
                // do not add tabs and new lines if inside a string
                toRet += curr;
                if (curr == latestStringChar) {
                    inStringContext = false;
                    latestStringChar = null;
                }
            } else if (curr == "\"" /*|| curr=="\'"*/) {
                toRet += curr;
                inStringContext = true;
                latestStringChar = curr;
            } else if (curr == "{") {
                toRet += "{";
                toRet += "\n";
                tabCount++;
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == ",") {
                toRet += ",";
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == "}") {
                tabCount--;
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
                toRet += "}"
            } else if (curr == "\n" || curr == '\t') {
                //do not add the new lines or tabs we come with
            } else {
                toRet += curr;
            }
        }
        return toRet;
    }

    isConfigurationRule() {
        return (this.feature != null && this.feature.type === "CONFIGURATION_RULE");
    }

    isOrderRule() {
        return (this.feature != null && this.feature.type === "ORDERING_RULE");
    }

    getSubFeaturesOrder() {

    }

    handleError(error: any) {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editFeatureModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    parseErrorMessage(error: any): string {
        var errorMessage = error._body || "Request failed, try again later.";
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }


        return errorMessage;
    }

    close() {
        this.isOpen = false;
        this.onShowFeature.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }

    getMapNameForIdsForSubFeatures() {
        var map = {}
        for (var i = 0; i < this.sourceFeature.entitlements.length; ++i) {
            let subFeature: InAppPurchase = this.sourceFeature.entitlements[i];
            let id: string = subFeature.uniqueId;
            map[id] = subFeature.name;
        }
        return map;
    }

    convertConfigurationIntoJson(order: string, mapIds: any) {
        var places = [];
        for (let id in mapIds) {
            if (mapIds.hasOwnProperty(id)) {
                let place = order.indexOf(id);
                if (place > -1) {
                    places.push({"id": id, "place": place});
                }
            }
        }
        places.sort((a, b): number => {
            return a.place - b.place;
        });
        var retObj = {};
        var i = 0;
        for (; i < places.length; ++i) {
            let startIndex = order.indexOf(":", places[i].place);
            var endIndex = 0;
            if (i < places.length - 1) {
                let endPlace = places[i + 1].place;
                endIndex = order.lastIndexOf(",", endPlace);

            } else {
                endIndex = order.lastIndexOf("}");
            }
            retObj[places[i].id] = order.substr(startIndex + 1, endIndex - startIndex - 1);
        }
        return retObj;
    }

    parseOrderRules(order: string): Array<any> {
        try {
            let mapIdsToNames = this.getMapNameForIdsForSubFeatures();
            var arr: Array<any> = [];
            // var orderOutputJson = this.convertConfigurationIntoJson(order,mapIdsToNames);//this.stringify(this.feature.configuration, undefined, 4);
            var orderOutputJson = JSON.parse(order); //this.stringify(this.feature.configuration, undefined, 4);
            for (let id in orderOutputJson) {
                if (orderOutputJson.hasOwnProperty(id)) {
                    let value = orderOutputJson[id];
                    arr.push({"id": id, "name": mapIdsToNames[id], "value": value});
                }
            }
            return arr;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    selectFeatureToAdd(item: InAppPurchase) {
        this.selectedSubFeatureToAdd = item;
    }

    addNewSubFeatureOrder(selectedSubFeatureToAdd: Feature, group) {
        this.orderRules.push({
            "id": selectedSubFeatureToAdd.uniqueId,
            "name": selectedSubFeatureToAdd.name,
            "value": ""
        });
        // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
        // this.selectedSubFeatureToAdd = null;
        this.updatemapSubFeaturesIdsToOrderIndex();
        setTimeout(() => {
            group.isOpen = true;
            this.isShowSubFeatures[selectedSubFeatureToAdd.uniqueId] = true, 0.5
        });


        // this.selectFeatureToAdd(null)
    }

    open(branch: Branch, feature: InAppPurchase, purchasesRoot: InAppPurchase, featurePath: Array<InAppPurchase>, strInputSchemaSample: string, strUtilitiesInfo: string, featureCell: PurchaseCell = null,
         configurationCell: ConfigurationCell = null, showConfiguration: boolean = false, sourceFeature: InAppPurchase = null, orderCell: OrderCell = null,
         inAppPurchases: InAppPurchase[] = []) {
        this.modalHeight = 'none';
        this.modalWidth= 'none';
        this.inlineMode = true;
        this.originalFeature = feature;
        this.isOpen = true;
        this.loading = false;
        this.branch = branch;
        this.featurePath = featurePath;
        this.root = purchasesRoot;
        this.inAppPurchases = inAppPurchases;
        this.feature = InAppPurchase.clone(feature);
        this.setSelectedPurchaseFromFeature();
        this.title = this.getString("edit_purchase_title");
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.featureCell = featureCell;
        this.configurationCell = configurationCell;
        this.orderCell = orderCell;
        this.sourceFeature = sourceFeature;
        if (this.isConfigurationRule()) {
            this.title = this.getString("edit_configuration_title");
            if (!this.feature.configuration || this.feature.configuration == "") {
                this.feature.configuration = "{}";
            }
            try {
                this.outputConfigurationString = this.stringify(JSON.parse(this.feature.configuration));//this.stringify(this.feature.configuration, undefined, 4);
            } catch(e) {
                console.log(e);
                this.outputConfigurationString = this.feature.configuration;
            }
            if (this.outputConfigurationString == "{}") {
                this.outputConfigurationString = "{\n\t\n}";
            } else {
                this.outputConfigurationString = this.beautifyString(this.outputConfigurationString);
            }
            var contextSchema = {};
            if (sourceFeature && sourceFeature.configurationSchema) {
                contextSchema = sourceFeature.configurationSchema;
            }
            try {
                this.referenceSchemaString = this.stringify(contextSchema);
            } catch(e) {
                console.log(e);
            }
            if (this.referenceSchemaString == "{}") {
                this.referenceSchemaString = "{\n\t\n}";
            } else {
                this.referenceSchemaString = this.beautifyString(this.referenceSchemaString);
            }
            this.referenceOpen =  false;
        } else {
            if (!this.feature.configurationSchema) {
                this.feature.configurationSchema = {};
            }
            if (!this.feature.defaultConfiguration || this.feature.defaultConfiguration == "") {
                this.feature.defaultConfiguration = "{}";
            }
            try {
                this.configurationSchemaString = this.stringify(this.feature.configurationSchema);
            } catch(e) {
                console.log(e);
            }

            if (this.configurationSchemaString == "{}") {
                this.configurationSchemaString = "{\n\t\n}";
            } else {
                this.configurationSchemaString = this.beautifyString(this.configurationSchemaString);
            }
            try {
                this.defaultConfigurationString = this.stringify(JSON.parse(this.feature.defaultConfiguration));//JSON.stringify(this.feature.defaultConfiguration, undefined, 4);
            }catch(e){
                console.log(e);
                this.defaultConfigurationString = this.feature.defaultConfiguration;
            }

            if (this.defaultConfigurationString == "{}") {
                this.defaultConfigurationString = "{\n\t\n}";
            } else {
                this.defaultConfigurationString = this.beautifyString(this.defaultConfigurationString);
            }
        }
        if(this.isOrderRule()){
            console.log("is order rule");
            console.log(this.feature.configuration);
            console.log("is order rule ddd");
            this.title = this.getString("edit_ordering_rule_title");
            this.orderRules = this.parseOrderRules(this.feature.configuration);
            // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
            this.updatemapSubFeaturesIdsToOrderIndex();
            console.log(this.orderRules);
        }
        let canChangeParent = !(this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        let notInBranch = branch.uniqueId.toLowerCase() != "master" && this.feature.branchStatus == "NONE";
        this.isOnlyDisplayMode = (notInBranch || this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        this.allowChangeParent = canChangeParent && notInBranch;
        //change dates to better format
        this.creationDate= new Date(this.feature.creationDate);
        this.lastModificationDate = new Date(this.feature.lastModified);
        this.parentFeatureInFlatList = this._featureUtils.getPossiblePurchaseParentsInFlatList(this.rootFeatuteGroups, this.rootId);

        var curFeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList, feature.uniqueId);
        if (curFeatureInFlatList == null) {
            this.selectedParent = null;
        } else {
            if (curFeatureInFlatList.parent != null) {
                this.selectedParent = this._featureUtils.getInAppPurchaseInFlatListById(this.parentFeatureInFlatList,curFeatureInFlatList.parent.uniqueId);
            } else { //set parent to root
                this.selectedParent = this.parentFeatureInFlatList[0];
            }
        }

        this.loaded = true;

        if (showConfiguration) {
            this.ruleTabActive = false;
            this.hirarchyTabActive = false;
            this.generalTabActive = false;
            this.configTabActive = true;
        } else {
            this.ruleTabActive = false;
            this.hirarchyTabActive = false;
            this.configTabActive = false;
            this.generalTabActive = true;
        }
        if (this.aceModalContainerDialog){
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        this.onShowFeature.emit(true);
    }

    setSelectedPurchaseFromFeature() {
        if (this.feature?.entitlement && this.feature?.entitlement.length > 0) {
            let selected = null;
            if (this.inAppPurchases) {
                for (var purchase of this.inAppPurchases) {
                    if (purchase.uniqueId == this.feature.entitlement) {
                        this.selectedPurchase = purchase;
                        return;
                    }
                }
                this.selectedPurchase = null;
            }
        } else {
            this.selectedPurchase = null;
        }
    }

    setIsPremium(event) {
        this.feature.premium = event;
        if (this.feature.premium && !this.feature.premiumRule) {
            this.feature.premiumRule = new Rule();
            this.feature.premiumRule.ruleString = "";
        } else {
            this.feature.entitlement = null;
        }
    }

    selectParent(parent: InAppPurchaseInFlatList) {
        if (parent.feature.uniqueId != this.feature.uniqueId) {
            if (!this._featureUtils.isContainCycle(parent.feature, this.feature.entitlements)) {
                this.selectedParent = parent;
            } else {
                alert("Can't set feature parent to the feature which is his son");
            }
        } else {
            alert("Can't set feature parent to the feature itself");
        }

    }

    showHirarchy() {
        this.isShowHirarchy = true;
    }

    selectNewParent(parent: InAppPurchase) {
        this.selectedParent = this._featureUtils.getInAppPurchaseInFlatListById(this.parentFeatureInFlatList, parent.uniqueId);
    }

    ruleUpdated(event) {
        this.feature.rule.ruleString = event;
    }

    premiumRuleUpdated(event) {
        if (this.feature.premiumRule) {
            this.feature.premiumRule.ruleString = event;
        }
    }

    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }

    orderRuleUpdated(event) {
        console.log("schema updated with event:" + event)
        this.orderRules[this.curExpandedIndex].value = event;
    }

    defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }

    outputOrderRuleUpdated(event, index) {
        this.orderRules[index].value = event;
    }

    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.363ue557y7d0');
    }

    showConfigurationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.igpio3q4s3ui');
    }

    showOrderingRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.p8mht5pcwz9u');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    /////////////////////////////////////////
    //notifications stuff
    public options = {
        timeOut: 0,
        lastOnBottom: true,
        clickToClose: true,
        maxLength: 0,
        maxStack: 7,
        showProgressBar: true,
        pauseOnHover: true,
        preventDuplicates: false,
        preventLastDuplicates: "visible",
        rtl: false,
        animate: "scale",
        position: ["right", "bottom"]
    };


    create(message: string) {
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    openAceEditorRuleExpand() {
        var expandDialogTitle = this.title + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.feature.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorPremiumRuleExpand() {
        var expandDialogTitle = this.title + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.feature.premiumRule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_PREMUIM_RULE, this.isOnlyDisplayMode || !this.feature.premium);
    }

    openAceEditorConfigurationSchemaExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.configurationSchemaString, expandDialogTitle, "", "", AceExpandDialogType.CONFIG_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorDefaultConfigurationExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_default_configuration_edit_title') + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.defaultConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.DEFAULT_CONFIG, this.isOnlyDisplayMode);
    }

    openAceEditorReferenceSchemaExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.referenceSchemaString, expandDialogTitle, "", "", AceExpandDialogType.REFERENCE_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorOrderRuleExpand(index: number) {
        this.curExpandedIndex = index;
        var expandDialogTitle = this.getString('edit_feature_ordering_rule_tab_heading') + " - " + this.orderRules[index].name;
        this.aceModalContainerDialog.showAceModal(this.orderRules[index].value, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorOutputConfigurationExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_tab_heading') + " - " + this.feature.namespace + "." + this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.outputConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.OUTPUT_CONFIG, this.isOnlyDisplayMode);
    }

    openWhiteListEditor() {
        console.log('Open White List');
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    selectPurchase(purchase: InAppPurchase) {
        this.loading = true;

        this.selectedPurchase = purchase;
        this.feature.entitlement = purchase.uniqueId;
        this.loading = false;
    }

    getPurchasesForSelect(): any[] {
        var toRet = [];
        if (this.selectedPurchase) {
            let selected = {id: this.selectedPurchase, text: this.getPurchaseDisplayName(this.selectedPurchase)};
            toRet.push(selected);
        }
        if (this.inAppPurchases) {
            for (var purchase of this.inAppPurchases) {
                if (this.selectedPurchase == null || purchase.uniqueId != this.selectedPurchase.uniqueId) {
                    let productObj = {
                        id: purchase,
                        text: this.getPurchaseDisplayName(purchase)
                    };
                    toRet.push(productObj);
                }
            }
        }
        return toRet;
    }

    getPurchaseDisplayName(purchase: InAppPurchase) {
        return this._featureUtils.getFeatureDisplayName(purchase);
    }

    selectPurchaseFromSelect(purchaseObj: any) {
        if (purchaseObj) {
            if (purchaseObj.id && purchaseObj.id != this.selectedPurchase) {
                this.selectPurchase(purchaseObj.id);
            }
        }
        this.selectedPurchase = null;
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

    tabSelected(event: any) {
        if (event.tabTitle == 'Hierarchy'){
            this.isShowHirarchy = true;
        }
    }

    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.hirarchyTabActive = false;
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.premiumTabActive = false;
                break;
            // this.generalTab.nativeElement.scrollIntoView({behavior: 'smooth'});
            case  'Hierarchy':
                this.generalTabActive = false;
                this.hirarchyTabActive = true;
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.premiumTabActive = false;
                break;
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.hirarchyTabActive = false;
                this.ruleTabActive = true;
                this.configTabActive = false;
                this.premiumTabActive = false;
                break;
            case  'Configuration':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.hirarchyTabActive = false;
                this.ruleTabActive = false;
                this.configTabActive = true;
                this.premiumTabActive = false;
                break;
            case  'Bundle':
                this.loadPremiumIfNeeded();
                this.generalTabActive = false;
                this.hirarchyTabActive = false;
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.premiumTabActive = true;
                break;
        }
    }

    loadPremiumIfNeeded() {
        if (this.inAppPurchases == null) {
            this.loadInAppPurchases();
        } else if (!this.purchasesForSelect) {
            this.purchasesForSelect = this.getPurchasesForSelect();
            this.loadAutoCompleteIfNeeded();
        }
    }

    loadInAppPurchases() {
        this.loading = true;
        this._airLockService.getInAppPurchases(this.branch.seasonId, this.branch).then(purchasesResult => {
            let purchases: InAppPurchase[] = purchasesResult.entitlements;
            this.inAppPurchases = purchases;
            this.purchasesForSelect = this.getPurchasesForSelect();
            this.loadAutoCompleteIfNeeded();
        }).catch(error => {
            console.log('Error in getting inAppPurchases');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get InAppPurchases");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            this.loadAutoCompleteIfNeeded();

        });
    }

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || !this.ruleUtilitiesInfo || this.minAppVersionForSample != this.feature.minAppVersion) {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.feature.minAppVersion;
            this.loadAutoComplete();
        } else {
            this.loading = false;
        }
    }

    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let feature = this.feature;
        this._airLockService.getUtilitiesInfo(feature.seasonId, feature.stage, feature.minAppVersion).then(result => {
            let ruleUtilitieInfo = result as string;
            console.log('UtilityInfo:');
            console.log(ruleUtilitieInfo);
            this.ruleUtilitiesInfo = ruleUtilitieInfo;
            this._loadInputSample();
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            this._loadInputSample();
        });
    }

    _loadInputSample(silent: boolean = false) {
        let feature = this.feature;
        if (!silent) {
            this.loading = true;
        }
        this._airLockService.getInputSample(feature.seasonId, feature.stage, feature.minAppVersion).then(resultSample => {
            let ruleInputSchemaSample = resultSample as string;
            console.log('Input Schema Sample');
            console.log(ruleInputSchemaSample);
            this.minAppVersionForSample = feature.minAppVersion;
            this.ruleInputSchemaSample = ruleInputSchemaSample;
            if (this.ruleInputSchemaSample && this.ruleUtilitiesInfo && this.minAppVersionForSample === this.feature.minAppVersion) {
                this.inputSampleLoaded = true;
            }
            this.loading = false;
        }).catch(error => {
            console.log('Error in getting Input Schema Sample');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Input Sample Schema ");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            this.loading = false;
        });
    }

    openOnNewTab() {
        window.open('/#/pages/entitlements/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason()+'/' + this._appState.getCurrentBranch() + '/' + this.originalFeature
            .uniqueId);
    }
}



