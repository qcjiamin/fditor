import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { Editor } from '@kditor/core'
import type { ElementTypes, Selected } from '@/utils/types'

export const EditorKey: InjectionKey<Editor> = Symbol('AppKey')
export const selectedKey: InjectionKey<Ref<Selected>> = Symbol('SelectedKey')
export const SelectTypeKey: InjectionKey<ComputedRef<ElementTypes>> = Symbol('SelectTypeKey')
