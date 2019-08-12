import {Groups} from "./groups/groups.component";
import {AuthGuard} from "../services/auth-guard.service";
import {Products} from "./products/products.component";
import {FeaturesPage} from "./featuresPage/featuresPage.component";
import {Pages} from "./pages.component";
import {TranslationsPage} from "./translations/translations.component";
import {NotificationsPage} from "./notifications/notifications.component";
import {ExperimentsPage} from "./experiments/experiments.component";
import {Administration} from "./administration/administration.component";
import {StreamsPage} from "./streams/streams.component";
import {AuthorizationPage} from "./authorization";
import {WebhooksPage} from "./webhooks";
import {PurchasesPage} from "./purchases";
export const PAGES_MENU = [

  {
    path: 'pages',
    component: Pages,
    children: [

      {
        path: 'features',
        canActivate: [AuthGuard],
        component: FeaturesPage,
        data: {
          menu: {
            title: 'Features',
            icon: 'ion-cube',
            selected: false,
            hidden:false,
            expanded: false,
            order: 0
          }
        }
      },
      {
        path: 'experiments',
        canActivate: [AuthGuard],
        component: ExperimentsPage,
        data: {
          menu: {
            title: 'Experiments',
            icon: 'ion-erlenmeyer-flask',
            selected: false,
            hidden:false,
            expanded: false,
            order: 200
          }
        }
      },
      {
          path: 'streams',
          canActivate: [AuthGuard],
          component: StreamsPage,
          data: {
              menu: {
                  title: 'Streams',
                  icon: 'fa fa-bolt',
                  selected: false,
                  hidden:false,
                  expanded: false,
                  order: 200
              }
          }
      },
      {
        path: 'notifications',
        canActivate: [AuthGuard],
        component: NotificationsPage,
        data: {
          menu: {
            title: 'Notifications',
            icon: 'ion-android-notifications',
            selected: false,
            hidden:false,
            expanded: false,
            order: 200
          }
        }
      },
      {
        path: 'translations',
        canActivate: [AuthGuard],
        component: TranslationsPage,
        data: {
          menu: {
            title: 'Translations',
            icon: 'ion-earth',
            selected: false,
            hidden:false,
            expanded: false,
            order: 200
          }
        }
      },
      {
        path: 'entitlements',
        canActivate: [AuthGuard],
        component: PurchasesPage,
        data: {
          menu: {
            title: 'Entitlements',
            icon: 'ion-cash',
            selected: false,
            hidden:false,
            expanded: false,
            order: 200
          }
        }
      },
      {
        // path: 'administration',
        // component: Administration,
        // canActivate: [AuthGuard],
        data: {
          menu: {
            title: 'Administration',
            icon: 'ion-gear-a',
            selected: false,
            hidden:false,
            expanded: false,
            order: 200
          }
        },
        children:[
          {
            path: 'products',
            canActivate: [AuthGuard],
            component: Products,
            data: {
              menu: {
                title: 'Products',
                icon: 'ion-android-phone-portrait',
                selected: false,
                hidden:false,
                expanded: false,
                order: 100
              }
            }
          },
          {
            path: 'groups',
            canActivate: [AuthGuard],
            component: Groups,
            data: {
              menu: {
                title: 'User Groups',
                icon: 'ion-ios-people',
                selected: false,
                hidden:false,
                expanded: false,
                order: 200
              }
            }
          },
            {
                path: 'webhooks',
                canActivate: [AuthGuard],
                component: WebhooksPage,
                data: {
                    menu: {
                        title: 'Webhooks',
                        icon: 'fa fa-plug',
                        selected: false,
                        hidden:false,
                        expanded: false,
                        order: 200
                    }
                }
            },
          {
            path: 'authorization',
            canActivate: [AuthGuard],
            component: AuthorizationPage,
            data: {
              menu: {
                title: 'Authorization',
                icon: 'ion-key',
                selected: false,
                hidden:false,
                expanded: false,
                order: 200
              }
            }
          },
        ]
      },

    ]
  }
];
