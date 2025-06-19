import { IPlugin } from '@fditor/core'
import Editor from '../Editor'

export default abstract class BasePlugin implements IPlugin {
  abstract name: string
  constructor() {}
  abstract init(editor: Editor): void
  destroy?(): void {}
}
