import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {AirlockNotification} from "../../../model/airlockNotification";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Rule} from "../../../model/rule";
import {GlobalState} from "../../../global.state";
import {NotificationsPage} from "../../../pages/notifications/notifications.component";


@Component({
    selector: 'add-notification-modal',
    styleUrls: ['./addNotificationModal.scss'],
    templateUrl: './addNotificationModal.html',
    encapsulation: ViewEncapsulation.None
})

export class AddNotificationModal {
    notificationsPage: NotificationsPage = null;
    seasonId: string;
    possibleGroupsList: Array<any> = [];
    configurationSchema;
    title: string = "Add Notification";
    notificationTitle: string;
    loading: boolean = false;
    private isShow: boolean = true;
    _notification: AirlockNotification;

    @Output() onNotificationAdded = new EventEmitter();

    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<AddNotificationModal>) {
        this.loading = true;
        this.initNotification();
        this.seasonId = this._appState.getCurrentSeason();
        this.possibleGroupsList = this._appState.getAvailableGroups();
    }

    ngOnInit(){
        this.initNotification();

    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initNotification() {
        this._notification = new AirlockNotification();
        this._notification.description = "";
        this._notification.minAppVersion = "";
        this._notification.rolloutPercentage = 100;
        this._notification.stage = "DEVELOPMENT";
        this._notification.enabled = false;
        this._notification.internalUserGroups = [];
        this._notification.creator = this._airLockService.getUserName();
        this._notification.configuration = "{}";
        this._notification.cancellationRule = new Rule();
        this._notification.cancellationRule.ruleString = "false";
        this._notification.registrationRule = new Rule();
        this._notification.registrationRule.ruleString = "";
        this._notification.maxNotifications = -1;
        this._notification.minInterval = -1;
        this.loading = false;
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
        if (this._notification.name == null || this._notification.name.length == 0 || this._notification.minAppVersion == null || this._notification.minAppVersion.length == 0
            || this.notificationTitle == null || this.notificationTitle.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._notification.name = this._notification.name.trim();
            this._notification.configuration = "{\"notification\":{\"title\":\"" + this.notificationTitle + "\"}}"

            this.loading = true;
            this._airLockService.createNotification(this.seasonId, this._notification).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onNotificationAdded.emit(result);
                    this.notificationsPage.loadNotifications();
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New Notification added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Minimum App Version, Notification Name and Title are required.')
        }
    }

    open() {
        this.initNotification();
        this.notificationTitle = null;
        this.title = "Add Notification";

        /*this.openWithoutClean(parentId);*/
        this.openWithoutClean();
    }

    openWithoutClean() {

        // //this.parentId=parentId;
        // var $exampleMulti = $$(".js_example").select2(
        //     {
        //         tags: true,
        //         tokenSeparators: [',', ' ']
        //     }
        // );
        // console.log("internalGroups");
        // console.log(this._notification.internalUserGroups);
        //
        // $$('.js_example').on(
        //     'change',
        //     (e) => {
        //         this._notification.internalUserGroups = e.target as any;
        //
        //     }
        // );
        // $exampleMulti.val(this._notification.internalUserGroups).trigger("change");
        //
        // if (this.modal != null) {
        //     this.modal.open('md');
        // }
    }

    close(result = null) {
        this.modalRef.close(result);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Notification. Please try again.";
        console.log("handleError in addNotificationModal:" + errorMessage);
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
        this.toastrService.danger(message, "Notification creation failed", {
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

