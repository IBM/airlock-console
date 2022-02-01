/**
 * Created by yoavmac on 18/08/2016.
 */

import {Component, OnInit} from '@angular/core';
import {AirlockService} from "../../services/airlock.service";
import {Product} from "../../model/product";
import {Season} from "../../model/season";
import {AuthorizationService} from "../../services/authorization.service";
import {GlobalState} from "../../global.state";
import {NbDialogService} from "@nebular/theme";
import {AddProductModal} from "../../@theme/modals/addProductModal";

//Modal views
// import {AddProductModal} from "../../theme/airlock.components/addProductModal"

@Component({
    selector: 'products',
    styleUrls: ['./products.scss'],
    templateUrl: './products.html'
})
export class Products implements OnInit {

    // @ViewChild('addProductModal') _addProductModal: AddProductModal;

    _products: Product[] = [];
    _selectedProduct: Product = null;
    _loading: boolean = false;
    _isDisplayOnly: boolean = false;

    constructor(private _airlockService: AirlockService,
                private authorizationService: AuthorizationService,
                private _appState: GlobalState,
                private modalService: NbDialogService) {
        this._isDisplayOnly = (_airlockService.isEditor() || _airlockService.isViewer());
    }

    ngOnDestroy() {
        this._appState.unsubcribe('features.currentProduct', 'products');
    }

    ngOnInit() {
        this._selectedProduct = this._appState.getData('features.currentProduct');
        this._appState.subscribe('features.currentProduct', 'products', (product) => {
            console.log("product changed");
            this.productSelectionChanged(product)
        });
        this._loading = false;
        // this.refreshProducts(null);
    }

    isShowAdd() {
        return this._airlockService.isGlobalUserAdministrator() || this._airlockService.isGlobalUserProductLead() || this._airlockService.isGlobalUserEditor();
    }

    public productSelectionChanged(product: Product) {
        this._selectedProduct = product;
    }

    public productUpdated(product: Product) {
        this._appState.notifyDataChanged('features.currentProductbyPage', product);
        this._selectedProduct = product;
    }

    public seasonsChanged(season: Season) {
        this._appState.notifyDataChanged('features.currentProductbyPage', this._selectedProduct);
        // this.refreshProducts(this._selectedProduct.name);
    }

    public seasonsDeleted(season: Season) {
        this._appState.notifyDataChanged('features.currentProductbyPage', this._selectedProduct);
    }

    public addProduct() {
        this.modalService.open(AddProductModal).onClose.subscribe(product => {
            this.productAdded(product);
        });
    }

    public productAdded(product: Product) {
        if (product != null) {
            console.log(product + " Added");
            product.seasons = [];
            this._appState.notifyDataChanged('features.currentProductbyPage', product);
            // this.refreshProducts(product.name);
        }
    }

    private refreshProducts(productNameToSelect: string) {

        this._loading = true;
        this._airlockService.getProducts()
            .then(response => {

                console.log(response);
                this._products = response as Product[];

                if (productNameToSelect) {
                    let p = this.getProductByName(productNameToSelect);
                    if (p) {
                        this._selectedProduct = p;
                    }
                }

                this._loading = false;
            })
            .catch(error => {
                console.log(`Failed to get products: ${error}`)
            });
    }

    private getProductByName(name: string): Product {

        for (let p of this._products) {
            if (p.name == name) {
                return p;
            }
        }
        return null;
    }
}
