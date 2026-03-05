import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key for backend operations if available, otherwise fallback to anon
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Specialized client for server-side operations (requires Service Role Key)
export const getSupabaseServer = () => {
    if (!supabaseServiceKey) {
        console.warn('SUPABASE_SERVICE_ROLE_KEY is missing. Falling back to anon key.');
        return supabase;
    }
    return createClient(supabaseUrl, supabaseServiceKey);
};
