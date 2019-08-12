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
import {Feature} from "../../../model/feature";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {Product} from "../../../model/product";
import * as $$ from "jquery";
import "select2";
import {FeatureUtilsService, FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
//import {ExperimentCell} from "../experimentCell/experimentCell.component";
import {VariantCell} from "../variantCell/variantCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Branch,AvailableBranches} from "../../../model/branch";
//import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {AceExpandDialogType} from "../../../app.module";

@Component({
    selector: 'edit-variant-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editVariantModal.scss'),require('select2/dist/css/select2.css')],
    // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,DROPDOWN_DIRECTIVES,TAB_DIRECTIVES,ACCORDION_DIRECTIVES,
    //         BUTTON_DIRECTIVES, ButtonRadioDirective, TOOLTIP_DIRECTIVES, AceEditor, /*Markdown,*/ HirarchyTree,
    //         SimpleNotificationsComponent, AirlockTooltip, AceModal],

    template: require('./editVariantModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditVariantModal{
    @ViewChild('editModal') modal: ModalComponent;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog : AceModal;
    loading: boolean = false;
    @Input() product:Product;
    @Input() variant: Variant;
    @Input() rootFeatuteGroups : Array<Feature>;
    @Output() onEditVariant= new EventEmitter<any>();
    @Output() onShowFeature= new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate : EventEmitter<any> = new EventEmitter();
    @Input() rootId: string;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() possibleGroupsList :Array<any> = [];
    //featurePath: Array<Feature> = [];
    private elementRef:ElementRef;
    availableBranches: string[];
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private descriptionTabActive:boolean = false;
    private ruleTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    lastModificationDate:Date;
    variantCell: VariantCell = null;
    configurationSchemaString: string;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode:boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo:string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
    private sub:any = null;

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

        this.generalTabActive = true;
        this.descriptionTabActive = false;
        this.ruleTabActive = false;
        this.isShowHirarchy  = false;
        this.removeAll();
    }

    isValid(){
        if(this.variant.name  == null || this.variant.name.length == 0){
            return "name is required";
        }

        return "";
    }

    removeDuplicateSon(item:Feature,parentId:string,itemId:string){
        if(item.uniqueId === parentId) {
            for (var i = 0; i < item.features.length; ++i) {
                if (item.features[i].uniqueId == itemId) {
                    item.features.splice(i, 1);
                    return;
                }
            }
        }else{
            item.features.forEach((curSon) => {
                    this.removeDuplicateSon(curSon,parentId,itemId);
                }

            );
        }
    }
    validate(){

    }
    save() {
        var validError:string = this.isValid();
        if(validError.length == 0) {
            if (this.variant.stage=='DEVELOPMENT' && (this.variant.internalUserGroups==null || this.variant.internalUserGroups.length <=0)) {
                let message = 'This variant will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalAlert.confirm()
                    .title(message)
                    .open()
                    .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                    .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                    .then(() => {
                        this._save();
                    }) // if were here ok was clicked.
                    .catch(err => {
                        this.loading = false;
                        this.handleError(err);
                    });


            } else {
                if(this.variant.stage == 'PRODUCTION'){
                    this.sub = this.verifyActionModal.actionApproved$.subscribe(
                        astronaut => {

                            this._save();

                        });
                    console.log("open verifyActionModal");
                    this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_variant"),this.variant, VeryfyDialogType.VARIANT_TYPE);
                }else {
                    this._save();
                }
            }
        }else{
            this.create(validError);
        }
    }

    _save() {
        this.loading = true;
        if (!this.variant.internalUserGroups) {
            this.variant.internalUserGroups = [];
        }

        var variantToUpdate: Variant = this.variant;


        variantToUpdate.rolloutPercentage = Number(variantToUpdate.rolloutPercentage);
        this._airLockService.updateVariant(variantToUpdate).then(result => {
            this.loading = true;
            this.onEditVariant.emit(null);
            this.close()
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            var fnBody;
            if (value instanceof Function || typeof value == 'function') {
                fnBody = value.toString();
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') { //this is ES6 Arrow Function
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            if (value instanceof RegExp) {
                return '_PxEgEr_' + value;
            }
            return value;
        });
    };
    // for open
    beautifyString(str: string) {
        var toRet = "";
        var tabCount = 0;
        var inStringContext = false;
        var latestStringChar = null;
        for (var i = 0, len = str.length; i < len; i++) {
            let curr = str[i];

            if (inStringContext) {
                // do not add tabs and new lines if inside a string
                toRet += curr;
                if (curr==latestStringChar) {
                    inStringContext = false;
                    latestStringChar = null;
                }
            } else if (curr=="\"" /*|| curr=="\'"*/) {
                toRet += curr;
                inStringContext = true;
                latestStringChar=curr;
            }
            else if(curr=="{") {
                toRet +="{";
                toRet += "\n";
                tabCount++;
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if(curr==",") {
                toRet +=",";
                toRet += "\n";
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
            } else if (curr=="}") {
                tabCount--;
                toRet += "\n";
                for(var j = 0; j < tabCount; j++) {
                    toRet +="\t";
                }
                toRet += "}"
            } else if(curr=="\n" || curr=='\t') {
                //do not add the new lines or tabs we come with
            }
            else {
                toRet += curr;
            }
        }
        return toRet;
    }

    handleError(error: any) {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = this.parseErrorMessage(error);
        console.log("handleError in editFeatureModal:"+errorMessage);
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
        this.onShowFeature.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }

    open(variant: Variant, availableBranches: string[], strInputSchemaSample:string, strUtilitiesInfo:string, variantCell: VariantCell = null) {
        this.isOpen = true;
        this.loading = false;
        this.variant = Variant.clone(variant);
        this.title = this.getString("edit_variant_title");
        this.availableBranches = availableBranches;
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.variantCell = variantCell;

        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.variant.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate= new Date(this.variant.creationDate);
        this.lastModificationDate = new Date(this.variant.lastModified);

        //create groups combo box with tags
        setTimeout(() => {
            var $exampleMulti =  $$(".js_example").select2(
                {
                    tags: true,
                    tokenSeparators: [',', ' ']
                }
            );
            $$('.numberInput').on(
                'change',
                (e) => {
                    $$('.numberInput').val(parseFloat($$('.numberInput').val()).toFixed(4));
                    this.variant.rolloutPercentage = $$('.numberInput').val();
                    //$$('.numberInput').mask('000.0000', { reverse: true });
                }
            );
            $$('.js_example').on(
                'change',
                (e) => {
                    if(this.variant != null) {
                        this.variant.internalUserGroups = jQuery(e.target).val();
                    }
                }
            );
            $exampleMulti.val(this.variant.internalUserGroups).trigger("change");
            $$('.numberInput').trigger("change");
        },100);


        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.ruleTabActive = false;
                //this.hirarchyTabActive = false;
                this.descriptionTabActive = false;
                this.generalTabActive = true;

                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowFeature.emit(true);
                this.modal.open('lg');
            });

        }
    }

    getBranchesForSelect():any[] {
        var toRet = [];
        if (this.availableBranches) {
            for (var branch of this.availableBranches) {
                toRet.push(branch);
            }
        }
        return toRet;
    }

    selectBranchFromSelect(branchObj:any) {
        if (branchObj)  {
            this.variant.branchName =  branchObj.text;
        }
    }

    ruleUpdated(event) {
        this.variant.rule.ruleString = event;
    }


    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }

    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }
    showRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/rules');
    }
    showConfigurationHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/configurations');
    }
    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
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

    withOverride() { this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"}) }

    removeAll() { this._notificationService.remove() }

    openAceEditorRuleExpand(){
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.variant.name;
        this.aceModalContainerDialog.showAceModal(this.variant.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
    }

    openWhiteListEditor(){
        console.log('Open White List');
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

}



