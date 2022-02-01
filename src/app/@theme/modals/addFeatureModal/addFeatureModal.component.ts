import {Component, Input} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Feature} from "../../../model/feature";
import {Rule} from "../../../model/rule";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";
import {GlobalState} from "../../../global.state";
import {ENTER} from "@angular/cdk/keycodes";
import {Observable, of} from "rxjs";
import {map} from 'rxjs/operators';


@Component({
    selector: 'add-feature-modal',
    styleUrls: [],
    templateUrl: './addFeatureModal.html',
    // encapsulation: ViewEncapsulation.None
})

export class AddFeatureModal {
    separatorKeysCodes: number[] = [ENTER];
    title: string = "Add Feature";
    subFeatureParentName: string = null;
    loading: boolean = false;
    feature: Feature;
    @Input() valid: boolean;
    otherFeatureToCreateMX: Feature = null;
    mxGroupToAdd: Feature = null;
    mxItemNames: Array<string> = [];
    groups: string = "";
    seasonId: string;
    branchId: string;
    stam = "";
    rootId: string;
    possibleGroupsList: Array<any> = [];
    parentId: string;
    parentNamespace: string = "";
    newItemInMXIndex: number = 0;
    filteredOptions$: Observable<string[]>;
    verticalGroups = false;

    constructor(private _airLockService: AirlockService,
                private _featureUtils: FeatureUtilsService,
                private _stringsSrevice: StringsService,
                private toastrService: NbToastrService,
                private _appState: GlobalState,
                protected modalRef: NbDialogRef<AddFeatureModal>) {
        this.loading = true;
        this.seasonId = _appState.getCurrentSeason();
        this.branchId = _appState.getCurrentBranch();
        this.possibleGroupsList = _appState.getAvailableGroups();

        this.filteredOptions$ = of(this.possibleGroupsList);
        this.initFeature();
    }

    ngOnInit() {
        if (this.parentNamespace === '') {
            this.feature.namespace = this.parentNamespace;
        }
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

    initFeature() {
        this.feature = new Feature();
        this.feature.name = "";
        this.feature.namespace = "";
        this.feature.stage = "DEVELOPMENT";
        this.feature.type = "FEATURE";
        this.feature.rule = new Rule();
        this.feature.rule.ruleString = "";
        this.feature.defaultIfAirlockSystemIsDown = false;
        this.feature.description = "";
        this.feature.parent = null;
        this.feature.enabled = false;
        this.feature.rolloutPercentage = 100;
        this.feature.creator = this._airLockService.getUserName();
        this.feature.owner = this._airLockService.getUserName();
        this.feature.minAppVersion = "";
        this.feature.internalUserGroups = [];
        this.feature.orderingRules = [];
        this.groups = "";
        this.loading = false;
        this.verticalGroups = false;
    }

    isShownADDButton() {
        return (!this.isViewer());
    }

    isValid() {
        if (this.feature.name == null || this.feature.name.length == 0) {
            return false;
        }
        return !(this.feature.namespace == null || this.feature.namespace.length == 0);
    }

    saveNewMXGWithNewFeatureAndOther() {
        this.loading = true;
        const mxGroup: Feature = new Feature();
        mxGroup.seasonId = this.seasonId;
        mxGroup.type = "MUTUAL_EXCLUSION_GROUP";
        console.log(this.feature);
        const newFeature: Feature = Feature.clone(this.feature);
        console.log(newFeature);
        console.log("before add MX");
        const otherFeature: Feature = this.otherFeatureToCreateMX;
        //clean for next time
        this.otherFeatureToCreateMX = null;
        //Add MX,New Feature and then change MX feature to be other and the new features
        this._airLockService.addFeature(mxGroup, this.seasonId, this.branchId, this.parentId).then(result => {
            let fetchedMX = (result as Feature);
            console.log("after add MX");
            console.log(fetchedMX);
            const mxId: string = fetchedMX.uniqueId;

            this._airLockService.addFeature(newFeature, this.seasonId, this.branchId, mxId).then(result1 => {
                console.log("after add new feature");
                let newFetchedFeature: Feature = (result1 as Feature);
                console.log("newFeature");

                this._airLockService.getFeature(mxId, this.branchId).then(result2 => {
                    fetchedMX = (result2 as Feature);
                    this._airLockService.getFeature(newFetchedFeature.uniqueId, this.branchId).then(result3 => {
                        newFetchedFeature = (result3 as Feature);
                        fetchedMX.features = [otherFeature, newFetchedFeature];
                        this._airLockService.updateFeature(fetchedMX, this.branchId).then(() => {
                            this.loading = false;
                            this.close(fetchedMX);
                        }).catch(
                            error => {
                                console.log(`Failed to add feature: ${error}`);
                                this.handleError(error);
                            }
                        );
                    }).catch(
                        error => {
                            console.log(`Failed to add feature: ${error}`);
                            this.handleError(error);
                        }
                    );

                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );

            }).catch(
                error => {
                    console.log(`Failed to add feature: ${error}`);
                    this.handleError(error);
                }
            );
        }).catch(
            error => {
                console.log(`Failed to add feature: ${error}`);
                this.handleError(error);
            }
        );
    }

    saveInExistingMX() {
        this.loading = true;
        const newFeature: Feature = Feature.clone(this.feature);
        const newItemPlace: number = this.newItemInMXIndex;
        const localmxGroupToAdd: Feature = this.mxGroupToAdd;
        this.mxGroupToAdd = null;
        this.newItemInMXIndex = 0;

        console.log("new place:" + newItemPlace);
        this._airLockService.addFeature(newFeature, this.seasonId, this.branchId, this.parentId).then(result => {
            console.log("after add new feature");
            let newFetchedFeature: Feature = (result as Feature);
            this._airLockService.getFeature(localmxGroupToAdd.uniqueId, this.branchId).then(result1 => {
                const fetchedMX: Feature = (result1 as Feature);
                this._airLockService.getFeature(newFetchedFeature.uniqueId, this.branchId).then(result2 => {
                    newFetchedFeature = result2;
                    fetchedMX.features.splice(newItemPlace, 0, newFetchedFeature);
                    fetchedMX.features.splice(fetchedMX.features.length - 1, 1);
                    console.log(fetchedMX);
                    this._airLockService.updateFeature(fetchedMX, this.branchId).then(() => {
                        this.loading = false;
                        this.close(fetchedMX);
                    }).catch(
                        error => {
                            console.log(`Failed to add feature: ${error}`);
                            this.handleError(error);
                        }
                    );
                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );
            }).catch(
                error => {
                    console.log(`Failed to add feature: ${error}`);
                    this.handleError(error);
                }
            );
        }).catch(
            error => {
                console.log(`Failed to add feature: ${error}`);
                this.handleError(error);
            }
        );
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    save() {
        if (this.isValid()) {
            this.feature.name = this.feature.name.trim();
            let featName = this.feature.name;
            this.loading = true;
            // this.feature.internalUserGroups = this.groups.split(",");
            if (this.otherFeatureToCreateMX != null) {
                this.saveNewMXGWithNewFeatureAndOther();
            } else if (this.mxGroupToAdd != null) {
                this.saveInExistingMX();
            } else {
                this._airLockService.addFeature(this.feature, this.seasonId, this.branchId, this.parentId).then(() => {
                    this.loading = false;
                    this.close(this.feature);
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "Added the feature " + featName
                    });
                }).catch(
                    error => {
                        console.log(`Failed to add feature: ${error}`);
                        this.handleError(error);
                    }
                );
            }

        } else {
            this.create("Feature name and namespace are required.");
        }
    }

    openAsAddWithOtherFeatureToMX(parentId: string, otherFeature: Feature) {
        this.clean();
        this.title = "Add Feature To New Mutual Exclusion Group";
        this.otherFeatureToCreateMX = otherFeature;
    }

    clean() {
        this.initFeature();

        this.title = "Add Feature";
        this.mxGroupToAdd = null;
        this.newItemInMXIndex = 0;
        this.otherFeatureToCreateMX = null;
        this.subFeatureParentName = null;
    }

    remove(fruit: string): void {
        const index = this.feature.internalUserGroups.indexOf(fruit);

        if (index >= 0) {
            this.feature.internalUserGroups.splice(index, 1);
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.possibleGroupsList.filter(group => group.toLowerCase().indexOf(filterValue) === 0);
    }

    selectItemToBeAfter(index: number) {
        console.log("index:" + index);
        this.newItemInMXIndex = index;
    }

    openInExistingXM(mxGroupToAdd: Feature) {
        this.clean();
        this.title = "Add Feature To Mutual Exclusion  Group";
        this.mxGroupToAdd = mxGroupToAdd;
        this.mxItemNames = ["-- Add As First --"];
        for (let item of mxGroupToAdd.features) {
            if (item.type == 'MUTUAL_EXCLUSION_GROUP') {
                this.mxItemNames.push(this._featureUtils.getMXDisplayName(item));
            } else {
                this.mxItemNames.push(this._featureUtils.getFeatureDisplayName(item));
            }
        }
    }

    openAsAddSubFeature(parentId: string, parentName: string, parentNamespace: string) {
        this.clean();
        this.title = "Add Subfeature";
        this.subFeatureParentName = parentName;
        this.feature.namespace = parentNamespace;
    }

    open(parentId: string) {
        this.clean();
        this.title = "Add Feature";
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
        // console.log(error);
        // if(errorMessage != null && errorMessage.indexOf("{") == 0 && errorMessage.indexOf("}") == errorMessage.length -1){
        //     errorMessage = errorMessage.substring(1,errorMessage.length -1);
        // }
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

