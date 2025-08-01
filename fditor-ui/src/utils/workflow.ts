// 可复用的业务流程方法

import type { useEditorStore } from '@/stores/editorStore'
import { DefaultProjectName } from '@/utils/constants'
import { requestAddProject, requestSaveProject, uploadCover } from '@/utils/request'
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

export async function createProject(editor: Editor, editorStore: ReturnType<typeof useEditorStore>) {
  let _projectID
  try {
    // 保存配置
    _projectID = await requestAddProject({
      project_name: DefaultProjectName,
      project_data: editor.toJSON()
      // preview_image_url: url
    })
  } catch (error) {
    console.log(error)
    editorStore.setProjectName(DefaultProjectName)
    return
  }
  editorStore.setProjectID(_projectID)
  editorStore.setProjectName(DefaultProjectName)
  try {
    // 先创建出工程，再提交封面
    const url = await uploadEditorThumbnail(editor, editorStore.projectID!)
    await requestSaveProject({
      id: editorStore.projectID!,
      project_data: editor.toJSON(),
      preview_image_url: url
    })
  } catch (err) {
    console.log(err)
  } finally {
    // 修改url
    const _url = new URL(window.location.href)
    _url.searchParams.set('id', _projectID.toString())
    history.replaceState({}, '', _url)
  }
}
