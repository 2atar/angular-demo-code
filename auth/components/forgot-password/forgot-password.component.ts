import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseConfigService} from '../../../fuse/services/config.service';
import {fuseAnimations} from '../../../fuse/animations';
import {IAuthState} from '../../../../typings/interfaces/state.interfaces';
import {RestorePasswordAction} from '../../../../stores/root-stores/auth-store/auth.actions';
import {Store} from '@ngrx/store';

@Component({
  selector: 'app-fuse-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  animations: fuseAnimations
})
export class FuseForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  forgotPasswordFormErrors: any;

  constructor (private fuseConfig: FuseConfigService,
               private formBuilder: FormBuilder,
               protected authStore: Store<IAuthState>) {
    this.fuseConfig.setSettings({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.forgotPasswordFormErrors = {
      email: {}
    };
  }

  ngOnInit () {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.forgotPasswordForm.valueChanges.subscribe(() => {
      this.onForgotPasswordFormValuesChanged();
    });
  }

  restorePassword () {
    if (!this.forgotPasswordForm.valid) {
      return;
    }
    this.authStore.dispatch(new RestorePasswordAction({
      userEmail: this.forgotPasswordForm.value.email,
      showMailConfirmation: true
    }));
  }

  onForgotPasswordFormValuesChanged () {
    for (const field in this.forgotPasswordFormErrors) {
      if (!this.forgotPasswordFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.forgotPasswordFormErrors[field] = {};

      // Get the control
      const control = this.forgotPasswordForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.forgotPasswordFormErrors[field] = control.errors;
      }
    }
  }
}
