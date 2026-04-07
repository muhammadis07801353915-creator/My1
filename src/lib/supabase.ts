/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ojtnsvbofjfqabfdbigx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdG5zdmJvZmpmcWFiZmRiaWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0ODU4MTQsImV4cCI6MjA5MTA2MTgxNH0.sa1ZqHiD7VPgHYRcJeI-7YD01C54HqESaUtHhxLyRoE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
