import EventEmitter from 'events'

type eventMap = {
  // 取消字体族加载事件
  'fontFamily:load:cancel': []
  'config:save': [timeout: number]
}

export const eventBus = new EventEmitter<eventMap>()
