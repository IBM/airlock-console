import {Component, Input, Output, ViewChild, ViewEncapsulation, EventEmitter} from "@angular/core";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {TransparentSpinner} from "../transparentSpinner";
import {Observable, of} from "rxjs";
import {map} from "rxjs/operators";
import {ConfirmActionModal} from "../../modals/confirmActionModal";
import {NbDialogService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {AirlockService} from "../../../services/airlock.service";
import {UserGroups} from "../../../model/user-groups";
import {Group} from "../../../pages/groups/group";
const ADD_GROUP = "Create Group:"
@Component({
    selector: 'user-groups-input',
    styleUrls: ['./userGroupsInput.scss'],
    templateUrl: './userGroupsInput.html',
    encapsulation: ViewEncapsulation.None
})

export class UserGroupsInput {
    filteredOptions$: Observable<string[]>;
    @ViewChild('autoInput') input;
    @ViewChild('groupsContainer') groupsContainer;
    verticalGroups = false;
    loading: boolean;
    @Input() possibleGroupsList: Array<any> = [];
    @Input() internalUserGroups: Array<any> = [];
    @Input() disabled = false;
    @Output() internalUserGroupsChange = new EventEmitter<Array<any>>();

    constructor(private modalService: NbDialogService,
                private _appState: GlobalState,
                private _airlockService: AirlockService) {
    }

    onChange() {
        this.filteredOptions$ = this.getFilteredOptions(this.input.nativeElement.value);
    }

    onModelChange() {
        this.internalUserGroupsChange.emit(this.internalUserGroups);
    }

    onSelectionChange($event) {
        let selectedGroup: string = $event;
        if (selectedGroup && !this.possibleGroupsList.includes(selectedGroup) && selectedGroup.startsWith(ADD_GROUP)) {
            this.addUserGroup(selectedGroup.replace(ADD_GROUP, ""));
            return;
        } else if (selectedGroup && !this.internalUserGroups.includes(selectedGroup)) {
            this.internalUserGroups.push(selectedGroup);
        }
        this.input.nativeElement.value = null;
        this.filteredOptions$ = this.getFilteredOptions("");
    }

    ngOnInit() {
        this.filteredOptions$ = of(this.possibleGroupsList);
    }

    onEnter() {
        let val: string = this.input.nativeElement.value;
        if (val && !val.startsWith(ADD_GROUP) && this.possibleGroupsList.includes(val)) {
            this.onSelectionChange(val);
        }
    }

    shouldPutInputDown(): boolean {
        if (this.verticalGroups) return true;
        if (!this.groupsContainer) return false;
        let height = this.groupsContainer.nativeElement.clientHeight;
        if (height > 45) {
            this.verticalGroups = true;
        }
        return false;
    }

    getFilteredOptions(value: string): Observable<string[]> {
        return of(value).pipe(
            map(filterString => this.filter(filterString)),
        );
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        let groupsAndAdd = this.possibleGroupsList;
        if (!this.possibleGroupsList.includes(value)) {
            groupsAndAdd = this.possibleGroupsList.concat(ADD_GROUP + value);
        }

        return groupsAndAdd.filter(optionValue => optionValue.toLowerCase().includes(filterValue));
    }

    private addUserGroup(group: string) {
        let message = 'Do you want to create the user group ' + group + '?';
        this.modalService.open(ConfirmActionModal, {
            closeOnBackdropClick: false,
            context: {
                message: message,
                defaultActionTitle: "Create"
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this._createGroup(group);
                this.input.nativeElement.value = null;
                this.filteredOptions$ = this.getFilteredOptions("");
            } else {
                this.input.nativeElement.value = null;
                this.filteredOptions$ = this.getFilteredOptions("");
            }
        });
    }

    _createGroup(group: string) {
        let _selectedProduct = this._appState.getData('features.currentProduct');
        this.loading = true;
        this._airlockService.getUserGroups(_selectedProduct).then(groups => {

            var groupArr = groups.internalUserGroups;
            if (groupArr.includes(group)) {
                this.loading = false;
            } else {
                groups.internalUserGroups.push(group);
                this._airlockService.updateUserGroups(_selectedProduct, groups).then(newGroups => {
                    this.possibleGroupsList = groups.internalUserGroups;
                    this._appState.setAvailableGroups(this.possibleGroupsList);
                    this.internalUserGroups.push(group);
                    this.loading = false;
                    this._airlockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New group added"
                    });
                }).catch(error => {
                    console.log(error);
                    this.loading = false;
                    let errMessage = error._body || error;
                    let errorMessage = `Failed to add group: ${errMessage}`;
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                });
            }
        });
    }
}
