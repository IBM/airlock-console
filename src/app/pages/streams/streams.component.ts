import {Component, ViewChild} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Feature} from "../../model/feature";
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {Experiment} from "../../model/experiment";
import {StringsService} from "../../services/strings.service";
import {Stream} from "../../model/stream";
import {StreamsData} from "../../model/streamsData";
import {AddStreamModal} from "../../@theme/modals/addStreamModal";
import {NbDialogService} from "@nebular/theme";
import {EditStreamsDataModal} from "../../@theme/modals/editStreamsDataModal";
import {EditUtilityModal} from "../../@theme/modals/editUtilityModal";
import {Utility} from "../../model/utility";
import {ActivatedRoute} from "@angular/router";
import {EditStreamModal} from "../../@theme/modals/editStreamModal";
import {Branch} from "../../model/branch";

@Component({
    selector: 'streams',
    styleUrls: ['./streams.scss'],
    templateUrl: './streams.html',
    animations: [
        trigger('slideInOut', [
            state('in', style({
                transform: 'translate3d(0, 0, 0)'
            })),
            state('out', style({
                transform: 'translate3d(100%, 0, 0)'
            })),
            transition('in => out', animate('400ms ease-in-out')),
            transition('out => in', animate('400ms ease-in-out'))
        ]),
    ]
})


export class StreamsPage {
    streams: Stream[] = [];
    streamsData: StreamsData;
    valid: boolean = true;
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    showDevFeatures: boolean = true;
    scrolledToSelected = false;
    filterlistDict: { string: Array<string> } = {string: []};
    editDialogOpen: boolean = false;
    openStream: Array<string> = [];
    showConfig: boolean = true;
    loading: boolean = false;
    showDialog = false;
    searchQueryString: string = null;
    possibleUserGroupsList: Array<string> = [];
    selectedSeason: Season;

    @ViewChild("editInline") editInline: EditStreamModal;
    inlineMode: boolean = false;

    private DUMMY_APP_MAX_VERSION: string = '100';

    public status: { isopen: boolean } = {isopen: false};
    private pathStreamId: any;
    private selectedBranch: any;

    constructor(private _airlockService: AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService,
                private route: ActivatedRoute
    ) {
        this.loading = true;
    }

    ngOnInit() {
        this.selectedSeason = this._appState.getData('features.currentSeason');
        this.loading = false;
        this.selectedSeason = this._appState.getData('features.currentSeason');
        this.selectedBranch = this._appState.getData('features.currentBranch');
        if (this.selectedBranch) {
            this.onBranchSelection(this.selectedBranch);
        }
        this._appState.subscribe('features.currentSeason', 'features', (season) => {
            this.selectedSeason = season;
        });
        this._appState.subscribe('features.currentBranch', 'features', (branch) => {
            this.onBranchSelection(branch);
        });
        this.route.params.subscribe(params => {
            let prodId = params.prodId;
            let seasonId = params.seasonId;
            let streamId = params.streamId;
            let branchId = params.branchId;
            if (prodId && seasonId && branchId && streamId) {
                console.log("going to edit mode")
                this.pathStreamId = streamId;
                this._appState.notifyDataChanged('features.pathBranchId', branchId);
                this._appState.notifyDataChanged('features.pathSeasonId', seasonId);
                this._appState.notifyDataChanged('features.pathProductId', prodId);
            } else {
                this.pathStreamId = null;
            }
        });
        // this.loadStreams()
    }

    public onBranchSelection(branch: Branch) {
        // this.setSelectedBranch(branch);
        if (branch != null && this.selectedSeason != null && (branch.uniqueId !=  this.selectedBranch.uniqueId || this.streams.length < 1)) {
            this.loading = true;
            this._airlockService.getStreams(this.selectedSeason.uniqueId, this.selectedBranch).then(resp => {
                this.streamsData = resp;
                this.streams = resp.streams as Stream[];
                this.loading = false;
                this.valid = true;
                // this.resetFilters();
                if (this.pathStreamId) {
                    let pathStream = this.getItemWithId(this.pathStreamId);
                    if (pathStream) {
                        this.showEditStream(pathStream);
                    }
                    this.pathStreamId = null;
                }
            });
        } else  if (branch == null){
            this.valid = false;
            this.streams = [];
            this.loading = false;
        }
    }

    getItemWithId(fId: string): Stream {
        for (let stream of this.streams) {
            if (stream.uniqueId === fId){
                return stream
            }
        }
        return null;
    }

    showEditStream(stream: Stream) {

        this._airlockService.getStreamUtilitiesInfo(stream.seasonId, stream.stage, stream.minAppVersion).then(result => {
            let streamUtilitieInfo = result as string;
            this._airlockService.getStreamInputSample(stream.seasonId, stream.stage, stream.minAppVersion, stream.filter).then(result1 => {
                let processorInputSchemaSample = result1 as string;
                this._airlockService.getStreamFilterInputSample(stream.seasonId).then(result2 => {
                    let filterInputSchemaSample = result2 as string;
                    // this.hideIndicator.emit(stream);
                    this.modalService.open(EditStreamModal, {
                        closeOnBackdropClick: false,
                        context: {
                            streamsPage: this,
                            inlineMode: false,
                            visible: true,
                            stream: Stream.clone(stream),
                            processorInputSchemaSample: processorInputSchemaSample,
                            filterInputSchemaSample: filterInputSchemaSample,
                            processorUtilitiesInfo: streamUtilitieInfo,
                            //     streamCell: this,
                            historicalStreamsAllowed: this.streamsData.enableHistoricalEvents,
                        },
                    }).onClose.subscribe(confirmed => {
                        console.log("closed edit streams")
                    });
                }).catch(error => {
                    console.log(error);
                    let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema");
                    this._airlockService.notifyDataChanged("error-notification", errorMessage);
                    // this.hideIndicator.emit(error);
                });
            }).catch(error => {
                console.log(error);
                let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Stream Input Sample Schema");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
                // this.hideIndicator.emit(error);
            });
        }).catch(error => {
            console.log('Error in getting UtilityInfo');
            let errorMessage = this._airlockService.parseErrorMessage(error, "Failed to get Stream Utilitystring");
            this._airlockService.notifyDataChanged("error-notification", errorMessage);
            // this.hideIndicator.emit(error);
        });
    }

    private openStreamEditDialog(stream: Stream) {

    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions() {
        // if(this.selectedProduct == null){
        //     return false;
        // }
        return (!this._airlockService.isViewer());
    }

    isShowEditUtil() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    isShowSettings() {
        if (this.selectedSeason == null) {
            return false;
        }
        return !this._airlockService.isViewer();
    }

    onEditUtilities() {
        this.loading = true;
        this._airlockService.getUtilities(this.selectedSeason.uniqueId)
            .then(response => {
                console.log("utils");
                console.log(response);
                var utilitiesResponse = response as Utility[];
                utilitiesResponse = (utilitiesResponse == null)?[]:utilitiesResponse.filter( util => util.type == 'STREAMS_UTILITY');

                this.modalService.open(EditUtilityModal, {
                    closeOnBackdropClick: false,
                    context: {
                        utilities: utilitiesResponse,
                        season: this.selectedSeason,
                        type: 'STREAMS_UTILITY',
                    }
                });
                /*
                open(utilities: Utility[], season: Season, type: string) {
        this.loading = false;
        this.title = this.getString("edit_utils_title");
        this.isOpen = true;
        this.season = season;
        this.type=type;
        this.isDirty=false;
        this.isAddNewMode=false;
        //filter utils based on type since it returns all
        this.loadData(utilities,0);
        if(this.modalRef != null) {
            this.zone.run(() => {
                this.loaded = true;
                if (this.aceModalContainerDialog){
                    this.aceModalContainerDialog.closeDontSaveDialog();
                }
                // this.modalRef.open('lg');
            });
        }
    }
                 */
                // this._editUtilityModal.open(response, this.selectedSeason, "STREAMS_UTILITY");
                this.loading = false;
            })
            .catch(error => {
                this.loading = false;
                // alert(`Failed to update product: ${error}`)
                this._airlockService.notifyDataChanged("error-notification", `Failed to load utilities: ${error}`);
            });
    }

    onSettingsClicked() {
        this.modalService.open(EditStreamsDataModal, {
            closeOnBackdropClick: false,
            context: {
                streamsData: StreamsData.clone(this.streamsData),
                filterInputSchemaSample: "",
            },
        })
        // this._editStreamsDataModal.open(this.streamsData, "");
    }

    isViewer(): boolean {
        return this._airlockService.isViewer();
    }


    toggleDataCollectionDetails() {
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest: boolean) {

    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentSeason', 'streams');
    }

    onSeasonSelected(season: Season) {
        let currProduct = this._appState.getData('features.currentProduct');
        this._airlockService.getUserGroups(currProduct).then(response => {
            console.log(response);
            this.possibleUserGroupsList = response.internalUserGroups;
        });
        this.loadStreams()
    }

    loadStreams(stream = null) {
        if (!this._appState.canUseStreams()) {
            this.loading = false;
            this._airlockService.redirectToFeaturesPage();
            return;
        }
        if (this.selectedSeason) {
            if (FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion, "4.0")) {
                this.valid = false;
                this.streams = null;
                this.loading = false;
                let errorMessage = this.getString("streams_season_not_supported");
                this._airlockService.notifyDataChanged("error-notification", errorMessage);
            } else {
                this.loading = true;
                this._airlockService.getStreams(this.selectedSeason.uniqueId).then((streamsData) => {
                    // this.experiments = products;
                    this.streamsData = streamsData;
                    this.streams = this.streamsData.streams;
                    this.loading = false;
                    if (stream != null){
                        for (let streamItem of this.streamsData.streams)
                            if (streamItem.uniqueId === streamItem.uniqueId){
                                this.showEditInline(streamItem);
                                break;
                            }

                    }
                });
            }
        } else {
            this.loading = false;
        }

    }

    isCellOpen(expID: string): boolean {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    }

    setShowConfig(show: boolean) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }

    }

    setShowDevFeatures(show: boolean) {
        this.showDevFeatures = show;
        if (show) {
            this.filterlistDict["stage"] = [];
        } else {
            this.filterlistDict["stage"] = ["development"];
        }

    }


    public refreshTable() {
        this.loadStreams();
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        this.loading = false;
    }

    public deleteFeature(feature: Feature) {

    }

    public changeStateHandler(feature: Experiment) {
        console.log('in changeFeatureState():' + this._airlockService);
        this.loading = true;
        if (feature.stage == 'PRODUCTION') {
            feature.stage = 'DEVELOPMENT';
        } else {
            feature.stage = 'PRODUCTION';
        }
    }

    addStream() {
        this.modalService.open(AddStreamModal, {
            context : {
                streamsPage: this
            }
        }).onClose.subscribe(stream=>{
            this.loadStreams(stream);
        });
    }

    updateStreams(stream: Stream) {
        this.loadStreams();
    }

    streamsDataUpdated(data: StreamsData) {
        this.loadStreams();
    }

    canAddStream() {
        return !this._airlockService.isViewer();
    }

    public onSearchQueryChanged(term: string) {
        this.filteredItems = [];
        this.searchQueryString = term;
        this.createFilteredList();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }


    streamIsInFilter(streamID: string) {
    }


    streamChangedStatus(streamID: string) {
        console.log("stream changed status:" + streamID);
        var index = this.openStream.indexOf(streamID, 0);
        if (index > -1) {
            this.openStream.splice(index, 1);
        } else {
            this.openStream.push(streamID);
        }
    }

    createFilteredList() {
        this.filteredItems = [];
        this.selectedId = null;
        this.scrolledToSelected = false;
        this.selectedIndex = -1;
        let term = this.searchQueryString;
        if (term && term.length > 0 && this.streams) {
            for (var stream of this.streams) {
                this.isFilteredOut(stream);
            }
        }

    }

    isFilteredOut(stream: Stream): boolean {
        // console.log("is filtered out:"+this.feature.name+", " + this.searchTerm);
        if (this.shouldStreamBeFilteredOut(stream)) {
            // console.log("feature is filtered:"+this.feature.name);
            return true;
        }
        let hasSearchHit = this.isPartOfSearch(this.searchQueryString, stream);
        if (hasSearchHit) {
            this.filteredItems.push(stream.uniqueId);
        }


        return !hasSearchHit;
    }

    shouldStreamBeFilteredOut(feature: any): boolean {
        if (!this.filterlistDict) {
            return false;
        }
        let keys = Object.keys(this.filterlistDict);
        if (!keys) {
            return false;
        }
        var isFilteredOut = false;
        for (var key of keys) {
            let valuesArr = this.filterlistDict[key];
            if (feature[key] && valuesArr) {
                for (var value of valuesArr) {
                    if (feature[key].toLowerCase() == value.toLowerCase()) {
                        isFilteredOut = true;
                        break;
                    }
                }
            }
        }
        return isFilteredOut;
    }

    isPartOfSearch(term: string, stream: any): boolean {
        if (!term || term == "") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = stream.displayName ? stream.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = stream.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    showNextSearchResult(forward: boolean) {
        if (this.filteredItems.length > 0) {
            if (forward) {
                if (this.selectedIndex >= (this.filteredItems.length - 1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length - 1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    itemIsSelected(itemObj: any) {
        itemObj.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showEditInline(stream: Stream) {
        console.log("showEditExperimentInline");
        this.inlineMode = true;
        this.editInline.open(stream, null, null, null, null);
    }
    closeEditInline(value) {
        console.log("closeEditInline");
        this.inlineMode = false;
        this.loading = false;
    }

    // checkIfInView(top: number) {
    //     let windowScroll = jQuery(window).scrollTop();
    //     if (top > 0) {
    //         var offset = top - windowScroll;
    //
    //         if (offset > window.innerHeight || offset < 0) {
    //             // Not in view so scroll to it
    //             // jQuery('html,body').animate({scrollTop: offset-300}, 500);
    //             var scrollNode = document.scrollingElement ?
    //                 document.scrollingElement : document.body;
    //             scrollNode.scrollTop = top - 200;
    //             return false;
    //         }
    //     }
    //     return true;
    // }
}

