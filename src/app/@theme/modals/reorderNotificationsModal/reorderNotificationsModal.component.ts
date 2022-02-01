import {Component, EventEmitter, Output, ViewEncapsulation} from '@angular/core';

import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AirlockNotifications} from "../../../model/airlockNotifications";
import {AirlockNotification} from "../../../model/airlockNotification";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'reorder-notifications-modal',
    styleUrls: ['./reorderNotificationsModal.scss'],
    templateUrl: './reorderNotificationsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ReorderNotificationsModal {

    _notifications: AirlockNotifications = null;
    _selectedIndex: number = 0;
    _selectedTarget: AirlockNotification = null;
    loading: boolean = false;
    private sub: any = null;
    @Output() onReorderNotifications = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderNotificationsModal>
    ) {
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(notifications: AirlockNotifications) {

            this._notifications = AirlockNotifications.clone(notifications);
    }

    getName(item: AirlockNotification): string {
        if (item && item.name) {
            return item.name;
        }
        return "";
    }

    getChildren(): AirlockNotification[] {
        if (this._notifications && this._notifications.notifications) {
            return this._notifications.notifications;
        } else {
            return null;
        }

    }


    selectTarget(notification: AirlockNotification, index: number) {

        if (this._selectedTarget == notification && this._selectedIndex == index) {
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = notification;
            this._selectedIndex = index;
        }
    }

    save() {
        this._save();
    }

    _save() {

        this.loading = true;
        this._airLockService.updateoNotifications(this._notifications).then(result => {
            this.loading = false;
            this.onReorderNotifications.emit(null);
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

    moveUp() {
        if (this._selectedIndex == 0 || this._selectedTarget == null) {

        } else {
            var oldVal: AirlockNotification = this.getChildren()[this._selectedIndex - 1];
            this.getChildren()[this._selectedIndex - 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex--;
        }
    }

    moveDown() {
        if (this._selectedIndex == this.getChildren().length - 1 || this._selectedTarget == null) {

        } else {
            var oldVal: AirlockNotification = this.getChildren()[this._selectedIndex + 1];
            this.getChildren()[this._selectedIndex + 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex++;
        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder.";
        console.log("handleError in reorderExperimentsModal:" + errorMessage);
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

