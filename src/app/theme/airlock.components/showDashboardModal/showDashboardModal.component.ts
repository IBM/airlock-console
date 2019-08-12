import {Component, Injectable,ViewEncapsulation,ViewChild,Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import * as $$ from 'jquery';
import 'select2';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import {Experiment} from "../../../model/experiment";
import {Variant} from "../../../model/variant";
import {Rule} from "../../../model/rule";
import {Output} from "@angular/core";
import {EventEmitter} from "@angular/core";
import {UiSwitchComponent} from "angular2-ui-switch/src/ui-switch.component";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {SimpleNotificationsComponent, NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import { DomSanitizer } from '@angular/platform-browser';


@Component({
    selector: 'show-dashboard-modal',
    providers: [FeatureUtilsService, TransparentSpinner, NotificationsService],
    styles: [require('./showDashboardModal.scss'),require('select2/dist/css/select2.css')],
    template: require('./showDashboardModal.html'),
    encapsulation: ViewEncapsulation.None
})

export class ShowDashboardModal {
    @ViewChild('showDashboardModal') modal: ModalComponent;
    title:string = "Dashboard";
    loading: boolean = false;
    loaded: boolean = false;
    iframeSrc: string = "";

    dashboardUrl: string = "";
    urlForCookie:string = null;
    urlForKibana:string = null;
    _rule: Rule;

    sanitize(s:string){
        if(s == null || s == "")
            return null;
        var res = this.sanitizer.bypassSecurityTrustResourceUrl(s);
        return res
    }

    constructor(private _airLockService:AirlockService, /*private _featureUtils:FeatureUtilsService,*/
                private _notificationService: NotificationsService, private _stringsSrevice: StringsService,
                private toastrService: ToastrService, private sanitizer: DomSanitizer) {
    }

    isViewer(){
        return this._airLockService.isViewer();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    setCookieCompletedLoading(){
        this.urlForKibana = this.iframeSrc;
        this.urlForCookie = null
    }
    open(url: string){
        this.dashboardUrl = url;
        // this.iframeSrc = this.dashboardUrl+"?embed=true";
        this.setCookie("airlock_token",this._airLockService.getJWT(),1,"/",".weather.com");
        this.setCookie("dummi",this._airLockService.getJWT(),1);
        this.urlForKibana= this.dashboardUrl;//+"/getcookie?cookie="+this._airLockService.getJWT();
        if(this.modal != null) {
            this.modal.open();
        }
    }
    private setCookie(name: string, value: string, expireDays: number, path: string = '',domain:string  = '') {
        let d:Date = new Date();
        d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
        let expires:string = `expires=${d.toUTCString()}`;
        let cpath:string = path ? `; path=${path}` : '';
        let cdomain:string = domain ? `; domain=${domain}` : '';
        let str:string = `${name}=${value}; ${expires}${cpath}${cdomain};`;
        console.log(str);
        document.cookie = str;
        console.log(document.cookie);
    }

    close(){
        this.loaded = false;
        this.dashboardUrl = "";
        this.iframeSrc = "";
        this.modal.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in ShowDashboardModal:"+errorMessage);
        this.create(errorMessage);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message:string) {
        this.toastrService.error(message, "show dashboard failed", {
            timeOut: 0,
            closeButton: true,
            positionClass: 'toast-bottom-full-width',
            toastClass: 'airlock-toast simple-webhook bare toast',
            titleClass: 'airlock-toast-title',
            messageClass: 'airlock-toast-text'
        });
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

