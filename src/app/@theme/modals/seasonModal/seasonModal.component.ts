
import {Component, Injectable, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {EventEmitter} from "@angular/core";

import { AirlockService } from "../../../services/airlock.service";
import { Product } from "../../../model/product"
import { Season } from "../../../model/season"
import {StringsService} from "../../../services/strings.service";
import {GlobalState} from "../../../global.state";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'season-modal',
    styleUrls: ['./seasonModal.scss'],
    templateUrl: './seasonModal.html',
    encapsulation: ViewEncapsulation.None

})


//RUNTIME_ENCRYPTION
export class SeasonModal {
    _season: Season;
    _origSeason : Season;
    _product: Product;
    _isAddNew: boolean;
    _isLastSeason: boolean;
    _showEncryption: boolean;
    loading:boolean = false;
    @Output() onSeasonAdded = new EventEmitter();
    @Output() onSeasonEdited = new EventEmitter();
    @Output() onSeasonDeleted = new EventEmitter();

    constructor(private _airlockService : AirlockService
        , private _stringsSrevice: StringsService, 
                private _appState: GlobalState, 
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<SeasonModal>) {
    }

    ngOnInit(){
        if (this._isAddNew){
            this._season = new Season();
            this._season.runtimeEncryption = false;
        }
        this._showEncryption = this._appState.canSupportEncryption();
    }

    @Input()
    set product (p:Product){
        this._product = p; // read only
    }

    @Input()
    set season (s:Season){
        this._origSeason = s;
        this._season = new Season(s);
    }

    open(isNewSeason : boolean, isLastSeason: boolean) {
        if (isNewSeason){
            this._season = new Season();
            this._season.runtimeEncryption = false;
        }
        this._showEncryption = this._appState.canSupportEncryption();
        this._isAddNew = isNewSeason;
        this._isLastSeason = isLastSeason;
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    toggleEncryption(event) {
        this._season.runtimeEncryption = !this._season.runtimeEncryption;
    }

    save() {

        if (this.validateSeason()) {
            this.loading = true;
            this._season.name = `${this._season.minVersion} to ${this._season.maxVersion}`;
            if (this._isAddNew){
                // this._season.runtimeEncryption = false;
                this._season.maxVersion=null;

                this._airlockService.addSeason(this._season, this._product.uniqueId).
                then(
                    result => {
                        // console.log("added season");
                        // console.log(reult);
                        // this._appState.notifyDataChanged('features.currentSeason', result);
                        this.onSeasonAdded.emit(result);
                        this.loading = false;
                        this.close();
                        this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Version Range added"});
                    }
                ).catch(
                    error => {
                        this.handleError(error);
                    }
                );
            } else {

                this._airlockService.updateSeason(this._season).
                then(
                    result => {
                        this.loading = false;
                        this.onSeasonEdited.emit(result);
                        this.close();
                        this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Version range saved"});
                    }
                ).catch(
                    error => {
                        this.handleError(error);
                    }
                );
            }
        } else {
            this.create("Minimum version is required");
        }
    }

    deleteSeason() {

        if (confirm(`Are you sure you want to delete this version range?`)) {
            this.loading = true;
            this._airlockService.deleteSeason(this._season.uniqueId)
                .then(response  => {
                    this.loading = false;
                    this.onSeasonDeleted.emit(this._season);
                    this.close(true);
                    this._appState.notifyDataChanged('features.currentSeason', null);
                    this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Version Range deleted"});
                })
                .catch(error => {
                    this.loading = false;
                    let errorMessage = error._body || "Failed to delete version range. Please try again.";
                    console.log("handleError in seasonModal:"+errorMessage);
                    console.log(error);
                    this.create(errorMessage,"Delete Failed");
                });
        }
    }

    validateSeason(): boolean {

        if (this._isAddNew) {
            return (this.myTrim(this._season.minVersion) !== '' &&
                (!this.myTrim(this._season.maxVersion) || this.myTrim(this._season.maxVersion) == ''));
        } else {

            if (!this.didSeasonChange())
                return true;

            return true;
            // TODO: add more complex validations
        }
    }

    didSeasonChange(): boolean {

        return (this.myTrim(this._season.minVersion) != this.myTrim(this._origSeason.minVersion) ||
            this.myTrim(this._season.maxVersion) != this.myTrim(this._origSeason.maxVersion));
    }

    myTrim(str: string) {
        if (!str || str==null) {
            return str;
        } else {
            return str.trim();
        }
    }
    close(deleted = false){
        this.modalRef.close(deleted);
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to update version range. Please try again.";
        console.log("handleError in seasonModal:"+errorMessage);
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

    create(message:string,title:string = "Save failed") {
        this.toastrService.danger(message, title, {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
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
