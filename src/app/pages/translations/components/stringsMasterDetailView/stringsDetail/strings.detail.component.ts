import {ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, Output, ViewChild} from '@angular/core';
import {AirlockService} from "../../../../../services/airlock.service";
import {StringToTranslate} from "../../../../../model/stringToTranslate";
import {Season} from "../../../../../model/season";
import {Subject} from 'rxjs';
import {FeatureUtilsService} from "../../../../../services/featureUtils.service";
import {ConfirmActionModal} from "../../../../../@theme/modals/confirmActionModal";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {EditStringModal} from "../../../../../@theme/modals/editStringModal";
import {VerifyActionModal, VerifyDialogType} from "../../../../../@theme/modals/verifyActionModal";
import {OverrideStringModal} from "../../../../../@theme/modals/overrideStringModal";

//Model viewes
// import {OverrideStringModal} from "../../../../../theme/airlock.components/overrideStringModal/overrideStringModal.component";
// import {StringIssueModal} from "../../../../../theme/airlock.components/stringIssueModal/stringIssueModal.component";


@Component({
    selector: 'string-detail',
    styleUrls: ['./strings.detail.scss'],
    templateUrl: './strings.detail.html'
})
export class StringDetail implements OnDestroy {

    @Input() _selectedString: StringToTranslate = null;
    @Input() selectedSeason: Season = null;
    @Input() supportedLocales: string[];
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    loading: boolean = false;
    mapTranslations: {} = null;
    private sub: any = null;
    @Input()
    parentSubject: Subject<any>;
    // @Input() verifyActionModal: VerifyActionModal;
    @Output() reloadTranslations: EventEmitter<any> = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                 private cd: ChangeDetectorRef,
                private modalService: NbDialogService) {
    }

    isSupportedLocale(locale: string) {
        if (!this.supportedLocales) {
            return true;
        }
        return this.supportedLocales.some(x => x == locale);
    }

    public onEditString(str) {
        this.showEditString();
    }

    showEditString() {
        this.modalService.open(EditStringModal, {
            closeOnBackdropClick: false,
            context: {
                loading: true,
                selectedString: this._selectedString,
            }
        })
        // this.editStringModal.open(this._selectedString);
    }

    canViewIssues() {
        if (this._selectedString.stage == 'PRODUCTION') {
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        } else {
            return !this._airLockService.isViewer();
        }
    }

    canUserOverrideLocale() {
        if (this._airLockService.isUserHasStringTranslateRole()) {
            return true;
        }
        if (this._selectedString.stage == 'PRODUCTION') {
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        } else {
            return !this._airLockService.isViewer();
        }
    }

    canUserCancelOverrideLocale(translationStatus: string) {
        return translationStatus == 'OVERRIDE' && this.canUserOverrideLocale();
    }

    canUserEditString() {
        if (this._airLockService.isUserHasStringTranslateRole()) {
            return true;
        }
        if (this._selectedString.stage == 'PRODUCTION') {
            return this._airLockService.isAdministrator() || this._airLockService.isProductLead();
        } else {
            return !this._airLockService.isViewer();
        }

    }

    canUserChangeProduction() {
        return (this._airLockService.isProductLead() || this._airLockService.isAdministrator() || this._airLockService.isUserHasStringTranslateRole())
    }

    releaseToProduction() {
        let message = "";
        if (this._selectedString.stage == 'PRODUCTION') {
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
                this._releaseToProduction();
            }
        });

    }

    _releaseToProduction() {
        this.loading = true;
        this._airLockService.getStringFullInformation(this._selectedString.uniqueId).then(res => {
            (res as any).stage = "PRODUCTION";
            this._airLockService.updateStringToTranslation(this._selectedString.uniqueId, res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to releaseToProduction: ${error}`);
                    this.loading = false;
                    this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

                }
            );

        }).catch(error => {
            this.loading = false;
            this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

        });
    }

    revertToDevelopment() {
        let message = "";
        if (this._selectedString.stage == 'PRODUCTION') {
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
                this._revertToDevelopment();
            }
        });

    }

    _revertToDevelopment() {
        this.loading = true;
        this._airLockService.getStringFullInformation(this._selectedString.uniqueId).then(res => {
            (res as any).stage = "DEVELOPMENT";
            this._airLockService.updateStringToTranslation(this._selectedString.uniqueId, res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
            }).catch(
                error => {
                    console.log(`Failed to revertToDevelopment: ${error}`);
                    this.loading = false;
                    this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
                }
            );

        }).catch(error => {
            this.loading = false;
            this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));

        });
    }

    reloadString(event: any) {
        this.reloadTranslations.emit(null);
    }

    overrideTranslation(stringId: string, locale: string, str: string, translationStatus: string) {
        this.popover.hide();
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
        this.modalService.open(OverrideStringModal, {
            closeOnBackdropClick: false,
            context: {
                stringToOverride: str,
                stringId: stringId,
                locale: locale,
                key: this._selectedString.key,
                allowRevert: (translationStatus == 'OVERRIDE')
            }
        })
    }

    cancelOverrideTranslation(stringId: string, locale: string, str: string) {
        this.popover.hide();
        this._airLockService.cancelOverrideStringToTranslation(stringId, locale).then(() => {
            this.loading = false;
            this.reloadTranslations.emit(null);
        }).catch(
            error => {
                this.loading = false;
                this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
            }
        );
    }

    getTranslationForLocale(stringId: string, locale: string) {
        this.getTranslationForString(stringId, [locale]);

    }

    getTranslationForString(stringId: string, locale: Array<string> = null) {
        this._airLockService.getStringsToTranslationForStringIds(this.selectedSeason.uniqueId, [stringId], locale, true).then(resp => {
            var translations = resp;
            var message: string = "";
            if (translations.length > 0) {
                for (let item of translations[0].translations) {
                    message += item.translation + "\n"
                }
            }
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    shouldDisplaySubmit: false,
                    title: 'Translation',
                    message: message,
                    defaultTitle: 'OK'
                }
            })
            // this.showMessageModal.open("Translation", message);

        }).catch(
            error => {
                this._airLockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
                this.loading = false;
            }
        );
    }

    showStringIssues(stringId: string, locale: string, issueStatus: string, key: string, isTranslation: boolean) {
        // this.stringIssueModal.open(stringId, locale, issueStatus, key, isTranslation);
    }

    shouldDisableActions(s: StringToTranslate): boolean {
        let shouldDisable = !(this.canUserOverrideLocale() || this.canViewIssues());
        return shouldDisable;
    }

    canShowActionsMenu() {
        return !this._airLockService.isViewer() || this._airLockService.isUserHasStringTranslateRole();
    }

    getStringStatus(status: string): string {
        if (status == 'TRANSLATION_COMPLETE')
            return "Translation Completed";
        if (status == 'IN_TRANSLATION')
            return "In Translation";
        if (status == 'NEW_STRING')
            return "New String";
        if (status == 'REVIEWED_FOR_TRANSLATION') {
            return "Reviewed For Translation";
        }
        if (status == 'READY_FOR_TRANSLATION') {
            return "Ready For Translation";
        }
        return status;
    }

    ngOnDestroy() {
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
    }

}
