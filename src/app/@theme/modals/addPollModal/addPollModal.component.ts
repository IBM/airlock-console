import {Component, Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {ENTER} from "@angular/cdk/keycodes";
import {Observable, of} from "rxjs";
import {map} from 'rxjs/operators';
import {Poll} from "../../../model/poll";


@Component({
    selector: 'add-feature-modal',
    styleUrls: ['addPollModal.scss'],
    templateUrl: './addPollModal.html',
    // encapsulation: ViewEncapsulation.None
})

export class AddPollModal {
    separatorKeysCodes: number[] = [ENTER];
    title: string = "Add Poll";
    subFeatureParentName: string = null;
    loading: boolean = false;
    poll: Poll;
    @Input() valid: boolean;
    groups: string = "";
    seasonId: string;
    branchId: string;
    stam = "";
    rootId: string;
    possibleGroupsList: Array<any> = [];
    parentId: string;
    filteredOptions$: Observable<string[]>;
    // @ViewChild('autoInput') input;
    // @ViewChild('groupsContainer') groupsContainer;
    verticalGroups = false;

    constructor(private _airLockService: AirlockService,
                private _featureUtils: FeatureUtilsService,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<AddPollModal>) {
        this.loading = true;
        this.seasonId = _appState.getCurrentSeason();
        this.branchId = _appState.getCurrentBranch();
        this.possibleGroupsList = _appState.getAvailableGroups();

        this.filteredOptions$ = of(this.possibleGroupsList);
        this.initPoll();
    }

    ngOnInit() {
    }

    isViewer() {
        return this._airLockService.isViewer();
    }

    getFilteredOptions(value: string): Observable<string[]> {
        return of(value).pipe(
            map(filterString => this.filter(filterString)),
        );
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.possibleGroupsList.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
    }

    initPoll() {
        this.poll = new Poll();
        this.poll.stage = "DEVELOPMENT";
        this.poll.rule = new Rule();
        this.poll.rule.ruleString = "";
        this.poll.description = "";
        this.poll.enabled = false;
        this.poll.rolloutPercentage = 100;
        this.poll.creator = this._airLockService.getUserName();
        this.poll.internalUserGroups = [];
        this.groups = "";
        this.loading = false;
        this.verticalGroups = false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        return !(this.poll.pollId == null || this.poll.pollId.length == 0);

    }


    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this.poll.pollId = this.poll.pollId.trim();
            this.loading = true;
            this._airLockService.createPoll(this._appState.getCurrentProduct(), this.poll).then(() => {
                this.loading = false;
                this.close(this.poll);
                this._airLockService.notifyDataChanged("success-notification", {
                    title: "Success",
                    message: "Added the poll " + this.poll.pollId
                });
            }).catch(
                error => {
                    console.log(`Failed to add Poll: ${error}`);
                    this.handleError(error);
                }
            );
        } else {
            this.create("Feature name and namespace are required.");
        }
    }

    clean() {
        this.initPoll();
        this.title = "Add Poll";
        this.subFeatureParentName = null;
    }

    remove(fruit: string): void {
        const index = this.poll.internalUserGroups.indexOf(fruit);

        if (index >= 0) {
            this.poll.internalUserGroups.splice(index, 1);
        }
    }

    selectItemToBeAfter(index: number) {
        console.log("index:" + index);
    }

    open() {
        this.clean();
        this.title = "Add Poll";
    }

    close(obj) {
        this.modalRef.close(obj);
    }

    isInputWarningOn(fieldValue: string) {
        return fieldValue === undefined || fieldValue === null || fieldValue == "";
    }

    handleError(error: any) {
        console.log("handleError error Add FEATURE");
        this.loading = false;

        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to add feature. Please try again.")//error._body || "Failed to add feature. Please try again.";
        console.log("handleError in addFeatureModal:" + errorMessage);
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
        position: ["right", "bottom"],
        theClass: "alert-color",
        icons: "Info"
    };

    create(message: string) {
        this.toastrService.danger(message, "Feature creation failed", {
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

