import {
    Component,
    ViewEncapsulation,
    ViewChild,
    Input,
    Output,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import { EventEmitter } from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product";
import { TransparentSpinner } from "../transparentSpinner/transparentSpinner.service";
import { NotificationsService, SimpleNotificationsComponent } from "angular2-notifications";
import { Feature } from "../../../model/feature";
import { Experiment } from "../../../model/experiment";
import { Variant } from "../../../model/variant";
import { StringsService } from "../../../services/strings.service";

import { Subject } from 'rxjs/Subject';
import { ToastrService } from "ngx-toastr";
import { Stream } from "../../../model/stream";
import { AirlockNotification } from "../../../model/airlockNotification";

export enum VeryfyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE,
    STREAM_TYPE,
    NOTIFICATION_TYPE,
    ORDERING_RULE_TYPE,
    ENTITELMENT_TYPE,
    PURCHASE_OPTION_TYPE
}

@Component({
    selector: 'verify-action-modal',
    providers: [TransparentSpinner, NotificationsService],
    styles: [require('./verifyActionModal.scss')],
    // directives: [COMMON_DIRECTIVES, MODAL_DIRECTIVES, SimpleNotificationsComponent],
    template: require('./verifyActionModal.html'),
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class VerifyActionModal {

    @ViewChild('verifyActionModal') modal: ModalComponent;

    loading: boolean = false;
    validationNameString: string = "";
    feature: Feature = null;
    experiment: Experiment = null;
    variant: Variant = null;
    stream: Stream = null;
    notification: AirlockNotification = null;
    confirmSubfeatureStageChange: boolean;
    confirmRecursiveStageChange: boolean = false;
    title: string;
    verifyModalDialogType: VeryfyDialogType;
    text: string;
    showDiscard: boolean;
    // @Output() onActionApproved = new EventEmitter();
    private actionApproved = new Subject<string>();
    actionApproved$ = this.actionApproved.asObservable();
    private actionCanceld = new Subject<string>();
    actionCanceld$ = this.actionCanceld.asObservable();
    private actionDiscard = new Subject<string>();
    actionDiscard$ = this.actionDiscard.asObservable();

    constructor(private _airLockService: AirlockService, private _notificationService: NotificationsService,
                private cd: ChangeDetectorRef, private toastrService: ToastrService, private _stringsSrevice: StringsService) {
    }

    approve(value: string) {
        this.actionApproved.next(value);
    }


    open(text: string = "Are you sure you want to perform this action?", selectedObject: any = null, dialogType: VeryfyDialogType = VeryfyDialogType.FEATURE_TYPE, confirmSubfeatureStageChange: boolean = false, title: string = "Attention", showDiscard: boolean = false) {
        console.log("VerifyActionModal inside open");
        this.text = text;
        this.title = title;
        this.verifyModalDialogType = dialogType;
        this.confirmSubfeatureStageChange = confirmSubfeatureStageChange;
        this.confirmRecursiveStageChange = false;
        this.showDiscard = showDiscard;
        console.log("what type:", typeof selectedObject);

        switch (this.verifyModalDialogType) {
            case VeryfyDialogType.FEATURE_TYPE:
                this.feature = selectedObject;
                break;
            case VeryfyDialogType.PURCHASE_OPTION_TYPE:
                this.feature = selectedObject;
                break;
            case VeryfyDialogType.ENTITELMENT_TYPE:
                this.feature = selectedObject;
                break;
            case VeryfyDialogType.CONFIGURATION_TYPE:
                this.feature = selectedObject;
                break;
            case VeryfyDialogType.ORDERING_RULE_TYPE:
                this.feature = selectedObject;
                break;

            case VeryfyDialogType.EXPERIMENT_TYPE:
                this.experiment = selectedObject;
                break;
            case VeryfyDialogType.VARIANT_TYPE:
                this.variant = selectedObject;
                break;
            case VeryfyDialogType.STREAM_TYPE:
                this.stream = selectedObject;
                break;
            case VeryfyDialogType.NOTIFICATION_TYPE:
                this.notification = selectedObject;
                break;
            case VeryfyDialogType.STRING_TYPE:
                break;
            default:
                console.log('Failed to detect the VerifyDialogType');
                break;
        }

        if (this.modal) {
            this.cd.markForCheck();
            this.removeAll();
            this.modal.open();
        }
    }

    getConfirmTitle() {
        if (this.confirmSubfeatureStageChange && this.validationNameString && !this.confirmRecursiveStageChange) {
            return this.getString('confirm_recursive_tooltip');
        }
        return "";
    }

    save() {
        if (this.confirmSubfeatureStageChange) {
            if (!this.validationNameString && this.feature != null || !this.confirmRecursiveStageChange) {
                return;
            }
        }
        console.log("VerifyActionModal save");
        if (this.isValid()) {
            this.approve(null);
            // this.onActionApproved.emit(null);
            this.close();
        } else {
            this.create('Please re-type the validation name to perform the selected action');
        }
    }

    getType(): string {
        switch (this.verifyModalDialogType) {
            case VeryfyDialogType.FEATURE_TYPE:
                return "feature";
            case VeryfyDialogType.PURCHASE_OPTION_TYPE:
                return "purchase option";
            case VeryfyDialogType.ENTITELMENT_TYPE:
                return "entitlement";
            case VeryfyDialogType.CONFIGURATION_TYPE:
                return "configuration";
            case VeryfyDialogType.ORDERING_RULE_TYPE:
                return "ordering rule";
            case VeryfyDialogType.EXPERIMENT_TYPE:
                return "experiment";
            case VeryfyDialogType.VARIANT_TYPE:
                return "variant";
            case VeryfyDialogType.STREAM_TYPE:
                return "stream";
            case VeryfyDialogType.NOTIFICATION_TYPE:
                return "notification";
            case VeryfyDialogType.STRING_TYPE:
                return "string";
            default:
                console.log('Failed to detect the VerifyDialogType');
                return "item";
        }
    }

    getName(): string {
        switch (this.verifyModalDialogType) {
            case VeryfyDialogType.FEATURE_TYPE:
                return this.feature.name;
            case VeryfyDialogType.PURCHASE_OPTION_TYPE:
                return this.feature.name;
            case VeryfyDialogType.ENTITELMENT_TYPE:
                return this.feature.name;
            case VeryfyDialogType.CONFIGURATION_TYPE:
                return this.feature.name;
            case VeryfyDialogType.ORDERING_RULE_TYPE:
                return this.feature.name;
            case VeryfyDialogType.EXPERIMENT_TYPE:
                return this.experiment.name;
            case VeryfyDialogType.VARIANT_TYPE:
                return this.variant.name;
            case VeryfyDialogType.STREAM_TYPE:
                return this.stream.name;
            case VeryfyDialogType.NOTIFICATION_TYPE:
                return this.notification.name;
            default:
                console.log('Failed to detect the VerifyDialogType');
                break;
        }
    }

    isValid(): boolean {
        switch (this.verifyModalDialogType) {
            case VeryfyDialogType.FEATURE_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VeryfyDialogType.PURCHASE_OPTION_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VeryfyDialogType.ENTITELMENT_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VeryfyDialogType.CONFIGURATION_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;
            case VeryfyDialogType.ORDERING_RULE_TYPE:
                if (this.feature == null) {
                    return false;
                }
                return this.validationNameString == this.feature.name;

            case VeryfyDialogType.EXPERIMENT_TYPE:
                if (this.experiment == null) {
                    return false;
                }
                return this.validationNameString == this.experiment.name;
            case VeryfyDialogType.VARIANT_TYPE:
                if (this.variant == null) {
                    return false;
                }
                return this.validationNameString == this.variant.name;
            case VeryfyDialogType.STREAM_TYPE:
                if (this.stream == null) {
                    return false;
                }
                return this.validationNameString == this.stream.name;
            case VeryfyDialogType.NOTIFICATION_TYPE:
                if (this.notification == null) {
                    return false;
                }
                return this.validationNameString == this.notification.name;
            case VeryfyDialogType.STRING_TYPE:
                return true;
            default:
                return false;

        }
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    cancel() {
        this.actionCanceld.next(null);
        this.close();
    }

    discard() {
        this.actionDiscard.next(null);
        this.close();
    }

    close() {
        this.actionApproved = new Subject<string>();
        this.actionApproved$ = this.actionApproved.asObservable();
        this.actionCanceld = new Subject<string>();
        this.actionCanceld$ = this.actionCanceld.asObservable();
        this.actionDiscard = new Subject<string>();
        this.actionDiscard$ = this.actionDiscard.asObservable();
        this.validationNameString = "";
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to add product. Please try again.";
        console.log("handleError in addProductModal:" + errorMessage);
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

    capitalizeFirstLetter(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    create(message: string) {
        this.toastrService.error(message, this.capitalizeFirstLetter(this.getType()) + " name does not match", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
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

