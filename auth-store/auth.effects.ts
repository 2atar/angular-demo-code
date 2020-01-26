import {Injectable} from '@angular/core';
import {Actions, Effect, ofType} from '@ngrx/effects';
import {Observable} from 'rxjs';

import {debounceTime, map, switchMap, take, withLatestFrom} from 'rxjs/operators';

import {
  CHANGE_DISTRIBUTOR_CURRENT_STEP,
  CHANGE_PASSWORD_ACTION,
  CHANGE_RACK_NOTIFICATIONS_ACTIONS,
  ChangeDistributorCurrentStepAction,
  ChangePasswordAction,
  ChangeRackNotificationAction,
  CHECK_USER_DATA_IN_LOCAL_STORAGE,
  CheckUserDataInLocalStorage,
  CONFIRM_RESTORE_PASSWORD_ACTION,
  ConfirmRestorePasswordAction,
  CURRENT_USER_SAVED_TO_STATE_ACTION,
  CurrentUserSavedToStateAction,
  DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION,
  DistributorCurrentStepChangedAction,
  DistributorCurrentStepReceivedAction,
  GET_CURRENT_USER_ACTION,
  GET_DISTRIBUTOR_CURRENT_STEP,
  GET_LAST_LOCATION_ACTION,
  GET_RACK_NOTIFICATIONS_ACTIONS,
  GET_USER_PERMISSIONS,
  GetCurrentUserAction,
  GetDistributorCurrentStepAction,
  GetLastLocationAction,
  GetRackNotificationAction,
  GetUserPermissions,
  JOIN_ACTION,
  JOIN_USER_TO_DISTRIBUTOR_ACTION,
  JoinAction,
  JoinUserToDistributorAction,
  LastLocationChangedAction,
  LastLocationReceivedAction,
  LogInAttemptAction,
  PASSWORD_RESTORED_ACTION,
  PasswordRestoredAction,
  RackNotificationChangedAction,
  RackNotificationReceivedAction,
  REDIRECT_TO_LOG_IN_ACTION,
  REDIRECT_TO_PORTAL_ACTION,
  RedirectToLogInAction,
  RedirectToPortalAction,
  RESTORE_PASSWORD_ACTION,
  RestorePasswordAction,
  SAVE_USER_DATA_TO_STATE,
  SAVE_USER_PERMISIONS_TO_STATE,
  SaveUserDataToState,
  SaveUserPermissionsToState,
  SET_CURRENT_LOCATION,
  SetCurrentLocation,
  USER_CHANGED_BY_WEBSOCKET_ACTION,
  USER_LOG_IN_ACTION,
  USER_LOGOUT_ACTION,
  USER_LOGOUTED_ACTION,
  UserChangedByWebsocketAction,
  UserJoinedToDistributorAction,
  UserLogoutAction,
  UserLogoutedAction,
} from './auth.actions';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AuthService} from './auth.service';
import {isNull, isUndefined} from 'util';
import {IRootState} from '../../../typings/interfaces/state.interfaces';
import {GetLocationsAction, LocationsChangedByWebsocketAction} from '../locations-store/locations.actions';
import {LocationsService} from '../locations-store/locations.service';
import {IOService} from '../../../core/services/io.service';
import {AlertService} from '../../../core/services/alert.service';
import {of} from 'rxjs/observable/of';
import {GetDraftRacksAction} from '../draft-racks-store/draft-racks.actions';
import {GetDeviceTypesAction, GetMicrobulkConnectioTypesAction} from '../../features-stores/racks-store/racks.actions';
import {selectIsLoginAs} from './auth.selectors';
import {RouteGuardHelperService} from '../../../core/navigation/route-guard-helper.service';
import {Go} from '../router-store/router.action';
import {GetUserSettingsAction} from '../user-settings-store/user-settings.actions';
import {CognitoService} from './cognito.service';
import {StorageService} from './storage.service';
import {GetFiltersPresetsAction} from '../filter-preset-store/filter-preset.actions';
import {SentryService} from '../../../core/services/sentry.service';

declare let createInlineManualPlayer: any;
declare let inline_manual_player: any;
declare global {
  interface Window {
    inlineManualTracking: {
      uid: string,
      email: string,
      name: string,
      roles: string[],
    };
    inlineManualPlayerData: any;
  }
}

@Injectable()
export class AuthEffectsService {

  @Effect({dispatch: false})
  authAttempt$: Observable<any> = this.actions$
    .pipe(
      ofType<LogInAttemptAction>(USER_LOG_IN_ACTION),
      switchMap(action => {
        return this.cognitoService.loginWithCognito(action.payload.email, action.payload.password)
          .pipe(
            switchMap(response => {
              if (response.status === 'UserNotFoundException') {
                return this.authService.login(action.payload.email, action.payload.password)
                  .switchMap(() => this.cognitoService.loginWithCognito(action.payload.email, action.payload.password));
              } else {
                return of(response);
              }
            }),
            map(response => {
              if (!isNull(response)) {
                if (response.status === 'SUCCESS') {
                  this.store.dispatch(new CheckUserDataInLocalStorage());
                  this.store.dispatch(new RedirectToPortalAction());
                } else {
                  this.alertService.addAlert('DANGER', !isUndefined(response.message) ? response.message : 'Internal Server Info');
                }
              }
            })
          );
      }),
    );


  @Effect()
  checkUserData$: Observable<any> = this.actions$
    .pipe(
      ofType<CheckUserDataInLocalStorage>(CHECK_USER_DATA_IN_LOCAL_STORAGE),
      switchMap(() => {
        return this.cognitoService.getUserData()
          .pipe(
            map(userData => {
              return new SaveUserDataToState({
                token: userData.token,
                name: !isUndefined(userData.user_name) ? userData.user_name : null,
                email: !isUndefined(userData.email) ? userData.email : null,
                userId: !isUndefined(userData.user_id) ? userData.user_id : null,
                isLoginAs: !isUndefined(userData.is_login_as) ? userData.is_login_as : null
              });
            })
          );
      })
    );

  @Effect({dispatch: false})
  saveUserDataToState$: Observable<any> = this.actions$
    .pipe(
      ofType<SaveUserDataToState>(SAVE_USER_DATA_TO_STATE),
      switchMap(action => {
        if (!isNull(action.payload.token)) {
          this.ioService.initSocket(action.payload.token);
          this.ioService.initRacksEvents();
          this.ioService.initUserEvents(action.payload.userId);
          this.store.dispatch(new GetCurrentUserAction());
          this.store.dispatch(new GetUserSettingsAction());
        }
        return of(null);
      }),
    );

  @Effect()
  saveCurrentUserToState$ = this.actions$
    .pipe(
      ofType<GetCurrentUserAction>(GET_CURRENT_USER_ACTION),
      switchMap(() => this.authService.getCurrentUser()),
      withLatestFrom(this.store.select(selectIsLoginAs)),
      map(([response, isLoginAs]) => {
        if (!isNull(isLoginAs)) {
          this.sentryService.setUser({
            id: response.user._id,
            email: response.user.email,
            username: response.user.name
          });
        } else {
          this.sentryService.setUser({
            id: response.adminUser._id,
            email: response.adminUser.email,
            username: response.adminUser.name
          });
          this.sentryService.setExtraContent({
            is_login_as: true,
            login_as_user_id: response.user._id,
            login_as_user_email: response.user.email,
            login_as_user_username: response.user.name
          });
        }

        this.storageService.saveUserDataToLocalStorage({
          email: response.user.email,
          user_id: response.user._id,
          user_name: response.user.name,
        });
        if (!isNull(response.adminUser)) {
          response.adminUser.expires = this.cognitoService.getAdminExpiresTime();
        }
        if (!isLoginAs) {
          this.store.dispatch(new GetLastLocationAction());
        } else {
          this.store.dispatch(new SetCurrentLocation(response.user.distributors[0].distributor._id, 'all_locations', null));
        }
        return new CurrentUserSavedToStateAction(response.user, response.adminUser);
      })
    );

  @Effect({dispatch: false})
  currentUserSavedToState$ = this.actions$
    .pipe(
      ofType<CurrentUserSavedToStateAction>(CURRENT_USER_SAVED_TO_STATE_ACTION),
      map((payload) => {
        if (typeof createInlineManualPlayer !== 'undefined' && !window.hasOwnProperty('inlineManualTracking')) {
          window.inlineManualTracking = {
            uid: `${payload.user._id}`,
            email: `${payload.user.email}`,
            name: `${payload.user.name}`,
            roles: [`${payload.user.role.name}`],
          };
          createInlineManualPlayer(window.inlineManualPlayerData);
          inline_manual_player.update();
          this.store.dispatch(new GetFiltersPresetsAction());
        }
      })
    );

  @Effect({dispatch: false})
  getLastLocation$: Observable<any> = this.actions$ // TODO<<< if only 1 location
    .pipe(
      ofType<GetLastLocationAction>(GET_LAST_LOCATION_ACTION),
      switchMap(() => this.authService.getLastLocation()),
      map((result) => {
        let last_location = 'all_locations';
        if (!isNull(result.location)) {
          last_location = result.location;
        }
        this.store.dispatch(new LastLocationReceivedAction(result.distributor, result.location));
        this.store.dispatch(new SetCurrentLocation(result.distributor, last_location, null, null));
      })
    );


  @Effect()
  redirectToLogin$ = this.actions$
    .pipe(
      ofType<RedirectToLogInAction>(REDIRECT_TO_LOG_IN_ACTION),
      map(() => new Go({path: ['/auth/login']}))
    );


  @Effect()
  redirectToPortal$ = this.actions$
    .pipe(
      ofType<RedirectToPortalAction>(REDIRECT_TO_PORTAL_ACTION),
      map((action) => {
        const redirectURL = isUndefined(action.payload) ? '/dashboard' : action.payload;
        return new Go({path: [redirectURL]});
      })
    );

  @Effect({dispatch: false})
  getUserPermissions$ = this.actions$
    .pipe(
      ofType<GetUserPermissions>(GET_USER_PERMISSIONS),
      switchMap((action) => {
        return this.authService.getUserAccess()
          .pipe(
            map((userPermissions) => {
              this.store.dispatch(new GetMicrobulkConnectioTypesAction());
              if (userPermissions.permissions.VIEW_RACKS || userPermissions.permissions.ADD_RACKS || userPermissions.permissions.EDIT_RACKS) {
                this.store.dispatch(new GetDraftRacksAction());
              }
              if (userPermissions.permissions.VIEW_RACKS || userPermissions.permissions.CUSTOMER_VIEW) {
                this.store.dispatch(new GetDeviceTypesAction());
              }
              this.store.dispatch(new SaveUserPermissionsToState(userPermissions, action.needRefresh));
            })
          );
      })
    );

  @Effect({dispatch: false})
  saveUserPermissions$ = this.actions$
    .pipe(
      ofType<SaveUserPermissionsToState>(SAVE_USER_PERMISIONS_TO_STATE),
      debounceTime(500),
      switchMap(action => {
        if (action.needRefresh) {
          return this.routeGuardHelper.checkActionPermissions()
            .pipe(
              map((isPermitted) => {
                if (isPermitted) {
                  this.routeGuardHelper.refreshData(true);
                } else {
                  this.store.dispatch(new Go({path: ['dashboard']}));
                }
              })
            );
        }
        return of(null);
      })
    );

  @Effect()
  logout$ = this.actions$
    .pipe(
      ofType<UserLogoutAction>(USER_LOGOUT_ACTION),
      switchMap(() => this.cognitoService.logout()),
      map(() => {
        if (typeof inline_manual_player !== 'undefined') {
          inline_manual_player.destroy();
        }
        this.sentryService.clearData();
        return new UserLogoutedAction();
      })
    );

  @Effect()
  userLogouted$ = this.actions$
    .pipe(
      ofType<UserLogoutedAction>(USER_LOGOUTED_ACTION),
      map(() => new Go({path: ['/auth/login']}))
    );

  @Effect()
  getRacksNotifications$ = this.actions$
    .pipe(
      ofType<GetRackNotificationAction>(GET_RACK_NOTIFICATIONS_ACTIONS),
      switchMap((action) => {
        return this.authService.getRacksNotifications()
          .pipe(
            map(racksNotifications => new RackNotificationReceivedAction(racksNotifications))
          );
      })
    );

  @Effect()
  changeRackNotifications$ = this.actions$
    .pipe(
      ofType<ChangeRackNotificationAction>(CHANGE_RACK_NOTIFICATIONS_ACTIONS),
      switchMap((action) => {
        return this.authService.changeRacksNotifications(action.payload)
          .pipe(
            map(() => new RackNotificationChangedAction())
          );
      })
    );

  @Effect({dispatch: false})
  restorePassword$: Observable<any> = this.actions$
    .pipe(
      ofType<RestorePasswordAction>(RESTORE_PASSWORD_ACTION),
      switchMap(action => {
        return this.cognitoService.restorePassword(action.payload.userEmail)
          .pipe(
            map(result => {
              if (result === 'VERIFICATION_CODE_SENDED') {
                this.alertService.addAlert('SUCCESS', 'Please check your email for the confirmation code!');
                this.store.dispatch(new Go({path: ['/auth/verification-code']}));
                this.store.dispatch(new SaveUserDataToState({
                  token: null,
                  name: null,
                  userId: null,
                  email: action.payload.userEmail,
                  isLoginAs: null
                }));
              }
            })
          );
      }),
    );

  @Effect()
  confirmRestorePassword$: Observable<any> = this.actions$
    .pipe(
      ofType<ConfirmRestorePasswordAction>(CONFIRM_RESTORE_PASSWORD_ACTION),
      switchMap(action => this.cognitoService.confirmRestoringPassword(action.payload.email, action.payload.confirmationCode, action.payload.newPassword)
        .pipe(
          map(result => new PasswordRestoredAction({
              status: result,
              email: action.payload.email,
              password: action.payload.newPassword
            })
          )
        )
      )
    );

  @Effect()
  passwordRestored$: Observable<any> = this.actions$
    .pipe(
      ofType<PasswordRestoredAction>(PASSWORD_RESTORED_ACTION),
      map((action) => {
        switch (action.payload.status) {
          case 'SUCCESS':
            this.alertService.addAlert('SUCCESS', 'Password successfully changed!');
            break;
          case 'DANGER':
            this.alertService.addAlert('DANGER', 'Internal Server Error');
            break;
        }
        return new Go({path: ['/auth/login']});
      })
    );

  @Effect({dispatch: false})
  changePassword$: Observable<any> = this.actions$
    .pipe(
      ofType<ChangePasswordAction>(CHANGE_PASSWORD_ACTION),
      switchMap(action => {
        return this.cognitoService.changePassword(action.payload.token, {
          old_password: action.payload.old_password,
          password: action.payload.password,
        });
      }),
      map((data) => {
        if (data === 'SUCCESS') {
          this.alertService.addAlert('SUCCESS', 'Password successfully changed!');
        } else {
          this.alertService.addAlert('DANGER', !isUndefined(data) && !isUndefined(data.message) ? data.message : 'Internal Server Info');
        }
      })
    );

  @Effect({dispatch: false})
  join$: Observable<any> = this.actions$
    .pipe(
      ofType<JoinAction>(JOIN_ACTION),
      switchMap(action =>
        this.authService.join(action.payload.token, action.payload.password, action.payload.name)
          .pipe(
            map(() => {
              if (!isUndefined(action.payload.email)) {
                this.store.dispatch(new LogInAttemptAction({email: action.payload.email, password: action.payload.password}));
              } else {
                this.store.dispatch(new Go({path: ['/login']}));
              }
            })
          )
      )
    );

  @Effect()
  userChangedByWebsocket: Observable<any> = this.actions$
    .pipe(
      ofType<UserChangedByWebsocketAction>(USER_CHANGED_BY_WEBSOCKET_ACTION),
      map((action) => {
        this.store.dispatch(new LocationsChangedByWebsocketAction(action.payload.locations));
        this.storageService.saveUserDataToLocalStorage({
          user_name: action.payload.name,
          email: null,
          token: null,
          user_id: null,
        });
        return new GetUserPermissions();
      })
    );

  @Effect({dispatch: false})
  setCurrentLocation: Observable<any> = this.actions$
    .pipe(
      ofType<SetCurrentLocation>(SET_CURRENT_LOCATION),
      withLatestFrom(this.store.select(selectIsLoginAs)),
      switchMap(([action, isLoginAs]) => {
        this.sentryService.setExtraContent({
          current_distributor_id: action.distributorId,
          current_location_id: action.locationId,
        });
        if (action.distributorId !== action.previousDistributor) {
          this.store.dispatch(new GetUserPermissions(!isNull(action.previousDistributor)));
        } else {
          this.routeGuardHelper.refreshData(action.locationId !== action.previousLocation);
        }
        this.store.dispatch(new GetDistributorCurrentStepAction());
        this.store.dispatch(new GetLocationsAction());
        if (!isLoginAs) {
          if (action.distributorId !== action.previousDistributor || action.locationId !== action.previousLocation) {
            let savedLocation: string = action.locationId;
            if (action.locationId === 'all_locations') {
              savedLocation = null;
            }
            return this.authService.changeLastLocation(action.distributorId, savedLocation)
              .pipe(
                map(() => this.store.dispatch(new LastLocationChangedAction()))
              );
          }
        } else {
          this.store.dispatch(new GetDeviceTypesAction());
        }
        return of(null);
      })
    );

  @Effect()
  getCurrentStep: Observable<any> = this.actions$
    .pipe(
      ofType<GetDistributorCurrentStepAction>(GET_DISTRIBUTOR_CURRENT_STEP),
      switchMap(() => {
        return this.authService.getCurrentStep();
      }),
      map((step) => {
        return new DistributorCurrentStepReceivedAction(step);
      })
    );

  @Effect({dispatch: false})
  currentStepReceived: Observable<any> = this.actions$
    .pipe(
      ofType<DistributorCurrentStepReceivedAction>(DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION),
      map((action) => {
        if (!isNull(action.payload.current_setup_wizard_step)) {
          this.store.dispatch(new Go({path: ['/setup-wizard']}));
        }
      })
    );

  @Effect()
  changeCurrentStep: Observable<any> = this.actions$
    .pipe(
      ofType<ChangeDistributorCurrentStepAction>(CHANGE_DISTRIBUTOR_CURRENT_STEP),
      switchMap((action) => {
        return this.authService.changeCurrentStep(action.payload)
          .pipe(
            map((step) => new DistributorCurrentStepChangedAction(step))
          );
      })
    );

  @Effect({dispatch: false})
  joinUserToDistributor$: Observable<any> = this.actions$
    .pipe(
      ofType<JoinUserToDistributorAction>(JOIN_USER_TO_DISTRIBUTOR_ACTION),
      take(1),
      switchMap((action) => this.authService.joinUserToDistributor(action.payload)),
      withLatestFrom(this.cognitoService.getAccessToken()),
      map(([user, userToken]) => {
        this.store.dispatch(new UserJoinedToDistributorAction(user));
        if (!isNull(userToken)) {
          this.store.dispatch(new Go({path: ['dashboard']}));
        } else {
          this.store.dispatch(new Go({path: ['auth/login']}));
        }
      })
    );

  constructor (protected actions$: Actions,
               protected store: Store<IRootState>,
               protected authService: AuthService,
               protected cognitoService: CognitoService,
               protected locationsService: LocationsService,
               protected router: Router,
               protected ioService: IOService,
               protected alertService: AlertService,
               protected routeGuardHelper: RouteGuardHelperService,
               protected storageService: StorageService,
               protected sentryService: SentryService) {
  }
}
