import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://aosvvxtfatgiamdbqmkq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvc3Z2eHRmYXRnaWFtZGJxbWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTg4NDYsImV4cCI6MjA5MjczNDg0Nn0.a8CgcBOFvNnX-Q-z3xLsCFVhL1HSN6Jb6eOiaodO55I';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
