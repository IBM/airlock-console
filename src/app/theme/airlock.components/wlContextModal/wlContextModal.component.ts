import {Component, Injectable, EventEmitter, Output,  ViewChild, Input, AfterViewInit, NgZone} from "@angular/core";
import {BaThemeSpinner} from "../../../theme/services/baThemeSpinner/baThemeSpinner.service";
import {AirlockService} from "../../../services/airlock.service";
import { ModalComponent } from "ng2-bs3-modal/ng2-bs3-modal";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {Season} from "../../../model/season";
import 'select2';
import {} from "@angular/core";
import {Inject} from "@angular/core";
import {ElementRef} from "@angular/core";
import {UserGroups} from "../../../model/user-groups";
import {FeatureUtilsService,FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {AuthorizationService} from "../../../services/authorization.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {ShowMessageModal} from "../showMessageModal/showMessageModal.component";
import {TreeModule,TreeNode} from 'primeng/primeng';
import {Analytic} from "../../../model/analytic";
import {ToastrService} from "ngx-toastr";
import {Branch} from "../../../model/branch";


@Component({
    selector: 'wl-context-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./wlContextModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./wlContextModal.html'),
})

export class wlContextModal{
    @ViewChild('wlContextModal')
    modal: ModalComponent;
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('paceInputSchemaModalContainerDialog') aceModalContainerDialog : AceModal;
    @ViewChild('plainVersion') plainVersion: ElementRef;
    @Output() outputEventWhiteListUpdate : EventEmitter<any> = new EventEmitter();
    @Input() totalCount: number;
    @Input() totalCountDev: number;
    @Input() totalCountQuota: number;
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
    loading: boolean = false;
    private elementRef:ElementRef;
    loaded = false;
    isOpen:boolean = false;
    inputSchemaString :string;
    referenceOpen: boolean = false;
    title: string;
    private season:Season;
    private branch:Branch;

    ruleInputSchemaSample: string;
    analyticData: Analytic;
    seasonId: string;
    branchId: string;
    contextTree: TreeNode[];
    selectedInputFields: TreeNode[];
    selectedInputFieldsCopy: TreeNode[];
    whiteListData: string[];
    flatContextTree: TreeNode[];
    numSelectedFields: number;
    numSelectedFieldOnServer: number;

    constructor(private _spinner:BaThemeSpinner, private _airLockService:AirlockService,@Inject(ElementRef) elementRef: ElementRef,private _featureUtils:FeatureUtilsService,
                private authorizationService:AuthorizationService, private zone:NgZone, private _notificationService: NotificationsService
                , private _stringsSrevice: StringsService, public modalAlert: Modal, private toastrService: ToastrService) {
        this.elementRef = elementRef;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    ngOnInit() {
    }
    initAfterClose(){
        this.removeAll();
    }

    save() {
        this.promptSaveContextFields();
    }

    _save() {
        this.loading=true;

        this.analyticData.analyticsDataCollection.inputFieldsForAnalytics = [];// this.whiteListData;
        //replace array symbols . to []
        // Example: context.testData.precipitationForecast.0.intensity => context.testData.precipitationForecast[0].intensity
        for (var i in this.whiteListData){
            var strInputField = this.whiteListData[i].replace(/\.(\d+)/, '[$1]');
            this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.push(strInputField);
        }
        console.log('inputFieldsForAnalytics:', this.analyticData.analyticsDataCollection.inputFieldsForAnalytics);
        console.log('seasonID:', this.seasonId);
        this._airLockService.updateAnalyticsGlobalDataCollection(this.seasonId, this.branchId, this.analyticData).then(result => {
            this.loading = false;
            this.outputEventWhiteListUpdate.emit(this.season);
            this.close();
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
    }

    promptSaveContextFields() {
        //let message = "You selected " + this.numSelectedFields + " context fields. " + (this.numSelectedFields - this.numSelectedFieldOnServer)+" additional fields from the last save. Do you want to continue?";
        let message = this.numSelectedFields + this.getString("analytics_summary_context_warning");
        this.modalAlert.confirm()
            .title(message)
            .open()
            .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(() => {
                this._save();
            }) // if were here ok was clicked.
            .catch(err => {

            });
    }

    handleError(error: any,title:string = "Save Failed") {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = error._body || "Request failed, try again later.";

        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        console.log("handleError in editFeatureModal:"+errorMessage);
        console.log(error);
        // this.create(title,errorMessage);
        this.showMessageModal.open(title,errorMessage);
    }
    close(){
        this.isOpen = false;
        this.inputSchemaString = "";
        this.plainVersion.nativeElement.style.display = "none";
        this.initAfterClose();
        this.loaded = false;
        this.modal.close();
    }
/*

    contextTreeExpand(){
        this.expandAll();
    }
    contextTreeColapse(){
        this.collapseAll();
    }
*/

    showRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/analytics');
    }
    open(ruleInputSchemaSample: string, analyticData: Analytic, season:Season, branch:Branch) {

        this.loading = false;
        this.title = this.getString("add_context_to_whitelist_title");
        this.isOpen = true;
        this.season = season;
        this.branch = branch;
        console.log('')
        this.displayWhiteListABModal(ruleInputSchemaSample, analyticData, season.uniqueId, branch.uniqueId);
        this.numSelectedFields = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.length;
        this.numSelectedFieldOnServer = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics.length;
        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.modal.open('md');
            });

        }
    }

    create(title:string,message:string) {
        this.toastrService.error(message, title, {
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


    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

    ////////////
    displayWhiteListABModal(ruleInputSchemaSample: string, analyticData: Analytic, seasonId: string, branchId: string)
    {
        //console.log('in showWhiteListABModal');
        this.ruleInputSchemaSample = ruleInputSchemaSample;
        this.analyticData = analyticData;
        this.seasonId = seasonId;
        this.branchId = branchId;
        var inputFields: any;
        console.log('ruleInputSchemaSample for AB:', this.ruleInputSchemaSample);
        console.log('analyticData:', this.analyticData);

        function transform(o) {
            if (o && typeof o === 'object' && Object.keys(o).length != 0) {
                console.log('empty object', o);


                return Object.keys(o).map(function (k) {
                    var children = transform(o[k]);
                    //console.log('CHILDREN', children);
                    if (children && children.length > 0) {
                        //return { label: k, "expandedIcon": "fa-folder-open", "collapsedIcon": "fa-folder", children: children, leaf: false }
                        return {label: k, children: children, leaf: false};
                    }
                    else {
                        //let currObj =  { "label": k , "icon": "ion-wifi", leaf: true};
                        //console.log('o[k]', o[k]);
                        let currObj:TreeNode = {"label": k, leaf: true};
                        return currObj;
                        /*if (typeof o[k] === 'object') {
                            console.log('found object', k);
                            return {};
                        }
                        else {
                            let currObj = {"label": k, leaf: true};
                            return currObj;
                        }*/
                    }
                });

            }
        }

        function recursiveIteration(object, fullPath) {
            for (var property in object) {
                if (object.hasOwnProperty(property)) {
                    if (typeof object[property] == "object"){
                        recursiveIteration(object[property], fullPath);
                    }else{
                        if (property === "label") {
                            if (fullPath === "")
                                fullPath = object[property];
                            else
                                fullPath = fullPath + '.' + object[property];
                            object["data"] = fullPath;
                        }
                    }
                }
            }
        }

        function cleanFromEmptyObjects(object) {
            for (var property in object) {
                if (object.hasOwnProperty(property) && object[property]) {
                    if (object[property] && typeof object[property] == "object"){
                        if (Object.keys(object[property]).length === 0){
                            //console.log('empty object');
                            delete object[property];
                        }
                        cleanFromEmptyObjects(object[property]);
                    }
                }

            }
        }

        function markExistingAnalyticInputFields(fullPathName: string, objArray, selected, flatTreeArr){
            objArray.forEach(function(entry) {
                //console.log('DEB1:', entry, entry.data, isSelectParent);
                if (typeof entry.children != "undefined") {
                    flatTreeArr.push(entry);
                    markExistingAnalyticInputFields(fullPathName, entry.children, selected, flatTreeArr);
                }
                else{
                    if (entry.data === fullPathName){
                        //console.log('To MARK:', entry);
                        //console.log('To MARK.parent:', entry.parent);
                        selected.push(entry);
                    }
                }
            });

        }

        function markSelectedParents(fullPathName: string, flatTreeArr){
            for (var i in flatTreeArr) {
                if ( fullPathName.includes(flatTreeArr[i].data) ){
                    //console.log('mark this', flatTreeArr[i]);
                    flatTreeArr[i]["partialSelected"] = true;
                }
            }
        }

        var contextObj = {};
        this.selectedInputFields = [];
        this.selectedInputFieldsCopy = [];
        this.flatContextTree = [];
        cleanFromEmptyObjects(this.ruleInputSchemaSample);
        contextObj = transform(this.ruleInputSchemaSample);

        //var a = {"context":{"turbo":{"isOK":"2"},"profile":{},"userPreferences":{"isEasternArabicNumerals":true}}};
        //contextObj = transform(a);

        recursiveIteration(contextObj, "");
        console.log('contextObj:', contextObj);


        var obj = {};
        obj["data"] = contextObj;
        //console.log('tree for AB:', obj);
        this.contextTree = obj["data"];
        this.whiteListData = [];
        if (this.analyticData && this.analyticData.analyticsDataCollection && this.analyticData.analyticsDataCollection.inputFieldsForAnalytics) {
            for (var i in this.analyticData.analyticsDataCollection.inputFieldsForAnalytics) {
                //replace array symbols [] to .
                // Example: context.testData.precipitationForecast[0].intensity =>  context.testData.precipitationForecast.0.intensity
                var strInputField = this.analyticData.analyticsDataCollection.inputFieldsForAnalytics[i];
                strInputField = strInputField.replace('[','.');
                strInputField = strInputField.replace(']','');
                markExistingAnalyticInputFields(strInputField, this.contextTree, this.selectedInputFields, this.flatContextTree);
                this.whiteListData.push(strInputField);
            }
        }
        for (var i in this.selectedInputFields) {
            //console.log('SELECTED NODE', this.selectedInputFields[i]);
            markSelectedParents(this.selectedInputFields[i].data, this.flatContextTree);
        }

        this.selectedInputFieldsCopy = this.selectedInputFields.map(a => Object.assign({}, a));

        //expand first level
        if (this.contextTree[0])
            this.contextTree[0].expanded = true;
    }

    expandAll(){
        this.contextTree.forEach( node => {
            this.expandRecursive(node, true);
        } );
    }

    collapseAll(){
        this.contextTree.forEach( node => {
            this.expandRecursive(node, false);
        } );
    }

    private expandRecursive(node:TreeNode, isExpand:boolean){
        node.expanded = isExpand;
        if(node.children){
            node.children.forEach( childNode => {
                this.expandRecursive(childNode, isExpand);
            } );
        }
    }

    onNodeSelectingContext(event){

        /*if (!event.node.leaf) {
            // var index = this.selectedInputFields.indexOf(event.node, 0);
            // if (index > -1) {
            //     this.selectedInputFields.splice(index, 1);
            // }
            this.selectedInputFields = this.selectedInputFieldsCopy.map(a => Object.assign({}, a));
            return;
        }*/

        //console.log('selectedInputFields', this.selectedInputFields);
        this.whiteListData = [];
        for(var selectedNode in this.selectedInputFields){
            //console.log("Selected node:", this.selectedInputFields[selectedNode].children);
            /*if (typeof this.selectedInputFields[selectedNode].children != 'undefined'){
             continue;
             }*/
            if (this.selectedInputFields[selectedNode].leaf != true){
                //console.log('not a leaf')
                continue;
            }

            var fullNodeName = this.selectedInputFields[selectedNode].data;
            this.whiteListData.push(fullNodeName);
        }
        this.numSelectedFields = this.whiteListData.length;
        //this.selectedInputFieldsCopy = this.selectedInputFields.map(a => Object.assign({}, a));
        //console.log('WHITE LIST ARRAY:', this.whiteListData);
    }

    onNodeUnselectingContext(event){
        this.whiteListData = [];
        console.log('Selected Files:', this.selectedInputFields);

        for(var selectedNode in this.selectedInputFields){
            //console.log('DATA',this.selectedInputFields[selectedNode].data);
            if (this.selectedInputFields[selectedNode].leaf == true) {
                this.whiteListData.push(this.selectedInputFields[selectedNode].data);
            }
        }
        this.numSelectedFields = this.whiteListData.length;
        //this.selectedInputFieldsCopy = this.selectedInputFields.map(a => Object.assign({}, a));
    }

}



