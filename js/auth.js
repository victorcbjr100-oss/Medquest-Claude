// js/auth.js
async function aguardarSupabase() {
    return new Promise(resolve => {
        if (window.supabaseClient) return resolve(window.supabaseClient);
        const t = setInterval(() => { if (window.supabaseClient) { clearInterval(t); resolve(window.supabaseClient); } }, 80);
    });
}

async function exigirLogin() {
    const sb = await aguardarSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { window.location.href = 'index.html'; return null; }
    return session;
}

async function getPerfil(uid) {
    const sb = await aguardarSupabase();
    const { data } = await sb.from('perfis').select('*').eq('id', uid).single();
    return data;
}

async function logout() {
    const sb = await aguardarSupabase();
    await sb.auth.signOut();
    window.location.href = 'index.html';
}

function parseOpcoes(opcoes) {
    if (Array.isArray(opcoes)) return opcoes;
    if (typeof opcoes === 'string') {
        try { return JSON.parse(opcoes); } catch { return opcoes.split(',').map(s => s.trim()); }
    }
    return [];
}
