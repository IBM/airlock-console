
import { Component, Injectable, Input, EventEmitter, Output, ViewChild } from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {AuthorizationService} from "../../../services/authorization.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {InAppPurchase} from "../../../model/inAppPurchase";

@Component({
    selector: 'select-included-purchases',
    styleUrls: ['./selectIncludedPurchases.scss', '../hirarchyTree/hirarchyNode/hirarchyNode.scss'],
    templateUrl: './selectIncludedPurchases.html'
})
export class SelectIncludedPurchases {
    @Input() feature: InAppPurchase;
    @Input() showAll: boolean = false;
    @Input() markedFeatureId: string = null;
    @Input() readonly: boolean = false;
    @Input() root: InAppPurchase;
    @Input() featureType: string = 'ENTITLEMENT';
    @Input() mtxType: string = 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP';
    _featurePath: Array<Feature>;
    loading = false;
    private selectPurchase: any = '';
    @Input('featurePath')
    set featurePath(value: Array<Feature>) {
        console.log("set featurePath");
        console.log(value);

        this._featurePath = value;
        if (value && value.length > 0) {
            this.currentFather = this._featurePath[this._featurePath.length - 1];
        } else {
           if (!this.showAll) {
               this.currentFather = this.root;
           }
        }
    }
    @Input() openFeatures: Array<string> = [];
    @Output() onCellClick: EventEmitter<string> = new EventEmitter<string>();

    currentFather: Feature;
    selectedItems: string = "";
    private purchasesForSelect = [];
    dummyValue: any = '';
    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService, private _featureUtils: FeatureUtilsService
    ) {

    }

    setCurrentFather(newFather: Feature) {
        if (this.readonly) {
            return;
        }
        this.currentFather = newFather;
        // this.onNewFatherSelected.emit(this.currentFather);
    }

    ngOnInit() {
        console.log("This is ROOT");
        console.log(this.root);
        console.log("This is featurePath");
        console.log(this.featurePath);
        this.setPurchasesForSelect();
    }

    reorder() {
    }
    getDescriptionTooltip(text: string) {
        if (text && text.length > 10) {
            return text;
        } else {
            return "";
        }

    }

    doNothing() {

    }


    public myFeatureChangedStatus(obj: string) {
        if (this.readonly) {
            return;
        }
        this.onCellClick.emit(obj);
    }

    isCellOpen(featureID: string): boolean {
        // var index = this.featurePath.indexOf(featureID, 0);
        // if (index > -1) {
        //     return true;
        // } else {
        //     return false;
        // }
        return false;
    }

    public myOnUpdate(obj: any) {
    }

    changeStage() {

    }

    getBackgroundStyle() {
        // if (this.isTargetFeature()) {
        //     return "rgba(256,256,256,"+0.8+")";
        // } else {
        //     return "rgba(0,0,0,0.0)";
        // }
        return "rgba(0,0,0,1.0)";
    }

    getColorStyle() {
        // if (this.isTargetFeature()) {
        //     return "blue";
        // } else {
        //     return "rgba(256,256,256,0.8)";
        // }
        return "rgba(256,256,256,0.8)";
    }

    cellClicked() {

    }

    getTextColor() {
        // if (this.isTargetFeature()) {
        //     return "blue";
        // } else {
        //     return "white";
        // }
        return "white";
    }

    shouldStyleCell() {
        // if (this.insideMX && !this.isOpen) {
        //     return false;
        // }
        // return true;
        return false;
    }
    isAlreadyIncluded(purchase: Feature): boolean {
        return this.feature.includedEntitlements && this.feature.includedEntitlements.includes(purchase.uniqueId);
    }

    addPurchase(purchase: Feature) {
        if (!this.feature.includedEntitlements) {
            this.feature.includedEntitlements = [];
        }
        this.feature.includedEntitlements.push(purchase.uniqueId);
    }

    addPurchaseById(purchaseId: string) {
        if (!this.feature.includedEntitlements) {
            this.feature.includedEntitlements = [];
        }
        this.feature.includedEntitlements.push(purchaseId);
    }
    getIncludedFeatures(): Array<InAppPurchase> {
        let toRet = [];
        if (this.feature.includedEntitlements && this.feature.includedEntitlements.length > 0) {
            this.setIncludedPurchases(this.root, this.feature.includedEntitlements, toRet);
        }
        return toRet;
    }

    setIncludedPurchases(purchase: InAppPurchase, list: string[], toRet: InAppPurchase[]) {
        if (list.includes(purchase.uniqueId)) {
            toRet.push(purchase);
        }
        for (let sub of purchase.entitlements) {
            this.setIncludedPurchases(sub, list, toRet);
        }
    }

    removePurchase(purchase: Feature) {
        if (!this.feature.includedEntitlements) {
            this.feature.includedEntitlements = [];
        }
        var index = this.feature.includedEntitlements.indexOf(purchase.uniqueId, 0);
        if (index > -1) {
            this.feature.includedEntitlements.splice(index, 1);
        }
    }
    addPurchasesToList(entitlements: InAppPurchase[], level: number = 0) {
        if (entitlements) {
            var space = "";
            for (var i = 0; i < level; i++) {
                space += "&nbsp; &nbsp;";
            }
            var nextLevel = level;
            for (var purchase of entitlements) {
                nextLevel = level;
                if (this.feature.includedEntitlements == null || !this.feature.includedEntitlements.includes( purchase.uniqueId)) {
                    if (purchase.type !== 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP' && purchase.uniqueId !== this.feature.uniqueId) {
                        var textOfPurchase = space + this.getPurchaseDisplayName(purchase);
                        let productObj = {
                            id: purchase.uniqueId,
                            text: textOfPurchase
                        };
                        this.purchasesForSelect.push(productObj);
                    }
                    nextLevel = level + 1;
                }
                this.addPurchasesToList(purchase.entitlements, nextLevel);
            }
        }
    }

    selectPurchaseFromSelect(purchaseObj: any) {
        if (purchaseObj) {
                this.addPurchaseById(purchaseObj);
        }
        this.selectPurchase = '';
    }

    getAllPurchases(entitlements: InAppPurchase[], retList: InAppPurchase[]) {
        if (entitlements) {
            for (var purchase of entitlements) {
                retList.push(purchase);
                this.getAllPurchases(purchase.entitlements, retList);
            }
        }
    }

    setPurchasesForSelect(){
        if (this.root) {
            this.purchasesForSelect = [];
            this.addPurchasesToList(this.root.entitlements, 0);
        }
    }

    getPurchaseDisplayName(purchase: InAppPurchase) {
        return this._featureUtils.getFeatureDisplayNameInTree(purchase);
    }
}
