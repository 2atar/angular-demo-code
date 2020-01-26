import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserSession} from 'amazon-cognito-identity-js';
import {Store} from '@ngrx/store';
import {IRootState} from '../../../typings/interfaces/state.interfaces';
import {HttpErrorAction, HttpRequestEndedAction, HttpRequestStartedAction} from '../http-store/http.actions';
import {isNull, isNullOrUndefined, isUndefined} from 'util';
import {of} from 'rxjs/observable/of';
import {IUserStorage, StorageService} from './storage.service';
import {selectCurrentUserData} from './auth.selectors';
import {environment} from '../../../../environments/environment';
import {SentryService} from '../../../core/services/sentry.service';
import * as jwtDecode from 'jwt-decode';
import {Observable} from 'rxjs/Observable';
import {switchMap, take, map, share} from 'rxjs/operators';

@Injectable()
export class CognitoService {
  authStatus: BehaviorSubject<{ status: string }> = new BehaviorSubject({status: 'USER_NOT_CHECKED'});
  cognitoUser: CognitoUser = null;
  userSession: CognitoUserSession = null;
  protected loginAsToken: string = null;
  private readonly userPool: CognitoUserPool;

  constructor (protected store: Store<IRootState>,
               protected storageService: StorageService,
               protected sentryService: SentryService) {
    if (!isNull(environment.cognitoUserPool) || !isNull(environment.cognitoClientId)) {
      this.userPool = new CognitoUserPool({
        UserPoolId: environment.cognitoUserPool,
        ClientId: environment.cognitoClientId
      });
    } else {
      throw new Error('UserPoolId and ClientId is required! Please, add them to environment file');
    }
  }

  loginWithCognito (email: string, password: string): Observable<{
    status: string,
    token?: string,
    message?: string,
  }> {
    const authenticationData = {
      Username: email,
      Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const userData = {
      Username: email,
      Pool: this.userPool
    };
    this.cognitoUser = new CognitoUser(userData);
    this.store.dispatch(new HttpRequestStartedAction());
    return Observable.create(observer =>
      this.cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (data) => {
          this.store.dispatch(new HttpRequestEndedAction());
          observer.next({status: 'SUCCESS', token: data.getAccessToken().getJwtToken()});
        },
        onFailure: (err) => {
          this.sentryService.captureException(new Error(err.message));
          this.store.dispatch(new HttpErrorAction(err));
          observer.next({status: err.code, message: err.message});
        },
        newPasswordRequired: (userAttributes) => {
          delete userAttributes.email_verified;
          this.cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
            onSuccess: () => {
              this.cognitoUser.authenticateUser(authenticationDetails, {
                  onSuccess: (data) => {
                    this.store.dispatch(new HttpRequestEndedAction());
                    observer.next({status: 'SUCCESS', token: data.getAccessToken().getJwtToken()});
                  },
                  onFailure: (err) => {
                    this.sentryService.captureException(new Error(err.message));
                    this.store.dispatch(new HttpErrorAction(err));
                    observer.next({status: err.code, message: err.message});
                  }
                }
              );
            },
            onFailure: (err) => {
              this.sentryService.captureException(new Error(err.message));
              this.store.dispatch(new HttpErrorAction(err));
              observer.next({status: err.code, message: err.message});
            }
          });
        }
      })
    ).pipe(share());
  }

  logout (): Observable<any> {
    this.cognitoUser = this.userPool.getCurrentUser();
    let result: Observable<any>;
    if (!isNull(this.cognitoUser)) {
      result = this.globalSignOut();
    } else {
      result = of({});
    }
    return result
      .map(() => {
        this.cognitoUser = null;
        this.userSession = null;
        this.loginAsToken = null;
        this.storageService.removeAfterLogout();
      });
  }

  getUserData (): Observable<IUserStorage> {
    let userData: IUserStorage;
    const userDataLoginAs = this.storageService.getUserDataFromCookie();
    if (userDataLoginAs.isEmptyUserData()) {
      userData = this.storageService.getUserDataFromLocalStorage();
      userData.is_login_as = false;
    } else {
      userData = userDataLoginAs.userData;
    }
    if (!userData.is_login_as) {
      userData.token = null;
      this.cognitoUser = this.userPool.getCurrentUser();
      this.store.dispatch(new HttpRequestStartedAction());
      return Observable.create(observer => {
        if (!isNull(this.cognitoUser)) {
          this.cognitoUser.getSession((err, session) => {
            if (err) {
              this.cognitoUser.signOut();
              this.sentryService.captureException(new Error(err.message));
              this.store.dispatch(new HttpErrorAction(err));
              observer.next();
            } else {
              const refreshToken = session.getRefreshToken();
              this.cognitoUser.refreshSession(refreshToken, (err, refreshedSession) => {
                if (err) {
                  this.authStatus.next({status: 'USER_CHECKING_ERROR'});
                  this.sentryService.captureException(new Error(err.message));
                  this.store.dispatch(new HttpErrorAction(err));
                  observer.next();
                } else {
                  userData.email = refreshedSession.getIdToken().payload.email;
                  userData.token = refreshedSession.getAccessToken().getJwtToken();
                  this.authStatus.next({status: 'USER_CHECKED'});
                  this.store.dispatch(new HttpRequestEndedAction());
                  observer.next();
                }
              });
            }
          });
        } else {
          this.authStatus.next({status: 'USER_NOT_AUTHORIZED'});
          this.store.dispatch(new HttpRequestEndedAction());
          observer.next();
        }
      }).pipe(
        map(() => userData),
        share()
      );
    } else {
      this.loginAsToken = userData.token;
      if (!isNull(this.loginAsToken)) {
        this.authStatus.next({status: 'USER_CHECKED'});
      } else {
        this.authStatus.next({status: 'USER_NOT_AUTHORIZED'});
      }
      return of(userData);
    }
  }

  getAccessToken (): Observable<string> {
    let isLoginAs = false;
    return this.store.select(selectCurrentUserData)
      .pipe(
        take(1),
        switchMap(userData => {
          isLoginAs = userData.isLoginAs;
          return Observable.create(observer => {
            if (!isNullOrUndefined(this.cognitoUser) && !isLoginAs) {
              if (!isNull(this.userSession) && this.userSession.isValid()) {
                observer.next(this.userSession.getAccessToken().getJwtToken());
              } else {
                this.cognitoUser.getSession((err, session) => {
                  if (err) {
                    this.sentryService.captureException(new Error(err.message));
                    observer.next(null);
                  } else {
                    this.userSession = session;
                    observer.next(session.getAccessToken().getJwtToken());
                  }
                });
              }
            } else {
              observer.next(null);
            }
          });
        }),
        share(),
        switchMap(token => {
          if (isLoginAs) {
            return of(this.loginAsToken);
          } else if (!isNull(token)) {
            return of(token);
          } else {
            return of(null);
          }
        })
      );
  }

  restorePassword (email): Observable<any> {
    return Observable.create(observer => {
      const userData = {
        Username: email,
        Pool: this.userPool
      };
      this.cognitoUser = new CognitoUser(userData);
      this.store.dispatch(new HttpRequestStartedAction());
      this.cognitoUser.forgotPassword({
        onSuccess: () => {
          observer.next('SUCCESS');
          this.store.dispatch(new HttpRequestEndedAction());
        },
        onFailure: (err) => {
          observer.next('FAILURE');
          this.sentryService.captureException(new Error(err.message));
          this.store.dispatch(new HttpErrorAction(err));
        },
        inputVerificationCode: () => {
          observer.next('VERIFICATION_CODE_SENDED');
          this.store.dispatch(new HttpRequestEndedAction());
        }
      });
    }).pipe(share());
  }

  confirmRestoringPassword (email, confirmationCode, newPassword): Observable<'SUCCESS' | 'DANGER'> {
    if (isNull(this.cognitoUser) || this.cognitoUser.getUsername() !== email) {
      const userData = {
        Username: email,
        Pool: this.userPool
      };
      this.cognitoUser = new CognitoUser(userData);
    }
    this.store.dispatch(new HttpRequestStartedAction());
    return Observable.create(observer => {
      this.cognitoUser.confirmPassword(confirmationCode, newPassword, {
        onSuccess: () => {
          this.store.dispatch(new HttpRequestEndedAction());
          observer.next('SUCCESS');
        },
        onFailure: (err) => {
          this.sentryService.captureException(new Error(err.message));
          this.store.dispatch(new HttpErrorAction(err));
          observer.next('DANGER');
        }
      });
    }).pipe(share());
  }

  changePassword (token, data): Observable<any> {
    this.store.dispatch(new HttpRequestStartedAction());
    return Observable.create(observer => {
        this.cognitoUser.changePassword(data.old_password, data.password, (err, result) => {
          if (err) {
            this.sentryService.captureException(new Error(err.message));
            this.store.dispatch(new HttpErrorAction(err));
            observer.next(err);
          }
          this.store.dispatch(new HttpRequestEndedAction());
          observer.next(result);
        });
      }
    ).pipe(share());
  }

  getAdminExpiresTime (): Date {
    let result = null;
    const token = this.storageService.getUserDataFromCookie().userData.token;
    if (!isUndefined(token)) {
      const parsedTokenData = jwtDecode(token);
      if (!isNullOrUndefined(parsedTokenData) && parsedTokenData.hasOwnProperty('exp')) {
        result = new Date(parsedTokenData.exp * 1000);
      }
    }
    return result;
  }

  private globalSignOut () {
    if (!isNullOrUndefined(this.cognitoUser)) {
      return Observable.create(observer =>
        this.cognitoUser.globalSignOut({
          onSuccess: () => {
            observer.next();
          },
          onFailure: () => {
            this.cognitoUser.signOut();
            observer.next();
          }
        })
      ).pipe(share());
    }
  }

}
