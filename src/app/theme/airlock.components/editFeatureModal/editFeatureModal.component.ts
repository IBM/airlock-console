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
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {Season} from "../../../model/season";
import * as $$ from "jquery";
import "select2";
import {FeatureUtilsService, FeatureInFlatList} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {AceModal} from "../aceModal/aceModal.component";
import {TabsetConfig} from "ng2-bootstrap";
import {FeatureCell} from "../featureCell/featureCell.component";
import {ConfigurationCell} from "../configurationCell/configurationCell.component";
import {ToastrService} from "ngx-toastr";
import {VerifyActionModal, VeryfyDialogType} from "../verifyActionModal/verifyActionModal.component";
import {min} from "rxjs/operator/min";
import {Branch} from "../../../model/branch";
import {OrderCell} from "../orderCell/orderCell.component";
import {InAppPurchase} from "../../../model/inAppPurchase";
import {Product} from "../../../model/product";
import {Rule} from "../../../model/rule";
import {AceExpandDialogType} from "../../../app.module";


@Component({
    selector: 'edit-feature-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService, TabsetConfig],
    styles: [require('./editFeatureModal.scss'),require('select2/dist/css/select2.css')],

    template: require('./editFeatureModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class EditFeatureModal{
    @ViewChild('editModal')
    modal: ModalComponent;

    @ViewChild('paceModalContainerDialog') aceModalContainerDialog : AceModal;
    loading: boolean = false;
    parentFeatureInFlatList: Array<FeatureInFlatList> = [];
    selectedParent:FeatureInFlatList;
    @Input() season:Season;
    @Input() staticMode:boolean = false;
    @Input() feature: Feature;
    @Input() branch: Branch;
    @Input() rootFeatuteGroups : Array<Feature>;
    @Input() root: Feature;
    @Output() onEditFeature= new EventEmitter<any>();
    @Output() onShowFeature= new EventEmitter<any>();
    @Output() outputEventWhiteListUpdate : EventEmitter<any> = new EventEmitter();
    @Input() rootId: string;
    @Input() verifyActionModal: VerifyActionModal;
    @Input()
    possibleGroupsList :Array<any> = [];
    selectedSubFeatureToAdd:Feature = null;
    featurePath: Array<Feature> = [];
    private elementRef:ElementRef;
    creationDate:Date;
    loaded = false;
    isOpen:boolean = false;
    private generalTabActive:boolean = true;
    private configTabActive:boolean = false;
    private ruleTabActive:boolean = false;
    private hirarchyTabActive:boolean = false;
    private premiumTabActive:boolean = false;
    private isShowHirarchy:boolean = false;
    private curExpandedIndex:number = 0;
    lastModificationDate:Date;
    featureCell:FeatureCell = null;
    configurationCell:ConfigurationCell = null;
    configurationSchemaString: string;
    defaultConfigurationString : string;
    outputConfigurationString :string;
    referenceSchemaString: string;
    referenceOpen: boolean = false;
    originalFeature:Feature = null;
    sourceFeature:Feature = null;
    title: string;
    isOnlyDisplayMode:boolean = false;
    allowChangeParent:boolean = false;
    ruleInputSchemaSample: string;
    ruleUtilitiesInfo:string;
    aceEditorRuleHeight: string = "250px";
    aceEditorConfigurationHeight: string = "136px";
    aceEditorConfigurationHeightForOrder: string = "48px";
    orderRules:Array<any> = [];
    possibleSubFeaturesToAdd:Array<Feature> = [];
    orderCell:OrderCell = null;
    inAppPurchases: InAppPurchase[] = [];
    selectedPurchase: InAppPurchase;
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

        this.feature = null;
        this.configurationCell=null;
        this.orderCell=null;
        this.featureCell=null;
        this.generalTabActive = true;
        this.configTabActive = false;
        this.ruleTabActive = false;
        this.hirarchyTabActive = false;
        this.premiumTabActive = false;
        this.isShowHirarchy  = false;
        this.orderRules = [];
        this.possibleSubFeaturesToAdd = [];
        this.selectedSubFeatureToAdd = null;
        this.selectedPurchase = null;
        this.removeAll();
    }

    isConfigMode() {
        return (this.feature && this.feature.type=="CONFIGURATION_RULE")
    }

    isValid(){
        if(this.feature.name  == null || this.feature.name.length == 0){
            return "name and namespace are required";
        }
        if(this.feature.namespace  == null || this.feature.namespace.length == 0){
            return "name and namespace are required";
        }
        if(this.feature.minAppVersion) {
            this.feature.minAppVersion = this.feature.minAppVersion.trim();
        }
        if(this.feature.stage=="PRODUCTION" && !this.feature.minAppVersion) {
            return "Cannot remove minimum app version in production"
        }

        try{
            // var minFeature = Number(this.feature.minAppVersion);
            // var maxSeason = Number(this.season.maxVersion);
            // if(maxSeason != null && minFeature != null){
            //     if(maxSeason != 0 && maxSeason < minFeature){
            //         return this.getString("edit_feature_error_min_feature_bigger_max_version");
            //     }
            // }
            if (this._isMinVersionGreaterThanMaxSeason()) {
                return this.getString("edit_feature_error_min_feature_bigger_max_version");
            }
        }catch(e){
            console.log("ERROR:"+e);
        }
        return "";
    }

    _isMinVersionGreaterThanMaxSeason():boolean {
        if (!this.season.maxVersion || this.season.maxVersion=="" || this.season.maxVersion=="0" ||
            !this.feature.minAppVersion || this.feature.minAppVersion=="") {
            return false;
        }
        var minAppArr = this.feature.minAppVersion.split('.');
        var maxSeasonArr = this.season.maxVersion.split('.');
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
    getTypeAsString():string{
        if(this.isOrderRule()){
            return "ordering rule" ;
        }else {
            if(this.isConfigMode()){
                return "configuration" ;
            }else {
                return "feature" ;
            }
        }
    }
    save() {
        var validError:string = this.isValid();
        if(validError.length == 0) {
            if (this.feature.stage=='DEVELOPMENT' && (this.feature.internalUserGroups==null || this.feature.internalUserGroups.length <=0) && !this.staticMode) {
                let message = 'This '+this.getTypeAsString()+' will not be visible to users because no user groups are specified. Are you sure want to continue?';
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
                if(this.feature.stage == 'PRODUCTION'){
                    this.sub = this.verifyActionModal.actionApproved$.subscribe(
                        astronaut => {

                            this._save();

                        });
                    console.log("open verifyActionModal");
                    if(this.isOrderRule()){
                        this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_ordering_rule"), this.feature, VeryfyDialogType.ORDERING_RULE_TYPE);
                    }else {
                        if(this.isConfigMode()){
                            this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_configuration"), this.feature, VeryfyDialogType.CONFIGURATION_TYPE);
                        }else {
                            this.verifyActionModal.open(this._stringsSrevice.getString("edit_change_production_feature"), this.feature, VeryfyDialogType.FEATURE_TYPE);
                        }
                    }
                }else {
                    this._save();
                }
            }
        }else{
            this.create(validError);
        }
    }
    deleteOrderRule(id:string){
        this.orderRules = this.orderRules.filter( x => x.id != id);
        // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
        this.updatemapSubFeaturesIdsToOrderIndex();
    }
    private mapSubFeaturesIdsToOrderIndex:any = {};
    private isShowSubFeatures:any = {};

    updatemapSubFeaturesIdsToOrderIndex(){
        let mapIdsToNames ={};
        let showIds ={};
        for (var i=0;i < this.sourceFeature.features.length;++i){
            mapIdsToNames[this.sourceFeature.features[i].uniqueId] = -1;
            showIds[this.sourceFeature.features[i].uniqueId] = false;
        }
        for (var i=0;i < this.orderRules.length;++i){
            mapIdsToNames[this.orderRules[i]["id"]] = i;
            showIds[this.orderRules[i]["id"]] = true;
        }
        this.isShowSubFeatures = showIds;

        this.mapSubFeaturesIdsToOrderIndex = mapIdsToNames;
    }
    getFilterExisitngSubFeature(){
        console.log("getFilterExisitngSubFeature");
        let mapIdsToNames ={};
        for (var i=0;i < this.orderRules.length;++i){
            mapIdsToNames[this.orderRules[i]["id"]] = true;
        }
        console.log(mapIdsToNames);
        return this.sourceFeature.features.filter( x => {
            console.log(x.uniqueId);
            return (mapIdsToNames[x.uniqueId] == null)
        });
    }
    getOrderRulesAsJsonObjedct():string{
        var retObj = {};
        console.log("getOrderRulesAsJsonObjedct");
        console.log(this.orderRules);
        for(var i =0; i < this.orderRules.length;++i){
            let item:any = this.orderRules[i];
            let id:string = item.id;
            let value = item.value;
            // retObj[id] = "@" + value.replace(/"/g, '#') + "@";
            retObj[id] = value;
            console.log(retObj[id]);
        }
        console.log("retObj");
        console.log(retObj);
        // return this.stringify(retObj).replace(new RegExp("\"@", 'g'),"").replace(new RegExp("@\"", 'g'),"").replace(/\\#/g, '\"').replace(/#/g, '"');
        return this.stringify(retObj);

    }
    isOrderRulesValid():boolean{

        for(var i =0; i < this.orderRules.length;++i){
            let item:any = this.orderRules[i];
            let id:string = item.id;
            let value = item.value;
            if(value == null || value.length == 0){
                return false;
            }
        }
        return true;
    }
    _save() {
        this.loading = true;
        if (!this.isOnlyDisplayMode) {
            this.feature.additionalInfo = {};
            if (!this.feature.internalUserGroups) {
                this.feature.internalUserGroups = [];
            }
        }

        if(this.isConfigurationRule()){
            if (this.feature.configuration) {
                try {
                    this.feature.configuration = this.outputConfigurationString;
                }catch(e){
                    console.log(e);
                    e._body = "Invalid json of configuration ";
                    this.handleError(e);
                    return;
                }

            }


        }else{
            if(this.isOrderRule()){
                if (this.feature.configuration) {
                    try {
                        if(!this.isOrderRulesValid()){
                            this.loading = false;
                            this.create(this.getString("edit_feature_empty_ordering_rule_value_error"));
                            return;
                        }else {
                            this.feature.configuration = this.getOrderRulesAsJsonObjedct();
                            console.log(this.feature.configuration);
                        }
                    }catch(e){
                        console.log(e);
                        e._body = "Invalid json of configuration ";
                        this.handleError(e);
                        return;
                    }

                }


            }else {
                try {
                    if (!this.isOnlyDisplayMode) {
                        if (this.defaultConfigurationString == "{}" || this.defaultConfigurationString == "" || this.defaultConfigurationString == "{\n\t\n}") {
                            this.feature.defaultConfiguration = null;
                        } else {
                            this.feature.defaultConfiguration = this.defaultConfigurationString;
                        }
                    }

                } catch (e) {
                    console.log(e);
                    e._body = "Invalid json of default configuration ";
                    this.handleError(e);
                    return;
                }

                try {
                    if (!this.isOnlyDisplayMode) {
                        if (this.configurationSchemaString == "{}" || this.configurationSchemaString == "" || this.configurationSchemaString == "{\n\t\n}") {
                            this.feature.configurationSchema = null;
                        } else {
                            this.feature.configurationSchema = JSON.parse(this.configurationSchemaString);
                        }
                    }

                } catch (e) {
                    console.log(e);
                    e._body = "Invalid json of configuration schema";
                    this.handleError(e);
                    return;
                }
            }
        }
        var featureToUpdate: Feature = this.feature;

        if (this.selectedParent == null || this.selectedParent.feature.uniqueId == null) {
            this.feature.parent = null;
        } else {
            var curFeatureInFlatList: FeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList, this.feature.uniqueId);
            if ((curFeatureInFlatList.parent == null && this.selectedParent.feature != null &&  this.selectedParent.feature.uniqueId != this.rootId) || (curFeatureInFlatList.parent != null && curFeatureInFlatList.parent.uniqueId != this.selectedParent.feature.uniqueId)) {
                featureToUpdate = this.selectedParent.feature;
                var newSonFeature = this.feature;
                if (!this.isOnlyDisplayMode) {
                    newSonFeature.rolloutPercentage = Number(newSonFeature.rolloutPercentage);
                } else {
                    newSonFeature = this.originalFeature;
                }
                this._airLockService.getFeature(featureToUpdate.uniqueId, this.branch.uniqueId).then(result => {
                    featureToUpdate = result;
                    if(curFeatureInFlatList.parent != null) {
                        this.removeDuplicateSon(featureToUpdate, curFeatureInFlatList.parent.uniqueId, curFeatureInFlatList.feature.uniqueId);
                    }
                    featureToUpdate.features.push(newSonFeature);
                    this._airLockService.updateFeature(featureToUpdate, this.branch.uniqueId).then(() => {
                        this.loading = false;
                        //reload needed since we moved it in the tree
                        this.onEditFeature.emit(null);
                        this.outputEventWhiteListUpdate.emit(this.season);
                        this.close()
                    }).catch(error => {
                        this.loading = false;
                        this.handleError(error);
                    });
                }).catch(error => {
                    this.loading = false;
                    this.handleError(error);
                });
                return;
            }

        }
        featureToUpdate.rolloutPercentage = Number(featureToUpdate.rolloutPercentage);
        this._airLockService.updateFeature(featureToUpdate, this.branch.uniqueId).then(result => {
            this.loading = true;
            if(this.featureCell != null) {
                this.featureCell.updateFeature(result);
            }else{
                if(this.configurationCell != null) {
                    this.configurationCell.updateFeature(result);
                }else{
                    if(this.orderCell != null) {
                        this.loading = false;
                        this.orderCell.updateFeature(result);
                    }else{
                        this.onEditFeature.emit(null);
                    }
                }
            }
            this.outputEventWhiteListUpdate.emit(this.season);
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

    isConfigurationRule(){
        return (this.feature != null && this.feature.type === "CONFIGURATION_RULE");
    }

    isOrderRule(){
        return (this.feature != null && this.feature.type === "ORDERING_RULE");
    }

    getSubFeaturesOrder(){

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
        this.loading=false;
        this.modal.close();
    }
    getMapNameForIdsForSubFeatures(){
        var map = {}
        for(var i =0;i < this.sourceFeature.features.length;++i){
            let subFeature:Feature = this.sourceFeature.features[i];
            let id:string = subFeature.uniqueId;
            map[id] = subFeature.name;
        }
        return map;
    }
    convertConfigurationIntoJson(order:string,mapIds:any){
        var places = [];
        for (let id in mapIds) {
            let place = order.indexOf(id);
            if(place > -1) {
                places.push({"id":id,"place":place});
            }
        }
        places.sort((a,b):number =>{
            return a.place - b.place;
        });
        var retObj = {};
        var i = 0;
        for(; i < places.length;++i){
            let startIndex = order.indexOf(":",places[i].place);
            var endIndex = 0;
            if(i < places.length - 1){
                let endPlace = places[i + 1].place;
                endIndex = order.lastIndexOf(",",endPlace);

            }else{
                endIndex = order.lastIndexOf("}");
            }
            retObj[places[i].id] = order.substr(startIndex + 1,endIndex - startIndex - 1);
        }
        return retObj;
    }
    parseOrderRules(order:string):Array<any>{
        try {
            let mapIdsToNames = this.getMapNameForIdsForSubFeatures();
            var arr:Array<any> = [];
            // var orderOutputJson = this.convertConfigurationIntoJson(order,mapIdsToNames);//this.stringify(this.feature.configuration, undefined, 4);
            var orderOutputJson = JSON.parse(order);//this.stringify(this.feature.configuration, undefined, 4);
            for (let id in orderOutputJson) {
                let value = orderOutputJson[id];
                arr.push({"id":id,"name":mapIdsToNames[id],"value":value});
            }
            return arr;
        }catch(e){
            console.log(e);
            return [];
        }
    }
    selectFeatureToAdd(item:Feature){
        this.selectedSubFeatureToAdd = item;
    }
    addNewSubFeatureOrder(selectedSubFeatureToAdd:Feature, group){
        this.orderRules.push({"id":selectedSubFeatureToAdd.uniqueId,"name":selectedSubFeatureToAdd.name,"value":""});
        // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
        // this.selectedSubFeatureToAdd = null;
        this.updatemapSubFeaturesIdsToOrderIndex();
        setTimeout(() => {
            group.isOpen = true;
            this.isShowSubFeatures[selectedSubFeatureToAdd.uniqueId] = true, 0.5});


        // this.selectFeatureToAdd(null)
    }
    open(branch: Branch, feature: Feature, featurePath: Array<Feature>, strInputSchemaSample:string, strUtilitiesInfo:string, featureCell: FeatureCell = null,
         configurationCell:ConfigurationCell = null,showConfiguration:boolean=false, sourceFeature:Feature = null,orderCell:OrderCell = null,
         inAppPurchases: InAppPurchase[] = []) {
        console.log(feature);
        this.originalFeature = feature;
        this.isOpen = true;
        this.loading = false;
        this.branch = branch;
        this.featurePath=featurePath;
        this.inAppPurchases=inAppPurchases;
        this.feature = Feature.clone(feature);
        this.setSelectedPurchaseFromFeature();
        this.title = this.getString("edit_feature_title");
        this.ruleInputSchemaSample = strInputSchemaSample;
        this.ruleUtilitiesInfo = strUtilitiesInfo;
        this.featureCell = featureCell;
        this.configurationCell=configurationCell;
        this.orderCell = orderCell;
        this.sourceFeature = sourceFeature;
        if(this.isConfigurationRule()){
            this.title = this.getString("edit_configuration_title");
            if(!this.feature.configuration || this.feature.configuration == "") {
                this.feature.configuration = "{}";
            }
            try {
                this.outputConfigurationString = this.stringify(JSON.parse(this.feature.configuration));//this.stringify(this.feature.configuration, undefined, 4);
            }catch(e){
                console.log(e);
                this.outputConfigurationString = this.feature.configuration;
            }
            if (this.outputConfigurationString=="{}") {
                this.outputConfigurationString = "{\n\t\n}";
            }else{
                this.outputConfigurationString = this.beautifyString(this.outputConfigurationString);
            }
            var contextSchema = {};
            if(sourceFeature && sourceFeature.configurationSchema) {
               contextSchema = sourceFeature.configurationSchema;
            }
            try {
                this.referenceSchemaString = this.stringify(contextSchema);//JSON.stringify(contextSchema, undefined, 4);
            }catch(e){
                console.log(e);
            }
            if (this.referenceSchemaString=="{}") {
                this.referenceSchemaString = "{\n\t\n}";
            } else {
                this.referenceSchemaString = this.beautifyString(this.referenceSchemaString);
            }
            this.referenceOpen =  false;
        }else{
            if(!this.feature.configurationSchema) {
                this.feature.configurationSchema = {};
            }
            if(!this.feature.defaultConfiguration || this.feature.defaultConfiguration == "") {
                this.feature.defaultConfiguration = "{}";
            }
            try {
                this.configurationSchemaString = this.stringify(this.feature.configurationSchema);//JSON.stringify(this.feature.configurationSchema, undefined, 4);
            }catch(e){
                console.log(e);
            }

            if (this.configurationSchemaString=="{}") {
                this.configurationSchemaString = "{\n\t\n}";
            } else {
                this.configurationSchemaString = this.beautifyString(this.configurationSchemaString);
            }
            try {
                this.defaultConfigurationString = this.stringify(JSON.parse(this.feature.defaultConfiguration));//JSON.stringify(this.feature.defaultConfiguration, undefined, 4);
            }catch(e){
                console.log(e);
                this.defaultConfigurationString = this.feature.defaultConfiguration;
            }

            if (this.defaultConfigurationString=="{}") {
                this.defaultConfigurationString = "{\n\t\n}";
            } else {
                this.defaultConfigurationString = this.beautifyString(this.defaultConfigurationString);
            }
        }
        if(this.isOrderRule()){
            console.log("is order rule");
            console.log(this.feature.configuration);
            console.log("is order rule ddd");
            this.title = this.getString("edit_ordering_rule_title");
            this.orderRules = this.parseOrderRules(this.feature.configuration);
            // this.possibleSubFeaturesToAdd = this.getFilterExisitngSubFeature();
            this.updatemapSubFeaturesIdsToOrderIndex();
            console.log(this.orderRules);
        }
        let canChangeParent = !(this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        let notInBranch = branch.uniqueId.toLowerCase() != "master" && this.feature.branchStatus == "NONE";
        this.isOnlyDisplayMode = (notInBranch || this._airLockService.isViewer() || (this._airLockService.isEditor() && this.feature.stage == "PRODUCTION"));
        this.allowChangeParent = canChangeParent && notInBranch;
        //change dates to better format
        this.creationDate= new Date(this.feature.creationDate);
        this.lastModificationDate = new Date(this.feature.lastModified);
        this.parentFeatureInFlatList = this._featureUtils.getPossibleParentsInFlatList(this.rootFeatuteGroups,this.rootId);

        var curFeatureInFlatList = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList,feature.uniqueId);
        if(curFeatureInFlatList == null){
            this.selectedParent = null;
        }else{
            if(curFeatureInFlatList.parent != null) {
                this.selectedParent = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList,curFeatureInFlatList.parent.uniqueId);
            }else{ //set parent to root
                this.selectedParent = this.parentFeatureInFlatList[0];
            }
        }

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
                    this.feature.rolloutPercentage = $$('.numberInput').val();
                    //$$('.numberInput').mask('000.0000', { reverse: true });
                }
            );
            $$('.js_example').on(
                'change',
                (e) => {
                    if(this.feature != null) {
                        this.feature.internalUserGroups = jQuery(e.target).val();
                    }
                }
            );
            $exampleMulti.val(this.feature.internalUserGroups).trigger("change");
            $$('.numberInput').trigger("change");
        },100);

        console.log("this.sourceFeature");
        console.log(this.sourceFeature);

        if(this.modal != null) {
            this.zone.run(() => {
                this.loaded = true;

                if (showConfiguration) {
                    this.ruleTabActive = false;
                    this.hirarchyTabActive = false;
                    this.generalTabActive = false;
                    this.premiumTabActive = false;
                    this.configTabActive = true;
                } else {
                    this.ruleTabActive = false;
                    this.hirarchyTabActive = false;
                    this.configTabActive = false;
                    this.generalTabActive = true;
                    this.premiumTabActive = false;
                }
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                this.onShowFeature.emit(true);
                this.modal.open('lg');
            });

        }

    }

    setSelectedPurchaseFromFeature() {
        if (this.feature.entitlement && this.feature.entitlement.length > 0) {
            let selected = null;
            if (this.inAppPurchases) {
                var allPurchases = this.getAllPurchasesFlat();
                for (var purchase of allPurchases) {
                    if (purchase.uniqueId == this.feature.entitlement) {
                        this.selectedPurchase = purchase;
                        return;
                    }
                }
                this.selectedPurchase = null;
            }
        } else {
            this.selectedPurchase = null;
        }
    }

    setIsPremium(event) {
        this.feature.premium = event;
        if (this.feature.premium && !this.feature.premiumRule) {
            this.feature.premiumRule = new Rule();
            this.feature.premiumRule.ruleString = "";
        } else {
            // this.feature.entitlement = null;
        }
        if(!this.feature.premium){
            this.selectPurchase(null);
        }
    }
    selectParent(parent:FeatureInFlatList){
        if(parent.feature.uniqueId != this.feature.uniqueId){
            if(!this._featureUtils.isContainCycle(parent.feature,this.feature.features)) {
                this.selectedParent = parent;
            }else{
                alert("Can't set feature parent to the feature which is his son");
            }
        }else{
            alert("Can't set feature parent to the feature itself");
        }

    }
    showHirarchy(){
        this.isShowHirarchy=true;
    }
    selectNewParent(parent:Feature) {
        this.selectedParent = this._featureUtils.getFeatureInFlatListById(this.parentFeatureInFlatList,parent.uniqueId);
    }
    ruleUpdated(event) {
        this.feature.rule.ruleString = event;
    }

    premiumRuleUpdated(event) {
        if (this.feature.premiumRule) {
            this.feature.premiumRule.ruleString = event;
        }
    }

    schemaUpdated(event) {
        this.configurationSchemaString = event;
    }
    orderRuleUpdated(event) {
        console.log("schema updated with event:"+event)
        this.orderRules[this.curExpandedIndex].value = event;
    }
    defaultConfigurationUpdated(event) {
        this.defaultConfigurationString = event;
    }
    outputOrderRuleUpdated(event,index) {
        this.orderRules[index].value = event;
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
    showOrderingRuleHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/ordering-rules');
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
        var expandDialogTitle = this.title + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.feature.rule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_RULE, this.isOnlyDisplayMode);
    }

    openAceEditorPremiumRuleExpand(){
        var expandDialogTitle = this.title + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.feature.premiumRule.ruleString, expandDialogTitle, this.ruleInputSchemaSample, this.ruleUtilitiesInfo, AceExpandDialogType.FEATURE_PREMUIM_RULE, this.isOnlyDisplayMode || !this.feature.premium);
    }

    openAceEditorConfigurationSchemaExpand(){
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.configurationSchemaString, expandDialogTitle, "", "", AceExpandDialogType.CONFIG_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorDefaultConfigurationExpand(){
        var expandDialogTitle = this.getString('edit_feature_configuration_default_configuration_edit_title') + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.defaultConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.DEFAULT_CONFIG, this.isOnlyDisplayMode);
    }

    openAceEditorReferenceSchemaExpand(){
        var expandDialogTitle = this.getString('edit_feature_configuration_configuration_edit_title') + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.referenceSchemaString, expandDialogTitle, "", "", AceExpandDialogType.REFERENCE_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorOrderRuleExpand(index:number){
        ///zzzzzzzzz
        this.curExpandedIndex = index;
        var expandDialogTitle = this.getString('edit_feature_ordering_rule_tab_heading') + " - " + this.orderRules[index].name;
        this.aceModalContainerDialog.showAceModal(this.orderRules[index].value, expandDialogTitle, "", "", AceExpandDialogType.INPUT_SCHEMA, this.isOnlyDisplayMode);
    }

    openAceEditorOutputConfigurationExpand(){
        var expandDialogTitle = this.getString('edit_feature_configuration_tab_heading') + " - " + this.feature.namespace +"."+ this._featureUtils.getFeatureDisplayName(this.feature);
        this.aceModalContainerDialog.showAceModal(this.outputConfigurationString, expandDialogTitle, "", "", AceExpandDialogType.OUTPUT_CONFIG, this.isOnlyDisplayMode);
    }
    openWhiteListEditor(){
        console.log('Open White List');
        //this.whiteListABModalContainerDialog.showWhiteListABModal('aaa', 'bbb');
    }

    selectPurchase(purchase:InAppPurchase){
        this.loading = true;

        this.selectedPurchase = purchase;
        if(purchase != null) {
            this.feature.entitlement = purchase.uniqueId;
        }else {
            this.feature.entitlement = "";
        }
        this.loading = false;
    }

    addPurchasesToList(entitlements: InAppPurchase[], flatList:any[],level:number=0){
        if (entitlements) {
            var space = "";
            for(var i =0;i < level;i++){
                space += "&nbsp; &nbsp;";
            }
            var nextLevel = level;
            for (var purchase of entitlements) {
                nextLevel = level;
                if(this.selectedPurchase == null || purchase.uniqueId!=this.selectedPurchase.uniqueId) {
                    if(purchase.type !== 'ENTITLEMENT_MUTUAL_EXCLUSION_GROUP') {
                        var textOfPurchase = space + this.getPurchaseDisplayName(purchase);
                        let productObj = {
                            id: purchase,
                            text: textOfPurchase
                        };
                        flatList.push(productObj);
                    }
                    nextLevel = level + 1;
                }
                this.addPurchasesToList(purchase.entitlements, flatList,nextLevel);
            }
        }
    }
    getAllPurchasesFlat():InAppPurchase[]{
        var toRet:InAppPurchase[] = [];
        this.getAllPurchases(this.inAppPurchases, toRet);
        return toRet;
    }
    getAllPurchases(entitlements: InAppPurchase[], retList: InAppPurchase[]){
        if (entitlements) {
            for (var purchase of entitlements) {
                retList.push(purchase);
                this.getAllPurchases(purchase.entitlements, retList);
            }
        }
    }

    getPurchasesForSelect():any[] {
        var toRet = [];
        if (this.selectedPurchase) {
            let selected = {id:this.selectedPurchase, text:this.getPurchaseDisplayName(this.selectedPurchase)};
            toRet.push(selected);
        }
        this.addPurchasesToList(this.inAppPurchases, toRet,0);
        // if (this.inAppPurchases) {
        //     for (var purchase of this.inAppPurchases) {
        //         if(this.selectedPurchase == null || purchase.uniqueId!=this.selectedPurchase.uniqueId) {
        //             let productObj = {id:purchase,
        //                 text:this.getPurchaseDisplayName(purchase)};
        //             toRet.push(productObj);
        //         }
        //     }
        // }
        return toRet;
    }

    getPurchaseDisplayName(purchase: InAppPurchase) {
        return this._featureUtils.getFeatureDisplayNameInTree(purchase);
    }
    selectPurchaseFromSelect(purchaseObj:any) {
        if (purchaseObj) {
            if (purchaseObj.id && purchaseObj.id != this.selectedPurchase) {
                this.selectPurchase(purchaseObj.id);
            }
        }
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


}



