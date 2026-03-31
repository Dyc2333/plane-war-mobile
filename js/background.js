/**
 * 背景类
 * 管理星空滚动背景效果
 */

class Background {
  /**
   * 创建背景实例
   * @param {number} width - 画布宽度
   * @param {number} height - 画布高度
   */
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.stars = [];
    this.speed = 1;
    this.yOffset = 0;
    this.initStars();
  }

  /**
   * 初始化星星
   */
  initStars() {
    this.stars = [];
    for (let i = 0; i < GAME_CONFIG.BACKGROUND.STAR_COUNT; i++) {
      this.stars.push(this.createStar());
    }
  }

  /**
   * 创建单个星星
   * @returns {Object} 星星对象
   */
  createStar() {
    return {
      x: randomRange(0, this.width),
      y: randomRange(0, this.height),
      size: randomRange(0.5, 2),
      speed: GAME_CONFIG.BACKGROUND.STAR_SPEED_BASE +
              randomRange(-GAME_CONFIG.BACKGROUND.STAR_SPEED_VARIANCE / 2,
                        GAME_CONFIG.BACKGROUND.STAR_SPEED_VARIANCE / 2),
      brightness: randomRange(0.3, 1)
    };
  }

  /**
   * 设置滚动速度
   * @param {number} speedMultiplier - 速度倍数
   */
  setSpeed(speedMultiplier) {
    this.speed = speedMultiplier;
  }

  /**
   * 更新背景
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    this.yOffset += this.speed * dt * 100;

    for (const star of this.stars) {
      star.y += star.speed * this.speed * dt;
      star.y += dt * 50; // 基础向下移动速度

      // 星星移出屏幕后重置到顶部
      if (star.y > this.height) {
        star.y = -5;
        star.x = randomRange(0, this.width);
      }
    }
  }

  /**
   * 绘制背景
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    // 填充背景色
    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, this.width, this.height);

    // 绘制星星
    for (const star of this.stars) {
      const alpha = star.brightness * (0.5 + 0.5 * Math.sin(Date.now() * 0.003 + star.x));
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 绘制深色渐变效果(让背景有层次感)
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  /**
   * 重置背景
   */
  reset() {
    this.yOffset = 0;
    this.speed = 1;
    this.initStars();
  }

  /**
   * 调整画布尺寸
   * @param {number} width - 新宽度
   * @param {number} height - 新高度
   */
  resize(width, height) {
    this.width = width;
    this.height = height;
    this.initStars();
  }
}