import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {AirlockService} from "./services/airlock.service";
import {Season} from "./model/season";
import {Product} from "./model/product";
import {Branch} from "./model/branch";
import {NbMenuService} from "@nebular/theme";
import {takeUntil} from "rxjs/operators";

export class CallBackWithCaller {
    constructor(public caller: string, public callback: Function) {

    }
}

@Injectable()
export class GlobalState {

    private _data = new Subject<Object>();
    private _dataStream$ = this._data.asObservable();
    private capabilities:string[];

    private _subscriptions: Map<string, Array<CallBackWithCaller>> = new Map<string, Array<CallBackWithCaller>>();

    constructor(private airlockService: AirlockService,
                private _menuService: NbMenuService) {
        this._dataStream$.subscribe(this.onEvent.bind(this));
        this.ngOnInit();
    }

    onEvent(data) {
        this._onEvent(data);
    }

    ngOnInit() {
        let user = this.airlockService.getUserName();
        let userKey = "features.currentSeason." + user;
        let currentSession = this.getFromLocalStorage(userKey);
        if (currentSession) {
            this._data["features.currentSeason"] = currentSession;
        }
        let prodUserKey = "features.currentProduct." + user;
        let currentProduct = this.getProductFromLocalStorage(prodUserKey);
        if (currentProduct) {
            this._data["features.currentProduct"] = currentProduct;
            this.airlockService.getUserGroups(currentProduct).then(response => {
                this._data["possibleUserGroupsList"] = response.internalUserGroups;
            });
        }
        let branchKey = "features.currentBranch." + user;
        let currentBranch = this.getBranchFromLocalStorage(prodUserKey);
        if (currentBranch) {
            this._data["features.currentBranch"] = currentBranch;
        }
    }

    notifyDataChanged(event, value) {
        let current = this._data[event];
        if (current !== value) {
            this._data[event] = value;
            if (event === "features.currentSeason") {
                //store it locally
                let user = this.airlockService.getUserName();
                let userKey = "features.currentSeason." + user;
                let valueStr = JSON.stringify(value);
                this.setToLocalStorage(userKey, valueStr);
            } else if (event === "features.currentProduct") {
                //store it locally
                let user = this.airlockService.getUserName();
                let userKey = "features.currentProduct." + user;
                let valueStr = JSON.stringify(value);
                this.setToLocalStorage(userKey, valueStr);
                this.setCapabilities();
            } else if (event === "features.currentBranch") {
                //store it locally
                let user = this.airlockService.getUserName();
                let userKey = "features.currentBranch." + user;
                let valueStr = JSON.stringify(value);
                this.setToLocalStorage(userKey, valueStr);
            } else if (event === "console.currentAvatar") {
                //store it locally
                let user = this.airlockService.getUserName();
                let userKey = "console.currentAvatar." + user;
                let valueStr = value;
                this.setToLocalStorage(userKey, valueStr);
            } else if (event === "translations.currentLayout") {
                let user = this.airlockService.getUserName();
                let userKey = "translations.currentLayout." + user;
                this.setToLocalStorage(userKey, value);
            } else if (event === "features.isLatestSeason") {
                let user = this.airlockService.getUserName();
                let userKey = "features.isLatestSeason." + user;
                this.setToLocalStorage(userKey, value);
            }

            this._data.next({
                event: event,
                data: this._data[event],
            });
        }
    }

    subscribe(event: string, callerName: string, callback: Function) {
        let subscribers = this._subscriptions.get(event) || [];
        subscribers.push(new CallBackWithCaller(callerName, callback));
        this._subscriptions.set(event, subscribers);
    }

    unsubcribe(event: string, callerName: string) {
        let subscribers = this._subscriptions.get(event) || [];
        subscribers = subscribers.filter(
            callbackHolder => {
                callbackHolder.caller === callerName;

            });
        this._subscriptions.set(event, subscribers);
    }

    _onEvent(data: any) {
        let subscribers = this._subscriptions.get(data['event']) || [];
        subscribers.forEach((callbackHolder) => {
            callbackHolder.callback.call(null, data['data']);
        });
    }

    getData(event) {
        let current = this._data[event];
        if (event === "features.currentSeason") {
            let user = this.airlockService.getUserName();
            let userKey = "features.currentSeason." + user;
            current = this.getFromLocalStorage(userKey);
        }
        if (event === "features.currentProduct") {
            let user = this.airlockService.getUserName();
            let userKey = "features.currentProduct." + user;
            current = this.getProductFromLocalStorage(userKey);
        }
        if (event === "features.currentBranch") {
            let user = this.airlockService.getUserName();
            let userKey = "features.currentBranch." + user;
            current = this.getBranchFromLocalStorage(userKey);
        }
        if (event === "console.currentAvatar") {
            let user = this.airlockService.getUserName();
            let userKey = "console.currentAvatar." + user;
            current = this.getStringFromLocalStorage(userKey);
        } else if (event === "translations.currentLayout") {
            let user = this.airlockService.getUserName();
            let userKey = "translations.currentLayout." + user;
            current = this.getStringFromLocalStorage(userKey);
        } else if (event === "features.isLatestSeason") {
            let user = this.airlockService.getUserName();
            let userKey = "features.isLatestSeason." + user;
            current = this.getStringFromLocalStorage(userKey);
        }
        if (current) {
            return current;
        } else {
            return null;
        }
    }

    setToLocalStorage(key: string, data: string) {
        localStorage.setItem(key, data);
    }

    getStringFromLocalStorage(key: string) {
        let data = localStorage.getItem(key);
        if (data && data !== "undefined") {
            return data;
        } else {
            return null;
        }
    }

    getFromLocalStorage(key: string) {
        let data = localStorage.getItem(key);
        if (data && data !== "undefined") {
            return JSON.parse(data) as Season;
        } else {
            return null;
        }

    }

    getProductFromLocalStorage(key: string) {
        let data = localStorage.getItem(key);
        if (data && data !== "undefined") {
            return JSON.parse(data) as Product;
        } else {
            return null;
        }

    }

    getBranchFromLocalStorage(key: string) {
        let data = localStorage.getItem(key);
        if (data && data !== "undefined") {
            return JSON.parse(data) as Branch;
        } else {
            return null;
        }
    }

    getCurrentSeason() {
        return this.getData("features.currentSeason")?.uniqueId;
    }

    getCurrentSeasonObject() {
        return this.getData("features.currentSeason");
    }

    getCurrentProduct() {
        return this.getData("features.currentProduct")?.uniqueId;
    }

    getCurrentProductObject() {
        return this.getData("features.currentProduct");
    }

    getCurrentBranch() {
        return this.getData("features.currentBranch")?.uniqueId;
    }

    getCurrentBranchObject() {
        return this.getData("features.currentBranch");
    }

    getAvailableGroups() {
        return this.getData("possibleUserGroupsList");
    }

    setAvailableGroups(groups) {
        this._data["possibleUserGroupsList"] = groups;
    }

    canExportImport(): boolean {
        return this.getCapability("EXPORT_IMPORT");
    }

    canSupportEncryption(): boolean {
        return this.getCapability("RUNTIME_ENCRYPTION");
    }

    canUseBranches(): boolean {
        return this.getCapability('BRANCHES');
    }

    canUseAnalytics(): boolean {
        return this.getCapability('ANALYTICS');
    }

    canUseCohorts(defaultValue: boolean = false): boolean {
        return this.getCapability('COHORTS', defaultValue);
    }

    canUseDataImport(defaultValue: boolean = false): boolean {
        return this.getCapability('DATA_IMPORT', defaultValue);
    }

    canUseNotifications(): boolean {
        return this.getCapability('NOTIFICATIONS');
    }

    canUseStreams(): boolean {
        return this.getCapability('STREAMS');
    }

    canUseTranslations(): boolean {
        return this.getCapability('TRANSLATIONS');
    }

    canShowAirlytics(): boolean {
        return this.canUseCohorts() || this.canUseDataImport();
    }

    canShowAuthorize(): boolean {
        return this.airlockService.getHasAdminProds();
    }

    canShowWebhooks(): boolean {
        return this.airlockService.isAdministrator();
    }

    private setCapabilities() {
        let product = this.getCurrentProductObject()
        if(product){
            this.capabilities = product.capabilities;
        }
        else{
            this.capabilities = [];
        }
    }

    private getCapabilities() {
        return this.capabilities || [];
    }

    private getCapability(capability: string, defaultValue: boolean = false) {
        let capabilities = this.getCapabilities();
        if (capabilities.length === 0){
            return defaultValue;
        }
        return capabilities.includes(capability);
    }

}
