import { Injectable } from '@angular/core';
import { ResponseContentType, RequestOptions, Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { Product } from '../model/product';
import { Season } from '../model/season';
import { Feature } from '../model/feature';
import { UserGroups } from '../model/user-groups';
import {Subject} from "rxjs";
import {AuthorizationService} from "./authorization.service";
import {Analytic, FeatureAnalyticAttributes} from "../model/analytic";
//import {FeatureAttributes} from "../model/feature-attributes";
import {AnalyticsDisplay} from "../model/analyticsDisplay";
import {StringToTranslate} from "../model/stringToTranslate";
import {AnalyticsQuota, AnalyticsExperimentQuota} from "../model/analyticsQuota";
import {Experiment} from "../model/experiment";
import {Variant} from "../model/variant";
import {Branch, AvailableBranches} from "../model/branch";
import {ExperimentsContainer} from "../model/experimentsContainer";
import {AnalyticsExperiment} from "../model/analyticsExperiment";
import {Stream} from "../model/stream";
import {AirlockNotification} from "../model/airlockNotification"
import {AirlockNotifications} from "../model/airlockNotifications"
import {IndexingInfo} from "../model/indexingInfo";
import {Utility} from "../model/utility";
import {BaMenuService} from "../theme/services/baMenu/baMenu.service";
import saveAs from 'save-as';
import {Router} from '@angular/router';
import {User} from "../model/user";
import {Role} from "../model/role";
import {Webhook} from "../model/webhook";
import {InAppPurchase} from "../model/inAppPurchase";
import {PurchaseOptions} from "../model/purchaseOptions";
@Injectable()
export class AirlockService {

    //arrange notifications
    private _data = new Subject<Object>();
    private _dataStream$ = this._data.asObservable();

    private _subscriptions:Map<string, Array<Function>> = new Map<string, Array<Function>>();
    ////////////////////////

    private airlockBaseApiUrl = process.env.AIRLOCK_API_URL;
    private airlockVersion = process.env.VERSION;
    private auth = process.env.AIRLOCK_API_AUTH;
    private staticModeFlag = process.env.AIRLOCK_STATIC_FEATURE_MODE;
    private analytics_url = process.env.AIRLOCK_ANALYTICS_URL;
    // private airlockBaseApiUrl = 'http://9.148.49.163:8080/airlock/api/admin';
    // private airlockBaseApiUrl = 'http://9.148.54.98:7070/airlock/api/admin'; // console dev
    // private airlockBaseApiUrl = 'http://9.148.54.98:2020/airlock/api/admin'; // rotem/vicky QA
    // private airlockBaseApiUrl = 'http://airlock2.7iku82rby4.eu-west-1.elasticbeanstalk.com/airlock/api/admin'; // amazon
    private airlockBaseApiUrlAnalytic = `${this.airlockBaseApiUrl.substring(0,this.airlockBaseApiUrl.length-5)}`;
    private airlockProductsUrl = `${this.airlockBaseApiUrl}/products`;
    private airlockInAppPurchasesUrl = this.airlockProductsUrl;
    private airlockGroupsUrl = `${this.airlockBaseApiUrl}/usergroups`;
    private airlockFeaturesUrl = `${this.airlockBaseApiUrl}/features`;
    private airlockTranslationsUrl = `${this.airlockBaseApiUrl}/../translations`;
    private airlockAnalyticsUrl = `${this.airlockBaseApiUrlAnalytic}/analytics`;
    private airlockAuthUrl = `${this.airlockBaseApiUrl}/authentication`;
    private airlockAboutUrl = `${this.airlockBaseApiUrl.substring(0,this.airlockBaseApiUrl.length-5)}/ops/about`;
    private airlockOpsUrl = `${this.airlockBaseApiUrl.substring(0,this.airlockBaseApiUrl.length-5)}ops`;
    private jwtToken:string;
    private userRole:string;
    private isStringTranslateRole:boolean;
    private isAnalyticsViewerRole:boolean;
    private userRoleGlobal:string;
    private isStringTranslateRoleGlobal:boolean;
    private isAnalyticsViewerRoleGlobal:boolean;

    private userName:string;
    private email:string;
    private hasAdminProds: boolean = false;
    private copiedFeature:Feature;
    private copiedFeatureBranch:Branch;
    private copiedPurchase:Feature;
    private copiedPurchaseBranch:Branch;
    private addStringValidateMode:string = "VALIDATE";
    private addStringActMode:string = "ACT";
    private copiedStrings:string[];
    private capabilities:string[];
    public _menu;
    constructor(private http: Http,private _menuService: BaMenuService,private router: Router) {
        // this.jwtToken = this.getCookie("jwt");

        if(this.jwtToken == null || this.jwtToken.length == 0){
            console.log("jwt is empty look from query string");
            var d:any = document;
            this.jwtToken = d.jwtToken;
        }
        this.userRoleGlobal = this.calcUserRole();
        this.isStringTranslateRoleGlobal = this.calcIsStringTranslateRole();
        this.isAnalyticsViewerRoleGlobal = this.calcIsAnalyticsViewerRole();
        this.userRole = this.userRoleGlobal;
        this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
        this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
        this.userName = this.calcUserName();
        this.email = this.calcEmail();
        try {
            console.log("version:" + this.getVersion());
            console.log("JWT:" + this.jwtToken);
            console.log(this.getUserRole());
            this._dataStream$.subscribe((data) => this._onEvent(data));
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                var userData = AuthorizationService.getUser(this.jwtToken);
                console.log(userData);
                var startDate: number = userData.iat;
                var endDate: number = userData.exp;
                var period: number = (endDate - startDate) / 3 * 1000;
                console.log(period);
                setInterval(() => {
                    this.extendSession();
                }, period);
            }
        }catch (e){
            console.log(e);
            this.jwtToken="";
        }

    }
    public getGlobalUserRole(){
        return this.userRoleGlobal;
    }

    private initRolePerProduct(rolesList:string[]) {
        console.log("initRolePerProduct");
        console.log(rolesList);
        if(!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            this.userRole = this.userRoleGlobal;
            this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
            this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
            return;
        }
        this.userRole = AuthorizationService.getActualRole(rolesList);
        console.log("initRolePerProduct set role:"+this.userRole);
        var isStringTranslateRole:boolean = false;
        var isAnalyticsViewerRole:boolean = false;
        for(var curRole of rolesList){
            if(curRole === "TranslationSpecialist"){
                isStringTranslateRole = true;
            }else if(curRole === "AnalyticsViewer"){
                isAnalyticsViewerRole = true;
            }
        }
        this.isStringTranslateRole = isStringTranslateRole;
        this.isAnalyticsViewerRole = isAnalyticsViewerRole;
    }
    public updateUserRoleForProduct(productId:string, errorHandler:any = this.handleError.bind(this)){
        //http://localhost:9090/airlock/api/ops/products/{product_id}/airlockuser/roles
        if(!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            return new Promise((resolve, reject) => {
                resolve(42);
            });
        }
        let url = `${this.airlockBaseApiUrl}/../ops/products/${productId}/airlockuser/roles`;
        var issue = {};
        // var userData = AuthorizationService.getUser(this.jwtToken);
        if(this.email != null && this.email.length > 0) {
            issue["user"] = this.email[0];
        }else{

        }

        return this.http.post(url,JSON.stringify(issue), this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                    let creds = response.json();
                    this.initRolePerProduct(creds.roles);
                    return creds;
                }
                )
            .catch(errorHandler);
    }
    public isUserHasStringTranslateRole(){
        return this.isStringTranslateRole;
    }
    public isUserHasAnalyticsViewerRole(){
        return this.isAnalyticsViewerRole;
    }

    public getCopiedFeature(){
        return this.copiedFeature;
    }
    public getCopiedFeatureBranch(){
        return this.copiedFeatureBranch;
    }

    public getCopiedPurchase(){
        return this.copiedPurchase;
    }
    public getCopiedPurchaseBranch(){
        return this.copiedPurchaseBranch;
    }
    public setCopiedPurchase(purchase:Feature,branch:Branch){
        this.copiedPurchase = purchase;
        this.copiedPurchaseBranch = branch;

    }
    public setCopiedFeature(feature:Feature,branch:Branch){
        this.copiedFeature = feature;
        this.copiedFeatureBranch = branch;

    }
    public getAnalyticsUrl(){
        return this.analytics_url;
    }

    public getCopiedStrings(){
        return this.copiedStrings;
    }
    public setCopiedStrings(strings:string[]) {
        if (strings != null && strings.length != 0) {
            this.copiedStrings = strings;
        }
    }

    public downloadStrings(seasonId: string, strings:string[], errorHandler:any = this.handleError.bind(this)) {

        if (strings.length != 0) {
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/strings?mode=INCLUDE_TRANSLATIONS`;
        for( let stringId of strings){
            url += "&ids="+ stringId;
        }
        var fileName: string = "Strings.json";

        return this.http.get(url, this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response.json()), fileName))
            .catch(errorHandler);
        }
    }

    private processDownloadFile( data: any, assetName: string ) {
        console.log(data._body.length);
        let blob = new Blob([data._body], { "type": 'application/octet-stream' });

        // Must detect if the browser is IE in order to download files on IE.
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, assetName+".zip");
        } else {
            saveAs(blob, assetName + ".zip");
            /*
            let a = document.createElement("a");
            document.body.appendChild(a);
            //   a.setAttribute('style', 'display: none');
            let someUrl = window.URL.createObjectURL(blob);
            a.href = someUrl;
            a.download = assetName + ".zip";
            a.click();
            window.URL.revokeObjectURL(someUrl);*/
        }
    }

    public downloadStringsToFormat(seasonId: string, strings:string[], format:string, errorHandler:any = this.handleError.bind(this)) {

        if (strings.length != 0) {
            let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/stringstoformat?mode=INCLUDE_TRANSLATIONS&format=${format}`;
            for( let stringId of strings){
                url += "&ids="+ stringId;
            }
            var fileName: string = "Strings";

            // let headers =  this.addAuthToHeaders(new Headers());
            // console.log(headers);
            //{
            // method: RequestMethod.Post,
            //     responseType: ResponseContentType.Blob,
            //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}
            return this.http.get(url,{ responseType: ResponseContentType.ArrayBuffer, headers: new Headers({'sessionToken': this.jwtToken})})
                .toPromise()
                .then(response => this.processDownloadFile(response, fileName))
                .catch(errorHandler);
        }
    }

    public downloadRuntimeDefaultFiles(seasonId: string,locale:string, errorHandler:any = this.handleError.bind(this)) {
        //TODO: add locale parameter to url
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/runtimedefaults`;
        var fileName: string = "RuntimeDefaults";

        // let headers =  this.addAuthToHeaders(new Headers());
        // console.log(headers);
        //{
        // method: RequestMethod.Post,
        //     responseType: ResponseContentType.Blob,
        //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}
        return this.http.get(url,{ responseType: ResponseContentType.ArrayBuffer, headers: new Headers({'sessionToken': this.jwtToken})})
            .toPromise()
            .then(response => this.processDownloadFile(response, fileName))
            .catch(errorHandler);
    }

    public getVersion(){
        return this.airlockVersion;
    }

    public getApiUrl() {
        return this.airlockBaseApiUrl;
    }
    public getUserName() {
        return this.userName;
    }
    public getUserEmail() {
        return this.email;
    }
    private calcUserName(){
        if(this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = AuthorizationService.getUser(this.jwtToken);
            if(userData != null && userData.userAttributes != null) {
                return userData.userAttributes.FirstName + " " + userData.userAttributes.LastName;
            }
        }
        return "Esteban Zia";
    }
    private calcEmail(){
        if(this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = AuthorizationService.getUser(this.jwtToken);
            if(userData != null && userData.userAttributes != null) {
                return userData.userAttributes.Email;
            }
        }
        return "DummyUserForNotifications@weather.com";
    }
    public getUserData(){
        try {
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                var userData = AuthorizationService.getUser(this.jwtToken);
                if(userData != null) {
                    return userData.userAttributes;
                }
            }
        }catch (e){

        }
        return {"FirstName":"","LastName":"","Email":""};
    }
    public getUserRole(){
        return this.userRole;
    }
    public isGlobalUserViewer(){
        return (this.userRoleGlobal === "Viewer");
    }
    public isGlobalUserProductLead(){
        return (this.userRoleGlobal == "ProductLead");
    }
    public isGlobalUserAdministrator(){
        return (this.userRoleGlobal == "Administrator");
    }

    public isGlobalUserEditor(){
        return (this.userRoleGlobal == "Editor");
    }

    public isViewer(){
        return (this.userRole === "Viewer");
    }
    isProductLead(){
        return (this.userRole == "ProductLead");
    }
    isAdministrator(){
        return (this.userRole == "Administrator");
    }

    isEditor(){
        return (this.userRole == "Editor");
    }
    private calcIsStringTranslateRole(){
        if(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for(var curRole of userData.userRoles){
                    if(curRole === "TranslationSpecialist"){
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }
    private calcIsAnalyticsViewerRole(){
        if(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for(var curRole of userData.userRoles){
                    if(curRole === "AnalyticsViewer"){
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    private calcUserRole(){
        if(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            var userData = AuthorizationService.getUser(this.jwtToken);
            return AuthorizationService.getActualRole(userData.userRoles);
        }
        return "Administrator";
    }
    private extendSession(errorHandler:any = this.handleError.bind(this)){
        let url = `${this.airlockAuthUrl}/extend/`;
        var v = this;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                console.log(response);
                var r:any = response;
                v.jwtToken = r._body;
                console.log(v.jwtToken)
            })
            .catch(errorHandler);
    }
    public logOut(){
        console.log("logOut");
        this.jwtToken = "";
        this.deleteCookie("jwt");
        var str = window.location.href;
        var ind = str.lastIndexOf("#");
        var prefix = str.substring(0,ind);
        window.location.href = prefix+'logOut.html';
    }
    private deleteCookie(name) {
        this.setCookie(name, "", -1);
    }

    private setCookie(name: string, value: string, expireDays: number, path: string = "") {
        let d:Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires:string = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + "; " + expires + (path.length > 0 ? "; path=" + path : "");
    }

    private getCookie(name: string) {
        let cookiesArr: Array<string> = document.cookie.split(';');
        let len: number = cookiesArr.length;
        let cookieName = name + "=";
        let curCookie: string;

        for (let i: number = 0; i < len; i += 1) {
            curCookie = cookiesArr[i].replace(/^\s\+/g, "");
            if (curCookie.indexOf(cookieName) == 0) {
                return curCookie.substring(cookieName.length, curCookie.length);
            }
        }
        return "";
    }
    getProducts(errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then((response) => {
                let products = response.json().products as Product[];
                products = products.sort((n1,n2) => {
                    if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                        return 1;
                    }

                    if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                        return -1;
                    }

                    return 0;
                });
                return products;
        })
            .catch(errorHandler);
    }
    getUsers(productId:string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockOpsUrl}/userrolesets`;
        if (productId != null && productId.length > 0) {
            url = `${this.airlockOpsUrl}/products/${productId}/userrolesets`;
        }

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then((response) => {
                let products = response.json().users as User[];
                return products;
            })
            .catch(errorHandler);
    }
    updateUser(user: User, productId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockOpsUrl}/userrolesets/${user.uniqueId}`;
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http
            .put(url, JSON.stringify(user), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                return res.json();
            })
            .catch(errorHandler);
    }
    deleteUser(user: User, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockOpsUrl}/userrolesets/${user.uniqueId}`;
        let headers = new Headers({
            'Content-Type': 'application/json'});
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }
    getUserRoles(errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockOpsUrl}/userrolesets/user`;
        let currUser = this.getUserEmail()[0];
        if (Array.isArray(currUser) && currUser.length > 0) {
            currUser = currUser[0];
        }
        let identifierObj = {identifier:currUser};
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(identifierObj),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res.json().userRoleSets as User[]
            })
            .catch(errorHandler);
    }
    addUser(user: User, productId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockOpsUrl}/userrolesets`;
        if (productId != null && productId.length > 0) {
            url = `${this.airlockOpsUrl}/products/${productId}/userrolesets`;
        }
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(user),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res.json()
            })
            .catch(errorHandler);

    }
    getRoles(productId:string, errorHandler:any = this.handleError.bind(this)) {
        const promise = new Promise<Role[]>((resolve, reject) => {
            // setTimeout(() => {
            //
            // }, 1000);
            let role1 = new Role();
            role1.name = "Viewer";
            let role2 = new Role();
            role2.name = "Editor";
            role2.dependencies = ['Viewer'];
            let role3 = new Role();
            role3.name = "ProductLead";
            role3.dependencies = ['Viewer', 'Editor'];
            let role4 = new Role();
            role4.name = "AnalyticsViewer";
            role4.dependencies = ['Viewer'];
            let role5 = new Role();
            role5.name = "AnalyticsEditor";
            role5.dependencies = ['Viewer'];
            let role6 = new Role();
            role6.name = "Administrator";
            role6.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            let role7 = new Role();
            role7.name = "ProductAdmin";
            role7.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            let role8 = new Role();
            role8.name = "TranslationSpecialist";
            role8.dependencies = ['Viewer'];
            resolve([role1, role2, role3, role6, role4, role5, role8]);
        });
        return promise;
    }

    getDocumentLinks(seasonId:string, errorHandler:any = this.handleError.bind(this)){
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/documentlinks`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }
    isStaticMode():boolean{
        return (this.staticModeFlag == "TRUE");
    }
    addAuthToHeaders(headers:Headers){
        if(this.auth == "TRUE") {
            headers.append('sessionToken', this.jwtToken);
        }
        return {headers: headers};
    }
    validateCopyStrings(seasonId:string,stringsId:string[], errorHandler:any = this.handleError.bind(this)) {
        return this.copyStringsByMode("VALIDATE",seasonId,stringsId,false,errorHandler);
    }
    copyStrings(seasonId:string,stringsId:string[],overwrite:boolean, errorHandler:any = this.handleError.bind(this)) {
        return this.copyStringsByMode("ACT",seasonId,stringsId,overwrite,errorHandler);
    }
    copyStringsByMode(mode:string,seasonId:string,stringsId:string[],overwrite:boolean, errorHandler:any = this.handleError.bind(this)){
        var url = `${this.airlockTranslationsUrl}/seasons/copystrings/${seasonId}?mode=${mode}&overwrite=${overwrite}`;
        for (let stringItem of stringsId) {
            url+= "&ids="+stringItem;
        }
        console.log(url);
        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                return res.json();
            })
            .catch(errorHandler);
    }

    validateImportStrings(seasonId:string,stringsContent:string, errorHandler:any = this.handleError.bind(this)) {
        return this.importStringsByMode("VALIDATE",seasonId,stringsContent,false,errorHandler);
    }
    importStrings(seasonId:string,stringsContent:string,overwrite:boolean, errorHandler:any = this.handleError.bind(this)) {
        return this.importStringsByMode("ACT",seasonId,stringsContent,overwrite,errorHandler);
    }
    importStringsByMode(mode:string,seasonId:string,stringsContent:string,overwrite:boolean, errorHandler:any = this.handleError.bind(this)){

        var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstrings?mode=${mode}&overwrite=${overwrite}`;
        console.log(url);
        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res.json();
            })
            .catch(errorHandler);
    }
    validateImportStringsAsZip(seasonId:string,stringsContent:string, format:string, preserveFormat:boolean, errorHandler:any = this.handleError.bind(this)) {
        return this.importStringsByModeAsZip("VALIDATE", seasonId, format, stringsContent, false, preserveFormat, errorHandler);
    }

    importStringsAsZip(seasonId:string, stringsContent:string, format:string, overwrite:boolean, preserveFormat:boolean, errorHandler:any = this.handleError.bind(this)) {
        return this.importStringsByModeAsZip("ACT",seasonId, format, stringsContent, overwrite, preserveFormat, errorHandler);
    }


    importStringsByModeAsZip(mode:string, seasonId:string, format:string, stringsContent:any, overwrite:boolean, preserveFormat:boolean, errorHandler:any = this.handleError.bind(this)){

        //var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstringswithformat?mode=${mode}&format=ANDROID&overwrite=${overwrite}`;
        var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstringswithformat?mode=${mode}&format=${format}&overwrite=${overwrite}&preserveFormat=${preserveFormat}`;
        console.log(url);
        //let headers = new Headers({
        //    'Content-Type': 'multipart/form-data'});

        //let headers = new Headers({
        //    'Content-Type': 'application/zip'});

        //let headers = new Headers({
         //   'Content-Type': 'application/x-www-form-urlencoded'});

        let headers = new Headers();

        //stringsContent = Base64Utils.Base64.decode(stringsContent);
        //stringsContent = Base64.decode(stringsContent);
        //stringsContent = encodeURI(stringsContent);
        //stringsContent = encodeURIComponent(stringsContent);

        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res.json();
            })
            .catch(errorHandler);
    }
    validateCopyFeature(copiedFeatureId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)) {
        return this.copyFeatureByMode("VALIDATE",copiedFeatureId,copiedBranchId,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }
    copyFeature(copiedFeatureId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)) {
        return this.copyFeatureByMode("ACT",copiedFeatureId,copiedBranchId,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }
    validateCopyPurchase(copiedPurchaseId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)) {
        return this.copyPurchaseByMode("VALIDATE",copiedPurchaseId,copiedBranchId,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }
    copyPurchase(copiedPurchaseId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)) {
        return this.copyPurchaseByMode("ACT",copiedPurchaseId,copiedBranchId,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }
//PUT /admin/features/copy/branches/{source-branch-id}/{feature-id}/branches/{destination-branch-id}/{new-parent-id}
        copyFeatureByMode(mode:string,copiedFeatureId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)){
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        var url = `${this.airlockFeaturesUrl}/copy/branches/${copiedBranchId}/${copiedFeatureId}/branches/${targetBranchId}/${parentId}?mode=${mode}`;
        if(suffix != null){
            url += `&namesuffix=${suffix}`;
        }
        if(minAppVersion != null){
            url += `&minappversion=${minAppVersion}`;
        }
        console.log(url);
        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res.json();
            })
            .catch(errorHandler);
    }
    copyPurchaseByMode(mode:string,copiedPurchaseId:string,copiedBranchId:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)){
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        var url = `${this.airlockFeaturesUrl}/copy/branches/${copiedBranchId}/${copiedPurchaseId}/branches/${targetBranchId}/${parentId}?mode=${mode}`;
        if(suffix != null){
            url += `&namesuffix=${suffix}`;
        }
        if(minAppVersion != null){
            url += `&minappversion=${minAppVersion}`;
        }
        console.log(url);
        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res.json();
            })
            .catch(errorHandler);
    }
    importFeatureByMode(mode:string,featureContent:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)){
       //http://9.148.48.79:4545/airlock/api/admin/features/import/nid?mode=ACT&namesuffix=suf&minappaersion=app&overrideids=true
//PUT /admin/features/import/branches/{destination-branch-id}/{new-parent-id}
        var url = `${this.airlockFeaturesUrl}/import/branches/${targetBranchId}/${parentId}?mode=${mode}&overrideids=true`;
        if(suffix != null){
            url += `&namesuffix=${suffix}`;
        }
        if(minAppVersion != null){
            url += `&minappversion=${minAppVersion}`;
        }
        console.log(url);
        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, featureContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res.json();
            })
            .catch(errorHandler);
    }

    importFeature(featureContent:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)){
        return this.importFeatureByMode("ACT",featureContent,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }
    validateImportFeature(featureContent:string,parentId:string,targetBranchId:string,suffix:string,minAppVersion:string, errorHandler:any = this.handleError.bind(this)){
        return this.importFeatureByMode("VALIDATE",featureContent,parentId,targetBranchId,suffix,minAppVersion,errorHandler);
    }

    getFeatures(season: Season, branch: Branch, errorHandler:any = this.handleError.bind(this)) {
        console.log("getFeatures");
        //let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/branches/${branch.uniqueId}/features`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json().root as Feature)
            .catch(errorHandler);
    }

    private extractContent(res: any,fileName:string) {
        var saveData = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style.cssText = "display: none";
            return function (data, fileName) {

                var   blob = new Blob([data], {type: "octet/stream"}),
                    url = window.URL.createObjectURL(blob);
                console.log(url);
                a.href = url;
                a.download = fileName;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());
        console.log(res);
        saveData(res,fileName);
    }

    downloadSeasonFeatures(season: Season, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        console.log("downloadSeasonFeatures");
        var options = this.addAuthToHeaders(new Headers());
        options["responseType"] =  "blob";
        console.log(options);
        var fileName  = "versionrange"+season.minVersion;
        if(season.maxVersion != null){
            fileName += " - " + season.maxVersion;
        }
        fileName += ".json";
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response.json()),fileName))
            .catch(errorHandler);
    }
    downloadFeature(feature: Feature, branch: Branch, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/features/${feature.uniqueId}?includeStrings=true`;
        var fileName:string = feature.namespace  + "_" + feature.name+".json";

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response.json()),fileName))
            .catch(errorHandler);
    }

    downloadEntitlement(feature: Feature, branch: Branch, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/entitlements/${feature.uniqueId}?includeStrings=true`;
        var fileName:string = feature.namespace  + "_" + feature.name+".json";

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response.json()),fileName))
            .catch(errorHandler);
    }

    getApiAbout(errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAboutUrl}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getAllFeatures(product: Product, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockFeaturesUrl}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response.json();
            })
            .catch(errorHandler);
    }

    getFeature(featureId: string, branchId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${featureId}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Feature)
            .catch(errorHandler);
    }

    getInputSample(seasonId: string, stageName: string, minAppVersionName: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputsample?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getNotificationsOutputsample(seasonId: string, errorHandler:any = this.handleError.bind(this)) {
        // /admin/products/seasons/{season-id}/notifications/outputsample
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/notifications/outputsample`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getStreamInputSample(seasonId: string, stageName: string, minAppVersionName: string, filter: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams/eventsfieldsbyfilter?stage=${stageName}`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, filter,this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res.json()
            })
            .catch(errorHandler);
    }
    getStreamFilterInputSample(seasonId: string, errorHandler:any = this.handleError.bind(this)) {
        //POST /admin/products/seasons/{season-id}/streams/eventsfields
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams/eventsfields`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, "",this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res.json()
            })
            .catch(errorHandler);
    }
    getUtilitiesInfo(seasonId: string, stageName: string, minAppVersionName: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getStreamUtilitiesInfo(seasonId: string, stageName: string, minAppVersionName: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}&type=STREAMS_UTILITY`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getExperimentInputSample(experimentId: string, stageName: string, minAppVersionName: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/inputsample?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getExperimentUtilitiesInfo(experimentId: string, stageName: string, minAppVersionName: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getFeatureAttributes(featureId: string, branchId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${featureId}/attributes`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as FeatureAnalyticAttributes)
            .catch(errorHandler);
    }
    //***************InAppPurchases*********************//
    getInAppPurchases(seasonId: string, branch: Branch, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branch.uniqueId}/entitlements`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json().entitlementsRoot as InAppPurchase)
            .catch(errorHandler);
    }

    addInAppPurchase(purchase: InAppPurchase, seasonId : string, branchId: string, parentId: string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Feature>{

        let url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branchId}/entitlements?parent=${parentId}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                purchase.uniqueId = res.json().uniqueId;
                return purchase;
            })
            .catch(errorHandler);
    }

    addPurchaseOptions(purchaseOptions: PurchaseOptions, seasonId : string, branchId: string, parentId: string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Feature>{

        let url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branchId}/entitlements?parent=${parentId}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(purchaseOptions), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                purchaseOptions.uniqueId = res.json().uniqueId;
                return purchaseOptions;
            })
            .catch(errorHandler);
    }

    getInAppPurchase(purchaseId: string, branchId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchaseId}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as InAppPurchase)
            .catch(errorHandler);
    }

    getPurchaseOption(purchaseOptionsId: string, branchId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchaseOptionsId}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as PurchaseOptions)
            .catch(errorHandler);
    }
/*
    deleteNotification(notificationId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/notifications/${notificationId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }
 */
    deleteInAppPurchase(purchase: InAppPurchase, branchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateInAppPurchase(purchase: InAppPurchase, branchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<InAppPurchase>{

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as InAppPurchase)
            .catch(errorHandler);
    }
    deletePurchaseOptions(purchase: PurchaseOptions, branchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }
    updatePurchaseOptions(purchase: PurchaseOptions, branchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<PurchaseOptions>{

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as PurchaseOptions)
            .catch(errorHandler);
    }


    //***************Experiments*********************//

    getExperiments(productId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/${productId}/experiments?includeindexinginfo=true`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as ExperimentsContainer)
            .catch(errorHandler);
    }

    getExperimentIndexingInfo(experimentId:string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/indexinginfo`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as IndexingInfo)
            .catch(errorHandler);
    }
    resetDashboard(experimentId:string, errorHandler:any = this.handleError.bind(this)) {
        //PUT /analytics/products/experiments/{experiment-id}/resetdashboard
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/resetdashboard`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }
    updateExperiments(container: ExperimentsContainer, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/${container.productId}/experiments`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(container), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as ExperimentsContainer)
            .catch(errorHandler);
    }

    createExperiment(productId: string, experiment: Experiment, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Experiment>{
        let url = `${this.airlockAnalyticsUrl}/products/${productId}/experiments`;
        console.log('new experiment:', JSON.stringify(experiment));

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(experiment),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                experiment.uniqueId = res.json().uniqueId;
                return experiment;
            })
            .catch(errorHandler);
    }

    createStream(seasonId: string, stream: Stream, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Stream>{
        //POST /admin/products/seasons/{season-id}/streams
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, JSON.stringify(stream),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                stream.uniqueId = res.json().uniqueId;
                return stream;
            })
            .catch(errorHandler);
    }
    updateStream(stream: Stream, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Stream>{
        let url = `${this.airlockProductsUrl}/seasons/streams/${stream.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(stream), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as Stream)
            .catch(errorHandler);
    }

    deleteStream(streamId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/streams/${streamId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }
    getStreams(seasonId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json().streams as Stream[])
            .catch(errorHandler);
    }

    getExperiment(experimentId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}?includeindexinginfo=true`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Experiment)
            .catch(errorHandler);
    }

    updateExperiment(experiment: Experiment, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Experiment>{

        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experiment.uniqueId}`;
        //remove indexing info if exsits
        experiment.indexingInfo = undefined;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(experiment), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as Experiment)
            .catch(errorHandler);
    }

    deleteExperiment(experimentId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    addVariant(variant: Variant, experimentId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Variant>{

        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/variants/`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                variant.uniqueId = res.json().uniqueId;
                return variant;
            })
            .catch(errorHandler);
    }

    getVariant(variantId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variantId}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Variant)
            .catch(errorHandler);
    }

    updateVariant(variant: Variant, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Variant>{

        let url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variant.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as Variant)
            .catch(errorHandler);
    }

    deleteVariant(variantId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variantId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    //***************Branches*********************//
    addBranch(branch: Branch, sourceBranchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Branch>{

        let url = `${this.airlockProductsUrl}/seasons/${branch.seasonId}/${sourceBranchId}/branches`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                branch.uniqueId = res.json().uniqueId;
                return branch;
            })
            .catch(errorHandler);
    }

    getBranches(seasonId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/branches`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then((response) => {
                let branches = response.json().branches as Branch[];
                branches = branches.sort((n1,n2) => {
                    //put master on top - otherwise sort alphabetically
                    if (n1.name.toLowerCase() == "master") {
                        return -1;
                    }
                    if (n2.name.toLowerCase() == "master") {
                        return 1;
                    }
                    if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                        return 1;
                    }

                    if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                        return -1;
                    }

                    return 0;
                });
                return branches;
            })
            .catch(errorHandler);
    }

    getBranch(branchId: string, errorHandler:any = this.handleError.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Branch)
            .catch(errorHandler);
    }

    updateBranch(branch: Branch, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Branch>{

        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as Branch)
            .catch(errorHandler);
    }

    deleteBranch(branchId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getAvailableBranches(experimentId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/availablebranches`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then((response) => {
                let availableBranches = response.json() as AvailableBranches;
                availableBranches.availableInAllSeasons = availableBranches.availableInAllSeasons.sort((n1,n2) => {
                    //put master on top - otherwise sort alphabetically
                    if (n1.toLowerCase() == "master") {
                        return -1;
                    }
                    if (n2.toLowerCase() == "master") {
                        return 1;
                    }
                    if (n1.toLowerCase() > n2.toLowerCase()) {
                        return 1;
                    }

                    if (n1.toLowerCase() < n2.toLowerCase()) {
                        return -1;
                    }

                    return 0;
                });
                return availableBranches;
            })
            .catch(errorHandler);
    }

    checkoutFeature(branch: Branch, feature: Feature, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/checkout/${feature.uniqueId}`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, "", this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    cancelCheckoutFeature(branch: Branch, feature: Feature, includeSubFeatures:boolean = false, errorHandler:any = this.handleError.bind(this)) {
        let mode = includeSubFeatures? "INCLUDE_SUB_FEATURES" : "STAND_ALONE";
        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/cancelcheckout/${feature.uniqueId}?mode=${mode}`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, "", this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    getAnalyticsGlobalDataCollection(seasonId: string, branchId:string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Analytic)
            .catch(errorHandler);
    }

    getAnalyticsForDisplay(seasonId: string, branchId:string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}/?mode=DISPLAY`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as AnalyticsDisplay)
            .catch(errorHandler);
    }

    getAnalyticsGlobalDataCollectionExperiment(experimentId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/experiments/${experimentId}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as Analytic)
            .catch(errorHandler);
    }

    getAnalyticsForDisplayExperiment(experimentId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/experiments/${experimentId}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as AnalyticsExperiment)
            .catch(errorHandler);
    }

    getQuota(seasonId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/${seasonId}/quota`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as AnalyticsQuota)
            .catch(errorHandler);
    }

    getExperimentQuota(experimentId: string, errorHandler:any = this.handleError.bind(this)) {
        let url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/quota`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as AnalyticsExperimentQuota)
            .catch(errorHandler);
    }

    updateAnalyticsGlobalDataCollection(seasonId: string, branchId:string, analyticData: Analytic, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Analytic>{

        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(analyticData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => analyticData)
            .catch(errorHandler);
    }

    updateFeatureSendToAnalytic(feature: Feature, branchId:string, errorHandler:any = this.handleErrorAndShow.bind(this)){
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/branches/${branchId}/feature/${feature.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, feature,this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    deleteFeatureSendToAnalytic(feature: Feature, branchId:string, errorHandler:any = this.handleErrorAndShow.bind(this)){
        let url = `${this.airlockAnalyticsUrl}/globalDataCollection/branches/${branchId}/feature/${feature.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => feature)
            .catch(errorHandler);

    }

    update(feature: Feature, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Feature>{

        let url = `${this.airlockProductsUrl}/seasons/features/${feature.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => feature)
            .catch(errorHandler);
    }


    updateFeature(feature: Feature, branchId: string, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<Feature>{

        let url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${feature.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as Feature)
            .catch(errorHandler);
    }

    deleteFeature(feature: Feature, branch: Branch, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/features/${feature.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    deleteStringToTranslation(stringId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){
//    DELETE /translations/seasons/strings/{string-id}

        let url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res;
            })
            .catch(errorHandler);
    }


    addStringToTranslationWithMode(seasonId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this), validate: boolean){
//    POST /translations/seasons/{season-id}/strings

        let mode = validate? this.addStringValidateMode : this.addStringActMode;

        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/strings?mode=${mode}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    addStringToTranslation(seasonId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this)){
        return this.addStringToTranslationWithMode(seasonId,stringData,errorHandler,false);
    }

    validateAddStringToTranslation(seasonId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this)){
        return this.addStringToTranslationWithMode(seasonId,stringData,errorHandler,true);
    }

    updateStringToTranslationWithMode(stringId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this), validate: boolean){
//    //POST /translations/seasons/{season-id}/strings
//PUT /translations/seasons/strings/{string-id}
        let url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;

        if(validate){
            stringData["mode"]=this.addStringValidateMode;
        }
        else {
            stringData["mode"]=this.addStringActMode;
        }

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    updateStringToTranslation(stringId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this)){
        return this.updateStringToTranslationWithMode(stringId,stringData,errorHandler,false);
    }

    validateUpdateStringToTranslation(stringId : string,stringData: any, errorHandler:any = this.handleErrorAndShow.bind(this)){
        return this.updateStringToTranslationWithMode(stringId,stringData,errorHandler,true);
    }

    markStringForTranslation(seasonId : string,ids:Array<String> = [], errorHandler:any = this.handleError.bind(this)) {
        console.log("markStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/markfortranslation
        var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/markfortranslation`;
        url = this.addIdsToUrl(url,ids);


        return this.http.put(url,"",this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    addIdsToUrl(_url:string,ids:Array<String>){
        var url = _url;
        var isFirst:boolean=true;
        if(ids && ids != null){
            for(let id of ids){
                if (!isFirst &&  id) {
                    url += "&ids="+id;
                }else{
                    url += "?ids="+id;
                    isFirst=false;
                }
            }
        }
        return url;
    }
    reviewStringForTranslation(seasonId : string,ids:Array<String> = [], errorHandler:any = this.handleError.bind(this)) {
        console.log("reviewStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/reviewedfortranslation
        //PUT /translations/seasons/{season-id}/completereview
        var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/completereview`;
        url = this.addIdsToUrl(url,ids);
        return this.http.put(url,"",this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }
    sendStringForTranslation(seasonId : string,ids:Array<String> = [], errorHandler:any = this.handleError.bind(this)) {
        console.log("sendStringForTranslation");
        console.log(ids);
        //PUT /translations/seasons/{season-id}/markfortranslation
        var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/sendtotranslation`;
        url = this.addIdsToUrl(url,ids);


        return this.http.put(url,"",this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    getStringsToTranslationForSeason(seasonId : string, errorHandler:any = this.handleError.bind(this)) {
        console.log("getStringsToTranslationForSeason");
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/translate/summary`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                let translations=response.json().translationSummary as StringToTranslate[]
                translations = translations.sort((n1,n2) => {
                    if (n1.lastModified < n2.lastModified) {
                        return 1;
                    }

                    if (n1.lastModified > n2.lastModified) {
                        return -1;
                    }

                    return 0;
                })
                return translations;
            })
            .catch(errorHandler);
    }

    overrideStringToTranslation(stringId:string,locale:string,newValue:string, errorHandler:any = this.handleError.bind(this)){
//PUT /translations/seasons/{string-id}/overridetranslate/{locale}
        let url = `${this.airlockTranslationsUrl}/seasons/${stringId}/overridetranslate/${locale}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, newValue, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res;
            })
            .catch(errorHandler);
    }
    cancelOverrideStringToTranslation(stringId:string,locale:string, errorHandler:any = this.handleError.bind(this)){
        //PUT /translations/seasons/{string-id}/canceloverride/{locale}
        let url = `${this.airlockTranslationsUrl}/seasons/${stringId}/canceloverride/${locale}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .put(url, "", this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                // feature.uniqueId = res.json().uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    getStringsToTranslationForStringIds(seasonId : string,ids:Array<String> = null,locales:Array<String> = null,showTranslation:boolean = false, errorHandler:any = this.handleError.bind(this)) {
        // console.log("getStringsToTranslationForStringIds");
        // console.log(ids);
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/translate/summary?showtranslations=`+showTranslation;
        if(ids && ids != null){
            for(let id of ids){
                if (id) {
                    url += "&ids="+id;
                }
            }
        }
        if(locales && locales != null){
            for(let curLocale of locales){
                if (curLocale) {
                    url += "&locales="+curLocale;
                }
            }
        }

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                let translations=response.json().translationSummary as StringToTranslate[]
                translations = translations.sort((n1,n2) => {
                    if (n1.lastModified < n2.lastModified) {
                        return 1;
                    }

                    if (n1.lastModified > n2.lastModified) {
                        return -1;
                    }

                    return 0;
                })
                return translations;
            })
            .catch(errorHandler);
    }
    getStringFullInformation(stringId:String,errorHandler:any = this.handleError.bind(this)){
        //GET /translations/seasons/strings/{string-id}
        let url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);

    }
    getStringsForFeature(featureId:string,errorHandler:any = this.handleError.bind(this)) {
        console.log("getStringsForFeature");
        // GET /translations/seasons/{season-id}/translate/summary
        //  let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;

        //http://9.148.48.79:4545/airlock/api/translations/seasons/967ef44d-0714-4f1e-a0c1-3c8c9adadf32/stringsinuse
        let url = `${this.airlockTranslationsUrl}/seasons/${featureId}/stringsinuse`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => {
                let translations=response.json();
                // translations = translations.sort((n1,n2) => {
                //     if (n1.lastModified < n2.lastModified) {
                //         return 1;
                //     }
                //
                //     if (n1.lastModified > n2.lastModified) {
                //         return -1;
                //     }
                //
                //     return 0;
                // })
                return translations;
            })
            .catch(errorHandler);
    }

    addFeature(feature: Feature, seasonId : string, branchId: string, parentId: string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Feature>{

        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/branches/${branchId}/features?parent=${parentId}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                feature.uniqueId = res.json().uniqueId;
                return feature;
            })
            .catch(errorHandler);
    }

    addProduct(product: Product, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Product>{

        let url = `${this.airlockProductsUrl}`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                product.uniqueId = res.json().uniqueId;
                return product;
            })
            .catch(errorHandler);
    }

    addSeason(season: Season, productId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Season>{

        let url = `${this.airlockProductsUrl}/${productId}/seasons`;

        let headers = new Headers({
            'Content-Type': 'application/json'});

        return this.http
            .post(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                season.uniqueId = res.json().uniqueId;
                return season;
            })
            .catch(errorHandler);
    }

    updateSeason(season: Season, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .put(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => season)
            .catch(errorHandler);
    }

    deleteSeason(seasonId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/${seasonId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateProduct(product : Product, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Product> {

        let url = `${this.airlockProductsUrl}/${product.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .put(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => product)
            .catch(errorHandler);
    }


    getInputSchema(seasonId : string,errorHandler:any = this.handleError.bind(this)){
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputschema`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }
    validateInputSchema(seasonId : string,inputScheama : string, errorHandler:any = this.handleErrorAndShow.bind(this)){
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputschema/validate`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, inputScheama,this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);

    }

    getUtilities(seasonId : string,errorHandler:any = this.handleError.bind(this)){
        //http://airlock-dev4-adminapi.eu-west-1.elasticbeanstalk.com:80/airlock/api/admin/products/seasons/8851b6d6-8d54-4d10-8a9c-209a1cb19c53/utilities
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilities`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json().utilities)
            .catch(errorHandler);
    }

    createUtil(util : Utility, errorHandler:any = this.handleErrorAndShow.bind(this)){
    //POST /admin/products/seasons/{season-id}/utilities
        //?stage=DEVELOPMENT&force=false&type=MAIN_UTILITY
        let url = `${this.airlockProductsUrl}/seasons/${util.seasonId}/utilities?stage=${util.stage}&type=${util.type}&name=${encodeURIComponent(util.name)}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, util.utility,this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => util)
            .catch(errorHandler);
    }
    updateUtil(util : Utility, errorHandler:any = this.handleErrorAndShow.bind(this)){
        //POST /admin/products/seasons/{season-id}/utilities
        //?stage=DEVELOPMENT&force=false&type=MAIN_UTILITY
        //http://airlock-dev4-adminapi.eu-west-1.elasticbeanstalk.com:80/airlock/api/admin/products/seasons/utilities/36942b7f-ba91-4f2c-9de3-d08df9af9f76?stage=DEVELOPMENT&lastmodified=1508056701230&force=false

        let url = `${this.airlockProductsUrl}/seasons/utilities/${util.uniqueId}?stage=${util.stage}&lastmodified=${util.lastModified}&name=${encodeURIComponent(util.name)}`;

        let headers = new Headers();
        // headers.append('Content-Type', 'application/json');
console.log(util.utility);
        return this.http
            .put(url, util.utility,this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }
    deleteUtil(utilId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){
       // DELETE /admin/products/seasons/utilities/{utility-id}
    let url = `${this.airlockProductsUrl}/seasons/utilities/${utilId}`;

    return this.http
        .delete(url, this.addAuthToHeaders(new Headers()))
        .toPromise()
        .then(res => res)
        .catch(errorHandler);
}
    updateInputSchema(inputScheama : any, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/${inputScheama.seasonId}/inputschema`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .put(url, JSON.stringify(inputScheama),this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => inputScheama)
            .catch(errorHandler);
    }
    getUserGroups(product: Product, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then((response) => {
                    let groups = response.json() as UserGroups;
                    if (groups && groups.internalUserGroups) {
                        groups.internalUserGroups = groups.internalUserGroups.sort((n1,n2) => {
                            if (n1.toLowerCase() > n2.toLowerCase()) {
                                return 1;
                            }

                            if (n1.toLowerCase() < n2.toLowerCase()) {
                                return -1;
                            }

                            return 0;
                        });
                    }
                    return groups;
                }
                )
            .catch(errorHandler);
    }
    getUserGroupsUsage(product: Product, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups/usage`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getEncryptionKey(season: Season, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/seasons/${season.uniqueId}/encryptionkey`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getConstantsFileContent(platform: string, seasonId: string, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/seasons/${seasonId}/constants?platform=${platform}`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.text())
            .catch(errorHandler);
    }

    getDefaultsFileContent(seasonId: string, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/seasons/${seasonId}/defaults`;
        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.text())
            .catch(errorHandler);
    }

    updateUserGroups(product: Product, userGroups : UserGroups, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .put(url, JSON.stringify(userGroups),this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => userGroups)
            .catch(errorHandler);
    }

    private handleError(error: any) {
        console.log("handleError");
        try{
            console.log("*********");
            console.log(error);
            this.navigateToLoginIfSessionProblem(error);
            // console.log(error._body);
            // console.log(error.status);
            // if(error._body != null && error.status == 401 && error._body.indexOf("expired") != -1){
            //     // this.deleteCookie("jwt");
            //     var str = window.location.href;
            //     var ind = str.lastIndexOf("#");
            //     var prefix = str.substring(0,ind);
            //     window.location.href = prefix+'auth/login';
            //     return;
            // }
        }catch(e){
            console.log(e);
        }
        let errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if ((error.status === 404 && error.statusText) || (error._body && typeof error._body === 'string' && error._body.startsWith("<!DOCTYPE html>"))) {
            errorMessage = `Request failed, try again later. (${error.status} ${error.statusText})`;
            error._body = errorMessage;
            // return Promise.reject(errorMessage);
        }
        return Promise.reject(error.message || error);
    }
    public navigateToLoginIfSessionProblem(error: any){
        try{
            if(error == null){
                return;
            }
            console.log("********* navigateToLoginIfSessionProblem");
            console.log(error);
            console.log(error.status);


            if(error._body != null && error.status == 401 && ((typeof error._body === 'string'&&  (error._body.indexOf("expired") != -1 || error._body.indexOf("JWT") != -1)) )){
                console.log("logOut");
                // this.jwtToken = "";
                // this.deleteCookie("jwt");
                var str = window.location.href;
                var ind = str.lastIndexOf("#");
                var prefix = str.substring(0,ind);
                window.location.href = prefix+'auth/login';
                return;
            }
        }catch(e){
            console.log(e);
        }
    }
    private handleErrorAndShow(error: any) {
        console.log("handleErrorAndShow");
        try{
            console.log("*********");
            console.log(this);
            this.navigateToLoginIfSessionProblem(error);
            // console.log(error);
            // console.log(error._body);
            // console.log(error.status);
            // if(error._body != null && error.status == 401 && error._body.indexOf("expired") != -1){
            //     console.log("logOut");
            //     // this.jwtToken = "";
            //     // this.deleteCookie("jwt");
            //     var str = window.location.href;
            //     var ind = str.lastIndexOf("#");
            //     var prefix = str.substring(0,ind);
            //     window.location.href = prefix+'auth/login';
            //     return;
            // }
            // this.notifyDataChanged("error-notification",this.parseErrorMessage(error,"Request failed, try again later."));
        }catch(e){
            console.log(e);
        }
        let errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        // alert(errorMessage);

        return Promise.reject(error.message || error);
    }
    private _handleError(error: any, show:boolean = false) {
        console.log("_handleError");
        try{
            console.log("*********");
            console.log(error);
            console.log(error._body);
            console.log(error.status);
            if((error._body != null && error.status == 401 && (error._body.indexOf("expired") != -1)) || (error._body != null && error._body.toLowerCase().indexOf("jwt") != -1)){
                // this.deleteCookie("jwt");
                var str = window.location.href;
                var ind = str.lastIndexOf("#");
                var prefix = str.substring(0,ind);
                window.location.href = prefix+'auth/login';
                return;
            }
        }catch(e){
            console.log(e);
        }
        let errorMessage = error._body || "Request failed, try again later.";
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if (show==true) {
            alert(errorMessage);
        }
        return Promise.reject(error.message || error);
    }


    //notificatins
    subscribe(event:string, callback:Function) {
        var subscribers = this._subscriptions.get(event) || [];
        subscribers.push(callback);

        this._subscriptions.set(event, subscribers);
    }

    _onEvent(data:any) {
        var subscribers = this._subscriptions.get(data['event']) || [];

        subscribers.forEach((callback) => {
            callback.call(null, data['data']);
        });
    }

    notifyDataChanged(event, value) {
        console.log("notifyDataChaned (airlockService)");
            this._data[event] = value;

            this._data.next({
                event: event,
                data: this._data[event]
            });
    }

    getJWT(){
        return this.jwtToken;
    }
    isHaveJWTToken() {
        return (this.jwtToken != null && this.jwtToken.length > 0);
    }

    followProduct(productId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/${productId}/follow`;

        return this.http
            .post(url,"", this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    unfollowProduct(productId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/${productId}/follow`;

        return this.http
            .delete(url, this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    followFeature(featureId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/features/${featureId}/follow`;

        return this.http
            .post(url,"", this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    unfollowFeature(featureId : string, errorHandler:any = this.handleErrorAndShow.bind(this)){

        let url = `${this.airlockProductsUrl}/seasons/features/${featureId}/follow`;

        return this.http
            .delete(url, this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    parseErrorMessage(error: any, defaultMessage:string): string {
        var errorMessage = error._body || defaultMessage;
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch(err) {
            if(errorMessage != null && (typeof errorMessage === 'string' || errorMessage instanceof String) && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                errorMessage = errorMessage.substring(1,errorMessage.length -1);
            }
        }


        return errorMessage;
    }

    parseErrorMessageB(error: any, defaultMessage:string): string {
        var errorMessage = error._body || defaultMessage;
        try {
            var jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch(err) {
            if(errorMessage != null && errorMessage.indexOf('{"error":') == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
                errorMessage = errorMessage.substring(9,errorMessage.length -1);
            }
        }


        return errorMessage;
    }

    getStringIssue(stringId : string,locale: string, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}/locale/${locale}/issues`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    createNewStringIssue(stringId : string,locale: string,issueText: string, issueType: string, issueSubType: string, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockTranslationsUrl}/seasons/${stringId}/issues/${locale}`;
        var issue = {};
        issue["issueTypeCode"] = issueType;
        issue["issueSubTypeCode"] = issueSubType;
        issue["issueText"] = issueText;

        return this.http.post(url,JSON.stringify(issue),this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    addStringIssueComment(seasonId : string,issueId: string,comment: any, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/issue/${issueId}`;

        return this.http.put(url,JSON.stringify(comment),this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(() => comment)
            .catch(errorHandler);
    }

    changeIssueState(seasonId : string,issueId: string,isOpen: boolean, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/issue/${issueId}`;
        var newStateJson = {};
        newStateJson["setOpenStatus"] = isOpen;
        return this.http.put(url,JSON.stringify(newStateJson),this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then()
            .catch(errorHandler);
    }


    getStringUsage(stringId : string, errorHandler:any = this.handleError.bind(this)){

        let url = `${this.airlockTranslationsUrl}/seasons/${stringId}/stringusage`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json())
            .catch(errorHandler);
    }

    getNotifications(season: Season, errorHandler:any = this.handleError.bind(this)) {
        console.log("getNotifications");
        // /admin/products/seasons/{season-id}/notifications
        let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/notifications`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json() as AirlockNotifications)
            .catch(errorHandler);
    }


    updateoNotifications(notifications: AirlockNotifications, errorHandler:any = this.handleError.bind(this)) {
        // /admin/products/seasons/{season-id}/notifications
        let url = `${this.airlockProductsUrl}/seasons/${notifications.seasonId}/notifications`;
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notifications), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as AirlockNotifications)
            .catch(errorHandler);
    }

    updateNotification(notification: AirlockNotification, errorHandler:any = this.handleErrorAndShow.bind(this)):Promise<AirlockNotification>{
        // /admin/products/seasons/notifications/{webhook-id}
        let url = `${this.airlockProductsUrl}/seasons/notifications/${notification.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notification), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.json() as AirlockNotification)
            .catch(errorHandler);
    }

    createNotification(seasonId: string, notification: AirlockNotification, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<AirlockNotification>{
        //POST /admin/products/seasons/{season-id}/notifications
        let url = `${this.airlockProductsUrl}/seasons/${seasonId}/notifications`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, JSON.stringify(notification),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                notification.uniqueId = res.json().uniqueId;
                return notification;
            })
            .catch(errorHandler);
    }

    deleteNotification(notificationId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {

        let url = `${this.airlockProductsUrl}/seasons/notifications/${notificationId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getWebhooks(errorHandler:any = this.handleError.bind(this)) {
        console.log("getWebhooks");
        // GET /ops/webhooks
        let url = `${this.airlockOpsUrl}/webhooks`;

        return this.http.get(url,this.addAuthToHeaders(new Headers()))
            .toPromise()
            .then(response => response.json().webhooks as Webhook[])
            .catch(errorHandler);
    }

    createWebhook(webhook: Webhook, errorHandler:any = this.handleErrorAndShow.bind(this)) : Promise<Webhook>{
        //POST /ops/webhooks
        let url = `${this.airlockOpsUrl}/webhooks`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, JSON.stringify(webhook),this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                console.log(res);
                return res.json();
            })
            .catch(errorHandler);
    }

    deleteWebhook(webhookId : string, errorHandler:any = this.handleErrorAndShow.bind(this)) {
        //DELETE /ops/webhooks/{webhook-id}
        let url = `${this.airlockOpsUrl}/webhooks/${webhookId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateWebhook(webhook: Webhook, errorHandler:any = this.handleErrorAndShow.bind(this)) {
        // PUT /ops/webhooks/{webhook-id}
        let url = `${this.airlockOpsUrl}/webhooks/${webhook.uniqueId}`;

        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(webhook), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }


    /*
     "STREAMS",
     "FEATURES",
     "NOTIFICATIONS",
     "TRANSLATIONS",
     "ANALYTICS",
     "EXPERIMENTS",
     "BRANCHES",
     "EXPORT_IMPORT"
     */

    setCapabilities(product: Product){
        if(product){
            this.capabilities = product.capabilities;
        }
        else{
            this.capabilities = [];
        }
        
        this.refreshMenu();
        // if(this.cantViewSelectedPage()){
        //     this.redirectToFeaturesPage();
        // }
    }

    cantViewSelectedPage(){
        return this._menuService.getCurrentItem().hidden && this._menuService.getCurrentItem().selected;
    }

    getCapabilities(): string[]{
        return this.capabilities || [];
    }

    redirectToFeaturesPage(){
        this.router.navigate(['/pages/features']);
    }

    canExportImport():boolean{
        return this.getCapabilities().includes("EXPORT_IMPORT");
    }

    canUseBranches():boolean{
        return this.getCapabilities().includes("BRANCHES");
    }

    canUseAnalytics():boolean{
        return this.getCapabilities().includes("ANALYTICS");
    }
    setHasAdminProds(has: boolean) {
        this.hasAdminProds = has;
        this.refreshMenu();
    }
    canViewPage(menuPathOrTitle:string):boolean{
        if(menuPathOrTitle == "Administration" || menuPathOrTitle == "products"
            || (menuPathOrTitle == "groups" && !this.isStaticMode()
             /*DELETE ME*/)
            /*|| menuPathOrTitle == "authorization"*/){
            return true;
        }
        if (menuPathOrTitle == "entitlements"){
            return true;
        }
        if (menuPathOrTitle == "authorization") {
            return this.hasAdminProds;
        }
        if (menuPathOrTitle == "webhooks") {
            return this.isAdministrator();
        }
        if(this.capabilities == undefined){
            return true;
        }
        return this.capabilities.includes(menuPathOrTitle.toUpperCase());
    }

    refreshMenu(){
        //this._menuService.refreshMenu();
        console.log(this._menu);
        for(var menu of this._menu[0].children){
            var menuPathOrTitle;
            if(typeof menu["path"] != 'undefined'){
                menuPathOrTitle = menu["path"];
            }
            else {
                menuPathOrTitle = menu.data.menu.title
            }
            menu.data.menu.hidden = !this.canViewPage(menuPathOrTitle);
            if (menu.children) {
                for (let child of menu.children) {
                    var childPathOrTitle;
                    if(typeof child["path"] != 'undefined'){
                        childPathOrTitle = child["path"];
                    }
                    else {
                        childPathOrTitle = child.data.menu.title;
                    }
                    child.data.menu.hidden = !this.canViewPage(childPathOrTitle);
                }
            }
        }
        this._menuService.updateMenuByRoutes(this._menu);
    }

}
