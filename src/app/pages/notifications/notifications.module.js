"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var nga_module_1 = require("../../theme/nga.module");
var notifications_routing_1 = require("./notifications.routing");
var ng2_bootstrap_1 = require("ng2-bootstrap");
var tabs_1 = require("ng2-bootstrap/tabs");
var ng2_bs3_modal_1 = require("ng2-bs3-modal");
var angular2_modal_1 = require("angular2-modal/");
var ng2_bootstrap_2 = require("ng2-bootstrap");
var ng2_bootstrap_3 = require("ng2-bootstrap");
var ng2_bootstrap_4 = require("ng2-bootstrap");
var ng2_bootstrap_5 = require("ng2-bootstrap");
var ng2_bootstrap_6 = require("ng2-bootstrap");
var angular2_notifications_1 = require("angular2-notifications");
var common_module_1 = require("../common.module");
var ng2_bootstrap_7 = require("ng2-bootstrap");
var inputtext_1 = require("primeng/inputtext");
var listbox_1 = require("primeng/listbox");
var angular2_datatable_1 = require("angular2-datatable");
var ng2_select_1 = require("ng2-select");
var ng2_dropdown_multiselect_1 = require("ng2-dropdown-multiselect");
var tree_1 = require("primeng/tree");
var notifications_component_1 = require("./notifications.component");
var notificationCell_component_1 = require("../../theme/airlock.components/notificationCell/notificationCell.component");
var addNotificationModal_component_1 = require("../../theme/airlock.components/addNotificationModal/addNotificationModal.component");
var editNotificationModal_component_1 = require("../../theme/airlock.components/editNotificationModal/editNotificationModal.component");
var reorderNotificationsModal_component_1 = require("../../theme/airlock.components/reorderNotificationsModal/reorderNotificationsModal.component");
var limitNotificationsModal_component_1 = require("../../theme/airlock.components/limitNotificationsModal/limitNotificationsModal.component");
var ng_push_1 = require("ng-push");
var NotificationsModule = /** @class */ (function () {
    function NotificationsModule() {
    }
    NotificationsModule = __decorate([
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
                notifications_routing_1.routing,
                inputtext_1.InputTextModule,
                listbox_1.ListboxModule,
                angular2_datatable_1.DataTableModule,
                tree_1.TreeModule,
                ng2_select_1.SelectModule,
            ],
            declarations: [
                notifications_component_1.NotificationsPage, notificationCell_component_1.NotificationCell, addNotificationModal_component_1.AddNotificationModal, editNotificationModal_component_1.EditNotificationModal, reorderNotificationsModal_component_1.ReorderNotificationsModal, limitNotificationsModal_component_1.LimitNotificationsModal
            ],
            providers: []
        })
    ], NotificationsModule);
    return NotificationsModule;
}());
exports.default = NotificationsModule;
//# sourceMappingURL=notifications.module.js.map