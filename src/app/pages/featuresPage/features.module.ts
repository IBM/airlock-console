/**
 * Created by elikkatz on 19/01/2017.
 */
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {routing} from './features.routing';
import {FeaturesPage} from "./featuresPage.component";
import {FeatureCell} from "../../@theme/airlock.components/featureCell/featureCell.component";
import FeaturesCommonModule from "../features.common.module";
import ALCommonsModule from "../common.module";
import {SearchScreen} from "../../@theme/airlock.components/searchScreen";
import {NgaModule} from "../../@theme/nga.module";
import {PopoverModule} from "ngx-bootstrap/popover";
import {ProgressbarModule} from "ngx-bootstrap/progressbar";
import {TooltipModule} from "ngx-bootstrap/tooltip";
import {AccordionModule} from "ngx-bootstrap/accordion";
import {ButtonsModule} from "ngx-bootstrap/buttons";
import {AlertModule} from "ngx-bootstrap/alert";
import {AddFeatureModal} from "../../@theme/modals/addFeatureModal";
import {
    NbAutocompleteModule,
    NbCardModule, NbLayoutModule,
    NbPopoverModule,
    NbSearchModule,
    NbSelectModule, NbSidebarModule,
    NbTabsetModule
} from "@nebular/theme";
import {ImportFeaturesModal} from "../../@theme/modals/importFeaturesModal";
import {TagInputModule} from "ngx-chips-angular";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        NgaModule,
        NbCardModule,
        NbSelectModule,
        PopoverModule.forRoot(),
        NbPopoverModule,
        ProgressbarModule.forRoot(),
        // BsDropdownModule,
        TooltipModule.forRoot(),
        NbTabsetModule,
        AccordionModule.forRoot(),
        ButtonsModule.forRoot(),
        AlertModule.forRoot(),
        ALCommonsModule,
        routing,
        FeaturesCommonModule,
        ReactiveFormsModule,
        TagInputModule,
        NbAutocompleteModule,
        NbSearchModule,
        NbSidebarModule,
        ALCommonsModule,
        FeaturesCommonModule,
        NbLayoutModule,
        FeaturesCommonModule,
        // InputTextModule,
        // ListboxModule,
        // DataTableModule,
        // TreeModule,
        // SelectModule,
        // ClipboardModule,
    ],
    declarations: [
        FeatureCell,
        FeaturesPage,
        SearchScreen,
        AddFeatureModal,
        ImportFeaturesModal,
    ],
    providers: [
        NbCardModule,
        NbPopoverModule,
    ],
    exports: [
        FeatureCell,
        FeaturesPage,
        ImportFeaturesModal,
        AddFeatureModal,
    ]
})
export class FeaturesModule {}
