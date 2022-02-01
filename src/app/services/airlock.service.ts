import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Product} from '../model/product';
import {Season} from '../model/season';
import {Feature} from '../model/feature';
import {UserGroups} from '../model/user-groups';
import {AuthorizationService} from './authorization.service';
import {Analytic, FeatureAnalyticAttributes} from '../model/analytic';
import {AnalyticsDisplay} from '../model/analyticsDisplay';
import {StringToTranslate} from '../model/stringToTranslate';
import {AnalyticsExperimentQuota, AnalyticsQuota} from '../model/analyticsQuota';
import {Experiment} from '../model/experiment';
import {Variant} from '../model/variant';
import {AvailableBranches, Branch} from '../model/branch';
import {ExperimentsContainer} from '../model/experimentsContainer';
import {AnalyticsExperiment} from '../model/analyticsExperiment';
import {Stream} from '../model/stream';
import {AirlockNotification} from '../model/airlockNotification';
import {AirlockNotifications} from '../model/airlockNotifications';
import {IndexingInfo} from '../model/indexingInfo';
import {Utility} from '../model/utility';
import {Router} from '@angular/router';
import {User} from '../model/user';
import {Role} from '../model/role';
import {Webhook} from '../model/webhook';
import {InAppPurchase} from '../model/inAppPurchase';
import {PurchaseOptions} from '../model/purchaseOptions';
import {StreamsData} from '../model/streamsData';
import {Cohort} from '../model/cohort';
import {CohortsData} from '../model/cohortsData';
import {AirCohortsResponse} from '../model/airCohortsResponse';
import {DataimportsData} from '../model/dataimportsData';
import {Dataimport} from '../model/dataimport';
import {environment} from '../../environments/environment';
import {NbGlobalLogicalPosition, NbMenuService, NbToastrService} from "@nebular/theme";
import {Subject} from "rxjs";
import {Poll} from "../model/poll";
import {Question} from "../model/question";
import {AirlockPolls} from "../model/airlockPolls";

@Injectable()
export class AirlockService {

    // arrange notifications
    private _data = new Subject<Object>();
    private _dataStream$ = this._data.asObservable();

    private _subscriptions: Map<string, Array<Function>> = new Map<string, Array<Function>>();
    ////////////////////////

    private airlockBaseApiUrl = environment.AIRLOCK_API_URL;
    private airlockVersion = environment.VERSION;
    private auth = environment.AIRLOCK_API_AUTH;
    private analytics_url = environment.AIRLOCK_ANALYTICS_URL;
    // private airlockBaseApiUrl = 'http://9.148.49.163:8080/airlock/api/admin';
    // private airlockBaseApiUrl = 'http://9.148.54.98:7070/airlock/api/admin'; // console dev
    // private airlockBaseApiUrl = 'http://9.148.54.98:2020/airlock/api/admin'; // rotem/vicky QA
    // private airlockBaseApiUrl = 'http://airlock2.7iku82rby4.eu-west-1.elasticbeanstalk.com/airlock/api/admin'; // amazon
    private airlockBaseApiUrlAnalytic = `${this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5)}`;
    private airlockProductsUrl = `${this.airlockBaseApiUrl}/products`;
    private airlockAirlyticsUrl = `${this.airlockBaseApiUrl}/airlytics`;
    private airlockPollsUrl = `${this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5)}`;
    private airlockInAppPurchasesUrl = this.airlockProductsUrl;
    private airlockGroupsUrl = `${this.airlockBaseApiUrl}/usergroups`;
    private airlockFeaturesUrl = `${this.airlockBaseApiUrl}/features`;
    private airlockTranslationsUrl = `${this.airlockBaseApiUrl}/../translations`;
    private airlockAnalyticsUrl = `${this.airlockBaseApiUrlAnalytic}/analytics`;
    private airlockAuthUrl = `${this.airlockBaseApiUrl}/authentication`;
    private airlockAboutUrl = `${this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5)}/ops/about`;
    private airlockOpsUrl = `${this.airlockBaseApiUrl.substring(0, this.airlockBaseApiUrl.length - 5)}ops`;
    private jwtToken: string;
    private userRole: string;
    private isStringTranslateRole: boolean;
    private isAnalyticsViewerRole: boolean;
    private isAnalyticsEditorRole: boolean;
    private userRoleGlobal: string;
    private isStringTranslateRoleGlobal: boolean;
    private isAnalyticsViewerRoleGlobal: boolean;
    private isAnalyticsEditorRoleGlobal: boolean;

    private userName: string;
    private email: string;
    private hasAdminProds: boolean = false;
    private copiedFeature: Feature;
    private copiedFeatureBranch: Branch;
    private copiedPurchase: Feature;
    private copiedPurchaseBranch: Branch;
    private addStringValidateMode: string = 'VALIDATE';
    private addStringActMode: string = 'ACT';
    private copiedStrings: string[];
    private capabilities: string[];
    public _menu;

    constructor(private http: HttpClient,
                private _menuService: NbMenuService,
                private router: Router,
                private toastrService: NbToastrService, ) {
        let cookieJwt = this.getSessionJwt();
        if (this.jwtToken == null || this.jwtToken.length === 0) {
            console.log('jwt is empty look from query string');
            const d: any = document;
            this.jwtToken = d.jwtToken;
        }
        if(this.jwtToken == null || this.jwtToken.length == 0){
            console.log("jwt is empty look DOCUMENT");
            this.jwtToken = cookieJwt;
        }
        if (this.jwtToken && this.jwtToken.length > 0) {
            console.log("saving jwt");
            this.setSessionJwt(this.jwtToken);
            let saved = this.getSessionJwt();
        }
        this.userRoleGlobal = this.calcUserRole();
        this.isStringTranslateRoleGlobal = this.calcIsStringTranslateRole();
        this.isAnalyticsViewerRoleGlobal = this.calcIsAnalyticsViewerRole();
        this.isAnalyticsEditorRoleGlobal = this.calcIsAnalyticsEditorRole();
        this.userRole = this.userRoleGlobal;
        this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
        this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
        this.isAnalyticsEditorRole = this.isAnalyticsEditorRoleGlobal;
        this.userName = this.calcUserName();
        this.email = this.calcEmail();
        try {
            console.log('version:' + this.getVersion());
            console.log(this.getUserRole());
            this._dataStream$.subscribe((data) => this._onEvent(data));
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                const userData = AuthorizationService.getUser(this.jwtToken);
                const startDate: number = userData.iat;
                const endDate: number = userData.exp;
                const period: number = (endDate - startDate) / 3 * 1000;
                if (period > 2000) {
                    console.log("setting extend session for period of "+ period + "ms");
                    setInterval(() => {
                        this.extendSession();
                    }, period);
                } else {
                    console.log("ERROR calculated extend period is:" + period + "\njwt is " + this.jwtToken);
                }

            }
        } catch (e) {
            console.log(e);
            this.jwtToken = '';
        }

    }

    public getGlobalUserRole() {
        return this.userRoleGlobal;
    }

    private initRolePerProduct(rolesList: string[]) {
        if (!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            this.userRole = this.userRoleGlobal;
            this.isStringTranslateRole = this.isStringTranslateRoleGlobal;
            this.isAnalyticsViewerRole = this.isAnalyticsViewerRoleGlobal;
            this.isAnalyticsEditorRole = this.isAnalyticsEditorRoleGlobal;
            return;
        }
        this.userRole = AuthorizationService.getActualRole(rolesList);
        let isStringTranslateRole: boolean = false;
        let isAnalyticsViewerRole: boolean = false;
        let isAnalyticsEditorRole: boolean = false;
        for (const curRole of rolesList) {
            if (curRole === 'TranslationSpecialist') {
                isStringTranslateRole = true;
            } else if (curRole === 'AnalyticsViewer') {
                isAnalyticsViewerRole = true;
            } else if (curRole === 'AnalyticsEditor') {
                isAnalyticsEditorRole = true;
            }
        }
        this.isStringTranslateRole = isStringTranslateRole;
        this.isAnalyticsViewerRole = isAnalyticsViewerRole;
        this.isAnalyticsEditorRole = isAnalyticsEditorRole;
    }

    public updateUserRoleForProduct(productId: string, errorHandler: any = this.handleError.bind(this,'updateUserRoleForProduct)')) {
        // http://localhost:9090/airlock/api/ops/products/{product_id}/airlockuser/roles
        if (!(this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0)) {
            return new Promise((resolve, reject) => {
                resolve(42);
            });
        }
        const url = `${this.airlockBaseApiUrl}/../ops/products/${productId}/airlockuser/roles`;
        const issue = {};
        // var userData = AuthorizationService.getUser(this.jwtToken);
        if (this.email != null && this.email.length > 0) {
            issue['user'] = this.email[0];
        } else {

        }

        return this.http.post(url, JSON.stringify(issue), this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                    const creds = response;
                    this.initRolePerProduct((creds as any).roles);
                    return creds;
                },
            )
            .catch(errorHandler);
    }

    public isUserHasStringTranslateRole() {
        return this.isStringTranslateRole;
    }

    public isUserHasAnalyticsViewerRole() {
        return this.isAnalyticsViewerRole;
    }

    public isUserHasAnalyticsEditorRole() {
        return this.isAnalyticsEditorRole;
    }

    public getCopiedFeature() {
        return this.copiedFeature;
    }

    public getCopiedFeatureBranch() {
        return this.copiedFeatureBranch;
    }

    public getCopiedPurchase() {
        return this.copiedPurchase;
    }

    public getCopiedPurchaseBranch() {
        return this.copiedPurchaseBranch;
    }

    public setCopiedPurchase(purchase: Feature, branch: Branch) {
        this.copiedPurchase = purchase;
        this.copiedPurchaseBranch = branch;

    }

    public setCopiedFeature(feature: Feature, branch: Branch) {
        this.copiedFeature = feature;
        this.copiedFeatureBranch = branch;

    }

    public getAnalyticsUrl() {
        return this.analytics_url;
    }

    public getCopiedStrings() {
        return this.copiedStrings;
    }

    public setCopiedStrings(strings: string[]) {
        if (strings != null && strings.length !== 0) {
            this.copiedStrings = strings;
        }
    }

    public downloadStrings(seasonId: string, strings: string[], errorHandler: any = this.handleError.bind(this,'downloadStrings')) {

        if (strings.length !== 0) {
            let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/strings?mode=INCLUDE_TRANSLATIONS`;
            for (const stringId of strings) {
                url += '&ids=' + stringId;
            }
            const fileName: string = 'Strings.json';

            return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
                .toPromise()
                .then(response => this.extractContent(JSON.stringify(response), fileName))
                .catch(errorHandler);
        }
    }

    private processDownloadFile(data: any, assetName: string) {
        const blob = new Blob([data._body], {'type': 'application/octet-stream'});

        // Must detect if the browser is IE in order to download files on IE.
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, assetName + '.zip');
        } else {
            saveAs(blob, assetName + '.zip');
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

    public downloadStringsToFormat(seasonId: string, strings: string[], format: string, errorHandler: any = this.handleError.bind(this,'downloadStringsToFormat')) {

        if (strings.length !== 0) {
            let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/stringstoformat?mode=INCLUDE_TRANSLATIONS&format=${format}`;
            for (const stringId of strings) {
                url += '&ids=' + stringId;
            }
            const fileName: string = 'Strings';

            // let headers =  this.addAuthToHeaders(new Headers());
            // {
            // method: RequestMethod.Post,
            //     responseType: ResponseContentType.Blob,
            //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}

            let headers = new HttpHeaders();
            if (this.jwtToken != null) {
                headers = new HttpHeaders({'sessionToken': this.jwtToken})
            }

            return this.http.get(url, {
                responseType: 'arraybuffer',
                headers: headers,
            })
                .toPromise()
                .then(response => this.processDownloadFile(response, fileName))
                .catch(errorHandler);
        }
    }

    public downloadRuntimeDefaultFiles(seasonId: string, locale: string, errorHandler: any = this.handleError.bind(this,'downloadRuntimeDefaultFiles')) {
        // TODO: add locale parameter to url
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/runtimedefaults`;
        const fileName: string = 'RuntimeDefaults';

        // let headers =  this.addAuthToHeaders(new Headers());
        // {
        // method: RequestMethod.Post,
        //     responseType: ResponseContentType.Blob,
        //     headers: new Headers({'Content-Type', 'application/x-www-form-urlencoded'}
        return this.http.get(url, {
            responseType: 'arraybuffer',
            headers: new HttpHeaders({'sessionToken': this.jwtToken})
        })
            .toPromise()
            .then(response => this.processDownloadFile(response, fileName))
            .catch(errorHandler);
    }

    public getVersion() {
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

    private calcUserName() {
        if (this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            if (userData != null && userData.userAttributes != null) {
                return userData.userAttributes.FirstName + ' ' + userData.userAttributes.LastName;
            }
        }
        return 'Esteban Zia';
    }

    private calcEmail() {
        if (this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            if (userData != null && userData.userAttributes != null) {
                return userData.userAttributes.Email;
            }
        }
        return 'DummyUserForNotifications@weather.com';
    }

    public getUserData() {
        try {
            if (this.jwtToken != null && this.jwtToken.length > 0) {
                const userData = AuthorizationService.getUser(this.jwtToken);
                if (userData != null) {
                    return userData.userAttributes;
                }
            }
        } catch (e) {

        }
        return {'FirstName': '', 'LastName': '', 'Email': ''};
    }

    public getUserRole() {
        return this.userRole;
    }

    public isGlobalUserViewer() {
        return (this.userRoleGlobal === 'Viewer');
    }

    public isGlobalUserProductLead() {
        return (this.userRoleGlobal === 'ProductLead');
    }

    public isGlobalUserAdministrator() {
        return (this.userRoleGlobal === 'Administrator');
    }

    public isGlobalUserEditor() {
        return (this.userRoleGlobal === 'Editor');
    }

    public isViewer() {
        return (this.userRole === 'Viewer');
    }

    isProductLead() {
        return (this.userRole === 'ProductLead');
    }

    isAdministrator() {
        return (this.userRole === 'Administrator');
    }

    isEditor() {
        return (this.userRole === 'Editor');
    }

    private calcIsStringTranslateRole() {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (const curRole of userData.userRoles) {
                    if (curRole === 'TranslationSpecialist') {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    private calcIsAnalyticsViewerRole() {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (const curRole of userData.userRoles) {
                    if (curRole === 'AnalyticsViewer') {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    private calcIsAnalyticsEditorRole() {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            if (userData && userData.userRoles) {
                for (const curRole of userData.userRoles) {
                    if (curRole === 'AnalyticsEditor') {
                        return true;
                    }
                }
            }
            return false;
        }
        return true;
    }

    private calcUserRole() {
        if (this.jwtToken && this.jwtToken != null && this.jwtToken.length > 0) {
            const userData = AuthorizationService.getUser(this.jwtToken);
            return AuthorizationService.getActualRole(userData.userRoles);
        }
        return 'Administrator';
    }

    private extendSession(errorHandler: any = this.handleError.bind(this,'extendSession')) {
        const url = `${this.airlockAuthUrl}/extend/`;
        const v = this;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                const r: any = response;
                v.jwtToken = r._body;
                console.log(v.jwtToken);
            })
            .catch(errorHandler);
    }

    public logOut() {
        this.jwtToken = '';
        this.deleteCookie('jwt');
        this.deleteSessionJwt();
        const str = window.location.href;
        const ind = str.lastIndexOf('#');
        const prefix = str.substring(0, ind);
        window.location.href = prefix + 'logOut.html';
    }

    private deleteCookie(name) {
        this.setCookie(name, '', -1);
    }

    private setCookie(name: string, value: string, expireDays: number, path: string = '') {
        const d: Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        const expires: string = 'expires=' + d.toUTCString();
        document.cookie = name + '=' + value + '; ' + expires + (path.length > 0 ? '; path=' + path : '');
    }

    private setToLocalStorage(key:string, data:string) {
        localStorage.setItem(key, data);
    }
    private getStringFromLocalStorage(key:string) {
        let data = localStorage.getItem(key);
        if (data && data != "undefined") {
            return data;
        } else {
            return null;
        }
    }

    private setSessionJwt(jwt:string) {
        let user = "airlockuser";
        let userKey = "sessionJwt." + user;
        console.log("setting jwt to storage...");
        this.setToLocalStorage(userKey,jwt);
    }
    private getSessionJwt():string {
        let user = "airlockuser";
        let userKey = "sessionJwt." + user;
        console.log("getting from local storage");
        return this.getStringFromLocalStorage(userKey);
    }
    private getCookie(name: string) {
        const cookiesArr: Array<string> = document.cookie.split(';');
        const len: number = cookiesArr.length;
        const cookieName = name + '=';
        let curCookie: string;

        for (let i: number = 0; i < len; i += 1) {
            curCookie = cookiesArr[i].replace(/^\s\+/g, '');
            if (curCookie.indexOf(cookieName) === 0) {
                return curCookie.substring(cookieName.length, curCookie.length);
            }
        }
        return '';
    }

    getProducts(errorHandler: any = this.handleError.bind(this,'getProducts')) {

        const url = `${this.airlockProductsUrl}/seasons/`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders({})))
            .toPromise()
            .then((response) => {
                let products = (response as any).products as Product[];
                products = products.sort((n1, n2) => {
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

    getUsers(productId: string, errorHandler: any = this.handleError.bind(this,'getUsers')) {
        let url = `${this.airlockOpsUrl}/userrolesets`;
        if (productId != null && productId.length > 0) {
            url = `${this.airlockOpsUrl}/products/${productId}/userrolesets`;
        }

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then((response) => {
                const products = (response as any).users as User[];
                return products;
            })
            .catch(errorHandler);
    }

    updateUser(user: User, productId: string, errorHandler: any = this.handleError.bind(this,'updateUser')) {
        const url = `${this.airlockOpsUrl}/userrolesets/${user.uniqueId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .put(url, JSON.stringify(user), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    deleteUser(user: User, errorHandler: any = this.handleError.bind(this,'deleteUser')) {
        const url = `${this.airlockOpsUrl}/userrolesets/${user.uniqueId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getUserRoles(errorHandler: any = this.handleError.bind(this,'getUserRoles')) {
        const url = `${this.airlockOpsUrl}/userrolesets/user`;
        let currUser = this.getUserEmail()[0];
        if (Array.isArray(currUser) && currUser.length > 0) {
            currUser = currUser[0];
        }
        const identifierObj = {identifier: currUser};
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(identifierObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return (res as any).userRoleSets as User[];
            })
            .catch(errorHandler);
    }

    addUser(user: User, productId: string, errorHandler: any = this.handleError.bind(this,'addUser')) {
        let url = `${this.airlockOpsUrl}/userrolesets`;
        if (productId != null && productId.length > 0) {
            url = `${this.airlockOpsUrl}/products/${productId}/userrolesets`;
        }
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(user), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);

    }

    getRoles(productId: string, errorHandler: any = this.handleError.bind(this,'getRoles')) {
        const promise = new Promise<Role[]>((resolve, reject) => {
            // setTimeout(() => {
            //
            // }, 1000);
            const role1 = new Role();
            role1.name = 'Viewer';
            const role2 = new Role();
            role2.name = 'Editor';
            role2.dependencies = ['Viewer'];
            const role3 = new Role();
            role3.name = 'ProductLead';
            role3.dependencies = ['Viewer', 'Editor'];
            const role4 = new Role();
            role4.name = 'AnalyticsViewer';
            role4.dependencies = ['Viewer'];
            const role5 = new Role();
            role5.name = 'AnalyticsEditor';
            role5.dependencies = ['Viewer'];
            const role6 = new Role();
            role6.name = 'Administrator';
            role6.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            const role7 = new Role();
            role7.name = 'ProductAdmin';
            role7.dependencies = ['Viewer', 'Editor', 'ProductLead'];
            const role8 = new Role();
            role8.name = 'TranslationSpecialist';
            role8.dependencies = ['Viewer'];
            const role9 = new Role();
            role9.name = 'PollsViewer';
            const role10 = new Role();
            role10.name = 'PollsEditor';
            role10.dependencies = ['PollsViewer'];
            const role11 = new Role();
            role11.name = 'PollResultsService';
            resolve([role1, role2, role3, role6, role4, role5, role8, role9, role10, role11]);
        });
        return promise;
    }

    getDocumentLinks(seasonId: string, errorHandler: any = this.handleError.bind(this,'getDocumentLinks')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/documentlinks`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getImportTablesList(productId: string, errorHandler: any = this.handleError.bind(this,'getImportTablesList')) {
        const url = `${this.airlockBaseApiUrl}/airlytics/products/${productId}/dataimport/meta/users/tables`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(
                response => response,
            )
            .catch(errorHandler);
    }

    addOptions(type: string) {
        let headers = new HttpHeaders();
        if (this.auth === 'TRUE') {
            headers.set('sessionToken', this.jwtToken);
        }
        let httpOptions = {
            headers: headers,
            responseType: 'type'
        };
        return httpOptions;

    }


    addAuthToHeaders(headers: HttpHeaders) {
        if (this.auth === 'TRUE') {
            headers = headers.append('sessionToken', this.jwtToken);
        }
        return {headers: headers};
    }

    addHeadersForConstants(){
        let headers = new HttpHeaders();
        headers.append('Access-Control-Allow-Origin', '*');
        if (this.auth === 'TRUE') {
            headers = headers.append('sessionToken', this.jwtToken);
        }
        return {headers: headers, responseType: 'text' as const};
    }

    validateCopyStrings(seasonId: string, stringsId: string[], errorHandler: any = this.handleError.bind(this,'validateCopyStrings')) {
        return this.copyStringsByMode('VALIDATE', seasonId, stringsId, false, errorHandler);
    }

    copyStrings(seasonId: string, stringsId: string[], overwrite: boolean, errorHandler: any = this.handleError.bind(this,'copyStrings')) {
        return this.copyStringsByMode('ACT', seasonId, stringsId, overwrite, errorHandler);
    }

    copyStringsByMode(mode: string, seasonId: string, stringsId: string[], overwrite: boolean, errorHandler: any = this.handleError.bind(this,'copyStringsByMode')) {
        let url = `${this.airlockTranslationsUrl}/seasons/copystrings/${seasonId}?mode=${mode}&overwrite=${overwrite}`;
        for (const stringItem of stringsId) {
            url += '&ids=' + stringItem;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    validateImportStrings(seasonId: string, stringsContent: string, errorHandler: any = this.handleError.bind(this,'validateImportStrings')) {
        return this.importStringsByMode('VALIDATE', seasonId, stringsContent, false, errorHandler);
    }

    importStrings(seasonId: string, stringsContent: string, overwrite: boolean, errorHandler: any = this.handleError.bind(this,'importStrings')) {
        return this.importStringsByMode('ACT', seasonId, stringsContent, overwrite, errorHandler);
    }

    importStringsByMode(mode: string, seasonId: string, stringsContent: string, overwrite: boolean, errorHandler: any = this.handleError.bind(this,'importStringsByMode')) {

        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstrings?mode=${mode}&overwrite=${overwrite}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    validateImportStringsAsZip(seasonId: string, stringsContent: string, format: string, preserveFormat: boolean, errorHandler: any = this.handleError.bind(this,'validateImportStringsAsZip')) {
        return this.importStringsByModeAsZip('VALIDATE', seasonId, format, stringsContent, false, preserveFormat, errorHandler);
    }

    importStringsAsZip(seasonId: string, stringsContent: string, format: string, overwrite: boolean, preserveFormat: boolean, errorHandler: any = this.handleError.bind(this,'importStringsAsZip')) {
        return this.importStringsByModeAsZip('ACT', seasonId, format, stringsContent, overwrite, preserveFormat, errorHandler);
    }


    importStringsByModeAsZip(mode: string, seasonId: string, format: string, stringsContent: any, overwrite: boolean, preserveFormat: boolean, errorHandler: any = this.handleError.bind(this,'importStringsByModeAsZip')) {

        // var url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstringswithformat?mode=${mode}&format=ANDROID&overwrite=${overwrite}`;
        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/importstringswithformat?mode=${mode}&format=${format}&overwrite=${overwrite}&preserveFormat=${preserveFormat}`;
        // let headers = new Headers({
        //    'Content-Type': 'multipart/form-data'});

        // let headers = new Headers({
        //    'Content-Type': 'application/zip'});

        // let headers = new Headers({
        //   'Content-Type': 'application/x-www-form-urlencoded'});

        const headers = new HttpHeaders();

        // stringsContent = Base64Utils.Base64.decode(stringsContent);
        // stringsContent = Base64.decode(stringsContent);
        // stringsContent = encodeURI(stringsContent);
        // stringsContent = encodeURIComponent(stringsContent);

        return this.http
            .put(url, stringsContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    validateCopyFeature(copiedFeatureId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'validateCopyFeature')) {
        return this.copyFeatureByMode('VALIDATE', copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

    copyFeature(copiedFeatureId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'copyFeature')) {
        return this.copyFeatureByMode('ACT', copiedFeatureId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

    validateCopyPurchase(copiedPurchaseId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'validateCopyPurchase')) {
        return this.copyPurchaseByMode('VALIDATE', copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

    copyPurchase(copiedPurchaseId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'copyPurchase')) {
        return this.copyPurchaseByMode('ACT', copiedPurchaseId, copiedBranchId, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

// PUT /admin/features/copy/branches/{source-branch-id}/{feature-id}/branches/{destination-branch-id}/{new-parent-id}
    copyFeatureByMode(mode: string, copiedFeatureId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'copyFeatureByMode')) {
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        let url = `${this.airlockFeaturesUrl}/copy/branches/${copiedBranchId}/${copiedFeatureId}/branches/${targetBranchId}/${parentId}?mode=${mode}`;
        if (suffix != null) {
            url += `&namesuffix=${suffix}`;
        }
        if (minAppVersion != null) {
            url += `&minappversion=${minAppVersion}`;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    copyPurchaseByMode(mode: string, copiedPurchaseId: string, copiedBranchId: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'copyPurchaseByMode')) {
        // var url = `${this.airlockFeaturesUrl}/copy/${copiedFeatureId}/${parentId}?mode=${mode}`;
        let url = `${this.airlockFeaturesUrl}/copy/branches/${copiedBranchId}/${copiedPurchaseId}/branches/${targetBranchId}/${parentId}?mode=${mode}`;
        if (suffix != null) {
            url += `&namesuffix=${suffix}`;
        }
        if (minAppVersion != null) {
            url += `&minappversion=${minAppVersion}`;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    importFeatureByMode(mode: string, featureContent: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'importFeatureByMode')) {
        // http://9.148.48.79:4545/airlock/api/admin/features/import/nid?mode=ACT&namesuffix=suf&minappaersion=app&overrideids=true
// PUT /admin/features/import/branches/{destination-branch-id}/{new-parent-id}
        let url = `${this.airlockFeaturesUrl}/import/branches/${targetBranchId}/${parentId}?mode=${mode}&overrideids=true`;
        if (suffix != null) {
            url += `&namesuffix=${suffix}`;
        }
        if (minAppVersion != null) {
            url += `&minappversion=${minAppVersion}`;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, featureContent, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    importFeature(featureContent: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'importFeature')) {
        return this.importFeatureByMode('ACT', featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

    validateImportFeature(featureContent: string, parentId: string, targetBranchId: string, suffix: string, minAppVersion: string, errorHandler: any = this.handleError.bind(this,'validateImportFeature')) {
        return this.importFeatureByMode('VALIDATE', featureContent, parentId, targetBranchId, suffix, minAppVersion, errorHandler);
    }

    getFeatures(season: Season, branch: Branch, errorHandler: any = this.handleError.bind(this,'getFeatures')) {
        // let url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        const url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/branches/${branch.uniqueId}/features`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => (response as any).root as Feature)
            .catch(errorHandler);
    }

    private extractContent(res: any, fileName: string) {
        const saveData = (function () {
            const a = document.createElement('a');
            document.body.appendChild(a);
            a.style.cssText = 'display: none';
            return function (data, fileName1) {
                const blob = new Blob([data], {type: 'octet/stream'}),
                    url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = fileName1;
                a.click();
                window.URL.revokeObjectURL(url);
            };
        }());
        saveData(res, fileName);
    }

    downloadSeasonFeatures(season: Season, errorHandler: any = this.handleError.bind(this,'downloadSeasonFeatures')) {
        const url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/features`;
        const options = this.addAuthToHeaders(new HttpHeaders());
        options['responseType'] = 'blob';
        let fileName = 'versionrange' + season.minVersion;
        if (season.maxVersion != null) {
            fileName += ' - ' + season.maxVersion;
        }
        fileName += '.json';
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response), fileName))
            .catch(errorHandler);
    }

    downloadFeature(feature: Feature, branch: Branch, errorHandler: any = this.handleError.bind(this,'downloadFeature')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/features/${feature.uniqueId}?includeStrings=true`;
        const fileName: string = feature.namespace + '_' + feature.name + '.json';

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response), fileName))
            .catch(errorHandler);
    }

    downloadEntitlement(feature: Feature, branch: Branch, errorHandler: any = this.handleError.bind(this,'downloadEntitlement')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/entitlements/${feature.uniqueId}?includeStrings=true`;
        const fileName: string = feature.namespace + '_' + feature.name + '.json';

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => this.extractContent(JSON.stringify(response), fileName))
            .catch(errorHandler);
    }

    getApiAbout(errorHandler: any = this.handleError.bind(this,'getApiAbout')) {
        const url = `${this.airlockAboutUrl}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getAllFeatures(product: Product, errorHandler: any = this.handleError.bind(this,'getAllFeatures')) {

        const url = `${this.airlockFeaturesUrl}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            })
            .catch(errorHandler);
    }

    getFeature(featureId: string, branchId: string = 'MASTER', errorHandler: any = this.handleError.bind(this,'getFeature')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${featureId}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Feature)
            .catch(errorHandler);
    }

    getInputSample(seasonId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getInputSample')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputsample?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getNotificationsOutputsample(seasonId: string, errorHandler: any = this.handleError.bind(this,'getNotificationsOutputsample')) {
        // /admin/products/seasons/{season-id}/notifications/outputsample
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/notifications/outputsample`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getStreamInputSample(seasonId: string, stageName: string, minAppVersionName: string, filter: string, errorHandler: any = this.handleError.bind(this,'getStreamInputSample')) {

        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams/eventsfieldsbyfilter?stage=${stageName}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, filter, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    getStreamFilterInputSample(seasonId: string, errorHandler: any = this.handleError.bind(this,'getStreamFilterInputSample')) {
        // POST /admin/products/seasons/{season-id}/streams/eventsfields
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams/eventsfields`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    getUtilitiesInfo(seasonId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getUtilitiesInfo')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getStreamUtilitiesInfo(seasonId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getStreamUtilitiesInfo')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}&type=STREAMS_UTILITY`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getPollInputSample(pollId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getPollInputSample')) {
        // GET /products/polls/{poll-id}/inputsample
        const url = `${this.airlockPollsUrl}/products/polls/${pollId}/inputsample?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getPollUtilitiesInfo(pollId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getPollUtilitiesInfo')) {
        // GET /products/polls/{poll-id}/utilitiesinfo
        const url = `${this.airlockPollsUrl}/products/polls/${pollId}/utilitiesinfo?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getExperimentInputSample(experimentId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getExperimentInputSample')) {
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/inputsample?stage=${stageName}&minappversion=${minAppVersionName}&generationmode=MAXIMAL`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getExperimentUtilitiesInfo(experimentId: string, stageName: string, minAppVersionName: string, errorHandler: any = this.handleError.bind(this,'getExperimentUtilitiesInfo')) {
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/utilitiesinfo?stage=${stageName}&minAppVerion=${minAppVersionName}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getFeatureAttributes(featureId: string, branchId: string, errorHandler: any = this.handleError.bind(this,'getFeatureAttributes')) {
        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${featureId}/attributes`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as FeatureAnalyticAttributes)
            .catch(errorHandler);
    }

    // ***************InAppPurchases*********************//
    getInAppPurchases(seasonId: string, branch: Branch, errorHandler: any = this.handleError.bind(this,'getInAppPurchases')) {
        const url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branch.uniqueId}/entitlements`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => (response as any).entitlementsRoot as InAppPurchase)
            .catch(errorHandler);
    }

    addInAppPurchase(purchase: InAppPurchase, seasonId: string, branchId: string, parentId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Feature> {

        const url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branchId}/entitlements?parent=${parentId}`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .post(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                purchase.uniqueId = (res as any).uniqueId;
                return purchase;
            })
            .catch(errorHandler);
    }

    addPurchaseOptions(purchaseOptions: PurchaseOptions, seasonId: string, branchId: string, parentId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Feature> {

        const url = `${this.airlockInAppPurchasesUrl}/seasons/${seasonId}/branches/${branchId}/entitlements?parent=${parentId}`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .post(url, JSON.stringify(purchaseOptions), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                purchaseOptions.uniqueId = (res as any).uniqueId;
                return purchaseOptions;
            })
            .catch(errorHandler);
    }

    getInAppPurchase(purchaseId: string, branchId: string, errorHandler: any = this.handleError.bind(this,'getInAppPurchase')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchaseId}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as InAppPurchase)
            .catch(errorHandler);
    }

    getPurchaseOption(purchaseOptionsId: string, branchId: string, errorHandler: any = this.handleError.bind(this,'getPurchaseOption')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchaseOptionsId}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as PurchaseOptions)
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
    deleteInAppPurchase(purchase: InAppPurchase, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateInAppPurchase(purchase: InAppPurchase, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<InAppPurchase> {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as InAppPurchase)
            .catch(errorHandler);
    }

    deletePurchaseOptions(purchase: PurchaseOptions, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updatePurchaseOptions(purchase: PurchaseOptions, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<PurchaseOptions> {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/entitlements/${purchase.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(purchase), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as PurchaseOptions)
            .catch(errorHandler);
    }


    // ***************Experiments*********************//

    getExperiments(productId: string, errorHandler: any = this.handleError.bind(this,'getExperiments')) {
        const url = `${this.airlockAnalyticsUrl}/products/${productId}/experiments?includeindexinginfo=true`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as ExperimentsContainer)
            .catch(errorHandler);
    }

    getExperimentIndexingInfo(experimentId: string, errorHandler: any = this.handleError.bind(this,'getExperimentIndexingInfo')) {
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/indexinginfo`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as IndexingInfo)
            .catch(errorHandler);
    }

    resetDashboard(experimentId: string, errorHandler: any = this.handleError.bind(this,'resetDashboard')) {
        // PUT /analytics/products/experiments/{experiment-id}/resetdashboard
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/resetdashboard`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    updateExperiments(container: ExperimentsContainer, errorHandler: any = this.handleError.bind(this,'updateExperiments')) {
        const url = `${this.airlockAnalyticsUrl}/products/${container.productId}/experiments`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(container), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as ExperimentsContainer)
            .catch(errorHandler);
    }

    createExperiment(productId: string, experiment: Experiment, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Experiment> {
        const url = `${this.airlockAnalyticsUrl}/products/${productId}/experiments`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(experiment), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                experiment.uniqueId = (res as any).uniqueId;
                return experiment;
            })
            .catch(errorHandler);
    }

    getDataImports(productId: string, errorHandler: any = this.handleError.bind(this,'getDataImports')) {
        // GET /admin/airlytics/products/{product-id}/dataimport
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/dataimport`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as DataimportsData)
            .catch(errorHandler);
    }

    getDataImport(jobId: string, errorHandler: any = this.handleError.bind(this,'getDataImport')) {
        // GET /admin/airlytics/dataimport/{job-id}
        const url = `${this.airlockAirlyticsUrl}/dataimport/${jobId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Dataimport)
            .catch(errorHandler);
    }

    createDataImport(productId: string, dataimport: Dataimport, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Dataimport> {
        // POST /admin/airlytics/products/{product-id}/dataimport
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/dataimport`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(dataimport), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                dataimport.uniqueId = (res as any).uniqueId;
                return dataimport;
            })
            .catch(errorHandler);
    }

    updateDataimportsData(importsData: DataimportsData, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // PUT /admin/airlytics/products/{product-id}/dataimport
        const url = `${this.airlockAirlyticsUrl}/products/${importsData.productId}/cohorts`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(importsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }


    deleteDataimport(jobId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockAirlyticsUrl}/dataimport/${jobId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getPolls(productId: string, errorHandler: any = this.handleError.bind(this,'getPolls')) {
        // GET /polls/products/{product-id}/polls
        const url = `${this.airlockPollsUrl}/products/${productId}/polls`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise<any>()
            .then(response => response as AirlockPolls)
            .catch(errorHandler);
    }

    updatePolls(airlockPolls: AirlockPolls, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<AirlockPolls> {
        // PUT /polls/products/{product-id}/polls
        const url = `${this.airlockPollsUrl}/products/${airlockPolls.productId}/polls`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(airlockPolls), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as AirlockPolls)
            .catch(errorHandler);
    }

    createPoll(productId: string, poll: Poll, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Poll> {
        const url = `${this.airlockPollsUrl}/products/${productId}/polls`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(poll), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                poll.uniqueId = (res as any).uniqueId;
                return poll;
            })
            .catch(errorHandler);
    }

    updatePoll(poll: Poll, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Poll> {
        // PUT /polls/products/polls/{poll-id}
        const url = `${this.airlockPollsUrl}/products/polls/${poll.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(poll), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Poll)
            .catch(errorHandler);
    }

    deletePoll(pollId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // DELETE /polls/products/polls/{poll-id}
        const url = `${this.airlockPollsUrl}/products/polls/${pollId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updatePollQuestion(question: Question, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Question> {
        // PUT /polls/products/polls/questions/{question-id}
        const url = `${this.airlockPollsUrl}/products/polls/questions/${question.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(question), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Question)
            .catch(errorHandler);
    }

    getPollQuestion(questionId: string, errorHandler: any = this.handleError.bind(this,'getPollQuestion')) {
        // GET /polls/products/questions/{question-id}
        const url = `${this.airlockPollsUrl}/products/polls/questions/${questionId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise<any>()
            .then(response => response as Question)
            .catch(errorHandler);
    }

    deletePollQuestion(questionId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // DELETE /polls/products/questions/{question-id}
        const url = `${this.airlockPollsUrl}/products/polls/questions/${questionId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    createPollQuestion(pollId: string, question: Question, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // POST /polls/products/polls/{poll-id}/questions
        const url = `${this.airlockPollsUrl}/products/polls/${pollId}/questions`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(question), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                question.uniqueId = (res as any).uniqueId;
                return question;
            })
            .catch(errorHandler);
    }

    getPoll(pollId: string, errorHandler: any = this.handleError.bind(this,'getPoll')) {
        // GET /polls/products/polls/{poll-id}
        const url = `${this.airlockPollsUrl}/products/polls/${pollId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise<any>()
            .then(response => response as Poll)
            .catch(errorHandler);
    }

    getCohorts(productId: string, errorHandler: any = this.handleError.bind(this,'getCohorts')) {
        // GET /admin/airlytics/products/{product-id}/cohorts
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/cohorts`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as CohortsData)
            .catch(errorHandler);
    }

    getCohort(cohortId: string, errorHandler: any = this.handleError.bind(this,'getCohort')) {
        // GET /admin/airlytics/cohorts/{cohort-id}
        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohortId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Cohort)
            .catch(errorHandler);
    }

    getCohortsDbColumns(productId: string, errorHandler: any = this.handleError.bind(this,'getCohortsDbColumns')) {
        // GET /admin/airlytics/cohorts/meta/users/columns
        // GET /admin/airlytics/products/{product-id}/cohorts/meta/users/columns
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/cohorts/meta/users/columns`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    validateCohortQuery(productId: string, queryCondition: string, queryAdditionalValue: string, joinedTables: string[], exportType: string, errorHandler: any = this.handleError.bind(this,'validateCohortQuery')) {
        // POST /admin/airlytics/products/{product-id}/cohorts/validate
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/cohorts/validate`;
        const headers = new HttpHeaders();
        const validationObj = {
            'exportType': exportType,
            'queryCondition': queryCondition,
            'queryAdditionalValue': queryAdditionalValue,
            'joinedTables': joinedTables,
        };
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(validationObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res as AirCohortsResponse;
            })
            .catch(errorHandler);
    }

    validateCohortQueryBeforeSave(productId: string, queryCondition: string, queryAdditionalValue: string, joinedTables: string[], exportType: string, errorHandler: any = this.handleError.bind(this,'validateCohortQueryBeforeSave')) {
        // POST /admin/airlytics/products/{product-id}/cohorts/validate
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/cohorts/validateQuery`;
        const headers = new HttpHeaders();
        const validationObj = {
            'exportType': exportType,
            'queryCondition': queryCondition,
            'queryAdditionalValue': queryAdditionalValue,
            'joinedTables': joinedTables,
        };
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(validationObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return res as AirCohortsResponse;
            })
            .catch(errorHandler);
    }

    createCohort(productId: string, cohort: Cohort, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Cohort> {
        const url = `${this.airlockAirlyticsUrl}/products/${productId}/cohorts`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(cohort), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                cohort.uniqueId = (res as any).uniqueId;
                return cohort;
            })
            .catch(errorHandler);
    }

    updateCohort(cohort: Cohort, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Cohort> {
        // admin/airlytics/cohorts/{cohort-id}
        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohort.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(cohort), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Cohort)
            .catch(errorHandler);
    }

    exportCohort(cohort: Cohort, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Cohort> {
        // PUT /admin/airlytics/cohorts/{cohort-id}/execute
        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohort.uniqueId}/execute`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, '{}', this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Cohort)
            .catch(errorHandler);
    }

    updateCohortsData(cohortsData: CohortsData, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // PUT /admin/airlytics/products/{product-id}/cohorts
        const url = `${this.airlockAirlyticsUrl}/products/${cohortsData.productId}/cohorts`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(cohortsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }


    deleteCohort(cohortId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohortId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    deleteCohortExport(cohortId: string, exportKey: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        /// cohorts/{cohort-id}/export/{export-key}
        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohortId}/export/${exportKey}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    renameCohortExport(cohortId: string, exportKey: string, oldExportName: string, newExportName: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockAirlyticsUrl}/cohorts/${cohortId}/rename`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        const requestObj = {'exportKey': exportKey, 'oldExportName': oldExportName, 'newExportName': newExportName};
        return this.http
            .put(url, JSON.stringify(requestObj), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    createStream(seasonId: string, stream: Stream, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Stream> {
        // POST /admin/products/seasons/{season-id}/streams
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, JSON.stringify(stream), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                stream.uniqueId = (res as any).uniqueId;
                return stream;
            })
            .catch(errorHandler);
    }

    updateStream(stream: Stream, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Stream> {
        const url = `${this.airlockProductsUrl}/seasons/streams/${stream.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(stream), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Stream)
            .catch(errorHandler);
    }

    updateStreamsData(seasonId: string, streamsData: StreamsData, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<StreamsData> {
        // PUT /admin/products/seasons/{season-id}/streams
        streamsData.streams = undefined;

        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .put(url, JSON.stringify(streamsData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                return streamsData;
            })
            .catch(errorHandler);
    }

    getBranchUsage(seasonId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/branchesusage`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => JSON.stringify(response, null, 2))
            .catch(errorHandler);
    }

    deleteStream(streamId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockProductsUrl}/seasons/streams/${streamId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getStreams(seasonId: string, errorHandler: any = this.handleError.bind(this,'getStreams')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/streams`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as StreamsData)
            .catch(errorHandler);
    }

    getExperiment(experimentId: string, errorHandler: any = this.handleError.bind(this,'getExperiment')) {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}?includeindexinginfo=true`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Experiment)
            .catch(errorHandler);
    }

    updateExperiment(experiment: Experiment, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Experiment> {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experiment.uniqueId}`;
        // remove indexing info if exsits
        experiment.indexingInfo = undefined;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(experiment), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Experiment)
            .catch(errorHandler);
    }

    deleteExperiment(experimentId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    addVariant(variant: Variant, experimentId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Variant> {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/variants/`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .post(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                variant.uniqueId = (res as any).uniqueId;
                return variant;
            })
            .catch(errorHandler);
    }

    getVariant(variantId: string, errorHandler: any = this.handleError.bind(this,'getVariant')) {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variantId}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Variant)
            .catch(errorHandler);
    }

    updateVariant(variant: Variant, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Variant> {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variant.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(variant), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Variant)
            .catch(errorHandler);
    }

    deleteVariant(variantId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockAnalyticsUrl}/products/experiments/variants/${variantId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    // ***************Branches*********************//
    addBranch(branch: Branch, sourceBranchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Branch> {

        const url = `${this.airlockProductsUrl}/seasons/${branch.seasonId}/${sourceBranchId}/branches`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .post(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                branch.uniqueId = (res as any).uniqueId;
                return branch;
            })
            .catch(errorHandler);
    }

    getBranches(seasonId: string, errorHandler: any = this.handleError.bind(this,'getBranches')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/branches`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then((response) => {
                let branches = (response as any).branches as Branch[];
                branches = branches.sort((n1, n2) => {
                    // put master on top - otherwise sort alphabetically
                    if (n1.name.toLowerCase() === 'master') {
                        return -1;
                    }
                    if (n2.name.toLowerCase() === 'master') {
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

    getBranch(branchId: string, errorHandler: any = this.handleError.bind(this,'getBranch')) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Branch)
            .catch(errorHandler);
    }

    updateBranch(branch: Branch, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Branch> {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(branch), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Branch)
            .catch(errorHandler);
    }

    deleteBranch(branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {

        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getAvailableBranches(experimentId: string, errorHandler: any = this.handleError.bind(this,'getAvailableBranches')) {
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/availablebranches`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then((response) => {
                const availableBranches = response as AvailableBranches;
                availableBranches.availableInAllSeasons = availableBranches.availableInAllSeasons.sort((n1, n2) => {
                    // put master on top - otherwise sort alphabetically
                    if (n1.toLowerCase() === 'master') {
                        return -1;
                    }
                    if (n2.toLowerCase() === 'master') {
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

    checkoutFeature(branch: Branch, feature: Feature, errorHandler: any = this.handleError.bind(this,'checkoutFeature')) {
        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/checkout/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    cancelCheckoutFeature(branch: Branch, feature: Feature, includeSubFeatures: boolean = false, errorHandler: any = this.handleError.bind(this,'cancelCheckoutFeature')) {
        const mode = includeSubFeatures ? 'INCLUDE_SUB_FEATURES' : 'STAND_ALONE';
        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/cancelcheckout/${feature.uniqueId}?mode=${mode}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http.put(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    getAnalyticsGlobalDataCollection(seasonId: string, branchId: string, errorHandler: any = this.handleError.bind(this,'getAnalyticsGlobalDataCollection')) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Analytic)
            .catch(errorHandler);
    }

    getAnalyticsForDisplay(seasonId: string, branchId: string, errorHandler: any = this.handleError.bind(this,'getAnalyticsForDisplay')) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}/?mode=DISPLAY`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as AnalyticsDisplay)
            .catch(errorHandler);
    }

    getAnalyticsGlobalDataCollectionExperiment(experimentId: string, errorHandler: any = this.handleError.bind(this,'getAnalyticsGlobalDataCollectionExperiment')) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/experiments/${experimentId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as Analytic)
            .catch(errorHandler);
    }

    getAnalyticsForDisplayExperiment(experimentId: string, errorHandler: any = this.handleError.bind(this,'getAnalyticsForDisplayExperiment')) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/experiments/${experimentId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as AnalyticsExperiment)
            .catch(errorHandler);
    }

    getQuota(seasonId: string, errorHandler: any = this.handleError.bind(this,'getQuota')) {
        const url = `${this.airlockAnalyticsUrl}/${seasonId}/quota`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as AnalyticsQuota)
            .catch(errorHandler);
    }

    getExperimentQuota(experimentId: string, errorHandler: any = this.handleError.bind(this,'getExperimentQuota')) {
        const url = `${this.airlockAnalyticsUrl}/products/experiments/${experimentId}/quota`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as AnalyticsExperimentQuota)
            .catch(errorHandler);
    }

    updateAnalyticsGlobalDataCollection(seasonId: string, branchId: string, analyticData: Analytic, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Analytic> {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/${seasonId}/branches/${branchId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(analyticData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => analyticData)
            .catch(errorHandler);
    }

    updateFeatureSendToAnalytic(feature: Feature, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/branches/${branchId}/feature/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, feature, this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    deleteFeatureSendToAnalytic(feature: Feature, branchId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockAnalyticsUrl}/globalDataCollection/branches/${branchId}/feature/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => feature)
            .catch(errorHandler);

    }

    update(feature: Feature, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Feature> {
        const url = `${this.airlockProductsUrl}/seasons/features/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => feature)
            .catch(errorHandler);
    }


    updateFeature(feature: Feature, branchId: string = 'MASTER', errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Feature> {
        const url = `${this.airlockProductsUrl}/seasons/branches/${branchId}/features/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as Feature)
            .catch(errorHandler);
    }

    deleteFeature(feature: Feature, branch: Branch, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/branches/${branch.uniqueId}/features/${feature.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    deleteStringToTranslation(stringId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    addStringToTranslationWithMode(seasonId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this), validate: boolean) {
        const mode = validate ? this.addStringValidateMode : this.addStringActMode;
        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/strings?mode=${mode}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .post(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    addStringToTranslation(seasonId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        return this.addStringToTranslationWithMode(seasonId, stringData, errorHandler, false);
    }

    validateAddStringToTranslation(seasonId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        return this.addStringToTranslationWithMode(seasonId, stringData, errorHandler, true);
    }

    updateStringToTranslationWithMode(stringId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this), validate: boolean) {
        const url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;
        if (validate) {
            stringData['mode'] = this.addStringValidateMode;
        } else {
            stringData['mode'] = this.addStringActMode;
        }
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .put(url, JSON.stringify(stringData), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    updateStringToTranslation(stringId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        return this.updateStringToTranslationWithMode(stringId, stringData, errorHandler, false);
    }

    validateUpdateStringToTranslation(stringId: string, stringData: any, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        return this.updateStringToTranslationWithMode(stringId, stringData, errorHandler, true);
    }

    markStringForTranslation(seasonId: string, ids: Array<String> = [], errorHandler: any = this.handleError.bind(this,'markStringForTranslation')) {
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/markfortranslation`;
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    addIdsToUrl(_url: string, ids: Array<String>) {
        let url = _url;
        let isFirst: boolean = true;
        if (ids && ids != null) {
            for (const id of ids) {
                if (!isFirst && id) {
                    url += '&ids=' + id;
                } else {
                    url += '?ids=' + id;
                    isFirst = false;
                }
            }
        }
        return url;
    }

    reviewStringForTranslation(seasonId: string, ids: Array<String> = [], errorHandler: any = this.handleError.bind(this,'reviewStringForTranslation')) {
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/completereview`;
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    sendStringForTranslation(seasonId: string, ids: Array<String> = [], errorHandler: any = this.handleError.bind(this,'sendStringForTranslation')) {
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/sendtotranslation`;
        url = this.addIdsToUrl(url, ids);
        return this.http.put(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                return response;
            }).catch(errorHandler);
    }

    getStringsToTranslationForSeason(seasonId: string, errorHandler: any = this.handleError.bind(this,'getStringsToTranslationForSeason')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/translate/summary`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                let translations = (response as any).translationSummary as StringToTranslate[];
                translations = translations.sort((n1, n2) => {
                    if (n1.lastModified < n2.lastModified) {
                        return 1;
                    }

                    if (n1.lastModified > n2.lastModified) {
                        return -1;
                    }
                    return 0;
                });
                return translations;
            })
            .catch(errorHandler);
    }

    overrideStringToTranslation(stringId: string, locale: string, newValue: string, errorHandler: any = this.handleError.bind(this,'overrideStringToTranslation')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${stringId}/overridetranslate/${locale}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        return this.http
            .put(url, newValue, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    cancelOverrideStringToTranslation(stringId: string, locale: string, errorHandler: any = this.handleError.bind(this,'cancelOverrideStringToTranslation')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${stringId}/canceloverride/${locale}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .put(url, '', this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                // feature.uniqueId = (res as any).uniqueId;
                return res;
            })
            .catch(errorHandler);
    }

    getStringsToTranslationForStringIds(seasonId: string, ids: Array<String> = null, locales: Array<String> = null, showTranslation: boolean = false, errorHandler: any = this.handleError.bind(this,'getStringsToTranslationForStringIds')) {
        let url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/translate/summary?showtranslations=` + showTranslation;
        if (ids && ids != null) {
            for (const id of ids) {
                if (id) {
                    url += '&ids=' + id;
                }
            }
        }
        if (locales && locales != null) {
            for (const curLocale of locales) {
                if (curLocale) {
                    url += '&locales=' + curLocale;
                }
            }
        }

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                let translations = (response as any).translationSummary as StringToTranslate[];
                translations = translations.sort((n1, n2) => {
                    if (n1.lastModified < n2.lastModified) {
                        return 1;
                    }
                    if (n1.lastModified > n2.lastModified) {
                        return -1;
                    }
                    return 0;
                });
                return translations;
            })
            .catch(errorHandler);
    }

    getStringFullInformation(stringId: String, errorHandler: any = this.handleError.bind(this,'getStringFullInformation')) {
        const url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getStringsForFeature(featureId: string, errorHandler: any = this.handleError.bind(this,'getStringsForFeature')) {
        // http://9.148.48.79:4545/airlock/api/translations/seasons/967ef44d-0714-4f1e-a0c1-3c8c9adadf32/stringsinuse
        const url = `${this.airlockTranslationsUrl}/seasons/${featureId}/stringsinuse`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => {
                const translations = response;
                return translations;
            })
            .catch(errorHandler);
    }

    addFeature(feature: Feature, seasonId: string, branchId: string, parentId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Feature> {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/branches/${branchId}/features?parent=${parentId}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .post(url, JSON.stringify(feature), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                feature.uniqueId = (res as any).uniqueId;
                return feature;
            })
            .catch(errorHandler);
    }

    addProduct(product: Product, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Product> {
        const url = `${this.airlockProductsUrl}`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .post(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                product.uniqueId = (res as any).uniqueId;
                return product;
            })
            .catch(errorHandler);
    }

    addSeason(season: Season, productId: string, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Season> {
        const url = `${this.airlockProductsUrl}/${productId}/seasons`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http
            .post(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                season.uniqueId = (res as any).uniqueId;
                return season;
            })
            .catch(errorHandler);
    }

    updateSeason(season: Season, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(season), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => season)
            .catch(errorHandler);
    }

    deleteSeason(seasonId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateProduct(product: Product, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Product> {
        const url = `${this.airlockProductsUrl}/${product.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(product), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => product)
            .catch(errorHandler);
    }


    getInputSchema(seasonId: string, errorHandler: any = this.handleError.bind(this,'getInputSchema')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputschema`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    validateInputSchema(seasonId: string, inputScheama: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/inputschema/validate`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, inputScheama, this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getUtilities(seasonId: string, errorHandler: any = this.handleError.bind(this,'getUtilities')) {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/utilities`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => (response as any).utilities)
            .catch(errorHandler);
    }

    createUtil(util: Utility, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${util.seasonId}/utilities?stage=${util.stage}&type=${util.type}&name=${encodeURIComponent(util.name)}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, util.utility, this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => util)
            .catch(errorHandler);
    }

    updateUtil(util: Utility, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/utilities/${util.uniqueId}?stage=${util.stage}&lastmodified=${util.lastModified}&name=${encodeURIComponent(util.name)}`;
        const headers = new HttpHeaders();
        return this.http
            .put(url, util.utility, this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    deleteUtil(utilId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/utilities/${utilId}`;
        return this.http
            .delete(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    updateInputSchema(inputScheama: any, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/${inputScheama.seasonId}/inputschema`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(inputScheama), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => inputScheama)
            .catch(errorHandler);
    }

    getUserGroups(product: Product, errorHandler: any = this.handleError.bind(this,'getUserGroups')) {
        const url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        // return this.http.get(url, this.addAuthToHeaders(headers))
        return this.http.get(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then((response) => {
                    const groups = response as UserGroups;
                    if (groups && groups.internalUserGroups) {
                        groups.internalUserGroups = groups.internalUserGroups.sort((n1, n2) => {
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
                },
            )
            .catch(errorHandler);
    }

    getUserGroupsUsage(product: Product, errorHandler: any = this.handleError.bind(this,'getUserGroupsUsage')) {
        const url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups/usage`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getEncryptionKey(season: Season, errorHandler: any = this.handleError.bind(this,'getEncryptionKey)')) {
        const url = `${this.airlockBaseApiUrl}/products/seasons/${season.uniqueId}/encryptionkey`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getConstantsFileContent(platform: string, seasonId: string, errorHandler: any = this.handleError.bind(this,'getConstantsFileContent)')) {
        const url = `${this.airlockBaseApiUrl}/products/seasons/${seasonId}/constants?platform=${platform}`;
        console.log("getConstantsFileContent :" + url);

        // let headers = this.addAuthToHeaders(new HttpHeaders());
        return this.http.get(url,this.addHeadersForConstants())
        // return this.http.get(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response.toString())
            .catch(errorHandler);
    }

    getDefaultsFileContent(seasonId: string, errorHandler: any = this.handleError.bind(this,'getDefaultsFileContent)')) {
        const url = `${this.airlockBaseApiUrl}/products/seasons/${seasonId}/defaults`;
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
        });
        return this.http.get(url, this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    updateUserGroups(product: Product, userGroups: UserGroups, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockBaseApiUrl}/products/${product.uniqueId}/usergroups`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(userGroups), this.addAuthToHeaders(headers))
            .toPromise()
            .then(() => userGroups)
            .catch(errorHandler);
    }

    private handleError(caller: string = null, error: any) {
        try {
            if (caller != null) {
                console.error('error triggered from ' + caller);
            }
            console.log(error);
            this.navigateToLoginIfSessionProblem(error);
        } catch (e) {
            console.log(e);
        }
        let errorMessage = error.error?.error || error._body || error.message || 'Request failed, try again later.';
        error._body = errorMessage;
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if ((error.status === 404 && error.statusText) || (error._body && typeof error._body === 'string' && error._body.startsWith('<!DOCTYPE html>'))) {
            errorMessage = `Request failed, try again later. (${error.status} ${error.statusText})`;
            error._body = errorMessage;
            // return Promise.reject(errorMessage);
        }
        return Promise.reject(error);
    }

    public navigateToLoginIfSessionProblem(error: any) {
        try {
            if (error === null) {
                return;
            }
            console.log('********* navigateToLoginIfSessionProblem');
            console.log(error);
            console.log(error.status);
            console.log("message:" + error.message);
            console.log("error.error?:" + error.error);
            try {
                const jsonObj = JSON.parse(error.error);
                if (jsonObj.error) {
                    console.log("jsonObj.error:" + jsonObj.error);
                } else {
                    console.log("jsonObj.error is nulll");
                }
            } catch (e){
                console.log(e.message);
            }
            console.log("error.error?.error:" + error.error?.error);
            let body = error.error?.error;

            if (body && error.status === 401 && ((typeof body === 'string' && (body.indexOf('expired') !== -1 || body.indexOf('JWT') !== -1)))) {
                console.log('logOut');
                // this.jwtToken = "";
                // this.deleteCookie("jwt");
                this.deleteSessionJwt();
                const str = window.location.href;
                const ind = str.lastIndexOf('#');
                const prefix = str.substring(0, ind);
                window.location.href = prefix + 'auth/login';
                return;
            }
        } catch (e) {
            console.log("exception in navigateToLoginIfSessionProblem:" + e);
        }
    }

    private deleteSessionJwt() {
        this.setSessionJwt("");
    }

    private handleErrorAndShow(error: any) {
        console.log('handleErrorAndShow');
        if (this.isAngularJsonBug(error)) {
            return;
        }
        try {
            console.log('*********');
            console.log(this);
            this.navigateToLoginIfSessionProblem(error);
        } catch (e) {
            console.log(e);
        }
        const errorMessage = error._body || error.error?.error ||  'Request failed, try again later.';
        console.error('An error occurred:', errorMessage);
        console.error(error);

        return Promise.reject(error);

    }

    private isAngularJsonBug(error: any) {
        //see https://github.com/angular/angular/issues/18396 for bug description
        const JsonParseError = 'Http failure during parsing for';
        const matches = error.message.match(new RegExp(JsonParseError, 'ig'));
        if (error.status === 200 && matches.length === 1) {
            return true;
        }
        return false;
    }

    private _handleError(error: any, show: boolean = false) {
        console.log('_handleError');
        try {
            console.log('*********');
            console.log(error);
            console.log(error._body);
            console.log(error.status);
            if ((error._body != null && error.status === 401 && (error._body.indexOf('expired') !== -1)) || (error._body != null && error._body.toLowerCase().indexOf('jwt') !== -1)) {
                // this.deleteCookie("jwt");
                const str = window.location.href;
                const ind = str.lastIndexOf('#');
                const prefix = str.substring(0, ind);
                window.location.href = prefix + 'auth/login';
                return;
            }
        } catch (e) {
            console.log(e);
        }
        const errorMessage = error._body || 'Request failed, try again later.';
        console.error('An error occurred:', errorMessage);
        console.error(error);
        if (show === true) {
            alert(errorMessage);
        }
        return Promise.reject(error.message || error);
    }


    // notificatins
    subscribe(event: string, callback: Function) {
        const subscribers = this._subscriptions.get(event) || [];
        subscribers.push(callback);
        this._subscriptions.set(event, subscribers);
    }

    _onEvent(data: any) {
        const subscribers = this._subscriptions.get(data['event']) || [];
        subscribers.forEach((callback) => {
            callback.call(null, data['data']);
        });
    }

    notifyDataChanged(event, value) {
        this._data[event] = value;

        this._data.next({
            event: event,
            data: this._data[event],
        });
        if (event.startsWith('error')) {
            this.toastrService.danger(value, 'Error', {
                duration: 20000,
                position: NbGlobalLogicalPosition.BOTTOM_START,
                preventDuplicates: true,
                toastClass: 'big-toast'
            });
        } else {
            this.toastrService.success(value.message, value.title, {
                duration: 10000,
                position: NbGlobalLogicalPosition.BOTTOM_END,
                preventDuplicates: true,
                // //toastClass: 'airlock-toast simple-webhook bare toast',
            });
        }
    }

    getJWT() {
        return this.jwtToken;
    }

    isHaveJWTToken() {
        return (this.jwtToken != null && this.jwtToken.length > 0);
    }

    followProduct(productId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/${productId}/follow`;
        return this.http
            .post(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    unfollowProduct(productId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/${productId}/follow`;
        return this.http
            .delete(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    followFeature(featureId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/features/${featureId}/follow`;
        return this.http
            .post(url, '', this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    unfollowFeature(featureId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/features/${featureId}/follow`;
        return this.http
            .delete(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(res => res)
            .catch(errorHandler);
    }

    parseErrorMessage(error: any, defaultMessage: string): string {
        let errorMessage = error.error?.error || error.message || error._body || defaultMessage;
        try {
            const jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && (typeof errorMessage === 'string' || errorMessage instanceof String) && errorMessage.indexOf('{') === 0 && errorMessage.indexOf('}') === errorMessage.length - 1) {
                errorMessage = errorMessage.substring(1, errorMessage.length - 1);
            }
        }
        return errorMessage;
    }

    parseErrorMessageB(error: any, defaultMessage: string): string {
        let errorMessage = error._body || defaultMessage;
        try {
            const jsonObj = JSON.parse(errorMessage);
            if (jsonObj.error) {
                errorMessage = jsonObj.error;
            }
        } catch (err) {
            if (errorMessage != null && errorMessage.indexOf('{"error":') === 0 && errorMessage.indexOf('}') === errorMessage.length - 1) {
                errorMessage = errorMessage.substring(9, errorMessage.length - 1);
            }
        }
        return errorMessage;
    }

    getStringIssue(stringId: string, locale: string, errorHandler: any = this.handleError.bind(this,'getDefaultsFileContent)')) {
        const url = `${this.airlockTranslationsUrl}/seasons/strings/${stringId}/locale/${locale}/issues`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    createNewStringIssue(stringId: string, locale: string, issueText: string, issueType: string, issueSubType: string, errorHandler: any = this.handleError.bind(this,'createNewStringIssue)')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${stringId}/issues/${locale}`;
        const issue = {};
        issue['issueTypeCode'] = issueType;
        issue['issueSubTypeCode'] = issueSubType;
        issue['issueText'] = issueText;
        return this.http.post(url, JSON.stringify(issue), this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    addStringIssueComment(seasonId: string, issueId: string, comment: any, errorHandler: any = this.handleError.bind(this,'addStringIssueComment)')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/issue/${issueId}`;
        return this.http.put(url, JSON.stringify(comment), this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(() => comment)
            .catch(errorHandler);
    }

    changeIssueState(seasonId: string, issueId: string, isOpen: boolean, errorHandler: any = this.handleError.bind(this,'changeIssueState)')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${seasonId}/issue/${issueId}`;
        const newStateJson = {};
        newStateJson['setOpenStatus'] = isOpen;
        return this.http.put(url, JSON.stringify(newStateJson), this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then()
            .catch(errorHandler);
    }


    getStringUsage(stringId: string, errorHandler: any = this.handleError.bind(this,'getStringUsage)')) {
        const url = `${this.airlockTranslationsUrl}/seasons/${stringId}/stringusage`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response)
            .catch(errorHandler);
    }

    getNotifications(season: Season, errorHandler: any = this.handleError.bind(this,'getNotifications)')) {
        const url = `${this.airlockProductsUrl}/seasons/${season.uniqueId}/notifications`;
        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => response as AirlockNotifications)
            .catch(errorHandler);
    }


    updateoNotifications(notifications: AirlockNotifications, errorHandler: any = this.handleError.bind(this,'updateoNotifications)')) {
        const url = `${this.airlockProductsUrl}/seasons/${notifications.seasonId}/notifications`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notifications), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as AirlockNotifications)
            .catch(errorHandler);
    }

    updateNotification(notification: AirlockNotification, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<AirlockNotification> {
        const url = `${this.airlockProductsUrl}/seasons/notifications/${notification.uniqueId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .put(url, JSON.stringify(notification), this.addAuthToHeaders(headers))
            .toPromise()
            .then(response => response as AirlockNotification)
            .catch(errorHandler);
    }

    createNotification(seasonId: string, notification: AirlockNotification, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<AirlockNotification> {
        const url = `${this.airlockProductsUrl}/seasons/${seasonId}/notifications`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .post(url, JSON.stringify(notification), this.addAuthToHeaders(headers))
            .toPromise()
            .then(res => {
                notification.uniqueId = (res as any).uniqueId;
                return notification;
            })
            .catch(errorHandler);
    }

    deleteNotification(notificationId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        const url = `${this.airlockProductsUrl}/seasons/notifications/${notificationId}`;
        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');
        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    getWebhooks(errorHandler: any = this.handleError.bind(this,'getWebhooks)')) {
        const url = `${this.airlockOpsUrl}/webhooks`;

        return this.http.get(url, this.addAuthToHeaders(new HttpHeaders()))
            .toPromise()
            .then(response => (response as any).webhooks as Webhook[])
            .catch(errorHandler);
    }

    createWebhook(webhook: Webhook, errorHandler: any = this.handleErrorAndShow.bind(this)): Promise<Webhook> {
        // POST /ops/webhooks
        const url = `${this.airlockOpsUrl}/webhooks`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .post(url, JSON.stringify(webhook), this.addAuthToHeaders(headers))
            .toPromise<any>()
            .then(res => {
                return res;
            })
            .catch(errorHandler);
    }

    deleteWebhook(webhookId: string, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // DELETE /ops/webhooks/{webhook-id}
        const url = `${this.airlockOpsUrl}/webhooks/${webhookId}`;

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'application/json');

        return this.http
            .delete(url, this.addAuthToHeaders(headers))
            .toPromise()
            .catch(errorHandler);
    }

    updateWebhook(webhook: Webhook, errorHandler: any = this.handleErrorAndShow.bind(this)) {
        // PUT /ops/webhooks/{webhook-id}
        const url = `${this.airlockOpsUrl}/webhooks/${webhook.uniqueId}`;

        const headers = new HttpHeaders();
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

    redirectToFeaturesPage() {
        this.router.navigate(['/pages/features']);

    }

    setHasAdminProds(has: boolean) {
        console.log("setHasAdminProds : " + has);
        this.hasAdminProds = has;
        this.refreshMenu();
    }

    getHasAdminProds() {
        console.log("getHasAdminProds : " + this.hasAdminProds);
        return this.hasAdminProds;
    }

    canViewPage(menuPathOrTitle: string): boolean {
        if (menuPathOrTitle === 'Administration' || menuPathOrTitle === 'products'
            || (menuPathOrTitle === 'groups'
            )
            || menuPathOrTitle === 'Airlock' || menuPathOrTitle === '') {
            return true;
        }
        if (menuPathOrTitle === 'Airlytics') {
            return (this.capabilities.includes('COHORTS') || this.capabilities.includes('DATA_IMPORT'));
        }
        if (menuPathOrTitle === 'entitlements') {
            return true;
        }
        if (menuPathOrTitle === 'authorization') {
            return this.hasAdminProds;
        }
        if (menuPathOrTitle === 'webhooks') {
            return this.isAdministrator();
        }
        if (menuPathOrTitle === 'dataimport') {
            menuPathOrTitle = 'DATA_IMPORT';
        }
        if (this.capabilities === undefined) {
            return true;
        }
        return this.capabilities.includes(menuPathOrTitle.toUpperCase());
    }

    refreshMenu() {
        // this._menuService.refreshMenu();
        if (this._menu == null) {
            return;
        }
        for (const menu of this._menu[0].children) {
            let menuPathOrTitle;
            if (typeof menu['path'] !== 'undefined') {
                menuPathOrTitle = menu['path'];
            } else {
                menuPathOrTitle = menu.data.menu.title;
            }
            menu.data.menu.hidden = !this.canViewPage(menuPathOrTitle);
            if (menu.children) {
                for (const child of menu.children) {
                    let childPathOrTitle;
                    if (typeof child['path'] !== 'undefined') {
                        childPathOrTitle = child['path'];
                    } else {
                        childPathOrTitle = child.data.menu.title;
                    }
                    child.data.menu.hidden = !this.canViewPage(childPathOrTitle);
                }
            }
        }
        // this._menuService.updateMenuByRoutes(this._menu);TODO Eitan
    }
}
