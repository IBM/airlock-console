import {
    Component,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgZone, Optional,
    Output,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {FeatureInFlatList, FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {Rule} from "../../../model/rule";
import {AceExpandDialogType} from "../../../app.module";
import {
    NbDialogRef,
    NbDialogService,
    NbGlobalLogicalPosition,
    NbMenuItem,
    NbTabsetModule,
    NbToastrService,
    NbMenuService
} from "@nebular/theme";
import {TransparentSpinner} from "../transparentSpinner";
import {GlobalState} from "../../../global.state";
import {Subject} from "rxjs";
import {AceModal} from "../../modals/aceModal/aceModal.component";
import {VerifyActionModal, VerifyDialogType} from "../../modals/verifyActionModal";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {SaveActionModal} from "../../modals/saveActionModal";
import {Poll} from "../../../model/poll";
import {PollCell} from "../pollCell";
import {LayoutService} from "../../../@core/utils";
import * as moment from 'moment';


@Component({
    selector: 'edit-poll-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NbTabsetModule],
    styleUrls: ['./editPollModal.scss'],
    templateUrl: './editPollModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditPollModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('general') generalTab;
    @ViewChild('rule') ruleTab;
    // @ViewChild('config') configTab;
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean;
    modalHeight: String;
    loading: boolean = false;
    selectedParent: FeatureInFlatList;
    inputSampleLoaded = false;
    poll: Poll;
    originalPoll: Poll;
    verifyActionModal: VerifyActionModal;
    possibleGroupsList: Array<any> = [];
    selectedSubFeatureToAdd: Feature = null;
    private elementRef: ElementRef;
    modalWidth: string;
    minAppVersionForSample = "";
    stageForSample = null;
    creationDate: Date;
    startDate: Date = null;
    endDate: Date = null;
    featureItems: NbMenuItem[] = [
        {
            title: 'General',
            link: '/example/menu/menu-service.component'
        },
        {
            title: this.getString('edit_feature_rule_tab_heading'),
            link: '/example/menu/menu-service.component/3'
        },
        {
            title: this.getString('edit_feature_configuration_tab_heading'),
            link: '/example/menu/menu-service.component/4'
        }
    ];
    configRuleItems: NbMenuItem[] = [
        {
            title: 'General',
        },
        {
            title: this.getString('edit_feature_rule_tab_heading'),
        },
        {
            title: this.getString('edit_configuration_rule_tab_learn_more'),
        },
    ];
    orderRuleItems: NbMenuItem[] = [
        {
            title: 'General',
        },
        {
            title: this.getString('edit_feature_rule_tab_heading'),
        },
        {
            title: this.getString('edit_order_rule_tab_learn_more'),
        },
    ];
    pollItems: NbMenuItem[] = [
        {
            title: 'General',
        },
        {
            title: this.getString('edit_feature_rule_tab_heading'),
        },
        {
            title: 'Overview',
        },
    ];
    allItems: NbMenuItem[] = [
        {
            title: 'General',
        },
        {
            title: this.getString('edit_feature_rule_tab_heading'),
        }
    ];
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    configTabActive: boolean = false;
    ruleTabActive: boolean = false;
    lastModificationDate: Date;
    pollCell: PollCell;
    configurationSchemaString: string;
    defaultConfigurationString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    sourceFeature: Feature = null;
    showConfiguration: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    allowChangeParent: boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo: string;
    aceEditorRuleHeight: string = LayoutService.calculateModalHeight(450);
    aceEditorConfigurationHeight: string = LayoutService.calculateModalHeight(500, 2);
    // aceEditorRuleHeight: string = "250px";
    // aceEditorConfigurationHeight: string = "136px";
    aceEditorConfigurationHeightForOrder: string = "48px";
    private sub: any = null;
    menuItems: NbMenuItem[];
    private destroy$ = new Subject<void>();
    selectedItem: string;

    constructor(private _airLockService: AirlockService,
                private menuService: NbMenuService,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                @Optional() private modalRef: NbDialogRef<EditPollModal>,
                private modalService: NbDialogService) {
        this.elementRef = elementRef;
        this.possibleGroupsList = _appState.getAvailableGroups();

        this.menuItems = this.pollItems;

        this.menuService.onItemClick().subscribe((itemBag) => {
            let title = itemBag.item.title;
            let d = document.getElementById("accordionTabId");
            switch (title) {
                case 'General':
                    this.generalTabActive = true;
                    this.configTabActive = false;
                    this.ruleTabActive = false;
                    break;
                case  'Rule':
                    this.generalTabActive = false;
                    this.configTabActive = false;
                    this.ruleTabActive = true;
                    break;
                case  'Configuration':
                    this.generalTabActive = true;
                    this.configTabActive = false;
                    this.ruleTabActive = false;
                    break;
            }
            let g = this.generalTab;
            // document.querySelector("#general").scrollIntoView({behavior: 'smooth'});
        })
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    static calculateModalSize(): string {
        const marginW = 100;
        return (document.documentElement.clientWidth - marginW).toString() + 'px';
    };

    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.configTabActive = false;
                this.ruleTabActive = false;
                break;
            case  'Rule':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.configTabActive = false;
                this.ruleTabActive = true;
                break;
            case  'Configuration':
                this.loadAutoCompleteIfNeeded();
                this.generalTabActive = false;
                this.configTabActive = true;
                this.ruleTabActive = false;
                break;
        }
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    menuItemClicked(event) {
        console.log("menuItemClicked");
        console.log(event);
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

        this.generalTabActive = true;
        this.configTabActive = false;
        this.ruleTabActive = false;
        this.selectedSubFeatureToAdd = null;
    }

    isConfigMode() {
        return false;
    }

    isValid() {
        if (this.poll.pollId == null || this.poll.pollId.length == 0) {
            return "pollId is required";
        }
        return "";
    }

    removeDuplicateSon(item: Feature, parentId: string, itemId: string) {
        if (item.uniqueId === parentId) {
            for (let i = 0; i < item.features.length; ++i) {
                if (item.features[i].uniqueId == itemId) {
                    item.features.splice(i, 1);
                    return;
                }
            }
        } else {
            item.features.forEach((curSon) => {
                    this.removeDuplicateSon(curSon, parentId, itemId);
                }
            );
        }
    }

    validate() {

    }

    getTypeAsString(): string {
        return "feature";
    }

    save(dontClose = false, callback: (answer: boolean) => any = null) {
        const validError: string = this.isValid();
        if (validError.length == 0) {
            if (this.poll.stage == 'DEVELOPMENT' && (this.poll.internalUserGroups == null || this.poll.internalUserGroups.length <= 0)) {
                let message = 'This ' + this.getTypeAsString() + ' will not be visible to users because no user groups are specified. Are you sure want to continue?';
                this.modalService.open(ConfirmActionModal, {
                    closeOnBackdropClick: false,
                    context: {
                        message: message,
                    }
                }).onClose.subscribe(confirmed => {
                    if (confirmed) {
                        this._save(dontClose, callback);
                    }
                });
                // modalAlert.confirm()
                //     .title(message)
                //     .open()
                //     .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                //     .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                //     .then(() => {
                //         this._save();
                //     }) // if were here ok was clicked.
                //     .catch(err => {
                //         this.loading = false;
                //         this.handleError(err);
                //     });
            } else {
                if (this.poll.stage == 'PRODUCTION') {
                    let messageCode: string;
                    let verifyDialogType = null;

                    messageCode = "edit_change_production_poll";
                    verifyDialogType = VerifyDialogType.POLL_TYPE;

                    this.modalService.open(VerifyActionModal, {
                        closeOnBackdropClick: false,
                        context: {
                            poll: this.poll,
                            text: this._stringsSrevice.getString(messageCode),
                            verifyModalDialogType: verifyDialogType,
                        }
                    }).onClose.subscribe(confirmed => {
                        if (confirmed) {
                            this._save(dontClose, callback);
                        }
                    });
                } else {
                    this._save(dontClose, callback);
                }
            }
        } else {
            this.create(validError);
        }
    }

    deleteOrderRule(id: string) {

    }

    private mapSubFeaturesIdsToOrderIndex: any = {};
    private isShowSubFeatures: any = {};


    getFilterExisitngSubFeature() {
        let mapIdsToNames = {};
        return this.sourceFeature.features.filter(x => {
            return (mapIdsToNames[x.uniqueId] == null)
        });
    }

    getOrderRulesAsJsonObjedct(): string {
        const retObj = {};
        // return this.stringify(retObj).replace(new RegExp("\"@", 'g'),"").replace(new RegExp("@\"", 'g'),"").replace(/\\#/g, '\"').replace(/#/g, '"');
        return this.stringify(retObj);

    }

    isOrderRulesValid(): boolean {
        return true;
    }

    clearStartDate() {
        this.startDate = null;
        this.poll.startDate = null;
    }

    endDateChanged(event) {
        if (event) {
            let formattedDate = (moment(event)).format('YYYY-MM-DDTHH:mm:ss')
            this.poll.endDate = formattedDate;
        } else {
            this.poll.endDate = null;
        }
    }

    startDateChanged(event) {
        if (event) {
            let formattedDate = (moment(event)).format('YYYY-MM-DDTHH:mm:ss')
            this.poll.startDate = formattedDate;
        } else {
            this.poll.startDate = null;
        }
    }

    clearEndDate() {
        this.endDate = null;
        this.poll.endDate = null;
    }
    _save(dontClose = false, callback: (answer: boolean) => any = null) {
        this.loading = true;
        if (!this.isOnlyDisplayMode) {
            if (!this.poll.internalUserGroups) {
                this.poll.internalUserGroups = [];
            }
        }

        const featureToUpdate: Poll = this.poll;

        featureToUpdate.rolloutPercentage = Number(featureToUpdate.rolloutPercentage);
        this._airLockService.updatePoll(featureToUpdate).then(result => {
            this.loading = true;
            if (this.pollCell != null) {
                featureToUpdate.lastModified = result.lastModified;
                this.pollCell.updateFeature(featureToUpdate);
            }
            if (dontClose) {
                this.refreshEditScreen(result, "outputEventWhiteListUpdate");
                if (callback) {
                    this.loading = false;
                    callback(true);
                }
            } else {
                this.close(true)
            }
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
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

    loadAutoCompleteIfNeeded() {
        if (!this.inputSampleLoaded || !this.ruleUtilitiesInfo ||
            this.minAppVersionForSample != this.poll.minVersion ||
            this.stageForSample != this.poll.stage) {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.poll.minVersion;
            this.stageForSample = this.poll.stage;
            this.loadAutoComplete();
        } else {
            this.loading = false;
        }
    }

    loadAutoComplete(silent: boolean = false) {
        if (!silent) {
            this.loading = true;
        }
        let loadPhase2 = (result: boolean): void => {
            this._airLockService.getPollInputSample(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result3 => {
                this.ruleInputSchemaSample = result3 as string;
                this.loading = false;
                if (this.ruleUtilitiesInfo) {
                    this.stageForSample = this.poll.stage;
                    this.minAppVersionForSample = this.poll.minVersion;
                    this.inputSampleLoaded = true;
                }
            }).catch(error => {
                console.log('Error in getting Experiment  Input Sample');
                let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get poll Input Sample Schema ");
                this._airLockService.notifyDataChanged("error-notification", errorMessage);
                this.loading = false;
            });
        }
        this._airLockService.getPollUtilitiesInfo(this.poll.uniqueId, this.poll.stage, this.poll.minVersion).then(result2 => {
            this.ruleUtilitiesInfo = result2 as string;
            loadPhase2(true);
        }).catch(error => {
            console.log('Error in getting experiment utilities info');
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to get poll Utilities info ");
            this._airLockService.notifyDataChanged("error-notification", errorMessage);
            loadPhase2(false);
        });
    }
    
    
    
    beautifyString(str: string) {
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
    getSubFeaturesOrder() {

    }

    handleError(error: any) {
        this.loading = false;
        if (error == null) {
            return;
        }

        const errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editFeatureModal:" + errorMessage);
        console.log(error);
        this.create(errorMessage);
    }

    parseErrorMessage(error: any): string {
        let errorMessage = error._body || "Request failed, try again later.";
        try {
            const jsonObj = JSON.parse(errorMessage);
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

    close(wasUpdated) {
        this.visible = false;
        this.inlineMode = false;
        this.isOpen = false;
        this.initAfterClose();
        this.loaded = false;
        this.loading = false;
        this.modalRef?.close(wasUpdated);
        this.onClose.emit(wasUpdated);
    }

    refreshEditScreen(updated: Poll, message = "") {
        this.originalPoll = updated;
        this.poll = Poll.clone(updated);
        this.loading = false;
    }

    getMapNameForIdsForSubFeatures() {
        const map = {};
        for (let i = 0; i < this.sourceFeature.features.length; ++i) {
            let subFeature: Feature = this.sourceFeature.features[i];
            let id: string = subFeature.uniqueId;
            map[id] = subFeature.name;
        }
        return map;
    }

    convertConfigurationIntoJson(order: string, mapIds: any) {
        const places = [];
        for (let id in mapIds) {
            if (mapIds.hasOwnProperty(id)) {
                let place = order.indexOf(id);
                if (place > -1) {
                    places.push({"id": id, "place": place});
                }
            }
        }
        places.sort((a, b): number => {
            return a.place - b.place;
        });
        const retObj = {};
        let i = 0;
        for (; i < places.length; ++i) {
            let startIndex = order.indexOf(":", places[i].place);
            let endIndex = 0;
            if (i < places.length - 1) {
                let endPlace = places[i + 1].place;
                endIndex = order.lastIndexOf(",", endPlace);

            } else {
                endIndex = order.lastIndexOf("}");
            }
            retObj[places[i].id] = order.substr(startIndex + 1, endIndex - startIndex - 1);
        }
        return retObj;
    }

    parseOrderRules(order: string): Array<any> {
        try {
            let mapIdsToNames = this.getMapNameForIdsForSubFeatures();
            const arr: Array<any> = [];
            // var orderOutputJson = this.convertConfigurationIntoJson(order,mapIdsToNames);//this.stringify(this.poll.configuration, undefined, 4);
            const orderOutputJson = JSON.parse(order); //this.stringify(this.poll.configuration, undefined, 4);
            for (let id in orderOutputJson) {
                if (orderOutputJson.hasOwnProperty(id)) {
                    let value = orderOutputJson[id];
                    arr.push({"id": id, "name": mapIdsToNames[id], "value": value});
                }
            }
            return arr;
        } catch (e) {
            console.log(e);
            return [];
        }
    }

    selectFeatureToAdd(item: Feature) {
        this.selectedSubFeatureToAdd = item;
    }

    defaultIfAirlockSystemIsDownChanged(event) {
        console.log(event.valueOf());
    }

    ngOnInit() {
        this.isOpen = true;
        this.loading = false;
        this.title = this.getString("edit_poll_title");

        this.modalHeight = LayoutService.calculateModalHeight();
        this.modalWidth = LayoutService.calculateModalWidth();

        if (this.poll != null) {
        }

        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.poll.stage == "PRODUCTION"));
        //change dates to better format
        if (this.poll != null) {
            this.creationDate = new Date(this.poll.creationDate);
            this.lastModificationDate = new Date(this.poll.lastModified);
            this.startDate = new Date(this.poll.startDate);
        }

        this.loaded = true;
        this.ruleTabActive = false;
        this.configTabActive = false;
        this.generalTabActive = true;
        // }
        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }

    }

    ruleUpdated(event) {
        this.poll.rule.ruleString = event;
    }

    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }

    defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }

    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
    }

    referenceSchemaUpdated(event) {
        this.referenceSchemaString = event;
    }

    showRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.363ue557y7d0');
    }

    showConfigurationHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.igpio3q4s3ui');
    }

    showOrderingRuleHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.p8mht5pcwz9u');
    }

    showConfigurationSchemaHelp() {
        window.open('http://jsonschema.net/');
    }
    shouldAskToSave(): boolean {
        return this.loaded && this.isDirty();
    }
    open(poll: Poll,
         strInputSchemaSample: string,
         strUtilitiesInfo: string,
         pollCell: PollCell = null) {
        this.showDeepLink = true;
        if (this.loaded && this.isDirty()) {
            let message = this._featureUtils.getPollDisplayName(this.poll) + ' has changed and not saved. do you wish to save it now?';
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
                    this._open(poll, strInputSchemaSample, strUtilitiesInfo, pollCell);
                }
            });
        } else {
            this._open(poll, strInputSchemaSample, strUtilitiesInfo, pollCell);
        }
    }
    _open(poll: Poll,
          strInputSchemaSample: string,
          strUtilitiesInfo: string,
          pollCell: PollCell = null) {
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.visible = true;
        this.originalPoll = poll;
        this.isOpen = true;
        this.loading = false;
        this.poll = Poll.clone(poll);
        this.title = this.getString("edit_poll_title");
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.pollCell = pollCell;
        
        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.poll.stage == "PRODUCTION"));
        //change dates to better format
        this.creationDate = new Date(this.poll.creationDate);
        if (!!this.poll.startDate) {
            this.startDate = new Date(this.poll.startDate);
        } else {
            this.startDate = null;
        }
        if (!!this.poll.endDate) {
            this.endDate = new Date(this.poll.endDate);
        } else {
            this.endDate = null;
        }
        this.lastModificationDate = new Date(this.poll.lastModified);


        console.log("this.sourceFeature");
        console.log(this.sourceFeature);
        if (!this.ruleInputSchemaSample || !this.ruleUtilitiesInfo) {
            this.inputSampleLoaded = false;
            this.loadAutoComplete(true);
        } else {
            this.inputSampleLoaded = true;
            this.minAppVersionForSample = this.poll.minVersion;
        }

        this.loaded = true;

        // if (showConfiguration) {
        //     this.ruleTabActive = false;
        //     this.hirarchyTabActive = false;
        //     this.generalTabActive = false;
        //     this.premiumTabActive = false;
        //     this.configTabActive = true;
        // } else {
            this.ruleTabActive = false;
            this.configTabActive = false;
            this.generalTabActive = true;
        // }
        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
                // this.onShowFeature.emit(true);
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
    showDeepLink: boolean = true;

    canMoveOn(callback: (answer: boolean) => any) {
        if (this.loaded && this.isDirty()) {
            let message = this.poll.pollId + ' has changed and not saved. do you wish to save it now?';
            this.modalService.open(SaveActionModal, {
                closeOnBackdropClick: false,
                context: {
                    title: message,
                }
            }).onClose.subscribe(status => {
                if (status === 'cancel') {
                    callback(false);
                } else if (status === 'save') {
                    this.save(true, callback);
                } else if (status === 'discard') {
                    this.refreshEditScreen(this.originalPoll);
                    callback(true);
                }
            });
        } else {
            callback(true);
        }
    }

    create(message: string) {
        this.toastrService.danger(message, "Save failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });

    }



    openAceEditorRuleExpand() {
        const expandDialogTitle = this.title + " - " + this._featureUtils.getPollDisplayName(this.poll);
        this.aceModalContainerDialog.showAceModal(this.poll.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorDefaultConfigurationExpand() {
        // var expandDialogTitle = this.getString('edit_feature_configuration_default_configuration_edit_title') + " - " + this.poll.namespace + "." + this._featureUtils.getFeatureDisplayName(this.poll);
        // this.aceModalContainerDialog.showAceModal(this.defaultConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.DEFAULT_CONFIG, this.isOnlyDisplayMode);
    }

    openAceEditorReferenceSchemaExpand() {
        // var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.poll.namespace + "." + this._featureUtils.getFeatureDisplayName(this.poll);
        // this.aceModalContainerDialog.showAceModal(this.referenceSchemaString, expandDialogTitle, "", "", AceExpandDialogType.REFERENCE_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorOrderRuleExpand(index: number) {
    }

    openAceEditorOutputConfigurationExpand() {
        // var expandDialogTitle = this.getString('edit_feature_configuration_tab_heading') + " - " + this.poll.namespace + "." + this._featureUtils.getFeatureDisplayName(this.poll);
        // this.aceModalContainerDialog.showAceModal(this.outputConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.OUTPUT_CONFIG, this.isOnlyDisplayMode);
    }

    openWhiteListEditor() {
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    isDirty(): boolean {
        return this.poll && this.originalPoll && !FeatureUtilsService.isPollIdentical(this.poll, this.originalPoll);
    }


    onCreate(event) {
    }

    onDestroy(event) {
    }

    tabSelected(event: any) {
    }

    openOnNewTab() {
        window.open('/#/pages/polls/' + this._appState.getCurrentProduct() + '/' + this.poll.uniqueId);
    }
}



