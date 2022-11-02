import { isPlainObject } from './utils'

export function transformRequest(data: any): any {
  if (isPlainObject(data)) {
    return JSON.stringify(data)
  }
  return data
}

export function transformResponse(data: any): any {
  // 判断服务端返回数据为字符串的话，尝试去转换为json对象
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      // do nothing
    }
  }

  return data
}
