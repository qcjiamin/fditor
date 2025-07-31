import { isFormData } from '@/utils/types'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface FetchOptions<T> {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: T
  queryParams?: ConstructorParameters<typeof URLSearchParams>[0]
  credentials?: RequestCredentials
}

/**
 * api请求方法，请求体和响应体默认为json
 * @param url
 * @param options
 * @returns
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function request<TResponse, TBody = any>(
  url: string,
  options: FetchOptions<TBody> = {}
): Promise<TResponse> {
  const { method = 'GET', headers = {}, body, queryParams, credentials } = options

  // 处理查询参数
  const fullUrl = queryParams ? `${url}?${new URLSearchParams(queryParams)}` : url

  // 添加默认 headers
  let fetchHeaders = {}
  if (isFormData(body)) {
    // formdata 自动设置content-type
    fetchHeaders = {
      ...headers
    }
  } else {
    fetchHeaders = {
      'Content-Type': 'application/json',
      ...headers
    }
  }

  // 处理请求体
  // 如果发送的请求类型是 form-data, 那么body直传
  let fetchBody = undefined
  if (isFormData(body)) {
    fetchBody = body
  } else {
    fetchBody = body ? JSON.stringify(body) : undefined
  }

  const response = await fetch(fullUrl, {
    method,
    headers: fetchHeaders,
    body: fetchBody,
    credentials
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json() as Promise<TResponse>
}

interface GetProjectRes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project_data: Record<string, any>
  project_name: string
}
export async function getProjectByID(id: number) {
  return await request<GetProjectRes>(`${VITE_API_URL}/project/get/${id}`, {
    method: 'GET',
    credentials: 'include'
  })
}

interface AddProjectRes {
  insertID: number
}
interface AddProjectOptions {
  project_name: string
  project_data: string
  // preview_image_url: string
}

export async function requestAddProject(options: AddProjectOptions) {
  const res = await request<AddProjectRes, AddProjectOptions & { status: 1 | 2 }>(`${VITE_API_URL}/project/add`, {
    method: 'POST',
    credentials: 'include',
    body: {
      ...options,
      status: 1
    }
  })
  return res.insertID
}

type SaveProjectOptions = Pick<AddProjectOptions, 'project_data'> &
  Record<'id', number> &
  Record<'preview_image_url', string>
export async function requestSaveProject(options: SaveProjectOptions) {
  return await request<void, SaveProjectOptions>(`${VITE_API_URL}/project/save`, {
    method: 'POST',
    credentials: 'include',
    body: options
  })
}

interface uploadFileRes {
  url: string
}
/**
 * 上传文件
 * @param file
 * @param filename
 * @returns
 * @
 */
export async function uploadFile(file: Blob, filename: string) {
  // 创建 FormData
  const formData = new FormData()
  formData.append('file', file, filename)
  const res = await request<uploadFileRes, FormData>(`${VITE_API_URL}/upload/file`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  return res
}

export async function uploadCover(file: Blob, filename: string, projectID: number) {
  // 创建 FormData
  const formData = new FormData()
  //! 顺序非常重要，字段放在文字之前，不然multer的filename回调时拿不到 projectID
  formData.append('projectID', projectID.toString())
  formData.append('file', file, filename)
  const res = await request<uploadFileRes, FormData>(`${VITE_API_URL}/upload/cover`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  })
  return res
}
