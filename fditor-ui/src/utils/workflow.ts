// 可复用的业务流程方法

import { uploadFile } from '@/utils/request'
import type { Editor } from '@fditor/core'

/**
 * 上传封面，返回封面服务器地址
 * @param editor
 * @returns
 */
export async function uploadEditorThumbnail(editor: Editor) {
  const thumBlob = await editor.getPreviewThum()
  const uploadRes = await uploadFile(thumBlob, `${Date.now()}.png`)
  return uploadRes.url
}
