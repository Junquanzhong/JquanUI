# 首屏粒子小狗（2026-10-27 历史实现）

2026-10-28 已由四脚地面行为替代；当前接口和验收以 2026-10-28-grounded-pet-design.md、README 和项目 skill 为准。以下保留当时实现与验证，不代表当前行为。

用户将首屏水母改为小狗电子宠物：光标在首屏时逐渐靠近、卖萌，移出后自己玩耍，活动范围仅限首屏。延续既有青绿菱形粒子、亮暗主题与独立背景暂停；不增加宠物面板或养成数据。

## 设计取舍

使用 64 个点组成垂耳幼犬：身躯、头部、垂耳、前爪、尾巴和眼鼻表情有稳定的局部坐标。相较每帧重新随机组形，这能保持识别度；相较鼠标位置直接赋值，限速和速度缓动让它像慢慢走来。Canvas 复用现有首屏插画职责，页面布局仍全部使用 JquanUI。已检查现有 Carousel 和 Core 主题能力，继续复用；宠物是项目插画行为，不归入 Core 或通用轮播组件。

交互分为 playing → approaching → cute。接近固定光标目标后短暂停留，再歪头、摇尾、抬爪和眨眼；目标偏移时重新靠近。光标离开立即回到 playing，沿二维路径探索，并按相位交替嗅闻和轻跳。进入/离开不重置位置，缩放窗口时校正边界。

目标在光标侧方并略微偏下，给悬停链接留出空间。宠物插画位于内容上方的透明装饰层以免被封面完全遮住，保持低透明度、pointer-events:none、aria-hidden。真正的 pointerenter/move/leave/cancel 监听绑定在 data-hero；导航、其他分区和其他页面不能继续吸引它。触摸不建立跟随目标，手机自主游玩。

## 实现接口

页面顺序为主题配置 → prismara-theme.js → Core → Carousel → prismara-motion.js → prismara-interactions.js。首页使用 data-pet="dog"，data-particle-count="64"；旧 data-jellyfish 已移除。

PrismaraMotion 继续提供 pose(width,height,time) 作为自主二维路径。新增 dogPoints（64 组局部 [x,y]）、createPet()（独立位置/速度/行为状态）、stepPet(pet,width,height,time,elapsed,pointer)。尺寸单位 px，time/elapsed 单位秒，pointer 为 {inside,x,y} 或 null。stepPet 更新传入 pet，返回 x/y/scale/state/action/tilt/wag/bounce/paw/sniff/blink，限制每步最大 elapsed 为 0.1；elapsed=0 不推进位置。

Canvas data-pet-state 为 playing/approaching/cute，data-pet-action 为 explore/sniff/hop/follow/wave；data-pet-position 是测试用整数坐标，不作为用户文案或公开配置。配色从语义 pet-fur/pet-tail/action-ink 读取，主题切换时重绘，不重新创建实例。

上限 30fps / DPR 1.5；显式暂停、系统减弱动画、后台或离屏时取消 RAF 并清除光标目标。暂停与减弱动画时不响应指针，静态轮廓保留；主题切换可更新静态颜色。页面真正卸载时销毁 Resize/IntersectionObserver、RAF、媒体偏好监听与 AbortController；bfcache 保留原页面。

## 验收

在 390/768/1280px 检查边缘目标、缩放边界、位置连续性、限速接近、停留卖萌、移出游玩；真实浏览器检查鼠标跟随/离开、触屏无粘滞目标、暂停/减弱动画不跟随、离屏停止、文章按钮可穿过装饰层点击，亮暗截图无运行异常。运行静态验证、doctor、浏览器回归与根 check:docs。结果记录在 verification/RESULTS.md。

实际结果：上述行为与完整 96 组亮暗/尺寸回归通过；静态 16 页、751 个本地引用、10 个语法检查通过；doctor 为 290 个类 / 414 条规则，零未解析、失败、冲突和警告；根 check:docs 通过。没有修改 Core、Carousel 或 Full/压缩产物。
