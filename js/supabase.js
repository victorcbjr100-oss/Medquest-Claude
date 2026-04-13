// js/supabase.js

const SUPABASE_URL = 'https://xkhwfudjcqmbhcdkpewr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraHdmdWRqY3FtYmhjZGtwZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTAwMzQsImV4cCI6MjA4OTk2NjAzNH0.tOHjrpUCfqzt43b3MnC2sbCFXGJzFH95-p85lKGrwQI';

// garante que a biblioteca carregou
if (typeof window.supabase !== 'undefined') {

  // cria o cliente UMA VEZ
  if (!window.supabaseClient) {

    const client = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    // 👉 usado no auth.js
    window.supabaseClient = client;

    // 👉 usado no resto do sistema (questões)
    window.db = client; // 🔥 usamos "db" pra não conflitar
  }
}
