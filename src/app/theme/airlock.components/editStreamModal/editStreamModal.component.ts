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
import * as $$ from "jquery";
import "select2";
import {FeatureUtilsService, FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {StreamCell} from "../streamCell/streamCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Stream} from "../../../model/stream";
import {AceExpandDialogType} from "../../../app.module";

@Component({
    selector: 'edit-stream-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editStreamModal.scss'),require('select2/dist/css/select2.css'),require('../customAirlockHeader/ng2-select.scss'),require('../customAirlockHeader/glyphicons.scss')],
    // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,DROPDOWN_DIRECTIVES,TAB_DIRECTIVES,ACCORDION_DIRECTIVES,
    //         BUTTON_DIRECTIVES, ButtonRadioDirective, TOOLTIP_DIRECTIVES, AceEditor, /*Markdown,*/ HirarchyTree,
    //         SimpleNotificationsComponent, AirlockTooltip, AceModal],

    template: require('./editStreamModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditStreamModal{
    @ViewChild('editModal') modal: ModalComponent;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog : AceModal;
    loading: boolean = false;
    loadingSchema: boolean = false;
    @Input() stream: Stream;
    @Output() onEditStream= new EventEmitter<any>();
    @Input() verifyActionModal: VerifyActionModal;
    @Input() possibleGroupsList :Array<any> = [];
    private elementRef:ElementRef;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private filterTabActive:boolean = false;
    private processorTabActive:boolean = false;
    private schemaTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    lastModificationDate:Date;
    streamCell: StreamCell = null;
    configurationSchemaString: string;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode:boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo:string;
    filterUtilitiesInfo:string;
    filterInputSchemaSample:string;
    processorUtilitiesInfo:string;
    processorInputSchemaSample:string;
    schemaUtilitiesInfo:string;
    schemaInputSchemaSample:string;
    totalCountQuota : number;
    maxValues:Array<any> = [{"id":"0","text":"RealTime"},{"id":"1","text":"Regular"}];
    activeMaxValue:Array<any>;
    schedulerTypes:string[] = ["Real-Time","Regular"];
    schedulerTypesbuttonText:string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
    private sub:any = null;

    constructor( private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                 private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal,
                 private toastrService: ToastrService) {
        this.elementRef = elementRef;

    }
    public selected(value:any):void {
        console.log('Selected value is: ', value);
        if(value.id == "0") {
            this.stream.maxQueuedEvents = 1;
        }else{
            this.stream.maxQueuedEvents = null;
        }
        // this.onFeatureSelected.emit(value.id);
    }

    public removed(value:any):void {
        // this.stream.maxQueuedEvents = null;
        console.log('Removed value is: ', value);
        // this.onFeatureSelected.emit("");
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }
    selectSchedulerTypesItem(index){
        // console.log('Selected value is: ', value);
        this.schedulerTypesbuttonText = this.schedulerTypes[index];
        if(index == 0) {
            this.stream.maxQueuedEvents = 1;

        }else{
            this.stream.maxQueuedEvents = null;
        }
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
        this.stream = null;
        this.generalTabActive = true;
        this.filterTabActive = false;
        this.processorTabActive = false;
        this.schemaTabActive = false;
        this.isShowHirarchy  = false;
        this.removeAll();
    }

    isValid(){
        if(this.stream.name  == null || this.stream.name.length == 0){
            return "name is required";
        }
        if(this.stream.minAppVersion) {
            this.stream.minAppVersion = this.stream.minAppVersion.trim();
        }
        if(this.stream.stage=="PRODUCTION" && !this.stream.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }
        return "";
    }



    validate(){

    }
    save() {
        var validError:string = this.isValid();
        if(validError.length == 0) {
            if (this.stream.stage=='DEVELOPMENT' && (this.stream.internalUserGroups==null || this.stream.internalUserGroups.length <=0)) {
                let message = 'This stream will not be visible to users because no user groups are specified. Are you sure want to continue?';
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
                if(this.stream.stage == 'PRODUCTION'){
                    this.sub = this.verifyActionModal.actionApproved$.subscribe(
                        astronaut => {

                            this._save();

                        });
                    console.log("open verifyActionModal");
                    this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_stream"),this.stream, VeryfyDialogType.EXPERIMENT_TYPE);
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
        if (!this.stream.internalUserGroups) {
            this.stream.internalUserGroups = [];
        }

        var streamToUpdate: Stream = this.stream;


        streamToUpdate.rolloutPercentage = Number(streamToUpdate.rolloutPercentage);
        let streamStr = JSON.stringify(streamToUpdate);
        console.log("streamStr:", streamStr);
        this._airLockService.updateStream(streamToUpdate).then(result => {
            this.loading = true;
            this.onEditStream.emit(null);
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
        
        var errorMessage = this._airLockService.parseErrorMessage(error, "Request failed, try again later.");
        console.log("handleError in editFeatureModal:"+errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    close(){
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }



    open(stream: Stream, strInputSchemaSample:string,strInputFilterSchemaSample:string, strUtilitiesInfo:string, streamCell: StreamCell = null) {
        this.isOpen = true;
        this.loading = false;
        this.stream = Stream.clone(stream);
        this.title = this.getString("edit_stream_title");
        this.processorInputSchemaSample = strInputSchemaSample;
        this.filterInputSchemaSample = strInputFilterSchemaSample;
        console.log(strInputSchemaSample);
        this.processorUtilitiesInfo = strUtilitiesInfo;
        this.streamCell = streamCell;
        if(this.stream.maxQueuedEvents == null) {
            this.activeMaxValue = [{"id":"1","text":"Regular"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[1];
        }else{
            this.activeMaxValue = [{"id": "0", "text": "RealTime"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[0];
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.stream.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate= new Date(this.stream.creationDate);
        this.lastModificationDate = new Date(this.stream.lastModified);

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
                    this.stream.rolloutPercentage = $$('.numberInput').val();
                    //$$('.numberInput').mask('000.0000', { reverse: true });
                }
            );
            $$('.js_example').on(
                'change',
                (e) => {
                    if(this.stream != null) {
                        this.stream.internalUserGroups = jQuery(e.target).val();
                    }
                }
            );
            $exampleMulti.val(this.stream.internalUserGroups).trigger("change");
            $$('.numberInput').trigger("change");
        },100);


        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.filterTabActive = false;
                this.processorTabActive = false;
                this.schemaTabActive = false;
                this.generalTabActive = true;

                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.modal.open('lg');
            });

        }


    }






    /*defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }
*/
    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    filterUpdated(event) {
        this.stream.filter = event;
        this.updateInputSample()
    }

    updateInputSample() {
        let filter = this.stream.filter;
        this.loadingSchema = true;
        this._airLockService.getStreamInputSample(this.stream.seasonId, this.stream.stage, this.stream.minAppVersion, filter).then(result => {
            this.processorInputSchemaSample = result;
            this.loadingSchema = false;

        }).catch(error => {
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema");
            // this._airLockService.notifyDataChanged("error-notification",errorMessage);
            this.loadingSchema = false;
        });
    }
    processorUpdated(event) {
        this.stream.processor = event;
    }

    schemaUpdated(event) {
        this.stream.resultsSchema = event;
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

    getFilterSample():any{
        if (this.processorInputSchemaSample) {
            let processorObj:any = this.processorInputSchemaSample;
            if (processorObj.events && processorObj.events.length> 0 && !this._isEmptyObject(processorObj.events[0])) {
                return {"event":processorObj.events[0]};
            }
        }
        return {};
    }
    haveProcessorSample() {
        // console.log(this.processorInputSchemaSample);
        if (this.processorInputSchemaSample) {
            let processorObj:any = this.processorInputSchemaSample;
            if (processorObj.events && processorObj.events.length> 0 && !this._isEmptyObject(processorObj.events[0])) {
                return true;
            }
        }
        return false;
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

    showStreamHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/streams');
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
    }

    openAceEditorFilterExpand(){
        var expandDialogTitle = this.getString('edit_stream_filter_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.filter, expandDialogTitle, this.filterInputSchemaSample, this.filterUtilitiesInfo, AceExpandDialogType.STREAM_FILTER, this.isOnlyDisplayMode);
    }

    openAceEditorProcessorExpand(){
        var expandDialogTitle = this.getString('edit_stream_processor_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.processor, expandDialogTitle, this.processorInputSchemaSample, this.processorUtilitiesInfo, AceExpandDialogType.STREAM_PROCESSOR, this.isOnlyDisplayMode);
    }

    openAceEditorSchemaExpand(){
        var expandDialogTitle = this.getString('edit_stream_schema_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.resultsSchema, expandDialogTitle, this.schemaInputSchemaSample, this.schemaUtilitiesInfo, AceExpandDialogType.STREAM_SCHEMA, this.isOnlyDisplayMode);
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



