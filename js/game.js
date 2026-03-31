/**
 * 游戏主类
 * 管理游戏的所有核心逻辑和游戏循环
 */

// 游戏状态枚举
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

class Game {
  /**
   * 创建游戏实例
   * @param {HTMLCanvasElement} canvas - 画布元素
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true });

    // 设置画布尺寸
    this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
    this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;

    // 游戏状态
    this.state = GameState.MENU;
    this.score = 0;
    this.highScore = Storage.getHighScore();
    this.bombCount = GAME_CONFIG.INITIAL.BOMB_COUNT;

    // 游戏实体
    this.player = null;
    this.bulletPool = null;
    this.enemyManager = null;
    this.itemManager = null;
    this.particleSystem = null;
    this.background = null;

    // 输入处理
    this.input = new InputHandler();
    
    // 触摸处理（移动端）
    this.touchHandler = new TouchHandler(canvas);

    // 游戏循环变量
    this.lastTime = 0;
    this.accumulator = 0;

    // 按键状态标志
    this.bKeyDown = false;

    // 效果文本数组(用于显示"生命+1"等提示)
    this.effectTexts = [];

    // 暂停菜单选项
    this.pauseMenuIndex = 0;

    // 音乐控制(简单实现)
    this.muted = false;

    this.init();
  }

  /**
   * 初始化游戏
   */
  init() {
    // 创建背景
    this.background = new Background(this.canvas.width, this.canvas.height);

    // 创建玩家
    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height - 100
    );

    // 创建子弹池
    this.bulletPool = new BulletPool();

    // 创建粒子系统
    this.particleSystem = new ParticleSystem();

    // 创建敌机管理器
    this.enemyManager = new EnemyManager(this);

    // 创建道具管理器
    this.itemManager = new ItemManager(this);

    // 直接监听B键作为炸弹
    window.addEventListener('keydown', (e) => {
      if ((e.code === 'KeyB' || e.code === 'B' || e.key === 'b' || e.key === 'B') && this.state === GameState.PLAYING) {
        if (this.bombCount > 0) {
          this.useBomb();
        }
      }
    });

    // 开始游戏循环
    this.startGameLoop();
  }
  
  /**
   * 检查触摸输入
   */
  checkTouchInput() {
    if (!this.touchHandler) return;
    
    // 检查炸弹按钮
    if (this.touchHandler.isBombJustPressed() && this.state === GameState.PLAYING && this.bombCount > 0) {
      this.useBomb();
    }
  }

  /**
   * 开始游戏循环
   */
  startGameLoop() {
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    // 处理退出事件
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  }

  /**
   * 游戏主循环
   * @param {number} timestamp - 当前时间戳
   */
  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);

    // 暂停状态下也需要更新输入状态
    if (this.state === GameState.PAUSED) {
      this.input.update();
      // 检查是否继续游戏
      if (this.input.isKeyJustPressed('Escape') || this.input.isKeyJustPressed('KeyP')) {
        this.resume();
      }
      requestAnimationFrame(this.loop);
      return;
    }

    this.lastTime = timestamp;

    // 更新触摸处理器
    if (this.touchHandler) {
      this.touchHandler.update();
    }

    // 游戏状态机
    switch (this.state) {
      case GameState.MENU:
        this.updateMenu(dt);
        this.drawMenu();
        break;
      case GameState.PLAYING:
        this.updateGame(dt);
        this.drawGame();
        break;
      case GameState.GAMEOVER:
        this.updateGameover(dt);
        this.drawGameover();
        break;
    }
    
    // 绘制触摸控件（在所有状态都显示）
    if (this.touchHandler) {
      this.touchHandler.draw(this.ctx);
    }

    requestAnimationFrame(this.loop);
  }

  /**
   * 更新菜单状态
   * @param {number} dt - delta time
   */
  updateMenu(dt) {
    // 背景继续滚动
    this.background.update(dt);

    // 按 Enter 开始游戏
    if (this.input.isKeyJustPressed('Enter') || this.input.isKeyJustPressed('Space')) {
      this.startGame();
    }
  }

  /**
   * 更新游戏状态
   * @param {number} dt - delta time
   */
  updateGame(dt) {
    // 更新输入
    this.input.update();

    // 更新背景
    this.background.update(dt);

    // 更新玩家（传递触摸处理器）
    const bullets = this.player.update(dt, this.input, this.canvas.width, this.canvas.height, this.touchHandler);

    // 处理玩家射击
    if (bullets) {
      for (const bulletData of bullets) {
        this.bulletPool.get(
          bulletData.x,
          bulletData.y,
          bulletData.velocityX,
          bulletData.velocityY,
          true,
          GAME_CONFIG.BULLET.PLAYER_DAMAGE
        );
      }
    }

    // 检查炸弹使用 (按B键) - 使用keyCode
    if (this.input.isKeyJustPressed('KeyB') || this.input.isKeyJustPressed('B')) {
      if (this.bombCount > 0) {
        this.useBomb();
      }
    }

    // 检查暂停 (按Escape或P键)
    if (this.input.isKeyJustPressed('Escape') || this.input.isKeyJustPressed('KeyP')) {
      this.pause();
    }

    // 更新子弹
    this.bulletPool.update(dt);

    // 更新敌机
    this.enemyManager.update(dt);

    // 检查玩家与敌机子弹碰撞
    const enemyBullets = this.bulletPool.getEnemyBullets();
    const playerHitbox = this.player.getHitbox();

    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const bullet = enemyBullets[i];
      if (checkCollision(bullet.getHitbox(), playerHitbox)) {
        if (!this.player.hasShield() && !this.player.isInvincible()) {
          this.player.takeDamage(1);
          if (this.player.health <= 0) {
            this.gameOver();
          } else {
            // 受伤特效
            this.particleSystem.sparks(this.player.x, this.player.y, COLORS.FIRE[0]);
          }
        }
        this.bulletPool.release(bullet);
      } else if (bullet.isOffScreen(this.canvas.width, this.canvas.height)) {
        this.bulletPool.release(bullet);
      }
    }

    // 更新道具
    if (this.itemManager) {
      this.itemManager.update(dt);
    }

    // 更新粒子
    if (this.particleSystem) {
      this.particleSystem.update(dt);
    }

    // 更新效果文本
    this.updateEffectTexts(dt);
  }

  /**
   * 更新效果文本
   * @param {number} dt - delta time
   */
  updateEffectTexts(dt) {
    for (let i = this.effectTexts.length - 1; i >= 0; i--) {
      const text = this.effectTexts[i];
      text.y -= 50 * dt;
      text.life -= dt;
      text.alpha = text.life / text.maxLife;

      if (text.life <= 0) {
        this.effectTexts.splice(i, 1);
      }
    }
  }

  /**
   * 显示效果文本
   * @param {number} x - x坐标
   * @param {number} y - y坐标
   * @param {string} text - 文本内容
   * @param {string} color - 颜色
   */
  showEffectText(x, y, text, color = '#00FF00') {
    this.effectTexts.push({
      x,
      y,
      text,
      color,
      life: 1,
      maxLife: 1,
      alpha: 1
    });
  }

  /**
   * 更新游戏结束状态
   * @param {number} dt - delta time
   */
  updateGameover(dt) {
    // 背景继续滚动
    this.background.update(dt);

    // 更新粒子
    if (this.particleSystem) {
      this.particleSystem.update(dt);
    }

    // 按 R 重新开始, 按 Escape 返回菜单
    if (this.input.isKeyJustPressed('KeyR')) {
      this.restart();
    }
    if (this.input.isKeyJustPressed('Escape')) {
      this.returnToMenu();
    }
  }

  /**
   * 绘制菜单
   */
  drawMenu() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 绘制背景
    this.background.draw(ctx);

    // 绘制标题
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 标题发光效果
    drawWithGlow(ctx, '#00BFFF', 20, () => {
      ctx.fillStyle = '#00BFFF';
      ctx.font = 'bold 48px Arial';
      ctx.fillText('飞机大战', width / 2, height / 3);
    });

    // 操作说明
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.font = '16px Arial';
    ctx.fillText('方向键 / WASD - 移动', width / 2, height / 2);
    ctx.fillText('空格键 - 射击', width / 2, height / 2 + 30);
    ctx.fillText('B键 - 炸弹', width / 2, height / 2 + 60);
    ctx.fillText('P / ESC - 暂停', width / 2, height / 2 + 90);

    // 开始提示
    const flash = Math.sin(Date.now() * 0.005) > 0;
    if (flash) {
      ctx.fillStyle = COLORS.TEXT;
      ctx.font = 'bold 20px Arial';
      ctx.fillText('按 Enter 或 空格 开始游戏', width / 2, height * 0.75);
    }

    // 最高分
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.font = '14px Arial';
    ctx.fillText(`最高分: ${formatScore(this.highScore)}`, width / 2, height - 30);

    ctx.restore();
  }

  /**
   * 绘制游戏画面
   */
  drawGame() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 绘制背景
    this.background.draw(ctx);

    // 绘制敌机
    this.enemyManager.draw(ctx);

    // 绘制道具
    if (this.itemManager) {
      this.itemManager.draw(ctx);
    }

    // 绘制子弹
    this.bulletPool.draw(ctx);

    // 绘制玩家
    this.player.draw(ctx);

    // 绘制粒子
    if (this.particleSystem) {
      this.particleSystem.draw(ctx);
    }

    // 绘制效果文本
    this.drawEffectTexts(ctx);

    // 绘制HUD
    this.drawHUD(ctx);
  }

  /**
   * 绘制效果文本
   */
  drawEffectTexts() {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const text of this.effectTexts) {
      ctx.globalAlpha = text.alpha;
      ctx.fillStyle = text.color;
      ctx.font = 'bold 16px Arial';
      ctx.fillText(text.text, text.x, text.y);
    }

    ctx.restore();
  }

  /**
   * 绘制HUD界面
   */
  drawHUD(ctx) {
    const padding = 15;
    const topY = padding;

    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 顶部信息栏背景
    ctx.fillStyle = COLORS.UI_PANEL;
    ctx.fillRect(0, 0, this.canvas.width, 50);

    // 分数
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`分数: ${formatScore(this.score)}`, padding, topY);

    // 炸弹数量
    ctx.fillText(`炸弹: ${this.bombCount}`, padding + 200, topY);

    // 生命值
    const weaponInfo = this.player.getWeaponInfo();
    ctx.fillText(`武器: Lv.${weaponInfo.level}`, padding + 320, topY);

    // 生命图标
    const heartX = this.canvas.width - 150;
    for (let i = 0; i < this.player.health; i++) {
      this.drawHeart(ctx, heartX + i * 30, topY, 20);
    }

    // 护盾状态
    if (this.player.hasShield()) {
      ctx.fillStyle = '#00BFFF';
      ctx.font = '14px Arial';
      ctx.fillText(`护盾: ${Math.ceil(this.player.shieldTime)}s`, heartX - 80, topY + 3);
    }

    ctx.restore();
  }

  /**
   * 绘制爱心图标
   */
  drawHeart(ctx, x, y, size) {
    ctx.save();
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(x + size / 2, y + size / 2);
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    ctx.bezierCurveTo(x, y + size / 2, x + size / 2, y + size * 0.75, x + size / 2, y + size);
    ctx.bezierCurveTo(x + size / 2, y + size * 0.75, x + size, y + size / 2, x + size, y + size / 4);
    ctx.bezierCurveTo(x + size, y, x + size / 2, y, x + size / 2, y + size / 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 绘制游戏结束画面
   */
  drawGameover() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    // 绘制粒子
    if (this.particleSystem) {
      this.particleSystem.draw(ctx);
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 游戏结束标题
    ctx.fillStyle = '#FF4444';
    ctx.font = 'bold 48px Arial';
    ctx.fillText('游戏结束', width / 2, height / 3);

    // 最终分数
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = 'bold 32px Arial';
    ctx.fillText(formatScore(this.score), width / 2, height / 2);

    // 最高分
    if (this.score >= this.highScore && this.score > 0) {
      ctx.fillStyle = '#FFD700'; // 金色
      ctx.font = 'bold 20px Arial';
      ctx.fillText('新纪录!', width / 2, height / 2 + 40);
    }
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.font = '16px Arial';
    ctx.fillText(`最高分: ${formatScore(this.highScore)}`, width / 2, height / 2 + 70);

    // 操作提示
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '18px Arial';
    const flash = Math.sin(Date.now() * 0.005) > 0;
    if (flash) {
      ctx.fillStyle = '#00BFFF';
    }
    ctx.fillText('按 R 重新开始 | 按 ESC 返回菜单', width / 2, height * 0.75);

    ctx.restore();
  }

  /**
   * 开始游戏
   */
  startGame() {
    this.state = GameState.PLAYING;
    this.score = 0;
    this.bombCount = GAME_CONFIG.INITIAL.BOMB_COUNT;
    this.player.reset();
    this.enemyManager.clear();
    this.bulletPool.clear();
    this.itemManager.clear();
    this.particleSystem.clear();
    this.effectTexts = [];
    this.background.reset();
    this.enemyManager.resetDifficulty();
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.state !== GameState.PLAYING) return;
    this.state = GameState.PAUSED;
    this.drawPause();
  }

  /**
   * 继续游戏
   */
  resume() {
    this.state = GameState.PLAYING;
    this.lastTime = performance.now();
  }

  /**
   * 绘制暂停界面
   */
  drawPause() {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 绘制半透明背景(保持游戏画面)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 暂停标题
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = 'bold 40px Arial';
    ctx.fillText('暂停', width / 2, height / 3);

    // 当前分数
    ctx.fillStyle = COLORS.TEXT_DARK;
    ctx.font = '24px Arial';
    ctx.fillText(`分数: ${formatScore(this.score)}`, width / 2, height / 2);

    // 继续提示
    ctx.fillStyle = '#00BFFF';
    ctx.font = '18px Arial';
    ctx.fillText('按 P 或 ESC 继续', width / 2, height * 0.65);

    ctx.restore();
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.state = GameState.GAMEOVER;

    // 更新最高分
    if (this.score > this.highScore) {
      this.highScore = this.score;
      Storage.saveHighScore(this.highScore);
    }

    // 添加玩家死亡爆炸效果
    this.particleSystem.explode(
      this.player.x,
      this.player.y,
      COLORS.EXPLOSION,
      30,
      150
    );
  }

  /**
   * 重新开始游戏
   */
  restart() {
    this.startGame();
  }

  /**
   * 返回主菜单
   */
  returnToMenu() {
    this.state = GameState.MENU;
    this.background.reset();
  }

  /**
   * 使用炸弹
   */
  useBomb() {
    if (this.bombCount <= 0) return;

    console.log('使用炸弹! 剩余:', this.bombCount - 1);
    this.bombCount--;

    // 清除所有敌机 - 反向遍历避免索引问题
    for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemyManager.enemies[i];
      // 添加分数
      this.addScore(enemy.score);
      // 播放爆炸特效
      if (this.particleSystem) {
        this.particleSystem.explode(enemy.x, enemy.y, COLORS.EXPLOSION, 20, 80);
      }
      // 尝试掉落道具
      if (this.itemManager) {
        this.itemManager.tryDrop(enemy.x, enemy.y);
      }
    }
    // 清空敌机数组
    this.enemyManager.enemies = [];

    // 清除所有敌机子弹
    const enemyBullets = this.bulletPool.getEnemyBullets().slice();
    for (const bullet of enemyBullets) {
      this.bulletPool.release(bullet);
    }

    // 全屏爆炸特效
    this.particleSystem.explode(
      this.canvas.width / 2,
      this.canvas.height / 2,
      COLORS.EXPLOSION,
      50,
      200
    );

    // 屏幕闪烁效果
    this.showEffectText(this.canvas.width / 2, this.canvas.height / 2, 'BOMB!', '#FF00FF');
  }

  /**
   * 增加分数
   * @param {number} points - 分数
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * 处理页面退出
   * @param {BeforeUnloadEvent} e
   */
  handleBeforeUnload(e) {
    if (this.state === GameState.PLAYING) {
      e.preventDefault();
      e.returnValue = '';
    }
  }

  /**
   * 获取游戏状态
   * @returns {Object} 游戏状态信息
   */
  getState() {
    return {
      state: this.state,
      score: this.score,
      highScore: this.highScore,
      bombCount: this.bombCount,
      playerHealth: this.player ? this.player.health : 0
    };
  }

  /**
   * 设置画布尺寸
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.background.resize(width, height);
  }
}

// 导出GameState供外部使用
Game.State = GameState;