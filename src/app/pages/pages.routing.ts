import { Routes, RouterModule }  from '@angular/router';
import { Pages } from './pages.component';
// noinspection TypeScriptValidateTypes
const routes: Routes = [
  // {
  //   path: 'login',
  //   loadChildren: () => System.import('./login/login.module')
  // },
  // {
  //   path: 'register',
  //   loadChildren: () => System.import('./register/register.module')
  // },
  {
    path: 'pages',
    component: Pages,
    children: [
      { path: '', redirectTo: 'features', pathMatch: 'full' },
      { path: 'features', loadChildren: () => System.import('./featuresPage/features.module') },
      { path: 'groups', loadChildren: () => System.import('./groups/groups.module') },
      { path: 'authorization', loadChildren: () => System.import('./authorization/authorization.module') },
      { path: 'webhooks', loadChildren: () => System.import('./webhooks/webhooks.module') },
      { path: 'products', loadChildren: () => System.import('./products/products.module') },
      { path: 'translations', loadChildren: () => System.import('./translations/translations.module') },
      { path: 'experiments', loadChildren: () => System.import('./experiments/experiments.module') },
      { path: 'streams', loadChildren: () => System.import('./streams/streams.module') },
      { path: 'notifications', loadChildren: () => System.import('./notifications/notifications.module') },
      { path: 'entitlements', loadChildren: () => System.import('./purchases/purchases.module') }
    ]
  }
];

export const routing = RouterModule.forChild(routes);
