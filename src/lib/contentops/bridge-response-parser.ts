/**
 * Bridge Response Parser
 * 
 * 统一的 Bridge API 响应解析器
 * 所有 Bot、测试脚本、Helper 都必须使用这个解析器
 * 
 * 解决问题：
 * - bridge-local-helper 返回 { ok, status, data, error }
 * - Bot 需要解析 data 字段中的实际响应
 * - 避免直接访问 response.body 导致 undefined
 */

import { CreateTaskResponse, validateCreateTaskResponse, extractTaskId, extractJobId } from './contracts/api-contract';

/**
 * Helper 响应结构
 */
export interface HelperResponse {
  ok: boolean;
  status: number;
  data?: any;
  error?: any;
}

/**
 * 解析 Helper 响应
 * 
 * @param response Helper 返回的响应
 * @returns 解析后的 Bridge API 响应
 */
export function parseHelperResponse(response: HelperResponse): any {
  // Helper 返回 { ok, status, data, error }
  // data 字段包含实际的 Bridge API 响应
  return response.data || response;
}

/**
 * 解析 create_task 响应
 * 
 * @param response Helper 响应
 * @returns 解析后的 create_task 响应
 * @throws Error 如果响应格式无效
 */
export function parseCreateTaskResponse(response: HelperResponse): CreateTaskResponse {
  const bridgeResponse = parseHelperResponse(response);
  
  // 验证响应格式
  if (!validateCreateTaskResponse(bridgeResponse)) {
    console.error('[BridgeResponseParser] Invalid create_task response:', bridgeResponse);
    throw new Error('CONTENTOPS_INVALID_TASK_RESPONSE: Bridge API returned invalid response format');
  }
  
  return bridgeResponse;
}

/**
 * 安全提取 task ID
 * 
 * @param response create_task 响应
 * @returns task ID 或 null
 */
export function safeExtractTaskId(response: CreateTaskResponse): string | null {
  return extractTaskId(response);
}

/**
 * 安全提取 job ID
 * 
 * @param response create_task 响应
 * @returns job ID 或 null
 */
export function safeExtractJobId(response: CreateTaskResponse): string | null {
  return extractJobId(response);
}

/**
 * 创建 fetch-like 响应对象
 * 
 * 用于兼容现有代码的 response.json() 和 response.text() 调用
 * 
 * @param helperResponse Helper 响应
 * @returns fetch-like 响应对象
 */
export function createFetchLikeResponse(helperResponse: HelperResponse) {
  const bridgeResponse = parseHelperResponse(helperResponse);
  
  return {
    ok: helperResponse.status >= 200 && helperResponse.status < 300,
    status: helperResponse.status,
    json: async () => bridgeResponse,
    text: async () => JSON.stringify(bridgeResponse),
  };
}

/**
 * 验证响应是否成功
 * 
 * @param response create_task 响应
 * @returns 是否成功
 */
export function isCreateTaskSuccess(response: CreateTaskResponse): boolean {
  return response.ok === true;
}

/**
 * 获取错误信息
 * 
 * @param response create_task 响应
 * @returns 错误信息
 */
export function getCreateTaskError(response: CreateTaskResponse): string {
  if (!response.ok && response.error) {
    return response.error.message || 'Unknown error';
  }
  return '';
}

/**
 * 获取错误代码
 * 
 * @param response create_task 响应
 * @returns 错误代码
 */
export function getCreateTaskErrorCode(response: CreateTaskResponse): string {
  if (!response.ok && response.error) {
    return response.error.code || 'UNKNOWN_ERROR';
  }
  return 'UNKNOWN_ERROR';
}
