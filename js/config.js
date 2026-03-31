/**
 * 游戏配置模块
 * 包含所有游戏常量和配置参数
 */

// 颜色主题
const COLORS = {
  // 玩家
  PLAYER: '#00BFFF',
  PLAYER_CORE: '#FFFFFF',
  PLAYER_SHIELD: 'rgba(0, 191, 255, 0.3)',
  PLAYER_INVINCIBLE: 'rgba(255, 255, 255, 0.7)',

  // 敌机
  ENEMY_NORMAL: '#FF4444',
  ENEMY_FAST: '#FFB800',
  ENEMY_HEAVY: '#8844FF',
  ENEMY_CORE: '#FFFFFF',

  // 子弹
  BULLET_PLAYER: '#00FFFF',
  BULLET_ENEMY: '#FF6600',

  // 道具
  ITEM_WEAPON: '#00FF00',
  ITEM_HEAL: '#FF00FF',
  ITEM_BOMB: '#FFFF00',
  ITEM_SHIELD: '#00BFFF',

  // UI
  TEXT: '#FFFFFF',
  TEXT_DARK: '#CCCCCC',
  BACKGROUND: '#0a0a1a',
  UI_PANEL: 'rgba(0, 0, 0, 0.7)',
  BUTTON: '#00BFFF',
  BUTTON_HOVER: '#009ACD',

  // 粒子
  FIRE: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
  EXPLOSION: ['#FF0000', '#FF4400', '#FF6600', '#FFFF00']
};

// 敌机类型枚举
const EnemyType = {
  NORMAL: 'normal',
  FAST: 'fast',
  HEAVY: 'heavy'
};

// 道具类型枚举
const ItemType = {
  WEAPON: 'weapon',
  HEAL: 'heal',
  BOMB: 'bomb',
  SHIELD: 'shield'
};

// 武器类型枚举
const WeaponType = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple'
};

// 飞行模式枚举
const FlyPattern = {
  STRAIGHT: 'straight',
  WAVE: 'wave',
  TRACK: 'track'
};

// 游戏配置
const GAME_CONFIG = {
  // 帧率
  TARGET_FPS: 60,
  FIXED_DT: 1 / 60,

  // 画布尺寸
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 720,

  // 玩家配置
  PLAYER: {
    SPEED: 300,                  // 移动速度
    SIZE: 40,                    // 飞机尺寸
    MAX_HEALTH: 3,               // 最大生命
    INVINCIBLE_TIME: 2,          // 无敌时间(秒)
    FIRE_COOLDOWN: 0.15,         // 射击冷却(秒)
    TILT_FACTOR: 0.002,          // 移动倾斜系数
    MAX_TILT: 0.3                // 最大倾斜角度(弧度)
  },

  // 敌机配置
  ENEMY: {
    NORMAL: {
      health: 1,
      speed: 100,
      score: 100,
      size: 30,
      shootInterval: 0,
      damage: 1
    },
    FAST: {
      health: 1,
      speed: 200,
      score: 200,
      size: 25,
      shootInterval: 0,
      damage: 1
    },
    HEAVY: {
      health: 5,
      speed: 60,
      score: 500,
      size: 50,
      shootInterval: 1.5,
      damage: 1
    }
  },

  // 子弹配置
  BULLET: {
    PLAYER_SPEED: 600,
    ENEMY_SPEED: 200,
    PLAYER_SIZE: 6,
    ENEMY_SIZE: 8,
    PLAYER_DAMAGE: 1
  },

  // 武器配置
  WEAPON_LEVELS: [
    { type: WeaponType.SINGLE, count: 1, spread: 0 },
    { type: WeaponType.DOUBLE, count: 2, spread: 15 },
    { type: WeaponType.TRIPLE, count: 3, spread: 10 },
    { type: WeaponType.TRIPLE, count: 5, spread: 8 }
  ],

  // 道具配置
  ITEM: {
    SIZE: 30,
    DROP_CHANCE: 0.2,           // 敌机死亡掉落概率
    FALL_SPEED: 100,
    BOB_SPEED: 3,
    BOB_AMOUNT: 5,
    EFFECTS: {
      [ItemType.WEAPON]: { duration: 0 },      // 永久
      [ItemType.HEAL]: { healAmount: 1 },
      [ItemType.BOMB]: { count: 1 },
      [ItemType.SHIELD]: { duration: 5 }
    }
  },

  // 粒子配置
  PARTICLE: {
    COUNT: 15,                  // 爆炸粒子数量
    LIFE: 0.5,                  // 粒子生命周期(秒)
    SPREAD: 100,                // 扩散速度
    GRAVITY: 0,                 // 重力
    FADE_RATE: 2                // 消失速率
  },

  // 难度配置
  DIFFICULTY: {
    BASE_SPAWN_RATE: 1.5,       // 基础敌机生成间隔(秒)
    MIN_SPAWN_RATE: 0.5,        // 最小生成间隔
    INCREASE_RATE: 0.001,       // 每帧难度提升系数
    MAX_SPAWN_COUNT: 15         // 最大同时存在的敌机数
  },

  // 初始配置
  INITIAL: {
    BOMB_COUNT: 3,
    WEAPON_LEVEL: 0
  },

  // 背景配置
  BACKGROUND: {
    STAR_COUNT: 100,
    STAR_SPEED_BASE: 50,
    STAR_SPEED_VARIANCE: 75,
    PARALLAX_FACTOR: 0.5
  },

  // 碰撞命中框缩小系数(0-1)
  HITBOX_SCALE: 0.7
};

// 道具掉落权重配置
const ITEM_DROP_WEIGHTS = {
  [ItemType.WEAPON]: 35,        // 35%
  [ItemType.HEAL]: 25,          // 25%
  [ItemType.BOMB]: 15,          // 15%
  [ItemType.SHIELD]: 25         // 25%
};

// 敌机生成权重配置 (随难度增加会调整)
const ENEMY_SPAWN_WEIGHTS = {
  [EnemyType.NORMAL]: 60,
  [EnemyType.FAST]: 25,
  [EnemyType.HEAVY]: 15
};

// 道具颜色映射
const ITEM_COLORS = {
  [ItemType.WEAPON]: COLORS.ITEM_WEAPON,
  [ItemType.HEAL]: COLORS.ITEM_HEAL,
  [ItemType.BOMB]: COLORS.ITEM_BOMB,
  [ItemType.SHIELD]: COLORS.ITEM_SHIELD
};

// 道具图标/符号
const ITEM_SYMBOLS = {
  [ItemType.WEAPON]: 'W',      // Weapon
  [ItemType.HEAL]: '+',        // Heal
  [ItemType.BOMB]: 'B',        // Bomb
  [ItemType.SHIELD]: 'S'       // Shield
};