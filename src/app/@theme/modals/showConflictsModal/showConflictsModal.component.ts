
import {Component, ViewEncapsulation, ViewChild, Input, Output} from '@angular/core';
import { AirlockService } from "../../../services/airlock.service";
import {TransparentSpinner} from "../../airlock.components/transparentSpinner";
import {NbDialogRef} from "@nebular/theme";


@Component({
    selector: 'show-conflicts-modal',
    styleUrls: ['./showConflictsModal.scss'],
    templateUrl: './showConflictsModal.html',
})

export class ShowConflictsModal {

    loading: boolean = false;
    featureString: string = "";
    title:string = "";
    message:string = "";

    constructor(private _airLockService:AirlockService,
                private modalRef: NbDialogRef<ShowConflictsModal>) {
    }

    open(title:string = "Are you sure you want to perform this action?",message:string="") {
        this.title=title;
        this.message=message;
        // if (this.modal){
        //     this.modal.open();
        // }
    }

    close(){
        this.modalRef.close();
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


    //////////////////////////////////////////
}

