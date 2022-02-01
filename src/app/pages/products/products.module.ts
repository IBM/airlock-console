import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from "../../@theme/nga.module";
import {routing} from "./products.routing";
import {ProductDetail} from "./components/product-detail/product-detail.component";
import {ProductList} from "./components/product-list/product-list.component";
import {Products} from "./products.component";
import ALCommonsModule from "../common.module";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {AddProductModal} from "../../@theme/modals/addProductModal";
import {NbCardModule, NbPopoverModule} from "@nebular/theme";
import {BaThemeConfigProvider} from "../../@theme/theme.configProvider";
import {BaThemeConfig} from "../../@theme/theme.config";
import {CohortsSettingsModal} from "../../@theme/modals/cohortsSettingsModal";
import {SeasonModal} from "../../@theme/modals/seasonModal";
import {BranchUsageModal} from "../../@theme/modals/branchUsageModal";
import {AceEditorModule} from "ngx-ace-editor-wrapper";

//Modal views
// import {AddProductModal} from "../../theme/airlock.components/addProductModal/addProductModal.component";
// import {SeasonModal} from "../../theme/airlock.components/seasonModal/seasonModal.component";
// import {SimpleNotificationsModule} from "angular2-notifications";
// import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
// import {BranchUsageModal} from "../../theme/airlock.components/branchUsageModal";
// import {CohortsSettingsModal} from "../../theme/cohortsSettingsModal";


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        TooltipModule.forRoot(),
        NbPopoverModule,
        // DropdownModule.forRoot(),
        AccordionModule.forRoot(),
        ALCommonsModule,
        routing,
        // SimpleNotificationsModule,
        // DropdownModule,
        ALCommonsModule,
        AceEditorModule
    ],
    declarations: [
        Products,
        ProductList,
        ProductDetail,
        AddProductModal,
        SeasonModal,
        BranchUsageModal,
        CohortsSettingsModal

    ],
    providers: [
        BaThemeConfigProvider,
        BaThemeConfig,
    ]
})
export class ProductsModule {
}
