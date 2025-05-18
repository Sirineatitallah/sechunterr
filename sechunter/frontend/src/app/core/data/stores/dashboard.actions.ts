import { WidgetPosition } from "./../../models/widget-position.model";

export class UpdateLayout {
    static readonly type = '[Dashboard] Update Layout';
    constructor(public widgets: WidgetPosition[]) {}
  }
  
  export class LoadInstances {
    static readonly type = '[Dashboard] Load Instances';
  }