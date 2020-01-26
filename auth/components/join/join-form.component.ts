import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseConfigService} from '../../../fuse/services/config.service';
import {fuseAnimations} from '../../../fuse/animations';
import {IAuthState} from '../../../../typings/interfaces/state.interfaces';
import {JoinAction, JoinUserToDistributorAction, TestAction} from '../../../../stores/root-stores/auth-store/auth.actions';
import {Store} from '@ngrx/store';
import {isUndefined} from 'util';
import {Go} from '../../../../stores/root-stores/router-store/router.action';
import {ActivatedRoute} from '@angular/router';
import * as jwtDecode from 'jwt-decode';

@Component({
  selector: 'app-join-form',
  templateUrl: './join-form.component.html',
  styleUrls: ['./join-form.component.scss'],
  animations: fuseAnimations
})
export class JoinFormComponent implements OnInit {
  joinForm: FormGroup;
  joinFormErrors: any;
  token: any;
  addUserToDistributor = false;
  email: string;

  constructor (private fuseConfig: FuseConfigService,
               private formBuilder: FormBuilder,
               private activatedRouter: ActivatedRoute,
               protected authStore: Store<IAuthState>) {
    this.fuseConfig.setSettings({
      layout: {
        navigation: 'none',
        toolbar: 'none',
        footer: 'none'
      }
    });

    this.joinFormErrors = {
      password: {},
      confirm_password: {},
      name: {},
    };
  }

  ngOnInit () {
    this.joinForm = this.formBuilder.group({
      email: [{value: '', disabled: true}],
      password: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
      name: ['', [Validators.required]],
      terms: [false, [Validators.required]]
    });
    this.activatedRouter.queryParams.subscribe((params) => {
      if (!isUndefined(params['add_to_distributor_token'])) {
        if (!this.addUserToDistributor) {
          this.authStore.dispatch(new JoinUserToDistributorAction(params['add_to_distributor_token']));
        }
        this.addUserToDistributor = true;
      } else if (isUndefined(params['token'])) {
        this.authStore.dispatch(new TestAction());
        this.authStore.dispatch(new Go({path: ['auth/login']}));
      } else {
        this.token = params['token'];
        const payload = jwtDecode(this.token);
        this.email = payload.email;
        this.joinForm.get('email').setValue(this.email);
      }
    });
    this.joinForm.valueChanges.subscribe(() => {
      this.onForgotPasswordFormValuesChanged();
    });
  }

  signUp () {
    if (!this.joinForm.valid) {
      return;
    }
    this.authStore.dispatch(new JoinAction({
      email: this.email,
      token: this.token,
      password: this.joinForm.value.password,
      name: this.joinForm.value.name,
    }));
  }

  onForgotPasswordFormValuesChanged () {
    for (const field in this.joinFormErrors) {
      if (!this.joinFormErrors.hasOwnProperty(field)) {
        continue;
      }

      // Clear previous errors
      this.joinFormErrors[field] = {};

      // Get the control
      const control = this.joinForm.get(field);

      if (control && control.dirty && !control.valid) {
        this.joinFormErrors[field] = control.errors;
      }
    }
  }
}
