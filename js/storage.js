/**
 * 数据持久化模块
 * 管理LocalStorage的读写操作
 */

const STORAGE_KEY = {
  HIGH_SCORE: 'plane_war_high_score',
  GAME_DATA: 'plane_war_game_data',
  SETTINGS: 'plane_war_settings',
  VERSION: 'plane_war_version'
};

const CURRENT_VERSION = '1.0.0';

/**
 * 存储管理类
 */
class Storage {
  /**
   * 保存最高分
   * @param {number} score - 分数
   * @returns {boolean} 是否保存成功
   */
  static saveHighScore(score) {
    try {
      const currentHigh = this.getHighScore();
      if (score > currentHigh) {
        localStorage.setItem(STORAGE_KEY.HIGH_SCORE, score.toString());
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Failed to save high score:', e);
      return false;
    }
  }

  /**
   * 获取最高分
   * @returns {number}
   */
  static getHighScore() {
    try {
      const score = localStorage.getItem(STORAGE_KEY.HIGH_SCORE);
      return score ? parseInt(score, 10) : 0;
    } catch (e) {
      console.warn('Failed to get high score:', e);
      return 0;
    }
  }

  /**
   * 保存游戏数据
   * @param {Object} data - 游戏数据
   * @returns {boolean} 是否保存成功
   */
  static saveGameData(data) {
    try {
      const saveData = {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
        ...data
      };
      localStorage.setItem(STORAGE_KEY.GAME_DATA, JSON.stringify(saveData));
      return true;
    } catch (e) {
      console.warn('Failed to save game data:', e);
      return false;
    }
  }

  /**
   * 加载游戏数据
   * @returns {Object|null} 游戏数据或null
   */
  static loadGameData() {
    try {
      const data = localStorage.getItem(STORAGE_KEY.GAME_DATA);
      if (!data) return null;

      const parsed = JSON.parse(data);

      // 版本检查
      if (parsed.version !== CURRENT_VERSION) {
        console.warn('Game data version mismatch. Expected:', CURRENT_VERSION, 'Got:', parsed.version);
        // 可以在这里添加版本迁移逻辑
      }

      return parsed;
    } catch (e) {
      console.warn('Failed to load game data:', e);
      return null;
    }
  }

  /**
   * 清除游戏数据
   * @returns {boolean} 是否清除成功
   */
  static clearGameData() {
    try {
      localStorage.removeItem(STORAGE_KEY.GAME_DATA);
      return true;
    } catch (e) {
      console.warn('Failed to clear game data:', e);
      return false;
    }
  }

  /**
   * 保存设置
   * @param {Object} settings - 设置对象
   * @returns {boolean} 是否保存成功
   */
  static saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.warn('Failed to save settings:', e);
      return false;
    }
  }

  /**
   * 加载设置
   * @param {Object} defaultSettings - 默认设置
   * @returns {Object} 设置对象
   */
  static loadSettings(defaultSettings = {}) {
    try {
      const data = localStorage.getItem(STORAGE_KEY.SETTINGS);
      if (!data) return defaultSettings;

      const parsed = JSON.parse(data);
      return { ...defaultSettings, ...parsed };
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return defaultSettings;
    }
  }

  /**
   * 检查LocalStorage是否可用
   * @returns {boolean}
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 获取存储大小估算
   * @returns {string} 大小描述
   */
  static getStorageSize() {
    if (!this.isAvailable()) return 'N/A';

    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length;
      }
    }

    const kb = (total / 1024).toFixed(2);
    return `${kb} KB`;
  }

  /**
   * 清除所有游戏相关数据
   */
  static clearAll() {
    try {
      Object.values(STORAGE_KEY).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (e) {
      console.warn('Failed to clear all data:', e);
      return false;
    }
  }

  /**
   * 导出保存数据(用于备份)
   * @param {string} filename - 文件名
   */
  static exportData(filename = 'plane-war-save.json') {
    try {
      const data = {};
      Object.entries(STORAGE_KEY).forEach(([name, key]) => {
        const value = localStorage.getItem(key);
        if (value) {
          data[name] = value;
        }
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();

      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.warn('Failed to export data:', e);
      return false;
    }
  }

  /**
   * 导入保存数据
   * @param {string} jsonData - JSON数据字符串
   * @returns {boolean} 是否导入成功
   */
  static importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);

      // 验证数据格式
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }

      // 导入数据
      Object.entries(STORAGE_KEY).forEach(([name, key]) => {
        if (data[name]) {
          localStorage.setItem(key, data[name]);
        }
      });

      return true;
    } catch (e) {
      console.warn('Failed to import data:', e);
      return false;
    }
  }

  /**
   * 检查是否有保存的数据
   * @returns {boolean}
   */
  static hasSaveData() {
    return this.getHighScore() > 0 || this.loadGameData() !== null;
  }
}

/**
 * 排行榜类
 */
class Leaderboard {
  static MAX_ENTRIES = 10;

  /**
   * 保存分数到排行榜
   * @param {number} score - 分数
   * @param {string} name - 玩家名称(可选)
   * @param {number} date - 时间戳(可选)
   * @returns {number} 排名(0-based索引), -1表示未进入排行榜
   */
  static addScore(score, name = 'Player', date = Date.now()) {
    const scores = this.getScores();

    const entry = {
      score,
      name,
      date,
      dateFormatted: new Date(date).toLocaleDateString()
    };

    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);

    // 保留前N名
    while (scores.length > this.MAX_ENTRIES) {
      scores.pop();
    }

    // 找到新分数的排名
    const rank = scores.findIndex(s => s.score === score && s.date === date);

    this.saveScores(scores);

    return rank;
  }

  /**
   * 获取排行榜分数
   * @returns {Array} 排行榜数组
   */
  static getScores() {
    try {
      const data = localStorage.getItem('plane_war_leaderboard');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to get leaderboard:', e);
      return [];
    }
  }

  /**
   * 保存排行榜分数
   * @param {Array} scores - 分数数组
   */
  static saveScores(scores) {
    try {
      localStorage.setItem('plane_war_leaderboard', JSON.stringify(scores));
    } catch (e) {
      console.warn('Failed to save leaderboard:', e);
    }
  }

  /**
   * 清除排行榜
   */
  static clear() {
    try {
      localStorage.removeItem('plane_war_leaderboard');
    } catch (e) {
      console.warn('Failed to clear leaderboard:', e);
    }
  }

  /**
   * 获取最高分
   * @returns {number}
   */
  static getTopScore() {
    const scores = this.getScores();
    return scores.length > 0 ? scores[0].score : 0;
  }
}