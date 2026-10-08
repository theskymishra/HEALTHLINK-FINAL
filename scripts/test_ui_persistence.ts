import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../server/config/db';
import { PatientModel } from '../server/models/Patient';

interface NetworkEvent {
  method: string;
  url: string;
  status?: number;
  postData?: string;
}

async function runBrowserE2ETest() {
  console.log('=== STARTING BROWSER UI PATIENT CRUD E2E TEST ===');
  await connectDB();
  await PatientModel.deleteMany({ name: 'TEST CLOUD PATIENT' });
  console.log('Cleaned up any previous test instances of "TEST CLOUD PATIENT" from MongoDB Atlas.');

  // 1. Connect to Chrome CDP
  const tabs = await fetch('http://localhost:9222/json/list').then((r) => r.json());
  const page = tabs.find((t: any) => t.type === 'page' && t.url.includes('3000'));
  if (!page) throw new Error('No HealthLink page found on localhost:3000 in Chrome');
  console.log('[1/7] Connecting to Chrome Page:', page.url);

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map<number, (res: any) => void>();
  const networkLog: NetworkEvent[] = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data.toString());
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)!(data);
      pending.delete(data.id);
    }
    if (data.method === 'Network.requestWillBeSent') {
      const req = data.params.request;
      if (req.url.includes('/api/patients')) {
        console.log(`📡 [BROWSER NETWORK] ${req.method} ${req.url}`);
        networkLog.push({ method: req.method, url: req.url, postData: req.postData });
      }
    }
    if (data.method === 'Network.responseReceived') {
      const res = data.params.response;
      if (res.url.includes('/api/patients')) {
        console.log(`📥 [BROWSER NETWORK] Response ${res.status} ${res.url}`);
        const existing = networkLog.find((n) => n.url === res.url && !n.status);
        if (existing) existing.status = res.status;
      }
    }
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log(`🖥️ [BROWSER CONSOLE] ${data.params.type}:`, data.params.args.map((a: any) => a.value || a.description).join(' '));
    }
  };

  const send = (method: string, params: Record<string, any> = {}): Promise<any> =>
    new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, (res) => {
        if (res.error) {
          reject(new Error(JSON.stringify(res.error)));
        } else if (res.result && res.result.exceptionDetails) {
          console.error('Browser JS Exception:', res.result.exceptionDetails);
          reject(new Error(res.result.exceptionDetails.text || 'JS evaluation exception'));
        } else {
          resolve(res.result);
        }
      });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  await new Promise((r) => (ws.onopen = r));
  await send('Network.enable');
  await send('Page.enable');
  await send('Runtime.enable');

  // 2. Navigate to Patients Page
  console.log('[2/7] Navigating to http://localhost:3000/patients...');
  await send('Page.navigate', { url: 'http://localhost:3000/patients' });
  await new Promise((r) => setTimeout(r, 2000));

  // 3. Click "Add New Patient" in UI
  console.log('[3/7] Clicking "Add New Patient" in UI...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const addBtn = buttons.find(b => b.textContent && b.textContent.includes('Add New Patient'));
        if (!addBtn) throw new Error('Add New Patient button not found. Available buttons: ' + buttons.map(b => b.textContent).join(', '));
        addBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // 4. Fill form for "TEST CLOUD PATIENT" and submit
  console.log('[4/7] Filling Add Patient form in UI...');
  const formRes = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        if (!form) throw new Error('Patient form modal not found');

        const inputs = Array.from(form.querySelectorAll('input'));
        
        // Helper to set React input value
        const setVal = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          if (input._valueTracker) {
            input._valueTracker.setValue('');
          }
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        // Inputs in order: Name, Age, Phone, Email, Address, Contact Name, Contact Phone
        // Match by label
        const labels = Array.from(form.querySelectorAll('label'));
        const matched = [];
        for (const label of labels) {
          const text = (label.textContent || '').trim();
          const input = label.parentElement.querySelector('input');
          if (!input) continue;

          if (text.includes('Full Name')) { setVal(input, 'TEST CLOUD PATIENT'); matched.push('name'); }
          else if (text.includes('Age')) { setVal(input, '45'); matched.push('age'); }
          else if (text.includes('Primary Phone')) { setVal(input, '+91 98200 88991'); matched.push('phone'); }
          else if (text.includes('Email Address')) { setVal(input, 'test.cloud@healthlink.org'); matched.push('email'); }
          else if (text.includes('Contact Name')) { setVal(input, 'Sunita Cloud'); matched.push('contactName'); }
          else if (text.includes('Relationship')) { setVal(input, 'Spouse'); matched.push('rel'); }
          else if (text.includes('Contact Phone')) { setVal(input, '+91 98200 88992'); matched.push('contactPhone'); }
        }

        const textarea = form.querySelector('textarea');
        if (textarea) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          setter.call(textarea, 'Bandra Kurla Complex, Mumbai');
          if (textarea._valueTracker) {
            textarea._valueTracker.setValue('');
          }
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.dispatchEvent(new Event('change', { bubbles: true }));
          matched.push('address');
        }

        // Click submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn) throw new Error('Submit button not found');
        submitBtn.click();

        return { matched, formValues: inputs.map(i => ({ id: i.id, val: i.value })), textareaVal: textarea?.value };
      })()
    `,
    returnByValue: true,
  });
  console.log('Form fill result from browser:', formRes);

  // Wait for network response and DB update
  await new Promise((r) => setTimeout(r, 2500));

  // 5. Verify creation in MongoDB Atlas
  console.log('[5/7] Verifying "TEST CLOUD PATIENT" directly in MongoDB Atlas...');
  const createdInAtlas = await PatientModel.findOne({ name: 'TEST CLOUD PATIENT' });
  if (!createdInAtlas) {
    throw new Error('❌ FAILED: TEST CLOUD PATIENT was not found in MongoDB Atlas!');
  }
  console.log('✅ [ATLAS CONFIRMED] Created Patient in MongoDB Atlas:');
  console.log(`   ID: ${createdInAtlas.id}`);
  console.log(`   Name: ${createdInAtlas.name}`);
  console.log(`   Phone: ${createdInAtlas.phone}`);
  console.log(`   Address: ${createdInAtlas.address}`);

  // 6. Edit Patient Phone Number through the UI
  console.log('[6/7] Editing patient phone number to "+91 98200 99999" through UI...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Find row for TEST CLOUD PATIENT
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent && r.textContent.includes('TEST CLOUD PATIENT'));
        if (!targetRow) throw new Error('Target row not found in UI');

        // Edit button is first button in actions column
        const editBtn = targetRow.querySelector('button[title="Edit Patient"]');
        if (!editBtn) throw new Error('Edit button not found in target row');
        editBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Update phone in edit modal and submit
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const form = document.querySelector('form');
        const labels = Array.from(form.querySelectorAll('label'));
        const phoneLabel = labels.find(l => l.textContent && l.textContent.includes('Primary Phone'));
        const phoneInput = phoneLabel.parentElement.querySelector('input');

        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(phoneInput, '+91 98200 99999');
        if (phoneInput._valueTracker) {
          phoneInput._valueTracker.setValue('');
        }
        phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        phoneInput.dispatchEvent(new Event('change', { bubbles: true }));

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2500));

  // Verify update in Atlas
  const updatedInAtlas = await PatientModel.findOne({ id: createdInAtlas.id });
  if (updatedInAtlas?.phone !== '+91 98200 99999') {
    throw new Error(`❌ FAILED: Phone number was not updated in Atlas! Current: ${updatedInAtlas?.phone}`);
  }
  console.log('✅ [ATLAS CONFIRMED] Updated Patient Phone Number in MongoDB Atlas:');
  console.log(`   Phone: ${updatedInAtlas.phone}`);

  // 7. Delete patient through the UI
  console.log('[7/7] Deleting patient through the UI...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const rows = Array.from(document.querySelectorAll('tr'));
        const targetRow = rows.find(r => r.textContent && r.textContent.includes('TEST CLOUD PATIENT'));
        const deleteBtn = targetRow.querySelector('button[title="Delete Record"]') || targetRow.querySelector('button[aria-label="Delete patient"]');
        if (!deleteBtn) throw new Error('Delete button not found in target row');
        deleteBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  // Confirm delete in Confirmation Dialog
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const confirmBtn = buttons.find(b => b.textContent && b.textContent.trim() === 'Delete');
        if (!confirmBtn) throw new Error('Confirmation delete button not found');
        confirmBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2500));

  // Verify deletion in Atlas
  const deletedInAtlas = await PatientModel.findOne({ id: createdInAtlas.id });
  if (deletedInAtlas !== null) {
    throw new Error('❌ FAILED: Patient document still exists in MongoDB Atlas after deletion!');
  }
  console.log('✅ [ATLAS CONFIRMED] Patient completely deleted from MongoDB Atlas: Document is null');

  console.log('\n=== COMPLETE BROWSER UI ↔ MONGODB ATLAS TEST PASSED SUCCESSFULLY ===');
  ws.close();
  process.exit(0);
}

runBrowserE2ETest().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
