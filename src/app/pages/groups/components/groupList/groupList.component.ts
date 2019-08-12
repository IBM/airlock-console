import {Component, ViewEncapsulation, EventEmitter, Output} from '@angular/core';

import {TransparentSpinner} from "../../../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {AirlockService} from "../../../../services/airlock.service";
import {UserGroups} from "../../../../model/user-groups";
import {Group} from "../../group";
import {Feature} from "../../../../model/feature";
import {BaThemeConfigProvider} from "../../../../theme/theme.configProvider";
import {Product} from "../../../../model/product";
import {TreeModel} from "ng2-branchy";
import {AuthorizationService} from "../../../../services/authorization.service";
import {Season} from "../../../../model/season";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";
import {FeatureUtilsService} from "../../../../services/featureUtils.service";
import {GlobalState} from "../../../../global.state";
import {GroupUsage} from "../../../../model/groupUsage";

@Component({
    selector: 'group-list',
    styles: [require('./groupList.scss')],
    template: require('./groupList.html')
})
export class GroupList {

    public dashboardColors = this._baConfig.get().colors.dashboard;

    _selectedProduct : Product = null;
    public todoList:Array<any>;
    public groupList:UserGroups;
    public itemsList:Array<Group>;
    public itemsDic:{};
    public groupsDic:{};
    public newTodoText:string = '';
    public selectedGroup: Group;
    public selectedUsage: GroupUsage;
    public featuresList:Array<Feature>;
    private isDisplayOnly:boolean = false;
    private isViewer:boolean = false;

    @Output() featureSelected:EventEmitter<Group>= new EventEmitter<Group>();
    @Output() usageSelected:EventEmitter<GroupUsage>= new EventEmitter<GroupUsage>();
    loading:boolean;
    constructor(private _baConfig:BaThemeConfigProvider, private _airlockService:AirlockService, private _spinner:TransparentSpinner,
                private authorizationService:AuthorizationService, public modal: Modal, private _appState: GlobalState) {
        this.isDisplayOnly = _airlockService.isEditor() || _airlockService.isViewer();
        this.isViewer = _airlockService.isViewer() && _airlockService.isGlobalUserViewer();
    }
    setSelected(group:Group) {
        this.selectedGroup = group;
        if (group && group.name && this.groupsDic) {
            this.selectedUsage = this.groupsDic[group.name];
        } else {
            this.selectedUsage = null;
        }

        this.featureSelected.emit(group);
        this.usageSelected.emit(this.selectedUsage);
    }

    deleteGroup(event, item:Group) {
        if(event) {
            event.stopPropagation();
        }
        if (item.hasFeatures) {
            this.modal.alert()
                .title("Cannot delete a group with active features")
                .open();
            // alert("Cannot delete a group with active features");
        } else {
            this.modal.confirm()
                .title(`Are you sure you want to delete the ${item.name} group?`)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(result => {
                    console.log("confirmed");
                    var index = this.groupList.internalUserGroups.indexOf(item.name, 0);
                    if (index > -1) {
                        this.groupList.internalUserGroups.splice(index, 1);
                        this.loading=true;
                        this._airlockService.updateUserGroups(this._selectedProduct, this.groupList).then(resp =>{
                            this.setSelected(null);
                            this.refreshTable();
                            this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Group deleted"});
                        }).catch(error => {
                            this.loading = false;
                            let errorMessage = FeatureUtilsService.parseErrorMessage(error);
                            this._airlockService.notifyDataChanged("error-notification",errorMessage);
                        });
                    }
                }) // if were here ok was clicked.
                .catch(err => console.log("CANCELED"));
            // if (confirm(`Are you sure you want to delete the ${item.name} group?`)) {
            //     var index = this.groupList.internalUserGroups.indexOf(item.name, 0);
            //     if (index > -1) {
            //         this.groupList.internalUserGroups.splice(index, 1);
            //         this.loading=true;
            //         this._airlockService.updateUserGroups(this.groupList).then(resp =>{
            //             this.setSelected(null);
            //             this.refreshTable();
            //             this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"Group deleted"});
            //         }).catch(error => {
            //             this.loading = false;
            //             let errorMessage = `Failed to delete group: ${error}`;
            //             this._airlockService.notifyDataChanged("error-notification",errorMessage);
            //         });
            //     }
            //
            // }
        }
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct','user-groups');
    }
    ngOnInit() {
        this._selectedProduct = this._appState.getData('features.currentProduct');
        this._appState.subscribe('features.currentProduct','user-groups',(product) => {
            console.log("product changed");
            this._selectedProduct = product;
            this.refreshTable();
        });
        this.refreshTable();
    }

    refreshTable() {
        this.loading = true;
        this._airlockService.getUserGroups(this._selectedProduct, error => {

        }).then(groups =>{

            this.groupList = groups as UserGroups;
            var groupArr = this.groupList.internalUserGroups;
            let items = this.createItemsList(groupArr);

            this.itemsList = items;

            // this._airlockService.getAllFeatures(this._selectedProduct).then((features) =>{
            this._airlockService.getUserGroupsUsage(this._selectedProduct).then((groupUsagesObj) =>{
                // this.fillDependantFeatures(features);
                this.fillDepandantUsages(groupUsagesObj.internalUserGroups);
                this.loading = false;
                if (this.selectedGroup) {
                    for (let item of this.itemsList) {
                        let gItem:Group = item;
                        if (gItem.name==this.selectedGroup.name) {
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
    private fillDependantFeatures(struct:any) {
        let products = struct.products as Product[];

        for (let p of products) {
            for (let s of p.seasons) {
                console.log("season::");
                console.log(s);
                console.log(p);
                let season:Season = s;
                let sName = this.getSeasonName(season);
                for (let feature of s.root.features) {
                    this.addFeatureToGroups(feature,p.name,sName);
                }
             }
         }
    }

    getSeasonName(item:Season) {
        if (item) {
            let max = item.maxVersion? item.maxVersion : "";
            let min = item.minVersion? item.minVersion : "";
            if (max=="") {
                return min + " and up";
            } else {
                return min + " to " +max;
            }
        } else {
            return "";
        }
    }
    private addFeatureToGroups(feature:Feature, product:string, season:string){
        if (feature.type=='FEATURE' || feature.type=='CONFIGURATION_RULE') {
            let groups = feature.internalUserGroups;
            for (let gName of groups) {
                let group = this.itemsDic[gName] as Group;
                if (group) {
                    group.hasFeatures = true;
                    let root:TreeModel = group.features;
                    root.value = "Features using this group";
                    if (!root.children) {
                        root.children = [];
                    }
                    let productModel = this._findOrCreateModel(product,root.children);
                    if (!productModel.children) {
                        productModel.children = [];
                    }
                    let seasonModel = this._findOrCreateModel(season,productModel.children);
                    if (!seasonModel.children) {
                        seasonModel.children = [];
                    }
                    let featureModel: TreeModel = {value:feature.name};
                    seasonModel.children.push(featureModel);
                }

            }
        }
        if(feature.features) {
            for( let subFeature of feature.features) {
                this.addFeatureToGroups(subFeature,product,season);
            }
        }

        if (feature.configurationRules) {
            for( let subFeature of feature.configurationRules) {
                this.addFeatureToGroups(subFeature,product,season);
            }
        }

    }
    private _findOrCreateModel(name:string, arr:Array<TreeModel>): TreeModel {
        for (let item of arr) {
            if (item.value && item.value==name) {
                return item;
            }
        }
        let toRet = {} as TreeModel;
        toRet.value = name;
        arr.push(toRet);
        return toRet;
    }

    private createItemsList(groupArr: string[]) : Array<Group> {
        let toRet = [];
        let groupsMap = {};
        groupArr.forEach((item) => {
            var group = new Group();
            group.name = item;
            group.hasFeatures = false;
            group.features = {
                value: 'This group is not being used',
                children: null
            };
            group.isOpen = false;
            toRet.push(group);
            groupsMap[item] = group;
        });
        this.itemsDic=groupsMap;
        return toRet;

    }

    cellClicked(item:Group) {
        this.setSelected(item);
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

    addGroupItem($event) {
        if (($event.which === 1 || $event.which === 13) && this.newTodoText.trim() != '') {


            this._addGroupItem();
        }
    }

    _addGroupItem() {
        console.log("addGroupItem:"+this.newTodoText);
        console.log(this.groupList.internalUserGroups);
        if (this.newTodoText.trim() != '') {
            let newItem = this.newTodoText;
            let oldInternalUserGroup = [].concat(this.groupList.internalUserGroups);
            this.groupList.internalUserGroups.push(newItem);
            this.loading=true;
            this._airlockService.updateUserGroups(this._selectedProduct, this.groupList).then(newGroups => {
                this.refreshTable();
                this.loading = false;
                this._airlockService.notifyDataChanged("success-notification",{title:"Success",message:"New group added"});
            }).catch(error => {
                this.groupList.internalUserGroups = oldInternalUserGroup;
                console.log(error);
                this.loading = false;
                let errMessage = error._body || error;
                let errorMessage = `Failed to add group: ${errMessage}`;
                this._airlockService.notifyDataChanged("error-notification",errorMessage);
            });
            this.newTodoText = '';
        }

    }
    private _getRandomColor() {
        let colors = Object.keys(this.dashboardColors).map(key => this.dashboardColors[key]);

        var i = Math.floor(Math.random() * (colors.length - 1));
        return colors[i];
    }
}
