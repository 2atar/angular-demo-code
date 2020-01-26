import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseConfigService} from '../../../fuse/services/config.service';
import {fuseAnimations} from '../../../fuse/animations';
import {Store} from '@ngrx/store';
import {LogInAttemptAction} from '../../../../stores/root-stores/auth-store/auth.actions';
import {AuthService} from '../../../../stores/root-stores/auth-store/auth.service';
import {IAuthState} from '../../../../typings/interfaces/state.interfaces';
import {selectCurrentUserData} from '../../../../stores/root-stores/auth-store/auth.selectors';

@Component({
  selector: 'app-fuse-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: fuseAnimations
})
export class FuseLoginComponent implements OnInit {
  loginForm: FormGroup;
  loginFormErrors: any;
  userEmail = '';

  constructor (private fuseConfig: FuseConfigService,
               private formBuilder: FormBuilder,
               private authService: AuthService,
               protected store: Store<IAuthState>) {
    this.fuseConfig.setSettings({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.loginFormErrors = {
      email: {},
      password: {}
    };

    this.store.select(selectCurrentUserData).subscribe((userData) => {
      this.userEmail = userData.userEmail;
    });

  }

  ngOnInit () {
    this.loginForm = this.formBuilder.group({
      email: [this.userEmail, [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.onLoginFormValuesChanged();
    });
  }

  onLoginFormValuesChanged () {
    for (const field in this.loginFormErrors) {
      if (!this.loginFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.loginFormErrors[field] = {};

      // Get the control
      const control = this.loginForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.loginFormErrors[field] = control.errors;
      }
    }
  }

  loginUser () {
    if (!this.loginForm.valid) {
      console.error('Form is not valid');
      return;
    }

    const email = this.loginForm.get('email').value;
    const password = this.loginForm.get('password').value;

    this.store.dispatch(new LogInAttemptAction({
      email,
      password
    }));
  }

}
