import {Component, EventEmitter, Output} from '@angular/core';
import {AirlockService} from "../../../services/airlock.service";
import {Product} from "../../../model/product"
import {StringsService} from "../../../services/strings.service";
import {NbDialogRef, NbGlobalLogicalPosition, NbToastrService} from "@nebular/theme";


@Component({
    selector: 'add-product-modal',
    styleUrls: ['./addProductModal.scss'],
    templateUrl: './addProductModal.html'

})

export class AddProductModal {

    loading: boolean = false;
    _product: Product;
    @Output() onProductAdded = new EventEmitter();

    constructor(private _airLockService: AirlockService
        , private _stringsSrevice: StringsService, private toastrService: NbToastrService, protected modalRef: NbDialogRef<AddProductModal>) {
        this._product = new Product();
    }

    getString(name: string) {
        return this._stringsSrevice.getString(name);
    }

    open() {
        if (this.modalRef) {

            this._product = new Product();
            // this.modal.open();
        }
    }

    save() {

        if (this.isValid()) {
            this.loading = true;
            this._product.codeIdentifier = this._product.name.replace(/ /g, '');
            this._airLockService.addProduct(this._product).then(
                result => {
                    this.loading = false;
                    console.log(result)
                    this.onProductAdded.emit(result);
                    this.close(result)
                    this._airLockService.notifyDataChanged("success-notification", {
                        title: "Success",
                        message: "New product added"
                    });
                }
            ).catch(
                error => {
                    this.handleError(error);
                }
            );

        } else {
            this.loading = false;
            this.create('Product name is required.')
        }
    }

    isValid(): boolean {
        if (!this._product)
            return false;

        return (this._product.name.trim() !== '');
    }

    close(result: any = null) {
        this.modalRef.close(result);
    }

    handleError(error: any) {
        this.loading = false;

        let errorMessage = this._airLockService.parseErrorMessage(error, "Failed to add product. Please try again."); //error._body || "Failed to add product. Please try again.";
        // console.log("handleError in addProductModal:"+errorMessage);
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
        position: ["right", "bottom"]
    };

    create(message: string) {
        this.toastrService.danger(message, "Add product failed", {
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

