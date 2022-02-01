import {Component} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";

@Component({
    selector: 'string-usage-modal',
    styleUrls: ['./stringUsageModal.scss'],
    templateUrl: './stringUsageModal.html',
})

export class StringUsageModal {
    title:string = "String Usage";
    loading: boolean = false;
    stringId: string;
    private responseJson;
    usage;
    branchNames: string[];
    feturesCount: number;
    key:string = "";

    constructor(private _airLockService:AirlockService,
                private _stringsSrevice: StringsService, 
                private toastrService: NbToastrService,
                private modalRef: NbDialogRef<StringUsageModal> ) {
    }

    ngOnInit(){
        this.clean();
        this.loading = true;
        this._airLockService.getStringUsage(this.stringId).then(res => {
            this.responseJson = res;
            this.initUsage();
            this.loading = false;
        }).catch(
            error => {
                this.handleError(error, "Failed to get string usage");
            }
        );
    }

    isViewer(){
        return this._airLockService.isViewer();
    }

    clean(){
        this.usage = {};
        this.branchNames = [];
        this.feturesCount = 0;
    }

    initUsage(){
        const features = {};
        for (let use of this.responseJson.UsedByConfigurations) {
            let branch = use["branchName"]
            if(this.usage[branch] === undefined){
                this.usage[branch] = [];
                this.branchNames.push(branch);
            }
            let u = {};
            u["featureName"] = use["featureName"];
            u["configName"] = use["configName"];
            this.usage[branch].push(u)
            if(features[use["featureName"]] === undefined){
                features[use["featureName"]] = true;
                this.feturesCount++;
            }
        }
    }

    open(stringId: string, key:string = ""){
        this.clean();
        //this.loading = true;
        this.key = key;
        this.stringId = stringId;
        // this._airLockService.getStringUsage(stringId).then(res => {
        //     this.responseJson = res;
        //     this.initUsage();
        //     //this.loading = false;
        //     // if (this.modal != null) {
        //     //     this.modal.open();
        //     // }
        // }).catch(
        //     error => {
        //        // this.loading = false;
        //         console.log(`Failed to get string usage: ${error}`);
        //         this.handleError(error, "Failed to get string usage");
        //     }
        // );
    }

    close(){
        this.modalRef.close();
    }

    handleError(error: any,title: string) {
        this.loading = false;
        let errorMessage = error._body || "Failed to create issue. Please try again.";
        console.log("handleError in stringIssueModal:"+errorMessage);
        console.log(error);
        if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
            errorMessage = errorMessage.substring(1,errorMessage.length -1);
        }
        this.create(errorMessage,title);
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

    create(message:string, title: string) {
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
}

