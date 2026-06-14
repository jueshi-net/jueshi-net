/**
 * Container Calculator → Shipping Calculator 数据中转
 * 
 * 用于在两个工具之间临时传递集装箱计算结果，
 * 便于用户继续估算运输成本。
 */

export interface ContainerToShippingPayload {
  /** 数量 */
  quantity: number;
  /** 单件长度 (cm) */
  unitLengthCm: number;
  /** 单件宽度 (cm) */
  unitWidthCm: number;
  /** 单件高度 (cm) */
  unitHeightCm: number;
  /** 单件重量 (kg) */
  unitWeightKg: number;
  /** 总体积 (CBM) */
  totalCbm: number;
  /** 总重量 (kg) */
  totalWeightKg: number;
  /** 推荐集装箱类型 */
  suggestedContainer: string;
  /** 利用率 (%) */
  utilizationRate: number;
  /** 理论可装件数 */
  maxUnits: number;
  /** 可装批次数 */
  batchCount: number;
}

export interface ContainerToShippingData {
  /** 数据来源 */
  source: 'container-calculator';
  /** 数据版本 */
  version: 1;
  /** 创建时间 (ISO) */
  createdAt: string;
  /** 过期时间 (ISO) */
  expiresAt: string;
  /** 是否已消费 */
  consumed: boolean;
  /** 数据载体 */
  payload: ContainerToShippingPayload;
}

const STORAGE_KEY = 'jueshi.containerToShipping.v1';
const EXPIRE_MINUTES = 30;

/**
 * 写入中转数据
 */
export function saveContainerToShipping(payload: ContainerToShippingPayload): boolean {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + EXPIRE_MINUTES * 60 * 1000);
    
    const data: ContainerToShippingData = {
      source: 'container-calculator',
      version: 1,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      consumed: false,
      payload,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save container to shipping data:', error);
    return false;
  }
}

/**
 * 读取中转数据
 * 如果数据不存在、已过期或已消费，返回 null
 */
export function loadContainerToShipping(): ContainerToShippingData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const data: ContainerToShippingData = JSON.parse(raw);
    
    // 检查版本
    if (data.version !== 1) {
      clearContainerToShipping();
      return null;
    }
    
    // 检查是否已消费
    if (data.consumed) {
      clearContainerToShipping();
      return null;
    }
    
    // 检查是否过期
    const now = new Date();
    const expiresAt = new Date(data.expiresAt);
    if (now >= expiresAt) {
      clearContainerToShipping();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to load container to shipping data:', error);
    clearContainerToShipping();
    return null;
  }
}

/**
 * 标记中转数据为已消费
 */
export function markContainerToShippingConsumed(): void {
  try {
    const data = loadContainerToShipping();
    if (data) {
      data.consumed = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (error) {
    console.error('Failed to mark container to shipping data as consumed:', error);
  }
}

/**
 * 清理中转数据
 */
export function clearContainerToShipping(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear container to shipping data:', error);
  }
}

/**
 * 检查是否存在有效的中转数据
 */
export function hasValidContainerToShipping(): boolean {
  return loadContainerToShipping() !== null;
}
