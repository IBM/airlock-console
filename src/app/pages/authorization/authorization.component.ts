import {Component} from '@angular/core';
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {GlobalState} from "../../global.state";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {StringsService} from "../../services/strings.service";
import {Product} from "../../model/product";
import {User} from "../../model/user";
import {Role} from "../../model/role";
import {VerifyActionModal} from "../../@theme/modals/verifyActionModal";
import {TransparentSpinner} from "../../@theme/airlock.components/transparentSpinner";
import {AddUserModal} from "../../@theme/modals/addUserModal";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {NbDialogService} from "@nebular/theme";
import {CustomCheckboxComponent} from "./custom.checkbox.component";
import {CustomDeleteComponent} from "./custom.delete.component";

@Component({
    selector: 'authorization',
    providers: [TransparentSpinner,FeatureUtilsService],
    styleUrls: ['./authorization.scss'],
    templateUrl: './authorization.html',
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


export class AuthorizationPage {
    products: Array<Product>;
    selectedProduct: Product;
    productDropDownWidth: string = '1000px';
    valid: boolean = true;
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    public sortBy;
    // loaded: Promise<boolean>;
    settings = {
        hideSubHeader: true,
        actions: false,
        columns: {
            id: {
                filter: false,
                title: 'ID'
            }
        }
    };
    data = [

    ];

    sampleUser = {}

    public sortOrder = "asc";
    scrolledToSelected = false;
    filterlistDict: {string: Array<string>} = {string:[]};
    editDialogOpen: boolean = false;
    loading: boolean = false;
    showDialog = false;
    users: Array<User> = new Array<User>();
    roles: Array<Role> = new Array<Role>();
    filteredUsers: Array<User> = new Array<User>();
    searchQueryString: string = null;
    allProductsProd: Product;

    public status: {isopen: boolean} = {isopen: false};
    private dynamicRoles: any = [];
    private testMode: boolean = false;
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState,
                private _stringsSrevice: StringsService,
                private modalService: NbDialogService) {
        this.allProductsProd = new Product();
        this.allProductsProd.name = "Default for new products";
        this.allProductsProd.uniqueId = null;
    }

    setEditDialog(isOpen: boolean) {
        this.editDialogOpen = isOpen;
    }

    isShowOptions(){
        return (!this._airLockService.isViewer());
    }
    isViewer():boolean {
        return this._airLockService.isViewer();
    }

    toggleDataCollectionDetails(){
        this.showDialog = !this.showDialog;
    }

    initData(currentSeason: Season, isSeasonLatest:boolean) {

    }

    ngOnInit() {
        // this.products = this._appState.getData('products');
        // let currProduct = this._appState.getData('features.currentProduct');
        // this.selectProduct(currProduct);
        this._appState.subscribe('products','features',(branch) => {
            console.log("authorization subscribed init products");
            this.initProductList();
        });
        this.initProductList();
    }
    ngOnDestroy() {
        this._appState.unsubcribe('products','features');
    }

    initProductList() {
        console.log("authorization initProductList");
        this.loading  = true;
        if (this.testMode){
            let prods = this._appState.getData('products');
            this.products = prods;
            this.selectProduct(this.getFirstProductAvailable());
            this.loading  = false;
            return;
        }
        this._airLockService.getUserRoles().then((users) => {
            let prods = this._appState.getData('products');
            this.products = this.createProductsList(users, prods);
            if (this.products.length > 0) {
                let currProduct = this._appState.getData('features.currentProduct');
                if(currProduct != null){
                    let isFound: boolean = false;
                    for (let prod of this.products){
                        if(prod.uniqueId == currProduct.uniqueId){
                            this.selectProduct(prod);
                            isFound = true;
                            break;
                        }
                    }
                    if(!isFound){
                        this.selectProduct(this.getFirstProductAvailable());
                    }
                }else {
                    this.selectProduct(this.getFirstProductAvailable());
                }
            } else {
                this.loading = false;
            }
        }).catch((error) => {
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to update user role");
            this._airLockService.notifyDataChanged("error-notification",errorMessage);
            this.refreshTable();
        });
    }

    getFirstProductAvailable(): Product{
        for (let index = 0; index < this.products.length; index++){
            if (this.products[index].isCurrentUserFollower){
                return this.products[index];
            }
        }
        return this.products[0];
    }

    createProductsList(users: User[], products: Product[]): Product[] {
        console.log("createProductsList");
        let toRet = [];
        for (let user of users || []) {
            if (user.roles && user.roles.indexOf("Administrator") > -1) {
                if (user.productId == null) {
                    console.log("pushing addProductsProd");
                    toRet.push(this.allProductsProd);
                } else {
                    let prod = this.getProductFromID(user.productId, products);
                    toRet.push(prod);
                }
            }
        }
        if (toRet.length > 0) {
            toRet = toRet.sort((n1,n2) => {
                //put master on top - otherwise sort alphabetically
                if (n1.uniqueId == null) {
                    return -1;
                }
                if (n2.uniqueId == null) {
                    return 1;
                }
                if (n1.name.toLowerCase() > n2.name.toLowerCase()) {
                    return 1;
                }

                if (n1.name.toLowerCase() < n2.name.toLowerCase()) {
                    return -1;
                }

                return 0;
            });
        }
        return toRet;
    }

    getProductFromID(prodId: string, products: Product[]): Product {
        for (let prod of products || []) {
            if (prod.uniqueId === prodId) {
                return prod;
            }
        }
        return null;
    }

    isCellOpen(expID:string): boolean {
        return false;
        // var index = this.openExperiments.indexOf(expID, 0);
        // return index > -1;
    }

    setShowConfig(show:boolean) {
        // this.showConfig = show;
        // if (show) {
        //     this.filterlistDict["type"] = [];
        // } else {
        //     this.filterlistDict["type"] = ["CONFIG_MUTUAL_EXCLUSION_GROUP", "CONFIGURATION_RULE"];
        // }

    }

    public refreshTable() {
        this.selectProduct(this.selectedProduct);
    }

    public beforeUpdate() {
        this.loading = true;
    }

    public afterUpdate() {
        // this.loading = false;
    }
    public onSearchQueryChanged(term:string) {
        this.loading = true;
        setTimeout(() => {
            this.filteredItems = [];
            this.searchQueryString = term;
            this.createFilteredList();
        }, 100);
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    createFilteredList() {
        this.loading = true;
        console.log("createFilteredList");
        this.data = [];
        this.filteredItems = [];
        let filtered: Array<User> = [];
        if (!this.searchQueryString || this.searchQueryString.length <= 0) {
            filtered = [...this.users];
        } else {
            for (let user of this.users || []) {
                if (this._stringIncludes(user.identifier, this.searchQueryString)) {
                    filtered.push(user);
                }
            }
        }
        this.filteredUsers = filtered;
        for (var user of this.filteredUsers){
            console.log("printing roles for user " + ":" + user.identifier + " roles:"+ user.roles);
            let singleUserData = {
                id: user.identifier
            }
            for (let userRole of this.dynamicRoles){
                singleUserData[userRole] = userRole + ":" + user.roles.includes(userRole);
            }
            singleUserData["uniqueId"] = user.uniqueId;
            singleUserData["user"] = user;
            singleUserData["authPage"] = this;
            this.data.push(singleUserData);
        }
        this.loading = false;
    }
    getNumItems() {
        if (this.filteredUsers && this.searchQueryString && this.searchQueryString.length > 0) {
            return this.filteredUsers.length;
        }
        return 0;
    }
    _stringIncludes(str:string, term:string) {
        if (!str) {
            return false;
        }
        if (!term) {
            return true;
        }
        return (str.toLowerCase().indexOf(term.toLowerCase()) > -1);
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
                if (this.selectedIndex >= (this.filteredItems.length-1)) {
                    this.selectedIndex = 0;
                } else {
                    this.selectedIndex++;
                }
            } else {
                if (this.selectedIndex == 0) {
                    this.selectedIndex = this.filteredItems.length-1;
                } else {
                    this.selectedIndex--;
                }
            }

            this.selectedId = this.filteredItems[this.selectedIndex];
            this.scrolledToSelected = false;
        }
    }

    itemIsSelected(itemObj: any) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            let y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            const offset = top - windowScroll;

            if(offset > window.innerHeight  || offset < 0){
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                const scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top-200;
                return false;
            }
        }
        return true;
    }

    onProductsClick() {
        let longestProdName;
        let longestProdSize = 0;
        for (let i = 0; i < this.products.length; i++){
            if (this.products[i].name.length > longestProdSize){
                longestProdSize = this.products[i].name.length;
                longestProdName = this.products[i].name;
            }
        }
        this.productDropDownWidth = (9 * longestProdSize).toString() +'px';
        console.log('productDropDownWidth:', this.productDropDownWidth);
    }

    getProductsForSelect(): any[] {
        const toRet = [];
        // let allProds = {id:this.allProductsProd, text:this.allProductsProd.name};
        // toRet.push(allProds);
        if (this.selectedProduct) {
            let selected = {id: this.selectedProduct, text: this.selectedProduct.name};
            toRet.push(selected);
        }
        if (this.products) {
            for (let product of this.products) {
                if (product) {
                    if (this.selectedProduct == null || product.uniqueId != this.selectedProduct.uniqueId) {
                        let productObj = {id: product,
                            text: product.name};
                        toRet.push(productObj);
                    }
                }
            }
        }
        return toRet;
    }

    getSelectedProductForSelect(): any {
        console.log("getSelectedProductForSelect");
        if (this.selectedProduct) {
            return [{id: this.selectedProduct, text: this.selectedProduct.name}];
        }
        return [];
    }
    selectProductFromSelect(productObj:any) {
        console.log("selectProductFromSelect " +  productObj.value);
        if (productObj) {
            if (productObj.value && productObj.value != this.selectedProduct.uniqueId) {
                console.log("selectProductFromSelect#1");
                this.selectProduct(this.getProductFromID(productObj.value, this.products));
            }
        }
    }

    selectProduct(prod:Product){
        if(prod == null){
            console.log("Auth product is null: ");
            return;
        }
        this.loading = true;
        this.selectedProduct = prod;
        console.log("product selected: "+prod.name);
        if (this.testMode){
            let roleNames = ["Viewer","Editor"]
            for (let role of roleNames){
                (this.settings.columns as any)[role] = {
                    filter: false,
                    type: 'custom',
                    title: role,
                    width: '40px',
                    renderComponent: CustomCheckboxComponent}
                this.dynamicRoles.push(role);
            }
            this.settings.columns["delete"] = {
                filter: false,
                type: 'custom',
                renderComponent: CustomDeleteComponent,
                width: '88px'}

            this.dynamicRoles = ["Viewer","Editor"];
            let singleUserData = {
                id: "aaaa"
            }
            for (let userRole of this.dynamicRoles){
                singleUserData[userRole] = userRole + ":true";
            }
            singleUserData["uniqueId"] = "aaaaa";
            singleUserData["user"] = "user1";
            singleUserData["authPage"] = this;
            this.data.push(singleUserData);
            return;
        }
        this._airLockService.getUsers(this.selectedProduct.uniqueId).then(response  => {
            this.users = response;
            this._airLockService.getRoles(this.selectedProduct.uniqueId).then(response => {
                this.roles = response;
                console.log("returned roles: " + JSON.stringify(response));
                for (let role of this.roles){
                    (this.settings.columns as any)[role.name] = {
                        filter: false,
                        type: 'custom',
                        title: role.name,
                        width: '40px',
                        renderComponent: CustomCheckboxComponent}
                        this.dynamicRoles.push(role.name);
                }
                this.settings.columns["delete"] = {
                    filter: false,
                    type: 'custom',
                    renderComponent: CustomDeleteComponent,
                    width: '88px'}
                this.createFilteredList();
            });
        });
    }

    hasRole(user: User, role: Role) {
        let roles = user.roles || [];
        return roles.indexOf(role.name) > -1;
    }
    canCheckRole(user: User, role: Role): boolean {
        for (const roleName of role.dependencies || []) {
            if (!user.roles || user.roles.indexOf(roleName) <= -1) {
                return false;
            }
        }
        return true;
    }
    canUncheckRole(user: User, role: string): boolean {
        if (this.testMode){
            return true;
        }
        if (!user.roles || user.roles.indexOf(role) <= -1) {
            return true;
        }
        if (user.roles && user.roles.length == 1) {
            //do not allow empty role set
            return false;
        }
        for (let otherRoleName of user.roles || []) {
            let otherRole = this.getRoleWithName(otherRoleName);
            if (otherRole) {
                for (let dependedRole of otherRole.dependencies || []) {
                    if (dependedRole === role) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    getRoleWithName(roleName: string): Role {
        for (let role of this.roles || []) {
            if (role.name === roleName) {
                return role;
            }
        }
        return null;
    }
    setRole(user: User, role: string, event) {
        if (this.selectedProduct.uniqueId == null && event.target.checked
            && role === "Administrator") {
            this.modalService.open(VerifyActionModal, {
                closeOnBackdropClick: false,
                context: {
                    text: `Are you sure you want to delete the user ${user.identifier}?`,
                }
            }).onClose.subscribe(confirmed => {
                if (confirmed) {
                    console.log("confirmed");
                    this._setRole(user, role, event);
                }});
        } else {
            this._setRole(user, role, event)
        }

    }
    _setRole(user: User, role: string, event) {
        this.loading = false;
        if (event.target.checked) {
            if (!user.roles) {
                user.roles = [];
            }
            user.roles.push(role);
            console.log("pushed role : " + role);
            let roleObj = this.getRoleWithName(role);
            for (let dependency of roleObj.dependencies || []) {
                if (user.roles.indexOf(dependency) <= -1) {
                    user.roles.push(dependency);
                }
            }
        } else {
            if (user.roles) {
                const index = user.roles.indexOf(role);
                if (index !== -1) {
                    console.log("removed role : " + role);
                    user.roles.splice(index, 1);
                }
            }
        }
        //update user
        if (this.testMode){
            this.loading = false;
            return;
        }
        this._airLockService.updateUser(user, this.selectedProduct.uniqueId).then((response) => {
            this.refreshTable();
            this.loading = false;
        }).catch((error) => {
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to update user role");
            this._airLockService.notifyDataChanged("error-notification",errorMessage);
            this.refreshTable();
        });
    }

    addUser(event) {
        this.modalService.open(AddUserModal, {
            closeOnBackdropClick: false,
            context: {
                productId: this.selectedProduct?.uniqueId
            }
        }).onClose.subscribe(item => {
            if (item) {
                this.refreshTable();
            }
        });
        // this.addUserModal.open(this.selectedProduct.uniqueId);
    }
    deleteUser(user:User) {
        this.modalService.open(VerifyActionModal, {
            closeOnBackdropClick: false,
            context: {
                text: `Are you sure you want to delete the user ${user.identifier}?`,
            }
        }).onClose.subscribe(confirmed => {
            if (confirmed) {
                console.log("confirmed");
                this._airLockService.deleteUser(user).then((res) => {
                    this.refreshTable();
                }).catch((error) => {
                    let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to delete user");
                    this._airLockService.notifyDataChanged("error-notification", errorMessage);
                    this.refreshTable();
                });
            }
        });
    }

    customEvent($event: any) {
        console.log("customEvent " + $event.name);
    }
}

