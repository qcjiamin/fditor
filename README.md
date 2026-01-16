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


历史记录优化方案
  当前逻辑：执行功能 -> 修改事件 -> history:update 添加histroy; 工程配置保存
  修改逻辑：命令模式，将功能执行包装为命令
           需要支持历史记录的状态放入统一的 reactive 来管理
           do undo 需要处理异常的情况
           属性的修改分为被动和主动修改

命令模式碰到的问题：
  选中命令，是监听选中事件，然后推入栈中的，align命令本身即执行了布局也会触发选中事件，导致栈中重复
方案：
  1. 命令中的方法都使用无事件版本 -> 属性条切换依赖事件，命令中需要主动切换属性条
     需要时要自己封装无事件版本方法，并且处理类似属性条切换的额外逻辑
  2. 静默状态 -> 针对选择事件，属性条切换正常执行，静默状态下不添加选择命令到栈
    带有多次副作用的命令都使用静默状态
  3. 历史栈加一个锁定功能，在执行do 和undo时锁定，执行完解锁。中间的所有副作用全部不入栈
     命令本身的do和undo方法支持异步， 但是如果副作用是异步的，如何处理？加额外标记？目前没有异步副作用
     0. 所有对多选的命令需要使用 id 来保存多选的对象
     1. 命令的执行位置如果与editor的构建位置再同一个单元，需要传入editor，如useSelect
     2. editor的canvas是异步创建的，命令里要使用时，需要注意是否创建完成， 蓉useSelect, 需要在undo,redo 里动态获取canvas
     3. 如果有多场景的情况，stage需要参考activeSelection,保存id? 目前想到的是需要把场景切换加入栈
     4. 如果要把对象保存到命令的闭包中，主要不要直接使用ref.value, 要使用toRaw拿到原始值
  选择方案3，优雅、方便、安全，且改动量小

  针对选择工具，undo时由事件触发store修改， 改为强制由命令修改store：
    1. 解除耦合：Command 应该是自包含的业务逻辑单元。依赖 selected:change 事件来更新 Store 意味着你的 Undo 逻辑依赖于 View 层（组件不仅要挂载，还得正确绑定事件）。如果未来重构导致事件触发时机改变（例如静默更新），Undo 就会失效。
    2. 确定性：Undo 是一个“强制状态恢复”的操作，不同于用户的交互操作。显式调用 store.setSelected 能够确保执行 Undo 后，Store 的状态 100% 与该时刻的历史记录一致，不存在异步或副作用的不确定性。
    3. 避免死循环风险：虽然你目前通过 isHistoryLocked 阻止了 Undo 触发事件再次入栈，但依赖事件流（Action -> Canvas -> Event -> Store）比直接流（Action -> Canvas & Store）更难调试。
  针对undo时，selected:change->store修改的冗余逻辑，采用放出isHistoryLocked状态，避免重复修改store
      1. 实时交互场景（鼠标点击） -> 事件驱动
        控制者：selected:change 事件监听器
        流程：用户点击画布 -> 触发事件 -> 更新 Store -> 更新 UI。
        Command的角色：此时命令只是一个记录者（Recorder），它被动记录这次变化，但不会执行 do()（因为 immediately: false），也不直接修改 Store。
      2. 历史回溯场景（Undo/Redo） -> 命令驱动
        控制者：Command 的 undo/do 方法
        流程：用户点击撤销 -> 触发 Command 方法 -> 主动更新 Store -> 恢复画布 -> 更新 UI。
        Command的角色：此时命令变成了执行者（Actor），它强制将 Store 和画布重置到特定状态。
        事件的角色：此时事件监听器被 isHistoryLocked 屏蔽，退化为静默状态，防止干扰。
  为什么属性修改命令不用修改Store:
    useSelect (选中命令)
      操作性质：改变了“谁被选中”（改引用）。
      影响：editorStore.selected 指向了错误的对象（或者空）。如果不显式修正，Store 持有的是过期的引用，后续操作都会基于错误的对象。
      必须性：必须显式 setSelected 来校准指针。
    useModifyAttr (属性命令)
      操作性质：改变了“选中对象的样子”（改属性）。
      影响：editorStore.selected 指向的仍然是同一个对象（targetObj），引用没变。
      现状：当你在 undo 里执行 targetObj.eset(...) 时，对象内部数据已经变了。因为 editorStore.selected 仅仅是持有这个对象的引用，所以 Store 实际上“自动”拥有了最新数据（共享内存）。
      对于属性修改，Command 的职责是**“变更对象数据”** + “通知变更”。
        数据变更：Command 直接在 undo 里完成了 (targetObj.eset)。
        UI同步：只需要确保 eset 或者 canvas.renderAll 触发了 Vue 的响应式更新（通常通过抛object:modified 或类似事件通知属性条刷新）。

上述逻辑对其他命令的影响：
  以添加命令举例，添加元素的副作用为选中元素，选中状态是在store中的undoAbleState中的。因此其需要在do、redo中主动调用store.setSelected
  在修改useSelect之前，添加命令的UI状态,即属性条切换，是可以通过事件自动修改的。修改选择命令后，命令中执行功能触发的事件被拦截。
  这保证了  "Command is Source of Truth" 原则
  
命令驱动的优势：
确定性 (Determinism)
Command: "我添加了一个元素，所以我知道它被选中了。" —— 这是逻辑上的必然。
Event: "我添加了一个元素... 等等，Canvas 告诉我它被选中了吗？" —— 这是依赖外部系统的反馈。
优势：消除了对第三方库（Fabric.js）事件触发时机、顺序的不确定性依赖。
原子性 (Atomicity)
在 Un/Redo 时，我们往往需要原子级地恢复状态。
Command 可以在一个微任务（Microtask）堆栈中同时完成 Render 和 State Update。
Event 往往是异步的或滞后的，可能导致 UI 在 0.1秒内显示错误状态，然后闪烁成正确状态。
解耦 (Decoupling)
如果未来你决定为了性能，在批量操作时 canvas.renderOnAddRemove = false 或 suppressEvents = true（静默模式），事件流会中断，Store 将无法收到更新，UI 会卡死。
Command 原则下，即使 Canvas 静默工作，Store 依然能正确更新，UI 依然能响应。