import {createFeatureSelector, createSelector} from '@ngrx/store';
import {IAuthState} from '../../../typings/interfaces/state.interfaces';
import {isNull} from 'util';

export const selectAuthFeature = createFeatureSelector<IAuthState>('auth');

export const selectCurrentUserData = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state
);

export const selectCurrentLocation = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state.currentLocation
);

export const selectUserPerissions = createSelector(
  selectAuthFeature,
  (state: IAuthState) => {
    if (isNull(state.userPermissions)) {
      return null;
    } else {
      return state.userPermissions.permissions;
    }
  }
);

export const selectUserNotificationPerissions = createSelector(
  selectAuthFeature,
  (state: IAuthState) => {
    if (isNull(state.userPermissions)) {
      return null;
    } else {
      return state.userPermissions.notification_permissions;
    }
  }
);

export const selectUserRacksNotifications = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state.notifications.racksNotifications
);

export const selectIsLoginAs = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state.isLoginAs
);
export const selectIsAdmin = createSelector(
  selectAuthFeature,
  (state: IAuthState) => (state.currentUserData && state.currentUserData.role.name === 'ADMINISTRATOR')
);

export const selectCurrentStep = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state.currentStep
);

export const selectCurrentUser = createSelector(
  selectAuthFeature,
  (state: IAuthState) => state.currentUserData
);

export const selectUserProfiles = createSelector(
  selectAuthFeature,
  (state: IAuthState) => {
    if (!isNull(state.currentUserData)) {
      return state.currentUserData.distributors;
    }
    return null;
  }
);

