import {NgModule} from '@angular/core';
import {authReducer} from './auth.reducer';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {AuthEffectsService} from './auth.effects';
import {INITIAL_AUTH_STATE} from '../../../typings/constants/initial-states.constants';
import {AuthService} from './auth.service';
import {CognitoService} from './cognito.service';
import {StorageService} from './storage.service';

@NgModule({
  imports: [
    StoreModule.forFeature('auth', authReducer, {initialState: INITIAL_AUTH_STATE}),
    EffectsModule.forFeature([
      AuthEffectsService
    ]),
  ],
  declarations: [],
  providers: [
    AuthService,
    AuthEffectsService,
    CognitoService,
    StorageService
  ]
})
export class AuthStoreModule {
}
