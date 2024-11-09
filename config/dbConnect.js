// config/dbConnect.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();  // Load environment variables from .env file

// Initialize a Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL, // Your Supabase URL
    process.env.SUPABASE_KEY  // Your Supabase service role or anon key
);

export default supabase;
