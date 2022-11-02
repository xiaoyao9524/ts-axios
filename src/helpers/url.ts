import { isDate, isObject } from './utils'

/**
 * 处理params规则(以url为：'/base/get'为例)：
 * 1、params为对象
 * params: {
    a: 1,
    b: 2
  }
  结果：'/base/get?a=1&b=2'

  2、params参数值为数组：
  params: {
    foo: ['bar', 'baz']
  }
  结果：'/base/get?foo[]=bar&foo[]=baz'

  3、params参数值为对象：
  params: {
    foo: {
      bar: 'baz'
    }
  }
  结果：`/base/get?foo=%7B%22bar%22:%22baz%22%7D` (`{"bar":"baz"}` encode 后的结果)

  4、params参数值为 Date 类型
  params: {
    date： new Date()
  }
  结果：'/base/get?date=2019-04-01T05:55:39.030Z'  (date.toISOString()的结果)

  5、特殊字符支持
  对于字符 `@`、`:`、`$`、`,`、` `、`[`、`]`，我们是允许出现在 `url` 中的，不希望被 encode。
  params: {
    foo: '@:$, '
  }
  结果：'/base/get?foo=@:$+' (注意，我们会把空格 ` ` 转换成 `+`)

  6、空值忽略
  对于值为 `null` 或者 `undefined` 的属性，我们是不会添加到 url 参数中的。
  params: {
    foo: 'bar',
    baz: null
  }
  结果：/base/get?foo=bar

  7、丢弃 url 中的哈希标记
  url: '/base/get#hash',
  params: {
    foo: 'bar'
  }
  结果：/base/get?foo=bar

  8、保留 url 中已存在的参数
  url: '/base/get?foo=bar',
  params: {
    bar: 'baz'
  }
  结果：'/base/get?foo=bar&bar=baz'
 */

function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url: string, params?: any): string {
  if (!params) {
    return url
  }

  const parts: string[] = []

  Object.keys(params).forEach(key => {
    const val = params[key]

    if (val === null || typeof val === 'undefined') {
      return
    }

    // 处理参数值是数组的情况
    let values = []
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }

    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()
      } else if (isObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')

  if (serializedParams) {
    // 判断哈希标记
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      url = url.slice(0, markIndex)
    }
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }
  return url
}
