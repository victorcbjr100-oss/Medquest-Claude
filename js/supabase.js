// js/supabase.js

const SUPABASE_URL = 'https://xkhwfudjcqmbhcdkpewr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

// 🔥 cria cliente UMA VEZ só
if (typeof window.supabaseClient === 'undefined') {

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  // 👉 mantém compatibilidade com sistema antigo (login)
  window.supabaseClient = client;

  // 👉 novo padrão (usado nas questões)
  window.supabase = client;
}
