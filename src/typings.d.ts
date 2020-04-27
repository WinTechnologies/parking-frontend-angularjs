/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/**
 * To use this module on the schedule
 */
declare var jquery: any;
interface jquery {
  tooltip(options?: any): any;
}
