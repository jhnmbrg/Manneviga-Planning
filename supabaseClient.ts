import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
      'Set them in .env.local for local dev and in the Vercel project settings for production.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// All Manneviga data lives in these four prefixed tables inside the shared project.
export const TABLES = {
  bookings: 'manneviga_bookings',
  events: 'manneviga_events',
  tasks: 'manneviga_tasks',
  memories: 'manneviga_memories',
} as const;
