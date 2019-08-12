// import {Pages} from './pages.component';
//
// import {FeaturesTable} from './features/components/featureTable/featureTable.component';
// import {Groups} from './groups/groups.component';
// import {Settings} from './settings/settings.component';
// import {FeaturesPage} from "./featuresPage/featuresPage.component";
// import {Products} from "./products/products.component";
// import {AuthGuard} from "../services/auth-guard.service";
// import {RouterConfig} from "@angular/router";
//
// //noinspection TypeScriptValidateTypes
// export const PagesRoutes:RouterConfig = [
//   {
//     path: 'pages',
//     component: Pages,
//     children: [
//
//       {
//         path: 'features',
//         canActivate: [AuthGuard],
//         component: FeaturesPage,
//         data: {
//           menu: {
//             title: 'Features',
//             icon: 'ion-cube',
//             selected: false,
//             expanded: false,
//             order: 0
//           }
//         }
//       },
//       {
//         path: 'products',
//         canActivate: [AuthGuard],
//         component: Products,
//         data: {
//           menu: {
//             title: 'Products',
//             icon: 'ion-android-phone-portrait',
//             selected: false,
//             expanded: false,
//             order: 100
//           }
//         }
//       },
//       {
//         path: 'groups',
//         canActivate: [AuthGuard],
//         component: Groups,
//         data: {
//           menu: {
//             title: 'User Groups',
//             icon: 'ion-ios-people',
//             selected: false,
//             expanded: false,
//             order: 200
//           }
//         }
//       },
//     ]
//   }
// ];
