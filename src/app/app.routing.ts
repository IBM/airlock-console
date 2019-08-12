import { Routes, RouterModule } from '@angular/router';

export const routes: Routes = [
  { path: '**', redirectTo: 'pages/features' }
];

export const routing = RouterModule.forRoot(routes, { useHash: true });
