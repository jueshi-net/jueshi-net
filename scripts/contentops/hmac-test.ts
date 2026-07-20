#!/usr/bin/env tsx
/**
 * ContentOps Bridge HMAC 签名测试
 * 
 * 测试 HMAC-SHA256 签名验证的正确性
 * 
 * 签名契约：
 * payload = UPPERCASE_METHOD + ":" + pathname + ":" + rawBody
 * - GET rawBody=""
 * - pathname 不包含域名
 * - query string 不参与签名
 * - POST 使用发送出去的完全相同 rawBody 字节
 * - 签名为 lowercase hex HMAC-SHA256
 * - Header 前后空白必须 trim
 * - Header 必须匹配 ^[0-9a-fA-F]{64}$
 */

import { createHmac } from 'crypto';

const BRIDGE_SECRET = process.env.CONTENTOPS_BRIDGE_SECRET || 'test-secret-key';
const BASE_URL = process.env.BRIDGE_BASE_URL || 'http://127.0.0.1:3001';
const ENDPOINT = '/api/internal/contentops/drafts';

function computeSignature(method: string, path: string, body: string): string {
  const payload = `${method.toUpperCase()}:${path}:${body}`;
  return createHmac('sha256', BRIDGE_SECRET)
    .update(payload)
    .digest('hex');
}

async function testRequest(
  name: string,
  method: string,
  path: string,
  body: string,
  signature: string | null,
  expectedStatus: number,
  expectedCode?: string
): Promise<boolean> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (signature !== null) {
    headers['X-ContentOps-Signature'] = signature;
  }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'GET' ? undefined : body,
    });

    const data = await response.json();
    const passed = response.status === expectedStatus && 
                   (!expectedCode || data.code === expectedCode);

    console.log(`${passed ? '✅' : '❌'} ${name}`);
    console.log(`   Expected: ${expectedStatus}${expectedCode ? ` (${expectedCode})` : ''}`);
    console.log(`   Got: ${response.status}${data.code ? ` (${data.code})` : ''}`);
    
    if (!passed) {
      console.log(`   Response:`, JSON.stringify(data));
    }
    
    return passed;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error:`, error);
    return false;
  }
}

async function runTests() {
  console.log('ContentOps Bridge HMAC 签名测试\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Secret: ${BRIDGE_SECRET.substring(0, 8)}...`);
  console.log('');

  let passed = 0;
  let total = 0;

  // Test 1: 正确 GET 签名 → 200
  total++;
  const getSig = computeSignature('GET', ENDPOINT, '');
  if (await testRequest('Test 1: 正确 GET 签名', 'GET', ENDPOINT, '', getSig, 200)) passed++;

  // Test 2: 正确 POST 签名 → 200
  total++;
  const postBody = JSON.stringify({ action: 'list_tasks' });
  const postSig = computeSignature('POST', ENDPOINT, postBody);
  if (await testRequest('Test 2: 正确 POST 签名', 'POST', ENDPOINT, postBody, postSig, 200)) passed++;

  // Test 3: 缺少 Header → 401 MISSING_SIGNATURE
  total++;
  if (await testRequest('Test 3: 缺少签名 Header', 'GET', ENDPOINT, '', null, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 4: 非法长度 → 401 MALFORMED_SIGNATURE
  total++;
  const shortSig = 'abc123';
  if (await testRequest('Test 4: 非法长度签名', 'GET', ENDPOINT, '', shortSig, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 5: 非十六进制 → 401 MALFORMED_SIGNATURE
  total++;
  const nonHexSig = 'g'.repeat(64);
  if (await testRequest('Test 5: 非十六进制签名', 'GET', ENDPOINT, '', nonHexSig, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 6: 错误签名 → 401 INVALID_SIGNATURE
  total++;
  const wrongSig = 'a'.repeat(64);
  if (await testRequest('Test 6: 错误签名', 'GET', ENDPOINT, '', wrongSig, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 7: body 改变一个字符 → 401
  total++;
  const modifiedBody = JSON.stringify({ action: 'list_taskz' }); // 最后一个字符改变
  const originalSig = computeSignature('POST', ENDPOINT, postBody);
  if (await testRequest('Test 7: body 改变一个字符', 'POST', ENDPOINT, modifiedBody, originalSig, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 8: path 改变 → 401
  total++;
  const wrongPathSig = computeSignature('GET', '/wrong/path', '');
  if (await testRequest('Test 8: path 改变', 'GET', ENDPOINT, '', wrongPathSig, 401, 'INVALID_SIGNATURE')) passed++;

  // Test 9: query 签名口径一致（query 不参与签名）
  total++;
  const querySig = computeSignature('GET', ENDPOINT, '');
  if (await testRequest('Test 9: query string 不参与签名', 'GET', `${ENDPOINT}?action=list_tasks`, '', querySig, 200)) passed++;

  // Test 10: 旧 Secret 失败（需要配置不同的 secret）
  // 这个测试需要手动配置，跳过
  console.log('⏭️  Test 10: 旧 Secret 失败（需要手动配置）');

  console.log(`\n测试结果: ${passed}/${total} 通过`);
  
  if (passed === total) {
    console.log('✅ 所有测试通过');
    process.exit(0);
  } else {
    console.log('❌ 部分测试失败');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
