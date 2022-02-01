/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

//Third party

// import {InputTextModule} from 'primeng/inputtext';
// import {ListboxModule} from 'primeng/listbox';
// import {DataTableModule} from 'angular2-datatable';
// import {TreeModule} from 'primeng/tree';
// import {ClipboardModule} from "angular2-clipboard";
// import {SelectModule} from "ng2-select";
import {SelectDropDownModule} from 'ngx-select-dropdown';
//internal
import {OrderCell} from "../@theme/airlock.components/orderCell/orderCell.component";
import {NgaModule} from "../@theme/nga.module";
import ALCommonsModule from "./common.module";
import {ConfigurationCell} from "../@theme/airlock.components/configurationCell/configurationCell.component";
import {HirarchyTree} from "../@theme/airlock.components/hirarchyTree/hirarchyTree.component";
import {Accordion, AccordionGroup, WhitelistAttributes} from "./wlattributes/wlattributes.component";
import {HirarchyNode} from "../@theme/airlock.components/hirarchyTree/hirarchyNode/hirarchyNode.component";
import {WhitelistSummary} from "./wlpreview/wlsummary.component";
import {InlineEditComponent} from "./wlattributes/inlinedit/inline-edit.component";
import {EditFeatureModal} from "../@theme/modals/editFeatureModal";
import {ShowEncryptionKeyModal} from "../@theme/modals/showEncryptionKeyModal";
import {ReorderMXGroupModal} from "../@theme/modals/reorderMXGroupModal";
import {AddConfigurationModal} from "../@theme/modals/addConfigurationModal";
import {AddFeatureToGroupModal} from "../@theme/modals/addFeatureToGroupModal";
import {wlAttributesModal} from "../@theme/modals/wlAttributesModal";
import {wlContextModal} from "../@theme/modals/wlContextModal";
import {VerifyRemoveFromBranchModal} from "../@theme/modals/verifyRemoveFromBranchModal";
import {TreeviewModule} from "ngx-treeview";
import {
    NbAccordionModule, NbAutocompleteModule,
    NbButtonModule,
    NbCardModule, NbLayoutModule,
    NbListModule,
    NbMenuModule, NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {TagInputModule} from "ngx-chips-angular";
import { EditFeaturePage } from 'app/@theme/airlock.components/editFeaturePage/editFeaturePage.component';
import {AceEditorModule} from "ngx-ace-editor-wrapper";
import {NgSelectModule} from "@ng-select/ng-select";
import {AccordionModule} from "ngx-bootstrap/accordion";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgaModule,
        TagInputModule,
        SelectDropDownModule,
        NbAutocompleteModule,
        ALCommonsModule,
        TreeviewModule,
        NbMenuModule,
        NbAccordionModule,
        NbListModule,
        NbTabsetModule,
        ALCommonsModule,
        NbCardModule,
        NbButtonModule,
        NbLayoutModule,
        NbSidebarModule,
        ALCommonsModule,
        AceEditorModule,
        NgSelectModule,
        AccordionModule
    ],
    declarations: [
        OrderCell,
        HirarchyNode,
        HirarchyTree,
        WhitelistSummary,
        WhitelistAttributes,
        Accordion,
        AccordionGroup,
        InlineEditComponent,
        EditFeatureModal,
        EditFeaturePage,
        ShowEncryptionKeyModal,
        ReorderMXGroupModal,
        AddConfigurationModal,
        wlAttributesModal,
        wlContextModal,
        VerifyRemoveFromBranchModal,
        AddFeatureToGroupModal,
    ],
    providers: [
    ],
    exports: [
        OrderCell,
        HirarchyNode,
        HirarchyTree,
        WhitelistSummary,
        WhitelistAttributes,
        Accordion,
        AccordionGroup,
        InlineEditComponent,
        ShowEncryptionKeyModal,
        ReorderMXGroupModal,
        AddConfigurationModal,
        wlAttributesModal,
        wlContextModal,
        VerifyRemoveFromBranchModal,
        AddFeatureToGroupModal,
        EditFeaturePage,
        EditFeatureModal,
    ],
})
export default class FeaturesCommonModule {
}
