import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {RequestService} from '../../../core/services/request.service';
import {IRequestParams} from '../../../typings/interfaces/http-request.interfaces';
import {IAdminUser, IUser, IUserPermissions, IUserRackNotification} from '../../../typings/interfaces/user.interfaces';
import {environment} from '../../../../environments/environment';
import {IRootState} from '../../../typings/interfaces/state.interfaces';
import {Store} from '@ngrx/store';

@Injectable()
export class AuthService {
  private cookieOptions;

  constructor (private requestService: RequestService,
               protected store: Store<IRootState>) {
    this.cookieOptions = {
      domain: environment.loginAsDomain,
    };
  }

  resetPassword (email): Observable<any> {
    const requestParams: IRequestParams = {
      requestType: 'POST',
      endpointURL: 'reset-password',
      body: {email},
      requestSender: 'AuthService'
    };
    return this.requestService.sendRequest(requestParams);
  }

  login (email, password): Observable<any> {
    const requestParams: IRequestParams = {
      requestType: 'POST',
      endpointURL: 'login',
      body: {email, password},
      requestSender: 'AuthService'
    };
    return this.requestService.sendRequest(requestParams);
  }

  getRacksNotifications (): Observable<IUserRackNotification[]> {
    const requestParams: IRequestParams = {
      requestType: 'POST',
      endpointURL: 'users/notifications',
    };
    return this.requestService.sendRequest(requestParams);
  }

  changeRacksNotifications (rackNotification): Observable<void> {
    const requestParams: IRequestParams = {
      requestType: 'PUT',
      endpointURL: 'users/notifications',
      body: rackNotification
    };
    return this.requestService.sendRequest(requestParams);
  }

  getUserAccess (): Observable<IUserPermissions> {
    const requestParams: IRequestParams = {
      requestType: 'GET',
      endpointURL: 'access'
    };
    return this.requestService.sendRequest(requestParams);
  }

  getCurrentUser (): Observable<{ user: IUser, adminUser: IAdminUser }> {
    return this.requestService.sendRequest({
      requestType: 'GET',
      endpointURL: `users/current-user`
    });
  }

  getLastLocation (): Observable<{ distributor: string, location: string } | null> {
    const requestParams: IRequestParams = {
      requestType: 'GET',
      endpointURL: 'users/last-location'
    };
    return this.requestService.sendRequest(requestParams);
  }

  changeLastLocation (distributorId, locationId): Observable<string> {
    const requestParams: IRequestParams = {
      requestType: 'PUT',
      endpointURL: 'users/last-location',
      body: {distributorId, locationId}
    };
    return this.requestService.sendRequest(requestParams);
  }

  join (token, password, name): Observable<any> {
    const requestParams: IRequestParams = {
      requestType: 'POST',
      endpointURL: `join/${token}`,
      body: {
        password,
        name
      },
      requestSender: 'AuthService'
    };
    return this.requestService.sendRequest(requestParams);
  }

  joinUserToDistributor (token): Observable<IUser> {
    return this.requestService.sendRequest({
      requestType: 'POST',
      endpointURL: `join-to-distributor/${token}`,
      requestSender: 'AuthService'
    });
  }
}
