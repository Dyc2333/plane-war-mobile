/**
 * 子弹类
 * 管理玩家的子弹和敌机的子弹
 */

class Bullet {
  /**
   * 创建子弹实例
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} velocityX - x方向速度
   * @param {number} velocityY - y方向速度
   * @param {boolean} isPlayerBullet - 是否为玩家子弹
   * @param {number} damage - 伤害值
   * @param {number} size - 子弹大小
   */
  constructor(x, y, velocityX, velocityY, isPlayerBullet, damage, size) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.isPlayerBullet = isPlayerBullet;
    this.damage = damage !== undefined ? damage : GAME_CONFIG.BULLET.PLAYER_DAMAGE;

    const bulletSize = size || (isPlayerBullet
      ? GAME_CONFIG.BULLET.PLAYER_SIZE
      : GAME_CONFIG.BULLET.ENEMY_SIZE);
    this.size = bulletSize;
    this.width = bulletSize;
    this.height = bulletSize * 2; // 子弹形状是长方形

    this.color = isPlayerBullet ? COLORS.BULLET_PLAYER : COLORS.BULLET_ENEMY;
  }

  /**
   * 更新子弹位置
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
  }

  /**
   * 绘制子弹
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    ctx.save();

    if (this.isPlayerBullet) {
      // 玩家子弹: 发光效果
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = this.color;

      // 绘制长条形子弹
      ctx.beginPath();
      ctx.roundRect(this.x - this.size / 2, this.y - this.height / 2, this.size, this.height, 3);
      ctx.fill();

      // 中心白色核心
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(this.x - this.size / 4, this.y - this.height / 3, this.size / 2, this.height / 1.5, 1);
      ctx.fill();
    } else {
      // 敌机子弹: 橙红色
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 5;
      ctx.fillStyle = this.color;

      // 绘制圆形子弹
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      // 内部红色核心
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * 检查子弹是否飞出屏幕
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   * @param {number} margin - 边距缓冲
   * @returns {boolean}
   */
  isOffScreen(canvasWidth, canvasHeight, margin = 50) {
    return this.y < -margin ||
           this.y > canvasHeight + margin ||
           this.x < -margin ||
           this.x > canvasWidth + margin;
  }

  /**
   * 获取碰撞盒(用于碰撞检测)
   * @returns {Object} 碰撞盒 {x, y, width, height}
   */
  getHitbox() {
    const scale = GAME_CONFIG.HITBOX_SCALE;
    return {
      x: this.x - (this.size / 2) * scale,
      y: this.y - (this.height / 2) * scale,
      width: this.size * scale,
      height: this.height * scale
    };
  }
}

/**
 * 子弹池 - 对象池模式管理子弹
 */
class BulletPool {
  constructor() {
    this.pool = [];
    this.activeBullets = [];
  }

  /**
   * 获取子弹(从池中或创建新的)
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} velocityX - x方向速度
   * @param {number} velocityY - y方向速度
   * @param {boolean} isPlayerBullet - 是否为玩家子弹
   * @param {number} damage - 伤害值
   * @param {number} size - 子弹大小
   * @returns {Bullet} 子弹实例
   */
  get(x, y, velocityX, velocityY, isPlayerBullet, damage, size) {
    let bullet = this.pool.pop();
    if (!bullet) {
      bullet = new Bullet(x, y, velocityX, velocityY, isPlayerBullet, damage, size);
    } else {
      bullet.x = x;
      bullet.y = y;
      bullet.velocityX = velocityX;
      bullet.velocityY = velocityY;
      bullet.isPlayerBullet = isPlayerBullet;
      bullet.damage = damage !== undefined ? damage : GAME_CONFIG.BULLET.PLAYER_DAMAGE;
      bullet.size = size || (isPlayerBullet ? GAME_CONFIG.BULLET.PLAYER_SIZE : GAME_CONFIG.BULLET.ENEMY_SIZE);
      bullet.width = bullet.size;
      bullet.height = bullet.size * 2;
      bullet.color = isPlayerBullet ? COLORS.BULLET_PLAYER : COLORS.BULLET_ENEMY;
    }
    this.activeBullets.push(bullet);
    return bullet;
  }

  /**
   * 回收子弹到池中
   * @param {Bullet} bullet - 要回收的子弹
   */
  release(bullet) {
    const index = this.activeBullets.indexOf(bullet);
    if (index !== -1) {
      this.activeBullets.splice(index, 1);
      this.pool.push(bullet);
    }
  }

  /**
   * 更新所有子弹
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      this.activeBullets[i].update(dt);
    }
  }

  /**
   * 绘制所有子弹
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    for (const bullet of this.activeBullets) {
      bullet.draw(ctx);
    }
  }

  /**
   * 获取所有活跃的子弹
   * @returns {Array<Bullet>}
   */
  getActiveBullets() {
    return this.activeBullets;
  }

  /**
   * 获取玩家的子弹
   * @returns {Array<Bullet>}
   */
  getPlayerBullets() {
    return this.activeBullets.filter(b => b.isPlayerBullet);
  }

  /**
   * 获取敌机的子弹
   * @returns {Array<Bullet>}
   */
  getEnemyBullets() {
    return this.activeBullets.filter(b => !b.isPlayerBullet);
  }

  /**
   * 清空所有子弹
   */
  clear() {
    this.pool = this.pool.concat(this.activeBullets);
    this.activeBullets = [];
  }

  /**
   * 清空整个池
   */
  destroy() {
    this.pool = [];
    this.activeBullets = [];
  }

  /**
   * 移除飞出屏幕的子弹
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   */
  removeOffScreen(canvasWidth, canvasHeight) {
    for (let i = this.activeBullets.length - 1; i >= 0; i--) {
      if (this.activeBullets[i].isOffScreen(canvasWidth, canvasHeight)) {
        this.release(this.activeBullets[i]);
      }
    }
  }
}