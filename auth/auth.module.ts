import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../fuse/modules/shared.module';
import {RouterModule} from '@angular/router';
import {FuseLoginComponent} from './components/login/login.component';
import {FuseMailConfirmComponent} from './components/mail-confirm/mail-confirm.component';
import {FuseForgotPasswordComponent} from './components/forgot-password/forgot-password.component';
import {ChangePasswordFormComponent} from './components/change-password-form/change-password-form.component';
import {JoinFormComponent} from './components/join/join-form.component';

import {authRoutes} from './auth.routing';
import {LayoutComponent} from './components/layout/layout.component';
import {AlertCenterModule} from 'ng2-alert-center';
import {CookieModule} from 'ngx-cookie';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ConfirmRestorePasswordComponent} from './components/forgot-password/confirm-restore-password/confirm-restore-password.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FlexLayoutModule,
    AlertCenterModule,
    RouterModule.forChild(authRoutes),
    CookieModule.forRoot()
  ],
  declarations: [
    FuseMailConfirmComponent,
    FuseLoginComponent,
    FuseForgotPasswordComponent,
    ChangePasswordFormComponent,
    JoinFormComponent,
    LayoutComponent,
    ConfirmRestorePasswordComponent
  ]
})
export class AuthModule {
}
