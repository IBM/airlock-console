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
import {AnalyticsExperimentQuota} from "../../../model/analyticsQuota";
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
import {ExperimentCell} from "../experimentCell/experimentCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {Branch} from "../../../model/branch";
import {Experiment} from "../../../model/experiment";
//import {AnalyticsDisplay} from "../../../model/analyticsDisplay";
import {AnalyticsExperiment, AnalyticsDataCollectionByFeatureNames} from "../../../model/analyticsExperiment";
import {AceExpandDialogType} from "../../../app.module";

@Component({
    selector: 'edit-experiment-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editExperimentModal.scss'),require('select2/dist/css/select2.css')],
    // directives: [UiSwitchComponent,COMMON_DIRECTIVES,MODAL_DIRECTIVES,DROPDOWN_DIRECTIVES,TAB_DIRECTIVES,ACCORDION_DIRECTIVES,
    //         BUTTON_DIRECTIVES, ButtonRadioDirective, TOOLTIP_DIRECTIVES, AceEditor, /*Markdown,*/ HirarchyTree,
    //         SimpleNotificationsComponent, AirlockTooltip, AceModal],

    template: require('./editExperimentModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditExperimentModal{
    @ViewChild('editModal') modal: ModalComponent;
    @ViewChild('paceModalContainerDialog') aceModalContainerDialog : AceModal;
    loading: boolean = false;
    //@Input() season:Season;
    @Input() product:Product;
    @Input() experiment: Experiment;
    @Input() rootFeatuteGroups : Array<Feature>;
    @Output() onEditExperiment= new EventEmitter<any>();
    @Output() onShowExperiment= new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate : EventEmitter<any> = new EventEmitter();
    @Input() rootId: string;
    @Input() verifyActionModal: VerifyActionModal;
    @Input() possibleGroupsList :Array<any> = [];
    //featurePath: Array<Feature> = [];
    private elementRef:ElementRef;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private descriptionTabActive:boolean = false;
    private ruleTabActive:boolean = false;
    private analitycsTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    lastModificationDate:Date;
    experimentCell: ExperimentCell = null;
    configurationSchemaString: string;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    title: string;
    isOnlyDisplayMode:boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo:string;
    analyticsExperiment: AnalyticsExperiment;
    totalCountQuota : number;
    totalAnaliticsCount : number;
    totalAnaliticsDevCount : number;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
    private sub:any = null;
    canUseAnalytics: boolean;

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
        this.experiment = null;
        this.generalTabActive = true;
        this.descriptionTabActive = false;
        this.ruleTabActive = false;
        this.analitycsTabActive = false;
        this.isShowHirarchy  = false;
        this.removeAll();
    }

    isValid(){
        if(this.experiment.name  == null || this.experiment.name.length == 0){
            return "name is required";
        }
        if(this.experiment.minVersion) {
            this.experiment.minVersion = this.experiment.minVersion.trim();
        }
        if(this.experiment.stage=="PRODUCTION" && !this.experiment.minVersion) {
            return "Cannot remove minimum app version in production"
        }

        try{
            if (this._isMinVersionGreaterThanMaxSeason()) {
                return this.getString("edit_experiment_error_min_experiment_bigger_max_version");
            }
        }catch(e){
            console.log("ERROR:"+e);
        }
        return "";
    }

    _isMinVersionGreaterThanMaxSeason():boolean {
        var minAppArr = this.experiment.minVersion.split('.');
        var maxSeasonArr = this.experiment.maxVersion.split('.');
        let maxNum = Math.max(minAppArr.length,maxSeasonArr.length);
        for (var i=0;i<maxNum;i++) {
            var minAppNum = 0;
            if (i<minAppArr.length) {
                minAppNum = Number(minAppArr[i]);
            }
            var maxSeasonNum = 0;
            if (i<maxSeasonArr.length) {
                maxSeasonNum = Number(maxSeasonArr[i]);
            }
            if (!maxSeasonNum || !minAppNum || maxSeasonNum==null || minAppNum==null) {
                return false;
            }

            if (minAppNum > maxSeasonNum) {
                return true;
            } else if (minAppNum < maxSeasonNum) {
                return false;
            }
        }
        return true;


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
            if (this.experiment.stage=='DEVELOPMENT' && (this.experiment.internalUserGroups==null || this.experiment.internalUserGroups.length <=0)) {
                let message = 'This experiment will not be visible to users because no user groups are specified. Are you sure want to continue?';
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
                if(this.experiment.stage == 'PRODUCTION'){
                    this.sub = this.verifyActionModal.actionApproved$.subscribe(
                        astronaut => {

                            this._save();

                        });
                    console.log("open verifyActionModal");
                    this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_experiment"),this.experiment, VeryfyDialogType.EXPERIMENT_TYPE);
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
        if (!this.experiment.internalUserGroups) {
            this.experiment.internalUserGroups = [];
        }

        var experimentToUpdate: Experiment = this.experiment;


        experimentToUpdate.rolloutPercentage = Number(experimentToUpdate.rolloutPercentage);
        let experimentStr = JSON.stringify(experimentToUpdate);
        console.log("experimentStr:", experimentStr);
        this._airLockService.updateExperiment(experimentToUpdate).then(result => {
            this.loading = true;
            this.onEditExperiment.emit(null);
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
        this.onShowExperiment.emit(false);
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }

    open(experiment: Experiment, analyticsExperimentQuota: AnalyticsExperimentQuota, strInputSchemaSample:string, strUtilitiesInfo:string, analyticsExperiment: AnalyticsExperiment, experimentCell: ExperimentCell = null) {
        this.canUseAnalytics = this._airLockService.canUseAnalytics();
        this.isOpen = true;
        this.loading = false;
        this.experiment = Experiment.clone(experiment);
        this.title = this.getString("edit_experiment_title");
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.analyticsExperiment = analyticsExperiment;
        console.log("this.analyticsExperiment", this.analyticsExperiment);
        this.totalCountQuota = analyticsExperimentQuota.analyticsQuota;
        this.totalAnaliticsCount = this.getWhitelistCount();
        this.totalAnaliticsDevCount = this.getWhitelistDevCount();
        this.experimentCell = experimentCell;

        this.isOnlyDisplayMode = (this._airLockService.isViewer() || (this._airLockService.isEditor() && this.experiment.stage == "PRODUCTION"));

        //change dates to better format
        this.creationDate= new Date(this.experiment.creationDate);
        this.lastModificationDate = new Date(this.experiment.lastModified);

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
                    this.experiment.rolloutPercentage = $$('.numberInput').val();
                    //$$('.numberInput').mask('000.0000', { reverse: true });
                }
            );
            $$('.js_example').on(
                'change',
                (e) => {
                    if(this.experiment != null) {
                        this.experiment.internalUserGroups = jQuery(e.target).val();
                    }
                }
            );
            $exampleMulti.val(this.experiment.internalUserGroups).trigger("change");
            $$('.numberInput').trigger("change");
        },100);


        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                this.ruleTabActive = false;
                this.analitycsTabActive = false;
                this.descriptionTabActive = false;
                this.generalTabActive = true;

                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowExperiment.emit(true);
                this.modal.open('lg');
            });

        }

    }

    getWhitelistCount() {
        let count = 0;
        if (this.analyticsExperiment ) {
            count = this.analyticsExperiment.productionItemsReportedToAnalytics;
        }
        return count;
    }

    getWhitelistDevCount() {
        let count = 0;
        if (this.analyticsExperiment ) {
            count = this.analyticsExperiment.developmentItemsReportedToAnalytics;
        }
        return count;
    }

    ruleUpdated(event) {
        this.experiment.rule.ruleString = event;
    }

    showAnaliticsHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/analytics');
    }

    isFeatureSendToAnalytics(feature:AnalyticsDataCollectionByFeatureNames){
        return feature.sendToAnalytics;
    }
    isFeatureExistInAllBranches(feature:AnalyticsDataCollectionByFeatureNames) {
        if (feature && feature.branches != undefined){
            return false;
        }
        else
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
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.experiment.name;
        this.aceModalContainerDialog.showAceModal(this.experiment.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType




            .FEATURE_RULE, this.isOnlyDisplayMode);
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



