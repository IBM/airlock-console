import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";



import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {AceExpandDialogType} from "../../../app.module";
import {StreamsData} from "../../../model/streamsData";
import {NbDialogRef, NbDialogService, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {TabsetConfig} from "ngx-bootstrap/tabs";
import {AceModal} from "../aceModal/aceModal.component";
import {ConfirmActionModal} from "../confirmActionModal";

@Component({
    selector: 'edit-streams-data-modal',
    styleUrls: ['./editStreamsDataModal.scss'],
    // '../customAirlockHeader/glyphicons.scss]',
    templateUrl: './editStreamsDataModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditStreamsDataModal {
    // @ViewChild('editModal') modal: ModalComponent;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    loading: boolean = false;
    loadingSchema: boolean = false;
    @Input() streamsData: StreamsData;
    @Output() onEditStreamsData = new EventEmitter<any>();
    @Input() verifyActionModal: VerifyActionModal;
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    private generalTabActive: boolean = true;
    private filterTabActive: boolean = false;
    private advancedTabActive: boolean = false;
    lastModificationDate: Date;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    canEditAdvancede: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    filterUtilitiesInfo: string;
    filterInputSchemaSample: string;
    totalCountQuota: number;
    maxValues: Array<any> = [{"id": "0", "text": "RealTime"}, {"id": "1", "text": "Regular"}];
    activeMaxValue: Array<any>;
    schedulerTypes: string[] = ["Real-Time", "Regular"];
    schedulerTypesbuttonText: string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
    private sub: any = null;

    constructor(private _airLockService: AirlockService, @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                protected modalRef: NbDialogRef<EditStreamsDataModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
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
        this.streamsData = null;
        this.generalTabActive = true;
        this.filterTabActive = false;
        this.advancedTabActive = false;

    }

    isValid() {
        // if(this.stream.name  == null || this.stream.name.length == 0){
        //     return "name is required";
        // }
        // if(this.stream.minAppVersion) {
        //     this.stream.minAppVersion = this.stream.minAppVersion.trim();
        // }
        // if(this.stream.stage=="PRODUCTION" && !this.stream.minAppVersion) {
        //     return "Cannot remove minimum app version in production"
        // }
        return "";
    }

    validate() {

    }

    save() {
        var validError: string = this.isValid();
        if (validError.length == 0) {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    feature: null,//TODO Eitan - bug on saving - no handling of STREAMS_HISTORY_TYPE
                    text: this._stringsSrevice.getString("edit_streams_data_save_warning"),
                    verifyModalDialogType: VerifyDialogType.STREAMS_HISTORY_TYPE,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    this._save();
                }
            });
        } else {
            this.create(validError);
        }
    }

    _save() {
        this.loading = true;

        var dataToUpdate: StreamsData = this.streamsData;

        let streamStr = JSON.stringify(dataToUpdate);
        console.log("streamDataStr:", streamStr);
        this._airLockService.updateStreamsData(dataToUpdate.seasonId, dataToUpdate).then(result => {
            this.loading = true;
            this.onEditStreamsData.emit(null);
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
                if (curr == latestStringChar) {
                    inStringContext = false;
                    latestStringChar = null;
                }
            } else if (curr == "\"" /*|| curr=="\'"*/) {
                toRet += curr;
                inStringContext = true;
                latestStringChar = curr;
            } else if (curr == "{") {
                toRet += "{";
                toRet += "\n";
                tabCount++;
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == ",") {
                toRet += ",";
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == "}") {
                tabCount--;
                toRet += "\n";
                for (var j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
                toRet += "}"
            } else if (curr == "\n" || curr == '\t') {
                //do not add the new lines or tabs we come with
            } else {
                toRet += curr;
            }
        }
        return toRet;
    }

    handleError(error: any) {
        this.loading = false;
        if (error == null) {
            return;
        }

        var errorMessage = this._airLockService.parseErrorMessage(error, "Request failed, try again later.");
        console.log("handleError in editStreamsDataModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    close() {
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.modalRef.close();
    }


    open(streamsData: StreamsData, strInputFilterSchemaSample: string) {
        this.isOpen = true;
        this.loading = false;
        this.streamsData = StreamsData.clone(streamsData);
        this.title = this.getString("edit_streams_data_title");
        this.filterInputSchemaSample = strInputFilterSchemaSample;

        this.isOnlyDisplayMode = (this._airLockService.isViewer() || this._airLockService.isEditor());
        this.canEditAdvancede = this._airLockService.isAdministrator();

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.filterTabActive = false;
                this.generalTabActive = true;
                this.advancedTabActive = false;

                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                // this.modal.open('lg');
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
        this.streamsData.filter = event;
        this.updateInputSample()
    }

    updateInputSample() {
        // let filter = this.stream.filter;
        // this.loadingSchema = true;
        // this._airLockService.getStreamInputSample(this.stream.seasonId, this.stream.stage, this.stream.minAppVersion, filter).then(result => {
        //     this.processorInputSchemaSample = result;
        //     this.loadingSchema = false;
        //
        // }).catch(error => {
        //     let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema");
        //     // this._airLockService.notifyDataChanged("error-notification",errorMessage);
        //     this.loadingSchema = false;
        // });
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.363ue557y7d0');
    }

    showConfigurationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.igpio3q4s3ui');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    getFilterSample(): any {
        // if (this.processorInputSchemaSample) {
        //     let processorObj:any = this.processorInputSchemaSample;
        //     if (processorObj.events && processorObj.events.length> 0 && !this._isEmptyObject(processorObj.events[0])) {
        //         return {"event":processorObj.events[0]};
        //     }
        // }
        return {};
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

    showStreamHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.dmk2w4uv1lz8');
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



    openAceEditorRuleExpand() {
    }

    openAceEditorFilterExpand() {
        var expandDialogTitle = this.getString('edit_streams_data_filter_edit_title');
        this.aceModalContainerDialog.showAceModal(this.streamsData.filter, expandDialogTitle, this.filterInputSchemaSample, this.filterUtilitiesInfo, AceExpandDialogType.STREAM_FILTER, this.isOnlyDisplayMode);
    }

    openWhiteListEditor() {
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



