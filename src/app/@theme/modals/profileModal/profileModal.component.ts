
import {Component, Injectable, ViewEncapsulation, ViewChild, OnInit} from '@angular/core';
import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef} from "@nebular/theme";
import {ImportFeaturesModal} from "../importFeaturesModal";


@Component({
    selector: 'profile-modal',
    styleUrls: ['./profileModal.scss'],
    templateUrl: './profileModal.html'

})

export class ProfileModal implements OnInit{
    loading:boolean = false;
    props: any = {};
    userName: string;
    keys = [];
    constructor(private _airlockService : AirlockService,
                private _stringsSrevice: StringsService,
                private modalRef: NbDialogRef<ImportFeaturesModal>) {
    }

    ngOnInit() {
        this.loading = true;
        this.userName = this._airlockService.getUserName();
        this.props = this._airlockService.getUserData();
        this.keys = Object.keys(this.props);
        this.loading = false;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getName(name: string) {
        if (name=="FirstName") {
            return "First Name";
        } else if(name=="LastName") {
            return "Last Name";
        } else {
            return name;
        }
    }

    hasNoAuthentication() {
        return this.userName=="Esteban Zia"; //&& this.modalRef.visible
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

    showDashboard() {
        // this.setCookie("airlock_token",this._airlockService.getJWT(),1,"/",".weather.com");
        // window.open(this._airlockService.getAnalyticsUrl(),"_blank");
        // window.open("https://analytics-demo1.airlock.twcmobile.weather.com","_blank");
        // if (!this.hasDashboard()) {
        //     return;
        // }
        //window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        // this.showDashboardModal.open("https://analytics1.airlock.twcmobile.weather.com:6060/app/kibana#/dashboard/analytics-dry-run-index-Dashboard");
    }
    close(){
        // this.showDashboard();
        this.modalRef.close();
    }

}
