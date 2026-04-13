// js/supabase.js

const SUPABASE_URL = 'https://xkhwfudjcqmbhcdkpewr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhraHdmdWRqY3FtYmhjZGtwZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTAwMzQsImV4cCI6MjA4OTk2NjAzNH0.tOHjrpUCfqzt43b3MnC2sbCFXGJzFH95-p85lKGrwQI';

function initSupabase() {
  // ainda não carregou a lib
  if (!window.supabase || !window.supabase.createClient) {
    return false;
  }

  // já inicializado
  if (window.db) return true;

  const client = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  window.supabaseClient = client;
  window.db = client;

  console.log("✅ Supabase inicializado com sucesso");

  return true;
}

// tenta inicializar imediatamente
if (!initSupabase()) {
  // se ainda não carregou, fica tentando até carregar
  const interval = setInterval(() => {
    if (initSupabase()) {
      clearInterval(interval);
    }
  }, 50);

  // segurança extra (debug)
  setTimeout(() => {
    if (!window.db) {
      console.error("❌ Supabase não inicializou. Verifique a ordem dos scripts.");
    }
  }, 5000);
}
