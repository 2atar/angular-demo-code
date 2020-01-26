import {Routes} from '@angular/router';
import {LayoutComponent} from './components/layout/layout.component';
import {FuseLoginComponent} from './components/login/login.component';
import {FuseForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {RouteGuardService} from '../navigation/route-guard.service';
import {FuseMailConfirmComponent} from './components/mail-confirm/mail-confirm.component';
import {ChangePasswordFormComponent} from './components/change-password-form/change-password-form.component';
import {JoinFormComponent} from './components/join/join-form.component';
import {ConfirmRestorePasswordComponent} from './components/forgot-password/confirm-restore-password/confirm-restore-password.component';

export const authRoutes: Routes = [
  {
    path: 'auth',
    component: LayoutComponent,
    canActivate: [RouteGuardService],
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: FuseLoginComponent
      },
      {
        path: 'forgot-password',
        component: FuseForgotPasswordComponent
      },
      {
        path: 'verification-code',
        component: ConfirmRestorePasswordComponent
      },
      {
        path: 'mail-confirm',
        component: FuseMailConfirmComponent
      },
    ]
  },
  {
    path: 'reset-password-confirm',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: ChangePasswordFormComponent,
        canActivate: [RouteGuardService],
        data: {showNameField: false}
      },
    ]
  },
  {
    path: 'join',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: JoinFormComponent,
        canActivate: [RouteGuardService],
        data: {showNameField: true}
      },
    ]
  }
];
