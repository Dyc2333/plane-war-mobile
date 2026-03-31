# 飞机大战手机端适配任务

## 任务概述

将"飞机大战"游戏从 PC 端适配到移动端，使其可以在手机浏览器上流畅运行。

## 当前状态

- **PC 端版本位置**: `C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战`
- **移动端版本位置**: `C:\Users\Administrator\IdeaProjects\claude-workspace\飞机大战手机端` (已复制)
- **技术栈**: HTML5 Canvas + 原生 JavaScript

## 需要完成的工作

### 1. 触摸控制适配

#### 1.1 添加虚拟摇杆
- 在屏幕左侧添加虚拟摇杆控制飞机移动
- 支持 360 度方向控制
- 摇杆范围：半径 50px
- 视觉反馈：半透明白色圆环 + 控制球

#### 1.2 添加射击按钮
- 在屏幕右侧添加虚拟射击按钮
- 位置：右下角
- 大小：直径 60px
- 视觉反馈：半透明红色圆形，按下时变亮

#### 1.3 添加炸弹按钮
- 在屏幕右侧添加炸弹按钮
- 位置：右上角
- 大小：直径 50px
- 视觉反馈：半透明橙色圆形，有炸弹图标

### 2. 屏幕适配

#### 2.1 Canvas 自适应
- Canvas 尺寸根据 `window.innerWidth` 和 `window.innerHeight` 动态调整
- 保持游戏元素比例
- 处理设备像素比（devicePixelRatio）

#### 2.2 响应式布局
- 菜单界面适配小屏幕
- 按钮大小适合手指点击（最小 44x44px）
- 文字大小适配不同屏幕

### 3. 性能优化

#### 3.1 触摸事件优化
- 使用 `passive: false` 防止滚动
- 触摸事件节流
- 多触摸支持（同时控制 + 射击）

#### 3.2 渲染优化
- 根据屏幕尺寸调整粒子数量
- 降低低端设备的特效复杂度

### 4. UI 调整

#### 4.1 分数显示
- 移到屏幕顶部
- 字体大小适配
- 半透明背景提高可读性

#### 4.2 暂停菜单
- 添加屏幕右上角暂停按钮
- 弹出式菜单适配小屏幕
- 返回按钮适配触摸

## 技术要点

### 输入系统改造

1. **扩展 InputHandler 类**
   - 添加 `touchStart`, `touchMove`, `touchEnd` 事件处理
   - 添加虚拟摇杆状态跟踪
   - 添加虚拟按钮状态跟踪

2. **添加 TouchHandler 类**
   ```javascript
   class TouchHandler {
     constructor() {
       this.joystick = { x: 0, y: 0, active: false };
       this.shootButton = { pressed: false };
       this.bombButton = { pressed: false };
       this.init();
     }
     
     // 虚拟摇杆逻辑
     // 虚拟按钮逻辑
   }
   ```

3. **修改 Player 类**
   - 支持虚拟摇杆输入
   - 支持触摸射击
   - 保持键盘输入兼容性

### 游戏循环调整

```javascript
// 在 game.js 的 loop() 中添加
if (touchHandler) {
  touchHandler.update();
}
```

### Canvas 渲染调整

```javascript
// 在 draw() 方法末尾添加
if (touchHandler) {
  touchHandler.draw(ctx);
}
```

## 文件修改清单

1. **js/input.js** - 扩展触摸支持
2. **js/player.js** - 适配虚拟摇杆输入
3. **js/game.js** - 添加触摸处理器初始化
4. **css/style.css** - 添加虚拟控件样式
5. **index.html** - 添加触摸控件 DOM 元素（可选）

## 测试要点

1. ✅ 虚拟摇杆能流畅控制飞机
2. ✅ 射击按钮能正常发射子弹
3. ✅ 炸弹按钮能正常释放炸弹
4. ✅ 多触摸同时操作无冲突
5. ✅ 横屏/竖屏切换正常
6. ✅ 不同尺寸手机适配正常
7. ✅ PC 端键盘控制仍然可用

## 参考实现

### 虚拟摇杆参考
```javascript
// 触摸开始
handleTouchStart(e) {
  const touch = e.changedTouches[0];
  // 判断是否在摇杆区域
  // 记录起始位置
}

// 触摸移动
handleTouchMove(e) {
  const touch = e.changedTouches[0];
  // 计算摇杆偏移
  // 更新输出值 (-1 到 1)
}

// 触摸结束
handleTouchEnd(e) {
  // 重置摇杆
}
```

### 虚拟按钮参考
```javascript
// 触摸开始
handleButtonTouchStart(e, buttonType) {
  // 判断是否在按钮区域
  // 设置按钮状态
  // 触发对应操作
}
```

## 优先级

1. **P0** - 虚拟摇杆控制飞机移动
2. **P0** - 虚拟射击按钮
3. **P1** - Canvas 自适应屏幕
4. **P1** - UI 适配小屏幕
5. **P2** - 虚拟炸弹按钮
6. **P2** - 性能优化

## 交付标准

- 在主流手机浏览器（Chrome、Safari）上可流畅运行
- 操作响应延迟 < 100ms
- 帧率保持 50+ FPS
- 无明显卡顿或掉帧
- PC 端功能不受影响

---

*创建时间：2026-03-31*
*目标：将飞机大战游戏适配移动端*
