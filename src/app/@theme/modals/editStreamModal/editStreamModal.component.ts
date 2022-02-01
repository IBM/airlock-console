import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    NgZone,
    Output,
    ViewChild,
    ViewEncapsulation,
    Optional,
    Input
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {VerifyActionModal, VerifyDialogType} from "../verifyActionModal";
import {Stream} from "../../../model/stream";
import {AceExpandDialogType} from "../../../app.module";
import {
    NbDialogRef,
    NbDialogService,
    NbGlobalLogicalPosition,
    NbPopoverDirective,
    NbToastrService
} from "@nebular/theme";
import {StreamCell} from "../../airlock.components/streamCell";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {LayoutService} from "../../../@core/utils";
import {StreamsPage} from "../../../pages/streams/streams.component";
import {SaveActionModal} from "../saveActionModal";
import {Feature} from "../../../model/feature";

enum State {
    None = 1,
    Dates,
    Days
}

@Component({
    selector: 'edit-stream-modal',
    styleUrls: ['./editStreamModal.scss'],
    templateUrl: './editStreamModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditStreamModal {
    @Input() visible = false;
    @Output() onEditStream = new EventEmitter<any>();
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @ViewChild('general') generalTab;
    @ViewChild('filterTab') filterTab;
    @ViewChild('processorTab') processorTab;
    @ViewChild('schemaTab') schemaTab;
    @ViewChild('historyTab') historyTab;
    @Output() onClose = new EventEmitter<any>();
    streamsPage: StreamsPage = null;
    verifyActionModal: VerifyActionModal;
    possibleGroupsList: Array<any> = [];
    historicalStreamsAllowed: boolean;
    stream: Stream;
    originalStream: Stream;
    loading: boolean = false;
    loadingSchema: boolean = false;
    private elementRef: ElementRef;
    creationDate: Date;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    filterTabActive: boolean = false;
    processorTabActive: boolean = false;
    schemaTabActive: boolean = false;
    historyTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    lastModificationDate: Date;
    streamCell: StreamCell = null;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    inputSampleLoaded = false;
    minAppVersionForSample = "";
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    isHistoryDisabled: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    filterUtilitiesInfo: string;
    filterInputSchemaSample: string;
    processorUtilitiesInfo: string;
    processorInputSchemaSample: string;
    schemaUtilitiesInfo: string;
    schemaInputSchemaSample: string;
    totalCountQuota: number;
    maxValues: Array<any> = [{"id": "0", "text": "RealTime"}, {"id": "1", "text": "Regular"}];
    activeMaxValue: Array<any>;
    schedulerTypes: string[] = ["Real-Time", "Regular"];
    schedulerTypesbuttonText: string;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    private sub: any = null;
    startDate: Date = null;
    endDate: Date = null;
    settings = {
        bigBanner: false,
        timePicker: false,
        format: 'MM-dd-yyyy',
        defaultOpen: false
    };
    limitState: State = State.None;
    modalHeight: String;
    modalWidth: String;
    inlineMode: boolean = false;

    constructor(private _airLockService: AirlockService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private _appState: GlobalState,
                private toastrService: NbToastrService,
                @Optional() protected modalRef: NbDialogRef<EditStreamModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
        this.possibleGroupsList = this._appState.getAvailableGroups();
    }

    public selected(value: any): void {
        if (value.id == "0") {
            this.stream.maxQueuedEvents = 1;
        } else {
            this.stream.maxQueuedEvents = null;
        }
        // this.onFeatureSelected.emit(value.id);
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.possibleGroupsList = this._appState.getAvailableGroups();
        this.isOpen = true;
        this.loading = false;
        this.configureLimitState(this.stream);
        this.settings.defaultOpen = false;
        this.title = this.getString("edit_stream_title");
        if (this.stream?.maxQueuedEvents == null) {
            this.activeMaxValue = [{"id": "1", "text": "Regular"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[1];
        } else {
            this.activeMaxValue = [{"id": "0", "text": "RealTime"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[0];
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.stream.stage == "PRODUCTION"));
        this.isHistoryDisabled = this.isOnlyDisplayMode || !this.historicalStreamsAllowed;
        //change dates to better format
        this.creationDate = new Date(this.stream?.creationDate);
        this.lastModificationDate = new Date(this.stream?.lastModified);

        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth = LayoutService.calculateModalWidth();

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.filterTabActive = false;
                this.processorTabActive = false;
                this.schemaTabActive = false;
                this.generalTabActive = true;
                this.historyTabActive = false;

                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
            });
        }
    }

    selectSchedulerTypesItem(index) {
        this.schedulerTypesbuttonText = this.schedulerTypes[index];
        if (index == 0) {
            this.stream.maxQueuedEvents = 1;

        } else {
            this.stream.maxQueuedEvents = null;
        }
        this.popover.hide();
    }

    isDirty(): boolean {
        return this.stream && this.originalStream && !FeatureUtilsService.isStreamIdentical(this.stream, this.originalStream);
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
        this.stream = null;
        this.originalStream = null;
        this.generalTabActive = true;
        this.filterTabActive = false;
        this.processorTabActive = false;
        this.schemaTabActive = false;
        this.historyTabActive = false;
        this.isShowHirarchy = false;
    }

    isValid() {
        if (this.stream.name == null || this.stream.name.length == 0) {
            return "name is required";
        }
        if (this.stream.minAppVersion) {
            this.stream.minAppVersion = this.stream.minAppVersion.trim();
        }
        if (this.stream.stage == "PRODUCTION" && !this.stream.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }
        return "";
    }


    validate() {

    }

    save(dontClose = false) {
        const validError: string = this.isValid();
        if (validError.length == 0) {
            if (this.stream.stage == 'DEVELOPMENT' && (this.stream.internalUserGroups == null || this.stream.internalUserGroups.length <= 0)) {
                let message = 'This stream will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed) {
                        this._save(dontClose);
                    }
                });
            } else {
                if (this.stream.stage == 'PRODUCTION') {
                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            stream: this.stream,
                            text: this._stringsSrevice.getString("edit_change_production_stream"),
                            verifyModalDialogType: VerifyDialogType.STREAM_TYPE,
                        }
                    }).onClose.subscribe(confirmed => {
                        if (confirmed) {
                            this._save(dontClose);
                        }
                    });
                } else {
                    this._save(dontClose);
                }
            }
        } else {
            this.create(validError);
        }
    }

    showDatesPicker() {
        // this.datepickerModal.open("Limit dates");
    }

    _save(dontClose = false) {
        this.loading = true;
        if (!this.stream.internalUserGroups) {
            this.stream.internalUserGroups = [];
        }
        this.configureStreamByLimit();
        const streamToUpdate: Stream = this.stream;
        streamToUpdate.rolloutPercentage = Number(streamToUpdate.rolloutPercentage);
        this._airLockService.updateStream(streamToUpdate).then((updateData) => {
            this.loading = false;
            this.onEditStream.emit(null);
            if (dontClose) {
                streamToUpdate.lastModified = updateData.lastModified;
                this.refreshEditScreen(streamToUpdate);
            } else {
                this.close();
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    refreshEditScreen(updated: Stream) {
        this.originalStream = updated;
        this.stream = Stream.clone(updated);
        this.loading = false;
    }
    stringify(obj) {

        return JSON.stringify(obj, function (key, value) {
            let fnBody;
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
        let j;
        let toRet = "";
        let tabCount = 0;
        let inStringContext = false;
        let latestStringChar = null;
        let i = 0;
        const len = str.length;
        for (; i < len; i++) {
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
                for (j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == ",") {
                toRet += ",";
                toRet += "\n";
                for (j = 0; j < tabCount; j++) {
                    toRet += "\t";
                }
            } else if (curr == "}") {
                tabCount--;
                toRet += "\n";
                for (j = 0; j < tabCount; j++) {
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

        const errorMessage = this._airLockService.parseErrorMessage(error, "Request failed, try again later.");
        console.log("handleError in editFeatureModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    close() {
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close();
        this.onClose.emit(null);
    }

    restoreStartDate() {
        this.settings.defaultOpen = true;
        this.startDate = new Date();
    }

    configureLimitState(stream: Stream) {
        if (stream == null) {
            return;
        }
        if (stream.processEventsOfLastNumberOfDays != undefined) {
            this.limitState = State.Days;
        } else if (this.stream.limitByStartDate != null || this.stream.limitByEndDate != null) {
            if (this.stream.limitByStartDate != null) {
                this.startDate = new Date(this.stream.limitByStartDate);
            } else {
            }
            if (this.stream.limitByEndDate != null) {
                this.endDate = new Date(this.stream.limitByEndDate);
            } else {
            }
            this.limitState = State.Dates;
        } else {
            this.limitState = State.None;
        }
    }

    configureStreamByLimit() {
        switch (this.limitState) {
            case State.Dates:
                this.stream.processEventsOfLastNumberOfDays = null;
                if (this.startDate != null) {
                    this.stream.limitByStartDate = this.startDate.getTime();
                } else {
                    this.stream.limitByStartDate = null;
                }

                if (this.endDate != null) {
                    this.stream.limitByEndDate = this.endDate.getTime();
                } else {
                    this.stream.limitByEndDate = null;
                }
                return;

            case State.Days:
                this.stream.limitByEndDate = null;
                this.stream.limitByStartDate = null;
                return;
            case State.None:
                this.stream.limitByEndDate = null;
                this.stream.limitByStartDate = null;
                this.stream.processEventsOfLastNumberOfDays = null;
                return;
        }
    }


    setByDates() {
        this.limitState = State.Dates;
    }

    setByDays() {
        this.limitState = State.Days;
    }

    setAsNone() {
        this.limitState = State.None;
    }

    ruleUpdated(event) {
    }

    defaultConfigurationUpdated(event) {
        // this.defaultConfigurationString = event;
    }
    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    filterUpdated(event) {
        this.stream.filter = event;
        this.updateInputSample()
    }

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || this.minAppVersionForSample != this.stream.minAppVersion) {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.stream.minAppVersion;
            this.loadAutoComplete();
        } else {
            this.loading = false;
        }
    }

    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let stream = this.stream;
        let loadPhase2 = (result: boolean): void => {
            this._airLockService.getStreamInputSample(this.stream.seasonId, this.stream.stage, this.stream.minAppVersion, this.stream.filter).then(result1 => {
                this.processorInputSchemaSample = result1 as string;
                this.minAppVersionForSample = this.stream.minAppVersion;
                loadPhase3(true);
            }).catch(error => {
                console.log('Error in getting stream  Input Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                loadPhase3(false);
            });
        }
        let loadPhase3 = (result: boolean): void => {
            this._airLockService.getStreamFilterInputSample(this.stream.seasonId).then(result2 => {
                this.filterInputSchemaSample = result2 as string;
                this.loading = false;
                if (this.processorInputSchemaSample && this.minAppVersionForSample === this.stream.minAppVersion) {
                    this.inputSampleLoaded = true;
                }
            }).catch(error => {
                console.log('Error in getting filter  Input Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Filter Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
        this._airLockService.getStreamUtilitiesInfo(this.stream.seasonId, this.stream.stage, this.stream.minAppVersion).then(res => {
            this.processorUtilitiesInfo = res as string;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting stream  Input Sample');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Processor Utilities info ");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
    }

    updateInputSample() {
        let filter = this.stream.filter;
        this.loadingSchema = true;
        this._airLockService.getStreamInputSample(this.stream.seasonId, this.stream.stage, this.stream.minAppVersion, filter).then(result => {
            this.minAppVersionForSample = this.stream.minAppVersion;
            this.processorInputSchemaSample = result as string;
            this.loadingSchema = false;

        }).catch(error => {
            // let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema");
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
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.363ue557y7d0');
    }

    showConfigurationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.igpio3q4s3ui');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }

    haveProcessorSample() {
        if (this.processorInputSchemaSample) {
            let processorObj: any = this.processorInputSchemaSample;
            if (processorObj.events && processorObj.events.length > 0 && !this._isEmptyObject(processorObj.events[0])) {
                return true;
            }
        }
        return false;
    }

    _isEmptyObject(obj: any) {
        for (let prop in obj) {
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

    open(stream: Stream, strInputSchemaSample: string, strInputFilterSchemaSample: string, strUtilitiesInfo: string, streamCell: StreamCell = null) {
        if (this.loaded && this.isDirty()) {
            let message = this.stream.name + ' has changed and not saved. do you wish to save it now?';
            this.modalService.open(SaveActionModal, {
                closeOnBackdropClick: false,
                context: {
                    title: message,
                }
            }).onClose.subscribe(status => {
                if (status === 'cancel') {
                    //do nothing
                } else if (status === 'save') {
                    this.save(true);
                } else if (status === 'discard') {
                    this._open(stream, strInputSchemaSample, strInputFilterSchemaSample, strUtilitiesInfo, streamCell);
                }
            });
        } else {
            this._open(stream, strInputSchemaSample, strInputFilterSchemaSample, strUtilitiesInfo, streamCell);
        }
    }

    _open(stream: Stream, strInputSchemaSample: string, strInputFilterSchemaSample: string, strUtilitiesInfo: string, streamCell: StreamCell = null) {
        this.originalStream = stream;
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.stream = Stream.clone(stream);
        this.configureLimitState(this.stream);
        this.settings.defaultOpen = false;
        this.title = this.getString("edit_stream_title");
        this.processorInputSchemaSample = strInputSchemaSample;
        this.filterInputSchemaSample = strInputFilterSchemaSample;
        console.log(strInputSchemaSample);
        this.processorUtilitiesInfo = strUtilitiesInfo;
        this.streamCell = streamCell;
        if (this.stream.maxQueuedEvents == null) {
            this.activeMaxValue = [{"id": "1" , "text": "Regular"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[1];
        } else {
            this.activeMaxValue = [{"id": "0", "text": "RealTime"}];
            this.schedulerTypesbuttonText = this.schedulerTypes[0];
        }
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.stream.stage == "PRODUCTION"));
        this.isHistoryDisabled = this.isOnlyDisplayMode || !this.historicalStreamsAllowed;
        //change dates to better format
        this.creationDate = new Date(this.stream.creationDate);
        this.lastModificationDate = new Date(this.stream.lastModified);
        this.loaded = true;
        this.filterTabActive = false;
        this.processorTabActive = false;
        this.schemaTabActive = false;
        this.generalTabActive = true;
        this.historyTabActive = false;

        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        if (!this.processorInputSchemaSample || !this.processorUtilitiesInfo ||
        !this.filterInputSchemaSample) {
            this.inputSampleLoaded = false;
            this.loadAutoComplete(true);
        } else {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.stream.minAppVersion;
        }
    }

    openAceEditorRuleExpand() {
    }

    openAceEditorFilterExpand() {
        const expandDialogTitle = this.getString('edit_stream_filter_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.filter, expandDialogTitle, this.filterInputSchemaSample, this.filterUtilitiesInfo, AceExpandDialogType.STREAM_FILTER, this.isOnlyDisplayMode);
    }

    openAceEditorProcessorExpand() {
        const expandDialogTitle = this.getString('edit_stream_processor_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.processor, expandDialogTitle, this.processorInputSchemaSample, this.processorUtilitiesInfo, AceExpandDialogType.STREAM_PROCESSOR, this.isOnlyDisplayMode);
    }

    openAceEditorSchemaExpand() {
        const expandDialogTitle = this.getString('edit_stream_schema_edit_title') + " - " + this.stream.name;
        this.aceModalContainerDialog.showAceModal(this.stream.resultsSchema, expandDialogTitle, this.schemaInputSchemaSample, this.schemaUtilitiesInfo, AceExpandDialogType.STREAM_SCHEMA, this.isOnlyDisplayMode);
    }

    openWhiteListEditor() {
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    onCreate(event) {
    }

    onDestroy(event) {
    }

    clearStartDate() {
        // this.inputStartDate.nativeElement.value = "";
        this.startDate = null;
    }

    clearEndDate() {
        // this.inputEndDate.nativeElement.value = "";
        this.endDate = null;

    }

    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.filterTabActive = false;
                this.processorTabActive = false;
                this.schemaTabActive = false;
                this.historyTabActive = false;
                break;
            // this.generalTab.nativeElement.scrollIntoView({behavior: 'smooth'});
            case  'Filter':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.filterTabActive = true;
                this.processorTabActive = false;
                this.schemaTabActive = false;
                this.historyTabActive = false;
                break;
            case  'Processor':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.filterTabActive = false;
                this.processorTabActive = true;
                this.schemaTabActive = false;
                this.historyTabActive = false;
                break;
            case  'Schema':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.filterTabActive = false;
                this.processorTabActive = false;
                this.schemaTabActive = true;
                this.historyTabActive = false;
                break;
            case  'History':
                this.generalTabActive = false;
                this.filterTabActive = false;
                this.processorTabActive = false;
                this.schemaTabActive = false;
                this.historyTabActive = true;
                break;
        }
    }

    openOnNewTab() {
        window.open('/#/pages/streams/' + this._appState.getCurrentProduct() + '/' + this._appState.getCurrentSeason() + '/' + this._appState.getCurrentBranch() + '/' + this.stream
            .uniqueId);
    }
}



