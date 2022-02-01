import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {Branch} from "../../../model/branch";
import {Feature} from "../../../model/feature";
import {PurchaseOptions} from "../../../model/purchaseOptions";
import {StoreProductId} from "../../../model/storeProductId";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";

export class StoreTypes {
    static IOS = "Apple App Store";
    static ANDROID = "Google Play Store";
}

@Component({
    selector: 'add-purchase-option-modal',
    styleUrls: ['./addPurchaseOptionModal.scss'],
    templateUrl: './addPurchaseOptionModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddPurchaseOptionModal {
    branch: Branch;
    possibleGroupsList: Array<any> = [];
    title: string = "Add Purchase Option";
    loading: boolean = false;
    private isShow: boolean = true;
    _purchaseOption: PurchaseOptions;
    subFeatureParentName: string = null;
    otherFeatureToCreateMX: PurchaseOptions = null;
    mxGroupToAdd: PurchaseOptions = null;
    mxItemNames: Array<string> = [];
    parentId: string = "";
    storeProduct: string = "Apple App Store";
    productId: string = "";
    newItemInMXIndex: number = 0;
    storeType: StoreTypes[] = [StoreTypes.IOS, StoreTypes.ANDROID]
    namespace = 'airlockEntitlement';
    selectedItem: string = StoreTypes.IOS;
    @Output() onPurchaseOptionsAdded = new EventEmitter();

    _rule: Rule;


    constructor(private _airLockService: AirlockService,
                private _featureUtils: FeatureUtilsService,
                 private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<AddPurchaseOptionModal>,
                private modalService: NbDialogService) {
        this.loading = true;
        this.branch = _appState.getCurrentBranchObject()
        this.possibleGroupsList = _appState.getAvailableGroups();
        this.initPurchaseOptions(null);
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initPurchaseOptions(parent: Feature) {
        this._purchaseOption = new PurchaseOptions();
        this._rule = new Rule();
        this.productId = "";
        this.storeProduct = "Apple App Store";
        this._purchaseOption.storeProductIds = [];
        this._purchaseOption.rolloutPercentage = 100;
        this._rule.ruleString = 'true';
        this._purchaseOption.rule = this._rule;
        this._purchaseOption.stage = "DEVELOPMENT";
        this._purchaseOption.storeProductIds = [new StoreProductId()];
        this._purchaseOption.storeProductIds[0].storeType = "Apple App Store";
        this._purchaseOption.storeProductIds[0].productId = "";
        this._purchaseOption.enabled = true;
        this._purchaseOption.namespace = "airlockEntitlement";
        this._purchaseOption.internalUserGroups = [];
        this._purchaseOption.type = "PURCHASE_OPTIONS";
        this._purchaseOption.creator = this._airLockService.getUserName();
        this.loading = false;
    }

    ngOnInit(){
        this._purchaseOption.namespace = this.namespace;
        if (this.mxGroupToAdd != null && this.mxGroupToAdd.purchaseOptions != null) {
            for (let item of this.mxGroupToAdd.purchaseOptions) {
                if (item.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
                    this.mxItemNames.push(this._featureUtils.getPurchaseOptionsMXDisplayName(item));
                } else {
                    this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
                }
            }
        }
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._purchaseOption.name == null || this._purchaseOption.name.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.productId === "") {
            let message = 'Product id is not specified. Are you sure want to continue?';
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
            // modalAlert.confirm()
            //     .title(message)
            //     .open()
            //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            //     .then(() => {
            //         this._save();
            //     }) // if were here ok was clicked.
            //     .catch(err => {
            //         // this.loading = false;
            //         // this.handleError(err);
            //     });
        } else {
            this._save();
        }
    }

    _save() {
        if (this.isValid()) {
            this._purchaseOption.name = this._purchaseOption.name.trim();
            this.loading = true;
            if (this.productId === "") {
                this._purchaseOption.storeProductIds = [];
            } else {
                this._purchaseOption.storeProductIds = [new StoreProductId()];
                this._purchaseOption.storeProductIds[0].storeType = this.storeProduct;
                this._purchaseOption.storeProductIds[0].productId = this.productId;

            }

            this._airLockService.addPurchaseOptions(this._purchaseOption, this.branch.seasonId, this.branch.uniqueId, this.parentId).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onPurchaseOptionsAdded.emit(result);
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New purchase option added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Purchase option name is required.');
        }
    }

    open(parent: Feature) {
        this.initPurchaseOptions(parent);
        this.title = "Add Purchase Option";

        /*this.openWithoutClean(parentId);*/
        this.openWithoutClean(parent.uniqueId);
    }

    openWithoutClean(parentId: string, size = 'md') {

        // this.parentId = parentId;
        // var $exampleMulti = $$(".js_example").select2(
        //     {
        //         tags: true,
        //         tokenSeparators: [',', ' ']
        //     }
        // );
        // console.log("internalGroups");
        // console.log(this._purchaseOption.internalUserGroups);
        //
        // $$('.js_example').on(
        //     'change',
        //     (e) => {
        //         this._purchaseOption.internalUserGroups = e.target as any;
        //
        //     }
        // );
        // $exampleMulti.val(this._purchaseOption.internalUserGroups).trigger("change");
        //
        // if (this.modal != null) {
        //     this.modal.open(size);
        // }
    }

    openAsAddWithOtherFeatureToMX(parentId: string, otherFeature: PurchaseOptions) {
        this.clean(otherFeature);
        this.title = "Add Purchase Option To New Mutual Exclusion Group";
        this.otherFeatureToCreateMX = otherFeature;
        this.openWithoutClean(parentId);
    }

    clean(parent: Feature) {
        this.initPurchaseOptions(parent);

        this.title = "Add Purchase Option";
        this.mxGroupToAdd = null;
        this.newItemInMXIndex = 0;
        this.otherFeatureToCreateMX = null;
        this.subFeatureParentName = null;
    }

    selectItemToBeAfter(index: number) {
        console.log("index:" + index);
        this.newItemInMXIndex = index;
    }

    openInExistingXM(mxGroupToAdd: PurchaseOptions) {
        this.clean(mxGroupToAdd);
        this.title = "Add Purchase Option To Mutual Exclusion  Group";
        this.mxGroupToAdd = mxGroupToAdd;
        this.mxItemNames = ["-- Add As First --"];
        for (let item of mxGroupToAdd.purchaseOptions) {
            if (item.type == 'PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP') {
                this.mxItemNames.push(this._featureUtils.getPurchaseOptionsMXDisplayName(item));
            } else {
                this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
        this.openWithoutClean(mxGroupToAdd.uniqueId, 'lg');
    }

    openAsAddSubFeature(parentId: string, parentName: string, parentNamespace: string) {
        this.clean(null);
        this.title = "Add SubOption";
        this.subFeatureParentName = parentName;
        this._purchaseOption.namespace = parentNamespace + parentName;
        this.openWithoutClean(parentId);
    }

    close(reload = null) {
        this.modalRef.close(reload);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create option. Please try again.";
        console.log("handleError in addPurchaseOptionModal:" + errorMessage);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message: string) {
        this.toastrService.danger(message, "Purchase option creation failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    // selectStoreType(type: string) {
    //     this.storeProduct = type;
    // }

    // getStoreTypeForSelect(): any[] {
    //     var toRet = [];
    //     for (var type of this.storeType) {
    //         let productObj = {
    //             id: type,
    //             text: type
    //         };
    //         toRet.push(productObj);
    //     }
    //     return toRet;
    // }

    getStoreTypeDisplayName(purchase: PurchaseOptions) {
        return this._featureUtils.getFeatureDisplayName(purchase);
    }

    // selectStoreTypeFromSelect(storeObj: any) {
    //     if (storeObj) {
    //         if (storeObj.id) {
    //             this.selectStoreType(storeObj.id);
    //         }
    //     }
    // }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

