import { FPath } from '@fditor/core'
import { classRegistry } from 'fabric'

export class FPenPath extends FPath {
  static type = 'fpenpath'
}

classRegistry.setClass(FPenPath, 'fpenpath')
classRegistry.setSVGClass(FPenPath, 'fpenpath')
