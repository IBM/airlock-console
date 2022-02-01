import {Component, EventEmitter, Output, ViewChild} from '@angular/core';

import {AirlockService} from "../../../services/airlock.service";
// import {NotificationsService} from "angular2-notifications";
import {StringsService} from "../../../services/strings.service";
import * as FileSaver from 'file-saver';
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {FeatureUtilsService} from "../../../services/featureUtils.service";

@Component({
    selector: 'document-links-Modal',
    styleUrls: ['./documentlinksModal.scss'],
    templateUrl: './documentlinksModal.html',
    // encapsulation: ViewEncapsulation.None
})

export class DocumentlinksModal {

    // @ViewChild('documentlinksModal') modal: ModalComponent;

    loading: boolean = false;
    buttonText: string = "Select platform"
    seasonId: string = null;
    platforms: string[] = [];
    selectedPlatformIndex: number = 0;
    links: any[] = [];
    linksObj: any = null;

    @Output() onProductAdded = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService, private toastrService: NbToastrService,
    protected modalRef: NbDialogRef<DocumentlinksModal>) {

    }

    ngOnInit() {
        var v = this;

        this._airLockService.getDocumentLinks(this.seasonId).then(
            result => {
                this.linksObj = result;
                if (this.linksObj) {
                    if (this.linksObj.staticRuntimeDevelopment) {
                        this.staticRuntimeDevelopment = this.linksObj.staticRuntimeDevelopment;
                    }
                    if (this.linksObj.staticRuntimeProduction) {
                        this.staticRuntimeProduction = this.linksObj.staticRuntimeProduction;
                    }
                }
                /*
                 "staticRuntimeDevelopment": "https://airlockstorage.blob.core.windows.net/iritruntime/seasons/edf2aa57-8ae7-4fd2-81c5-8b539ed61eac/49c24a8a-6587-4484-b0c4-21c297ed64c8/AirlockStaticRuntimeDEVELOPMENT.json",
                 "staticRuntimeProduction": "https://airlockstorage.blob.core.windows.net/iritruntime/seasons/edf2aa57-8ae7-4fd2-81c5-8b539ed61eac/49c24a8a-6587-4484-b0c4-21c297ed64c8/AirlockStaticRuntimePRODUCTION.json",
                 */
                this.buttonText = "Select platform";

                this.links = [];
                this.selectedPlatformIndex = 0;
                // this.seasonId = seasonId;
                // this.platforms = platforms;
                this.setupLinks();
                v.loading = false;
                // if (v.modal) {
                //
                //     v.modal.open();
                // }
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

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    getPlatforms(obj: any) {
        var platforms = []
        for (var platform of obj.platforms) {
            platforms.push(platform.platform);
        }
        return platforms;
    }

    private staticRuntimeDevelopment: string = null;
    private staticRuntimeProduction: string = null;

    open(seasonId: string, platforms: string[]) {
    }

    setLinks() {
        this.links = [{"link": this.linksObj.defaultsFile, "displayName": "Default file"}];
        for (var val of this.linksObj.platforms[this.selectedPlatformIndex].links) {
            this.links.push(val);
        }
    }

    setupLinks() {
        this.links = [{"type": "defaults", "displayName": "Defaults file"}];
        for (var platform of this.platforms || []) {
            const displayName = this.getString(platform);
            this.links.push({
                "type": "constants",
                "displayName": displayName,
                "platform": platform
            });
        }
    }

    selectItem(index: number) {
        this.selectedPlatformIndex = index;
        this.buttonText = this.platforms[index];
        this.setLinks();
    }


    downloadLink(item) {
        console.log(item);

        if (item.type === "defaults") {
            this._airLockService.getDefaultsFileContent(this.seasonId).then(response => {
                let defaults: any = response;
                try {
                    defaults = JSON.stringify(defaults, null, 2);
                } catch (e) {
                    console.log('could not strigify configuration');
                }
                let filename = "AirlockDefaults.json";
                var blob = new Blob([defaults], {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(blob, filename);
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        } else if (item.type === "constants") {
            this._airLockService.getConstantsFileContent(item.platform, this.seasonId).then(response => {
                let filename = "AirlockConstants";
                let extension = '';
                if (item.platform === "Android") {
                    extension = 'java';
                } else if (item.platform === "iOS") {
                    extension = 'swift';
                } else if (item.platform === "c_sharp") {
                    extension = 'cs';
                }
                var blob = new Blob([response as any], {type: "text/plain;charset=utf-8"});
                FileSaver.saveAs(blob, `${filename}.${extension}`);
            }).catch(
                error => {
                    this.handleError(error);
                }
            );
        }
    }

    close() {
        this.modalRef.close();
    }


    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in documentLinksModal:" + errorMessage);
        console.log(error);
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

    create(message: string) {
        this.toastrService.danger(message, "Action failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }



    onCreate(event) {
    }

    onDestroy(event) {
    }

    //////////////////////////////////////////
}

