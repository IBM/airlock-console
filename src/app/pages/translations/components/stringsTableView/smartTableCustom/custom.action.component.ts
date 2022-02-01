import {ChangeDetectorRef, Component, Input, OnInit, ViewChild} from "@angular/core";
import {ViewCell} from "ng2-smart-table";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {AirlockService} from "../../../../../services/airlock.service";
import {StringsService} from "../../../../../services/strings.service";
import {GlobalState} from "../../../../../global.state";
import {EditStringModal} from "../../../../../@theme/modals/editStringModal";
import {StringUsageModal} from "../../../../../@theme/modals/stringUsageModal";
import {FeatureUtilsService} from "../../../../../services/featureUtils.service";
import {VerifyActionModal, VerifyDialogType} from "../../../../../@theme/modals/verifyActionModal";
import {ConfirmActionModal} from "../../../../../@theme/modals/confirmActionModal";

@Component({
    template: `
        <button [nbPopover]="templateRef"
                nbPopoverPlacement="bottom" dropdownToggle class="btn btn-primary" id="user-profile-dd" [disabled]="!canUserOpenActions()">
            <i class="ion-settings"></i>
        </button>
        <ng-template #templateRef>
            <ul class="menu-items">
                <li class="dropdown-arr"></li>
                <li style="height: 30px" (click)="showEditString()" class="dropdown-item"  *ngIf="canUserEditString()"><a><i class="fa ion-compose"></i>Edit</a></li>
                <li style="height: 30px" (click)="markStringForTranslation()" class="dropdown-item" *ngIf="canMarkForTranslation()"><a><i class="fa ion-checkmark-round"></i>Mark for review</a></li>
                <li style="height: 30px" (click)="reviewStringForTranslation()" class="dropdown-item dropdown-li" *ngIf="canReviewForTranslation()"><a><i class="fa ion-ios-book"></i>Complete review</a></li>
                <li style="height: 30px" (click)="sendStringForTranslation()" class="dropdown-item" *ngIf="canSendForTranslation()"><a><i class="fa ion-android-send"></i>Send to translation</a></li>
                <li style="height: 30px" (click)="copyString()" class="dropdown-item"  *ngIf="canUserCopyString()"><a><i class="fa ion-ios-copy-outline"></i>Copy string</a></li>
                <li style="height: 30px" (click)="exportString()" class="dropdown-item"  *ngIf="canUserExportString()"><a><i class="fa ion-share"></i>Export string</a></li>
                <li style="height: 30px" class="dropdown-item dropdown-li" *ngIf="canViewUsage()" (click)="viewStringUsage()"><a><i class="eyeIcon fa fa-eye"></i>View usage</a></li>
                <li style="height: 30px" (click)="changeStage()" class="dropdown-item" *ngIf="canUserChangeProduction()"><a><i class="fa" [class.ion-code-working]="rowData?.stage!='DEVELOPMENT'" [class.fa-flag]="rowData?.stage=='DEVELOPMENT'"></i>{{rowData?.stage=='DEVELOPMENT'? 'Release to production' : 'Revert to development'}}</a></li>
                <li style="height: 30px" (click)="deleteString()" class="dropdown-item"  *ngIf="canUserDeleteString()"><a  class="signout destructive" [style.color]="getDeleteColor()" style="color: red;"><i class="fa ion-trash-b"></i>Delete</a></li>
            </ul>
        </ng-template>
  `,
})
export class CustomActionComponent implements ViewCell, OnInit {
    @Input() value: string | number;
    @Input() rowData: any;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    private loading: boolean;
    private currSeason;

    constructor(private _airlockService: AirlockService,
                private cd: ChangeDetectorRef,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService,
                private _state: GlobalState,
    ) {
    }

    ngOnInit(): void {
        this.currSeason = this._state.getData('features.currentSeason');
    }

    showEditString() {
        this.modalService.open(EditStringModal, {
            closeOnBackdropClick: false,
            context: {
                loading: true,
                selectedString: this.rowData,
            }
        })
        this.popover.hide();
    }

    canUserOpenActions() {
        return (this.canUserEditString() ||
            this.canMarkForTranslation() ||
            this.canReviewForTranslation() ||
            this.canSendForTranslation() ||
            this.canUserChangeProduction() ||
            this.canUserCopyString() ||
            this.canUserExportString() ||
            this.canViewUsage() ||
            this.canUserDeleteString());
    }

    canUserEditString() {
        if (this.rowData.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }

    canViewUsage() {
        return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
    }

    viewStringUsage() {
        this.popover.hide();
        this.modalService.open(StringUsageModal, {
            closeOnBackdropClick: false,
            context: {
                key: this.rowData.key,
                stringId: this.rowData.uniqueId,
            }
        })
    }

    markStringForTranslation() {
        this.loading = true;
        this._airlockService.markStringForTranslation(this.currSeason.uniqueId, [this.rowData.uniqueId]).then(res => {
            this.loading = false;
            // this.reloadTranslations.emit(null);TODO
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this._stringsSrevice.getString("mark_for_translation_success_message")
            });
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

        });
        this.popover.hide();
    }

    reviewStringForTranslation() {
        this.loading = true;
        this._airlockService.reviewStringForTranslation(this.currSeason.uniqueId, [this.rowData.uniqueId]).then(res => {
            this.loading = false;
            // this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this._stringsSrevice.getString("review_for_translation_success_message")
            });
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
        });
        this.popover.hide();
    }

    sendStringForTranslation() {
        this.loading = true;
        this._airlockService.sendStringForTranslation(this.currSeason.uniqueId, [this.rowData.uniqueId]).then(res => {
            this.loading = false;
            // this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this._stringsSrevice.getString("sent_for_translation_success_message")
            });
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

        });
        this.popover.hide();
    }

    canUserDeleteString() {
        if (this.rowData.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }

    canUserChangeProduction() {
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }

    canMarkForTranslation() {
        if (this.rowData.status != 'NEW_STRING') {
            return false;
        }
        if (this.rowData.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }
    }

    canReviewForTranslation() {
        if (this.rowData.status != 'READY_FOR_TRANSLATION') {
            return false;
        }
        return this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }

    canSendForTranslation() {
        if (this.rowData.status != 'REVIEWED_FOR_TRANSLATION') {
            return false;
        }
        return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
    }

    canUserCopyString() {
        return this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }

    canUserExportString() {
        return this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }


    copyString() {
        this.popover.hide();
        this._airlockService.setCopiedStrings([this.rowData.uniqueId])
    }

    exportString() {
        this.popover.hide();
        this._airlockService.downloadStrings(this.rowData.uniqueId, [this.rowData.uniqueId]);
    }

    getDeleteColor() {
        if (this.rowData.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    changeStage() {
        this.popover.hide();
        let message;
        if (this.rowData.stage == 'PRODUCTION') {
            message = 'Are you sure you want to revert the stage of this string to development?';
        } else {
            message = 'Are you sure you want to release this string to production?';
        }
        message += ` This operation can impact your app in production.`;
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                text: message,
                verifyModalDialogType: VerifyDialogType.STRING_TYPE,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._changeStage();
            }
        });
    }

    _changeStage() {
        this.loading = true;
        this._airlockService.getStringFullInformation(this.rowData.uniqueId).then(res => {
            if ((res as any).stage == "DEVELOPMENT") {
                (res as any).stage = "PRODUCTION";
            } else {
                (res as any).stage = "DEVELOPMENT";
            }
            this._airlockService.updateStringToTranslation(this.rowData.uniqueId, res).then(() => {
                this.loading = false;
                // this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to revertToDevelopment: ${error}`);
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
                }
            );

        }).catch(error => {
            this.loading = false;
            this._airlockService.navigateToLoginIfSessionProblem(error);
            this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

        });
    }

    deleteString() {
        if (this.rowData.stage != 'PRODUCTION') {
            this.remove(this.rowData.uniqueId, this.rowData.key);
        }
        this.popover.hide();
    }

    remove(id: string, name: string) {
        let message = 'Are you sure you want to delete this string (' + name + ")?";
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this.loading = true;
                this._airlockService.deleteStringToTranslation(id).then(() => {
                    this.loading = false;
                    // this.reloadTranslations.emit(null);
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "String deleted"
                    });
                }).catch(error => {
                    console.log(error);
                    this.loading = false;
                    this._airlockService.navigateToLoginIfSessionProblem(error);
                    this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
                });
            }
        });
    }
}
