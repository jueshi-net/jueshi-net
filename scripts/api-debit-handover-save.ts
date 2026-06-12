import { chromium } from 'playwright';

const timestamp = Date.now();

const debitNoteData = {
  documentType: 'debit-note',
  documentNo: `DN-E2E-${timestamp}`,
  documentData: {
    formData: {
      companyName: 'DN E2E Company 20260611',
      clientName: 'DN E2E Client 20260611',
      debitNoteNo: `DN-E2E-${timestamp}`,
      date: new Date().toISOString().split('T')[0]
    },
    lineItems: [
      {
        description: 'debit test',
        amount: 50,
        remark: `KEEP-ME-DN-E2E-${timestamp}`
      }
    ]
  }
};

const handoverNoteData = {
  documentType: 'handover-note',
  documentNo: `HN-E2E-${timestamp}`,
  documentData: {
    formData: {
      companyName: 'HN E2E Company 20260611',
      clientName: 'HN E2E Client 20260611',
      handoverNoteNo: `HN-E2E-${timestamp}`,
      date: new Date().toISOString().split('T')[0]
    },
    lineItems: [
      {
        description: 'handover test',
        remark: `KEEP-ME-HN-E2E-${timestamp}`
      }
    ]
  }
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: 'scripts/storage-state.json' });
  const page = await context.newPage();

  try {
    await page.goto('https://jueshi.net/workspace', { timeout: 30000 });
    console.log('✓ Session verified');

    // Debit Note
    const debitResponse = await page.evaluate(async (data) => {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { status: res.status, body: await res.json() };
    }, debitNoteData);

    console.log('\n--- Debit Note API Response ---');
    console.log('Status:', debitResponse.status);
    console.log('Body:', JSON.stringify(debitResponse.body, null, 2));

    if (debitResponse.status === 200 && debitResponse.body.success) {
      console.log('✓ Debit Note saved successfully');
      console.log('  ID:', debitResponse.body.id);
    } else {
      console.log('✗ Debit Note save failed');
    }

    // Handover Note
    const handoverResponse = await page.evaluate(async (data) => {
      const res = await fetch('/api/user/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return { status: res.status, body: await res.json() };
    }, handoverNoteData);

    console.log('\n--- Handover Note API Response ---');
    console.log('Status:', handoverResponse.status);
    console.log('Body:', JSON.stringify(handoverResponse.body, null, 2));

    if (handoverResponse.status === 200 && handoverResponse.body.success) {
      console.log('✓ Handover Note saved successfully');
      console.log('  ID:', handoverResponse.body.id);
    } else {
      console.log('✗ Handover Note save failed');
    }

  } catch (error) {
    console.error('API call failed:', error);
  } finally {
    await browser.close();
  }
})();
