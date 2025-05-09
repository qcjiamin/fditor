import type Editer from '../Editor'

export interface IPlugin {
  name: string
  init(editer: Editer): void
}

// export abstract class Plugin implements IPlugin {
//   #stage: Konva.Stage | null = null
//   #name: string = ''
//   constructor(stage: Konva.Stage) {
//     this.#stage = stage
//   }
//   get stage() {
//     return this.#stage
//   }
//   get name() {
//     return this.#name
//   }
// }

export interface PluginInstallEventArg {
  plugin: IPlugin
}
