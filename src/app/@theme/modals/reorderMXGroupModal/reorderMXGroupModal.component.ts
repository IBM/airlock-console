// import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Component, ElementRef, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';

import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
// import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
// import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
// import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Branch} from "../../../model/branch";
import {InAppPurchase} from '../../../model/inAppPurchase';
import {PurchaseOptions} from '../../../model/purchaseOptions';
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'reorder-mx-group-modal',
    styleUrls: ['./reorderMXGroupModal.scss'],
    templateUrl: './reorderMXGroupModal.html',
    encapsulation: ViewEncapsulation.None
})

export class ReorderMXGroupModal {

    // @ViewChild('reorderMXGroupModal') modal: ModalComponent;
    @Input() verifyActionModal: VerifyActionModal;

    _branch: Branch = null;
    isFeature: boolean = false;
    _mxGroup: Feature = null;
    _configParent: Feature = null;
    _selectedTarget: Feature = null;
    _listItemHeight: number = 44;
    _selectedIndex: number = 0;
    isConfig: boolean = false;
    isOrderRule: boolean = false;
    isPurchases: boolean = false;
    isPurchaseOptions: boolean = false;
    isShowMaxForOrderRule: boolean = false
    loading: boolean = false;
    private sub: any = null;
    @Output() onReorderMX = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderMXGroupModal>,
                private modalService: NbDialogService) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }


    ngOnInit(){
        if (this.modalRef) {

            console.log("this._configParent");
            console.log(this._configParent);
            console.log("this._mxGroup");
            console.log(this._mxGroup);
        }
    }

    getPurchaseItemType(capitalize: boolean): string {
        if (this.isPurchasesOptionsMode() || this.isReorderPurchaseOptionsOfEntitlement()) {
            if (capitalize) {
                return "Purchase Option";
            } else {
                return "purchase option";
            }
        }
        if (this.isPurchasesMode()) {
            if (capitalize) {
                return "Entitlement";
            } else {
                return "entitlement";
            }
        }
        return "";
    }

    isConfigMode(): boolean {
        return this.isConfig || this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP"
    }

    isOrderMode(): boolean {
        return this.isOrderRule || this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP"
    }

    isPurchasesMode(): boolean {
        return this.isPurchases || this._mxGroup.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP";
    }

    isReorderPurchaseOptionsOfEntitlement(): boolean {
        return this.isPurchaseOptions && this._mxGroup.type == "ENTITLEMENT";
    }

    isPurchaseOrOptionsMX(): boolean {
        return (this._mxGroup.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP" || this._mxGroup.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP");
    }

    isPurchasesOptionsMode(): boolean {
        return this.isPurchaseOptions || this._mxGroup.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP";
    }

    isFeatureMX(): boolean {
        return (this._mxGroup.type == "MUTUAL_EXCLUSION_GROUP");
    }

    shouldShowMaxOnSection(): boolean {
        return ((this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" && this._configParent == null) || (this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP" && this.isShowMaxForOrderRule) ||
            (this._mxGroup.type == "MUTUAL_EXCLUSION_GROUP") || (this._mxGroup.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP") || (this._mxGroup.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP"));
    }

    // This will return true if the dialog is shown for the root configuration under the feature so it has a reorder
    // but it is not a regular MX group so no "max on" field for example
    isConfigurationsRoot(): boolean {

        return ((this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" || this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") && this._configParent != null)
    }

    getType(isCapitalized: boolean) {
        let retVal: string = "";
        if (this.isConfigMode()) {
            retVal = "Configuration Rule";
        } else {
            retVal = "Feature";
        }

        if (!isCapitalized)
            return retVal.toLocaleLowerCase();
        else
            return retVal;
    }

    getChildren(fromItem: Feature): Feature[] {
        if (fromItem) {
            if (this.isConfiguration()) {
                return fromItem.configurationRules;
            } else {
                if (this.isOrderingRule()) {
                    return fromItem.orderingRules;
                }
                if (this.isPurchasesMode()) {
                    return (fromItem as InAppPurchase).entitlements;
                }
                if (this.isPurchasesOptionsMode()) {
                    return (fromItem as PurchaseOptions).purchaseOptions;
                }
                return fromItem.features;
            }
        } else {
            return null;
        }

    }

    getFeatureType() {
        if (this.isConfig || this._mxGroup && this._mxGroup.type == "CONFIG_MUTUAL_EXCLUSION_GROUP") {
            return "configuration";
        } else {
            if (this.isOrderRule || this._mxGroup && this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") {
                return "order";
            } else {
                return "feature";
            }
        }
    }

    isConfiguration() {
        return this.getFeatureType() == "configuration";
    }

    isOrderingRule() {
        return this.getFeatureType() == "order";
    }

    selectTarget(feature: Feature, index: number, target: EventTarget) {
        this._listItemHeight = (target as HTMLElement).offsetHeight;
        if (this._selectedTarget == feature && this._selectedIndex == index) {
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = feature;
            this._selectedIndex = index;
        }
    }

    save() {

        if (this._mxGroup.maxFeaturesOn < 1 /*|| this._mxGroup.maxFeaturesOn > this.getChildren(this._mxGroup).length*/) {
            console.log(`INVALID MAX FEATURES ON IN MX`);
            this.handleError("INVALID MAX FEATURES ON IN MX");
            return;
        }
        let firstProdFeatureInMxGroup = this.getFirstProdFeatureInMxGroup();
        if (firstProdFeatureInMxGroup != null) {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    feature: firstProdFeatureInMxGroup,
                    text: this._stringsSrevice.getString("reorder_mx_change_production_feature"),
                    verifyModalDialogType: VerifyDialogType.FEATURE_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._save();
                }
            });
        } else {
            this._save();
        }
    }

    open(branch: Branch, mxGroup:Feature, configParent:Feature = null, isFeature:boolean = false,isConfig:boolean = false,isOrderRule:boolean = false,isShowMaxForOrderRule:boolean = false,isPurchases:boolean= false,isPurchaseOptions:boolean = false) {
    }

    finishSuccesfullUpdate() {
        this.loading = false;
        this.onReorderMX.emit(null);
        this.close(true);
        this._airLockService.notifyDataChanged("success-notification", {
            title: "Success",
            message: "Reorder succeeded"
        });
    }

    _savePurchases() {
        this.loading = true;
        if (this.isPurchasesMode() || this.isReorderConfigOfPurchase()) {
            this._airLockService.updateInAppPurchase(this._mxGroup as InAppPurchase, this._branch.uniqueId).then(result => {
                this.finishSuccesfullUpdate();
            }).catch(
                error => {
                    console.log(`Failed to reorder: ${error}`);
                    this.handleError(error);
                }
            );

        } else if (this.isPurchasesOptionsMode() || this.isReorderConfigOfPurchaseOption()) {
            this._airLockService.updatePurchaseOptions(this._mxGroup as PurchaseOptions, this._branch.uniqueId).then(result => {
                this.finishSuccesfullUpdate();
            }).catch(
                error => {
                    console.log(`Failed to reorder: ${error}`);
                    this.handleError(error);
                }
            );

        }
    }

    isReorderConfigOfPurchase(): boolean {
        return (this._mxGroup.type === "ENTITLEMENT");
    }

    isReorderConfigOfPurchaseOption(): boolean {
        return (this._mxGroup.type === "PURCHASE_OPTIONS");
    }

    _save() {
        if (this.isPurchasesOptionsMode() || this.isPurchasesMode() || this.isReorderConfigOfPurchase() || this.isReorderConfigOfPurchaseOption()) {
            this._savePurchases();
        } else {
            this.loading = true;
            let featureToUpdate: Feature = this.getFeatureToUpdate();
            console.log()
            this._airLockService.updateFeature(featureToUpdate, this._branch.uniqueId).then(result => {
                this.loading = false;
                this.onReorderMX.emit(null);
                this.close(true);
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "Reorder succeeded"
                });
            }).catch(
                error => {
                    console.log(`Failed to reorder: ${error}`);
                    this.handleError(error);
                }
            );
        }
    }

    getFirstProdFeatureInMxGroup(): Feature {
        //not relevant to reorder features only to mx
        if (this.isFeature && (this._mxGroup.type == "FEATURE" || this._mxGroup.type == "ROOT")) {
            return null;
        }
        if ((this.isConfigMode() || this.isOrderMode()) && this._configParent != null) {
            let arr: Array<Feature> = (this.isConfigMode()) ? this._mxGroup.configurationRules : this._mxGroup.orderingRules;
            for (let curFeature of arr) {
                if (curFeature.stage == 'PRODUCTION') {
                    return curFeature;
                }
            }
            return null;
        } else {
            let arr: Feature[] = this._mxGroup.features;
            for (let curFeature of arr) {
                if (curFeature.stage == 'PRODUCTION') {
                    return curFeature;
                }
            }
            return null;
        }
    }

    getFeatureToUpdate(): Feature {
        if ((this.isConfigMode() || this.isOrderMode()) && this._configParent != null) {
            if (this.isConfigMode()) {
                let arr: Array<Feature> = this._mxGroup.configurationRules;
                this._configParent.configurationRules = arr;
            } else {
                let arr: Array<Feature> = this._mxGroup.orderingRules;
                this._configParent.orderingRules = arr;
                if (this._mxGroup.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP") {
                    this._configParent.maxFeaturesOn = this._mxGroup.maxFeaturesOn;
                }
            }
            /*if (this.isConfiguration()) {
                this._configParent.configurationRules = finalArray;
            } else {
                this._configParent.features = finalArray;
            }*/

            return this._configParent;
        } else {
            return this._mxGroup;
        }
    }

    getName(feature: Feature) {
        if (!feature) {
            return null;
        }
        if (this.isMXgroup(feature)) {
            return this.getToolTip(feature);
        } else {
            //return feature.name;
            return this._featureUtils.getFeatureDisplayName(feature);
        }
    }

    isMXgroup(item: Feature) {
        return item && item.type && (item.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" || item.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP" || item.type == "MUTUAL_EXCLUSION_GROUP" || item.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || item.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP");
    }

    isEmptyMX(item: Feature) {
        return item && this.isMXgroup(item) && this.getChildren(item) && this.getChildren(item).length <= 0;
    }

    getToolTip(feature: Feature) {
        let sons = "";
        ;
        let items = this.getChildren(feature);
        if (items != null) {
            for (let item of items) {
                let subfeat: Feature = item;
                if (sons == "") {
                    sons = "Group: " + this.getName(subfeat);
                } else {
                    sons += " \\ " + this.getName(subfeat);
                }
            }
            return sons;
        } else {
            return "Empty MX";
        }
    }

    getSubFeatures(feature: Feature) {
        let feat = feature;
        let toRet = [];
        if (this.isConfiguration()) {
            toRet = feat.configurationRules
        } else {
            if (this.isOrderRule) {
                toRet = feat.orderingRules;
            } else {
                toRet = feat.features;
            }
        }
        return toRet;
    }


    close(reload = false) {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.modalRef.close(reload);
    }

    scrollToSelectedItem(scrollDown: boolean) {
        // let itemIndex = this._selectedIndex;
        var scrollBy = this._listItemHeight;
        if (scrollDown){
            scrollBy = scrollBy * -1;
        }
        let top = document.getElementById('mainAccordion');
        if (top !== null) {
            top.scrollBy({top: scrollBy});
        }
    }

    moveUp() {
        if (this._selectedIndex == 0 || this._selectedTarget == null) {

        } else {
            var oldVal: Feature = this.getChildren(this._mxGroup)[this._selectedIndex - 1];
            //let length =
            this.getChildren(this._mxGroup)[this._selectedIndex - 1] = this.getChildren(this._mxGroup)[this._selectedIndex];
            this.getChildren(this._mxGroup)[this._selectedIndex] = oldVal;
            this._selectedIndex--;
            this.scrollToSelectedItem(true);

        }
    }

    moveDown() {
        if (this._selectedIndex == this.getChildren(this._mxGroup).length - 1 || this._selectedTarget == null) {

        } else {
            var oldVal: Feature = this.getChildren(this._mxGroup)[this._selectedIndex + 1];
            this.getChildren(this._mxGroup)[this._selectedIndex + 1] = this.getChildren(this._mxGroup)[this._selectedIndex];
            this.getChildren(this._mxGroup)[this._selectedIndex] = oldVal;
            this._selectedIndex++;
            this.scrollToSelectedItem(false);

        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder. Please make sure you specify a valid number of maximal features that can be on.";
        console.log("handleError in reorderMXGroupModal:" + errorMessage);
        console.log(error);
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
        }
        this.create(errorMessage);
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
        this.toastrService.danger(message, "Reorder failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

