import { createClient } from '@supabase/supabase-js';

// TODO : Add your credentials
export const admin = createClient(
	'URL',
	'service_role'
);

// TODO: Create new key
export const key = 'KEY';