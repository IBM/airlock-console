import { Component, ViewEncapsulation, ViewChild, Input, Output } from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { EventEmitter } from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product";
import { Feature } from "../../../model/feature";
import { TransparentSpinner } from "../transparentSpinner/transparentSpinner.service";
import { NotificationsService, SimpleNotificationsComponent } from "angular2-notifications";
import { StringsService } from "../../../services/strings.service";
import { FeatureUtilsService } from "../../../services/featureUtils.service";
import { ToastrService } from "ngx-toastr";
import { Branch } from "../../../model/branch";
import { InAppPurchase } from '../../../model/inAppPurchase';
import { PurchaseOptions } from '../../../model/purchaseOptions';

@Component({
    selector: 'add-to-group-modal',
    providers: [TransparentSpinner, NotificationsService, FeatureUtilsService],
    styles: [require('./addFeatureToGroupModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, TOOLTIP_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./addFeatureToGroupModal.html'),
    encapsulation: ViewEncapsulation.None

})

export class AddFeatureToGroupModal {

    @ViewChild('addToMXGroupModal') modal: ModalComponent;
    loading: boolean = false;
    _feature: Feature = null;
    _branch: Branch = null;
    _contextFeature: Feature = null;
    _selectedTarget: Feature = null;
    isOrderRule: boolean = false;
    isPurchase: boolean = false;
    isPurchaseOption: boolean = false;
    @Output() onSave = new EventEmitter();

    constructor(private _airLockService: AirlockService, private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService, private toastrService: ToastrService) {

    }

    open(branch: Branch, feature: Feature, contextFeature: Feature, isOrderRule: boolean = false, isPurchase: boolean = false, isPurchaseOption: boolean = false) {
        if (this.modal) {
            this._contextFeature = contextFeature;
            this.isOrderRule = isOrderRule;
            this.isPurchase = isPurchase;
            this.isPurchaseOption = isPurchaseOption;
            console.log("open configure mutual exclusion!!");
            console.log(this._contextFeature);
            this._feature = feature;
            this._branch = branch;
            let currentFather: Feature = null;
            if (this._contextFeature != null) {
                for (let item of this.getSubFeatures(this._contextFeature)) {
                    let feat: Feature = item;
                    if (feat.uniqueId == this._feature.parent) {
                        currentFather = feat;
                    }
                }
            }

            this._selectedTarget = currentFather;

            console.log("open add feature to group");
            console.log(this._feature);
            console.log(this._contextFeature);
            this.modal.open();
        }
    }

    getSubFeatures(feature: Feature) {
        console.log("getSubFeatures");
        console.log(feature);
        console.log(this.isOrderRule);
        var toRet = null;
        if (this.isOrderRule) {
            toRet = feature.orderingRules;
        } else {
            if (feature.type == "FEATURE" || feature.type == "MUTUAL_EXCLUSION_GROUP" || feature.type == "ROOT") {
                toRet = feature.features;
            } else {
                if (this.isPurchaseOption) {
                    toRet = (feature as InAppPurchase).purchaseOptions;
                } else {
                    toRet = feature.configurationRules;
                }
            }
        }
        if (toRet) {
            return toRet;
        } else {
            return [];
        }
    }

    getName(feature: Feature) {
        if (this._feature) {

            if (this.isMXgroup(feature)) {
                return this.getToolTip(feature);
            } else {
                return this._featureUtils.getFeatureDisplayName(feature);
            }
        }
        else {
            return '';
        }

    }

    getMXTitle(): string {
        if (this.isConfiguration()) {
            return this._stringsSrevice.getStringWithFormat("add_feature_configuration_to_group_modal_title", String(this.getType()), String(this._featureUtils.getFeatureDisplayName(this._feature)));
        }

        if (this.isOrderRule) {
            return this._stringsSrevice.getStringWithFormat("add_feature_configuration_to_group_modal_title", "ordering rule", String(this._featureUtils.getFeatureDisplayName(this._feature)));

        } else {
            return this._stringsSrevice.getStringWithFormat("add_feature_to_group_modal_title", String(this.getType()), String(this._featureUtils.getFeatureDisplayName(this._feature)));
        }

    }

    getType() {
        if (this._feature && (this._feature.type == "CONFIGURATION_RULE" || this._feature.type == "CONFIG_MUTUAL_EXCLUSION_GROUP")) {
            return "configuration";
        } else {
            if (this._feature && (this._feature.type == "ORDERING_RULE" || this._feature.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP")) {
                return "order";
            } else {
                if(this._feature && (this._feature.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || this._feature.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP" || this._feature.type =="ENTITLEMENT" || this._feature.type == "PURCHASE_OPTIONS")){
                    if(this._feature.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || this._feature.type == "PURCHASE_OPTIONS"){
                        return "purchase option";
                    }else{
                        return "entitlement";
                    }
                }else {
                    return "feature";
                }
            }
        }
    }

    isConfiguration() {
        return this.getType() == "configuration";
    }

    isMXgroup(item: Feature) {
        return item.type == "CONFIG_MUTUAL_EXCLUSION_GROUP" || item.type == "MUTUAL_EXCLUSION_GROUP" || item.type == "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP" || item.type == "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP" || item.type == "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP";
    }

    selectTarget(feature: Feature) {
        if (this._selectedTarget == feature) {
            this._selectedTarget = null;
        } else {
            this._selectedTarget = feature;
        }
    }

    getToolTip(feature: Feature) {
        let sons = "";
        for (let item of this.getChildren(feature)) {
            let subfeat: Feature = item;
            if (sons == "") {
                sons = "Group: " + this.getName(subfeat);
            } else {
                sons += " \\ " + this.getName(subfeat);
            }
        }
        return sons;
    }

    saveMXForPurchases() {
        this.loading = true;
        let featName = this._feature.name;

        if (this.isMXgroup(this._selectedTarget)) {
            if (this.isPurchaseOption) {
                (this._selectedTarget as PurchaseOptions).purchaseOptions.push(this._feature as PurchaseOptions);
            } else {
                (this._selectedTarget as InAppPurchase).entitlements.push(this._feature as InAppPurchase);
            }
            var typeInMSG = "entitlement";
            if (this.isPurchaseOption) {
                typeInMSG = "purchase option";
            }
            this._airLockService.updateInAppPurchase(this._selectedTarget as InAppPurchase, this._branch.uniqueId).then(result => {
                this.loading = false;
                this.onSave.emit(null);
                this.close();
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "Added the " + typeInMSG + " " + featName
                });
            }).catch(
                error => {
                    this.onError(error);
                }
            );
        } else {
            console.log("this is not a group");
            //create group and add both of them to it
            let seasonID: string = this._contextFeature.seasonId;
            let parentID = this._contextFeature.uniqueId;
            let index = this.getSubFeatures(this._contextFeature).indexOf(this._selectedTarget);
            var mxGroup: Feature = new Feature();
            mxGroup.seasonId = seasonID;
            var typeInMSG = "entitlement";
            if (this.isPurchaseOption) {
                mxGroup.type = "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP";
                typeInMSG = "purchase option";
            } else {
                if (this.isPurchase) {
                    mxGroup.type = "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP";
                } else {
                    mxGroup.type = "MUTUAL_EXCLUSION_GROUP";
                }
            }
            mxGroup.internalUserGroups = [];
            console.log(mxGroup);
            this._airLockService.addInAppPurchase(mxGroup as InAppPurchase , seasonID, this._branch.uniqueId, parentID).then(result => {
                console.log("created MXgroup");
                let fetchedMXG: Feature = result;
                let mxId: string = fetchedMXG.uniqueId;
                // alert("added MX group to "+this._contextFeature.name);
                //get context feature again


                this._airLockService.getInAppPurchase(mxId, this._branch.uniqueId).then(res => {
                    console.log("retrieved the mxGroup we created");
                    console.log(res);
                    // alert("fetched MX group");
                    let fmxGroup: InAppPurchase = res;
                    //now update the context feature
                    if (this.isConfiguration()) {
                        fmxGroup.configurationRules = [this._selectedTarget, this._feature];
                    } else {
                        if (this.isPurchaseOption) {
                            fmxGroup.purchaseOptions = [this._selectedTarget as PurchaseOptions, this._feature as PurchaseOptions];
                        } else {
                            if (this.isPurchase) {
                                fmxGroup.entitlements = [this._selectedTarget as InAppPurchase, this._feature as InAppPurchase];
                            }
                        }
                    }
                    fmxGroup.defaultIfAirlockSystemIsDown = false;
                    fmxGroup.internalUserGroups = [];
                    this._airLockService.updateInAppPurchase(fmxGroup, this._branch.uniqueId).then(result => {
                        console.log("MX group updated: added both features as children");
                        // alert("MX group updated: added both features as children");
                        //get the mxGroup again
                        this._airLockService.getInAppPurchase(fmxGroup.uniqueId, this._branch.uniqueId).then(rsp => {
                            // alert("got fmx group (again");
                            console.log("got the fmx group again");
                            console.log(rsp);
                            fmxGroup = rsp;
                            /// get the context feature again
                            this._airLockService.getInAppPurchase(parentID, this._branch.uniqueId).then(p => {
                                console.log("got parent feature");
                                console.log(p);
                                let newParent: InAppPurchase = p;
                                let newIndex = -1;//newParent.features.indexOf(fmxGroup);
                                let newFeatures = [];
                                var isAdded: boolean = false;
                                for (let idx in this.getChildren(newParent)) {
                                    let f: Feature = this.getChildren(newParent)[idx];
                                    if (+idx == +index) {
                                        console.log("added once:" + idx);
                                        isAdded = true;
                                        newFeatures.push(fmxGroup);
                                    }
                                    if (f.uniqueId == mxId) {
                                        console.log("deleted once:" + idx);
                                        newIndex = +idx;
                                        // itemsToDelete.push(f);
                                    } else {
                                        console.log("push item");
                                        newFeatures.push(f);
                                    }
                                }
                                //fix adding last
                                if (isAdded == false) {
                                    console.log("added in the end");
                                    newFeatures.push(fmxGroup);
                                }
                                if (this.isPurchaseOption) {
                                    newParent.purchaseOptions = newFeatures;
                                } else {
                                    if (this.isPurchaseOption) {
                                        newParent.entitlements = newFeatures;
                                    }
                                }

                                console.log("added to new location");
                                console.log(this.getChildren(newParent));
                                this._airLockService.updateInAppPurchase(newParent, this._branch.uniqueId).then(re => {
                                    console.log("mx in context moved");
                                    // alert("mx in context moved");
                                    ////////THE END
                                    this.loading = false;
                                    this.onSave.emit(null);
                                    this.close();
                                    this._airLockService.notifyDataChanged("success-notification", {
                                        title: "Success",
                                        message: "Added the " + typeInMSG + " " + featName
                                    });
                                    /////////////////////////

                                }).catch(err => {
                                    console.log("move mx in context failed");
                                    console.log(err);
                                    this.onError(err);
                                });


                            }).catch(error => {
                                this.onError(error);
                            });
                        }).catch(eerr => {
                            this.onError(eerr);
                        });


                    }).catch(error => {
                        this.onError(error);
                    });

                    ////////////////////////

                }).catch(error => {
                    this.onError(error);
                });
            }).catch(error => {
                this.onError(error);
            });
        }
    }

    save() {
        if (this.isPurchase || this.isPurchaseOption) {
            this.saveMXForPurchases();
            return;
        }
        //if we chose a group - just put it in
        this.loading = true;
        let featName = this._feature.name;
        if (this.isMXgroup(this._selectedTarget)) {
            if (this.isConfiguration()) {
                this._selectedTarget.configurationRules.push(this._feature);
            } else {
                if (this.isOrderRule) {
                    this._selectedTarget.orderingRules.push(this._feature);
                } else {
                    this._selectedTarget.features.push(this._feature);
                }
            }

            this._airLockService.updateFeature(this._selectedTarget, this._branch.uniqueId).then(result => {
                this.loading = false;
                this.onSave.emit(null);
                this.close();
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "Added the " + this.getType() + " " + featName
                });
            }).catch(
                error => {
                    this.onError(error);
                }
            );
        } else {
            console.log("this is not a group");
            //create group and add both of them to it
            let seasonID: string = this._contextFeature.seasonId;
            let parentID = this._contextFeature.uniqueId;
            let index = this.getSubFeatures(this._contextFeature).indexOf(this._selectedTarget);
            var mxGroup: Feature = new Feature();
            mxGroup.seasonId = seasonID;
            if (this.isConfiguration()) {
                mxGroup.type = "CONFIG_MUTUAL_EXCLUSION_GROUP";
            } else {
                if (this.isOrderRule) {
                    mxGroup.type = "ORDERING_RULE_MUTUAL_EXCLUSION_GROUP";
                } else {
                    //PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP
                    if (this.isPurchaseOption) {
                        mxGroup.type = "PURCHASE_OPTIONS_MUTUAL_EXCLUSION_GROUP";
                    } else {
                        if (this.isPurchase) {
                            mxGroup.type = "ENTITLEMENT_MUTUAL_EXCLUSION_GROUP";
                        } else {
                            mxGroup.type = "MUTUAL_EXCLUSION_GROUP";
                        }
                    }

                }
            }

            mxGroup.internalUserGroups = [];
            console.log(mxGroup);
            this._airLockService.addFeature(mxGroup, seasonID, this._branch.uniqueId, parentID).then(result => {
                console.log("created MXgroup");
                let fetchedMXG: Feature = result;
                let mxId: string = fetchedMXG.uniqueId;
                // alert("added MX group to "+this._contextFeature.name);
                //get context feature again


                this._airLockService.getFeature(mxId, this._branch.uniqueId).then(res => {
                    console.log("retrieved the mxGroup we created");
                    console.log(res);
                    // alert("fetched MX group");
                    let fmxGroup: Feature = res;
                    //now update the context feature
                    if (this.isConfiguration()) {
                        fmxGroup.configurationRules = [this._selectedTarget, this._feature];
                    } else {
                        if (this.isOrderRule) {
                            if (!this._selectedTarget.defaultIfAirlockSystemIsDown) {
                                this._selectedTarget.defaultIfAirlockSystemIsDown = false;
                            }
                            if (!this._feature.defaultIfAirlockSystemIsDown) {
                                this._feature.defaultIfAirlockSystemIsDown = false;
                            }
                            fmxGroup.orderingRules = [this._selectedTarget, this._feature];
                        } else {
                            fmxGroup.features = [this._selectedTarget, this._feature];
                        }
                    }
                    fmxGroup.defaultIfAirlockSystemIsDown = false;
                    fmxGroup.internalUserGroups = [];
                    this._airLockService.updateFeature(fmxGroup, this._branch.uniqueId).then(result => {
                        console.log("MX group updated: added both features as children");
                        // alert("MX group updated: added both features as children");
                        //get the mxGroup again
                        this._airLockService.getFeature(fmxGroup.uniqueId, this._branch.uniqueId).then(rsp => {
                            // alert("got fmx group (again");
                            console.log("got the fmx group again");
                            console.log(rsp);
                            fmxGroup = rsp;
                            /// get the context feature again
                            this._airLockService.getFeature(parentID, this._branch.uniqueId).then(p => {
                                console.log("got parent feature");
                                console.log(p);
                                let newParent: Feature = p;
                                let newIndex = -1;//newParent.features.indexOf(fmxGroup);
                                let newFeatures = [];
                                var isAdded: boolean = false;
                                for (let idx in this.getChildren(newParent)) {
                                    let f: Feature = this.getChildren(newParent)[idx];
                                    if (+idx == +index) {
                                        console.log("added once:" + idx);
                                        isAdded = true;
                                        newFeatures.push(fmxGroup);
                                    }
                                    if (f.uniqueId == mxId) {
                                        console.log("deleted once:" + idx);
                                        newIndex = +idx;
                                        // itemsToDelete.push(f);
                                    } else {
                                        console.log("push item");
                                        newFeatures.push(f);
                                    }
                                }
                                //fix adding last
                                if (isAdded == false) {
                                    console.log("added in the end");
                                    newFeatures.push(fmxGroup);
                                }
                                if (this.isConfiguration()) {
                                    newParent.configurationRules = newFeatures;
                                } else {
                                    if (this.isOrderRule) {
                                        newParent.orderingRules = newFeatures;
                                        if (!newParent.defaultIfAirlockSystemIsDown) {
                                            newParent.defaultIfAirlockSystemIsDown;
                                        }
                                    } else {
                                        newParent.features = newFeatures;
                                    }
                                }

                                console.log("added to new location");
                                console.log(this.getChildren(newParent));
                                this._airLockService.updateFeature(newParent, this._branch.uniqueId).then(re => {
                                    console.log("mx in context moved");
                                    // alert("mx in context moved");
                                    ////////THE END
                                    this.loading = false;
                                    this.onSave.emit(null);
                                    this.close();
                                    this._airLockService.notifyDataChanged("success-notification", {
                                        title: "Success",
                                        message: "Added the " + this.getType() + " " + featName
                                    });
                                    /////////////////////////

                                }).catch(err => {
                                    console.log("move mx in context failed");
                                    console.log(err);
                                    this.onError(err);
                                });


                            }).catch(error => {
                                this.onError(error);
                            });
                        }).catch(eerr => {
                            this.onError(eerr);
                        });


                    }).catch(error => {
                        this.onError(error);
                    });

                    ////////////////////////

                }).catch(error => {
                    this.onError(error);
                });
            }).catch(error => {
                this.onError(error);
            });
        }

    }

    onError(error: any) {
        this.loading = false;
        console.log(`Failed to add to group: ${error}`);
        // alert('Failed to add to group/feature. Please try again.');
        this.handleError(error);
    }

    close() {
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        this.create(errorMessage);
    }

    getChildren(fromItem: Feature): Feature[] {
        if (fromItem) {
            if (this.isConfiguration()) {
                return fromItem.configurationRules;
            } else {
                if (this.isOrderRule) {
                    return fromItem.orderingRules;
                } else {
                    if (this.isPurchaseOption) {
                        return (fromItem as InAppPurchase).purchaseOptions;
                    } else {

                        if (this.isPurchase) {
                            return (fromItem as InAppPurchase).entitlements;
                        } else {

                            return fromItem.features;
                        }
                    }
                }
            }
        } else {
            return null;
        }

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
        this.toastrService.error(message, "Failed to add to group/feature.", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    withOverride() {
        this._notificationService.create("pero", "peric", "success", {
            timeOut: 0,
            clickToClose: false,
            maxLength: 3,
            showProgressBar: true,
            theClass: "overrideTest"
        });
    }

    removeAll() {
        this._notificationService.remove();
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////
}

