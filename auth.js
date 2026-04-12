// js/auth.js
// Aguarda o cliente Supabase estar pronto
async function aguardarSupabase() {
    return new Promise((resolve) => {
        if (window.supabaseClient) return resolve(window.supabaseClient);
        const interval = setInterval(() => {
            if (window.supabaseClient) {
                clearInterval(interval);
                resolve(window.supabaseClient);
            }
        }, 100);
    });
}

// Redireciona para login se não estiver autenticado
async function exigirLogin() {
    const sb = await aguardarSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) {
        window.location.href = 'index.html';
        return null;
    }
    return session;
}

// Logout
async function logout() {
    const sb = await aguardarSupabase();
    await sb.auth.signOut();
    window.location.href = 'index.html';
}

// Retorna perfil do usuário logado (inclui role)
async function getPerfil() {
    const sb = await aguardarSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return null;
    const { data } = await sb.from('perfis').select('*').eq('id', session.user.id).single();
    return data;
}
