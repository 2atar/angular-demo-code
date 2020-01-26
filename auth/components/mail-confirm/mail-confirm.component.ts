import {Component} from '@angular/core';
import {fuseAnimations} from '../../../fuse/animations';
import {IAuthState} from '../../../../typings/interfaces/state.interfaces';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {selectCurrentUserData} from '../../../../stores/root-stores/auth-store/auth.selectors';

@Component({
  selector: 'app-fuse-mail-confirm',
  templateUrl: './mail-confirm.component.html',
  styleUrls: ['./mail-confirm.component.scss'],
  animations: fuseAnimations
})
export class FuseMailConfirmComponent {
  userData$: Observable<IAuthState>;

  constructor (protected authStore: Store<IAuthState>) {
    this.userData$ = this.authStore.select(selectCurrentUserData);
  }
}
