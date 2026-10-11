import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data, error } = await supabase
    .from('site_images')
    .select('*')
    .eq('section', 'service')
    .eq('title', 'Electrical Work');

  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Electrical Work already exists in DB!');
  } else {
    console.log('Inserting Electrical Work into DB...');
    const { error: insertError } = await supabase.from('site_images').insert({
      section: 'service',
      title: 'Electrical Work',
      subtitle: 'Expert auto electrical troubleshooting, wiring repairs, and electronic diagnostics in S.V. Autonagar, Tirupati.',
      image_url: 'https://images.unsplash.com/photo-1563261683-9e4ba6f4526d?auto=format&fit=crop&w=800&q=80',
      display_order: 11,
      is_active: true
    });
    if (insertError) {
      console.error('Error inserting:', insertError);
    } else {
      console.log('Successfully inserted Electrical Work!');
    }
  }
}
fix();
