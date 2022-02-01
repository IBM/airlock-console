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

import {Product} from "../../../model/product";
import * as $$ from "jquery";

import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
// import {AceModal} from "../aceModal/aceModal.component";
import {VerifyActionModal} from "../verifyActionModal/verifyActionModal.component";
import {AnalyticsDataCollectionByFeatureNames} from "../../../model/analyticsExperiment";
import {Dataimport} from "../../../model/dataimport";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {TabsetConfig} from "ngx-bootstrap/tabs";
import {AceModal} from "../aceModal/aceModal.component";
import {GlobalState} from "../../../global.state";
import {LayoutService} from "../../../@core/utils";

@Component({
    selector: 'edit-dataimport-modal',
    styleUrls: ['./editDataimportModal.scss'],
    templateUrl: './editDataimportModal.html',
    encapsulation: ViewEncapsulation.None
})

export class EditDataimportModal {
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog: AceModal;
    loading: boolean = false;
    //@Input() season:Season;
    @Input() product: Product;
    @Input() job: Dataimport;
    @Input() rootFeatuteGroups: Array<Feature>;
    @ViewChild('general') generalTab;
    @ViewChild('statusTab') statusTab;
    @Output() onEditCohort = new EventEmitter<any>();
    @Output() onShowCohort = new EventEmitter<any>();
    @Output() onRefreshCohort = new EventEmitter<any>();
    @Input() verifyActionModal: VerifyActionModal;
    @Input() visible = false;
    @Output() onClose = new EventEmitter<any>();
    inlineMode: boolean = false;
    //featurePath: Array<Feature> = [];
    private elementRef: ElementRef;
    creationDate: Date;
    importType: string;
    destinationTableName: string;
    loaded = false;
    isOpen: boolean = false;
    generalTabActive: boolean = true;
    statusTabActive: boolean = false;
    private isShowHirarchy: boolean = false;
    private enableExportChanges: boolean = false;
    lastModificationDate: Date;
    lastExportDate: Date;
    configurationSchemaString: string;
    outputConfigurationString: string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode: boolean = false;
    showValueExpression: boolean = false;
    totalAnaliticsCount: number;
    totalAnaliticsDevCount: number;
    aceEditorRuleHeight: string = "190px";
    aceEditorAdditionalHeight: string = "80px";
    private sub: any = null;
    canUseAnalytics: boolean;
    affectedColumsStr: string = "";
    frequencyValues: string[] = ["MANUAL", "HOURLY", "DAILY", "WEEKLY", "MONTHLY"];
    modalHeight: string;
    modalWidth: string;
    private currModifiedBy: string;

    constructor(private _airLockService: AirlockService,
                private _state:GlobalState,
                @Inject(ElementRef) elementRef: ElementRef,
                private _featureUtils: FeatureUtilsService,
                private zone: NgZone,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                @Optional() private modalRef: NbDialogRef<EditDataimportModal>) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    ngOnInit() {
        this.canUseAnalytics = this._state.canUseAnalytics();
        this.isOpen = true;
        this.loading = false;
        this.title = this.getString("show_job_title");
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        if (this.job?.affectedColumns) {
            this.affectedColumsStr = this.job.affectedColumns.join('\n');
        } else {
            this.affectedColumsStr = "";
        }
        this.isOnlyDisplayMode = true;

        //change dates to better format
        if (this.job != null){
            this.creationDate = new Date(this.job.creationDate);
            this.lastModificationDate = new Date(this.job.lastModified);
            this.destinationTableName = this.job.targetTable;
        }
        if (this.job?.overwrite) {
            this.importType = 'Overwrite';
        } else {
            this.importType = 'Update';
        }
        if (this.importType === undefined) {
            this.importType = 'Update';
        }
        if (this.destinationTableName === undefined) {
            this.destinationTableName = 'user_features';
        }

        //create groups combo box with tags
        // setTimeout(() => {
        //     var $exampleMulti = $$(".js_example").select2(
        //         {
        //             tags: true,
        //             tokenSeparators: [',', ' ']
        //         }
        //     );
        //     $$('.numberInput').trigger("change");
        // }, 100);

        if (this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.statusTabActive = false;
                this.generalTabActive = true;
                if (this.aceModalContainerDialog) {
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowCohort.emit(true);
            });
        }
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
        this.job = null;
        this.affectedColumsStr = "";
        this.generalTabActive = true;
        this.statusTabActive = false;
        this.isShowHirarchy = false;

    }

    isValid() {
        if (this.job.name == null || this.job.name.length == 0) {
            return "name is required";
        }

        return "";
    }

    removeDuplicateSon(item: Feature, parentId: string, itemId: string) {
        if (item.uniqueId === parentId) {
            for (var i = 0; i < item.features.length; ++i) {
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

    save() {

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

        var errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in editFeatureModal:" + errorMessage);
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
        this.onShowCohort.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modalRef?.close();
        this.onClose.emit(null);    }

    open(job: Dataimport, currModifiedBy: string = null) {
        this.modalHeight = 'none';
        this.modalWidth= 'none';
        this.currModifiedBy = currModifiedBy;
        this.inlineMode = true;
        this.isOpen = true;
        this.loading = false;
        this.job = job;
        this.title = this.getString("show_job_title");
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        if (this.job.affectedColumns) {
            this.affectedColumsStr = this.job.affectedColumns.join('\n');
        } else {
            this.affectedColumsStr = "";
        }

        this.isOnlyDisplayMode = true;

        //change dates to better format
        this.creationDate= new Date(this.job.creationDate);
        this.lastModificationDate = new Date(this.job.lastModified);
        this.destinationTableName = this.job.targetTable;
        if (this.job.overwrite){
            this.importType = 'Overwrite';
        }else {
            this.importType = 'Update';
        }
        if (this.importType === undefined) {
            this.importType = 'Update';
        }
        if (this.destinationTableName === undefined) {
            this.destinationTableName = 'user_features';
        }
        this.loaded = true;
        this.generalTabActive = true;

        if (this.aceModalContainerDialog){
            this.aceModalContainerDialog.closeDontSaveDialog();
        }
        this.onShowCohort.emit(true);
    }

    getWhitelistCount() {
        let count = 0;
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        return count;
    }

    showAnaliticsHelp() {
        window.open('https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.lal9wm6w3zm7');
    }

    isFeatureSendToAnalytics(feature: AnalyticsDataCollectionByFeatureNames) {
        return feature.sendToAnalytics;
    }

    isFeatureExistInAllBranches(feature: AnalyticsDataCollectionByFeatureNames) {
        if (feature && feature.branches != undefined) {
            return false;
        } else
            return true;
    }

    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }

    /*defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }
*/
    outputConfigurationUpdated(event) {
        this.outputConfigurationString = event;
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
        this.toastrService.danger(message, "Error", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    queryConditionUpdated(event) {

    }

    openAceEditorRuleExpand() {
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.job.name;
        // this.aceModalContainerDialog.showAceModal(this.cohort.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType
        // .FEATURE_RULE, this.isOnlyDisplayMode);
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


    selectTab(title: string) {
        switch (title) {
            case 'General':
                this.generalTabActive = true;
                this.statusTabActive = false;
                break;
            // this.generalTab.nativeElement.scrollIntoView({behavior: 'smooth'});
            case  'Status':
                this.generalTabActive = false;
                this.statusTabActive = true;
                break;
        }
    }

    openOnNewTab() {
        window.open('/#/pages/dataimport/' + this._state.getCurrentProduct() + '/' + this._state.getCurrentSeason()+'/' + this._state.getCurrentBranch() + '/' + this.job
            .uniqueId + '/' + this.currModifiedBy);
    }
}



