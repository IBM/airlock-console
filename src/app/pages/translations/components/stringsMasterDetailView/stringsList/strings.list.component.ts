/**
 * Created by yoavmac on 18/08/2016.
 */

import {
    AfterViewChecked,
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {StringToTranslate} from "../../../../../model/stringToTranslate";
import {AirlockService} from "../../../../../services/airlock.service";
import {FeatureUtilsService} from "../../../../../services/featureUtils.service";
import {Subject} from 'rxjs';
import {GlobalState} from "../../../../../global.state";

import {Season} from "../../../../../model/season";
import {StringsService} from "../../../../../services/strings.service";
import {EditStringModal} from "../../../../../@theme/modals/editStringModal";
import {NbDialogService, NbPopoverDirective} from "@nebular/theme";
import {StringUsageModal} from "../../../../../@theme/modals/stringUsageModal";
import {VerifyActionModal, VerifyDialogType} from "../../../../../@theme/modals/verifyActionModal";
import {ConfirmActionModal} from "../../../../../@theme/modals/confirmActionModal";

//Modal views
// import {VerifyActionModal, VeryfyDialogType} from "../../../../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
// import {StringUsageModal} from "../../../../../theme/airlock.components/stringUsageModal/stringUsageModal.component";
// import {EditStringModal} from "../../../../../theme/airlock.components/editStringModal/editStringModal.component";

@Component({
    selector: 'strings-list',
    styleUrls: ['./strings.list.scss'],
    templateUrl: './strings.list.html'
})
export class StringList implements OnChanges, AfterViewInit, AfterViewChecked, OnInit, OnDestroy {

    loading: boolean = false;
    viewChanged: boolean = false;
    public status: { openId: string } = {openId: null};
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Input() _strings: StringToTranslate[] = [];
    @Input() _selectedString: StringToTranslate = null;
    @Input() selectedSeason: Season = null;
    @Input() supportedLocales: string[];
    @Output() onStringsSelectionChanged = new EventEmitter();
    @Output() reloadTranslations: EventEmitter<any> = new EventEmitter();
    curSelectedString: StringToTranslate = null;
    @Input() parentSubject: Subject<any>;

    // @Input() verifyActionModal: VerifyActionModal;

    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService) {
    }

    ngOnInit() {
        console.log("StringList ngOnInit");

        // if(this.parentSubject != null){
        //     this.parentSubject.subscribe(this.onEvent.bind(this));
        // }
    }

    onEvent(data: any) {
        console.log("StringList onEvent");
        console.log(this.curSelectedString);
        if (this.curSelectedString != null) {
            this.onSelect(this.curSelectedString)
            // this.onStringsSelectionChanged.emit(this.curSelectedString);
        }
    }

    ngOnDestroy() {
        // needed if child gets re-created (eg on some model changes)
        // note that subsequent subscriptions on the same subject will fail
        // so the parent has to re-create parentSubject on changes
        // this.parentSubject.unsubscribe();
    }

    showEditString(_selectedString: StringToTranslate) {
        this.modalService.open(EditStringModal, {
            closeOnBackdropClick: false,
            context: {
                loading: true,
                selectedString: _selectedString,
            }
        })
        //// this.valid = true;
        //         // this.loading = true;
        //         // this._airLockService.getStringFullInformation(str.uniqueId).then(res => {
        //         //     this.loading = false;
        //         //     this.objToSend = res;
        //         //     if (this.modal != null) {
        //         //         this.modal.open();
        //         //     }
        //         // }).catch(error => {
        //         //
        //         // });
        // this.editStringModal.open(_selectedString);
    }

    ngAfterViewChecked() {
        if (this.viewChanged) {
            this.viewChanged = false;
            setTimeout(() => {
                this.loading = false;
            }, 100);
        }

    }

    ngAfterViewInit() {
        if (this.viewChanged) {
            this.viewChanged = false;
            setTimeout(() => {
                this.loading = false;
            }, 100);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.viewChanged = true;
        if (this.curSelectedString != null) {
            var isSelected: boolean = false;
            var newSelectedString: StringToTranslate = null;
            for (let s of this._strings) {
                if (s.uniqueId == this.curSelectedString.uniqueId) {
                    isSelected = true;
                    newSelectedString = s;
                }
            }
            if (!isSelected) {
                this.onSelect(null);
            } else {
                this.onSelect(newSelectedString);
            }
        }else if (this._strings.length > 0){
            this.curSelectedString = this._strings[0];
            this.onStringsSelectionChanged.emit(this._strings[0]);
        }

        // for (let propName in changes) {
        //     let chng = changes[propName];
        //     let cur  = JSON.stringify(chng.currentValue);
        //     let prev = JSON.stringify(chng.previousValue);
        //     // console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
        // }
    }

    getStringStatus(status: string): string {
        if (status == 'TRANSLATION_COMPLETE')
            return "Status: Translation Completed";
        if (status == 'IN_TRANSLATION')
            return "Status: In Translation";
        if (status == 'REVIEWED_FOR_TRANSLATION') {
            return "Status: Review Complete";
        }
        if (status == 'READY_FOR_TRANSLATION') {
            return "Status: Ready for Review";
        }
        if (status == 'NEW_STRING')
            return "Status: New String";
        return status;
    }

    getNumberOfSupportedLocales(stringToTranslate: StringToTranslate) {
        // if(this.supportedLocales != null){
        //     return this.supportedLocales.length;
        // }else{
        return stringToTranslate.translations.length;
        // }
    }

    getNumberOfTranslatedLocales(stringToTranslate: StringToTranslate) {
        var counter: number = 0;
        for (let item of stringToTranslate.translations) {
            if (item.translationStatus == 'TRANSLATED' || item.translationStatus == 'OVERRIDE') {
                counter++;
            }
        }
        return counter;
    }

    onSelect(stringToTranslate: StringToTranslate) {
        this.curSelectedString = stringToTranslate;
        this.onStringsSelectionChanged.emit(stringToTranslate);
    }

    shouldDisableActions(s: StringToTranslate): boolean {
        let shouldDisable = !(this.canUserEditString(s) ||
            this.canMarkForTranslation(s) ||
            this.canReviewForTranslation(s) ||
            this.canSendForTranslation(s) ||
            this.canUserChangeProduction() ||
            this.canUserCopyString() ||
            this.canUserExportString() ||
            this.canViewUsage(s) ||
            this.canUserDeleteString(s));
        return shouldDisable;
    }

    canUserEditString(stringToTranslate: StringToTranslate) {
        if (stringToTranslate.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }

    markStringForTranslation(stringToTranslate: StringToTranslate) {
        this.loading = true;
        this._airlockService.markStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading = false;
            this.reloadTranslations.emit(null);
            this._airlockService.notifyDataChanged("success-notification", {
                title: "Success",
                message: this._stringsSrevice.getString("mark_for_translation_success_message")
            });
        }).catch(error => {
            console.log(error);
            this.loading = false;
            this._airlockService.notifyDataChanged("error-notification", FeatureUtilsService.parseErrorMessage(error));
        });
    }

    sendStringForTranslation(stringToTranslate: StringToTranslate) {
        this.loading = true;
        this._airlockService.sendStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading = false;
            this.reloadTranslations.emit(null);
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
    }

    reviewStringForTranslation(stringToTranslate: StringToTranslate) {
        this.loading = true;
        this._airlockService.reviewStringForTranslation(this.selectedSeason.uniqueId, [stringToTranslate.uniqueId]).then(res => {
            this.loading = false;
            this.reloadTranslations.emit(null);
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
    }

    copyString(stringToCopy: StringToTranslate) {
        this._airlockService.setCopiedStrings([stringToCopy.uniqueId])
        this.popover.hide();
    }

    exportString(stringToExport: StringToTranslate) {
        this._airlockService.downloadStrings(this.selectedSeason.uniqueId, [stringToExport.uniqueId]);
        this.popover.hide();
    }

    canUserDeleteString(stringToTranslate: StringToTranslate) {
        if (stringToTranslate.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }

    }

    canUserChangeProduction() {
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }

    canMarkForTranslation(stringToTranslate: StringToTranslate) {
        if (stringToTranslate.status != 'NEW_STRING') {
            return false;
        }
        if (stringToTranslate.stage == 'PRODUCTION') {
            return this._airlockService.isAdministrator() || this._airlockService.isProductLead() || this._airlockService.isUserHasStringTranslateRole();
        } else {
            return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
        }
    }

    canShowActionsMenu() {
        return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
    }

    canReviewForTranslation(stringToTranslate: StringToTranslate) {
        if (stringToTranslate.status != 'READY_FOR_TRANSLATION') {
            return false;
        }
        return this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
    }

    canSendForTranslation(stringToTranslate: StringToTranslate) {
        if (stringToTranslate.status != 'REVIEWED_FOR_TRANSLATION') {
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

    canViewUsage(s: StringToTranslate) {
        return !this._airlockService.isViewer() || this._airlockService.isUserHasStringTranslateRole();
    }

    viewStringUsage(s: StringToTranslate) {
        this.popover.hide();
        this.modalService.open(StringUsageModal, {
            closeOnBackdropClick: false,
            context: {
                key: s.key,
                stringId: s.uniqueId,
            }
        })
        // this.stringUsageModal.open(s.uniqueId, s.key);
    }

    getDeleteColor(str: StringToTranslate) {
        if (str.stage == 'PRODUCTION') {
            return "rgba(0,0,0,0.2)";
        } else {
            return "red";
        }
    }

    changeStage(selectedString: StringToTranslate) {
        let message = "";
        if (selectedString.stage == 'PRODUCTION') {
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
                this._changeStage(selectedString);
            }
        });
    }

    _changeStage(selectedString: StringToTranslate) {
        this.loading = true;
        this._airlockService.getStringFullInformation(selectedString.uniqueId).then(res => {
            if ((res as any).stage == "DEVELOPMENT") {
                (res as any).stage = "PRODUCTION";
            } else {
                (res as any).stage = "DEVELOPMENT";
            }
            this._airlockService.updateStringToTranslation(selectedString.uniqueId, res).then(() => {
                this.loading = false;
                this.reloadTranslations.emit(null);
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

    canShowDelete() {
        return this._airlockService.isAdministrator;
    }

    reloadString(event: any) {
        this.reloadTranslations.emit(null);
    }

    deleteString(item: StringToTranslate) {
        if (item.stage != 'PRODUCTION') {
            this.remove(item.uniqueId, item.key);
        }
    }

    remove(id: string, name: String) {
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
                    this.reloadTranslations.emit(null);
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

    openMenu(id: string) {
        console.log("click:" + id);
        // if(this.status.openId == id){
        //     this.status = {openId: null};
        // }else {
        this.status = {openId: null};
        setTimeout(() => {
            this.status = {openId: id};
        }, 50);
        // }
    }
}
