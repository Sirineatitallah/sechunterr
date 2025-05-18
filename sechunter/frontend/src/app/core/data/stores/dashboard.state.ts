import { State, Action, StateContext } from '@ngxs/store';
import { UpdateLayout, LoadInstances } from './dashboard.actions';
import { Injectable } from '@angular/core';
import { WidgetPosition } from './../../models/widget-position.model';

export interface DashboardStateModel {
  layoutType: string;
  instances: any[];
  widgets: WidgetPosition[];
}

@State<DashboardStateModel>({
  name: 'dashboard',
  defaults: {
    layoutType: 'grid',
    instances: [],
    widgets: []
  }
})
@Injectable()
export class DashboardState {
  @Action(UpdateLayout)
  updateLayout(ctx: StateContext<DashboardStateModel>, action: UpdateLayout) {
    ctx.patchState({ widgets: action.widgets });
  }

  @Action(LoadInstances)
  loadInstances(ctx: StateContext<DashboardStateModel>) {
    // Implementation logic here
  }
}