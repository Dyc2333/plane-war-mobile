/**
 * 玩家类
 * 管理玩家飞机的状态和行为
 */

class Player {
  /**
   * 创建玩家实例
   * @param {number} x - 初始x坐标
   * @param {number} y - 初始y坐标
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = GAME_CONFIG.PLAYER.SIZE;
    this.width = this.size;
    this.height = this.size;

    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;

    this.velocityX = 0;
    this.velocityY = 0;

    this.fireCooldown = 0;
    this.isFiring = false;
    this.autoFire = true; // 长按自动射击

    this.weaponLevel = GAME_CONFIG.INITIAL.WEAPON_LEVEL;
    this.weaponType = WeaponType.SINGLE;

    this.shieldTime = 0;
    this.invincibleTime = 0;

    this.tiltAngle = 0; // 移动时的倾斜角度
  }

  /**
   * 更新玩家状态
   * @param {number} dt - delta time(秒)
   * @param {InputHandler} input - 输入处理器
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   * @param {TouchHandler} touchHandler - 触摸处理器（可选）
   */
  update(dt, input, canvasWidth, canvasHeight, touchHandler = null) {
    // 计算移动方向
    let moveX = 0;
    let moveY = 0;

    // 优先使用触摸输入
    if (touchHandler && touchHandler.joystick.active) {
      const joystickOutput = touchHandler.getJoystickOutput();
      moveX = joystickOutput.x;
      moveY = joystickOutput.y;
    } else {
      // 键盘输入
      if (input.isKeyPressed('ArrowUp') || input.isKeyPressed('KeyW')) moveY = -1;
      if (input.isKeyPressed('ArrowDown') || input.isKeyPressed('KeyS')) moveY = 1;
      if (input.isKeyPressed('ArrowLeft') || input.isKeyPressed('KeyA')) moveX = -1;
      if (input.isKeyPressed('ArrowRight') || input.isKeyPressed('KeyD')) moveX = 1;

      // 归一化对角线移动
      if (moveX !== 0 && moveY !== 0) {
        const length = Math.sqrt(moveX * moveX + moveY * moveY);
        moveX /= length;
        moveY /= length;
      }
    }

    // 更新速度
    const speed = GAME_CONFIG.PLAYER.SPEED;
    this.velocityX = moveX * speed;
    this.velocityY = moveY * speed;

    // 更新位置
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // 计算倾斜角度
    const targetTilt = -moveX * GAME_CONFIG.PLAYER.MAX_TILT;
    this.tiltAngle = lerp(this.tiltAngle, targetTilt, 10 * dt);

    // 边界限制
    const halfSize = this.size / 2;
    this.x = clamp(this.x, halfSize, canvasWidth - halfSize);
    this.y = clamp(this.y, halfSize, canvasHeight - halfSize);

    // 射击冷却
    if (this.fireCooldown > 0) {
      this.fireCooldown -= dt;
    }

    // 检查是否要射击（支持键盘和触摸）
    this.isFiring = input.isKeyPressed('Space') || (touchHandler && touchHandler.isShootPressed());
    if (this.isFiring && this.fireCooldown <= 0) {
      return this.shoot();
    }

    // 更新护盾时间
    if (this.shieldTime > 0) {
      this.shieldTime -= dt;
    }

    // 更新无敌时间
    if (this.invincibleTime > 0) {
      this.invincibleTime -= dt;
    }

    return null;
  }

  /**
   * 射击 - 返回要发射的子弹数组
   * @returns {Array|null} 子弹参数数组
   */
  shoot() {
    this.fireCooldown = GAME_CONFIG.PLAYER.FIRE_COOLDOWN;

    const weaponConfig = GAME_CONFIG.WEAPON_LEVELS[
      Math.min(this.weaponLevel, GAME_CONFIG.WEAPON_LEVELS.length - 1)
    ];

    const bullets = [];
    const bulletSpeed = GAME_CONFIG.BULLET.PLAYER_SPEED;
    const halfSize = this.size / 2;

    switch (weaponConfig.type) {
      case WeaponType.SINGLE:
        bullets.push({
          x: this.x,
          y: this.y - halfSize,
          velocityX: 0,
          velocityY: -bulletSpeed
        });
        break;

      case WeaponType.DOUBLE:
        const spread = weaponConfig.spread;
        bullets.push({
          x: this.x - spread,
          y: this.y - halfSize + 5,
          velocityX: 0,
          velocityY: -bulletSpeed
        });
        bullets.push({
          x: this.x + spread,
          y: this.y - halfSize + 5,
          velocityX: 0,
          velocityY: -bulletSpeed
        });
        break;

      case WeaponType.TRIPLE:
        const spread3 = weaponConfig.spread;
        const count = weaponConfig.count;

        if (count === 3) {
          // 三发水平
          bullets.push({
            x: this.x,
            y: this.y - halfSize,
            velocityX: 0,
            velocityY: -bulletSpeed
          });
          bullets.push({
            x: this.x - spread3,
            y: this.y - halfSize + 10,
            velocityX: 0,
            velocityY: -bulletSpeed
          });
          bullets.push({
            x: this.x + spread3,
            y: this.y - halfSize + 10,
            velocityX: 0,
            velocityY: -bulletSpeed
          });
        } else if (count === 5) {
          // 五发散射
          for (let i = 0; i < 5; i++) {
            const angle = -Math.PI / 2 + (i - 2) * toRadians(spread3);
            bullets.push({
              x: this.x,
              y: this.y - halfSize,
              velocityX: Math.cos(angle) * bulletSpeed,
              velocityY: Math.sin(angle) * bulletSpeed
            });
          }
        }
        break;
    }

    return bullets;
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @returns {boolean} 是否死亡
   */
  takeDamage(damage) {
    if (this.isInvincible() || this.hasShield()) {
      return false;
    }

    this.health -= damage;
    this.invincibleTime = GAME_CONFIG.PLAYER.INVINCIBLE_TIME;

    return this.health <= 0;
  }

  /**
   * 治疗生命
   * @param {number} amount - 治疗量
   */
  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  /**
   * 升级武器
   */
  upgradeWeapon() {
    this.weaponLevel = Math.min(
      this.weaponLevel + 1,
      GAME_CONFIG.WEAPON_LEVELS.length - 1
    );
    const weaponConfig = GAME_CONFIG.WEAPON_LEVELS[this.weaponLevel];
    this.weaponType = weaponConfig.type;
  }

  /**
   * 激活护盾
   * @param {number} duration - 护盾持续时间(秒)
   */
  activateShield(duration) {
    this.shieldTime = duration;
  }

  /**
   * 检查是否有护盾
   * @returns {boolean}
   */
  hasShield() {
    return this.shieldTime > 0;
  }

  /**
   * 检查是否无敌
   * @returns {boolean}
   */
  isInvincible() {
    return this.invincibleTime > 0;
  }

  /**
   * 获取碰撞盒
   * @returns {Object} 碰撞盒 {x, y, width, height}
   */
  getHitbox() {
    const scale = GAME_CONFIG.HITBOX_SCALE;
    return {
      x: this.x - (this.size / 2) * scale,
      y: this.y - (this.size / 2) * scale,
      width: this.size * scale,
      height: this.size * scale
    };
  }

  /**
   * 绘制玩家
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    const halfSize = this.size / 2;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.tiltAngle);

    // 无敌闪烁效果
    if (this.isInvincible()) {
      if (shouldFlash(this.invincibleTime, GAME_CONFIG.PLAYER.INVINCIBLE_TIME)) {
        ctx.globalAlpha = 0.3;
      }
    }

    // 绘制护盾效果
    if (this.hasShield()) {
      ctx.shadowColor = COLORS.PLAYER_SHIELD;
      ctx.shadowBlur = 20;

      ctx.strokeStyle = COLORS.PLAYER_SHIELD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, halfSize * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // 护盾内部填充
      ctx.fillStyle = 'rgba(0, 191, 255, 0.1)';
      ctx.fill();
    }

    // 绘制飞机主体
    ctx.shadowColor = COLORS.PLAYER;
    ctx.shadowBlur = 15;

    // 飞机形状(箭头向上)
    ctx.fillStyle = COLORS.PLAYER;
    ctx.beginPath();
    ctx.moveTo(0, -halfSize); // 机头
    ctx.lineTo(-halfSize, halfSize * 0.5); // 左翼
    ctx.lineTo(-halfSize * 0.3, halfSize * 0.2); // 左翼内侧
    ctx.lineTo(0, halfSize * 0.5); // 机身底部
    ctx.lineTo(halfSize * 0.3, halfSize * 0.2); // 右翼内侧
    ctx.lineTo(halfSize, halfSize * 0.5); // 右翼
    ctx.closePath();
    ctx.fill();

    // 绘制驾驶舱
    ctx.fillStyle = COLORS.PLAYER_CORE;
    ctx.beginPath();
    ctx.ellipse(0, -halfSize * 0.2, halfSize * 0.25, halfSize * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绘制机翼装饰
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.5, halfSize * 0.3);
    ctx.lineTo(-halfSize * 0.8, halfSize * 0.5);
    ctx.lineTo(-halfSize * 0.3, halfSize * 0.4);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(halfSize * 0.5, halfSize * 0.3);
    ctx.lineTo(halfSize * 0.8, halfSize * 0.5);
    ctx.lineTo(halfSize * 0.3, halfSize * 0.4);
    ctx.closePath();
    ctx.fill();

    // 绘制引擎喷射效果
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00FFFF';
    const flameHeight = halfSize * 0.5 * (0.8 + Math.random() * 0.4);
    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.15, halfSize * 0.5);
    ctx.lineTo(0, halfSize + flameHeight);
    ctx.lineTo(halfSize * 0.15, halfSize * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * 重置玩家状态
   */
  reset() {
    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.velocityX = 0;
    this.velocityY = 0;
    this.fireCooldown = 0;
    this.isFiring = false;
    this.weaponLevel = GAME_CONFIG.INITIAL.WEAPON_LEVEL;
    this.weaponType = WeaponType.SINGLE;
    this.shieldTime = 0;
    this.invincibleTime = GAME_CONFIG.PLAYER.INVINCIBLE_TIME; // 重生时短暂无敌
    this.tiltAngle = 0;
  }

  /**
   * 获取武器等级信息
   * @returns {Object} { level, maxLevel, type }
   */
  getWeaponInfo() {
    return {
      level: this.weaponLevel + 1,
      maxLevel: GAME_CONFIG.WEAPON_LEVELS.length,
      type: this.weaponType
    };
  }
}