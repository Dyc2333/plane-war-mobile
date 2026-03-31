/**
 * 敌机类
 * 管理游戏中各类敌机的行为
 */

class Enemy {
  /**
   * 创建敌机实例
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} type - 敌机类型
   * @param {string} pattern - 飞行模式
   */
  constructor(x, y, type, pattern) {
    this.x = x;
    this.y = y;
    // 统一使用小写类型，然后转换为配置中的大写键
    this.type = type || EnemyType.NORMAL;
    this.pattern = pattern || FlyPattern.STRAIGHT;

    // 将小写类型转换为配置中的大写键
    const typeKey = this.type.toUpperCase();
    const config = GAME_CONFIG.ENEMY[typeKey];

    this.health = config.health;
    this.maxHealth = config.health;
    this.baseSpeed = config.speed;
    this.speed = config.speed;
    this.score = config.score;
    this.size = config.size;
    this.width = this.size;
    this.height = this.size;
    this.damage = config.damage;
    this.shootInterval = config.shootInterval;

    this.patternTime = 0;
    this.startX = x;
    this.startY = y;
    this.shootTimer = 0;

    // 设置颜色
    this.color = COLORS[`ENEMY_${this.type.toUpperCase()}`] || COLORS.ENEMY_NORMAL;

    // 受伤闪烁
    this.hitFlashTime = 0;
  }

  /**
   * 更新敌机状态
   * @param {number} dt - delta time(秒)
   * @param {Object} playerTarget - 玩家目标位置 {x, y}
   */
  update(dt, playerTarget) {
    this.patternTime += dt;

    // 更新受伤闪烁
    if (this.hitFlashTime > 0) {
      this.hitFlashTime = Math.max(0, this.hitFlashTime - dt);
    }

    // 根据飞行模式计算位置
    this.updatePattern(dt, playerTarget);

    // 射击逻辑
    if (this.shootInterval > 0) {
      this.shootTimer += dt;
    }

    // 限制Y轴边界(让敌机向下飞出屏幕)
    if (this.y < -this.size) {
      this.y = -this.size;
    }
  }

  /**
   * 根据飞行模式更新位置
   * @param {number} dt - delta time(秒)
   * @param {Object} playerTarget - 玩家目标位置 {x, y}
   */
  updatePattern(dt, playerTarget) {
    switch (this.pattern) {
      case FlyPattern.STRAIGHT:
        // 直线向下
        this.y += this.speed * dt;
        break;

      case FlyPattern.WAVE:
        // 波浪运动
        this.y += this.speed * dt;
        this.x = this.startX + Math.sin(this.patternTime * 3) * 100;
        break;

      case FlyPattern.TRACK:
        // 追踪玩家(缓慢转向)
        const dx = playerTarget ? playerTarget.x - this.x : 0;
        const dy = playerTarget ? playerTarget.y - this.y : 0;
        const angle = Math.atan2(dy, dx);
        const trackSpeed = this.speed * 0.7; // 追踪速度较慢
        this.x += Math.cos(angle) * trackSpeed * dt;
        this.y += Math.sin(angle) * trackSpeed * dt;
        break;
    }
  }

  /**
   * 检查是否可以射击
   * @returns {boolean}
   */
  canShoot() {
    return this.shootInterval > 0 && this.shootTimer >= this.shootInterval;
  }

  /**
   * 重置射击计时器
   */
  resetShootTimer() {
    this.shootTimer = 0;
  }

  /**
   * 射击 - 返回要发射的子弹数组
   * @returns {Array} 子弹参数数组
   */
  shoot() {
    this.resetShootTimer();
    const bullets = [];
    const speed = GAME_CONFIG.BULLET.ENEMY_SPEED;

    switch (this.type) {
      case EnemyType.NORMAL:
      case EnemyType.FAST:
        // 普通和快速敌机不射击
        break;

      case EnemyType.HEAVY:
        // 重型敌机向下射击
        bullets.push({
          x: this.x,
          y: this.y + this.size / 2,
          velocityX: 0,
          velocityY: speed
        });
        break;
    }

    return bullets;
  }

  /**
   * 受到伤害
   * @param {number} damage - 伤害值
   * @returns {boolean} 是否被击毁
   */
  takeDamage(damage) {
    this.health -= damage;
    this.hitFlashTime = 0.1; // 闪烁0.1秒
    return this.health <= 0;
  }

  /**
   * 检查是否死亡
   * @returns {boolean}
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * 检查是否飞出屏幕
   * @param {number} canvasHeight - 画布高度
   * @returns {boolean}
   */
  isOffScreen(canvasHeight) {
    return this.y > canvasHeight + this.size;
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
   * 绘制敌机
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} canvasWidth - 画布宽度(用于图案效果)
   * @param {number} canvasHeight - 画布高度
   */
  draw(ctx, canvasWidth, canvasHeight) {
    const halfSize = this.size / 2;

    ctx.save();
    ctx.translate(this.x, this.y);

    // 受伤闪烁效果
    if (this.hitFlashTime > 0) {
      ctx.globalAlpha = 0.5;
    }

    // 绘制敌机形状(箭头向下)
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;

    // 不同的敌机形状
    switch (this.type) {
      case EnemyType.NORMAL:
        this.drawNormalEnemy(ctx, halfSize);
        break;
      case EnemyType.FAST:
        this.drawFastEnemy(ctx, halfSize);
        break;
      case EnemyType.HEAVY:
        this.drawHeavyEnemy(ctx, halfSize);
        break;
    }

    // 绘制核心
    ctx.fillStyle = COLORS.ENEMY_CORE;
    ctx.beginPath();
    ctx.arc(0, 0, halfSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 发光效果
    ctx.restore();

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 绘制普通敌机
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} halfSize
   */
  drawNormalEnemy(ctx, halfSize) {
    ctx.beginPath();
    ctx.moveTo(0, halfSize);
    ctx.lineTo(-halfSize, -halfSize * 0.5);
    ctx.lineTo(-halfSize * 0.3, -halfSize * 0.3);
    ctx.lineTo(0, -halfSize);
    ctx.lineTo(halfSize * 0.3, -halfSize * 0.3);
    ctx.lineTo(halfSize, -halfSize * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制快速敌机
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} halfSize
   */
  drawFastEnemy(ctx, halfSize) {
    ctx.beginPath();
    ctx.moveTo(0, halfSize);
    ctx.lineTo(-halfSize, -halfSize * 0.7);
    ctx.lineTo(0, -halfSize * 0.3);
    ctx.lineTo(halfSize, -halfSize * 0.7);
    ctx.closePath();
    ctx.fill();
  }

  /**
   * 绘制重型敌机
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} halfSize
   */
  drawHeavyEnemy(ctx, halfSize) {
    // 更大的形状
    ctx.beginPath();
    ctx.moveTo(0, halfSize * 1.2);
    ctx.lineTo(-halfSize, -halfSize * 0.5);
    ctx.lineTo(-halfSize * 0.8, -halfSize * 0.8);
    ctx.lineTo(-halfSize * 0.3, -halfSize);
    ctx.lineTo(0, -halfSize * 0.8);
    ctx.lineTo(halfSize * 0.3, -halfSize);
    ctx.lineTo(halfSize * 0.8, -halfSize * 0.8);
    ctx.lineTo(halfSize, -halfSize * 0.5);
    ctx.closePath();
    ctx.fill();

    // 装饰线条
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.5, -halfSize * 0.2);
    ctx.lineTo(halfSize * 0.5, -halfSize * 0.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.3, halfSize * 0.3);
    ctx.lineTo(halfSize * 0.3, halfSize * 0.3);
    ctx.stroke();
  }

  /**
   * 绘制生命条
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   * @param {number} offsetX - 偏移X
   * @param {number} offsetY - 偏移Y
   */
  drawHealthBar(ctx, offsetX = 0, offsetY = 0) {
    if (this.health >= this.maxHealth) return;

    const barWidth = this.size;
    const barHeight = 4;
    const x = this.x - barWidth / 2 + offsetX;
    const y = this.y - this.size / 2 - 10 + offsetY;

    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 血量
    const healthPercent = this.health / this.maxHealth;
    const healthColor = healthPercent > 0.5 ? '#00FF00' : healthPercent > 0.25 ? '#FFFF00' : '#FF0000';
    ctx.fillStyle = healthColor;
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
  }
}

/**
 * 敌机管理器
 */
class EnemyManager {
  constructor(game) {
    this.game = game;
    this.enemies = [];
    this.spawnTimer = 0;
    this.spawnInterval = GAME_CONFIG.DIFFICULTY.BASE_SPAWN_RATE;
    this.difficultyMultiplier = 1;
  }

  /**
   * 更新敌机管理器
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    // 更新难度
    this.difficultyMultiplier += GAME_CONFIG.DIFFICULTY.INCREASE_RATE;

    // 计算生成间隔
    this.spawnInterval = Math.max(
      GAME_CONFIG.DIFFICULTY.MIN_SPAWN_RATE,
      GAME_CONFIG.DIFFICULTY.BASE_SPAWN_RATE - (this.difficultyMultiplier - 1) * 0.3
    );

    // 生成新敌机
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval && this.enemies.length < GAME_CONFIG.DIFFICULTY.MAX_SPAWN_COUNT) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // 更新所有敌机
    const playerTarget = this.game.player ? { x: this.game.player.x, y: this.game.player.y } : null;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(dt, playerTarget);

      // 检查是否射击
      if (enemy.canShoot()) {
        const bullets = enemy.shoot();
        for (const bulletData of bullets) {
          this.game.bulletPool.get(
            bulletData.x,
            bulletData.y,
            bulletData.velocityX,
            bulletData.velocityY,
            false,
            enemy.damage
          );
        }
      }

      // 检查是否飞出屏幕
      if (enemy.isOffScreen(this.game.canvas.height)) {
        this.enemies.splice(i, 1);
        continue;
      }

      // 检查与玩家碰撞
      const enemyHitbox = enemy.getHitbox();
      const playerHitbox = this.game.player.getHitbox();
      if (checkCollision(enemyHitbox, playerHitbox)) {
        // 敌机与玩家碰撞
        if (!this.game.player.hasShield() && !this.game.player.isInvincible()) {
          this.game.player.takeDamage(1);
          // 敌机也受到伤害
          if (enemy.takeDamage(1)) {
            this.destroyEnemy(i);
          }
        } else {
          // 护盾保护下敌机直接销毁
          this.destroyEnemy(i);
        }
        continue;
      }

      // 检查与玩家子弹碰撞
      const playerBullets = this.game.bulletPool.getPlayerBullets();
      for (let j = playerBullets.length - 1; j >= 0; j--) {
        const bullet = playerBullets[j];
        if (checkCollision(bullet.getHitbox(), enemyHitbox)) {
          // 子弹击中敌机
          if (enemy.takeDamage(bullet.damage)) {
            // 敌机被击毁
            this.destroyEnemy(i);
            break;
          } else {
            // 敌机受伤特效
            if (this.game.particleSystem) {
              this.game.particleSystem.sparks(bullet.x, bullet.y, COLORS.EXPLOSION[0]);
            }
          }
          this.game.bulletPool.release(bullet);
        } else if (bullet.isOffScreen(this.game.canvas.width, this.game.canvas.height)) {
          this.game.bulletPool.release(bullet);
        }
      }
    }
  }

  /**
   * 生成敌机
   */
  spawnEnemy() {
    const x = randomRange(50, this.game.canvas.width - 50);
    const y = -50;

    // 根据难度选择敌机类型
    const type = this.selectEnemyType();

    // 随机飞行模式
    const patterns = [FlyPattern.STRAIGHT, FlyPattern.WAVE, FlyPattern.TRACK];
    const pattern = type === EnemyType.FAST ? FlyPattern.STRAIGHT : weightRandom({
      [FlyPattern.STRAIGHT]: 40,
      [FlyPattern.WAVE]: 35,
      [FlyPattern.TRACK]: 25
    });

    const enemy = new Enemy(x, y, type, pattern);
    this.enemies.push(enemy);
  }

  /**
   * 选择敌机类型
   * @returns {string}
   */
  selectEnemyType() {
    const difficulty = this.difficultyMultiplier;

    // 随着难度提升，增加强敌的概率
    const weights = {
      [EnemyType.NORMAL]: Math.max(20, 60 - difficulty * 15),
      [EnemyType.FAST]: 25 + difficulty * 5,
      [EnemyType.HEAVY]: Math.min(30, 15 + difficulty * 2)
    };

    return weightRandom(weights);
  }

  /**
   * 销毁敌机
   * @param {number} index - 敌机索引
   */
  destroyEnemy(index) {
    if (index < 0 || index >= this.enemies.length) return;

    const enemy = this.enemies[index];

    // 添加分数
    this.game.addScore(enemy.score);

    // 播放爆炸特效
    if (this.game.particleSystem) {
      this.game.particleSystem.explode(enemy.x, enemy.y, COLORS.EXPLOSION, 20, 80);
    }

    // 尝试掉落道具
    if (this.game.itemManager) {
      this.game.itemManager.tryDrop(enemy.x, enemy.y);
    }

    // 移除敌机
    this.enemies.splice(index, 1);
  }

  /**
   * 绘制所有敌机
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    for (const enemy of this.enemies) {
      enemy.draw(ctx, this.game.canvas.width, this.game.canvas.height);
      enemy.drawHealthBar(ctx);
    }
  }

  /**
   * 清空所有敌机
   */
  clear() {
    // 销毁所有敌机时添加爆炸特效
    for (const enemy of this.enemies) {
      if (this.game.particleSystem) {
        this.game.particleSystem.explode(enemy.x, enemy.y, COLORS.EXPLOSION, 8, 50);
      }
    }
    this.enemies = [];
  }

  /**
   * 获取敌机数量
   * @returns {number}
   */
  getCount() {
    return this.enemies.length;
  }

  /**
   * 重置难度
   */
  resetDifficulty() {
    this.difficultyMultiplier = 1;
    this.spawnInterval = GAME_CONFIG.DIFFICULTY.BASE_SPAWN_RATE;
  }
}