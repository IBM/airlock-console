import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output,
    ViewChild
} from '@angular/core';
import {Feature} from "../../../model/feature";
import {AirlockService} from "../../../services/airlock.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {Branch} from "../../../model/branch";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {AddConfigurationModal} from "../../modals/addConfigurationModal";
import {EditFeatureModal} from "../../modals/editFeatureModal";
import {AddFeatureToGroupModal} from "../../modals/addFeatureToGroupModal";
import {ReorderMXGroupModal} from "../../modals/reorderMXGroupModal";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {EditFeatureConfig} from "../../../model/editFeatureConfig";
import {InAppPurchase} from "../../../model/inAppPurchase";
import {AddPurchaseConfigurationModal} from "../../modals/addPurchaseConfigurationModal";
import {ReorderPurchaseMXGroupModal} from "../../modals/reorderPurchaseMXGroupModal";
import {FeatureCell} from "../featureCell";

@Component({
    selector: 'configuration-cell',
    styleUrls: ['./configurationCell.scss'],
    templateUrl: './configurationCell.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigurationCell {

    @ViewChild('configurationCell') _selector: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;

    @Input() seasonSupportAnalytics: boolean = true;
    @Input() feature: Feature;
    @Input() branch: Branch;
    @Input() parentFeatureId: string;
    @Input() contextFeatureId: string;
    @Input() level: number = 0;
    @Input() insideMX: boolean;
    @Input() inlineMode: boolean;
    @Input() type: string;
    @Input() mainConfigCell: boolean;
    @Input() editInline: string;
    @Input() shouldOpenCell: boolean;
    @Input() configurationSchema: {};
    @Input() defaultConfiguration: {};
    @Input() sourceFeature: Feature;
    @Input() tick: boolean = false;
    @Input() searchTerm: string = "";
    @Input() editMode: boolean;
    @Input() showDevFeatures: boolean;
    @Input() filterlistDict: { string: Array<string> } = null;
    @Input() openFeatures: Array<string> = [];
    @Input() featuresPath: Array<Feature> = [];
    @Input() partOfBranch: boolean = false;
    @Input() selectedFeatureId: string = "";
    @Output() onSelected: EventEmitter<any> = new EventEmitter<any>();
    @Output() onUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() beforeUpdate: EventEmitter<any> = new EventEmitter<any>();
    @Output() hideIndicator: EventEmitter<any> = new EventEmitter<any>();
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();
    @Output() onSearchHit: EventEmitter<string> = new EventEmitter<string>();
    @Output() onEditFeature: EventEmitter<EditFeatureConfig> = new EventEmitter<EditFeatureConfig>();

    nextLevel: number;
    containerClass: string;
    isOpen: boolean = false;
    remove: boolean = true;
    ruleInputSchemaSample: string;
    ruleUtilitieInfo: string;
    lastSearchTerm: string = "";
    shouldOpenCellForSearch: boolean = false;
    highlighted = '';
    confirmSubfeatureStageChange: boolean = false;

    public status: { isopen: boolean } = {isopen: false};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private cd: ChangeDetectorRef,
                private _featureUtils: FeatureUtilsService,
                private modalService: NbDialogService) {
        if (this.feature && this.feature.type == "FEATURE") {
            this.nextLevel = this.level + 1;
        } else {
            this.nextLevel = this.level + 1;
        }
        if (this.level == 0) {
            this.containerClass = "panel panel-warning";
        } else {
            this.containerClass = "panel panel-warning";
        }
    }

    public updateFeature(newFeature: Feature) {
        Feature.cloneToFeature(newFeature, this.feature);
        setTimeout(() => {
            this.tick = !this.tick;
            this.cd.markForCheck()
        }, 100);
    }

    isMainConfigCell(): boolean {
        return this.mainConfigCell;
    }

    isAddDevelopmentSubConfig() {
        if (this.feature == null) {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    isShowOptions() {
        if (this.feature?.stage == 'PRODUCTION') {
            const isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
            return (isNotEditorOrViewer === false);
        } else {
            return (!this.isViewer());
        }

    }

    isPartOfSearch(term: string, feature: Feature): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = this._featureUtils.getFeatureDisplayName(feature);
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = this._featureUtils.getFeatureFullName(feature);
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));

    }

    hasSubElementWithTerm(term: string, feature: Feature): boolean {
        let subFeature;
        if (!term || term == "") {
            return false;
        }
        if (feature.features) {
            for (subFeature of feature.features) {
                if (this.isPartOfSearch(term, subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        if (feature.configurationRules) {
            for (subFeature of feature.configurationRules) {
                if (this.isPartOfSearch(term, subFeature) || this.hasSubElementWithTerm(term, subFeature)) {
                    return true;
                }
            }
        }
        return false;

    }

    isFilteredOut(): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this._isFilteredOut()) {
            // console.log("feature is filtered:"+this.feature.name);
            this.updateHighlight(false);
            return true;
        }
        let hasSubElements = this.hasSubElementWithTerm(this.searchTerm, this.feature);
        let hasSearchHit = this.isPartOfSearch(this.searchTerm, this.feature);
        this.updateHighlight(hasSearchHit);
        if (hasSearchHit || hasSubElements) {
            if (hasSubElements && !this.isOpen && !this.shouldOpenCellForSearch) {
                // console.log("now we know we should open the cell:"+this.feature.name);
                this.shouldOpenCellForSearch = true;
                setTimeout(() => {
                    this.cellClicked();
                }, 100);

            } else if (!hasSubElements && this.isOpen && this.shouldOpenCellForSearch) {
                // console.log("now we know we should close the cell:"+this.feature.name);
                this.shouldOpenCellForSearch = false;
                setTimeout(() => {
                    this.cellClicked();
                }, 100);
            }

            if (hasSearchHit && this.lastSearchTerm != this.searchTerm && this.searchTerm && this.searchTerm.length > 0) {
                this.lastSearchTerm = this.searchTerm;
                setTimeout(() => {
                    this.onSearchHit.emit(this.feature.uniqueId);
                }, 100);

            }

            return false;
        }
        return false; //change to true if you want to filter results out of the search

    }

    shouldHightlight() {
        return this.searchTerm && this.searchTerm.length > 0 && this.isPartOfSearch(this.searchTerm, this.feature);
    }


    updateHighlight(hasHit: boolean) {
        let allText = this._featureUtils.getFeatureDisplayName(this.feature);
        if (!allText || allText.length <= 0) {
            return;
        }
        this.highlighted = hasHit
            ? allText.replace(new RegExp('(' + this.searchTerm + ')', 'ig'),
                '<span class=highlight>$1</span>')
            : allText;
    }

    _isFilteredOut(): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (this.feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (this.feature[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }

        // if this is MTX - iterate over all the features and see if someone is not filtered out
        if (this.feature.type == "MUTUAL_EXCLUSION_GROUP") {
            for (var subFeat of this.feature.features) {
                let isFiltered = this.isFeatureFilteredOut(subFeat);
                if (!isFiltered) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    isFeatureFilteredOut(feature: Feature): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        return true;
                    }
                }
            }
        }
    }

    public mySearchHit(obj: any) {
        this.onSearchHit.emit(obj);
    }

    public mySelected(obj: any) {
        this.onSelected.emit(obj);
    }

    public myEditFeature(obj: any) {
        this.onEditFeature.emit(obj);
    }

    isInProduction(): boolean {
        return this.feature?.stage == 'PRODUCTION';
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getConfigString(): string {
        return this.feature.description;
        // let toRet = "";
        // if (this.feature.configuration) {
        //     toRet = JSON.stringify(this.feature.configuration);
        // }
        // return toRet;
    }

    getDefaultConfigString(): string {
        let toRet = "";
        if (this.defaultConfiguration) {
            toRet = JSON.stringify(this.defaultConfiguration);
        }
        return toRet;
    }

    getConfigSchemaString(): string {
        let toRet = "";
        if (this.configurationSchema) {
            toRet = JSON.stringify(this.configurationSchema);
        }
        return toRet;
    }

    getConfigurationString(): string {
        if (this.mainConfigCell) {
            return this.getString("configuration_cell_title") + " (" + this._featureUtils.getFeatureDisplayNameInTree(this.sourceFeature) + ")";
        } else {
            return this._stringsSrevice.getStringWithFormat("configuration_cell_mx_title", String(this.feature.maxFeaturesOn));
            //return this.getString("configuration_cell_mx_title");
        }
    }

    isShowRevertFromProdToEditor() {
        return this._airlockService.isEditor() && this.feature?.stage == 'PRODUCTION' && this.branch.uniqueId.toLowerCase() != "master";
    }

    isShowReleaseToProduction() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false || this.isShowRevertFromProdToEditor()) && this.partOfBranch;
    }

    isShowSendToAnalytic() {
        var isNotEditorOrViewer: boolean = (this.isViewer() || this.isEditor());
        return (isNotEditorOrViewer === false);
    }

    isFeatureSendToAnalytics() {
        if (this.feature.sendToAnalytics === true)
            return true;
        else
            return false;
    }

    isViewer() {
        return this._airlockService.isViewer();
    }

    isEditor() {
        return this._airlockService.isEditor();
    }

    isShowAddToGroup() {
        return (!this.isViewer());
    }

    isShowReorder() {
        return (!this.isViewer());
    }

    ngOnInit() {
        if (this.shouldOpenCell) {
            this.remove = false;
            setTimeout(() => {
                this.isOpen = true;
                this.cd.markForCheck();
            }, 100);
        } else {
        }
        if (this.editInline === this.feature.uniqueId) {
            let editConfig = new EditFeatureConfig(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, this, true, this.sourceFeature, null, null);
            this.onEditFeature.emit(editConfig);
        }
    }

    reorder() {
        let source = null;
        if (this.isMainConfigCell()) {
            // source = Feature.clone(this.sourceFeature);
            source = FeatureUtilsService.cloneFeature(this.sourceFeature) as Feature;
        }
        let sFeature = this.sourceFeature;
        if (this.feature.type == 'CONFIG_MUTUAL_EXCLUSION_GROUP') {
            sFeature = this.feature;
        }
        if (this.feature instanceof InAppPurchase){
            this.modalService.open(ReorderPurchaseMXGroupModal, {
                closeOnBackdropClick: false,
                context: {
                    _configParent: source,
                    _branch: this.branch,
                    _mxGroup: FeatureUtilsService.cloneFeature(sFeature) as InAppPurchase,
                    isFeature: false,
                    isOrderRule: false,
                    isConfig: true,
                    isPurchaseOption: false,
                    isShowMaxForOrderRule: false
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(true);
                }
            });
        }else {
            this.modalService.open(ReorderMXGroupModal, {
                closeOnBackdropClick: false,
                context: {
                    _branch: this.branch,
                    _mxGroup: FeatureUtilsService.cloneFeature(sFeature) as Feature,
                    _configParent: source,
                    isFeature: false,
                    isConfig: true,
                    isOrderRule: false,
                    isShowMaxForOrderRule: false,
                    isPurchases: false,
                    isPurchaseOptions: false,
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(null);
                }
            });
        }

        // this.reorderMXGroupModal.open(this.branch, FeatureUtilsService.cloneFeature(sFeature) as Feature, source, false, true);
    }

    isShowReorderForCell() {
        return (this.feature && this.feature.configurationRules && this.feature.configurationRules.length > 1);
    }

    reorderSubConfiguration() {
        this.popover.hide();
        var clonedFeature: Feature = FeatureUtilsService.cloneFeature(this.sourceFeature) as Feature;
        this.modalService.open(ReorderMXGroupModal, {
            closeOnBackdropClick: false,
            context: {
                _branch: this.branch,
                _mxGroup: clonedFeature,
                _configParent: clonedFeature,
                isFeature: false,
                isConfig: true,
                isOrderRule: false,
                isShowMaxForOrderRule: false,
                isPurchases: false,
                isPurchaseOptions: false,
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(null);
            }
        })
        // this.reorderMXGroupModal.open(this.branch, clonedFeature, clonedFeature, false, true, false);
    }

    getDescriptionTooltip(text: string) {
        if (text) {
            return text;
        } else {
            return "";
        }

    }

    getBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,240,256," + opac + ")";
        if (this.shouldHightlight()) {
            if (this.isSelectedFeature()) {
                toRet = "rgba(255, 212, 133," + 1.0 + ")";
            } else {
                toRet = "rgba(220, 224, 199," + 1.0 + ")";
            }

        }

        let constRet = "rgba(0,0,0,0.0)";
        return toRet;
    }

    isSelectedFeature() {
        if (this.selectedFeatureId && this.selectedFeatureId.length > 0 && this.selectedFeatureId == this.feature.uniqueId) {
            let y = this.getOffset();
            this.onSelected.emit({"event": event, "id": this.feature.uniqueId, "offset": y, "nativeElement": this._selector.nativeElement})
            return true;
        } else {
            return false;
        }
    }


    getHeadBackgroundStyle() {
        var level = this.level;
        if (this.insideMX) {
            level = level - 1;
        }
        var trans = level * 0.2;
        var opac = 1.0 - trans;
        let toRet = "rgba(225,225,225," + 1 + ")";
        return toRet;
    }

    getIdentBackground() {
        var trans = this.level * 0.1;
        let toRet = "rgba(0,0,0," + trans + ")";
        return toRet;
    }

    getCellWidth(cell: number) {
        var identWidth = this.level * 2;
        if (cell == 0) {
            return identWidth + "%";
        } else if (cell == 3) {
            //return (30-identWidth)+"%";
            return "30%";
        } else {
            return "";
        }
    }

    getColorStyle() {
        var trans = this.level * 0.15;
        var num = Math.floor(trans * 256);
        var num1 = Math.floor(this.level * 0.4 * 256);
        var num2 = Math.floor(this.level * 0.3 * 256);
        let toRet = "rgba(" + num + "," + num1 + "," + num2 + ",1.0)";
        let constRet = "rgba(0,0,0,1,0)"
        return constRet;
    }

    getHeadColorStyle() {
        let constRet = "rgba(0,0,0,1)"
        return constRet;
    }

    getNextBackgroundStyle() {
        if (!this.isOpen || this.feature.configurationRules == null || this.feature.configurationRules.length <= 0) {
            return ""; //this.getBackgroundStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            let toRet = "rgba(0,0,0," + trans + ")";
            return toRet;
        }

    }

    getNextLevel() {
        if (this.feature.configurationRules.length > 1) {
            return this.level + 1;
        } else {
            return this.level;
        }
    }

    getNextColorStyle() {
        if (!this.isOpen || this.feature.configurationRules == null || this.feature.configurationRules.length <= 0) {
            return this.getColorStyle();
        } else {
            var trans = this.nextLevel * 0.1;
            var num = Math.floor(trans * 256);
            let toRet = "rgba(" + num + "," + num + "," + num + ",1.0)";
            return toRet;
        }

    }

    getNextFeaturePath() {
        return [...this.featuresPath, this.feature];
    }

    cellClicked() {
        if (this.feature.type == 'CONFIGURATION_RULE' && this.feature.configurationRules != null && this.feature.configurationRules.length > 0) {
            if (!this.isOpen) {
                this.remove = false;
                this.onCellClick.emit(this.feature.uniqueId);
                setTimeout(() => {
                    this.isOpen = true;
                    this.cd.markForCheck(), 0.5
                });
            } else {
                // setTimeout(() => this.isOpen = false, 0.3);
                this.isOpen = false;
                this.remove = true;
                this.onCellClick.emit(this.feature.uniqueId);
            }
        } else {
            this.isOpen = false;
        }
        this.cd.markForCheck();
    }

    transitionEnd() {
        // console.log('transitionEnd');
        if (!this.isOpen) {
            this.remove = true;
        }
    }

    doNothing() {
        // alert('clicked')
    }

    getSendToAnalyticsTooltip() {
        if (!this.feature.sendToAnalytics) {
            return this.getString('configuration_cell_click_to_send_to_analytics');
        } else {
            return this.getString('configuration_cell_sending_something_click_to_not_send_to_analytics');
        }
    }

    addNewFeatureToMXGroup() {
        if (this.isMainConfigCell()) {
            if (this.sourceFeature.type === 'ENTITLEMENT' || this.sourceFeature.type === 'PURCHASE_OPTIONS'){
                this.modalService.open(AddPurchaseConfigurationModal, {
                    closeOnBackdropClick: false,
                    context: {
                        branchId: this.branch.uniqueId,
                        parentId: this.feature.uniqueId,
                        namespace: this.feature.namespace,
                        isConfiguraion: true,
                        isOrderRule: false,
                        parentType: this.feature.type,
                        subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature)
                    }
                }).onClose.subscribe(item => {
                    if (item) {
                        this.onUpdate.emit(item);
                    }
                })
            }else {
                if (this.sourceFeature.type === "ENTITLEMENT" || this.sourceFeature.type === "PURCHASE_OPTIONS") {
                    this.modalService.open(AddConfigurationModal, {
                        closeOnBackdropClick: false,
                        context: {
                            branchId: this.branch.uniqueId,
                            parentId: this.sourceFeature.uniqueId,
                            subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature),
                            namespace: this.sourceFeature.namespace,
                            isConfiguraion: true,
                            isOrderRule: false,
                            title: 'Add Configuration'
                        }
                    }).onClose.subscribe(item => {
                        if (item) {
                            this.onUpdate.emit(item);
                        }
                    });
                    // this.addConfigurationModal.openAsAddSubFeatureWithParent(this.branch.uniqueId, this.sourceFeature, this.sourceFeature.namespace, true, false);
                } else {
                    this.modalService.open(AddConfigurationModal, {
                        closeOnBackdropClick: false,
                        context: {
                            branchId: this.branch.uniqueId,
                            parentId: this.feature.uniqueId,
                            subFeatureParentName: this.feature.name,// Eitan: why not this._featureUtils.getFeatureDisplayName(this.feature),
                            namespace: this.feature.namespace,
                            isConfiguraion: true,
                            isOrderRule: false,
                            title: 'Add Configuration'
                        }
                    }).onClose.subscribe(item => {
                        if (item) {
                            this.onUpdate.emit(item);
                        }
                    });
                    // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.sourceFeature.uniqueId, this._featureUtils.getFeatureDisplayName(this.sourceFeature), this.sourceFeature.namespace);
                }
            }
        } else {
            this.modalService.open(AddConfigurationModal, {
                closeOnBackdropClick: false,
                context: {
                    type: "ExistingXM",
                    mxGroupToAdd: this.feature,
                    branchId: this.branch.uniqueId,
                    showNameSpaceInTitle: true,
                    mxItemNames: ["-- Add As First --"],
                    title: "Add Ordering rule To Mutual Exclusion Group",
                    parentId: this.feature.uniqueId,
                    isConfiguraion: true,
                    isOrderRule: false,
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(reload);
                }
            });
            // this.addConfigurationModal.openInExistingXM(this.feature, this.branch.uniqueId);
        }
    }

    addNewFeatureToMXGroupWithCurrentFeature() {
        this.modalService.open(AddConfigurationModal, {
            closeOnBackdropClick: false,
            context: {
                type: "OtherFeatureToMX",
                otherFeatureToCreateMX: this.feature,
                title: "Add Ordering Rule To New Mutual Exclusion Group",
                parentId: this.parentFeatureId,
                isConfiguraion: true,
                isOrderRule: false,
            }
        }).onClose.subscribe(reload => {
            if (reload) {
                this.onUpdate.emit(reload);
            }
        });
        // this.addConfigurationModal.openAsAddWithOtherFeatureToMX(this.parentFeatureId, this.feature);
    }

    addFeatureToMXGroup() {
        this.popover.hide();
        this.beforeUpdate.emit(null);
        this.feature.parent = this.parentFeatureId;
        this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(parent => {
            let parentFeature: Feature = parent;
            this.hideIndicator.emit(null);
            this.modalService.open(AddFeatureToGroupModal, {
                closeOnBackdropClick: false,
                context: {
                    _branch: this.branch,
                    _feature: this.feature,
                    _contextFeature: parentFeature,
                    isOrderRule: false,
                    isPurchase: this.sourceFeature.type === "ENTITLEMENT",
                    isPurchaseOption: this.sourceFeature.type === "PURCHASE_OPTIONS",
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(null);
                    this.updateFeature(this.feature);
                }
            })
            // this.addToMXGroupModal.open(this.branch, this.feature, parentFeature);
        });

    }

    openEditDialog(event: Event, isInline: boolean = true){
        this.popover.hide();
        if (event) {
            event.stopPropagation();
        }
        if (isInline) {
            let editConfig = new EditFeatureConfig(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, this, true, this.sourceFeature, null, null);
            this.onEditFeature.emit(editConfig);
            return;
        }
        this.beforeUpdate.emit(null);
        this._airlockService.getUtilitiesInfo(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(result => {
            this.ruleUtilitieInfo = result as string;
            this._airlockService.getInputSample(this.feature.seasonId, this.feature.stage, this.feature.minAppVersion).then(res => {
                this.ruleInputSchemaSample = res as string;
                this.hideIndicator.emit(this.feature);
                this.modalService.open(EditFeatureModal, {
                    closeOnBackdropClick: false,
                    context: {
                        originalFeature: this.feature,
                        branch: this.branch,
                        featurePath: this.featuresPath,
                        inAppPurchases: null,
                        feature: Feature.clone(this.feature),
                        ruleInputSchemaSample: this.ruleInputSchemaSample,
                        ruleUtilitiesInfo: this.ruleUtilitieInfo,
                        featureCell: null,
                        configurationCell: this,
                        orderCell: null,
                        sourceFeature: this.sourceFeature,
                    }
                }).onClose.subscribe(reload => {
                    if (reload) {
                        this.updateFeature(this.feature);
                        this.onUpdate.emit(null);
                    }
                })
                // this.editFeatureModal.open(this.branch, this.feature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, this, false, this.sourceFeature);
            }).catch(error => {
                console.log('Error in getting Input Schema Sample');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Input Sample Schema");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        }).catch(error => {
            console.log('Error in getting Utilitystring');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Utilitystring");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.hideIndicator.emit(error);
        });


    }

    openDefault() {
        // this.beforeUpdate.emit(null);
        let editConfig = new EditFeatureConfig(this.branch, this.sourceFeature, this.featuresPath, this.ruleInputSchemaSample, this.ruleUtilitieInfo, null, this, true, null, null, null);
        this.onEditFeature.emit(editConfig);
    }

    openAddDialog() {
        this.popover.hide();
        if (this.sourceFeature.type === 'ENTITLEMENT' || this.sourceFeature.type === 'PURCHASE_OPTIONS'){
            this.modalService.open(AddPurchaseConfigurationModal, {
                closeOnBackdropClick: false,
                context: {
                    branchId: this.branch.uniqueId,
                    parentId: this.feature.uniqueId,
                    namespace: this.feature.namespace,
                    isConfiguraion: true,
                    isOrderRule: false,
                    parentType: this.feature.type,
                    subFeatureParentName: this._featureUtils.getFeatureDisplayName(this.feature)
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(reload);
                }
            })
        }else{
            this.modalService.open(AddConfigurationModal, {
                closeOnBackdropClick: false,
                context: {
                    branchId: this.branch.uniqueId,
                    parentId: this.feature.uniqueId,
                    subFeatureParentName: this.feature.name,// Eitan: why not this._featureUtils.getFeatureDisplayName(this.feature),
                    namespace: this.feature.namespace,
                    isConfiguraion: true,
                    isOrderRule: false,
                    title: 'Add Configuration'
                }
            }).onClose.subscribe(reload => {
                if (reload) {
                    this.onUpdate.emit(reload);
                }
            });
        }

        // this.addConfigurationModal.openAsAddSubFeature(this.branch.uniqueId, this.feature.uniqueId, this.feature.name, this.feature.namespace);
    }

    shouldStyleCell() {
        if ((this.feature.type == 'CONFIG_MUTUAL_EXCLUSION_GROUP' && this.feature.configurationRules.length > 1)) {
            return true;
        } else if (this.insideMX && !this.isOpen) {
            return false;
        } else if (this.level == 0 || this.isOpen == true || (this.feature.type == 'CONFIG_MUTUAL_EXCLUSION_GROUP' && this.feature.configurationRules.length > 1)) {
            return true;
        } else {
            return false;
        }
    }

    isSubFeature() {
        if (this.level > 0 && !this.insideMX) {
            return true;
        } else {
            return false;
        }
    }

    shouldNotStyleCell() {
        return !this.shouldStyleCell();
    }

    public myBeforeUpdate(obj: any) {
        this.beforeUpdate.emit(obj);
    }

    public myFeatureChangedStatus(obj: string) {
        this.onCellClick.emit(obj);
    }

    isCellOpen(featureID: string): boolean {
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            return true;
        } else {
            return false;
        }
    }

    public myOnUpdate(obj: any) {
        this.onUpdate.emit(obj);
    }

    public myHideIndicator(obj: any) {
        this.hideIndicator.emit(obj);
    }

    changeStage() {
        this.popover.hide();
        let message = "";
        if (this.feature.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this configuration to development?';
        } else {
            message = 'Are you sure you want to release this configuration to production?';
        }
        message += ` This operation can impact your app in production.
        Enter the configuration name to validate your decision.`;
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                feature: this.feature,
                text: message,
                verifyModalDialogType: VerifyDialogType.CONFIGURATION_TYPE,
                confirmSubfeatureStageChange: this.confirmSubfeatureStageChange,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._changeStage();
            }
        });

        this.confirmSubfeatureStageChange = false;
        if (!this.isMasterBranch()) {
            //make recursive chech for feature stage change only if feature in branch
            // change global var confirmSubfeatureStageChange because of recursive func
            this.recursiveCheckStage(this.feature);
        }
    }

    _changeStage() {
        this.beforeUpdate.emit(null);
        var newStageFeature: Feature = FeatureUtilsService.cloneFeature(this.feature) as Feature;
        var isRevert = false;
        if (newStageFeature.stage == 'PRODUCTION') {
            newStageFeature.stage = 'DEVELOPMENT';
            isRevert = true;
            if (!this.isMasterBranch()) {
                this.recursiveUpdateStage(newStageFeature);
            }
        } else {
            newStageFeature.stage = 'PRODUCTION';
            if (newStageFeature.minAppVersion == null || newStageFeature.minAppVersion.length == 0) {
                this._airlockService.notifyDataChanged("error-notification", "Unable to release this feature to production because a minimum app version is not specified. Edit the feature to specify a minimum app version.");
                this.onUpdate.emit(this.feature);
                return;
            }
        }
        this._airlockService.updateFeature(newStageFeature, this.branch.uniqueId).then(feature => {
            this.feature = feature;
            this.onUpdate.emit(this.feature);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: "Stage changed successfully"
            });
        }).catch(error => {
            let defErrorMessage = error._body || "Failed to change stage. Please try again.";
            if (isRevert) {
                defErrorMessage = "Failed to change stage. If this item has sub-configurations in production, revert them to development first";
            }
            let errorMessage = this._airlockService.parseErrorMessage(error, defErrorMessage);
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    isMasterBranch(): boolean {
        return this.branch.uniqueId.toLowerCase() == "master"
    }

    isFeatureCheckedOutOrNew(feature: Feature): boolean {
        return (this.branch.uniqueId.toLowerCase() != "master" && (feature.branchStatus == "CHECKED_OUT" || feature.branchStatus == "NEW"));
    }

    recursiveCheckStage(feature: Feature) {
        if (feature.features) {
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            for (var sub of feature.features) {
                this.recursiveCheckStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE" && feature.name != this.feature.name) {
                if (feature.stage === "PRODUCTION")
                    this.confirmSubfeatureStageChange = true;
            }
            for (var sub of feature.configurationRules) {
                this.recursiveCheckStage(sub);
            }
        }
    }

    recursiveUpdateStage(feature: Feature) {
        var hasSubfeatureToRevert = false;
        if (feature.features) {
            if (feature.type === "FEATURE" && feature.name != this.feature.name && this.isFeatureCheckedOutOrNew(feature)) {
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';

            }
            for (var sub of feature.features) {
                this.recursiveUpdateStage(sub);
            }
        }
        if (feature.configurationRules) {
            if (feature.type === "CONFIGURATION_RULE" && feature.name != this.feature.name) {
                if (feature.stage === "PRODUCTION")
                    feature.stage = 'DEVELOPMENT';
            }
            for (var sub of feature.configurationRules) {
                this.recursiveUpdateStage(sub);
            }
        }
    }

    getDeleteColor() {
        if (this.feature.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    delete() {
        this.popover.hide();
        if (this.feature.stage == 'PRODUCTION') {
            return;
        }
        let message = 'Are you sure you want to delete this configuration (' + this.feature.name + ")?";

        if (this.feature.stage == 'PRODUCTION') {
            return;
        }
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Delete"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._delete();
            }
        });
    }

    _delete() {
        this.beforeUpdate.emit(null);
        let featName = this.feature.name;
        this._airlockService.deleteFeature(this.feature, this.branch).then(resp => {
            if (this.insideMX) {
                this._airlockService.getFeature(this.parentFeatureId, this.branch.uniqueId).then(response => {
                    let mxGroup: Feature = response;
                    if (mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" && (mxGroup.configurationRules == null || mxGroup.configurationRules.length <= 0)) {
                        this._airlockService.deleteFeature(mxGroup, this.branch).then(re => {
                            this.onUpdate.emit(null);
                        }).catch(error => {
                            this.onUpdate.emit(error);
                        });
                    } else {
                        this.onUpdate.emit(resp);
                    }
                }).catch(error => {
                    this.onUpdate.emit(error);
                });
            } else {
                this.onUpdate.emit(resp);
                this._airlockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "The configuration " + featName + " was deleted"
                });
            }


        }).catch(error => {
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete configuration");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            this.onUpdate.emit(error);
        });
    }

    changeSendToAnalytic() {
        if (this.isFeatureSendToAnalytics()) {
            this.beforeUpdate.emit(null);
            this._airlockService.deleteFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to delete Feature to send to Analytic");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);
            });
        } else {
            this.beforeUpdate.emit(null);
            this._airlockService.updateFeatureSendToAnalytic(this.feature, this.branch.uniqueId).then(feature => {
                this.feature = feature as Feature;
                this.onUpdate.emit(this.feature);
            }).catch(error => {
                console.log('Error in update feature to send to Analytic');
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to change the analytics status");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                this.hideIndicator.emit(error);

            });
        }
    }

    draggedFeature($event) {
        let feature: Feature = $event.dragData;
        //alert('dragged '+feature.name);
    }

    droppedFeature($event) {
        let feature: Feature = $event.dragData;
        alert('dropped ' + feature.name);
    }

    shouldShowUserGroups() {
        if (this.feature.stage == 'DEVELOPMENT' &&
            !(this.feature.internalUserGroups == null || this.feature.internalUserGroups.length <= 0)
        ) {
            return true;
        } else {
            return false;
        }
    }

    userGroupsText() {
        var toRet = "";
        if (!(this.feature.internalUserGroups == null || this.feature.internalUserGroups.length <= 0)) {
            // for (var userGroup of this.feature.internalUserGroups) {
            //     toRet += userGroup + "\n";
            // }
            toRet = this.feature.internalUserGroups.toString();
        }
        return toRet;
    }

    promptChangeSendToAnalytics() {
        let message = this.isFeatureSendToAnalytics() ? this.getString('analytics_stop_report_config') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_config_suffix') : this.getString('analytics_report_config') + this._featureUtils.getFeatureDisplayName(this.feature) + this.getString('analytics_report_config_suffix');
        if (this.feature.stage == 'PRODUCTION') {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    feature: this.feature,
                    text: message,
                    verifyModalDialogType: VerifyDialogType.CONFIGURATION_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this.changeSendToAnalytic();
                }
            });
        } else {
            // this.modal.confirm()
            //     .title(message)
            //     .open()
            //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            //     .then(() => {
            //         this.changeSendToAnalytic();
            //     }) // if were here ok was clicked.
            //     .catch(err => {
            //
            //     });
        }

    }

    isPartOfBranch(): boolean {
        return this.feature && this.feature.branchStatus && (this.feature.branchStatus == "CHECKED_OUT" || this.feature.branchStatus == "NEW");
    }

    /*partOfBranch() {
        return this.branch.uniqueId=="master" || this.isPartOfBranch();
    }*/

    getOffset() {
        if (this._selector) {
            var el = this._selector.nativeElement;
            var _y = 0;
            while (el && !isNaN(el.offsetTop)) {
                _y += Math.abs(el.offsetTop - el.scrollTop);
                el = el.offsetParent;
            }
            return _y;
        }
        return this._selector;

    }

    hidePopover(){
        this.popover.hide();
    }
}
