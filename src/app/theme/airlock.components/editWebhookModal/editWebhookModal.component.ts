import {
    Component,
    Injectable,
    ViewEncapsulation,
    ViewChild,
    Input,
    AfterViewInit,
    NgZone,
    Output,
    EventEmitter,
    Inject,
    ElementRef,
    ChangeDetectorRef
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import * as $$ from "jquery";
import "select2";
import {FeatureUtilsService, FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {NotificationCell} from "../notificationCell/notificationCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {AirlockNotification} from "../../../model/airlockNotification";
import {isNumeric} from "rxjs/util/isNumeric";
import {Webhook} from "../../../model/webhook";


@Component({
    selector: 'edit-webhook-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editWebhookModal.scss'),require('select2/dist/css/select2.css'),require('../customAirlockHeader/ng2-select.scss'),require('../customAirlockHeader/glyphicons.scss')],
    template: require('./editWebhookModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditWebhookModal{
    @ViewChild('editModal') modal: ModalComponent;
    loading: boolean = false;
    @Input() webhook: Webhook;
    schema;
    @Output() onEditWebhook= new EventEmitter<any>();
    @Input() verifyActionModal: VerifyActionModal;
    private elementRef:ElementRef;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private ruleTabActive:boolean = false;
    private configTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    lastModificationDate:Date;
    notificationCell: NotificationCell = null;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode:boolean = false;
    ruleInputSchemaSample: string;
    cancellationRuleInputSchemaSample;
    ruleUtilitiesInfo:string;
    schemaUtilitiesInfo:string;
    schemaInputSchemaSample:string;
    configurationStr:string;
    private sub:any = null;
    minIntervalButtonText:string;
    isChecked:boolean;
    globalWebhook: boolean = false;
    possibleProdsList :Array<any> = [];

    constructor( private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                 private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal,
                 private toastrService: ToastrService) {
        this.elementRef = elementRef;

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }

    initAfterClose(){
        try{
            if(this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        }catch (e){
            console.log(e);
        }
        this.webhook = null;
        this.generalTabActive = true;
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.isShowHirarchy  = false;
        this.removeAll();
    }

    isValid(){
        if(this.webhook.name  == null || this.webhook.name.length == 0){
            return "name is required";
        }
        return "";
    }



    validate(){

    }
    save() {
        this._save();
    }

    selectIntervalValue(index){

    }



    _save() {
        this.loading = true;
        this._airLockService.updateWebhook(this.webhook).then(result => {
            this.loading = false;
            this.onEditWebhook.emit(null);
            this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }


    handleError(error: any) {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = this.parseErrorMessage(error);
        console.log("handleError in editNotificationModal:"+errorMessage);
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
        } catch(err) {
            if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                errorMessage = errorMessage.substring(1,errorMessage.length -1);
            }
        }
        return errorMessage;
    }
    close(){
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modal.close();
    }


    open(webhook: Webhook, prodsList: Array<any>) {
        this.isOpen = true;
        this.loading = false;
        this.referenceOpen = false;
        this.possibleProdsList = prodsList;
        this.webhook = Webhook.clone(webhook);
        this.globalWebhook = false;
        if (this.webhook.products == null || this.webhook.products.length <= 0) {
            this.globalWebhook = true;
            this.webhook.products = null;
        }
        this.title = this.getString("edit_webhook_title");
        this.isOnlyDisplayMode = (this._airLockService.isViewer());

        //change dates to better format
        this.creationDate= new Date(this.webhook.creationDate);
        this.lastModificationDate = new Date(this.webhook.lastModified);
        setTimeout(() => this.setProductSelectionUI(), 200);
        if(this.modal != null) {
            this.zone.run(() => {
                this.ruleTabActive = false;
                this.configTabActive = false;
                this.generalTabActive = true;
                this.modal.open('lg');
            });

        }


    }








    convertToString(obj:any) {
        return JSON.stringify(obj);
    }
    _isEmptyObject(obj:any) {
        for(var prop in obj) {
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

    create(message:string) {
        // this._notificationService.bare("Save failed", message);
        this.toastrService.error(message, "Save failed",  {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    isInputWarningOn(fieldValue: string){
        if (fieldValue ===   undefined || fieldValue ===  null || fieldValue=="") {
            return true;
        }
        else
            return false;
    }

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }


    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    setProductSelectionUI() {
        var $exampleMulti =  $$(".js_example").select2(
            {
                tags: true,
                tokenSeparators: [',', ' ']
            }
        );

        $$('.js_example').on(
            'change',
            (e) => {
                let prods = jQuery(e.target).val();
                if (prods != null) {
                    this.webhook.products = prods;
                }
            }
        );
        $exampleMulti.val(this.webhook.products).trigger("change");
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
}



