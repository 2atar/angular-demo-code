import {
  CHANGE_DISTRIBUTOR_CURRENT_STEP,
  CHANGE_PASSWORD_ACTION,
  CHANGE_RACK_NOTIFICATIONS_ACTIONS,
  CHECK_USER_DATA_IN_LOCAL_STORAGE,
  CONFIRM_RESTORE_PASSWORD_ACTION,
  CURRENT_USER_SAVED_TO_STATE_ACTION,
  DISTRIBUTOR_CURRENT_STEP_CHANGED_ACTION,
  DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION,
  GET_CURRENT_USER_ACTION,
  GET_DISTRIBUTOR_CURRENT_STEP,
  GET_LAST_LOCATION_ACTION,
  GET_RACK_NOTIFICATIONS_ACTIONS,
  GET_USER_PERMISSIONS,
  JOIN_ACTION,
  JOIN_USER_TO_DISTRIBUTOR_ACTION,
  LAST_LOCATION_CHANGED_ACTION,
  LAST_LOCATION_RECEIVED_ACTION,
  PASSWORD_RESTORED_ACTION,
  RACK_NOTIFICATIONS_CHANGED_ACTIONS,
  RACK_NOTIFICATIONS_RECEIVED_ACTIONS,
  REDIRECT_TO_LOG_IN_ACTION,
  RESTORE_PASSWORD_ACTION,
  RETURN_TO_OLD_PORTAL_ACTION,
  SAVE_USER_DATA_TO_STATE,
  SAVE_USER_PERMISIONS_TO_STATE,
  SET_CURRENT_LOCATION,
  TEST_ACTION,
  USER_CHANGED_BY_WEBSOCKET_ACTION,
  USER_JOINED_TO_DISTRIBUTOR_ACTION,
  USER_LOG_IN_ACTION,
  USER_LOGOUT_ACTION,
  USER_LOGOUTED_ACTION
} from './auth.actions';
import {IAuthState} from '../../../typings/interfaces/state.interfaces';
import {INITIAL_AUTH_STATE} from '../../../typings/constants/initial-states.constants';
import {isNull, isUndefined} from 'util';
import * as _ from 'lodash';

export function authReducer (state: IAuthState = INITIAL_AUTH_STATE, action: any): IAuthState {
  const newState = _.cloneDeep(state);

  switch (action.type) {
    case USER_LOG_IN_ACTION:
      return newState;

    case TEST_ACTION:
      return newState;

    case REDIRECT_TO_LOG_IN_ACTION:
      return newState;

    case CHECK_USER_DATA_IN_LOCAL_STORAGE:
      return newState;

    case SAVE_USER_DATA_TO_STATE:
      newState.userName = action.payload.name;
      newState.userEmail = action.payload.email;
      newState.userId = action.payload.userId;
      newState.isLoginAs = action.payload.isLoginAs;
      return newState;

    case GET_CURRENT_USER_ACTION:
      return newState;

    case CURRENT_USER_SAVED_TO_STATE_ACTION:
      newState.userEmail = action.user.email;
      newState.userId = action.user._id;
      newState.userName = action.user.name;
      newState.currentUserData = action.user;
      newState.currentAdminData = action.adminUser;
      return newState;

    case USER_LOGOUT_ACTION:
      return newState;

    case USER_LOGOUTED_ACTION:
      newState.userName = null;
      newState.currentLocation = {
        distributorId: null,
        locationId: 'all_locations'
      };
      newState.userPermissions.permissions = null;
      newState.userPermissions.notification_permissions = null;
      newState.currentUserData = null;
      newState.currentAdminData = null;
      newState.isLoginAs = false;
      return newState;

    case SET_CURRENT_LOCATION:
      newState.currentLocation = {
        distributorId: action.distributorId,
        locationId: action.locationId
      };
      return newState;

    case GET_USER_PERMISSIONS:
      return newState;

    case SAVE_USER_PERMISIONS_TO_STATE:
      newState.userPermissions.permissions = action.payload.permissions;
      if (!_.isEmpty(action.payload.notification_permissions)) {
        newState.userPermissions.notification_permissions = action.payload.notification_permissions;
      } else {
        newState.userPermissions.notification_permissions = null;
      }
      return newState;

    case GET_RACK_NOTIFICATIONS_ACTIONS:
      return newState;

    case RACK_NOTIFICATIONS_RECEIVED_ACTIONS:
      newState.notifications.racksNotifications = action.payload;
      return newState;

    case CHANGE_RACK_NOTIFICATIONS_ACTIONS:
      const rackNotificationToChange = newState.notifications.racksNotifications.find(rackNotification => {
        return rackNotification.rack === action.payload.rack;
      });
      if (!isUndefined(rackNotificationToChange)) {
        rackNotificationToChange.disabled = action.payload.disabled;
        newState.notifications.racksNotifications[newState.notifications.racksNotifications.indexOf(rackNotificationToChange)] = rackNotificationToChange;
      }
      return newState;

    case RACK_NOTIFICATIONS_CHANGED_ACTIONS:
      return newState;

    case USER_CHANGED_BY_WEBSOCKET_ACTION:
      newState.userName = action.payload.name;
      return newState;

    case RESTORE_PASSWORD_ACTION:
      return newState;

    case CONFIRM_RESTORE_PASSWORD_ACTION:
      return newState;

    case PASSWORD_RESTORED_ACTION:
      return newState;

    case CHANGE_PASSWORD_ACTION:
      return newState;

    case JOIN_ACTION:
      newState.userEmail = action.payload.email;
      return newState;

    case GET_LAST_LOCATION_ACTION:
      return newState;

    case LAST_LOCATION_RECEIVED_ACTION:
      newState.currentLocation.locationId = action.locationId;
      newState.currentLocation.distributorId = action.distributorId;
      return newState;

    case LAST_LOCATION_CHANGED_ACTION:
      return newState;

    case GET_DISTRIBUTOR_CURRENT_STEP:
      return newState;

    case DISTRIBUTOR_CURRENT_STEP_RECEIVED_ACTION:
      if (!isNull(action.payload.current_setup_wizard_step)) {
        newState.currentStep = +action.payload.current_setup_wizard_step.substr(action.payload.current_setup_wizard_step.indexOf('_') + 1, 1);
      } else {
        newState.currentStep = null;
      }
      return newState;

    case CHANGE_DISTRIBUTOR_CURRENT_STEP:
      return newState;

    case DISTRIBUTOR_CURRENT_STEP_CHANGED_ACTION:
      if (!isNull(action.payload.current_setup_wizard_step)) {
        newState.currentStep = +action.payload.current_setup_wizard_step.substr(action.payload.current_setup_wizard_step.indexOf('_') + 1, 1);
      } else {
        newState.currentStep = null;
      }
      return newState;

    case RETURN_TO_OLD_PORTAL_ACTION:
      return newState;

    case JOIN_USER_TO_DISTRIBUTOR_ACTION:
      return newState;

    case USER_JOINED_TO_DISTRIBUTOR_ACTION:
      newState.currentUserData = action.payload;
      return newState;

    default:
      return newState;

  }
}
