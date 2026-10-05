import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = process.env.VITE_SUPABASE_URL;
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = value;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value;
    }
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase environment variables missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runVerification() {
  console.log('=== SRM AUTOMOTIVES: Phase 2.1 Billing Database Verification ===');
  console.log(`Connecting to Supabase instance: ${supabaseUrl}`);

  // 1. Check existing tables safety
  console.log('\n--- 1. Checking Existing Tables Safety ---');
  const { data: existingSiteContent, error: siteErr } = await supabase
    .from('site_content')
    .select('business_name')
    .limit(1);

  if (siteErr) {
    console.error('Error reading site_content:', siteErr.message);
  } else {
    console.log('✅ Existing site_content table untouched and functional. Sample:', existingSiteContent);
  }

  // 2. Test billing_works table
  console.log('\n--- 2. Testing billing_works Table ---');
  const testWorkName = `Test Work Service ${Date.now()}`;
  const { data: workData, error: workErr } = await supabase
    .from('billing_works')
    .insert([{
      work_name: testWorkName,
      work_type: 'Labour',
      is_active: true
    }])
    .select()
    .single();

  if (workErr) {
    console.warn('Notice: billing_works table insert response:', workErr.message);
    if (workErr.code === '42P01') { // table does not exist yet
      console.log('ℹ️ Billing tables need to be created in Supabase Dashboard SQL Editor using the migration file:');
      console.log('   billing-app/supabase/migrations/20260930000000_billing_schema.sql');
    }
    return;
  }

  console.log('✅ Stored work in catalogue successfully:', workData);

  // 3. Test billing_invoices table & uniqueness constraint
  console.log('\n--- 3. Testing billing_invoices Table & Uniqueness ---');
  const testInvoiceNo = `INV-TEST-${Math.floor(1000 + Math.random() * 9000)}`;
  const { data: invoiceData, error: invoiceErr } = await supabase
    .from('billing_invoices')
    .insert([{
      invoice_number: testInvoiceNo,
      number_plate: 'TN38AB1234',
      mobile_number: '9876543210',
      grand_total: 2500.00
    }])
    .select()
    .single();

  if (invoiceErr) {
    console.error('Error inserting invoice:', invoiceErr.message);
    return;
  }
  console.log('✅ Stored bill successfully:', invoiceData);

  // Test Unique Constraint on invoice_number
  const { error: duplicateErr } = await supabase
    .from('billing_invoices')
    .insert([{
      invoice_number: testInvoiceNo, // duplicate
      number_plate: 'TN38AB9999',
      grand_total: 1000.00
    }]);

  if (duplicateErr) {
    console.log('✅ Unique constraint verified on invoice_number! Prevented duplicate:', duplicateErr.message);
  } else {
    console.error('❌ Warning: Unique constraint on invoice_number failed!');
  }

  // 4. Test billing_invoice_items with Work Reference & Snapshots
  console.log('\n--- 4. Testing Multiple Bill Items & Snapshots ---');
  const itemsToInsert = [
    {
      invoice_id: invoiceData.id,
      work_id: workData.id,
      s_no: 1,
      work_name: workData.work_name, // Snapshot
      work_type: workData.work_type, // Snapshot
      quantity: 1,
      rate: 1500.00,
      amount: 1500.00
    },
    {
      invoice_id: invoiceData.id,
      work_id: null,
      s_no: 2,
      work_name: 'Engine Oil Synthetic (4L)', // Snapshot
      work_type: 'Part', // Snapshot
      quantity: 2,
      rate: 500.00,
      amount: 1000.00
    }
  ];

  const { data: itemsData, error: itemsErr } = await supabase
    .from('billing_invoice_items')
    .insert(itemsToInsert)
    .select();

  if (itemsErr) {
    console.error('Error inserting bill items:', itemsErr.message);
    return;
  }
  console.log(`✅ Successfully stored ${itemsData.length} items for bill #${testInvoiceNo}:`);
  console.table(itemsData.map(i => ({
    s_no: i.s_no,
    work: i.work_name,
    type: i.work_type,
    qty: i.quantity,
    rate: i.rate,
    amount: i.amount,
    work_id: i.work_id || 'null'
  })));

  // 5. Query Relationship (Bill -> Bill Items -> Work Catalogue)
  console.log('\n--- 5. Testing Relational Query (Bill -> Items -> Work Catalogue) ---');
  const { data: relData, error: relErr } = await supabase
    .from('billing_invoices')
    .select(`
      *,
      items:billing_invoice_items(
        *,
        work:billing_works(*)
      )
    `)
    .eq('id', invoiceData.id)
    .single();

  if (relErr) {
    console.error('Error querying relationships:', relErr.message);
  } else {
    console.log('✅ Relational join successful! Data structure:');
    console.log(JSON.stringify(relData, null, 2));
  }

  // Cleanup test records
  console.log('\n--- 6. Cleaning Up Test Data ---');
  await supabase.from('billing_invoices').delete().eq('id', invoiceData.id);
  await supabase.from('billing_works').delete().eq('id', workData.id);
  console.log('✅ Test records cleaned up safely.');
  console.log('\n=== Phase 2.1 Verification Complete ===');
}

runVerification();
