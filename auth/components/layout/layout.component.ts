import {Component, OnInit} from '@angular/core';
import {IHttpState} from '../../../../typings/interfaces/state.interfaces';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import {selectHttpRequestIsActive} from '../../../../stores/root-stores/http-store/http.selectors';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isHttpActive: Observable<boolean>;

  constructor (private store: Store<IHttpState>) {
    this.isHttpActive = this.store.select(selectHttpRequestIsActive);
  }

  ngOnInit () {
  }

}
