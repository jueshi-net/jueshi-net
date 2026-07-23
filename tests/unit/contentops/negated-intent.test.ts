/**
 * Negated Publish Intent Regression Tests
 * 
 * Tests that negated publish expressions are correctly parsed as review_required or draft_only,
 * even when positive publish keywords are present.
 */

import { describe, it, expect } from 'vitest';

// Import the parseTaskIntent function (we'll need to export it from the bot file)
// For now, we'll test the logic directly

function parseExecutionMode(text: string): string {
  const lower = text.toLowerCase();
  
  let executionMode = 'review_required';
  
  // Priority 1: Negated publish intent (HIGHEST PRIORITY)
  const negatedPublishPatterns = [
    /不要.*发布/,
    /不用.*发布/,
    /暂不.*发布/,
    /别发布/,
    /先别.*发布/,
    /不要.*立即发布/,
    /不要.*自动发布/,
    /不要.*直接发布/,
    /仅保存草稿/,
    /保存.*等我审核/,
    /先给我审核/,
    /审核后.*发布/,
    /审核通过.*发布/,
    /等我审核/,
    /等待审核/,
    /放后台/,
  ];
  
  const hasNegatedPublish = negatedPublishPatterns.some(pattern => pattern.test(lower));
  
  if (hasNegatedPublish) {
    if (lower.includes('只要草稿') || lower.includes('仅保存草稿')) {
      executionMode = 'draft_only';
    } else {
      executionMode = 'review_required';
    }
  }
  // Priority 2: Scheduled publish
  else if (
    lower.includes('定时发布') || 
    lower.includes('安排发布') || 
    lower.includes('schedule') ||
    (lower.includes('安排') && lower.includes('发布')) ||
    /\d+\s*分钟后.*发布/.test(lower)
  ) {
    executionMode = 'schedule_when_validated';
  }
  // Priority 3: Publish when validated
  else if (lower.includes('检查通过后') || lower.includes('验证通过后') || lower.includes('质量通过后') || lower.includes('检查通过后发布') || lower.includes('自动发布')) {
    executionMode = 'publish_when_validated';
  }
  // Priority 4: Publish now (only if explicitly positive)
  else if (lower.includes('直接发布') || lower.includes('立即发布') || lower.includes('publish now')) {
    const publishIndex = lower.indexOf('发布');
    if (publishIndex !== -1) {
      const contextStart = Math.max(0, publishIndex - 10);
      const context = lower.substring(contextStart, publishIndex);
      const hasNegationNearby = /不|别|暂|不用/.test(context);
      
      if (!hasNegationNearby) {
        executionMode = 'publish_now';
      }
    }
  }
  
  return executionMode;
}

describe('Negated Publish Intent', () => {
  describe('Should parse as review_required (negated publish)', () => {
    const testCases = [
      '生成完成后保存到 staging 后台等我审核，不要直接发布。',
      '可以生成，但别发布。',
      '做好后先保存草稿，审核通过再发布。',
      '立即生成，不要立即发布。',
      '生成后放后台，不用发布。',
      '暂不发布，先保存草稿。',
      '先别发布，等我审核。',
      '不要自动发布，等我确认。',
      '保存后台等我审核。',
      '先给我审核，审核后再发布。',
      '生成内容，但不要发布。',
      '创建草稿，仅保存草稿。',
    ];

    testCases.forEach((input, index) => {
      it(`Test case ${index + 1}: "${input.substring(0, 40)}..."`, () => {
        const result = parseExecutionMode(input);
        expect(result).toBe('review_required');
      });
    });
  });

  describe('Should parse as draft_only (explicit draft)', () => {
    const testCases = [
      '只要草稿，不发布。',
      '仅保存草稿。',
      '生成草稿即可，不用发布。',
    ];

    testCases.forEach((input, index) => {
      it(`Test case ${index + 1}: "${input}"`, () => {
        const result = parseExecutionMode(input);
        expect(result).toBe('draft_only');
      });
    });
  });

  describe('Should parse as publish_now (positive intent only)', () => {
    const testCases = [
      '生成完成后立即发布到 staging。',
      '直接发布，不需要审核。',
      '立即发布。',
      '生成后直接发布。',
    ];

    testCases.forEach((input, index) => {
      it(`Test case ${index + 1}: "${input}"`, () => {
        const result = parseExecutionMode(input);
        expect(result).toBe('publish_now');
      });
    });
  });

  describe('Should parse as schedule_when_validated', () => {
    const testCases = [
      '定时发布，10分钟后。',
      '安排十分钟后发布。',
      '安排明天早上9点发布。',
    ];

    testCases.forEach((input, index) => {
      it(`Test case ${index + 1}: "${input}"`, () => {
        const result = parseExecutionMode(input);
        expect(result).toBe('schedule_when_validated');
      });
    });
  });

  describe('Should parse as publish_when_validated', () => {
    const testCases = [
      '检查通过后直接发布。',
      '验证通过后发布。',
      '质量通过后自动发布。',
      '自动发布。',
    ];

    testCases.forEach((input, index) => {
      it(`Test case ${index + 1}: "${input}"`, () => {
        const result = parseExecutionMode(input);
        expect(result).toBe('publish_when_validated');
      });
    });
  });

  describe('Edge cases: negation near publish keyword', () => {
    it('Should NOT parse as publish_now when "不" is near "发布"', () => {
      const input = '不要发布';
      const result = parseExecutionMode(input);
      expect(result).toBe('review_required');
    });

    it('Should parse as publish_now when no negation near "发布"', () => {
      const input = '立即发布';
      const result = parseExecutionMode(input);
      expect(result).toBe('publish_now');
    });

    it('Should handle mixed intent: negation overrides positive', () => {
      const input = '生成完成后保存到后台等我审核，不要直接发布';
      const result = parseExecutionMode(input);
      expect(result).toBe('review_required');
    });
  });
});
