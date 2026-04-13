(async function () {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Definição dos links do usuário
    const userLinks = [
        { href: 'dashboard.html', icon: iconHome(), label: 'Página Inicial' },
        { href: 'temas.html',     icon: iconTemas(), label: 'Temas' },
        { href: 'simulado.html',  icon: iconSimulado(), label: 'Simulados' },
        { href: 'estatisticas.html', icon: iconStats(), label: 'Estatísticas' },
        { href: 'favoritas.html', icon: iconStar(), label: 'Favoritas' },
        { href: 'caderno.html',   icon: iconCaderno(), label: 'Meu Caderno' },
    ];

    // Definição dos links de administrador
    const adminLinks = [
        { href: 'admin-usuarios.html',  icon: iconUsers(), label: 'Gerenciar Usuários' },
        { href: 'admin-questoes.html',  icon: iconQuestoes(), label: 'Gerenciar Questões' },
        { href: 'admin-temas.html',     icon: iconTemas(), label: 'Gerenciar Temas' },
    ];

    function navLink(l) {
        const active = page === l.href ? 'active' : '';
        return `
            <a href="${l.href}" class="sidebar-link ${active}">
                <div class="sidebar-link-icon">${l.icon}</div>
                <span>${l.label}</span>
            </a>`;
    }

    // Estrutura HTML com Estilo MedQuest Pro
    const html = `
    <style>
        :root {
            --sb-bg: #0f172a; /* Azul Marinho Profundo */
            --sb-text: #94a3b8;
            --sb-active-bg: #1e293b;
            --sb-active-text: #ffffff;
            --sb-accent: #2563eb;
            --sb-divider: #1e293b;
        }

        .sidebar {
            width: 260px;
            height: 100vh;
            background-color: var(--sb-bg);
            color: var(--sb-text);
            position: fixed;
            left: 0;
            top: 0;
            display: flex;
            flex-direction: column;
            padding: 1.5rem 0;
            z-index: 1000;
            border-right: 1px solid var(--sb-divider);
            transition: all 0.3s ease;
        }

        .sidebar-brand {
            padding: 0 1.5rem 2rem;
            display: flex;
            align-items: center;
            gap: 0.85rem;
        }

        .sidebar-brand-icon {
            background-color: var(--sb-accent);
            color: white;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;
            box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .sidebar-brand-name {
            color: white;
            font-weight: 700;
            font-size: 1.25rem;
            letter-spacing: -0.025em;
        }

        .sidebar-section-label {
            padding: 0 1.5rem 0.5rem;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #475569;
            margin-top: 1rem;
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1.5rem;
            color: var(--sb-text);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s;
            border-left: 3px solid transparent;
        }

        .sidebar-link:hover {
            color: white;
            background-color: var(--sb-active-bg);
        }

        .sidebar-link.active {
            background-color: var(--sb-active-bg);
            color: white;
            border-left-color: var(--sb-accent);
        }

        .sidebar-link-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.7;
        }

        .active .sidebar-link-icon {
            color: var(--sb-accent);
            opacity: 1;
        }

        .sidebar-divider {
            height: 1px;
            background-color: var(--sb-divider);
            margin: 1.5rem 1rem;
        }

        .sidebar-footer {
            margin-top: auto;
            padding: 0 1rem;
        }

        .sidebar-user-card {
            background-color: var(--sb-active-bg);
            border-radius: 12px;
            padding: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            cursor: pointer;
            transition: background 0.2s;
        }

        .sidebar-user-card:hover {
            background-color: #334155;
        }

        .sidebar-avatar {
            width: 36px;
            height: 36px;
            background-color: var(--sb-accent);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            flex-shrink: 0;
        }

        .sidebar-user-info {
            overflow: hidden;
            flex-grow: 1;
        }

        .sidebar-user-name {
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sidebar-user-email {
            font-size: 0.7rem;
            color: var(--sb-text);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn-logout-minimal {
            background: transparent;
            border: none;
            color: var(--sb-text);
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            transition: all 0.2s;
        }

        .btn-logout-minimal:hover {
            color: #ef4444;
            background-color: rgba(239, 68, 68, 0.1);
        }

        /* Ajuste para o conteúdo principal */
        body { padding-left: 260px; }
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            body { padding-left: 0; }
        }
    </style>

    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">MQ</div>
        <div class="sidebar-brand-name">MedQuest</div>
      </div>

      <div class="sidebar-section-label">Estudos</div>
      ${userLinks.map(navLink).join('')}

      <div id="sidebar-admin-section" style="display:none">
        <div class="sidebar-divider"></div>
        <div class="sidebar-section-label">Painel Admin</div>
        ${adminLinks.map(navLink).join('')}
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-user-card" onclick="window.location.href='perfil.html'">
          <div class="sidebar-avatar" id="sb-avatar">?</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name" id="sb-nome">...</div>
            <div class="sidebar-user-email" id="sb-email"></div>
          </div>
          <button class="btn-logout-minimal" onclick="event.stopPropagation();logout()" title="Sair">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>`;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Preenche perfil e lógica de autenticação
    const esperar = ms => new Promise(r => setTimeout(r, ms));
    let t = 0;
    while (!window.supabaseClient && t++ < 40) await esperar(80);
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) return;

    const user = session.user;
    const nome = user.user_metadata?.nome || user.email.split('@');
    document.getElementById('sb-avatar').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('sb-nome').textContent = nome;
    document.getElementById('sb-email').textContent = user.email;

    const perfil = await getPerfil(user.id);
    if (perfil?.role === 'admin') {
        document.getElementById('sidebar-admin-section').style.display = 'block';
    }
})();

/* SVG Icons */
function iconHome() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`; }
function iconTemas() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`; }
function iconSimulado() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`; }
function iconStats() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`; }
function iconStar() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function iconCaderno() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`; }
function iconUsers() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
function iconQuestoes() { return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`; }
