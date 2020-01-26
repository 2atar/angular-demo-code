import {Action} from '@ngrx/store';
import {IAdminUser, IUser, IUserPermissions, IUserRackNotification} from '../../../typings/interfaces/user.interfaces';
import {ILocation} from '../../../typings/interfaces/location.interfaces';

export const USER_LOG_IN_ACTION = '[Auth] USER_LOG_IN_ACTION';
export const REDIRECT_TO_LOG_IN_ACTION = '[Auth] REDIRECT_TO_LOG_IN_ACTION';
export const CHECK_USER_DATA_IN_LOCAL_STORAGE = '[Auth] CHECK_USER_DATA_IN_LOCAL_STORAGE';
export const USER_LOGOUT_ACTION = '[Auth] USER_LOGOUT_ACTION';
export const USER_LOGOUTED_ACTION = '[Auth] USER_LOGOUTED_ACTION';
export const REDIRECT_TO_PORTAL_ACTION = '[Auth] REDIRECT_TO_PORTAL_ACTION';
export const SET_CURRENT_LOCATION = '[Auth] SET_CURRENT_LOCATION';
export const SAVE_USER_DATA_TO_STATE = '[Auth] SAVE_USER_DATA_TO_STATE';
export const GET_USER_PERMISSIONS = '[Auth] GET_USER_PERMISSIONS';
export const SAVE_USER_PERMISIONS_TO_STATE = '[Auth] SAVE_USER_PERMISSIONS_TO_STATE';
export const GET_RACK_NOTIFICATIONS_ACTIONS = '[Auth] GET_RACK_NOTIFICATIONS_ACTIONS';
export const RACK_NOTIFICATIONS_RECEIVED_ACTIONS = '[Auth] RACK_NOTIFICATIONS_RECEIVED_ACTIONS';
export const CHANGE_RACK_NOTIFICATIONS_ACTIONS = '[Auth] CHANGE_RACK_NOTIFICATIONS_ACTIONS';
export const RACK_NOTIFICATIONS_CHANGED_ACTIONS = '[Auth] RACK_NOTIFICATIONS_CHANGED_ACTIONS';
export const USER_CHANGED_BY_WEBSOCKET_ACTION = '[Auth] USER_CHANGED_BY_WEBSOCKET_ACTION';
export const RESTORE_PASSWORD_ACTION = '[Auth] RESTORE_PASSWORD_ACTION';
export const CONFIRM_RESTORE_PASSWORD_ACTION = '[Auth] CONFIRM_RESTORE_PASSWORD_ACTION';
export const PASSWORD_RESTORED_ACTION = '[Auth] PASSWORD_RESTORED_ACTION';
export const CHANGE_PASSWORD_ACTION = '[Auth] CHANGE_PASSWORD_ACTION';
export const JOIN_ACTION = '[Auth] JOIN_ACTION';
export const GET_LAST_LOCATION_ACTION = '[Auth] GET_LAST_LOCATION_ACTION';
export const LAST_LOCATION_RECEIVED_ACTION = '[Auth] LAST_LOCATION_RECEIVED_ACTION';
export const LAST_LOCATION_CHANGED_ACTION = '[Auth] LAST_LOCATION_CHANGED_ACTION';
export const GET_DISTRIBUTOR_CURRENT_STEP = '[Auth] GET_DISTRIBUTOR_CURRENT_STEP';
export const DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION = '[Auth] DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION';
export const CHANGE_DISTRIBUTOR_CURRENT_STEP = '[Auth] CHANGE_DISTRIBUTOR_CURRENT_STEP';
export const DISTRIBUTOR_CURRENT_STEP_CHANGED_ACTION = '[Auth] DISTRIBUTOR_CURRENT_STEP_CHANGED_ACTION';
export const RETURN_TO_OLD_PORTAL_ACTION = '[Auth] RETURN_TO_OLD_PORTAL_ACTION';
export const GET_CURRENT_USER_ACTION = '[Auth] GET_CURRENT_USER_ACTION';
export const CURRENT_USER_SAVED_TO_STATE_ACTION = '[Auth] CURRENT_USER_SAVED_TO_STATE_ACTION';
export const JOIN_USER_TO_DISTRIBUTOR_ACTION = '[Auth] JOIN_USER_TO_DISTRIBUTOR_ACTION';
export const USER_JOINED_TO_DISTRIBUTOR_ACTION = '[Auth] USER_JOINED_TO_DISTRIBUTOR_ACTION';
export const TEST_ACTION = '[RootState] TEST_ACTION';


export class LogInAttemptAction implements Action {
  readonly type = USER_LOG_IN_ACTION;

  constructor (public payload: { email: string, password: string }) {

  }
}

export class RedirectToLogInAction implements Action {
  readonly type = REDIRECT_TO_LOG_IN_ACTION;

  constructor (public payload?: string) {

  }
}

export class CheckUserDataInLocalStorage implements Action {
  readonly type = CHECK_USER_DATA_IN_LOCAL_STORAGE;

  constructor () {

  }
}

export class SaveUserDataToState implements Action {
  readonly type = SAVE_USER_DATA_TO_STATE;

  constructor (public payload: {
    token: string,
    email: string,
    name: string,
    userId: string
    isLoginAs: boolean
  }) {

  }
}

export class RedirectToPortalAction implements Action {
  readonly type = REDIRECT_TO_PORTAL_ACTION;

  constructor (public payload?: string) {

  }
}

export class UserLogoutAction implements Action {
  readonly type = USER_LOGOUT_ACTION;

  constructor () {

  }
}

export class UserLogoutedAction implements Action {
  readonly type = USER_LOGOUTED_ACTION;

  constructor () {

  }
}

export class SetCurrentLocation implements Action {
  readonly type = SET_CURRENT_LOCATION;

  constructor (public distributorId: string, public locationId: string, public previousLocation: string, public previousDistributor: string = null) {

  }
}

export class GetUserPermissions implements Action {
  readonly type = GET_USER_PERMISSIONS;

  constructor (public needRefresh: boolean = false) {

  }
}

export class SaveUserPermissionsToState implements Action {
  readonly type = SAVE_USER_PERMISIONS_TO_STATE;

  constructor (public payload: IUserPermissions, public needRefresh: boolean = false) {

  }
}


export class GetRackNotificationAction implements Action {
  readonly type = GET_RACK_NOTIFICATIONS_ACTIONS;

  constructor () {

  }
}

export class RackNotificationReceivedAction implements Action {
  readonly type = RACK_NOTIFICATIONS_RECEIVED_ACTIONS;

  constructor (public payload: IUserRackNotification[]) {

  }
}

export class ChangeRackNotificationAction implements Action {
  readonly type = CHANGE_RACK_NOTIFICATIONS_ACTIONS;

  constructor (public payload: IUserRackNotification) {

  }
}

export class RackNotificationChangedAction implements Action {
  readonly type = RACK_NOTIFICATIONS_CHANGED_ACTIONS;

  constructor () {

  }
}

export class UserChangedByWebsocketAction implements Action {
  readonly type = USER_CHANGED_BY_WEBSOCKET_ACTION;

  constructor (public payload: { locations: ILocation[], name: string, role: string }) {

  }
}

export class RestorePasswordAction implements Action {
  readonly type = RESTORE_PASSWORD_ACTION;

  constructor (public payload: { userEmail: string, showMailConfirmation?: boolean }) {

  }
}

export class ConfirmRestorePasswordAction implements Action {
  readonly type = CONFIRM_RESTORE_PASSWORD_ACTION;

  constructor (public payload: { email: string, confirmationCode: string, newPassword: string }) {

  }
}

export class PasswordRestoredAction implements Action {
  readonly type = PASSWORD_RESTORED_ACTION;

  constructor (public payload: { status: 'SUCCESS' | 'DANGER', email: string, password: string }) {

  }
}

export class ChangePasswordAction implements Action {
  readonly type = CHANGE_PASSWORD_ACTION;

  constructor (public payload: { old_password: string, token: string, password: string, confirm_password: string }) {

  }
}

export class JoinAction implements Action {
  readonly type = JOIN_ACTION;

  constructor (public payload: { email: string, token: string, password: string, name: string }) {

  }
}

export class GetLastLocationAction implements Action {
  readonly type = GET_LAST_LOCATION_ACTION;

  constructor () {

  }
}

export class LastLocationReceivedAction implements Action {
  readonly type = LAST_LOCATION_RECEIVED_ACTION;

  constructor (public distributorId: string, public locationId: string) {

  }
}

export class LastLocationChangedAction implements Action {
  readonly type = LAST_LOCATION_CHANGED_ACTION;

  constructor () {

  }
}

export class GetDistributorCurrentStepAction implements Action {
  readonly type = GET_DISTRIBUTOR_CURRENT_STEP;

  constructor () {

  }
}

export class DistributorCurrentStepReceivedAction implements Action {
  readonly type = DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION;

  constructor (public payload: { current_setup_wizard_step: 'STEP_1' | 'STEP_2' | 'STEP_3' | 'STEP_4' | 'STEP_5' | 'STEP_6' }) {

  }
}

export class ChangeDistributorCurrentStepAction implements Action {
  readonly type = CHANGE_DISTRIBUTOR_CURRENT_STEP;

  constructor (public payload: { current_setup_wizard_step: 'STEP_2' | 'STEP_3' | 'STEP_4' | 'STEP_5' | 'STEP_6' }) {

  }
}

export class DistributorCurrentStepChangedAction implements Action {
  readonly type = DISTRIBUTOR_CURRENT_STEP_CHANGED_ACTION;

  constructor (public payload: { current_setup_wizard_step: 'STEP_2' | 'STEP_3' | 'STEP_4' | 'STEP_5' | 'STEP_6' }) {

  }
}

export class GetCurrentUserAction implements Action {
  readonly type = GET_CURRENT_USER_ACTION;

  constructor () {

  }
}

export class CurrentUserSavedToStateAction implements Action {
  readonly type = CURRENT_USER_SAVED_TO_STATE_ACTION;

  constructor (public user: IUser, public adminUser: IAdminUser = null) {

  }
}

export class JoinUserToDistributorAction implements Action {
  readonly type = JOIN_USER_TO_DISTRIBUTOR_ACTION;

  constructor (public payload: string) {

  }
}

export class UserJoinedToDistributorAction implements Action {
  readonly type = USER_JOINED_TO_DISTRIBUTOR_ACTION;

  constructor (public payload: IUser) {

  }
}

export class TestAction implements Action {
  readonly type = TEST_ACTION;

  constructor () {

  }
}

