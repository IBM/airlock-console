/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgaModule} from '../../@theme/nga.module';
import {routing} from './purchases.routing';
import {PurchasesPage} from "./purchases.component";
import ALCommonsModule from "../common.module";
import {PurchaseCell} from "../../@theme/airlock.components/purchaseCell/purchaseCell.component";
import {PurchaseOptionsCell} from "../../@theme/airlock.components/purchaseOptionsCell/purchaseOptionsCell.component";
import FeaturesCommonModule from "../features.common.module";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {ModalModule} from "ngx-bootstrap/modal";
import {AddPurchaseConfigurationModal} from "../../@theme/modals/addPurchaseConfigurationModal";
import {AddPurchaseOptionModal} from "../../@theme/modals/addPurchaseOptionModal";
import {AddPurchaseModal} from "../../@theme/modals/addPurchaseModal";
import {
    NbButtonModule,
    NbCardModule,
    NbLayoutModule,
    NbPopoverModule,
    NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {EditPurchaseModal} from "../../@theme/modals/editPurchaseModal";
import {EditPurchaseOptionsModal} from "../../@theme/modals/editPurchaseOptionsModal";
import {ReorderPurchaseMXGroupModal} from "../../@theme/modals/reorderPurchaseMXGroupModal";
import {NgSelectModule} from "@ng-select/ng-select";
import {SelectIncludedPurchases} from "../../@theme/airlock.components/selectIncludedPurchases";
import { IncludedPurchasesNode } from 'app/@theme/airlock.components/selectIncludedPurchases/includedPurchasesNode/includedPurchasesNode.component';


//Modal views
// import {EditPurchaseModal} from "../../theme/airlock.components/editPurchaseModal";
// import {ReorderPurchaseMXGroupModal} from "../../theme/airlock.components/reorderPurchaseMXGroupModal";
// import {SelectIncludedPurchases} from "../../theme/airlock.components/selectIncludedPurchases/selectIncludedPurchases.component";
// import {IncludedPurchasesNode} from "../../theme/airlock.components/selectIncludedPurchases/includedPurchasesNode/includedPurchasesNode.component";
// import {EditPurchaseOptionsModal} from "../../theme/airlock.components/editPurchaseOptionsModal";
// import {ImportPurchasesModal} from '../../theme/airlock.components/importPurchasesModal/importPurchasesModal.component';
// import {SelectModule} from "ng2-select";
// import {DropdownMultiselectModule} from 'ng2-dropdown-multiselect';
// import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
// import {ModalModule} from "angular2-modal/";
// import {DataTableModule, InputTextModule, ListboxModule, TreeModule} from 'primeng/primeng';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        TooltipModule.forRoot(),
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ModalModule.forRoot(),
        ALCommonsModule,
        NgSelectModule,
        routing,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        FeaturesCommonModule,
    ],
    declarations: [
        PurchasesPage,
        PurchaseCell,
        PurchaseOptionsCell,
        AddPurchaseModal,
        AddPurchaseConfigurationModal,
        EditPurchaseModal,
        AddPurchaseOptionModal,
        ReorderPurchaseMXGroupModal,
        SelectIncludedPurchases,
        // IncludedPurchasesNode,
        // ImportPurchasesModal,
        EditPurchaseOptionsModal
    ],
    providers: []
})
export class PurchasesModule {
}
