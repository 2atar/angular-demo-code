import {Injectable} from '@angular/core';
import {isNull, isUndefined} from 'util';
import {environment} from '../../../../environments/environment';
import {CookieService} from 'ngx-cookie';
import * as _ from 'lodash';

export interface IUserStorage {
  email: string;
  token?: string;
  user_name: string;
  user_id: string;
  is_login_as?: boolean;
}

export class UserCookieStorage {
  userData: IUserStorage = {
    email: '',
    token: '',
    user_name: '',
    user_id: '',
    is_login_as: true,
  };

  constructor (userData: IUserStorage) {
    _.assign(this.userData, userData);
  }

  isEmptyUserData (): boolean {
    return Object.keys(this.userData).every(userDataKey => {
      let result: boolean;
      if (userDataKey !== 'is_login_as') {
        result = isUndefined(this.userData[userDataKey]);
      } else {
        result = true;
      }
      return result;
    });
  }

}

@Injectable()
export class StorageService {
  private cookieOptions;

  constructor (private cookieService: CookieService) {
    this.cookieOptions = {
      domain: environment.loginAsDomain,
    };
  }

  saveUserDataToLocalStorage (userData: IUserStorage) {
    if (!isNull(userData.email) && localStorage.getItem('email') !== userData.email) {
      localStorage.setItem('email', userData.email);
    }
    if (!isNull(userData.user_name) && localStorage.getItem('user_name') !== userData.user_name) {
      localStorage.setItem('user_name', userData.user_name);
    }
    if (!isNull(userData.user_id) && localStorage.getItem('user_id') !== userData.user_id) {
      localStorage.setItem('user_id', userData.user_id);
    }
  }

  removeAfterLogout () {
    this.cookieService.remove(`emailLoginAs_${environment.loginAsKeyPrefix}`, this.cookieOptions);
    this.cookieService.remove(`tokenLoginAs_${environment.loginAsKeyPrefix}`, this.cookieOptions);
    this.cookieService.remove(`nameLoginAs_${environment.loginAsKeyPrefix}`, this.cookieOptions);
    this.cookieService.remove(`userIdLoginAs_${environment.loginAsKeyPrefix}`, this.cookieOptions);
  }

  getUserDataFromLocalStorage (): IUserStorage {
    return {
      email: localStorage.getItem('email'),
      user_name: localStorage.getItem('user_name'),
      user_id: localStorage.getItem('user_id')
    };
  }

  getUserDataFromCookie (): UserCookieStorage {
    return new UserCookieStorage({
      email: this.cookieService.get(`emailLoginAs_${environment.loginAsKeyPrefix}`),
      token: this.cookieService.get(`tokenLoginAs_${environment.loginAsKeyPrefix}`),
      user_name: this.cookieService.get(`nameLoginAs_${environment.loginAsKeyPrefix}`),
      user_id: this.cookieService.get(`userIdLoginAs_${environment.loginAsKeyPrefix}`)
    });
  }

}
