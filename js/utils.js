/**
 * 工具函数模块
 * 提供常用的辅助函数
 */

/**
 * 矩形碰撞检测
 * @param {Object} a - 第一个矩形 {x, y, width, height}
 * @param {Object} b - 第二个矩形 {x, y, width, height}
 * @returns {boolean} 是否碰撞
 */
function checkCollision(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

/**
 * 计算两个点之间的距离
 * @param {number} x1 - 第一个点x坐标
 * @param {number} y1 - 第一个点y坐标
 * @param {number} x2 - 第二个点x坐标
 * @param {number} y2 - 第二个点y坐标
 * @returns {number} 距离
 */
function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 随机范围数
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 随机数
 */
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * 随机整数
 * @param {number} min - 最小值(包含)
 * @param {number} max - 最大值(包含)
 * @returns {number} 随机整数
 */
function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

/**
 * 根据权重随机选择
 * @param {Object} weights - 权重对象 {key: weight}
 * @returns {string} 选中的key
 */
function weightRandom(weights) {
  const keys = Object.keys(weights);
  const totalWeight = keys.reduce((sum, key) => sum + weights[key], 0);
  let random = Math.random() * totalWeight;

  for (const key of keys) {
    random -= weights[key];
    if (random <= 0) {
      return key;
    }
  }
  return keys[keys.length - 1];
}

/**
 * 角度转换: 弧度转角度
 * @param {number} radians - 弧度
 * @returns {number} 角度
 */
function toDegrees(radians) {
  return radians * 180 / Math.PI;
}

/**
 * 角度转换: 角度转弧度
 * @param {number} degrees - 角度
 * @returns {number} 弧度
 */
function toRadians(degrees) {
  return degrees * Math.PI / 180;
}

/**
 * 限制数值在范围内
 * @param {number} value - 原始值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制后的值
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 * @param {number} a - 起始值
 * @param {number} b - 目标值
 * @param {number} t - 插值因子(0-1)
 * @returns {number} 插值结果
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 从数组中移除元素
 * @param {Array} array - 数组
 * @param {*} element - 要移除的元素
 * @returns {boolean} 是否移除成功
 */
function removeElement(array, element) {
  const index = array.indexOf(element);
  if (index !== -1) {
    array.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * 从数组中移除所有符合条件的元素
 * @param {Array} array - 数组
 * @param {function} predicate - 判断函数
 * @returns {number} 移除的数量
 */
function removeAll(array, predicate) {
  let removed = 0;
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      array.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

/**
 * 随机洗牌数组
 * @param {Array} array - 数组
 * @returns {Array} 洗牌后的数组
 */
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 格式化分数显示
 * @param {number} score - 分数
 * @returns {string} 格式化后的分数
 */
function formatScore(score) {
  return score.toLocaleString();
}

/**
 * 格式化时间显示
 * @param {number} seconds - 秒数
 * @returns {string} 格式化后的时间 (MM:SS)
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝结果
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 绘制发光效果
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {string} color - 颜色
 * @param {number} blur - 模糊程度
 * @param {function} draw - 绘制函数
 */
function drawWithGlow(ctx, color, blur, draw) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  draw();
  ctx.restore();
}

/**
 * 创建渐变色
 * @param {CanvasRenderingContext2D} ctx - 画布上下文
 * @param {number} x1 - 起点x
 * @param {number} y1 - 起点y
 * @param {number} x2 - 终点x
 * @param {number} y2 - 终点y
 * @param {Array} colors - 颜色数组
 * @returns {CanvasGradient} 渐变
 */
function createGradient(ctx, x1, y1, x2, y2, colors) {
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  colors.forEach((color, i) => {
    gradient.addColorStop(i / (colors.length - 1), color);
  });
  return gradient;
}

/**
 * 绘制闪电效果(用于受伤闪烁)
 * @param {number} time - 时间
 * @param {number} duration - 持续时间
 * @returns {boolean} 是否显示
 */
function shouldFlash(time, duration, frequency = 10) {
  return (time * frequency) % 1 > 0.5;
}

/**
 * 向量加法
 * @param {Object} v1 - 向量1 {x, y}
 * @param {Object} v2 - 向量2 {x, y}
 * @returns {Object} 结果向量
 */
function vectorAdd(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * 向量乘法
 * @param {Object} v - 向量 {x, y}
 * @param {number} scalar - 标量
 * @returns {Object} 结果向量
 */
function vectorMultiply(v, scalar) {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * 向量归一化
 * @param {Object} v - 向量 {x, y}
 * @returns {Object} 归一化后的向量
 */
function vectorNormalize(v) {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/**
 * 计算方向向量
 * @param {number} fromX - 起点x
 * @param {number} fromY - 起点y
 * @param {number} toX - 终点x
 * @param {number} toY - 终点y
 * @returns {Object} 方向向量
 */
function directionVector(fromX, fromY, toX, toY) {
  return vectorNormalize({
    x: toX - fromX,
    y: toY - fromY
  });
}