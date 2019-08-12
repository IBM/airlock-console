
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import {TransparentSpinner} from "../transparentSpinner/transparentSpinner.service";
import {NotificationsService, SimpleNotificationsComponent} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import {ToastrService} from "ngx-toastr";
import * as FileSaver from 'file-saver';
@Component({
    selector: 'document-links-Modal',
    styles: [require('./documentlinksModal.scss')],
    template: require('./documentlinksModal.html'),
    // encapsulation: ViewEncapsulation.None
})

export class DocumentlinksModal {

    @ViewChild('documentlinksModal') modal: ModalComponent;

    loading: boolean = false;
    buttonText:string = "Select platform"
    seasonId:string = null;
    platforms:string[] = [];
    selectedPlatformIndex:number = 0;
    links:any[] = [];
    linksObj:any = null;

    @Output() onProductAdded = new EventEmitter();

    constructor(private _airLockService:AirlockService, private _notificationService: NotificationsService,
                private _stringsSrevice: StringsService, private toastrService: ToastrService) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getPlatforms(obj:any){
        var platforms = []
        for (var platform of obj.platforms){
            platforms.push(platform.platform);
        }
        return platforms;
    }
    private staticRuntimeDevelopment:string = null;
    private staticRuntimeProduction:string = null;
    open(seasonId:string, platforms: string[]) {
        var v = this;

        this._airLockService.getDocumentLinks(seasonId).
        then(
            result => {
                this.linksObj = result;
                if(this.linksObj){
                    if(this.linksObj.staticRuntimeDevelopment){
                        this.staticRuntimeDevelopment = this.linksObj.staticRuntimeDevelopment;
                        console.log(this.staticRuntimeDevelopment);
                    }
                    if(this.linksObj.staticRuntimeProduction){
                        this.staticRuntimeProduction = this.linksObj.staticRuntimeProduction;
                        console.log(this.staticRuntimeProduction);
                    }
                }
                /*
                 "staticRuntimeDevelopment": "https://airlockstorage.blob.core.windows.net/iritruntime/seasons/edf2aa57-8ae7-4fd2-81c5-8b539ed61eac/49c24a8a-6587-4484-b0c4-21c297ed64c8/AirlockStaticRuntimeDEVELOPMENT.json",
                 "staticRuntimeProduction": "https://airlockstorage.blob.core.windows.net/iritruntime/seasons/edf2aa57-8ae7-4fd2-81c5-8b539ed61eac/49c24a8a-6587-4484-b0c4-21c297ed64c8/AirlockStaticRuntimePRODUCTION.json",
                 */
                this.buttonText = "Select platform";
                this.removeAll();
                this.links = [];
                this.selectedPlatformIndex = 0;
                this.seasonId=seasonId;
                this.platforms=platforms;
                this.setupLinks();
                v.loading = false;
                if (v.modal){

                    v.modal.open();
                }
                // this.linksObj = result;
                // console.log(result);
                // this.platforms = this.getPlatforms(this.linksObj);
                // this.setupLinks();
                // v.loading = false;
                // if (v.modal){
                //
                //     v.modal.open();
                // }
            }
        ).catch(
            error => {
                this.handleError(error);
            }
        );

    }
    setLinks(){
        this.links = [{"link":this.linksObj.defaultsFile,"displayName":"Default file"}];
        for (var val of this.linksObj.platforms[this.selectedPlatformIndex].links) {
            this.links.push(val);
        }
    }

    setupLinks() {
        this.links = [{"type":"defaults","displayName":"Defaults file"}];
        for (var platform of this.platforms || []) {
            const displayName = this.getString(platform);
            this.links.push({"type": "constants",
                "displayName": displayName,
                "platform":platform});
        }
    }
    selectItem(index:number){
        console.log("index:"+index);
        this.selectedPlatformIndex=index;
        this.buttonText = this.platforms[index];
        this.setLinks();
    }


    downloadLink(item) {
        console.log(item);
        if (item.type === "defaults") {
            this._airLockService.getDefaultsFileContent(this.seasonId).then(response => {
                console.log(response);
                let defaults = response;
                try {
                    defaults = JSON.stringify(JSON.parse(defaults),null,2);
                } catch (e) {
                    console.log('could not strigify configuration');
                }
                let filename = "AirlockDefaults.json";
                var blob = new Blob([defaults], {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(blob, filename);
            });
        } else if (item.type === "constants") {
            this._airLockService.getConstantsFileContent(item.platform, this.seasonId).then(response => {
                console.log(response);
                let filename = "AirlockConstants";
                let extension = '';
                if (item.platform === "Android") {
                    extension = 'java';
                } else if (item.platform === "iOS") {
                    extension = 'swift';
                } else if (item.platform === "c_sharp") {
                    extension = 'cs';
                }
                var blob = new Blob([response], {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(blob, `${filename}.${extension}`);
            });
        }
    }
    close(){
        this.modal.close();
    }


    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Request failed, try again later.";
        console.log("handleError in documentLinksModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
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
        position: ["right", "bottom"]
    };

    create(message:string) {
        this.toastrService.error(message, "Action failed", {
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


    //////////////////////////////////////////
}

