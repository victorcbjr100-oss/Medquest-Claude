(async function () {
    const page = window.location.pathname.split('/').pop() || 'dashboard.html';

    // Definição dos links do usuário com ícones SVG (Estilo Clean/Dark)
    const userLinks = [
        { href: 'dashboard.html', icon: iconHome(), label: 'Página Inicial' },
        { href: 'temas.html', icon: iconTemas(), label: 'Temas' },
        { href: 'simulado.html', icon: iconSimulado(), label: 'Simulados' },
        { href: 'estatisticas.html', icon: iconStats(), label: 'Estatísticas' },
        { href: 'favoritas.html', icon: iconStar(), label: 'Favoritas' },
        { href: 'caderno.html', icon: iconCaderno(), label: 'Meu Caderno' },
        { href: 'flashcards.html', icon: iconCards(), label: 'Flashcards' },
    ];

    const adminLinks = [
        { href: 'admin-questoes.html', icon: iconEdit(), label: 'Gerenciar Questões' },
        { href: 'admin-usuarios.html', icon: iconUsers(), label: 'Gerenciar Usuários' },
    ];

    function renderLink(l) {
        const active = page === l.href ? 'active' : '';
        return `
            <a href="${l.href}" class="sidebar-link ${active}">
                <div class="sidebar-icon-wrapper">${l.icon}</div>
                <span>${l.label}</span>
            </a>`;
    }

    const css = `
    <style>
        :root {
            /* Cores Dark Mode MEDq */
            --mq-primary: #3b82f6; /* Azul mais brilhante para contraste no escuro */
            --mq-sidebar-bg: #0f172a; /* Azul Marinho Muito Escuro (Slate 900) */
            --mq-sidebar-width: 250px;
            
            --mq-text-main: #f1f5f9; /* Cinza Quase Branco (Slate 100) */
            --mq-text-muted: #94a3b8; /* Cinza Médio (Slate 400) */
            --mq-border: #1e293b; /* Azul Escuro Suave (Slate 800) */
            
            --mq-hover-bg: #1e293b; /* Slate 800 */
            --mq-active-bg: rgba(59, 130, 246, 0.1); /* Azul Primário Transparente */
        }

        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: var(--mq-sidebar-width);
            height: 100vh;
            background: var(--mq-sidebar-bg);
            border-right: 1px solid var(--mq-border);
            display: flex;
            flex-direction: column;
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            transition: all 0.3s ease;
            box-shadow: 10px 0 30px rgba(0,0,0,0.1);
        }

        .sb-brand {
            padding: 1.75rem 1.5rem;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid var(--mq-border);
        }

        .sb-brand-icon {
            width: 40px;
            height: 40px;
            border-radius: 12px;
            background: var(--mq-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 800;
            font-size: 1rem;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .sb-brand-name {
            font-weight: 800;
            font-size: 1.2rem;
            color: #ffffff;
            letter-spacing: -0.03em;
        }

        .sb-section-title {
            padding: 1.5rem 1.5rem 0.6rem;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            color: #475569; /* Slate 600 para rótulos de seção */
        }

        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 0.75rem 1.5rem;
            margin: 2px 0.75rem;
            border-radius: 10px;
            color: var(--mq-text-main);
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
            border-left: 3px solid transparent; /* Indicador de ativo lateral */
        }

        .sidebar-link:hover {
            background: var(--mq-hover-bg);
            color: #ffffff;
        }

        .sidebar-link.active {
            background: var(--mq-active-bg);
            color: var(--mq-primary);
            font-weight: 700;
            border-left-color: var(--mq-primary);
        }

        .sidebar-icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            color: var(--mq-text-muted); /* Ícones padrão em cinza */
        }

        .sidebar-link:hover .sidebar-icon-wrapper {
            color: #ffffff;
        }

        .sidebar-link.active .sidebar-icon-wrapper {
            color: var(--mq-primary);
        }

        .sb-divider {
            height: 1px;
            background: var(--mq-border);
            margin: 1.25rem 1.5rem;
        }

        .sb-footer {
            margin-top: auto;
            padding: 1rem;
            border-top: 1px solid var(--mq-border);
            background: rgba(0,0,0,0.1); /* Leve destaque no fundo do rodapé */
        }

        .sb-user-card {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 0.75rem;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .sb-user-card:hover {
            background: var(--mq-hover-bg);
        }

        .sb-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--mq-hover-bg); /* Fundo escuro para o avatar vazio */
            color: var(--mq-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.9rem;
            border: 2px solid var(--mq-border);
        }

        .sb-user-info {
            flex: 1;
            min-width: 0;
        }

        .sb-user-name {
            font-size: 0.85rem;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .sb-user-email {
            font-size: 0.7rem;
            color: var(--mq-text-muted);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .btn-logout {
            color: var(--mq-text-muted);
            background: none;
            border: none;
            padding: 6px;
            cursor: pointer;
            border-radius: 8px;
            display: flex;
            align-items: center;
            transition: all 0.2s;
        }

        .btn-logout:hover {
            color: #ef4444; /* Vermelho no hover do logout */
            background: rgba(239, 68, 68, 0.1);
        }

        /* Ajuste do conteúdo principal para refletir a nova largura da sidebar */
        body { padding-left: var(--mq-sidebar-width); }
        @media (max-width: 768px) {
            .sidebar { transform: translateX(-100%); }
            body { padding-left: 0; }
        }
    </style>`;

    const html = `
    ${css}
    <aside class="sidebar">
        <div class="sb-brand">
            <div class="sb-brand-icon">MQ</div>
            <div class="sb-brand-name">MedQuest</div>
        </div>

        <div class="sb-section-title">Menu Principal</div>
        ${userLinks.map(renderLink).join('')}

        <div id="sb-admin-wrap" style="display:none">
            <div class="sb-divider"></div>
            <div class="sb-section-title">Administração</div>
            ${adminLinks.map(renderLink).join('')}
        </div>

        <div class="sb-footer">
            <div class="sb-user-card" onclick="window.location.href='perfil.html'">
                <div class="sb-avatar" id="sb-avatar-el">?</div>
                <div class="sb-user-info">
                    <div class="sb-user-name" id="sb-user-name-el">...</div>
                    <div class="sb-user-email" id="sb-user-email-el"></div>
                </div>
                <button class="btn-logout" title="Sair" onclick="event.stopPropagation();logout()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </button>
            </div>
        </div>
    </aside>`;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Lógica de Autenticação e Preenchimento (Mantida a mesma)
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let attempts = 0;
    while (!window.supabaseClient && attempts++ < 40) await wait(80);
    if (!window.supabaseClient) return;

    const { data: { session } } = await window.supabaseClient.auth.getSession();
    if (!session) { 
        if (!window.location.pathname.includes('index.html')) window.location.href = 'index.html';
        return; 
    }

    const user = session.user;
    const nome = user.user_metadata?.nome || user.email.split('@');
    
    document.getElementById('sb-avatar-el').textContent = nome.charAt(0).toUpperCase();
    document.getElementById('sb-user-name-el').textContent = nome;
    document.getElementById('sb-user-email-el').textContent = user.email;

    const { data: profile } = await window.supabaseClient.from('perfis').select('role').eq('id', user.id).single();
    if (profile?.role === 'admin') {
        document.getElementById('sb-admin-wrap').style.display = 'block';
    }
})();

/* Ícones SVG - Mantidos os mesmos da versão clean, funcionam bem no Dark */
function iconHome() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`; }
function iconTemas() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`; }
function iconSimulado() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`; }
function iconStats() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`; }
function iconStar() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`; }
function iconCaderno() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`; }
function iconCards() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 8h10"/></svg>`; }
function iconEdit() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`; }
function iconUsers() { return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`; }
