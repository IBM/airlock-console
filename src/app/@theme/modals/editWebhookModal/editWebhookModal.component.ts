import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone, Optional,
    Output,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {VerifyActionModal} from "../verifyActionModal/verifyActionModal.component";
import {Webhook} from "../../../model/webhook";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {NotificationCell} from "../../airlock.components/notificationCell";
import {LayoutService} from "../../../@core/utils";
import {GlobalState} from "../../../global.state";
import {WebhooksPage} from "../../../pages/webhooks/webhooks.component";

@Component({
    selector: 'edit-webhook-modal',
    styleUrls: ['./editWebhookModal.scss'],
    // '../customAirlockHeader/glyphicons.scss]',
    templateUrl: './editWebhookModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditWebhookModal {
    @Input() verifyActionModal: VerifyActionModal;
    @Input() webhook: Webhook;
    @Output() onEditWebhook = new EventEmitter<any>();
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    webhooksPage: WebhooksPage = null;

    loading: boolean = false;
    schema;
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    private generalTabActive: boolean = true;
    private ruleTabActive: boolean = false;
    private configTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    notificationCell: NotificationCell = null;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    ruleInputSchemaSample: string;
    cancellationRuleInputSchemaSample;
    ruleUtilitiesInfo: string;
    schemaUtilitiesInfo: string;
    schemaInputSchemaSample: string;
    configurationStr: string;
    private sub: any = null;
    minIntervalButtonText: string;
    isChecked: boolean;
    globalWebhook: boolean = false;
    possibleProdsList: Array<any> = [];
    selectedProducts: string[] = [];
    modalHeight: string;
    modalWidth: string;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _appState:GlobalState,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                @Optional() private modalRef: NbDialogRef<EditWebhookModal>) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.globalWebhook = false;
        if (this.webhook != null){
            if (this.webhook.products == null || this.webhook.products.length <= 0) {
                this.globalWebhook = true;
                this.webhook.products = null;
            }else{
                this.selectedProducts = this.webhook.products;
            }
        }
        this.title = this.getString("edit_webhook_title");
        this.isOnlyDisplayMode = (this._airLockService.isViewer());

        //change dates to better format
        this.creationDate = new Date(this.webhook?.creationDate);
        this.lastModificationDate = new Date(this.webhook?.lastModified);
        setTimeout(() => this.setProductSelectionUI(), 200);
        this.zone.run(() => {
            this.ruleTabActive = false;
            this.configTabActive = false;
            this.generalTabActive = true;
        });
        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth= LayoutService.calculateModalWidth();
    }

    initAfterClose() {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.webhook = null;
        this.generalTabActive = true;
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.isShowHirarchy = false;

    }

    isValid() {
        if (this.webhook.name == null || this.webhook.name.length == 0) {
            return "name is required";
        }
        return "";
    }


    validate() {

    }

    save() {
        this._save();
    }

    selectIntervalValue(index) {

    }

    _save() {
        if (this.selectedProducts != null && this.selectedProducts.length > 0){
            this.webhook.products = this.selectedProducts;
        }
        this.loading = true;
        this._airLockService.updateWebhook(this.webhook).then(result => {
            this.loading = false;
            this.onEditWebhook.emit(null);
            this.webhooksPage?.refreshTable();
            this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }


    handleError(error: any) {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editNotificationModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    parseErrorMessage(error: any): string {
        var errorMessage = error._body || "Request failed, try again later.";
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }
        return errorMessage;
    }

    close() {
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }


    open(webhook: Webhook, prodsList: Array<any>) {
        this.modalHeight = 'none';
        this.modalWidth= 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.possibleProdsList = prodsList;
        this.webhook = Webhook.clone(webhook);
        this.globalWebhook = false;
        if (this.webhook.products == null || this.webhook.products.length <= 0) {
            this.globalWebhook = true;
            this.webhook.products = null;
        }else{
            this.selectedProducts = this.webhook.products;
        }
        this.title = this.getString("edit_webhook_title");
        this.isOnlyDisplayMode = (this._airLockService.isViewer());

        //change dates to better format
        this.creationDate= new Date(this.webhook.creationDate);
        this.lastModificationDate = new Date(this.webhook.lastModified);
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.generalTabActive = true;

    }


    convertToString(obj: any) {
        return JSON.stringify(obj);
    }

    _isEmptyObject(obj: any) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
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
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }

    isInputWarningOn(fieldValue: string) {
        if (fieldValue === undefined || fieldValue === null || fieldValue == "") {
            return true;
        } else
            return false;
    }




    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    setProductSelectionUI() {
        // var $exampleMulti = $$(".js_example").select2(
        //     {
        //         tags: true,
        //         tokenSeparators: [',', ' ']
        //     }
        // );
        //
        // $$('.js_example').on(
        //     'change',
        //     (e) => {
        //         let prods = jQuery(e.target).val();
        //         if (prods != null) {
        //             this.webhook.products = prods;
        //         }
        //     }
        // );
        // $exampleMulti.val(this.webhook.products).trigger("change");
    }

    toggleGlobal(event) {
        if (this.globalWebhook == true) {
            this.globalWebhook = false;
            this.webhook.products = [];
            this.setProductSelectionUI();
        } else {
            this.globalWebhook = true;
            this.webhook.products = null;
        }
    }

    openOnNewTab() {
        window.open('/#/pages/webhooks/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason()+'/' + this._appState.getCurrentBranch() + '/' + this.webhook
            .uniqueId);
    }
}



