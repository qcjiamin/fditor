import { Gradient } from 'fabric'

// 渐变保存自己的角度
Gradient.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    propertiesToInclude = (propertiesToInclude || []).concat(['_degree', '_percent'])
    return toObject.apply(this, [propertiesToInclude])
  }
})(Gradient.prototype.toObject)
