import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Store} from '@ngrx/store';
import {IRootState} from '../../../../../typings/interfaces/state.interfaces';
import {selectCurrentUserData} from '../../../../../stores/root-stores/auth-store/auth.selectors';
import {ConfirmRestorePasswordAction} from '../../../../../stores/root-stores/auth-store/auth.actions';

@Component({
  selector: 'app-confirm-restore-password',
  templateUrl: './confirm-restore-password.component.html',
  styleUrls: ['./confirm-restore-password.component.scss']
})
export class ConfirmRestorePasswordComponent implements OnInit {
  restorePasswordForm: FormGroup = this.formBuilder.group({
      email: [{value: '', disabled: true}],
      confirmationCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      newPassword: ['', [Validators.required, Validators.pattern(/(?=.*[A-Z]+?)(?=.*[a-z]+?)(?=.*[0-9]+?)(?=.{8,})/)]],
      confirmNewPassword: ['', [Validators.required, Validators.pattern(/(?=.*[A-Z]+?)(?=.*[a-z]+?)(?=.*[0-9]+?)(?=.{8,})/)]],
    },
    {validator: this.passwordMatchValidator});

  constructor (private formBuilder: FormBuilder,
               protected store: Store<IRootState>) {
    this.store.select(selectCurrentUserData)
      .subscribe(userData => {
        this.restorePasswordForm.get('email').setValue(userData.userEmail);
      });
  }

  passwordMatchValidator (frm: FormGroup) {
    return frm.controls['newPassword'].value === frm.controls['confirmNewPassword'].value ? null : {'mismatch': true};
  }

  finishRestorePassword () {
    const actionPayload = {
      email: this.restorePasswordForm.get('email').value,
      confirmationCode: this.restorePasswordForm.get('confirmationCode').value,
      newPassword: this.restorePasswordForm.get('newPassword').value
    };
    this.store.dispatch(new ConfirmRestorePasswordAction(actionPayload));
  }

  ngOnInit () {
  }

}
