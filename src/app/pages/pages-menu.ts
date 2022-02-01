import { NbMenuItem } from '@nebular/theme';

export const MENU_ITEMS: NbMenuItem[] = [
  {
    title: 'Features',
    icon: { icon: 'ion-cube', pack: 'ionicons' },
    link: '/pages/features',
    pathMatch: "prefix",
    home: true,
  },
  {
    title: 'Experiments',
    icon: { icon: 'ion-erlenmeyer-flask', pack: 'ionicons' },
    link: '/pages/experiments',
    pathMatch: "prefix"
  },
  {
    title: 'Streams',
    icon: { icon: 'bolt', pack: 'fa' },
    link: '/pages/streams',
    pathMatch: "prefix"
  },
  {
    title: 'Notifications',
    icon: { icon: 'ion-android-notifications', pack: 'ionicons' },
    link: '/pages/notifications',
    pathMatch: "prefix"
  },
  {
    title: 'Polls',
    icon: { icon: 'ion-clipboard', pack: 'ionicons' },
    link: '/pages/polls',
    pathMatch: "prefix"
  },
  {
    title: 'Translations',
    icon: { icon: 'ion-earth', pack: 'ionicons' },
    link: '/pages/translations',
    pathMatch: "prefix"
  },
  {
    title: 'Entitlements',
    icon: { icon: 'ion-cash', pack: 'ionicons' },
    link: '/pages/entitlements',
    pathMatch: "prefix"
  },
  {
    title: 'Airlytics',
    icon: { icon: 'chart-line', pack: 'fa' },
    children: [

  {
    title: 'Cohorts',
    icon: { icon: 'users', pack: 'fa' },
    link: '/pages/cohorts',
    pathMatch: "prefix"
  },
  {
    title: 'Data import',
    icon: { icon: 'upload', pack: 'fa' },
    link: '/pages/dataimport',
    pathMatch: "prefix"
  },
        ],
  },
  {
    title: 'Administration',
    icon: { icon: 'ion-gear-a', pack: 'ionicons' },
    children: [
      {
        title: 'Products',
        icon: { icon: 'ion-android-phone-portrait', pack: 'ionicons' },
        link: '/pages/products',
      },
      {
        title: 'User Groups',
        icon: { icon: 'ion-ios-people', pack: 'ionicons' },
        link: '/pages/groups',
      },
      {
        title: 'Webhooks',
        icon: { icon: 'plug', pack: 'fa' },
        link: '/pages/webhooks',
        pathMatch: "prefix"
      },
      {
        title: 'Authorization',
        icon: { icon: 'ion-key', pack: 'ionicons' },
        link: '/pages/authorization',
        pathMatch: "prefix"
      },
    ],
  },
  {
    title: 'Help',
    icon: { icon: 'ion-help', pack: 'ionicons' },
    url: 'https://docs.google.com/document/d/1oHuOnRq2WKj3O51cyQq8J0TyeNpYwNNybny-N3AgITc/edit#bookmark=id.qns1vvynzgqj',
    target: '_blank',
    hidden: true
  },
];
