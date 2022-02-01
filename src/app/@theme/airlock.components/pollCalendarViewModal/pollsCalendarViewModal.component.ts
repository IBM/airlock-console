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
import {CalendarOptions} from "@fullcalendar/angular";
import * as moment from 'moment';

@Component({
    selector: 'polls-calendar-view',
    providers: [FeatureUtilsService, TransparentSpinner, NbTabsetModule],
    styleUrls: ['./pollsCalendarViewModal.scss'],
    templateUrl: './pollsCalendarViewModal.html',
    encapsulation: ViewEncapsulation.None
})

export class PollsCalendarViewModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    @ViewChild('general') generalTab;
    // @ViewChild('config') configTab;
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean;
    modalHeight: String;
    loading: boolean = false;
    selectedParent: FeatureInFlatList;
    inputSampleLoaded = false;
    polls: Poll[];
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
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        dateClick: this.handleDateClick.bind(this), // bind is important!
        selectable: true,
        events: [
            { title: 'event 2', date: '2019-04-02' },
            {
                title  : 'Churn Reason',
                start  : '2021-11-08',
                end    : '2021-11-13'
            },
        ]
    };
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
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
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
                @Optional() private modalRef: NbDialogRef<PollsCalendarViewModal>,
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
    }

    endDateChanged(event) {

    }

    startDateChanged(event) {

    }

    clearEndDate() {
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

    }

    loadAutoComplete(silent: boolean = false) {

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


        this.isOnlyDisplayMode = true;


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
    open(polls: Poll[]) {
        this.showDeepLink = true;
        this._open(polls);
    }
    _open(polls: Poll[]) {
        this.modalHeight = 'none';
        this.modalWidth = 'none';
        this.inlineMode = true;
        this.polls = polls;
        this.visible = true;
        this.isOpen = true;
        this.loading = false;
        this.title = "Polls overview";

        this.isOnlyDisplayMode = true;

        this.loaded = true;
            this.generalTabActive = true;
        // }
        if (this.aceModalContainerDialog) {
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        this.generateEvents(this.polls);
     }

     generateEvents(polls: Poll[]) {
        /*
        events: [
            { title: 'event 2', date: '2019-04-02' },
            {
                title  : 'Churn Reason',
                start  : '2021-11-08',
                end    : '2021-11-13'
            },
        ]
         */
         let events = [];
         if (polls && polls.length > 0) {
             for (let i = 0; i < polls.length; ++i) {
                 let poll = polls[i];
                 let event = { title: poll.pollId};
                 if (poll.startDate) {
                     let formattedDate = (moment(new Date(poll.startDate))).format('YYYY-MM-DD');
                     event['start'] = formattedDate;
                 }
                 if (poll.endDate) {
                     let formattedDate = (moment(new Date(poll.endDate))).format('YYYY-MM-DD');
                     event['end'] = formattedDate;
                 }
                events.push(event);
             }
         }
         this.calendarOptions["events"] = events;
     }

    handleDateClick(arg) {
        alert('date click! ' + arg.dateStr)
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
        return false;
    }


    onCreate(event) {
    }

    onDestroy(event) {
    }

    tabSelected(event: any) {
    }

    openOnNewTab() {

    }
}



