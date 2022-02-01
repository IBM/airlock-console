/**
 * Created by yoavmac on 17/08/2016.
 */

import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {AirlockService} from "../../../../services/airlock.service";
import {Product} from "../../../../model/product";
import {Season} from "../../../../model/season";
import {AuthorizationService} from "../../../../services/authorization.service";
import {StringsService} from "../../../../services/strings.service";
import {Branch} from "../../../../model/branch";
import {DomSanitizer} from "@angular/platform-browser";
import {FeatureUtilsService} from "../../../../services/featureUtils.service";
import {NbDialogService, NbGlobalLogicalPosition, NbPopoverDirective, NbToastrService} from "@nebular/theme";
import {CohortsSettingsModal} from "../../../../@theme/modals/cohortsSettingsModal";
import {CohortsData} from "../../../../model/cohortsData";
import {SeasonModal} from "../../../../@theme/modals/seasonModal";
import {ConfirmActionModal} from "../../../../@theme/modals/confirmActionModal";
import {EditBranchModal} from "../../../../@theme/modals/editBranchModal";
import {DocumentlinksModal} from "../../../../@theme/airlock.components/documentlinksModal";
import {EditInputSchemaModal} from "../../../../@theme/modals/editInputSchemaModal";
import {BranchUsageModal} from "../../../../@theme/modals/branchUsageModal";

@Component({
    selector: 'product-detail',
    styleUrls: ['./product-detail.scss'],
    templateUrl: './product-detail.html'
})
export class ProductDetail {
    _product: Product;
    _season: Season;
    _productCopy: Product;
    _isDisaplyOnly: boolean = false;
    _isHideDowloadLinks: boolean = false;
    loading: boolean = false;
    branches: Branch[] = null;
    canUseBranches: boolean;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Output() onProductUpdated = new EventEmitter();
    @Output() onSeasonsChanged = new EventEmitter();
    ruleUtilitieInfo: string;
    ruleInputSchemaSample: string;
    public status: { openId: string } = {openId: null};

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _stringsSrevice: StringsService,
                private sanitizer: DomSanitizer,
                private toastrService: NbToastrService,
                private modalService: NbDialogService) {
        this.setUserCreds();
    }

    setUserCreds() {
        this._isDisaplyOnly = (this._airlockService.isEditor() || this._airlockService.isViewer());
        this._isHideDowloadLinks = this._airlockService.isViewer();
    }

    isShowOptions() {
        return (!this._airlockService.isViewer());
    }

    isShowAddSeason() {
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead();
    }

    refreshTable() {
    }

    isShowCohortsSettings() {
        let hasCohorts = this._product.capabilities.includes("COHORTS");
        let canSeeCohorts = this._airlockService.isUserHasAnalyticsViewerRole() || this._airlockService.isUserHasAnalyticsEditorRole();
        let isProductLead = this._airlockService.isProductLead() || this._airlockService.isAdministrator();
        return hasCohorts && canSeeCohorts && isProductLead;
    }

    showCohortsSettings() {
        this._airlockService.getCohorts(this._product.uniqueId).then((container) => {
            this.modalService.open(CohortsSettingsModal, {
                closeOnBackdropClick: false,
                context: {
                    cohortsData: CohortsData.clone(container)
                }
            })
            // this._cohortsSettingsModal.open(container);
        }).catch(
            error => {
                console.log("error loading cohorts:" + error);
                this.handleError(error);
            }
        );
    }

    isShowEditSeason() {
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead();
    }

    @Input()
    set product(p: Product) {
        var isTheSameProd = (p != null && this._product != null && p.uniqueId == this._product.uniqueId);
        this._product = p;
        this.setUserCreds();
        // this._airlockService.setCapabilities(p);
        this.canUseBranches = this._product.capabilities.includes("BRANCHES");
        this._productCopy = new Product(p);
        if (!isTheSameProd) {
            if (p != null && p.seasons != null && p.seasons.length > 0) {
                this.selectSeason(p.seasons[p.seasons.length - 1]);
            } else {
                this.branches = null;
                this._season = null;
            }
        } else {
            if (this._season) {
                this.selectSeason(this._season);
            } else if (p != null && p.seasons != null && p.seasons.length > 0) {
                this.selectSeason(p.seasons[p.seasons.length - 1]);
            }
        }
    }

    onSave() {
        if (this.didProductChange() && this._productCopy.name.trim() !== "" && this._productCopy.codeIdentifier.trim() != "") {
            let message = `Are you sure you want to save the changes to the product ${this._product.name}?`;
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
        }
    }

    getProductFollowTooltip(isfollowed: boolean) {
        if (!this._airlockService.isHaveJWTToken())
            return this.getString("notifications_nonAuth_tooltip");
        if (isfollowed) {
            return this.getString('notifications_unfollow_tooltip_products');
        } else {
            return this.getString('notifications_follow_tooltip_products');
        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getStringWithFormat(name: string, ...format: string[]) {
        return this._stringsSrevice.getStringWithFormat(name, ...format);
    }

    doNothing(event) {
        if (event) {
            event.stopPropagation();
        }
    }
    starClicked(event: Event, product: Product) {
        if (event) {
            event.stopPropagation();
        }
        if (!this._airlockService.isHaveJWTToken())
            return;
        if (product.isCurrentUserFollower) {
            this.loading = true;
            this._airlockService.unfollowProduct(product.uniqueId)
                .then(response => {
                    product.isCurrentUserFollower = false;
                    this.loading = false;
                    this.onProductUpdated.emit(product);
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_unfollow_product_success", product.name)
                    });
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in unfollow product');

                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_unfollow_product_error"));
                });
        } else {
            this.loading = true;
            this._airlockService.followProduct(product.uniqueId)
                .then(response => {
                    product.isCurrentUserFollower = true;
                    this.onProductUpdated.emit(product);
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getStringWithFormat("notifications_follow_product_success", product.name)
                    });
                })
                .catch(error => {
                    this.loading = false;
                    console.log('Error in follow product');
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification", this.getString("notifications_follow_product_error"));
                });
        }
    }

    canShowDeleteBranch(b: Branch) {
        if (b.uniqueId == "MASTER") {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    canShowEditBranch(b: Branch) {
        if (b.uniqueId == "MASTER") {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    deleteBranch(b: Branch) {
        let message = `Are you sure you want to delete this branch (` + b.name + `)?`;
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                console.log("confirmed");
                this.loading = true;
                this._airlockService.deleteBranch(b.uniqueId).then(response => {
                    console.log(response);
                    this.showBranches(this._season);
                    this.onProductUpdated.emit(this._product);
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: this.getString("notifications_delete_feature_success")
                    });
                })
            }
        });
    }

    openMenu(event: Event, id: string) {
        if (event) {
            event.stopPropagation();
        }
        this.status = {openId: null};
        setTimeout(() => {
            this.status = {openId: id};
        }, 50);
    }

    _save() {
        this.loading = true;
        let seasons = this._productCopy.seasons;
        this._productCopy.seasons = null;
        this._airlockService.updateProduct(this._productCopy)
            .then(response => {
                this._productCopy.seasons = seasons;
                // alert(`Product ${response.name} was updated successfully!`);
                this._airlockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: `Product ${response.name} was updated successfully!`
                });
                this.onProductUpdated.emit(response);
                this.loading = false;
            })
            .catch(error => {
                this._productCopy.seasons = seasons;
                this.loading = false;
                this._airlockService.navigateToLoginIfSessionProblem(error);
                let errorMessage = this._airlockService.parseErrorMessage(error, "");
                this._airlockService.notifyDataChanged("error-notification", `Failed to update product: ${errorMessage}`);
            });
    }

    onReset() {
        console.log("reset called");
        if (this.didProductChange()) {
            let message = 'Are you sure you want to reset all fields to their original values?';
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    message: message,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed){
                    this._productCopy = new Product(this._product);
                }
            });
        }
    }

    onAddSeason() {
        this._season = null;
        this.modalService.open(SeasonModal, {
            closeOnBackdropClick: false,
            context: {
                _product: this._product,
                _isAddNew: true,
                _isLastSeason: false
            }
        }).onClose.subscribe( () => {
                this.onProductUpdated.emit(this._product);
        });
    }

    onEditBranch(branch: Branch) {
        this.modalService.open(EditBranchModal, {
            closeOnBackdropClick: false,
            context: {
                _branch: Branch.clone(branch),
            }
        })
    }

    branchEdited(branch: Branch) {
        this.showBranches(this._season);
        this.onProductUpdated.emit(this._product);
    }

    selectSeason(season: Season) {
        this._season = new Season(season);
        this.status = {openId: null};
        this.showBranches(this._season, false);
    }

    showBranches(season: Season, showLoading = true) {
        if (this.canUseBranches) {
            if (showLoading){
                this.loading = true;
            }
            this._airlockService.getBranches(season.uniqueId)
                .then(response => {
                    this.branches = response;
                    this.loading = false;
                })
                .catch(error => {
                    this.branches = null;
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    let errorMessage = this._airlockService.parseErrorMessage(error, "");
                    this._airlockService.notifyDataChanged("error-notification", `Failed to load branches: ${errorMessage}`);
                });
        }
    }

    onEditSeason(season: Season) {
        this._season = season;
        var lastSeason = this._product.seasons[this._product.seasons.length - 1] == season;
        this.popover.hide();
        this.modalService.open(SeasonModal, {
            closeOnBackdropClick: false,
            context: {
                _product: this._product,
                _isAddNew: false,
                _season: season,
                _isLastSeason: lastSeason
            }
        }).onClose.subscribe( deleted => {
            if (deleted){
                this._season = null;
            }
            this.onProductUpdated.emit(this._product);
        });
        // this._seasonModal.open(false, lastSeason);
    }

    onEditInputSchema(season: Season) {
        this.popover.hide();
        this.loading = true;
        this._airlockService.getInputSchema(season.uniqueId)
            .then(response => {
                const editMode = this.isShowEditSchema();
                this.modalService.open(EditInputSchemaModal, {
                    closeOnBackdropClick: false,
                    context: {
                        season: season,
                        isOnlyDisplayMode: !editMode,
                        inputSchema: response,
                    },
                })
                // this._editInputSchemaModal.open(response, season, editMode);
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                this._airlockService.navigateToLoginIfSessionProblem(error);
                let errorMessage = this._airlockService.parseErrorMessage(error, "");
                this._airlockService.notifyDataChanged("error-notification", `Failed to update input schema: ${errorMessage}`);
            });
    }

    onDownloadBranchUsage(season: Season) {
        this.loading = true;
        this._airlockService.getBranchUsage(season.uniqueId).then(response => {
            let usage = response;
            let usageStr = this.getUsageString(season);
            this.modalService.open(BranchUsageModal, {
                closeOnBackdropClick: false,
                context: {
                    fileName: usageStr+".json",
                    text: usage
                }
            })
        }).catch(error => {
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            let errorMessage = this._airlockService.parseErrorMessage(error, "");
            this._airlockService.notifyDataChanged("error-notification", `Failed to download branch usage: ${errorMessage}`);
        });
        this.popover.hide();
    }

    getUsageString(season: Season) {
        var toRet = this._product.name + "_" + season.minVersion + (season.maxVersion ? "_to_" + season.maxVersion : "_and_up");
        return toRet;
    }

    isShowEditSchema() {
        if (this._airlockService.isGlobalUserProductLead() || this._airlockService.isGlobalUserAdministrator()) {
            return true;
        }
        return !this._airlockService.isViewer() && !this._airlockService.isEditor();
    }

    downloadSeason(season: Season) {
        this._airlockService.downloadSeasonFeatures(season);

    }

    onShowDocumentLinks(season: Season) {
        this.popover.hide();
        this.modalService.open(DocumentlinksModal, {
            closeOnBackdropClick: false,
            context: {
                seasonId: season.uniqueId,
                platforms: season.platforms,
            }
        });
    }

    seasonAdded(season: Season) {
        this.onSeasonsChanged.emit(season);
    }

    seasonEdited(season: Season) {
        this.onSeasonsChanged.emit(season);
    }

    seasonDeleted(season: Season) {
        if (season != null && this._season != null && season.uniqueId == this._season.uniqueId) {
            this._season = null;
        }
        this.onSeasonsChanged.emit(season);
    }

    private didProductChange(): boolean {
        return (this._product.name !== this._productCopy.name ||
            this._product.codeIdentifier !== this._productCopy.codeIdentifier ||
            this._product.description !== this._productCopy.description);
    }

    private arraysIdentical(arrayA, arrayB): boolean {
        if (!arrayA && !arrayB)
            return true;
        if ((arrayA && !arrayB) || (!arrayA && arrayB))
            return false;
        var i = arrayA.length;
        if (i != arrayB.length)
            return false;
        while (i--) {
            if (arrayA[i] !== arrayB[i])
                return false;
        }
        return true;
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to load cohorts. Please try again.";
        console.log("handleError in products:" + errorMessage);
        this.create(errorMessage);
    }

    create(message: string) {
        this.toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }
}
