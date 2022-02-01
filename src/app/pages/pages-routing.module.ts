import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { PagesComponent } from './pages.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: '', redirectTo: 'features', pathMatch: 'full'
    },
    {
      path: 'features/:prodId/:seasonId/:branchId/:featureId',
      loadChildren: () => import('./featuresPage/features.module')
          .then(m => m.FeaturesModule),
    },
    {
      path: 'features',
      loadChildren: () => import('./featuresPage/features.module')
          .then(m => m.FeaturesModule),
    },
    {
      path: 'streams/:prodId/:seasonId/:branchId/:streamId',
      loadChildren: () => import('./streams/streams.module')
          .then(m => m.StreamsModule),
    },
    {
      path: 'streams',
      loadChildren: () => import('./streams/streams.module')
          .then(m => m.StreamsModule),
    },
    {
      path: 'notifications/:prodId/:seasonId/:branchId/:notificationId',
      loadChildren: () => import('./notifications/notifications.module')
          .then(m => m.NotificationsModule),
    },
    {
      path: 'notifications',
      loadChildren: () => import('./notifications/notifications.module')
          .then(m => m.NotificationsModule),
    },
    {
      path: 'experiments/:prodId/:seasonId/:branchId/:experimentId',
      loadChildren: () => import('./experiments/experiments.module')
          .then(m => m.ExperimentsModule),
    },
    {
      path: 'experiments/variants/:prodId/:seasonId/:branchId/:variantId',
      loadChildren: () => import('./experiments/experiments.module')
          .then(m => m.ExperimentsModule),
    },
    {
      path: 'experiments',
      loadChildren: () => import('./experiments/experiments.module')
          .then(m => m.ExperimentsModule),
    },
    {
      path: 'polls/:prodId/:pollId',
      loadChildren: () => import('./polls/polls.module')
          .then(m => m.PollsModule),
    },
    {
      path: 'polls/questions/:prodId/:questionId',
      loadChildren: () => import('./polls/polls.module')
          .then(m => m.PollsModule),
    },
    {
      path: 'polls/answers/:prodId/:answerId/:questionId',
      loadChildren: () => import('./polls/polls.module')
          .then(m => m.PollsModule),
    },
    {
      path: 'polls/openanswer/:prodId/:openAnswerId/:questionId',
      loadChildren: () => import('./polls/polls.module')
          .then(m => m.PollsModule),
    },
    {
      path: 'polls',
      loadChildren: () => import('./polls/polls.module')
          .then(m => m.PollsModule),
    },
    {
      path: 'translations',
      loadChildren: () => import('./translations/translations.module')
          .then(m => m.TranslationsModule),
    },
    {
      path: 'entitlements/:prodId/:seasonId/:branchId/:purchaseId',
      loadChildren: () => import('./purchases/purchases.module')
          .then(m => m.PurchasesModule),
    },
    {
      path: 'entitlements/purchaseOptions/:prodId/:seasonId/:branchId/:purchaseOptionId',
      loadChildren: () => import('./purchases/purchases.module')
          .then(m => m.PurchasesModule),
    },
    {
      path: 'entitlements',
      loadChildren: () => import('./purchases/purchases.module')
          .then(m => m.PurchasesModule),
    },
    {
      path: 'cohorts/:prodId/:seasonId/:branchId/:cohortId',
      loadChildren: () => import('./cohorts/cohorts.module')
          .then(m => m.CohortsModule),
    },
    {
      path: 'cohorts',
      loadChildren: () => import('./cohorts/cohorts.module')
          .then(m => m.CohortsModule),
    },
    {
      path: 'dataimport/:prodId/:seasonId/:branchId/:dataimportId/:currModifiedBy',
      loadChildren: () => import('./dataimport/dataimport.module')
          .then(m => m.DataimportModule),
    },
    {
      path: 'dataimport',
      loadChildren: () => import('./dataimport/dataimport.module')
          .then(m => m.DataimportModule),
    },
    {
      path: 'products',
      loadChildren: () => import('./products/products.module')
          .then(m => m.ProductsModule),
    },
    {
      path: 'groups',
      loadChildren: () => import('./groups/groups.module')
          .then(m => m.GroupsModule),
    },
    {
      path: 'webhooks',
      loadChildren: () => import('./webhooks/webhooks.module')
          .then(m => m.WebhooksModule),
    },
    {
      path: 'webhooks/:prodId/:seasonId/:branchId/:webhookId',
      loadChildren: () => import('./webhooks/webhooks.module')
          .then(m => m.WebhooksModule),
    },
    {
      path: 'authorization',
      loadChildren: () => import('./authorization/authorization.module')
          .then(m => m.AuthorizationModule),
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
