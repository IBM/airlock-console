"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routing = void 0;
/**
 * Created by elikkatz on 19/01/2017.
 */
var router_1 = require("@angular/router");
var notifications_component_1 = require("./notifications.component");
var auth_guard_service_1 = require("../../services/auth-guard.service");
// noinspection TypeScriptValidateTypes
var routes = [
    {
        path: '',
        canActivate: [auth_guard_service_1.AuthGuard],
        component: notifications_component_1.NotificationsPage,
        data: {
            menu: {
                title: 'Notifications',
                icon: 'fa fa-bell',
                selected: false,
                expanded: false,
                order: 0
            }
        }
    }
];
exports.routing = router_1.RouterModule.forChild(routes);
//# sourceMappingURL=notifications.routing.js.map