# Vue 3 + TypeScript + Vite

TODO
- [x] 多选
- [ ] 属性设置
- [ ] UI优化
    - [ ] 元素添加
    - [ ] 画布添加 margin
- [x] 了解type.ts
- [x] yarn workspace
- [x] 自动引入单元的路径问题 - tsconfig.json
- [x] 事件完善
- [x] 插件异步功能 tapable
- [ ] 鼠标移入元素显示边框效果
- [x] undo redo
- [x] 瀑布流
- [ ] 虚拟列表
- [ ] 瀑布流+虚拟列表
- [ ] 分时函数
- [ ] 给图片瀑布流添加搜索功能
- [ ] 瀑布流组件加过度效果
- [ ] KonvaNode 在kditor中的引入 !渐变
- [ ] guideline
- [ ] 封装指令
- [ ] 渐变色 及 konvaFill 的使用
- [x] 透明背景图
- [ ] 控制点自定义绘制 anchorStyleFunc
- [ ] 添加控制点 x 可以不要这个功能，如果需要，得自己手动添加，然后监听各类事件来实现
- [ ] 旋转时显示角度
- [ ] 自定义形状绘制 箭头 线
- [ ] 颜色相关的ts类型定义与颜色选择器事件!!!
- [ ] 使用 provice inject 优化嵌套比较深，但是中间组件有透传而无自身逻辑的情况
- [ ] 图片裁剪
- [x] 区分属性修改事件 和 删除事件   属性修改->history & getattr   删除 -> history
- [ ] 文字渐变色
- [ ] 裁剪框对象化；图片支持圆角(基于裁剪)；限制拖拽范围； 不同形状裁剪？
- [x] 基于对象的canvas，实现自定义canvas, 不需要再在原型链上添加方法
- [ ] 快捷键 删除 移动
  

> svg 删除path上的 fill, 在<svg> 上添加 fill=currentColor 来实现颜色同步； 删除width height, 实现大小由外部控制
> 为什么需要静默状态？
   删除 activeSelection(2个元素) 时，会触发2次object:removed, 业务上影响 history 的 step
裁剪实现方案
  A 1. group 包 image 实现自定义Image类，裁剪框绑定在group上，宽高，定位设置在group上
    1. 裁剪时创建一个独立裁剪框
    2. 如果要做蒙层并凸显当前裁剪区域的话，裁剪时在独立裁剪框下添加蒙层和一个随独立裁剪框缩放实时调整clippath的图片
    3. 独立裁剪框与实时调整clippath的图片可以合并为一个组件
    !! 与B相比，虽然裁剪框和宽高都设置在group上，但是有原图撑原始宽高
  B 1. 自己计算自身响应范围，包装为新类，不用group代理宽高
      分解任务：先找到计算active范围的方法
    1. 其他逻辑与group一致
    !! 需要根据裁剪框重新计算元素定位
    => 基本否定该方案
      裁剪框的定位依赖于图片的原始宽高
      图片的宽高在裁剪后会设置与裁剪框相同
      这2个条件互斥
> 放入pinia store 中的属性会被代理
  使用this=store.selected.canvas 作为 new ActiveSelection(objs, {canvs:使用this}) 时，由于this是代理，在 LayoutManager.layoutObject 中的对比中会出现不匹配（proxy(canvas)!==canvas）,因此修改属性尽量使用 editor.getSelectedObject()

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
