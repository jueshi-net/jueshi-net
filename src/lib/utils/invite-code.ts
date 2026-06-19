// v1.20.42.12.0: 邀请码生成工具
import { randomBytes } from 'crypto';

/**
 * 生成唯一的邀请码
 * 格式：INVITE-XXXXXX（8 位大写字母和数字）
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 排除易混淆字符
  const length = 8;
  let code = '';
  
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  
  return `INVITE-${code}`;
}

/**
 * 验证邀请码格式
 */
export function isValidInviteCode(code: string): boolean {
  return /^INVITE-[A-Z0-9]{8}$/.test(code);
}
