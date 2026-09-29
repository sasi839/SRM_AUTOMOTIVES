import { createClient } from '@supabase/supabase-js';
// No dotenv

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('site_images')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching:', error);
  } else {
    console.log('Success fetched columns:', data && data.length > 0 ? Object.keys(data[0]) : 'no data');
  }
}
test();
