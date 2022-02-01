import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
    NbDialogService,
    NbMediaBreakpointsService,
    NbMenuService,
    NbSidebarService,
    NbThemeService,
} from '@nebular/theme';
import {UserData} from '../../../@core/data/users';
import {LayoutService} from '../../../@core/utils';
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {GlobalState} from "../../../global.state";
import {AirlockService} from "../../../services/airlock.service";
import {StringsService} from "../../../services/strings.service";
import {Product} from "../../../model/product";
import {Season} from "../../../model/season";
import {Branch} from "../../../model/branch";
import {User} from "../../../model/user";
import {FeatureUtilsService} from "../../../services/featureUtils.service";
import {FeaturesPage} from "../../../pages/featuresPage";
import {AboutModal} from "../../modals/aboutModal";
import {ProfileModal} from "../../modals/profileModal";
import {AddBranchModal} from "../../modals/addBranchModal";
import {AceModal} from "../../modals/aceModal/aceModal.component";
import {PopoverDirective} from "ngx-bootstrap/popover";

@Component({
    selector: 'ngx-header',
    styleUrls: ['./header.component.scss'],
    templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

    prodsForSelect: any;
    private destroy$: Subject<void> = new Subject<void>();
    userPictureOnly: boolean = false;
    user: any;
    userMenu = [];
    public isScrolled: boolean = false;
    public userName: string = "";
    public userRole: string = "";
    products: Array<Product>;
    selectedProduct: Product;
    seasons: Array<Season>;
    branches: Array<Branch>;
    selectedSeason: Season;
    selectedSeasonName = "";
    selectedBranch: Branch;
    productDropDownWidth: string = '1000px';
    showSelection: boolean = false;
    enableProduct: boolean = true;
    enableSeason: boolean = true;
    showBranches: boolean = true;
    showRole: boolean = true;
    loading: boolean = false;
    enableBranches: boolean = true;
    selectedItem: string = null;
    @ViewChild('pop') popoverReference: PopoverDirective;
    public productItems: Array<any> = [{id: "MASTER", text: "MASTER"}];
    public versiobRangeItems: Array<any> = [{id: "MASTER", text: "MASTER"}];
    public branchItems: Array<any> = [{id: "MASTER", text: "MASTER"}];
    avatars: Array<string> = ['zia', 'Bender', 'Fry', 'homer', 'leela', 'Marge', 'morty', 'Rick', 'Roger_Smith', 'shadow_white', 'cartman', 'cat', 'cow', 'dude', 'girl', 'lisa', 'man', 'owl', 'taco', 'tutsplus', 'monkey', 'idkfa'];
    avatar: string = "shadow_white";
    private value: any = {};
    consoleName: string;

    constructor(private _state: GlobalState,
                private airlockService: AirlockService,
                private _stringsSrevice: StringsService,
                private sidebarService: NbSidebarService,
                private menuService: NbMenuService,
                private themeService: NbThemeService,
                private userService: UserData,
                private layoutService: LayoutService,
                private dialogService: NbDialogService,
                private breakpointService: NbMediaBreakpointsService) {
        this.userName = airlockService.getUserName();
        this.updateUserRole();
        this.consoleName = "Airlytics";

    }
    ngAfterViewInit() {
        // this.popoverReference.show();
    }
    ngOnInit() {
        this.themeService.changeTheme('dark');
        this.userService.getUsers()
            .pipe(takeUntil(this.destroy$))
            .subscribe((users: any) => this.user = users.nick);
        const {xl} = this.breakpointService.getBreakpointsMap();
        this.prodsForSelect = this.getProductsForSelect();
        this.themeService.onMediaQueryChange()
            .pipe(
                map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
                takeUntil(this.destroy$),
            )
            .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

        let currSeason = this._state.getData('features.currentSeason');
        let currBranch = this._state.getData('features.currentBranch');
        let isLatestStr = this._state.getData('features.isLatestSeason');
        let pathProd = this._state.getData('features.pathProductId');
        let pathSeason = this._state.getData('features.pathSeasonId');
        let pathBranch = this._state.getData('features.pathBranchId');
        let pathFeature = this._state.getData('features.pathFeatureId');
        let isLatest = (isLatestStr && isLatestStr === "true") ? true : false;
        console.log("init data of header.")
        this.initData(currSeason, isLatest, true, null, currBranch, pathProd, pathSeason, pathBranch);
        // let activeItem = this._state.getData('menu.activeLink');
        // this.setByPage(activeItem);
        // this._state.subscribe('menu.activeLink', 'bapagetop', (activeItem1) => {
        //     this.setByPage(activeItem1);
        // });
        // this._state.subscribe('menu.selectedLink', 'bapagetop', (activeItem2) => {
        //     this.loading = true;
        //     this.refreshCurrentState();
        //     setTimeout(() => {
        //         this.loading = false;
        //     }, 50);
        // });

        this._state.subscribe('features.currentProductbyPage', 'bapagetop', (product) => {
            this.loading = true;
            this.selectedSeason = null;
            this.selectProduct(product);
            this.initData(null, true, true, product);
        });

        let avatar = this._state.getData('console.currentAvatar');
        if (avatar && avatar.length > 0) {
            this.avatar = avatar;
        } else if (this.airlockService.getUserName() === "Esteban Zia") {
            this.avatar = "zia";
        }
        this.productItems = this.getProductsForSelect();
        this.versiobRangeItems = this.getSeasonsForSelect();
        this.branchItems = this.getBranchesForSelect();

        var index = 0;
        this.userMenu[index++] = {title: 'Profile'};
        this.userMenu[index++] = {title: 'Change picture'};
        if (this.canShowIdMode() && !this.isIdModeOn()) {
            this.userMenu[index++] = {title: 'Turn ID mode ON'};
        }
        if (this.canShowIdMode() && this.isIdModeOn()) {
            this.userMenu[index++] = {title: 'Turn ID mode OFF'};
        }
        this.userMenu[index] = {title: 'Sign out'};
        this.menuService.onItemSelect().subscribe((event) => {
            if (event.tag === 'sideMenu'){
                this.setByPage(event?.item?.title);
            }
        });
        this.menuService.onItemClick().subscribe((event) => {
            if (event.tag === 'headerMenu') {
                switch (event.item.title) {
                    case 'Profile': {
                        this.openProfile();
                        break;
                    }
                    case 'Change picture': {
                        this.getNewAvatar();
                        break;
                    }
                    case 'Turn ID mode ON': {
                        this.toggleIdMode();
                        break;
                    }
                    case 'Turn ID mode OFF': {
                        this.toggleIdMode();
                        break;
                    }
                    case 'Sign out': {
                        this.logOut();
                        break;
                    }
                }
            }
        });
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

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    changeTheme(themeName: string) {
        this.themeService.changeTheme(themeName);
    }

    toggleSidebar(): boolean {
        this.sidebarService.toggle(true, 'menu-sidebar');
        this.layoutService.changeLayoutSize();

        return false;
    }

    openAbout() {
        this.dialogService.open(AboutModal);
        return false;
    }

    setByPage(title: string) {
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
            case "Cohorts":
                this.enableProduct = true;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = true;
                break;
            case "Data import":
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
            case "Polls":
                this.enableProduct = true;
                this.enableSeason = false;
                this.enableBranches = false;
                this.showRole = false;
                break;
            default:
                this.enableProduct = false;
                this.enableBranches = false;
                this.enableSeason = false;
        }
    }

    refreshCurrentState() {
        let currProduct = this._state.getData('features.currentProduct');
        this.selectedProduct = currProduct;
        let currSeason = this._state.getData('features.currentSeason');
        this.selectedSeason = currSeason;
        let currBranch = this._state.getData('features.currentBranch');
        this.selectedBranch = currBranch;

        this.selectedSeasonName = this.getSeasonName(this.selectedSeason);
    }

    updateUserRole() {
        this.userRole = this.airlockService.getUserRole();
        if (this.airlockService.isProductLead()) {
            this.userRole = "Product Lead";
        }
        if (this.airlockService.isViewer() && this.airlockService.isUserHasStringTranslateRole()) {
            this.userRole = "Translation Specialist";
        }
        this.userRole = '(' + this.userRole + ')';
    }

    getSeasonsForSelect(): any[] {
        let toRet = [];
        if (this.selectedSeason) {
            let selected = {
                id: this.selectedSeason,
                text: this.getSeasonName(this.selectedSeason),
            };
            toRet.push(selected);
        }
        if (this.seasons) {
            for (let season of this.seasons) {
                // if (season != this.selectedSeason) {
                if (!this.selectedSeason || season.uniqueId !== this.selectedSeason.uniqueId) {

                    let seasonObj = {
                        id: season,
                        text: this.getSeasonName(season),
                    };
                    toRet.push(seasonObj);
                }
            }
        }
        return toRet;
    }

    getBranchName(branch: Branch) {
        if (!branch) return null;
        let name = branch.name;
        if (name === "MASTER") {
            name = "MAIN";
        }
        return name;
    }

    getBranchesForSelect(): any[] {
        let toRet = [];
        if (this.selectedBranch) {
            let selected = {
                id: this.selectedBranch,
                text: this.getBranchName(this.selectedBranch),
            };
            toRet.push(selected);
        }
        if (this.branches) {
            for (let branch of this.branches) {
                // if (branch != this.selectedBranch) {
                if (this.selectedBranch == null || branch.uniqueId !== this.selectedBranch.uniqueId) {

                    let seasonObj = {
                        id: branch,
                        text: this.getBranchName(branch),
                    };
                    toRet.push(seasonObj);
                }
            }
        }
        return toRet;
    }

    getProductsForSelect(): any[] {
        let toRet = [];
        if (this.selectedProduct) {
            let selected = {id: this.selectedProduct, text: this.selectedProduct.name};
            toRet.push(selected);
        }
        if (this.products) {
            for (let product of this.products) {
                if (this.selectedProduct === null || product.uniqueId !== this.selectedProduct.uniqueId) {
                    let productObj = {
                        id: product,
                        text: product.name,
                    };
                    toRet.push(productObj);
                }
            }
        }
        return toRet;
    }

    getSelectedProductForSelect(): any {
        if (this.selectedProduct) {
            return [{id: this.selectedProduct, name: this.selectedProduct.name}];
        }
        return [];
    }

    selectSeasonFromSelect(seasonObj: any) {
        if (seasonObj) {
            if (seasonObj.uniqueId && (!this.selectedSeason || seasonObj.uniqueId !== this.selectedSeason.uniqueId)) {
                this.selectSeason(seasonObj);
            }
        }
    }

    selectBranchFromSelect(branchObj: any) {
        if (branchObj) {
            if (branchObj.uniqueId && (!this.selectedBranch || branchObj.uniqueId !== this.selectedBranch.uniqueId)) {
                this.loading = true;
                this.selectBranch(branchObj);
                setTimeout(() => {
                    this.loading = false;
                }, 50);
            }
        }
    }

    selectProductFromSelect(productObj: any) {
        if (productObj) {
            if (productObj.uniqueId && (!this.selectedProduct || productObj.uniqueId !== this.selectedProduct.uniqueId)) {
                this.selectProduct(productObj);
            }
        }
    }

    public getSelectedBranch() {
        return this.selectedBranch;
    }

    public selected(value: any): void {
    }

    public refreshValue(value: any): void {
        this.value = value;
    }

    initDataFromIds(prodId: string, seasonId: string, branchId: string, featureId: string) {

    }

    initData(currentSeason: Season, isSeasonLatest: boolean, notify: boolean = true, currProduct: Product = null, currentBranch: Branch = null,
             pathProd: string = null, pathSeason: string = null, pathBrach: string = null) {
        this.airlockService.getProducts().then(response => {
            this.products = response;
            this.initAdminProductList();
            if (pathProd) {
                this.selectedProduct = this.getPathProductFromProducts(pathProd);
            } else if (currProduct) {
                this.selectedProduct = this.getCurrentProductFromProducts(currProduct);
            } else {
                this.selectedProduct = FeaturesPage.getCurrentProductFromSeason(this.products, currentSeason);
            }
            if (this.selectedProduct) {
                this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);
                // this.airlockService.setCapabilities(this.selectedProduct);
                this.airlockService.updateUserRoleForProduct(this.selectedProduct.uniqueId).then(response1 => {
                    this.updateUserRole();
                    this.seasons = this.selectedProduct.seasons;
                    this.versiobRangeItems = this.getSeasonsForSelect();
                    if (this.seasons != null) {
                        if (pathSeason) {
                            this.selectedSeason = FeaturesPage.getCurrentSeasonFromSeasonPath(this.seasons, pathSeason);
                        } else {
                            this.selectedSeason = FeaturesPage.getCurrentSeasonFromSeason(this.seasons, currentSeason);
                        }
                        this.selectedSeasonName = this.getSeasonName(this.selectedSeason);

                        if (isSeasonLatest && !this.isCurrentSeasonLast() && this.seasons && this.seasons.length > 0) {
                            this.airlockService.notifyDataChanged("info-webhook", {
                                title: "New version range",
                                message: "New version range created for this product",
                            });
                        }
                        if (notify) {
                            this._state.notifyDataChanged('features.currentSeason', this.selectedSeason);
                            let isLatest = this.isCurrentSeasonLast() ? "true" : "false";
                            this._state.notifyDataChanged('features.isLatestSeason', isLatest);
                            this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);
                        }

                        if (this.selectedSeason) {
                            // var master:Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
                            // if (FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion,"3.0")) {
                            //     this.branches = [master];
                            //     this.selectBranch(master);
                            //
                            // } else {
                            if (this._state.canUseBranches()) {
                                this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response2 => {
                                    this.branches = response2;
                                    if (pathBrach) {
                                        this.selectBranch(this.getPathBranchFromBranches(this.branches, pathBrach));
                                    } else {
                                        this.selectBranch(this.getCurrentBranchFromBranches(this.branches, currentBranch));
                                    }

                                    this.loading = false;
                                });
                            } else {
                                let master: Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
                                this.branches = [master];
                                this.selectBranch(master);
                                this.loading = false;
                            }
                        } else {
                            this.branches = null;
                            this.selectedBranch = null;
                            this.loading = false;
                        }
                    } else {
                        this.selectedSeason = null;
                        this.selectedSeasonName = this.getSeasonName(this.selectedSeason);
                    }
                    // this.airlockService.setCapabilities(this.selectedProduct);
                    this.showBranches = this._state.canUseBranches();
                }).catch(error => {
                    this.loading = false;
                    let errorMessage = FeatureUtilsService.parseErrorMessage(error);
                    this.airlockService.notifyDataChanged("error-notification", errorMessage);
                });
            } else {
                this.seasons = null;
                this.versiobRangeItems = this.getSeasonsForSelect();
                this.selectedSeason = null;
                this.selectedSeasonName = this.getSeasonName(this.selectedSeason);
                this.branches = null;
                this.selectedBranch = null;
                this.loading = false;
            }
            this.productItems = this.getProductsForSelect();
            this.versiobRangeItems = this.getSeasonsForSelect();
            this.branchItems = this.getBranchesForSelect();
        });
    }

    getSeasonName(item: Season) {
        if (item) {
            let max = item.maxVersion ? item.maxVersion : "";
            let min = item.minVersion ? item.minVersion : "";
            if (max === "") {
                return min + " and up";
            } else {
                return min + " to " + max + " (not including " + max + ")";
            }
        } else {
            return "";
        }
    }

    isSeasonEnabled(item: Season) {
        return this.getSeasonName(item).length > 0;
    }

    getCurrentProductFromProducts(currProduct: Product = null) {
        if (currProduct != null) {
            for (let p of this.products) {
                if (p.uniqueId === currProduct.uniqueId) {
                    return p;
                }
            }
        }
        return null;
    }

    getPathProductFromProducts(pathProduct: string = null) {
        if (pathProduct != null) {
            for (let p of this.products) {
                if (p.uniqueId === pathProduct) {
                    return p;
                }
            }
        }
        if (this.products.length > 0) {
            return this.products[0];
        } else {
            return null;
        }
    }

    onProductsClick() {
        let longestProdName;
        let longestProdSize = 0;
        for (let i = 0; i < this.products.length; i++) {
            if (this.products[i].name.length > longestProdSize) {
                longestProdSize = this.products[i].name.length;
                longestProdName = this.products[i].name;
            }
        }
        this.productDropDownWidth = (9 * longestProdSize).toString() + 'px';
    }

    selectProduct(prod: Product) {

        this.loading = true;
        if (prod != null && prod.seasons == null) {
            prod.seasons = [];
        }
        this.selectedProduct = prod;
        // this.airlockService.setCapabilities(prod);
        this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);

        // this.airlockService.setCapabilities(prod);


        this.airlockService.updateUserRoleForProduct(this.selectedProduct.uniqueId).then(response => {
            this.showBranches = this._state.canUseBranches();
            this.seasons = this.selectedProduct.seasons;
            if (this.seasons != null) {
                this.selectSeason(FeaturesPage.getCurrentSeasonFromSeason(this.seasons, null));
            } else {
                this.selectSeason(null);
            }
            this._state.notifyDataChanged('features.currentProduct', this.selectedProduct);
            this.updateUserRole();
            // this.airlockService.setCapabilities(prod);
            this.showBranches = this._state.canUseBranches();
            this.seasons = this.selectedProduct.seasons;
            this.versiobRangeItems = this.getSeasonsForSelect();
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
            this.airlockService.notifyDataChanged("error-notification", errorMessage);

        });
    }

    getCurrentBranchFromBranches(branches: Branch[], branch: Branch) {
        if (branches && branches.length > 0) {
            if (branch != null) {
                for (let currBranch of branches) {
                    if (currBranch.uniqueId === branch.uniqueId) {
                        return currBranch;
                    }
                }
            }
            return branches[0];
        }
        return null;
    }

    getPathBranchFromBranches(branches: Branch[], branchId: string) {
        if (branches && branches.length > 0) {
            if (branchId != null) {
                for (let currBranch of branches) {
                    if (currBranch.uniqueId === branchId) {
                        return currBranch;
                    }
                }
            }
            return branches[0];
        }
        return null;
    }


    selectSeason(item: Season) {
        this.selectedSeason = item;
        this.selectedSeasonName = this.getSeasonName(this.selectedSeason);
        this.loading = false;
        this._state.notifyDataChanged('features.currentSeason', this.selectedSeason);
        let isLatest = this.isCurrentSeasonLast() ? "true" : "false";
        this._state.notifyDataChanged('features.isLatestSeason', isLatest);
        this.branchItems = this.getBranchesForSelect();
        this.branches = [];
        if (this.selectedSeason) {
            if (this._state.canUseBranches()) {
                this.loading = true;
                this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response => {
                    this.branches = response;
                    this.selectBranch(this.getCurrentBranchFromBranches(this.branches, null));
                    this.loading = false;
                });
            } else {
                let master: Branch = this.getDefaultBranch(this.selectedSeason.uniqueId);
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
        if (this.selectedSeason && FeatureUtilsService.isVersionSmaller(this.selectedSeason.serverVersion, "3.0")) {
            return false;
        }
        return !this.airlockService.isViewer();
    }

    getNewBranchTitle() {
        let title = this.getString("page_top_new_branch_tooltip");
        if (!this.isBranchSupported()) {
            title = this.getString("page_top_cannot_create_new_branch_tooltip");
        }
        return title;
    }

    createNewBranch() {
        if (this.selectedBranch != null && this.branches != null) {
            var branch = new Branch();
            branch.seasonId = this.selectedSeason.uniqueId;
            for (let i=0;i<this.branches.length;i++){
                if (this.branches[i].name == 'MASTER'){
                    this.branches[i].name = 'MAIN';
                    break;
                }
            }
            this.dialogService.open(AddBranchModal, {
                closeOnBackdropClick: false,
                context: {
                    _branch: branch,
                    _sourceBranch: this.selectedBranch,
                    _sources: this.branches,
                    loaded: true,
                }
            }).onClose.subscribe(newBranch => {
                if (newBranch) {
                    this.loading = true;
                    this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response => {
                        this.branches = response;
                        this.selectBranch(this.getCurrentBranchFromBranches(this.branches, newBranch));
                        this.loading = false;
                    });
                }
            });

        }
    }

    selectBranch(branch: Branch) {
        this.branchItems = this.getBranchesForSelect();
        this.selectedBranch = branch;
        this._state.notifyDataChanged('features.currentBranch', this.selectedBranch);
    }

    onBranchAdded(branch: Branch) {
        this.loading = true;
        this.airlockService.getBranches(this.selectedSeason.uniqueId).then(response => {
            this.branches = response;
            this.selectBranch(this.getCurrentBranchFromBranches(this.branches, branch));
            this.loading = false;
        });
    }

    isCurrentSeasonLast(): boolean {
        if (this.selectedSeason && this.seasons && this.seasons.length > 0) {
            return this.selectedSeason === this.seasons[this.seasons.length - 1];
        }
        return false;
    }

    public scrolledChanged(isScrolled) {
        this.isScrolled = isScrolled;
    }

    openProfile() {
        this.dialogService.open(ProfileModal)
    }

    logOut() {
        this.airlockService.logOut();
    }

    getNewAvatar() {
        let numAvatars = this.avatars.length;
        let newAvatarNumber = Math.floor(Math.random() * numAvatars);
        let newAvatar = this.avatars[newAvatarNumber];
        this.user.picture = 'assets/images/' + newAvatar + ".png";
        this._state.notifyDataChanged('console.currentAvatar', newAvatar);
    }

    mouseOver() {
        this.showSelection = true
    }

    mouseOut() {
        this.showSelection = false;
    }

    initAdminProductList() {
        this.loading = true;
        console.log("initAdminProductList");
        this.airlockService.getUserRoles().then((users) => {
            let prods = this.products;
            let hasAdminProds = this.hasAdminProds(users, prods);
            this.airlockService.setHasAdminProds(hasAdminProds);
            this._state.notifyDataChanged('products', this.products);
        });
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

    getDefaultBranch(seasonId: string): Branch {
        const master: Branch = {
            uniqueId: "MASTER",
            name: "Master",
            seasonId: seasonId,
            creator: "",
            lastModified: 0,
            description: "",
            creationDate: 0,
        };
        return master;
    }
}
