import {Component, ViewEncapsulation, ViewChild} from '@angular/core';

import {AirlockService} from "../../../services/airlock.service";
import {AboutModal} from "../../airlock.components/aboutModal/aboutModal.component";
import {ProfileModal} from "../../airlock.components/profileModal/profileModal.component";
import {GlobalState} from "../../../global.state";
import {Season} from "../../../model/season";
import {Product} from "../../../model/product";
import {FeaturesPage} from "../../../pages/featuresPage/featuresPage.component";
import {convertActionBinding} from "@angular/compiler/src/compiler_util/expression_converter";
import {Branch} from "../../../model/branch";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {StringsService} from "../../../services/strings.service";
import {AddBranchModal} from "../../airlock.components/addBranchModal/addBranchModal.component";
import {User} from "../../../model/user";

@Component({
    selector: 'ba-page-top',
    styles: [require('./baPageTop.scss')/*, require('./animations.scss')*/],
    template: require('./baPageTop.html'),
    encapsulation: ViewEncapsulation.None
})
export class BaPageTop {

    @ViewChild('aboutModal')
    aboutModal:  AboutModal;
    @ViewChild('profileModal')
    profileModal: ProfileModal;
    @ViewChild('addBranchModal')
    addBranchModal: AddBranchModal;

    public isScrolled:boolean = false;
    public userName:string = "";
    public userRole:string = "";
    //product/season/branch selection
    products: Array<Product>;
    selectedProduct: Product;
    seasons: Array<Season>;
    branches: Array<Branch>;
    selectedSeason: Season;
    selectedBranch:Branch;
    productDropDownWidth: string = '1000px';
    showSelection: boolean = false;
    enableProduct: boolean = true;
    enableSeason: boolean = true;
    showBranches: boolean = true;
    showRole: boolean = true;
    loading: boolean = false;
    enableBranches: boolean = true;
    public items:Array<string> = ['Master', 'Some branch', 'RIP Johnatan schnider'];
    avatars:Array<string> = ['zia','Bender','Fry','homer','leela','Marge','morty','Rick','Roger_Smith','shadow_white','cartman','cat','cow','dude','girl','lisa','man','owl','taco','tutsplus','monkey','idkfa'];
    avatar:string = "shadow_white";
    private value:any = {};
    private _disabledV:string = '0';
    private disabled:boolean = false;
    staticMode:boolean = false;

    constructor(private _state:GlobalState,private airlockService:AirlockService, private _stringsSrevice: StringsService) {
        this.userName = airlockService.getUserName();
        this.updateUserRole();
        this.staticMode = this.airlockService.isStaticMode();
    }
    updateUserRole(){
        this.userRole = this.airlockService.getUserRole();
        if(this.airlockService.isProductLead()){
            this.userRole = "Product Lead";
        }
        if(this.airlockService.isViewer() && this.airlockService.isUserHasStringTranslateRole()){
            this.userRole = "Translation Specialist"
        }
    }
    getSeasonsForSelect():any[] {
        var toRet = [];
        if (this.selectedSeason) {
            let selected = {id:this.selectedSeason,
                text:this.getSeasonName(this.selectedSeason)};
            toRet.push(selected);
        }
        if (this.seasons) {
            for (var season of this.seasons) {
                // if (season != this.selectedSeason) {
                if(this.selectedSeason == null || season.uniqueId!=this.selectedSeason.uniqueId) {

                    let seasonObj = {id:season,
                        text:this.getSeasonName(season)};
                    toRet.push(seasonObj);
                }

            }
        }
        return toRet;
    }

    getBranchesForSelect():any[] {
        var toRet = [];
        if (this.selectedBranch) {
            let selected = {id:this.selectedBranch,
                text:this.selectedBranch.name};
            toRet.push(selected);
        }
        if (this.branches) {
            for (var branch of this.branches) {
                // if (branch != this.selectedBranch) {
                    if(this.selectedBranch == null || branch.uniqueId!=this.selectedBranch.uniqueId) {

                        let seasonObj = {id:branch,
                        text:branch.name};
                    toRet.push(seasonObj);
                }
            }
        }
        return toRet;
    }

    getProductsForSelect():any[] {
        var toRet = [];
        if (this.selectedProduct) {
            let selected = {id:this.selectedProduct, text:this.selectedProduct.name};
            toRet.push(selected);
        }
        if (this.products) {
            for (var product of this.products) {
                if(this.selectedProduct == null || product.uniqueId!=this.selectedProduct.uniqueId) {
                    let productObj = {id:product,
                        text:product.name};
                    toRet.push(productObj);
                }
            }
        }
        return toRet;
    }

    getSelectedProductForSelect():any {
        if (this.selectedProduct) {
            return [{id:this.selectedProduct, text:this.selectedProduct.name}];
        }
        return [];
    }

    selectSeasonFromSelect(seasonObj:any) {
        if (seasonObj)  {
            if (seasonObj.id && seasonObj.id != this.selectedSeason) {
                this.selectSeason(seasonObj.id);
            }

        }
    }

    selectBranchFromSelect(branchObj:any) {
        if (branchObj)  {
            if (branchObj.id && branchObj.id != this.selectedBranch) {
                this.loading = true;
                this.selectBranch(branchObj.id);
                setTimeout(() => {
                    this.loading = false, 0.5
                });

            }

        }
    }

    selectProductFromSelect(productObj:any) {
        if (productObj) {
            if (productObj.id && productObj.id != this.selectedProduct) {
                this.selectProduct(productObj.id);
            }
        }
    }
    public getSelectedBranch() {
        return this.selectedBranch;
    }
    public selected(value:any):void {
        console.log('Selected value is: ', value);
    }

    public refreshValue(value:any):void {
        console.log('refreshValue value is: ', value);
        this.value = value;
    }
    mouseOver() {
        this.showSelection = true;
    }

    mouseOut() {
        this.showSelection = false;
    }
    ngOnInit() {
        let currSeason = this._state.getData('features.currentSeason');
        let currBranch = this._state.getData('features.currentBranch');
        let isLatestStr = this._state.getData('features.isLatestSeason');
        let isLatest = (isLatestStr && isLatestStr=="true")? true : false;
        console.log("got saved season!!!");
        console.log(currSeason);
        this.initData(currSeason, isLatest, true,null, currBranch);
        // this._state.notifyDataChanged('menu.activeLink', this._service.getCurrentItem());
        let activeItem = this._state.getData('menu.activeLink');
        this.setByPage(activeItem);
        this._state.subscribe('menu.activeLink','bapagetop', (activeItem) => {
            this.setByPage(activeItem);
        });
        this._state.subscribe('menu.selectedLink','bapagetop', (activeItem) => {
            this.loading = true;
            this.refreshCurrentState();
            setTimeout(() => {
                this.loading = false, 0.5
            });
        });

        this._state.subscribe('features.currentProductbyPage','bapagetop',(product) => {
            console.log("subsrive features.currentProduct");
            let currSeason = this._state.getData('features.currentSeason');
            this.loading = true;
            this.initData(null,true,true,product);
        });

        let avatar = this._state.getData('console.currentAvatar');
        if (avatar && avatar.length > 0) {
            this.avatar = avatar;
        } else if (this.airlockService.getUserName()=="Esteban Zia") {
            this.avatar = "zia";
        }
    }

    setByPage(activeItem) {
        console.log("ACTIVE-ITEM:"+activeItem);
        let title = activeItem.title;
        switch (title) {
            case "Features":
                this.enableBranches = true;
                this.enableSeason = true;
                this.enableProduct = true;
                this.showRole = true;
                break;
            case "Entitlements":
                this.enableBranches = true;
                this.enableSeason = true;
                this.enableProduct = true;
                this.showRole = true;
                break;
            case "Translations":
                this.enableBranches = false;
                this.enableSeason = true;
                this.enableProduct = true;
                this.showRole = true;
                break;
            case "Experiments":
                this.enableProduct = true;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "Streams":
                this.enableProduct = true;
                this.enableSeason = true;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "Notifications":
                this.enableProduct = true;
                this.enableSeason = true;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "Products":
                this.enableProduct = true;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "User Groups":
                this.enableProduct = true;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "Authorization":
                this.enableProduct = false;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = false;
                break;
            default:
                this.enableProduct = false;
                this.enableBranches = false;
                this.enableSeason = false;
        }
        console.log(activeItem);
    }
    getCurrentProductFromProducts(currProduct:Product = null){
        if(currProduct != null) {
            for (let p of this.products) {
                if (p.uniqueId == currProduct.uniqueId) {
                    return p;
                }
            }
        }
        return null;
    }

    getDefaultBranch(seasonId:string):Branch {
        var master:Branch = {uniqueId:"MASTER",
            name:"Master",
            seasonId:seasonId,
            creator:"",
            lastModified: 0,
            description: "",
            creationDate: 0};
        return master;
    }
    refreshCurrentState() {
        let currProduct = this._state.getData('features.currentProduct');
        this.selectedProduct = currProduct;
        let currSeason = this._state.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        let currBranch = this._state.getData('features.currentBranch');
        this.selectedBranch = currBranch;

    }
    initAdminProductList() {
        this.loading  = true;
        this.airlockService.getUserRoles().then((users) => {
            let prods = this.products;
            let hasAdminProds = this.hasAdminProds(users, prods);
            this.airlockService.setHasAdminProds(hasAdminProds);
        })
    }

    hasAdminProds(users: User[], products: Product[]): boolean {
        let toRet = [];
        for (let user of users) {
            if (user.roles && user.roles.indexOf("Administrator") > -1) {
                return true;
            }
        }
        return false;
    }
    canShowIdMode() {
        return this.airlockService.isAdministrator();
    }
    isIdModeOn() {
        let idMode = this._state.getData('system.idModeOn');
        return idMode != null && idMode != undefined && idMode == true;
    }
    toggleIdMode() {
        if (this.isIdModeOn()) {
            this._state.notifyDataChanged('system.idModeOn', false);
            FeatureUtilsService.isIdMode = false;
        } else {
            this._state.notifyDataChanged('system.idModeOn', true);
            FeatureUtilsService.isIdMode = true;
        }
    }
    initData(currentSeason: Season, isSeasonLatest:boolean, notify:boolean = true, currProduct:Product = null, currentBranch:Branch = null) {
        this.airlockService.getProducts().then(response  => {
            console.log("got products");
            console.log(response);
            this.products = response;
            this.initAdminProductList();
            this._state.notifyDataChanged('products', this.products);
            console.log(this.products[0]);
            if (currProduct) {
                this.selectedProduct = this.getCurrentProductFromProducts(currProduct);
            } else {
                this.selectedProduct = FeaturesPage.getCurrentProductFromSeason(this.products,currentSeason);
            }

            if (this.selectedProduct) {
                console.log("this is the selected product!!!!:  "+this.selectedProduct.name);
                this.airlockService.updateUserRoleForProduct(this.selectedProduct.uniqueId).then(response  => {
                    this.updateUserRole();
                    this.seasons = this.selectedProduct.seasons;
                    if(this.seasons != null) {
                        this.selectedSeason = FeaturesPage.getCurrentSeasonFromSeason(this.seasons, currentSeason);
                        if (isSeasonLatest && !this.isCurrentSeasonLast() && this.seasons && this.seasons.length > 0) {
                            this.airlockService.notifyDataChanged("info-webhook", {
                                title: "New version range",
                                message: "New version range created for this product"
                            });
                        }
                        if (notify) {
                            this._state.notifyDataChanged('features.currentSeason', this.selectedSeason);
                            let isLatest = this.isCurrentSeasonLast() ? "true" : "false";
                            this._state.notifyDataChanged('features.isLatestSeason', isLatest);
                            this._state.notifyDataChanged('features.currentProduct',this.selectedProduct);
                        }

                        if (this.selectedSeason) {
                            // var master:Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
                            // if (FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion,"3.0")) {
                            //     this.branches = [master];
                            //     this.selectBranch(master);
                            //
                            // } else {
                            if(this.airlockService.canUseBranches()){
                                this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response  => {
                                    this.branches = response;
                                    // this.branches.unshift(master);
                                    this.selectBranch(this.getCurrentBranchFromBranches(this.branches, currentBranch));
                                    this.loading = false;
                                });
                            }
                            else {
                                let master:Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
                                this.branches = [master];
                                this.selectBranch(master);
                                this.loading = false;
                            }
                            // }

                        } else {
                            this.branches = null;
                            this.selectedBranch = null;
                            this.loading = false;
                            // this.loading = false;
                            // this.valid = false;
                        }
                    }else{
                        this.selectedSeason=null;
                    }
                    this.airlockService.setCapabilities(this.selectedProduct);
                    this.showBranches = this.airlockService.canUseBranches();
                }).catch(error => {
                    this.loading = false;
                    let errorMessage = FeatureUtilsService.parseErrorMessage(error);
                    this.airlockService.notifyDataChanged("error-notification",errorMessage);

                });

            } else {
                this.seasons = null;
                this.selectedSeason = null;
                this.branches = null;
                this.selectedBranch = null;
                this.loading = false;
            }


        });
    }

    getSeasonName(item:Season) {
        if (item) {
            let max = item.maxVersion? item.maxVersion : "";
            let min = item.minVersion? item.minVersion : "";
            if (max=="") {
                return min + " and up";
            } else {
                return min + " to " + max + " (not including " + max + ")";
            }
        } else {
            return "";
        }
    }

    onProductsClick(){
        var longestProdName;
        var longestProdSize = 0;
        for (var i = 0; i < this.products.length; i++){
            if (this.products[i].name.length > longestProdSize){
                longestProdSize = this.products[i].name.length;
                longestProdName = this.products[i].name;
            }
        }
        this.productDropDownWidth = (9 * longestProdSize).toString() +'px';
        console.log('productDropDownWidth:', this.productDropDownWidth);
    }
    selectProduct(prod:Product){

        this.loading = true;
        if(prod != null && prod.seasons == null){
            prod.seasons = [];
        }
        this.selectedProduct = prod;
        this.airlockService.setCapabilities(prod);
        // this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);

        // this.airlockService.setCapabilities(prod);


        this.airlockService.updateUserRoleForProduct(this.selectedProduct.uniqueId).then(response  => {
            this.showBranches = this.airlockService.canUseBranches();
            this.seasons = this.selectedProduct.seasons;
            if(this.seasons != null) {
                this.selectSeason(FeaturesPage.getCurrentSeasonFromSeason(this.seasons, null));
                // if (isSeasonLatest && !this.isCurrentSeasonLast() && this.seasons && this.seasons.length > 0) {
                //     this.airlockService.notifyDataChanged("info-webhook", {
                //         title: "New version range",
                //         message: "New version range created for this product"
                //     });
                // }
            }else{
                this.selectSeason(null);
            }
            this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);
            console.log("product selected: "+prod.name);
            this.updateUserRole();
            console.log("product selected: " + prod.name);
            this.airlockService.setCapabilities(prod);
            this.showBranches = this.airlockService.canUseBranches();
            this.seasons = this.selectedProduct.seasons;
            if (this.seasons != null) {
                this.selectSeason(FeaturesPage.getCurrentSeasonFromSeason(this.seasons, null));
                // if (isSeasonLatest && !this.isCurrentSeasonLast() && this.seasons && this.seasons.length > 0) {
                //     this.airlockService.notifyDataChanged("info-webhook", {
                //         title: "New version range",
                //         message: "New version range created for this product"
                //     });
                // }
            } else {
                this.selectSeason(null);
            }
        }).catch(error => {
            this.loading = false;
            let errorMessage = FeatureUtilsService.parseErrorMessage(error);
            this.airlockService.notifyDataChanged("error-notification",errorMessage);

        });
    }

    getCurrentBranchFromBranches(branches:Branch[], branch:Branch) {
        if (branches && branches.length > 0) {
            if (branch!=null) {
                for (var currBranch of branches) {
                    if (currBranch.uniqueId==branch.uniqueId) {
                        return currBranch;
                    }
                }
            }
            return branches[0];
        }
        return null;
    }
    selectSeason(item:Season){
        this.selectedSeason = item;
        this.loading = false;
        this._state.notifyDataChanged('features.currentSeason', this.selectedSeason);
        let isLatest = this.isCurrentSeasonLast() ? "true" : "false";
        this._state.notifyDataChanged('features.isLatestSeason', isLatest);

        this.branches = [];
        if (this.selectedSeason) {
            if(this.airlockService.canUseBranches()){
                this.loading = true;
                this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response  => {
                    this.branches = response;
                    this.selectBranch(this.getCurrentBranchFromBranches(this.branches, null));
                    this.loading = false;
                });
            }
            else{
                let master:Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
                this.selectBranch(master);
            }
        } else {
            this.selectBranch(null);
        }


    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }
    isBranchSupported() {
        if (!this.branches) {
            return false;
        }
        if (this.selectedSeason && FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion,"3.0")) {
            return false;
        }
        return !this.airlockService.isViewer();
    }
    getNewBranchTitle() {
        var title = this.getString("page_top_new_branch_tooltip");
        if (!this.isBranchSupported()) {
            title = this.getString("page_top_cannot_create_new_branch_tooltip");
        }
        return title;
    }

    createNewBranch() {
        if(this.selectedBranch != null && this.branches != null) {
            this.addBranchModal.open(this.selectedBranch, this.branches);
        }
    }
    selectBranch(branch:Branch) {
        this.selectedBranch = branch;
        this._state.notifyDataChanged('features.currentBranch', this.selectedBranch);
    }

    onBranchAdded(branch:Branch) {
        this.loading = true;
        this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response  => {
            this.branches = response;
            this.selectBranch(this.getCurrentBranchFromBranches(this.branches, branch));
            this.loading = false;
        });
    }

    isCurrentSeasonLast():boolean {
        if (this.selectedSeason && this.seasons && this.seasons.length > 0) {
            return this.selectedSeason == this.seasons[this.seasons.length-1];
        }
        return false;
    }

    public scrolledChanged(isScrolled) {
        this.isScrolled = isScrolled;
    }

    openProfile() {
        console.log("baPageTop - profileMobile.open()");
        console.log(this.profileModal);
        this.profileModal.open();
    }
    openAbout() {
        console.log("baPageTop - aboutMobile.open()");
        console.log(this.aboutModal);
        this.aboutModal.open();
    }
    logOut(){
        this.airlockService.logOut();
    }

    showHelp() {
        window.open('https://sites.google.com/a/weather.com/airlock/airlock-control-center');
    }

    getNewAvatar() {
        let numAvatars = this.avatars.length;
        let newAvatarNumber = Math.floor(Math.random() * numAvatars);
        let newAvatar = this.avatars[newAvatarNumber];
        this.avatar = newAvatar;
        this._state.notifyDataChanged('console.currentAvatar', newAvatar);
    }
}
