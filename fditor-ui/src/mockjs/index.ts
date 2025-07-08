import * as Mock from 'mockjs'
// const Random = Mock.Random
export const userData = Mock.mock('/data/list', 'get', {
  // 属性 list 的值是一个数组，随机生成 1 到 10 个元素
  'list|1-10': [
    {
      // 随机生成1-10个★
      'string|1-10': '★',
      // 随机生成1-100之间的任意整数
      'number|1-100': 1,
      // 生成一个浮点数，整数部分大于等于 1、小于等于 100，小数部分保留 1 到 10 位。
      'floatNumber|1-100.1-10': 1,
      // 随机生成一个布尔值，值为 true 的概率是 1/2，值为 false 的概率同样是 1/2。
      'boolean|1': true,
      // 随机生成一个布尔值，值为 false 的概率是 2 / (2 + 5)，值为 true 的概率是 5 / (2 + 5)。
      'bool|2-5': false,
      // 从属性值 object 中随机选取 2-4 个属性
      'object|2-4': {
        '310000': '上海市',
        '320000': '江苏省',
        '330000': '浙江省',
        '340000': '安徽省'
      },
      // 通过重复属性值 array 生成一个新数组，重复次数为 2
      'array|2': ['AMD', 'CMD', 'UMD'],
      // 执行函数 function，取其返回值作为最终的属性值，函数的上下文为属性 'name' 所在的对象。
      foo: '哇哈哈哈哈',
      name: function () {
        return this.foo
      },
      // 根据正则表达式 regexp 反向生成可以匹配它的字符串。用于生成自定义格式的字符串。
      regexp: /\d{5,10}/
    }
  ],
  code: 200,
  message: 'ok'
})

// export const unsplash = Mock.mock('/search/photos', 'get', {
//   total: 150,
//   total_pages: 15,
//   'results|10': [
//     {
//       urls: {
//         regular: Random.image('1080x1920', '#16d46b', '#fff', 'png', 'Hello'),
//         small: Random.image('540x960', '#16d46b', '#fff', 'png', 'Hello'),
//         thumb: Random.image('270x480', '#16d46b', '#fff', 'png', 'Hello')
//       }
//     }
//   ],
//   code: 200,
//   message: 'ok'
// })

Mock.Random.extend({
  size: function () {
    const sizes = [
      '300x250',
      '250x250',
      '240x400',
      '336x280',
      '180x150',
      '720x300',
      '468x60',
      '234x60',
      '88x31',
      '120x90',
      '120x60',
      '120x240',
      '125x125',
      '728x90',
      '160x600',
      '120x600',
      '300x600'
    ]
    return this.pick(sizes)
  }
})

export const unsplash = Mock.mock(/\/search\/photos/, 'get', (options) => {
  const url = new URL(options.url, 'http://localhost') // 给 URL 一个基地址以方便解析
  const page = Number(url.searchParams.get('page')) || 1
  const pagesize = Number(url.searchParams.get('pageSize')) || 30
  console.log(options)

  // 模拟不同页的数据
  return Mock.mock({
    total: 150,
    total_pages: 3,
    [`results|${pagesize}`]: [
      {
        'id|+1': (page - 1) * pagesize + 1,
        // title: '@ctitle(5, 10)',
        // 'id|+1': 1,
        shape: function () {
          return Mock.Random.size() as string
        },
        width: function () {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return Number(this.shape.split('x')[0])
        },
        height: function () {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return Number(this.shape.split('x')[1])
        },
        regular: `@image("1080x1920", "#16d46b", "#fff", "png", @county(true))`,
        // small: `@image("@SIZE", "@color", "#fff", "png", "@integer")`,
        small: function () {
          // Mock.Random.size()
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          return Mock.Random.image(`${this.width}x${this.height}`, Mock.Random.color(), '#fff', 'png', String(this.id))
        },
        thumb: `@image("270x480", "#16d46b", "#fff", "png", @county(true))`
      }
    ]
  })
})

// export const unsplash = Mock.mock(/\/search\/photos/, 'get', function (options) {
//   console.log(options)
//   return Mock.mock({
//     data: options.type,
//     code: 200,
//     message: 'pk'
//   })
// })
