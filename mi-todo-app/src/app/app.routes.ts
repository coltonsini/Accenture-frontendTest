// * This are the routes of the application, they are used to navigate between pages. Each route has a path and a component that will be loaded when the path is accessed. The loadComponent function is used to lazy load the component, 
// * which means that the component will only be loaded when it is needed, improving the performance of the application.

import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage)
  },
  {
    path: 'task-form',
    loadComponent: () => import('./pages/task-form/task-form.page').then(m => m.TaskFormPage)
  },
  {
    path: 'task-form/:id',
    loadComponent: () => import('./pages/task-form/task-form.page').then(m => m.TaskFormPage)
  },
];
