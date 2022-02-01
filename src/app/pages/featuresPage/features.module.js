"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by elikkatz on 19/01/2017.
 */
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var nga_module_1 = require("../../theme/nga.module");
var features_routing_1 = require("./features.routing");
var ng2_bootstrap_1 = require("ng2-bootstrap");
var tabs_1 = require("ng2-bootstrap/tabs");
var featureCell_component_1 = require("../../theme/airlock.components/featureCell/featureCell.component");
var addFeatureModal_component_1 = require("../../theme/airlock.components/addFeatureModal/addFeatureModal.component");
var featuresPage_component_1 = require("./featuresPage.component");
//import {UiSwitchComponent} from "angular2-ui-switch/dist/ui-switch.component";
var ng2_bs3_modal_1 = require("ng2-bs3-modal");
var angular2_modal_1 = require("angular2-modal/");
var ng2_bootstrap_2 = require("ng2-bootstrap");
var ng2_bootstrap_3 = require("ng2-bootstrap");
var ng2_bootstrap_4 = require("ng2-bootstrap");
var ng2_bootstrap_5 = require("ng2-bootstrap");
var ng2_bootstrap_6 = require("ng2-bootstrap");
var angular2_notifications_1 = require("angular2-notifications");
var ng_push_1 = require("ng-push");
var ng2_bootstrap_7 = require("ng2-bootstrap");
var inputtext_1 = require("primeng/inputtext");
var listbox_1 = require("primeng/listbox");
var angular2_datatable_1 = require("angular2-datatable");
var importFeaturesModal_component_1 = require("../../theme/airlock.components/importFeaturesModal/importFeaturesModal.component");
var ng2_dropdown_multiselect_1 = require("ng2-dropdown-multiselect");
var tree_1 = require("primeng/tree");
var angular2_clipboard_1 = require("angular2-clipboard");
var ng2_select_1 = require("ng2-select");
var features_common_module_1 = require("../features.common.module");
var common_module_1 = require("../common.module");
var searchScreen_1 = require("../../theme/airlock.components/searchScreen");
var FeaturesModule = /** @class */ (function () {
    function FeaturesModule() {
    }
    FeaturesModule = __decorate([
        core_1.NgModule({
            imports: [
                common_1.CommonModule,
                forms_1.FormsModule,
                nga_module_1.NgaModule,
                ng2_bs3_modal_1.BsModalModule,
                ng2_bootstrap_7.PopoverModule.forRoot(),
                ng2_bootstrap_1.ProgressbarModule.forRoot(),
                ng2_bootstrap_2.BsDropdownModule.forRoot(),
                ng2_bootstrap_3.TooltipModule.forRoot(),
                tabs_1.TabsModule.forRoot(),
                ng2_bootstrap_4.AccordionModule.forRoot(),
                ng2_bootstrap_5.ButtonsModule.forRoot(),
                ng2_bootstrap_6.AlertModule.forRoot(),
                angular2_modal_1.ModalModule.forRoot(),
                angular2_notifications_1.SimpleNotificationsModule,
                ng2_dropdown_multiselect_1.DropdownMultiselectModule,
                ng_push_1.PushNotificationsModule, common_module_1.default,
                features_routing_1.routing,
                inputtext_1.InputTextModule,
                listbox_1.ListboxModule,
                angular2_datatable_1.DataTableModule,
                tree_1.TreeModule,
                ng2_select_1.SelectModule,
                angular2_clipboard_1.ClipboardModule,
                features_common_module_1.default
            ],
            declarations: [
                featureCell_component_1.FeatureCell,
                addFeatureModal_component_1.AddFeatureModal,
                featuresPage_component_1.FeaturesPage,
                importFeaturesModal_component_1.ImportFeaturesModal,
                searchScreen_1.SearchScreen
            ],
            providers: [
            // TransparentSpinner,
            // NotificationsService,
            // FeatureUtilsService,
            ],
            exports: [
                featureCell_component_1.FeatureCell,
                /*UiSwitchComponent,*/
                addFeatureModal_component_1.AddFeatureModal,
                featuresPage_component_1.FeaturesPage,
                importFeaturesModal_component_1.ImportFeaturesModal,
            ]
        })
    ], FeaturesModule);
    return FeaturesModule;
}());
exports.default = FeaturesModule;
//# sourceMappingURL=features.module.js.map