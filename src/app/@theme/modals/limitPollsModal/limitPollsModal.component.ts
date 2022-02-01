
import {Component, ViewEncapsulation, ViewChild, Output, EventEmitter} from '@angular/core';
import { AirlockService } from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {
    NbDialogRef,
    NbDialogService,
    NbGlobalLogicalPosition,
    NbPopoverDirective,
    NbToastrService
} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {ConfirmActionModal} from "../confirmActionModal";
import {AirlockPolls} from "../../../model/airlockPolls";

@Component({
    selector: 'limit-polls-modal',
    styleUrls: ['./limitPollsModal.scss'],
    templateUrl: './limitPollsModal.html',
    encapsulation: ViewEncapsulation.None

})

export class LimitPollsModal {

    intervalValues: string[] = ["total", "every day", "every week", "every month"];
    usedIntervals: boolean[] = [];
    selectedLimitation: String = 'Select limitation'
    usedIntervalsCount: number;
    usedIntervalsText: string[] = [];
    _polls: AirlockPolls = null;
    loading: boolean = false;
    private sub: any = null;
    secondsBetweenPollsEnabled = true;
    sessionsBetweenPollsEnabled = true;
    @ViewChild(NbPopoverDirective) popover: NbPopoverDirective;
    @Output() onChangeNotificationsLimit = new EventEmitter();

    constructor(private _airLockService: AirlockService,
                private _stringsSrevice: StringsService,
                private _featureUtils: FeatureUtilsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<LimitPollsModal>,
                private modalService: NbDialogService) {

    }

    ngOnInit() {
        this.init();
    }
    ngOnOpen() {
        this.init();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open(notifications: AirlockPolls) {
    }

    save() {
        this.loading = true;
        if (this.useSessionsLimitationRule === false){
            this._polls.sessionsBetweenPolls = null;
        }
        if (this.useSecondsLimitationRule === false){
            this._polls.secondsBetweenPolls = null;
        }

        this._airLockService.updatePolls(AirlockPolls.clone(this._polls)).then((airlockPolls) => {
            airlockPolls.polls;
        }).catch(error => {
            this.loading = false;
            this.handleError(error);
        });
        this.modalRef.close();
    }


    close() {
        try {
            if (this.sub != null) {
                this.sub.unsubscribe();
            }
            this.sub = null;
        } catch (e) {
            console.log(e);
        }
        this.modalRef.close();
    }

    handleError(error: any) {
        this.loading = false;
        let errorMessage = FeatureUtilsService.parseErrorMessage(error);
        console.log("handleError in LimitPollsModal:" + errorMessage);
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
    useSessionsLimitationRule: boolean =  false;
    useSecondsLimitationRule: boolean = false;

    create(message: string) {
        this.toastrService.danger(message, "Failed to change polls limitations", {
            duration: 60000,
            position: NbGlobalLogicalPosition.BOTTOM_START,
            preventDuplicates: true,
            toastClass: 'big-toast'
        });
    }

    selectIntervalValue(limit: any, intervalIndex: number, limitationIndex: number, limitationText: string) {
        console.log('Selected interval value is: ', intervalIndex);
        var oldIntervalText = this.usedIntervalsText[limitationIndex];
        var oldIntervalValue = this.intervalValues.indexOf(oldIntervalText);
        this.usedIntervals[oldIntervalValue] = false;
        limit.minInterval = this.getIntervalByIndex(intervalIndex);
        this.usedIntervalsText[limitationIndex] = limitationText;
        this.usedIntervals[intervalIndex] = true;
        this.popover.hide();
    }

    getIntervalText(index: number) {
        if (this.usedIntervalsText[index] === undefined) {
            return 'Select Limit'
        } else {
            return this.usedIntervalsText[index]
        }
    }

    addLimitation() {

    }

    removeLimitation(limitationIndex: number) {
    }

    getIntervalByIndex(index: number) {
        if (index == 0)
            return -1;
        if (index == 1)
            return 60; //hour
        if (index == 2)
            return 1440; //day
        if (index == 3)
            return 10080; //week
        if (index == 4)
            return 43200; //month = 30 days
        return -9
    }

    getIntervalFromMinutes(min: number) {
        if (min == -9)
            return "Select Interval"
        if (min == -1)
            return "total"
        if (min < 1440) {
            return "every hour";
        }
        if (min < 10080) {
            return "every day";
        }
        if (min < 44640) {
            return "every week";
        }
        return "every month";
    }

    init() {
        this.usedIntervals = new Array(this.intervalValues.length).fill(false);
        this.usedIntervalsCount = 0;
        this.usedIntervalsText = [];
        if (this._polls.sessionsBetweenPolls != null){
            this.useSessionsLimitationRule = true;
        }

        if (this._polls.secondsBetweenPolls != null){
            this.useSecondsLimitationRule = true;
        }
    }

    onCreate(event) {
        this.init();
        console.log(event);
    }

    onDestroy(event) {
        console.log(event);
    }

    dynamicSubmitButtonTextChanged($event: any) {
        
    }
}

