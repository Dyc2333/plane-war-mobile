/**
 * 输入处理器类
 * 管理键盘输入事件
 */

class InputHandler {
  constructor() {
    this.keys = new Set();
    this.prevKeys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDown = false;
    this.mousePrevDown = false;

    this.init();
  }

  /**
   * 初始化事件监听
   */
  init() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));

    window.addEventListener('mousedown', this.handleMouseDown.bind(this));
    window.addEventListener('mouseup', this.handleMouseUp.bind(this));
    window.addEventListener('mousemove', this.handleMouseMove.bind(this));

    // 防止方向键滚动页面
    window.addEventListener('keydown', this.preventDefaultForKey.bind(this));
  }

  /**
   * 防止特定按键的默认行为
   * @param {KeyboardEvent} e
   */
  preventDefaultForKey(e) {
    const preventKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'Space', 'PageUp', 'PageDown'
    ];

    if (preventKeys.includes(e.code)) {
      e.preventDefault();
    }
  }

  /**
   * 处理按键按下事件
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    // 同时添加 code 和 key
    this.keys.add(e.code);
    if (e.key && e.key.length === 1) {
      // 单字符键也添加（如 'B'）
      this.keys.add('Key' + e.key.toUpperCase());
    }
  }

  /**
   * 处理按键释放事件
   * @param {KeyboardEvent} e
   */
  handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  /**
   * 处理鼠标按下事件
   * @param {MouseEvent} e
   */
  handleMouseDown(e) {
    this.mouseDown = true;
  }

  /**
   * 处理鼠标释放事件
   * @param {MouseEvent} e
   */
  handleMouseUp(e) {
    this.mouseDown = false;
  }

  /**
   * 处理鼠标移动事件
   * @param {MouseEvent} e
   */
  handleMouseMove(e) {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  /**
   * 每帧更新输入状态
   */
  update() {
    this.prevKeys = new Set(this.keys);
    this.mousePrevDown = this.mouseDown;
  }

  /**
   * 检查按键是否被按下
   * @param {string} key - 按键代码(如 'Space', 'ArrowUp', 'KeyA')
   * @returns {boolean}
   */
  isKeyPressed(key) {
    return this.keys.has(key);
  }

  /**
   * 检查按键是否刚被按下(本帧按下但上一帧未按下)
   * @param {string} key - 按键代码
   * @returns {boolean}
   */
  isKeyJustPressed(key) {
    return this.keys.has(key) && !this.prevKeys.has(key);
  }

  /**
   * 检查按键是否刚被释放
   * @param {string} key - 按键代码
   * @returns {boolean}
   */
  isKeyJustReleased(key) {
    return !this.keys.has(key) && this.prevKeys.has(key);
  }

  /**
   * 检查任意按键是否被按下
   * @returns {boolean}
   */
  isAnyKeyPressed() {
    return this.keys.size > 0;
  }

  /**
   * 检查特定冲突按键组中是否有任意键被按下
   * @param {string[]} keys - 按键代码数组
   * @returns {boolean}
   */
  isAnyKeyInGroupPressed(keys) {
    return keys.some(key => this.keys.has(key));
  }

  /**
   * 检查鼠标是否被按下
   * @returns {boolean}
   */
  isMousePressed() {
    return this.mouseDown;
  }

  /**
   * 检查鼠标是否刚被按下
   * @returns {boolean}
   */
  isMouseJustPressed() {
    return this.mouseDown && !this.mousePrevDown;
  }

  /**
   * 检查鼠标是否刚被释放
   * @returns {boolean}
   */
  isMouseJustReleased() {
    return !this.mouseDown && this.mousePrevDown;
  }

  /**
   * 获取鼠标位置
   * @returns {Object} {x, y}
   */
  getMousePosition() {
    return {
      x: this.mouseX,
      y: this.mouseY
    };
  }

  /**
   * 获取相对于画布的鼠标位置
   * @param {HTMLCanvasElement} canvas - 画布元素
   * @returns {Object} {x, y}
   */
  getMousePositionInCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: this.mouseX - rect.left,
      y: this.mouseY - rect.top
    };
  }

  /**
   * 清空所有按键状态
   */
  clearKeys() {
    this.keys.clear();
    this.prevKeys.clear();
  }

  /**
   * 获取当前按下的所有按键(列出前10个,用于调试)
   * @returns {string}
   */
  getPressedKeysDebug() {
    const pressed = Array.from(this.keys).slice(0, 10);
    if (this.keys.size > 10) {
      pressed.push('...');
    }
    return pressed.join(', ');
  }
}

/**
 * 手柄输入支持(可选,用于游戏手柄)
 */
class GamepadHandler {
  constructor() {
    this.gamepads = {};
    this.connected = false;
    this.deadzone = 0.2; // 摇杆死区

    this.init();
  }

  /**
   * 初始化手柄事件
   */
  init() {
    window.addEventListener('gamepadconnected', this.handleConnected.bind(this));
    window.addEventListener('gamepaddisconnected', this.handleDisconnected.bind(this));
  }

  /**
   * 处理手柄连接事件
   * @param {GamepadEvent} e
   */
  handleConnected(e) {
    console.log('Gamepad connected:', e.gamepad.id);
    this.connected = true;
  }

  /**
   * 处理手柄断开事件
   * @param {GamepadEvent} e
   */
  handleDisconnected(e) {
    console.log('Gamepad disconnected:', e.gamepad.id);
    this.connected = false;
    delete this.gamepads[e.gamepad.index];
  }

  /**
   * 更新手柄状态
   */
  update() {
    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (gamepad) {
        this.gamepads[gamepad.index] = gamepad;
      }
    }
  }

  /**
   * 获取摇杆输入(左摇杆)
   * @param {number} index - 手柄索引
   * @returns {Object} {x, y} 范围-1到1
   */
  getLeftStick(index = 0) {
    const gamepad = this.gamepads[index];
    if (!gamepad) return { x: 0, y: 0 };

    const x = this.applyDeadzone(gamepad.axes[0]);
    const y = this.applyDeadzone(gamepad.axes[1]);

    return { x, y };
  }

  /**
   * 获取摇杆输入(右摇杆)
   * @param {number} index - 手柄索引
   * @returns {Object} {x, y} 范围-1到1
   */
  getRightStick(index = 0) {
    const gamepad = this.gamepads[index];
    if (!gamepad) return { x: 0, y: 0 };

    const x = this.applyDeadzone(gamepad.axes[2]);
    const y = this.applyDeadzone(gamepad.axes[3]);

    return { x, y };
  }

  /**
   * 应用死区处理
   * @param {number} value - 原始值
   * @returns {number} 处理后的值
   */
  applyDeadzone(value) {
    if (Math.abs(value) < this.deadzone) {
      return 0;
    }
    // 标准化输出范围
    return (value - Math.sign(value) * this.deadzone) / (1 - this.deadzone);
  }

  /**
   * 检查按钮是否被按下
   * @param {number} buttonIndex - 按钮索引
   * @param {number} index - 手柄索引
   * @returns {boolean}
   */
  isButtonPressed(buttonIndex, index = 0) {
    const gamepad = this.gamepads[index];
    if (!gamepad) return false;

    return gamepad.buttons[buttonIndex] && gamepad.buttons[buttonIndex].pressed;
  }

  /**
   * 检查按钮是否刚被按下
   * @param {number} buttonIndex - 按钮索引
   * @param {number} index - 手柄索引
   * @returns {boolean}
   */
  isButtonJustPressed(buttonIndex, index = 0) {
    const gamepad = this.gamepads[index];
    if (!gamepad || !gamepad.buttons[buttonIndex]) return false;

    // 注意: 需要保存上一帧状态才能准确判断
    // 这里简化处理,仅检查当前状态
    return gamepad.buttons[buttonIndex].pressed;
  }

  /**
   * 检查是否连接了手柄
   * @returns {boolean}
   */
  isConnected() {
    return this.connected;
  }

  /**
   * 获取连接的手柄数量
   * @returns {number}
   */
  getConnectedCount() {
    return Object.keys(this.gamepads).length;
  }
}

/**
 * 虚拟手柄输入类(用于触摸设备)
 * (可选扩展)
 */
class VirtualJoystick {
  constructor(element, options = {}) {
    this.element = element;
    this.deadzone = options.deadzone || 0.1;
    this.maxDistance = options.maxDistance || 50;

    this.active = false;
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;

    this.output = { x: 0, y: 0 };

    this.init();
  }

  /**
   * 初始化触摸事件
   */
  init() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
  }

  /**
   * 处理触摸开始
   * @param {TouchEvent} e
   */
  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = this.element.getBoundingClientRect();

    this.active = true;
    this.startX = touch.clientX - rect.left;
    this.startY = touch.clientY - rect.top;
    this.currentX = this.startX;
    this.currentY = this.startY;
  }

  /**
   * 处理触摸移动
   * @param {TouchEvent} e
   */
  handleTouchMove(e) {
    if (!this.active) return;
    e.preventDefault();

    const touch = e.touches[0];
    const rect = this.element.getBoundingClientRect();

    this.currentX = touch.clientX - rect.left;
    this.currentY = touch.clientY - rect.top;

    this.updateOutput();
  }

  /**
   * 处理触摸结束
   * @param {TouchEvent} e
   */
  handleTouchEnd(e) {
    e.preventDefault();
    this.active = false;
    this.output = { x: 0, y: 0 };
  }

  /**
   * 更新输出值
   */
  updateOutput() {
    const dx = this.currentX - this.startX;
    const dy = this.currentY - this.startY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const clampedDistance = Math.min(distance, this.maxDistance);

    const normalizedX = dx / distance;
    const normalizedY = dy / distance;

    let outputX = normalizedX * (clampedDistance / this.maxDistance);
    let outputY = normalizedY * (clampedDistance / this.maxDistance);

    // 应用死区
    if (Math.abs(outputX) < this.deadzone) outputX = 0;
    if (Math.abs(outputY) < this.deadzone) outputY = 0;

    this.output = { x: outputX, y: outputY };
  }

  /**
   * 获取输出值
   * @returns {Object} {x, y} 范围-1到1
   */
  getOutput() {
    return this.output;
  }

  /**
   * 检查是否激活
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * 绘制虚拟摇杆(需要在canvas上手动调用)
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    ctx.save();

    // 绘制底座
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.startX, this.startY, this.maxDistance, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制控制杆
    if (this.active) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.beginPath();
      ctx.arc(this.currentX, this.currentY, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}