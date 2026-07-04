#!/usr/bin/env tsx
/**
 * PHASE 10: Short topic test
 * 
 * Test short topic generation with simplified schema
 */

// Set environment variables BEFORE importing the module
process.env.LOCAL_HERMES_ENABLED = 'true';
process.env.LOCAL_HERMES_PATH = '/Users/chq/.hermes/hermes-agent/venv/bin/hermes';

async function runShortTopicTest() {
  // Dynamic import after setting env vars
  const { callLocalHermesAgent } = await import('./local-hermes-agent-client');

  console.log('=== PHASE 10: Short topic test ===\n');

  const systemPrompt = `You are a content planning AI. Return valid JSON only.
Schema:
{
  "inputMode": "reference_rewrite",
  "contentType": "topic",
  "schemaType": "topic",
  "title": "SEO title <= 24 chars",
  "targetAudience": "audience",
  "targetCountries": ["country1"],
  "audienceStage": "beginner",
  "searchIntent": "informational",
  "sourceFacts": [],
  "content": {
    "intro": "intro >= 100 chars",
    "categories": ["cat1", "cat2"],
    "resources": [
      {"name": "res1", "category": "cat1", "ratingTier": "S", "recommendationLevel": "highly recommended", "suitableFor": ["aud1"], "scenario": "scenario", "reason": "reason", "caution": "caution", "countries": ["country1"], "officialOrSafeDownloadNote": "note"}
    ],
    "scenarioMap": [{"scenario": "s1", "recommendedResources": ["res1"], "priority": "high"}],
    "comparisonTable": {"headers": ["feature", "res1"], "rows": [{"feature": "f1", "resources": {"res1": "v1"}}]},
    "ratingTierExplanation": "explanation",
    "faq": [{"question": "Q", "answer": "A"}],
    "pitfalls": [{"title": "t", "description": "d", "severity": "high"}],
    "internalLinks": [],
    "relatedTools": []
  },
  "seo": {"primaryKeyword": "kw", "secondaryKeywords": [], "metaTitle": "title", "metaDescription": "desc", "metaKeywords": []},
  "geo": {"targetAudience": "aud", "targetCountries": ["country1"], "audienceStage": "beginner", "searchIntent": "informational"}
}`;

  const prompt = `Input: "海外华人常用 APP 推荐，包括地图、翻译、打车、外卖"
Input mode: reference_rewrite
Return topic JSON with 3 resources (S/A/B rating).`;

  try {
    console.log('Calling local Hermes Agent with short topic prompt...');
    const startTime = Date.now();
    
    const response = await callLocalHermesAgent(prompt, systemPrompt);
    
    const duration = Date.now() - startTime;
    console.log(`\nCompleted in ${duration}ms\n`);
    console.log('Response length:', response.length);

    // Try to parse JSON
    try {
      // Extract complete JSON object using brace counting
      let braceCount = 0;
      let jsonStart = -1;
      let jsonEnd = -1;
      
      for (let i = 0; i < response.length; i++) {
        if (response[i] === '{') {
          if (braceCount === 0) {
            jsonStart = i;
          }
          braceCount++;
        } else if (response[i] === '}') {
          braceCount--;
          if (braceCount === 0 && jsonStart !== -1) {
            jsonEnd = i + 1;
            break;
          }
        }
      }
      
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No complete JSON object found');
      }
      
      const jsonString = response.substring(jsonStart, jsonEnd);
      const json = JSON.parse(jsonString);
      
      console.log('\n✅ JSON parsed successfully');
      console.log('contentType:', json.contentType);
      console.log('title:', json.title);
      console.log('resources count:', json.content?.resources?.length || 0);
      
      // Validate
      const validations = {
        'contentType=topic': json.contentType === 'topic',
        'title exists': !!json.title,
        'resources >= 3': (json.content?.resources?.length || 0) >= 3,
        'S/A/B/C exists': json.content?.resources?.some((r: any) => ['S', 'A', 'B', 'C'].includes(r.ratingTier)) || false,
      };

      console.log('\n=== Validation ===');
      for (const [check, passed] of Object.entries(validations)) {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      }

      return Object.values(validations).every(v => v);
    } catch (parseError: any) {
      console.error('\n❌ JSON parse failed:', parseError.message);
      console.error('Raw response:', response.substring(0, 500));
      return false;
    }
  } catch (error: any) {
    console.error('\n❌ PHASE 10 ERROR:', error.message);
    console.error(error.stack);
    return false;
  }
}

runShortTopicTest().then(success => {
  process.exit(success ? 0 : 1);
});
