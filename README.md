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
- [ ] 结合 pinia 优化 history
- [x] 瀑布流
- [ ] 虚拟列表
- [ ] 瀑布流+虚拟列表
- [ ] 分时函数
- [ ] 给图片瀑布流添加搜索功能
- [ ] 瀑布流组件加过度效果
- [x] guideline
- [ ] 封装指令
- [x] 透明背景图
- [ ] 控制点自定义绘制 anchorStyleFunc
- [ ] 添加控制点 x 可以不要这个功能，如果需要，得自己手动添加，然后监听各类事件来实现
- [x] 旋转时显示角度
- [x] 自定义形状绘制 箭头 线
- [ ] 颜色相关的ts类型定义与颜色选择器事件!!!
- [ ] 使用 provice inject 优化嵌套比较深，但是中间组件有透传而无自身逻辑的情况
- [ ] 图片裁剪
- [x] 区分属性修改事件 和 删除事件   属性修改->history & getattr   删除 -> history
- [x] 文字渐变色
- [ ] 裁剪框对象化；图片支持圆角(基于裁剪)；限制拖拽范围； 不同形状裁剪？
- [x] 基于对象的canvas，实现自定义canvas, 不需要再在原型链上添加方法
- [x] 快捷键 删除 移动
- [ ] layer
- [ ] 右键菜单
- [ ] 监控添加对象但没有id的情况。无法通过修改构造函数和_setoptions方法来添加id，构造函数无法修改，_setoptions是protected方法
- [ ] 侧边栏样式美化
- [ ] 钢笔工具与贝塞尔曲线
  - [ ] 实现 Path 类封装，数据结构设计 
  - [ ] 添加自定义控制点
  - [ ] 贝塞尔取消功能与实现手柄控制状态
  - [ ] 有添加或其他修改事件时，退出pen和pencil状态
  - [ ] 移动线段
  - [ ] 对齐功能
  - [ ] 圆角
  - [ ] 对称
  - [ ] 曲线直接变为圆的边 arc
- [ ] stroke 设置外部、居中、内部
  

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



### 🎨 Adobe Illustrator 钢笔工具操作汇总表

| 操作分类 | 目标行为 | 快捷键 / 鼠标动作 | 前置条件 / 依赖操作 |
| :--- | :--- | :--- | :--- |
| **基础绘图** | 绘制直线锚点 | **左键单击** | 无 |
| | 绘制曲线锚点 | **左键按住并拖拽** | 无 |
| | 绘制水平/垂直/45°线 | **Shift + 点击/拖拽** | 正在绘制路径中 |
| | 闭合路径 | 移至起点出现“○”时 **点击** | 至少已有一个锚点 |
| **路径调整** | 转换锚点（尖角变圆角） | 按住 **Alt (Win) / Opt (Mac)** | 鼠标悬停在现有锚点上 |
| | 实时拆分调节杆方向 | 按住 **Alt (Win) / Opt (Mac)** | 正在拖拽曲线调节杆时 |
| | 移动正在绘制中的锚点 | 按住 **空格键 (Space)** | 鼠标左键尚未松开时 |
| | 增加锚点 | 移至路径线段出现“+”时 **点击** | 必须悬停在现有路径段上 |
| | 删除锚点 | 移至现有锚点出现“-”时 **点击** | 必须悬停在现有锚点上 |
| **工具切换** | 临时切换到“直接选择工具” | 按住 **Ctrl (Win) / Cmd (Mac)** | 用于移动已定位的锚点或杆 |
| | 强制结束当前路径 | **Enter** 或 **Esc** 或 **Ctrl+点击空白** | 路径未闭合但需停止绘制 |
| **高级控制** | 重新连接路径末端 | 移至末端锚点出现“/”时 **点击** | 之前路径已断开且当前选中钢笔 |
| | 橡皮带预览（预看线条） | 在首选项中开启“启用橡皮带” | 无 |

曲线圆角实现方案
目前版本：
 使用paper.js 及其插件 paperjs-round-corners 实现 f(path, radius)=>newpath
 使用ai生成的获取path的最大圆角来限制 f 方法的圆角半径参数，避免其本身的当超出做大圆角时，
 被处理为无圆角的情况