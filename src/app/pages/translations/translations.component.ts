import {Component, Injectable} from '@angular/core';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {AuthorizationService} from "../../services/authorization.service";
import {GlobalState} from "../../global.state";
import {AddStringModal} from "../../theme/airlock.components/addStringModal/addStringModal.component";
import {StringToTranslate} from "../../model/stringToTranslate";
import {FeatureInFlatList, FeatureUtilsService} from "../../services/featureUtils.service";
import {ShowMessageModal} from "../../theme/airlock.components/showMessageModal/showMessageModal.component";
import {ImportStringsModal} from "../../theme/airlock.components/importStringsModal/importStringsModal.component";
import {ToastrService} from "ngx-toastr";
import { IMultiSelectOption} from 'angular-2-dropdown-multiselect';
import {MarkForTranslationModal,MarkType} from "../../theme/airlock.components/markForTranslationModal/markForTranslationModal.component";
import {EditStringModal} from "../../theme/airlock.components/editStringModal/editStringModal.component";
import { Subject }    from 'rxjs/Subject';
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {Branch} from "../../model/branch";
import {StringsService} from "../../services/strings.service";

@Component({
  selector: 'translations',
  styles: [require('./translations.scss')],
  template: require('./translations.html')
})

export class TranslationsPage {
    public checkModel:any = {left: false, middle: true, right: false};
    possibleUserGroupsList :Array<string> = [];
    dragOperation: boolean = false;
    selectedEditedFeature:Feature;
    valid: boolean = true;
    shouldLoadLocales:boolean = true;
    @ViewChild('addStringModal')
    addStringModal:  AddStringModal;

    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
    @ViewChild('markForTranslationModal')
    markForTranslationModal:  MarkForTranslationModal;
    reloadPageSubject:Subject<any>  = new Subject();
    showConfig: boolean = true;
    editDialogOpen: boolean = false;
    rootId:string = "";
    root: Feature = null;
    showConfiguration: boolean = true;
    groups: Array<Feature> = [];
    products: Array<Product>;
    selectedProduct: Product;
    seasons: Array<Season>;
    selectedSeason: Season;
    loading: boolean = false;
    filterQuery:string = null;
    openFeatures: Array<string> = [];
    stringsToTranslate:Array<StringToTranslate> = [];
    filteredStrings:Array<StringToTranslate> = [];
    supportedLocales: Array<IMultiSelectOption> = [];
    defaultLocales: Array<IMultiSelectOption> = [];
    filteredLocales: Array<string> = [];
    parentFeatureInFlatList: Array<FeatureInFlatList> = [];
    featuresList: Array<any> = [];
    selectedFeatureId:string;
    selectedRowsIDs:string[] = [];
    @ViewChild('showMessageModal')
    showMessageModal: ShowMessageModal;
    @ViewChild('importStringsModal')
    importStringsModal: ImportStringsModal;
    currentLayout:string = "master-detail";
    translations: StringToTranslate[];
    constructor(private _spinner:TransparentSpinner, private _airlockService:AirlockService,
                private authorizationService:AuthorizationService, private _appState: GlobalState,
                private _featureUtils:FeatureUtilsService, private _toastrService: ToastrService, private _stringsSrevice: StringsService) {
        this.loading = true;
    }
    isShowAddString(){
        return !this._airlockService.isViewer()  || this._airlockService.isUserHasStringTranslateRole();
    }

    isViewer():boolean {
        return this._airlockService.isViewer() && !this._airlockService.isUserHasStringTranslateRole();
    }

    setTranslationsLayout(str:string) {
        this.currentLayout = 'loading';
        this.loading = true;
        this.selectedRowsIDs = [];
        setTimeout(() => {
            this.currentLayout = str;
            this._appState.notifyDataChanged('translations.currentLayout', this.currentLayout);
            this.loading = false;
        });

    }

    queryChanged(query:string) {
        this.filterQuery = query;
        this.filterStrings();
        this.reloadPageSubject.next('query');
    }

    filterStrings() {
        if (!this.filterQuery || this.filterQuery.replace(/\s/g, '')=="") {
            this.filteredStrings = this.stringsToTranslate;
        } else {
            console.log(this.filteredStrings);
            this.filteredStrings = this.stringsToTranslate;
            let query = this.filterQuery;
            this.filteredStrings = _.filter(this.filteredStrings,function(o){
                return (o.key.toLowerCase().indexOf(query.toLowerCase()) > -1 || o.value.toLowerCase().indexOf(query.toLowerCase()) > -1);
            });

        }
    }

    localesFiltered(locales:Array<string>) {
        this.filteredLocales = locales;
        this.shouldLoadLocales = false;
        this.reloadPageSubject.next('locale');

    }

    featureSelected(featureID: string) {
        if (!featureID || featureID=="1") {
            this.selectedFeatureId = "";
        } else {
            this.selectedFeatureId = featureID;
        }
        this.changeToFeature();
        this.reloadPageSubject.next('feature');
    }
    reloadTranslations(event:any){
        this.changeToFeature();
    }

    selectedRowsChanged(event:string[]) {
        this.selectedRowsIDs = event;
    }

    isSeasonSupportsTranslation(){
            if (this.selectedSeason){
                if (Number(this.selectedSeason.serverVersion) < 2.5)
                    return false;
                else
                    return true;
            }
        return false;
    }
    changeToFeature(){
        if(!this.isSeasonSupportsTranslation()){
            return;
        }
        this.loading = true;
        if (!this.selectedFeatureId || this.selectedFeatureId == "") {
            this.loadStrings(this.selectedSeason);
            return;
        }

        this._airlockService.getStringsForFeature(this.selectedFeatureId).then(resp =>{
            var arrOfIds:string[] = [];
            if (resp) {
                for(let val of resp.stringsInUseByConfiguration){
                    arrOfIds.push(val.id)
                }
                for(let val of resp.stringsInUseByUtilities){
                    arrOfIds.push(val.id)
                }
            }
            if(arrOfIds.length >0){
                this._airlockService.getStringsToTranslationForStringIds(this.selectedSeason.uniqueId,arrOfIds,null,true).then(
                    resp => {
                        console.log('got translation');
                        console.log(resp);
                        this.stringsToTranslate = resp;
                        if(this.shouldLoadLocales) {
                            this.supportedLocales = [];
                            this.filteredLocales = [];
                            if (this.stringsToTranslate != null && this.stringsToTranslate.length > 0) {
                                let firstStr: StringToTranslate = this.stringsToTranslate[0];
                                if (firstStr.translations.length > 0) {

                                    for (var i = 0; i < firstStr.translations.length; ++i) {
                                        this.filteredLocales.push(firstStr.translations[i].locale);
                                    }
                                    this.supportedLocales = this.filteredLocales.map(function (locale) {
                                        return {
                                            id: locale,
                                            name: locale
                                        }
                                    });
                                    this.setDefaultLocales();
                                }
                            }
                        }
                        this.filterStrings();

                        this.loading = false;
                        this.valid = true;
                    }).catch(
                    error => {
                        this.handleError(error);
                        console.log(error);
                        this.loading = false;
                        this.valid = false;
                    }
                );
            }else{
                this.stringsToTranslate=[];
                this.filterStrings();
                this.loading=false;
            }

        }).catch(
            error => {
                console.log(error);
                this.handleError(error);
                this.loading = false;
                this.valid = false;
            }
        );
    }
    showAddString(){
        this.addStringModal.open();
    }

    markForTranslation(){
        var newStrings:StringToTranslate[] = [];
        let isEditor:boolean = this._airlockService.isEditor();
        let canMarkForProduction:boolean = this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole();
        for(let curString of this.filteredStrings){
            if(curString.status == "NEW_STRING"){
                if((isEditor &&  curString.stage == 'DEVELOPMENT') || canMarkForProduction) {
                    newStrings.push(curString);
                }
            }
        }
        console.log(newStrings);
        this.markForTranslationModal.open(newStrings,this.selectedSeason,MarkType.MARK,this.selectedRowsIDs);
    }
    sendForTranslation(){
        var newStrings:StringToTranslate[] = [];
        for(let curString of this.filteredStrings){
            if(curString.status == "REVIEWED_FOR_TRANSLATION"){
                newStrings.push(curString);
            }
        }
        console.log(newStrings);
        this.markForTranslationModal.open(newStrings,this.selectedSeason,MarkType.SEND,this.selectedRowsIDs);
    }
    reviewForTranslation(){
        var newStrings:StringToTranslate[] = [];
        for(let curString of this.filteredStrings){
            if(curString.status == "READY_FOR_TRANSLATION"){
                newStrings.push(curString);
            }
        }
        console.log(newStrings);
        this.markForTranslationModal.open(newStrings,this.selectedSeason,MarkType.REVIEW,this.selectedRowsIDs);
    }

    copyStrings(){
        var newStrings:StringToTranslate[] = [];
        for(let curString of this.filteredStrings){
                newStrings.push(curString);
        }
        console.log(newStrings);
        this.markForTranslationModal.open(newStrings,this.selectedSeason,MarkType.COPY,this.selectedRowsIDs);
    }

    exportStrings(){
        var newStrings:StringToTranslate[] = [];
        for(let curString of this.filteredStrings){
            newStrings.push(curString);
        }
        console.log(newStrings);
        this.markForTranslationModal.open(newStrings,this.selectedSeason,MarkType.EXPORT,this.selectedRowsIDs);
    }

    pasteStrings(){
       this._airlockService.getCopiedStrings();
       this.importStringsModal.open(true,this.selectedSeason.uniqueId);
    }

    importStrings(){
       this.importStringsModal.open(false,this.selectedSeason.uniqueId);
    }
    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }
    getDefaultBranch(seasonId:string):Branch {
        var master:Branch = {uniqueId:"MASTER",
            name:"Master",
            seasonId:seasonId,
            creator:"",
            lastModified: 0,
            description: "",
            creationDate: 0};
        return master;
    }

    getFeatures(){
        if(this.selectedSeason == null){
            return;
        }
        this.loading = true;
        let master = this.getDefaultBranch(this.selectedSeason.uniqueId);
        this._airlockService.getFeatures(this.selectedSeason, master).then(resp =>{
            console.log('getFeatures');
            // console.log(resp);
            this.groups = resp.features as Feature[];
            this.rootId=resp.uniqueId;
            this.root = resp;
            this.parentFeatureInFlatList = this._featureUtils.getPossibleParentsInFlatList(this.groups,this.rootId, false);
            // console.log("this.parentFeatureInFlatList" );
            // console.log(this.parentFeatureInFlatList );
            var parentFiltered = this.parentFeatureInFlatList.filter(function(value){
                return value.feature && value.feature.type=='FEATURE';
            });
            this.featuresList = parentFiltered.map(function(featInFlat) {
                return {
                    id:featInFlat.feature.name=="ROOT"? "1" : featInFlat.feature.uniqueId,
                    text:featInFlat.feature.name=="ROOT"? "All" : featInFlat.feature.name
                };
            });
            this.loading = false;
            // this.valid = true;
        }).catch(
            error => {
                this.handleError(error);
                console.log(error);
                this.loading = false;
                this.valid = false;
            }
        );
    }
    setDefaultLocales(){
        var tempdefaultLocales = [];
        var filetred = []
        for(let locale of this.supportedLocales){
            // if((locale.name == 'de')|| (locale.name == 'es') || (locale.name == 'fr') || (locale.name == 'fr_CA')|| (locale.name == 'ja') || (locale.name == 'pt_BR') || (locale.name == 'zh_CN') || (locale.name == 'zh_Hans') || (locale.name == 'zh_Hant') || (locale.name == 'zh_TW')){
            if((locale.name == 'de')|| (locale.name == 'es') || (locale.name == 'fr') || (locale.name == 'ja') ||  (locale.name == 'zh_CN')){
                tempdefaultLocales.push(locale);
                filetred.push(locale.id);
            }
        }
        this.defaultLocales = tempdefaultLocales;
        this.filteredLocales = filetred;
    }
    loadStrings(currentSeason: Season){
        if(currentSeason == null){
            return;
        }
        if(this._airlockService.cantViewSelectedPage()){
            this.loading = false;
            this.valid = false;
            this._airlockService.redirectToFeaturesPage();
            return;
        }
        this._airlockService.getStringsToTranslationForStringIds(currentSeason.uniqueId,null,null,true).then(resp =>{
            // console.log('getStringsToTranslationForStringIds');
            // console.log(resp);
            this.stringsToTranslate = resp;
            if(this.shouldLoadLocales) {

                this.supportedLocales = [];
                this.filteredLocales = [];
                if (this.stringsToTranslate != null && this.stringsToTranslate.length > 0) {
                    let firstStr: StringToTranslate = this.stringsToTranslate[0];
                    if (firstStr.translations.length > 0) {
                        for (var i = 0; i < firstStr.translations.length; ++i) {
                            this.filteredLocales.push(firstStr.translations[i].locale);
                        }
                        this.supportedLocales = this.filteredLocales.map(function (locale) {
                            return {
                                id: locale,
                                name: locale
                            }
                        });
                        console.log(this.supportedLocales);

                        // this.filteredLocales = ['ar'];
                        this.setDefaultLocales();
                        // console.log("SUPPORTED LOCALES:"+this.supportedLocales)
                    }
                }
            }
            this.filterStrings();
            this.loading = false;
            this.valid = true;
        }).catch(
            error => {
                console.log("ERROR IN getStringsToTranslationForStringIds");
                this.handleError(error);
                this.clearFields();
            }
        );
    }

    clearFields(){
        this.loading = false;
        this.valid = false;
        this.supportedLocales = [];
        this.filteredLocales = [];
        this.filteredStrings = [];
        this.stringsToTranslate = [];
    }
    handleError(error: any) {
        this.loading = false;
        if(error == null){
            return;
        }
        
        var errorMessage = this._airlockService.parseErrorMessage(error,"");
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
            try{
                if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                    errorMessage = errorMessage.substring(1,errorMessage.length -1);
                }
            }catch(e){
                errorMessage = "Request failed, try again later.";
            }

        }


        return errorMessage;
    }

    create(message:string) {
        this._toastrService.error(message, "Error",  {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    initData(currentSeason: Season) {
        this._airlockService.getProducts().then(response  => {
            console.log("got products");
            // console.log(response);
            this.products = response;
            // console.log(this.products[0]);
            this.selectedProduct = this.getCurrentProductFromSeason(this.products,currentSeason)//this.products[0];
            if (this.selectedProduct) {
                console.log("this is the selected product!!!!:  "+this.selectedProduct.name);
                this.seasons = this.selectedProduct.seasons;
                if(currentSeason){
                    this.selectedSeason=this.getCurrentSeasonFromSeason(this.seasons,currentSeason)//this.seasons[this.seasons.length -1];
                }
            } else {
                this.seasons = null;
                this.selectedSeason = null;
            }
            this._appState.notifyDataChanged('features.currentSeason', this.selectedSeason);
            if(this._airlockService.cantViewSelectedPage()){
                this.loading = false;
                this.valid = false;
                this._airlockService.redirectToFeaturesPage();
                return;
            }
            if (this.selectedSeason) {
                console.log('getting season');
                if(!this.isSeasonSupportsTranslation()){
                    this.clearFields();
                    this.create(this._stringsSrevice.getString("translation_season_not_support"));
                    
                    return;
                }else{
                    this.loadStrings(this.selectedSeason);
                    this.getFeatures();
                }

            } else {
                this.loading = false;
                this.valid = false;
            }
        });
    }
    onAddString(){
        this.changeToFeature();
        // this._airlockService.getStringsToTranslationForSeason(this.selectedSeason.uniqueId).then(resp =>{
        //     console.log('got season');
        //     console.log(resp);
        //     this.stringsToTranslate = resp;
        //     this.filterStrings();
        //     this.loading = false;
        //     this.valid = true;
        // }).catch(
        //     error => {
        //         this.handleError(error);
        //         this.loading = false;
        //         this.valid = false;
        //     }
        // );
    }
    getCurrentProductFromSeason(products:Product[], currentSeason:Season): Product {
        if (currentSeason) {
            console.log("trying to find products! - products:");
            // console.log(products);
            console.log("season's productID:"+currentSeason.productId)
            if (products.length > 0) {
                console.log("products.length > 0!");
                for (let p of products) {
                    let currProd:Product = p;
                    console.log(currProd.uniqueId);
                    console.log(currentSeason.productId);
                    if (currProd.uniqueId == currentSeason.productId) {
                        console.log("yay");
                        return currProd;
                    } else {
                        console.log("nah");
                    }
                }
            }
        }
        if (products.length > 0) {
            console.log("return first product");
            return products[0];
        } else {
            console.log("return null from getCurrentProductFromSeason");
            return null;
        }
    }
    getCurrentSeasonFromSeason(seasons: Season[], currentSeason: Season) : Season {
        if (currentSeason) {
            for (let s of seasons) {
                let currSeas:Season = s;
                if (currSeas.uniqueId == currentSeason.uniqueId) {
                    return currSeas;
                }
            }
        }
        if (seasons.length > 0) {
            return seasons[seasons.length-1];
        } else {
            return null;
        }
    }
    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason','translations');
    }
    ngOnInit() {
        let currSeason = this._appState.getData('features.currentSeason');
        console.log("got saved season!!!");
        // console.log(currSeason);
        this.initData(currSeason);
        let currLayout = this._appState.getData('translations.currentLayout');
        if (currLayout && currLayout.length > 0) {
            this.currentLayout = currLayout;
        }
        this._appState.subscribe('features.currentSeason','translations',(season) => {
            console.log("TRANSLATION SUBSCRIBE CALLBACK");
            if (this.products) {
                let oldProductID = this.selectedProduct.uniqueId;
                this.selectedProduct = this.getCurrentProductFromSeason(this.products,season);
                if (this.selectedProduct.uniqueId != oldProductID) {
                    this.shouldLoadLocales = true;
                }
            }

            this.onSeasonSelection(season);
        });
    }

    debugFunc() {
        console.log("hello debugFunc");
        alert(this.selectedProduct.name);
        this.onProductSelection(this.products[this.products.length-1]);
    }

    canUserMarkForTranslation(){
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isEditor()  || this._airlockService.isUserHasStringTranslateRole())
    }
    canUserSendForTranslation(){
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator()  || this._airlockService.isUserHasStringTranslateRole())
    }
    canUserReviewForTranslation(){
        return (this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }
    canUserCopyStrings(){
        return (this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }
    canUserExportStrings(){
        return this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator()  || this._airlockService.isUserHasStringTranslateRole();
    }
    canUserPasteStrings(){
        return (this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }
    isShowPaste(){
        if(this._airlockService.getCopiedStrings() == null){
            return false;
        }
        return true;
    }

    canUserImportStrings(){
        return (this._airlockService.isEditor() || this._airlockService.isProductLead() || this._airlockService.isAdministrator() || this._airlockService.isUserHasStringTranslateRole())
    }
    featureChangedStatus(featureID:string) {
        console.log("feature changed status:"+featureID);
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            this.openFeatures.splice(index, 1);
        } else {
            this.openFeatures.push(featureID);
        }
    }

    isCellOpen(featureID:string): boolean {
        // console.log("isCellOpen:"+featureID);
        var index = this.openFeatures.indexOf(featureID, 0);
        if (index > -1) {
            // console.log("YES");
            return true;
        } else {
            // console.log("NO");
            return false;
        }
    }

    setShowConfig(show:boolean) {
        this.showConfig = show;
    }
    setSelectedSeason(season:Season) {
        this.selectedSeason = season;
        this._appState.notifyDataChanged('features.currentSeason', this.selectedSeason);
    }
    public onProductSelection(prod:Product){
        this.selectedProduct = prod;
        console.log("product selected: "+prod.name);
        this.seasons = this.selectedProduct.seasons;
        this.setSelectedSeason(this.seasons[this.seasons.length-1]);
        if (this.selectedSeason && this.isSeasonSupportsTranslation()) {
            this.loading = true;
            this.loadStrings(this.selectedSeason);
            this.getFeatures();
        } else {
            this.create(this._stringsSrevice.getString("translation_season_not_support"));
            this.clearFields();
            // this.valid = false;
            // this.groups = [];
        }
        this.reloadPageSubject.next('product');
    }

    public onSeasonSelection(season:Season){
        this.setSelectedSeason(season);
        if(this.isSeasonSupportsTranslation()) {
            this.loading = true;
            this.loadStrings(this.selectedSeason);
            this.getFeatures();
        }else{
            this.create(this._stringsSrevice.getString("translation_season_not_support"));
            this.clearFields();
            // this.valid = false;
            // this.groups = [];
        }
        this.reloadPageSubject.next('season');
    }

    getTranslation(stringId:string,locale:string){
        var message:string = "";
        if(this.translations.length  >0) {
            for (let item of this.translations[0].translations) {

                message += item.translation + "\n"
            }
        }
        // this.getTranslationForString(stringId,[locale]);

}
    getTranslationForString(stringId:string,locale:Array<string>=null){
        /*
         {
         "translationSummary": [
         {
         "translations": [
         {
         "translation": "صافي",
         "locale": "ar",
         "translationStatus": "TRANSLATED"
         }
         ],
         "value": "CLEAR",
         "uniqueId": "cd7738c6-c556-4fb7-bfd5-3818c7aa6c93",
         "key": "HeadsUp.Clear",
         "status": "TRANSLATION_COMPLETE"
         }
         ]
         }
         */
        this._airlockService.getStringsToTranslationForStringIds(this.selectedSeason.uniqueId,[stringId],locale,true).then(resp =>
        {
            // console.log(resp);

                this.translations = resp;
                var message:string = "";
                if(this.translations.length  >0) {
                    for (let item of this.translations[0].translations) {

                        message += item.translation + "\n"
                    }
                }
                this.showMessageModal.open("Translation", message);

        }).catch(
            error => {
                this.handleError(error);
                this.loading = false;
                this.valid = false;
            }
        );
    }
    public refreshTable() {
        console.log("refresh table");
        // console.log(this.openFeatures);
        this.loading = true;
        this.loadStrings(this.selectedSeason);
        this.getFeatures();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }



}

