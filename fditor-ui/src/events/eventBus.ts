import EventEmitter from 'events'

type eventMap = {
  // 取消字体族加载事件
  'fontFamily:load:cancel': []
}

export const eventBus = new EventEmitter<eventMap>()
