
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import {EventEmitter} from "@angular/core";
import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {VerifyActionModal} from "../verifyActionModal/verifyActionModal.component";
import {ExperimentsContainer} from "../../../model/experimentsContainer";
import {Experiment} from "../../../model/experiment";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";



@Component({
    selector: 'reorder-experiments-modal',
    styleUrls: ['./reorderExperimentsModal.scss'],
    templateUrl: './reorderExperimentsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class ReorderExperimentsModal {

    @Input() verifyActionModal: VerifyActionModal;

    _experimentsContainer: ExperimentsContainer = null;
    _selectedIndex:number=0;
    _selectedTarget: Experiment = null;
    loading:boolean = false;
    private sub:any = null;
    @Output() onReorderExperiments = new EventEmitter();

    constructor(private _airLockService:AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils:FeatureUtilsService,
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<ReorderExperimentsModal>) {

    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    open(container: ExperimentsContainer) {

            this._experimentsContainer = ExperimentsContainer.clone(container);
    }

    getName(item:Experiment):string {
        if(item && item.name) {
            return item.name;
        }
        return "";
    }
    shouldShowMaxOnSection(): boolean {

        return false;
    }


    getChildren(): Experiment[] {
        if (this._experimentsContainer && this._experimentsContainer.experiments) {
            return this._experimentsContainer.experiments;
        } else {
            return null;
        }

    }


    selectTarget(experiment:Experiment,index:number){

        if (this._selectedTarget == experiment && this._selectedIndex == index){
            this._selectedTarget = null;
            this._selectedIndex = 0;
        } else {
            this._selectedTarget = experiment;
            this._selectedIndex = index;
        }
    }
    save() {
        this._save();
    }

    _save(){

            this.loading = true;
            //remove indexing info
            for (var experiment of this._experimentsContainer.experiments) {
                experiment.indexingInfo = undefined;
            }
            this._airLockService.updateExperiments(this._experimentsContainer).then(result => {
                this.loading = false;
                this.onReorderExperiments.emit(null);
                this.close();
                this._airLockService.notifyDataChanged("success-notification",{title:"Success",message:"Reorder succeeded"});
            }).catch(
                    error => {
                        console.log(`Failed to reorder: ${error}`);
                        this.handleError(error);
                    }
                );
       }



    close(){
        try{
            if(this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        }catch (e){
            console.log(e);
        }
        this.modalRef.close();
    }
    moveUp(){
        if(this._selectedIndex == 0 || this._selectedTarget == null){

        }else{
            var oldVal:Experiment = this.getChildren()[this._selectedIndex -1];
            this.getChildren()[this._selectedIndex -1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex--;
        }
    }
    moveDown(){
        if(this._selectedIndex == this.getChildren().length -1 || this._selectedTarget == null){

        }else{
            var oldVal:Experiment = this.getChildren()[this._selectedIndex +1];
            this.getChildren()[this._selectedIndex +1] = this.getChildren()[this._selectedIndex];
            this.getChildren()[this._selectedIndex] = oldVal;
            this._selectedIndex++;
        }
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = error._body || "Failed to reorder.";
        console.log("handleError in reorderMXGroupModal:"+errorMessage);
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
        this.toastrService.danger(message, "Reorder failed", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
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

