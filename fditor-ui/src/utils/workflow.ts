// 可复用的业务流程方法

import { uploadCover } from '@/utils/request'
import type { Editor } from '@fditor/core'

/**
 * 上传封面，返回封面服务器地址
 * @param editor
 * @returns
 */
export async function uploadEditorThumbnail(editor: Editor, projectID: number) {
  const thumBlob = await editor.getPreviewThum()
  const uploadRes = await uploadCover(thumBlob, `${Date.now()}.png`, projectID)
  return uploadRes.url
}
