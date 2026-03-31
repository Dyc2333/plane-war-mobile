/**
 * 粒子效果类
 * 用于爆炸、火花等视觉特效
 */

class Particle {
  /**
   * 创建粒子实例
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {number} velocityX - x方向速度
   * @param {number} velocityY - y方向速度
   * @param {string} color - 粒子颜色
   * @param {number} life - 生命周期(秒)
   * @param {number} size - 粒子大小
   */
  constructor(x, y, velocityX, velocityY, color, life, size) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = size || randomRange(2, 6);
  }

  /**
   * 更新粒子状态
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
    this.velocityY += GAME_CONFIG.PARTICLE.GRAVITY * dt;
    this.life -= dt;
  }

  /**
   * 绘制粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 检查粒子是否结束
   * @returns {boolean}
   */
  isDead() {
    return this.life <= 0;
  }
}

/**
 * 粒子系统 - 管理所有粒子
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * 添加爆炸效果
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {Array} colors - 颜色数组
   * @param {number} count - 粒子数量
   * @param {number} speed - 扩散速度
   */
  explode(x, y, colors, count, speed) {
    const particleColors = colors || COLORS.EXPLOSION;
    const particleCount = count || GAME_CONFIG.PARTICLE.COUNT;
    const spread = speed || GAME_CONFIG.PARTICLE.SPREAD;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + randomRange(-0.5, 0.5);
      const particleSpeed = randomRange(spread * 0.5, spread);
      const velocityX = Math.cos(angle) * particleSpeed;
      const velocityY = Math.sin(angle) * particleSpeed;
      const color = particleColors[randomInt(0, particleColors.length - 1)];

      this.particles.push(new Particle(
        x, y,
        velocityX, velocityY,
        color,
        GAME_CONFIG.PARTICLE.LIFE + randomRange(-0.2, 0.2)
      ));
    }
  }

  /**
   * 添加火花效果
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} color - 颜色
   * @param {number} count - 粒子数量
   */
  sparks(x, y, color, count) {
    const particleCount = count || 5;
    for (let i = 0; i < particleCount; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(30, 80);
      const velocityX = Math.cos(angle) * speed;
      const velocityY = Math.sin(angle) * speed;

      this.particles.push(new Particle(
        x, y,
        velocityX, velocityY,
        color,
        randomRange(0.1, 0.3),
        randomRange(1, 3)
      ));
    }
  }

  /**
   * 跟踪效果粒子(用于道具收集)
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} color - 颜色
   */
  trail(x, y, color) {
    this.particles.push(new Particle(
      x, y,
      0, 0,
      color,
      randomRange(0.3, 0.5),
      randomRange(2, 4)
    ));
  }

  /**
   * 更新所有粒子
   * @param {number} dt - delta time(秒)
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update(dt);
      if (this.particles[i].isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 绘制所有粒子
   * @param {CanvasRenderingContext2D} ctx - 画布上下文
   */
  draw(ctx) {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }

  /**
   * 清空所有粒子
   */
  clear() {
    this.particles = [];
  }

  /**
   * 获取粒子数量
   * @returns {number}
   */
  getCount() {
    return this.particles.length;
  }
}