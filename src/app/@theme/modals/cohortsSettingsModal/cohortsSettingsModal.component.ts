
import {Component , ViewChild, Output,ChangeDetectionStrategy,ChangeDetectorRef} from '@angular/core';

import {EventEmitter} from "@angular/core";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {CohortsData} from "../../../model/cohortsData";
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbToastrService} from "@nebular/theme";


export enum VeryfyDialogType {
    FEATURE_TYPE,
    CONFIGURATION_TYPE,
    EXPERIMENT_TYPE,
    VARIANT_TYPE,
    STRING_TYPE,
    STREAM_TYPE,
    NOTIFICATION_TYPE,
    ORDERING_RULE_TYPE
}

@Component({
    selector: 'cohorts-settings-modal',
    styleUrls: ['./cohortsSettingsModal.scss'],
    templateUrl: './cohortsSettingsModal.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class CohortsSettingsModal {

    @Output() onSettingsSaved = new EventEmitter();
    loading: boolean = false;
    cohortsData: CohortsData;
    isOnlyDisplayMode: boolean = false;
    title:string;
    constructor(private _airlockService:AirlockService,
                private cd: ChangeDetectorRef,
                private toastrService: NbToastrService,
                private _stringsSrevice:StringsService,
                private modalRef: NbDialogRef<CohortsSettingsModal>) {
    }

    ngOnInit(){
        this.isOnlyDisplayMode = !this._airlockService.isUserHasAnalyticsEditorRole();
        this.cd.markForCheck();
    }


    open(cohortsData: CohortsData) {
        console.log("VerifyActionModal inside open");
        this.cohortsData=CohortsData.clone(cohortsData);
        this.isOnlyDisplayMode = !this._airlockService.isUserHasAnalyticsEditorRole();
        this.cd.markForCheck();
    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        this.loading = true;
        this._airlockService.updateCohortsData(this.cohortsData).then(result => {
            this.loading = false;
            this.onSettingsSaved.emit(null);
            this.close();
            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Cohorts settings updated"});
        }).catch(
            error => {
                console.log(`Failed to save settings: ${error}`);
                this.handleError(error);
            }
        );
    }
    cancel(){
        this.close();
    }
    discard(){
        this.close();
    }
    close(){
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Action failed.";
        console.log("handleError in addProductModal:"+errorMessage);
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

    capitalizeFirstLetter(str:string):string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    create(message:string) {

    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////
}

