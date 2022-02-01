import {Component, EventEmitter, Input, Output, ViewEncapsulation} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {Webhook} from "../../../model/webhook";
import {StoreTypes} from "../addPurchaseOptionModal";
import {WebhooksPage} from "../../../pages/webhooks/webhooks.component";


@Component({
    selector: 'add-webhook-modal',
    styleUrls: ['./addWebhookModal.scss'],
    templateUrl: './addWebhookModal.html',
encapsulation: ViewEncapsulation.None
})

export class AddWebhookModal {
    @Input() seasonId: string;
    possibleProdsList: Array<any> = [];
    @Input() configurationSchema;
    title: string = "Add Notification";
    loading: boolean = false;
    private isShow: boolean = true;
    _webhook: Webhook;
    globalWebhook: boolean = false;
    webhooksPage: WebhooksPage = null;
    selectedProducts: string[] = [];

    @Output() onWebhookAdded = new EventEmitter();


    constructor(private _airLockService: AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                protected modalRef: NbDialogRef<AddWebhookModal>) {
        this.loading = true;
        this.initWebhooks();
    }

    ngOnInit(){

    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    initWebhooks() {
        this._webhook = new Webhook();
        this._webhook.products = [];
        this._webhook.url = "";
        this._webhook.creator = this._airLockService.getUserName();
        this._webhook.sendAdmin = false;
        this._webhook.sendRuntime = false;
        this._webhook.minStage = "PRODUCTION";
        this.loading = false;
    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue == null || fieldValue == "") {
            return true;
        } else
            return false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this._webhook.name == null || this._webhook.name.length == 0 || this._webhook.url == null || this._webhook.url.length == 0
            || this._webhook.minStage == null || this._webhook.minStage.length == 0) {
            return false;
        }
        return true;
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this._webhook.name = this._webhook.name.trim();
            this.loading = true;
            this._webhook.products = this.selectedProducts
            this._airLockService.createWebhook(this._webhook).then(
                result => {
                    this.loading = false;
                    console.log(result);
                    this.onWebhookAdded.emit(result);
                    this.webhooksPage?.refreshTable();
                    this.close(result);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New webhook added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Name and URL are required')
        }
    }

    open(prodsList: Array<any>) {
        // this.initWebhooks();
        // this.title = "Add Webhook";
        // this.globalWebhook = false;
        // this.possibleProdsList = prodsList;
        // this.openWithoutClean();
    }

    toggleGlobal(event) {
        if (this.globalWebhook){
            this.selectedProducts = [];
        }else{
            for (var i=0;i< this.possibleProdsList.length;i++){
                this.selectedProducts[i] = this.possibleProdsList[i].uniqueId;
            }
        }
    }

    openWithoutClean() {
    }

    close(newItem = null) {
        this.modalRef.close(newItem);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = FeatureUtilsService.parseErrorMessage(error) || "Failed to create Webhook. Please try again.";
        console.log("handleError in addWebhookModal:" + errorMessage);
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
        this.toastrService.danger(message, "Webhook creation failed", {
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

