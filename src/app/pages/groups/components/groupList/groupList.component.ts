import {Component, EventEmitter, Output} from '@angular/core';

import {TransparentSpinner} from "../../../../@theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {AirlockService} from "../../../../services/airlock.service";
import {UserGroups} from "../../../../model/user-groups";
import {Group} from "../../group";
import {Feature} from "../../../../model/feature";
import {BaThemeConfigProvider} from "../../../../@theme/theme.configProvider";
import {Product} from "../../../../model/product";
import {AuthorizationService} from "../../../../services/authorization.service";
import {Season} from "../../../../model/season";
import {FeatureUtilsService} from "../../../../services/featureUtils.service";
import {GlobalState} from "../../../../global.state";
import {GroupUsage} from "../../../../model/groupUsage";
import {ConfirmActionModal} from "../../../../@theme/modals/confirmActionModal";
import {NbDialogService} from "@nebular/theme";
import {AddGroupModal} from "../../../../@theme/modals/addGroupModal";

//Modal + third party
// import {TreeModel} from "ng2-branchy";
//

@Component({
    selector: 'group-list',
    styleUrls: ['./groupList.scss'],
    templateUrl: './groupList.html'
})
export class GroupList {

    public dashboardColors = this._baConfig.get().colors.dashboard;

    _selectedProduct: Product = null;
    public todoList: Array<any>;
    public groupList: UserGroups;
    public itemsList: Array<Group>;
    public itemsDic: {};
    public groupsDic: {};
    public newTodoText: string = '';
    public selectedGroup: Group;
    public selectedUsage: GroupUsage;
    public featuresList: Array<Feature>;
    private isDisplayOnly: boolean = false;
    public isViewer: boolean = false;
    searchQuery: string;

    @Output() featureSelected: EventEmitter<Group> = new EventEmitter<Group>();
    @Output() usageSelected: EventEmitter<GroupUsage> = new EventEmitter<GroupUsage>();
    loading: boolean;

    constructor(private _baConfig: BaThemeConfigProvider,
                private _airlockService: AirlockService,
                private _spinner: TransparentSpinner,
                private authorizationService: AuthorizationService,
                private _appState: GlobalState,
                private modalService: NbDialogService) {
        this.isDisplayOnly = _airlockService.isEditor() || _airlockService.isViewer();
        this.isViewer = _airlockService.isViewer() && _airlockService.isGlobalUserViewer();
    }

    setSelected(group: Group) {
        this.selectedGroup = group;
        if (group && group.name && this.groupsDic) {
            this.selectedUsage = this.groupsDic[group.name];
        } else {
            this.selectedUsage = null;
        }

        this.featureSelected.emit(group);
        this.usageSelected.emit(this.selectedUsage);
    }

    deleteGroup(event: Event, item: Group) {
        if (event) {
            event.stopPropagation();
        }
        if (item.hasFeatures) {
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    shouldDisplaySubmit: false,
                    title: 'Cannot delete a group with active features',
                    defaultTitle: 'OK'
                }
            })
            // this.modal.alert()
            //     .title("Cannot delete a group with active features")
            //     .open();
            // alert("Cannot delete a group with active features");
        } else {
            this.modalService.open(ConfirmActionModal, {
                closeOnBackdropClick: false,
                context: {
                    message: `Are you sure you want to delete the ${item.name} group?`,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    console.log("confirmed");
                    var index = this.groupList.internalUserGroups.indexOf(item.name, 0);
                    if (index > -1) {
                        this.groupList.internalUserGroups.splice(index, 1);
                        this.loading = true;
                        this._airlockService.updateUserGroups(this._selectedProduct, this.groupList).then(resp => {
                            this.setSelected(null);
                            this.refreshTable();
                            this._airlockService.notifyDataChanged("success-notification", {
                                title: "Success",
                                message: "Group deleted"
                            });
                        }).catch(error => {
                            this.loading = false;
                            let errorMessage = FeatureUtilsService.parseErrorMessage(error);
                            this._airlockService.notifyDataChanged("error-notification", errorMessage);
                        });
                    }
                }
            });
        }
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'user-groups');
    }

    ngOnInit() {
        this._selectedProduct = this._appState.getData('features.currentProduct');
        this._appState.subscribe('features.currentProduct', 'user-groups', (product) => {
            console.log("product changed");
            this._selectedProduct = product;
            this.refreshTable();
        });
        this.refreshTable();
    }

    refreshTable() {
        this.loading = true;
        this._airlockService.getUserGroups(this._selectedProduct, error => {

        }).then(groups => {

            this.groupList = groups as UserGroups;
            var groupArr = this.groupList.internalUserGroups;
            let items = this.createItemsList(groupArr);

            this.itemsList = items;

            // this._airlockService.getAllFeatures(this._selectedProduct).then((features) =>{
            this._airlockService.getUserGroupsUsage(this._selectedProduct).then((groupUsagesObj) => {
                // this.fillDependantFeatures(features);
                this.fillDepandantUsages((groupUsagesObj as any).internalUserGroups);
                this.loading = false;
                if (this.selectedGroup) {
                    for (let item of this.itemsList) {
                        let gItem: Group = item;
                        if (gItem.name == this.selectedGroup.name) {
                            this.setSelected(gItem);
                        }
                    }
                } else {
                    this.setSelected(null);
                }
                this.setSelected(this.selectedGroup);
            });

        });
    }

    private fillDepandantUsages(usages: GroupUsage[]) {
        this.groupsDic = {};
        for (let item of usages) {
            this.groupsDic[item.internalUserGroup] = item;
        }
    }

    private fillDependantFeatures(struct: any) {
        let products = struct.products as Product[];

        for (let p of products) {
            for (let s of p.seasons) {
                console.log("season::");
                console.log(s);
                console.log(p);
                let season: Season = s;
                let sName = this.getSeasonName(season);
                for (let feature of s.root.features) {
                    this.addFeatureToGroups(feature, p.name, sName);
                }
            }
        }
    }

    getSeasonName(item: Season) {
        if (item) {
            let max = item.maxVersion ? item.maxVersion : "";
            let min = item.minVersion ? item.minVersion : "";
            if (max == "") {
                return min + " and up";
            } else {
                return min + " to " + max;
            }
        } else {
            return "";
        }
    }

    private addFeatureToGroups(feature: Feature, product: string, season: string) {
        if (feature.type == 'FEATURE' || feature.type == 'CONFIGURATION_RULE') {
            let groups = feature.internalUserGroups;
            for (let gName of groups) {
                let group = this.itemsDic[gName] as Group;
                if (group) {
                    group.hasFeatures = true;
                    // let root: TreeModel = group.features;
                    // root.value = "Features using this group";
                    // if (!root.children) {
                    //     root.children = [];
                    // }
                    // let productModel = this._findOrCreateModel(product, root.children);
                    // if (!productModel.children) {
                    //     productModel.children = [];
                    // }
                    // let seasonModel = this._findOrCreateModel(season, productModel.children);
                    // if (!seasonModel.children) {
                    //     seasonModel.children = [];
                    // }
                    // let featureModel: TreeModel = {value: feature.name};
                    // seasonModel.children.push(featureModel);
                }

            }
        }
        if (feature.features) {
            for (let subFeature of feature.features) {
                this.addFeatureToGroups(subFeature, product, season);
            }
        }

        if (feature.configurationRules) {
            for (let subFeature of feature.configurationRules) {
                this.addFeatureToGroups(subFeature, product, season);
            }
        }

    }

    // private _findOrCreateModel(name: string, arr: Array<TreeModel>): TreeModel {
    //     for (let item of arr) {
    //         if (item.value && item.value == name) {
    //             return item;
    //         }
    //     }
    //     let toRet = {} as TreeModel;
    //     toRet.value = name;
    //     arr.push(toRet);
    //     return toRet;
    // }


    private createItemsList(groupArr: string[]): Array<Group> {
        let toRet = [];
        let groupsMap = {};
        groupArr.forEach((item) => {
            var group = new Group();
            group.name = item;
            group.hasFeatures = false;
            // group.features = {
            //     value: 'This group is not being used',
            //     children: null
            // };
            group.isOpen = false;
            if (this.searchQuery != null && this.searchQuery.length != 0){
                if (group.name.toLowerCase().includes(this.searchQuery.toLowerCase())){
                    toRet.push(group);
                }
            } else {
                toRet.push(group);
            }
            groupsMap[item] = group;
        });
        this.itemsDic = groupsMap;
        return toRet;

    }

    cellClicked(item: Group) {
        // this.setSelected(item);
    }


    addToDoItem($event) {

        if (($event.which === 1 || $event.which === 13) && this.newTodoText.trim() != '') {

            this.todoList.unshift({
                text: this.newTodoText,
                color: this._getRandomColor(),
            });
            this.newTodoText = '';
        }
    }

    addGroupItem() {
        this.modalService.open(AddGroupModal, {
            closeOnBackdropClick: false,
            context: {
                selectedProduct: this._selectedProduct,
                groupList: this.groupList
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                this.refreshTable();
            }
        });
    }

    private _getRandomColor() {
        let colors = Object.keys(this.dashboardColors).map(key => this.dashboardColors[key]);

        var i = Math.floor(Math.random() * (colors.length - 1));
        return colors[i];
    }

    filterGroups() {
        var groupArr = this.groupList.internalUserGroups;
        let items = this.createItemsList(groupArr);
        this.itemsList = items;
    }
}
