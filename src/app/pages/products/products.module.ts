import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import {DropdownModule, TooltipModule} from 'ng2-bootstrap';
import { AccordionModule } from 'ng2-bootstrap';
import {BaCard} from "../../theme/components/baCard/baCard.component";
import {TransparentSpinner} from "../../theme/airlock.components/transparentSpinner/transparentSpinner.service";
import {NgaModule} from "../../theme/nga.module";
import {routing} from "./products.routing";
import {DocumentlinksModal} from "../../theme/airlock.components/documentlinksModal/documentlinksModal.component";
import {AddProductModal} from "../../theme/airlock.components/addProductModal/addProductModal.component";
import {ProductDetail} from "./components/product-detail/product-detail.component";
import {ProductList} from "./components/product-list/product-list.component";
import {Products} from "./products.component";
import {SeasonModal} from "../../theme/airlock.components/seasonModal/seasonModal.component";
import {SimpleNotificationsComponent} from "angular2-notifications";
import {SimpleNotificationsModule} from "angular2-notifications";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import FeaturesModule from "../featuresPage/features.module";
import ALCommonsModule from "../common.module";
import {EditInputSchemaModal} from "../../theme/airlock.components/editInputSchemaModal/editInputSchemaModal.component";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        TooltipModule.forRoot(),
        DropdownModule.forRoot(),
        // ModalModule,
        AccordionModule.forRoot(),
        routing,SimpleNotificationsModule,Ng2Bs3ModalModule,DropdownModule,ALCommonsModule
    ],
    declarations: [
        Products,ProductList, ProductDetail
        , AddProductModal,SeasonModal

    ]
})
export default class ProductsModule {
}
