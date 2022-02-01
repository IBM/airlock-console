
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';

import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {AirlockNotification} from "../../../model/airlockNotification";
import {CohortsData} from "../../../model/cohortsData";
import {Cohort} from "../../../model/cohort";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";



@Component({
    selector: 'reorder-cohorts-modal',
    styleUrls: ['./reorderCohortsModal.scss'],
    templateUrl: './reorderCohortsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ReorderCohortsModal {


    _cohortsData: CohortsData = null;
    _selectedIndex: number = 0;
    _selectedTarget: Cohort = null;
    loading: boolean = false;
    private sub: any = null;
    _listItemHeight: number = 44;
    // @Output() onReorderCohorts = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderCohortsModal>) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    open(cohorts: CohortsData) {
        // if (this.modal){
            this.removeAll();
            this._cohortsData = CohortsData.clone(cohorts);
            // this.modal.open();
        // }
    }

    getName(item: Cohort): string {
        if (item && item.name) {
            return item.name;
        }
        return "";
    }

    getChildren(): Cohort[] {
        if (this._cohortsData && this._cohortsData.cohorts) {
            return this._cohortsData.cohorts;
        } else {
            return null;
        }

    }


    selectTarget(cohort: Cohort, index: number, target: EventTarget) {
        this._listItemHeight = (target as HTMLElement).offsetHeight;
        if (this._selectedTarget == cohort && this._selectedIndex == index) {
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = cohort;
            this._selectedIndex = index;
        }
    }

    save() {
        this._save();
    }

    _save() {

            this.loading = true;
            this._airLockService.updateCohortsData(this._cohortsData).then(result => {
                this.loading = false;
                this.close("reload");
                this._airLockService.notifyDataChanged("success-notification", {title: "Success", message: "Reorder succeeded"});
            }).catch(
                    error => {
                        console.log(`Failed to reorder: ${error}`);
                        this.handleError(error);
                    }
                );
       }



    close(value) {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.modalRef.close(value);
    }
    moveUp() {
        if (this._selectedIndex == 0 || this._selectedTarget == null) {

        } else {
            var oldVal: Cohort = this.getChildren()[this._selectedIndex - 1];
            this.getChildren()[this._selectedIndex - 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex--;
        }
        this.scrollToSelectedItem(true);
    }
    moveDown() {
        if (this._selectedIndex == this.getChildren().length - 1 || this._selectedTarget == null) {

        } else {
            var oldVal: Cohort = this.getChildren()[this._selectedIndex + 1];
            this.getChildren()[this._selectedIndex + 1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex++;
        }
        this.scrollToSelectedItem(false);
    }

    scrollToSelectedItem(scrollDown: boolean) {
        // let itemIndex = this._selectedIndex;
        var scrollBy = this._listItemHeight;
        if (scrollDown){
            scrollBy = scrollBy * -1;
        }
        let top = document.getElementById('mainAccordion');
        if (top !== null) {
            top.scrollBy({top: scrollBy});
        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder.";
        console.log("handleError in reorderExperimentsModal:" + errorMessage);
        console.log(error);
        if (errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length - 1) {
            errorMessage = errorMessage.substring(1, errorMessage.length - 1);
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

    create(message: string) {
        this.toastrService.danger(message, "Reorder failed", {
            duration: 10000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast',
        });
    }

    withOverride() {
        // this._notificationService.create("pero", "peric", "success", {timeOut: 0, clickToClose:false, maxLength: 3, showProgressBar: true, theClass: "overrideTest"})
    }

    removeAll() {
        // this._notificationService.remove()
    }

    onCreate(event) {
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }


    //////////////////////////////////////////

}

