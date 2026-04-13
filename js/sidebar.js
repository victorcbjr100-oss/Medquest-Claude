// js/sidebar.js
(async function () {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';

    const userLinks = [
        { href: 'dashboard.html', icon: iconHome(), label: 'Página Inicial' },
        { href: 'temas.html',     icon: iconTemas(), label: 'Temas' },
        { href: 'simulado.html',  icon: iconSimulado(), label: 'Simulados' },
        { href: 'estatisticas.html', icon: iconStats(), label: 'Estatísticas' },
        { href: 'favoritas.html', icon: iconStar(), label: 'Favoritas' },
        { href: 'caderno.html',   icon: iconCaderno(), label: 'Meu Caderno' },
    ];

    const adminLinks = [
        { href: 'admin-usuarios.html',  icon: iconUsers(), label: 'Gerenciar Usuários' },
        { href: 'admin-questoes.html',  icon: iconQuestoes(), label: 'Gerenciar Questões' },
        { href: 'admin-temas.html',     icon: iconTemas(), label: 'Gerenciar Temas' },
    ];

    function navLink(l) {
        const active = page === l.href ? 'active' : '';
        return `<a href="${l.href}" class="sidebar-link ${active}">${l.icon}<span>${l.label}</span></a>`;
    }

    const html = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">M</div>
        <div><div class="sidebar-brand-name">MedQuest</div><div class="sidebar-brand-sub">Provas e Questões</div></div>
      </div>

      <div class="sidebar-section">Navegação</div>
      ${userLinks.map(navLink).join('')}

      <div id="sidebar-admin-section" style="display:none">
        <div class="sidebar-divider"></div>
        <div class="sidebar-section">Admin</div>
        ${adminLinks.map(navLink).join('')}
      </div>

      <div class="sidebar-divider" style="margin-top:auto"></div>

      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="window.location.href='perfil.html'">
          <div class="sidebar-avatar" id="sb-avatar">?</div>
          <div>
            <div class="sidebar-user-name" id="sb-nome">...</div>
            <div class="sidebar-user-email" id="sb-email"></div>
          </div>
          <button class="btn-logout-icon" onclick="event.stopPropagation();logout()" title="Sair">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>`;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Preenche perfil
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    let t = 0;
    while (!window.supabaseClient && t++ < 40) await esperar(80);
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) return;

    const user = session.user;
    const nome = user.user_metadata?.nome || user.email.split('@')[0];
    document.getElementById('sb-avatar').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('sb-nome').textContent = nome;
    document.getElementById('sb-email').textContent = user.email;

    const perfil = await getPerfil(user.id);
    if (perfil?.role === 'admin') {
        document.getElementById('sidebar-admin-section').style.display = 'block';
    }
})();

/* SVG Icons */
function iconHome() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`; }
function iconTemas() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`; }
function iconSimulado() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`; }
function iconStats() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`; }
function iconStar() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function iconCaderno() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`; }
function iconUsers() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
function iconQuestoes() { return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`; }
