/**
 * 触摸处理器类
 * 管理移动端触摸输入，包括虚拟摇杆和虚拟按钮
 */

class TouchHandler {
  constructor(canvas) {
    this.canvas = canvas;
    
    // 虚拟摇杆状态
    this.joystick = {
      active: false,
      originX: 0,
      originY: 0,
      currentX: 0,
      currentY: 0,
      outputX: 0,  // -1 到 1
      outputY: 0,  // -1 到 1
      radius: 50,
      handleRadius: 25
    };
    
    // 虚拟按钮状态
    this.buttons = {
      shoot: {
        active: false,
        x: 0,
        y: 0,
        radius: 35,
        justPressed: false
      },
      bomb: {
        active: false,
        x: 0,
        y: 0,
        radius: 30,
        justPressed: false
      }
    };
    
    // 触摸跟踪
    this.activeTouches = new Map();
    
    // 布局
    this.layout = {
      joystickZone: { left: 0, right: 0.3, top: 0.5, bottom: 1 },
      shootZone: { left: 0.7, right: 0.95, top: 0.6, bottom: 0.9 },
      bombZone: { left: 0.7, right: 0.95, top: 0.1, bottom: 0.3 }
    };
    
    this.init();
  }
  
  /**
   * 初始化事件监听
   */
  init() {
    const canvas = this.canvas;
    
    // 触摸事件
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    canvas.addEventListener('touchcancel', this.handleTouchCancel.bind(this), { passive: false });
    
    // 窗口大小变化时重新计算按钮位置
    window.addEventListener('resize', this.updateButtonPositions.bind(this));
    
    // 初始计算按钮位置
    this.updateButtonPositions();
  }
  
  /**
   * 更新按钮位置（响应窗口大小变化）
   */
  updateButtonPositions() {
    const width = this.canvas.width || window.innerWidth;
    const height = this.canvas.height || window.innerHeight;
    
    // 虚拟摇杆区域（左下角）
    this.joystick.originX = width * 0.2;
    this.joystick.originY = height * 0.8;
    
    // 射击按钮（右下角）
    this.buttons.shoot.x = width * 0.85;
    this.buttons.shoot.y = height * 0.8;
    
    // 炸弹按钮（右上角）
    this.buttons.bomb.x = width * 0.85;
    this.buttons.bomb.y = height * 0.15;
  }
  
  /**
   * 处理触摸开始事件
   */
  handleTouchStart(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchId = touch.identifier;
      
      // 检查是否在摇杆区域
      if (this.isInJoystickZone(touch)) {
        this.activeTouches.set(touchId, 'joystick');
        this.joystick.active = true;
        this.joystick.originX = touch.clientX;
        this.joystick.originY = touch.clientY;
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        this.updateJoystickOutput();
      }
      // 检查是否在射击按钮区域
      else if (this.isInButtonZone(touch, this.buttons.shoot.x, this.buttons.shoot.y, this.buttons.shoot.radius * 2)) {
        this.activeTouches.set(touchId, 'shoot');
        this.buttons.shoot.active = true;
        this.buttons.shoot.justPressed = true;
      }
      // 检查是否在炸弹按钮区域
      else if (this.isInButtonZone(touch, this.buttons.bomb.x, this.buttons.bomb.y, this.buttons.bomb.radius * 2)) {
        this.activeTouches.set(touchId, 'bomb');
        this.buttons.bomb.active = true;
        this.buttons.bomb.justPressed = true;
      }
    }
  }
  
  /**
   * 处理触摸移动事件
   */
  handleTouchMove(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchId = touch.identifier;
      const touchType = this.activeTouches.get(touchId);
      
      if (touchType === 'joystick' && this.joystick.active) {
        this.joystick.currentX = touch.clientX;
        this.joystick.currentY = touch.clientY;
        this.updateJoystickOutput();
      }
    }
  }
  
  /**
   * 处理触摸结束事件
   */
  handleTouchEnd(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const touchId = touch.identifier;
      const touchType = this.activeTouches.get(touchId);
      
      if (touchType === 'joystick') {
        this.joystick.active = false;
        this.joystick.outputX = 0;
        this.joystick.outputY = 0;
      } else if (touchType === 'shoot') {
        this.buttons.shoot.active = false;
      } else if (touchType === 'bomb') {
        this.buttons.bomb.active = false;
      }
      
      this.activeTouches.delete(touchId);
    }
  }
  
  /**
   * 处理触摸取消事件
   */
  handleTouchCancel(e) {
    e.preventDefault();
    
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      this.activeTouches.delete(touch.identifier);
    }
    
    // 重置所有状态
    this.joystick.active = false;
    this.joystick.outputX = 0;
    this.joystick.outputY = 0;
    this.buttons.shoot.active = false;
    this.buttons.bomb.active = false;
  }
  
  /**
   * 更新摇杆输出值
   */
  updateJoystickOutput() {
    const dx = this.joystick.currentX - this.joystick.originX;
    const dy = this.joystick.currentY - this.joystick.originY;
    
    // 计算距离和角度
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxDistance = this.joystick.radius;
    
    // 限制在摇杆范围内
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);
    
    // 更新手柄位置
    this.joystick.currentX = this.joystick.originX + Math.cos(angle) * clampedDistance;
    this.joystick.currentY = this.joystick.originY + Math.sin(angle) * clampedDistance;
    
    // 计算输出值 (-1 到 1)
    this.joystick.outputX = (Math.cos(angle) * clampedDistance) / maxDistance;
    this.joystick.outputY = (Math.sin(angle) * clampedDistance) / maxDistance;
  }
  
  /**
   * 检查触摸点是否在摇杆区域
   */
  isInJoystickZone(touch) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const zone = this.layout.joystickZone;
    
    const left = width * zone.left;
    const right = width * zone.right;
    const top = height * zone.top;
    const bottom = height * zone.bottom;
    
    return touch.clientX >= left && touch.clientX <= right &&
           touch.clientY >= top && touch.clientY <= bottom;
  }
  
  /**
   * 检查触摸点是否在按钮区域
   */
  isInButtonZone(touch, buttonX, buttonY, threshold) {
    const dx = touch.clientX - buttonX;
    const dy = touch.clientY - buttonY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= threshold;
  }
  
  /**
   * 每帧更新
   */
  update() {
    // 重置刚按下状态
    this.buttons.shoot.justPressed = false;
    this.buttons.bomb.justPressed = false;
  }
  
  /**
   * 绘制触摸控件
   */
  draw(ctx) {
    this.drawJoystick(ctx);
    this.drawShootButton(ctx);
    this.drawBombButton(ctx);
    this.drawTouchHint(ctx);
  }
  
  /**
   * 绘制虚拟摇杆
   */
  drawJoystick(ctx) {
    const { originX, originY, currentX, currentY, radius, handleRadius } = this.joystick;
    
    // 摇杆底座
    ctx.beginPath();
    ctx.arc(originX, originY, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 摇杆手柄
    ctx.beginPath();
    ctx.arc(currentX, currentY, handleRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 191, 255, 0.6)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  
  /**
   * 绘制射击按钮
   */
  drawShootButton(ctx) {
    const button = this.buttons.shoot;
    const { x, y, radius, active } = button;
    
    // 按钮外圈
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(255, 0, 0, 0.5)' : 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = active ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 150, 150, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('射击', x, y);
  }
  
  /**
   * 绘制炸弹按钮
   */
  drawBombButton(ctx) {
    const button = this.buttons.bomb;
    const { x, y, radius, active } = button;
    
    // 按钮外圈
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = active ? 'rgba(255, 165, 0, 0.5)' : 'rgba(255, 165, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = active ? 'rgba(255, 200, 100, 0.8)' : 'rgba(255, 200, 150, 0.5)';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 按钮文字
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('炸弹', x, y);
  }
  
  /**
   * 绘制触摸操作提示
   */
  drawTouchHint(ctx) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('触摸左侧控制移动', window.innerWidth / 2, 20);
  }
  
  /**
   * 获取摇杆输出
   */
  getJoystickOutput() {
    return {
      x: this.joystick.outputX,
      y: this.joystick.outputY
    };
  }
  
  /**
   * 检查射击按钮是否按下
   */
  isShootPressed() {
    return this.buttons.shoot.active;
  }
  
  /**
   * 检查射击按钮是否刚按下
   */
  isShootJustPressed() {
    return this.buttons.shoot.justPressed;
  }
  
  /**
   * 检查炸弹按钮是否按下
   */
  isBombPressed() {
    return this.buttons.bomb.active;
  }
  
  /**
   * 检查炸弹按钮是否刚按下
   */
  isBombJustPressed() {
    return this.buttons.bomb.justPressed;
  }
  
  /**
   * 销毁事件监听
   */
  destroy() {
    // 移除事件监听（如果需要）
  }
}
