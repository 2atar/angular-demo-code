import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseConfigService} from '../../../fuse/services/config.service';
import {fuseAnimations} from '../../../fuse/animations';
import {IAuthState} from '../../../../typings/interfaces/state.interfaces';
import {ChangePasswordAction} from '../../../../stores/root-stores/auth-store/auth.actions';
import {Store} from '@ngrx/store';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {ConfirmationDialogComponent} from '../../../../shared/confirmation-dialog/confirmation-dialog.component';
import {CognitoService} from '../../../../stores/root-stores/auth-store/cognito.service';

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
  animations: fuseAnimations
})
export class ChangePasswordFormComponent implements OnInit {
  changePasswordForm: FormGroup;
  resetPasswordFormErrors: any;
  token: string;

  constructor (private fuseConfig: FuseConfigService,
               private formBuilder: FormBuilder,
               protected authStore: Store<IAuthState>,
               protected cognitoService: CognitoService,
               public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
               @Inject(MAT_DIALOG_DATA) public data: { rack, bank, isDraft }) {
    this.fuseConfig.setSettings({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.resetPasswordFormErrors = {
      password: {},
      confirm_password: {}
    };

    this.cognitoService.getAccessToken()
      .subscribe(token => this.token = token);
  }

  ngOnInit () {

    this.changePasswordForm = this.formBuilder.group({
        old_password: ['', [Validators.required, Validators.pattern(/(?=.*[A-Z]+?)(?=.*[a-z]+?)(?=.*[0-9]+?)(?=.{8,})/)]],
        password: ['', [Validators.required, Validators.pattern(/(?=.*[A-Z]+?)(?=.*[a-z]+?)(?=.*[0-9]+?)(?=.{8,})/)]],
        confirm_password: ['', [Validators.required]]
      },
      {validator: this.passwordMatchValidator});

    this.changePasswordForm.valueChanges.subscribe(() => {
      this.onForgotPasswordFormValuesChanged();
    });
  }

  passwordMatchValidator (frm: FormGroup) {
    return frm.controls['password'].value === frm.controls['confirm_password'].value ? null : {'mismatch': true};
  }

  changePassword (needSave: boolean) {
    if (!needSave) {
      this.dialogRef.close();
    }
    if (!this.changePasswordForm.valid) {
      return;
    }
    this.authStore.dispatch(new ChangePasswordAction({
      old_password: this.changePasswordForm.value.old_password,
      token: this.token,
      password: this.changePasswordForm.value.password,
      confirm_password: this.changePasswordForm.value.confirm_password
    }));
    this.dialogRef.close();
  }

  onForgotPasswordFormValuesChanged () {
    for (const field in this.resetPasswordFormErrors) {
      if (!this.resetPasswordFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.resetPasswordFormErrors[field] = {};

      // Get the control
      const control = this.changePasswordForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.resetPasswordFormErrors[field] = control.errors;
      }
    }
  }
}
