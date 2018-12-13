export default class EventEmitter {
  private all: EventMap;

  private isStop: boolean;

  constructor() {
    this.all = {};
    this.isStop = false;
  }

  public on(type: string, handler: EventHandler) {
    if (!this.all[type]) {
      this.all[type] = [];
    }
    if (!this.all[type].includes(handler)) {
      this.all[type].push(handler);
    }
  }

  public off(type: string, handler: EventHandler) {
    if (this.all[type]) {
      this.all[type] = this.all[type].filter(_handler => _handler !== handler);
    }
  }

  public emit(type: string, ...args: any[]) {
    if (!this.isStop) {
      (this.all[type] || []).forEach((handler: EventHandler) => {
        handler(...args);
      });
    }
  }

  // 销毁指定type的所有事件
  public destroy(type: string) {
    this.all[type] = [];
  }

  public startEmit() {
    this.isStop = false;
  }

  // 保留之前绑定的事件，但emit时不触发事件
  public stopEmit() {
    this.isStop = true;
  }

  // 清除之前绑定的所有事件
  public destroyAll() {
    this.all = {};
  }
}
