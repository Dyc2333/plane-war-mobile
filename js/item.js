/**
 * 道具类
 * 管理游戏中的掉落道具
 */

class Item {
  /**
   * 创建道具实例
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} type - 道具类型
   */
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.size = GAME_CONFIG.ITEM.SIZE;
    this.width = this.size;
    this.height = this.size;

    this.velocityX = 0;
    this.velocityY = GAME_CONFIG.ITEM.FALL_SPEED;

    this.bobOffset = randomRange(0, Math.PI * 2); // 随机初始偏移
    this.bobTime = 0;

    this.color = ITEM_COLORS[type] || '#FFFFFF';
    this.symbol = ITEM_SYMBOLS[type] || '?';
  }

  /**
   * 更新道具状态
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    this.y += this.velocityY * dt;
    this.bobTime += dt * GAME_CONFIG.ITEM.BOB_SPEED;
  }

  /**
   * 获取当前浮动偏移
   * @returns {number}
   */
  getBobOffset() {
    return Math.sin(this.bobTime + this.bobOffset) * GAME_CONFIG.ITEM.BOB_AMOUNT;
  }

  /**
   * 绘制道具
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    const bobY = this.y + this.getBobOffset();
    const halfSize = this.size / 2;

    ctx.save();
    ctx.translate(this.x, bobY);

    // 外发光效果
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;

    // 绘制圆形背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, halfSize, 0, Math.PI * 2);
    ctx.fill();

    // 绘制边框
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, halfSize - 2, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制符号
    ctx.shadowBlur = 0;
    ctx.fillStyle = this.color;
    ctx.font = `bold ${halfSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, 0, 1);

    // 内部小光圈装饰
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, halfSize - 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * 检查道具是否飞出屏幕底部
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
    const bobY = this.y + this.getBobOffset();
    const halfSize = this.size / 2;
    return {
      x: this.x - halfSize,
      y: bobY - halfSize,
      width: this.size,
      height: this.size
    };
  }

  /**
   * 应用道具效果到玩家
   * @param {Player} player - 玩家实例
   * @returns {Object} { text: string, bombAdded: number } 效果描述和控制信息
   */
  applyToPlayer(player) {
    const effects = GAME_CONFIG.ITEM.EFFECTS[this.type];

    switch (this.type) {
      case ItemType.WEAPON:
        player.upgradeWeapon();
        return { text: '武器升级!', bombAdded: 0 };

      case ItemType.HEAL:
        player.heal(effects.healAmount);
        return { text: '生命回复!', bombAdded: 0 };

      case ItemType.BOMB:
        return { text: `炸弹 +${effects.count}`, bombAdded: effects.count };

      case ItemType.SHIELD:
        player.activateShield(effects.duration);
        return { text: `护盾 ${effects.duration}秒!`, bombAdded: 0 };

      default:
        return { text: '', bombAdded: 0 };
    }
  }
}

/**
 * 道具工厂 - 生成道具
 */
class ItemFactory {
  /**
   * 根据权重随机生成道具类型
   * @returns {string|false} 道具类型或false(不生成)
   */
  static randomType() {
    // 检查是否掉落道具
    if (Math.random() > GAME_CONFIG.ITEM.DROP_CHANCE) {
      return false;
    }

    return weightRandom(ITEM_DROP_WEIGHTS);
  }

  /**
   * 创建道具实例
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} type - 道具类型(可选,不指定则随机)
   * @returns {Item|false} 道具实例或false
   */
  static create(x, y, type) {
    const itemType = type || ItemFactory.randomType();
    if (!itemType) {
      return false;
    }

    return new Item(x, y, itemType);
  }
}

/**
 * 道具管理器
 */
class ItemManager {
  constructor(game) {
    this.game = game;
    this.items = [];
  }

  /**
   * 尝试在指定位置掉落道具
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} type - 道具类型(可选)
   */
  tryDrop(x, y, type) {
    const item = ItemFactory.create(x, y, type);
    if (item) {
      this.items.push(item);
      // 添加生成特效
      if (this.game.particleSystem) {
        this.game.particleSystem.trail(x, y, item.color);
      }
    }
  }

  /**
   * 更新所有道具
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      this.items[i].update(dt);

      // 检查是否飞出屏幕
      if (this.items[i].isOffScreen(this.game.canvas.height)) {
        this.items.splice(i, 1);
        continue;
      }

      // 检查与玩家碰撞
      const item = this.items[i];
      const hitbox = item.getHitbox();
      if (checkCollision(hitbox, this.game.player.getHitbox())) {
        const result = item.applyToPlayer(this.game.player);

        // 如果是炸弹道具，增加炸弹数量
        if (result.bombAdded > 0) {
          this.game.bombCount += result.bombAdded;
          console.log('拾取炸弹! 当前炸弹数:', this.game.bombCount);
        }

        // 添加拾取特效
        if (this.game.particleSystem) {
          this.game.particleSystem.explode(
            item.x,
            item.y,
            [item.color],
            10,
            50
          );
        }

        // 显示效果文本
        if (result.text) {
          this.game.showEffectText(item.x, item.y, result.text);
        }

        this.items.splice(i, 1);
      }
    }
  }

  /**
   * 绘制所有道具
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    for (const item of this.items) {
      item.draw(ctx);
    }
  }

  /**
   * 清空所有道具
   */
  clear() {
    this.items = [];
  }

  /**
   * 获取道具数量
   * @returns {number}
   */
  getCount() {
    return this.items.length;
  }
}