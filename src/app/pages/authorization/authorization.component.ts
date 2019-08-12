import {Component, Injectable, trigger, state, transition, animate, style, ElementRef} from '@angular/core';
import {AirlockService} from "../../services/airlock.service";
import {Season} from "../../model/season";
import {ViewChild} from "@angular/core";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {GlobalState} from "../../global.state";
import {VerifyActionModal} from "../../theme/airlock.components/verifyActionModal/verifyActionModal.component";
import {FeatureUtilsService} from "../../services/featureUtils.service";
import {StringsService} from "../../services/strings.service";
import {Product} from "../../model/product";
import {User} from "../../model/user";
import {Role} from "../../model/role";
import {AddUserModal} from "../../theme/airlock.components/addUserModal";
import {Modal} from "angular2-modal/plugins/bootstrap/modal";

@Component({
    selector: 'authorization',
    providers: [TransparentSpinner,FeatureUtilsService],
    styles: [require('./authorization.scss')],
    template: require('./authorization.html'),
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
    @ViewChild('verifyActionModal')
    verifyActionModal:  VerifyActionModal;
    @ViewChild('addUserModal')
    addUserModal:  AddUserModal;
    productDropDownWidth: string = '1000px';
    valid: boolean = true;
    filteredItems: Array<string> = new Array<string>();
    selectedId = null;
    selectedIndex = -1;
    public sortBy;
    data;
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
    constructor(private _airLockService:AirlockService,
                private _appState: GlobalState, private _stringsSrevice: StringsService,
                public modal: Modal) {
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
        this._airLockService.getUserRoles().then((users) => {
            let prods = this._appState.getData('products');

            this.products = this.createProductsList(users, prods);
            if (this.products.length > 0) {
                let currProduct = this._appState.getData('features.currentProduct');
                if(currProduct != null){
                    var isFound:boolean = false;
                    for (let prod of this.products){
                        if(prod.uniqueId == currProduct.uniqueId){
                            this.selectProduct(prod);
                            isFound = true;
                            break;
                        }
                    }
                    if(!isFound){
                        this.selectProduct(this.products[0]);
                    }
                }else {
                    this.selectProduct(this.products[0]);
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

    createProductsList(users: User[], products: Product[]): Product[] {
        console.log("createProductsList");
        console.log(products);
        let toRet = [];
        for (let user of users || []) {
            console.log("user:" + user);
            if (user.roles && user.roles.indexOf("Administrator") > -1) {
                if (user.productId == null) {
                    console.log("pushing addProductsProd");
                    toRet.push(this.allProductsProd);
                } else {
                    console.log("pushing product");
                    let prod = this.getProductFromID(user.productId, products);
                    toRet.push(prod);
                }
            }
        }
        console.log(toRet);
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
        this.loading = false;
    }
    public onSearchQueryChanged(term:string) {
        this.loading = true;
        setTimeout(() => {
            this.filteredItems = [];
            this.searchQueryString = term;
            this.createFilteredList();
            this.loading = false;
        }, 100);
    }
    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    createFilteredList() {
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
        this.data = this.filteredUsers;

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

    isPartOfSearch(term:string, stream:any):boolean {
        if (!term || term=="") {
            return true;
        }
        let lowerTerm = term.toLowerCase();
        let displayName = stream.displayName ? stream.displayName : "";
        displayName = displayName ? displayName.toLowerCase() : "";
        let fullName = stream.name;
        fullName = fullName ? fullName.toLowerCase() : "";

        return displayName.includes(lowerTerm) || fullName.includes((lowerTerm));
    }

    showNextSearchResult(forward:boolean) {
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

    itemIsSelected(itemObj:any) {
        if (itemObj.id && itemObj.id == this.selectedId && !this.scrolledToSelected) {
            let y = itemObj.offset;
            this.checkIfInView(y);
            this.scrolledToSelected = true;
        }
    }

    checkIfInView(top: number){
        let windowScroll = jQuery(window).scrollTop();
        if (top > 0) {
            var offset = top - windowScroll;

            if(offset > window.innerHeight  || offset < 0){
                // Not in view so scroll to it
                // jQuery('html,body').animate({scrollTop: offset-300}, 500);
                var scrollNode = document.scrollingElement ?
                    document.scrollingElement : document.body;
                scrollNode.scrollTop = top-200;
                return false;
            }
        }
        return true;
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
    getProductsForSelect():any[] {
        var toRet = [];
        // let allProds = {id:this.allProductsProd, text:this.allProductsProd.name};
        // toRet.push(allProds);
        if (this.selectedProduct) {
            let selected = {id:this.selectedProduct, text:this.selectedProduct.name};
            toRet.push(selected);
        }
        if (this.products) {
            for (var product of this.products) {
                if (product) {
                    if(this.selectedProduct == null || product.uniqueId!=this.selectedProduct.uniqueId) {
                        let productObj = {id:product,
                            text:product.name};
                        toRet.push(productObj);
                    }
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
    selectProductFromSelect(productObj:any) {
        if (productObj) {
            if (productObj.id && productObj.id != this.selectedProduct) {
                this.selectProduct(productObj.id);
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

        this._airLockService.getUsers(this.selectedProduct.uniqueId).then(response  => {
            this.users = response;
            this.createFilteredList();
            this.data = this.filteredUsers;
            this._airLockService.getRoles(this.selectedProduct.uniqueId).then(response => {
                this.roles = response;
                this.loading = false;
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
    canUncheckRole(user: User, role: Role): boolean {
        if (!user.roles || user.roles.indexOf(role.name) <= -1) {
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
                    if (dependedRole === role.name) {
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
    setRole(user: User, role: Role, event) {
        if (this.selectedProduct.uniqueId == null && event.target.checked
            && role.name === "Administrator") {
            this.modal.confirm()
                .title(`This would make this user Administrator on all products. Are you sure?`)
                .open()
                .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
                .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
                .then(result => {
                    console.log("confirmed");
                    this._setRole(user, role, event);
                }) // if were here ok was clicked.
                .catch(err => {
                    console.log("CANCELED")
                    this.refreshTable();
                });
        } else {
            this._setRole(user, role, event)
        }

    }
    _setRole(user: User, role: Role, event) {
        this.loading = true;
        if (event.target.checked) {
            if (!user.roles) {
                user.roles = [];
            }
            user.roles.push(role.name);
            for (let dependency of role.dependencies || []) {
                if (user.roles.indexOf(dependency) <= -1) {
                    user.roles.push(dependency);
                }
            }
        } else {
            if (user.roles) {
                var index = user.roles.indexOf(role.name);
                if (index !== -1) {
                    user.roles.splice(index, 1);
                }
            }
        }
        //update user
        this._airLockService.updateUser(user, this.selectedProduct.uniqueId).then((response) => {
            this.refreshTable();
        }).catch((error) => {
            let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to update user role");
            this._airLockService.notifyDataChanged("error-notification",errorMessage);
            this.refreshTable();
        });
    }

    addUser(event) {
        this.addUserModal.open(this.selectedProduct.uniqueId);
    }
    deleteUser(user:User) {
        this.modal.confirm()
            .title(`Are you sure you want to delete the user ${user.identifier}?`)
            .open()
            .catch(err => console.log("ERROR")) // catch error not related to the result (modal open...)
            .then(dialog => dialog.result) // dialog has more properties,lets just return the promise for a result.
            .then(result => {
                console.log("confirmed");
                this._airLockService.deleteUser(user).then((res) =>{
                    this.refreshTable();
                }).catch((error) => {
                    let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to delete user");
                    this._airLockService.notifyDataChanged("error-notification",errorMessage);
                    this.refreshTable();
                });

            }) // if were here ok was clicked.
            .catch(err => {
                console.log("CANCELED")
            });
    }
}

