// sidebar.js — injeta a sidebar em todas as páginas
(function () {
    const paginaAtual = window.location.pathname.split('/').pop() || 'dashboard.html';

    const links = [
        { href: 'dashboard.html', icon: '⊞', label: 'Dashboard' },
        { href: 'questoes.html',  icon: '✎', label: 'Questões' },
        { href: 'simulado.html',  icon: '⏱', label: 'Simulado' },
        { href: 'caderno.html',   icon: '★', label: 'Meu Caderno' },
    ];

    const navHTML = links.map(l => `
        <a href="${l.href}" class="sidebar-link ${paginaAtual === l.href ? 'active' : ''}">
            <span class="sidebar-icon">${l.icon}</span>
            <span>${l.label}</span>
        </a>
    `).join('');

    const html = `
        <style>
            .sidebar {
                position: fixed; top: 0; left: 0; height: 100vh; width: 16rem;
                background: #0d1117; border-right: 1px solid #21262d;
                display: flex; flex-direction: column; z-index: 100; padding: 1.5rem 1rem;
                font-family: 'DM Sans', sans-serif;
            }
            .sidebar-logo {
                font-family: 'Sora', sans-serif; font-size: 1.2rem; font-weight: 700;
                color: #e6edf3; padding: 0.5rem 0.75rem; margin-bottom: 2rem; letter-spacing: -0.3px;
            }
            .sidebar-logo span { color: #3b82f6; }
            .sidebar-link {
                display: flex; align-items: center; gap: 0.75rem;
                padding: 0.65rem 0.75rem; border-radius: 8px;
                color: #7d8590; text-decoration: none; font-size: 0.9rem; font-weight: 500;
                transition: all 0.15s; margin-bottom: 0.25rem;
            }
            .sidebar-link:hover { background: #161b22; color: #e6edf3; }
            .sidebar-link.active { background: rgba(59,130,246,0.15); color: #3b82f6; }
            .sidebar-icon { font-size: 1rem; width: 20px; text-align: center; }
            .sidebar-bottom {
                margin-top: auto; border-top: 1px solid #21262d; padding-top: 1rem;
            }
            .sidebar-perfil {
                display: flex; align-items: center; gap: 0.75rem;
                padding: 0.5rem 0.75rem; border-radius: 8px; margin-bottom: 0.5rem;
            }
            .sidebar-avatar {
                width: 32px; height: 32px; border-radius: 50%;
                background: #3b82f6; display: flex; align-items: center; justify-content: center;
                font-size: 0.8rem; font-weight: 700; color: #fff; flex-shrink: 0;
            }
            .sidebar-nome { font-size: 0.85rem; color: #e6edf3; font-weight: 500; }
            .sidebar-email { font-size: 0.75rem; color: #7d8590; }
            .btn-logout {
                width: 100%; padding: 0.6rem; background: transparent;
                border: 1px solid #21262d; border-radius: 8px;
                color: #7d8590; font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
                cursor: pointer; transition: all 0.15s;
            }
            .btn-logout:hover { background: rgba(248,81,73,0.1); color: #f85149; border-color: rgba(248,81,73,0.3); }
            @media (max-width: 768px) { .sidebar { display: none; } }
        </style>
        <nav class="sidebar">
            <div class="sidebar-logo">Med<span>Quest</span> Pro</div>
            <div id="sidebar-nav">${navHTML}</div>
            <div class="sidebar-bottom">
                <div class="sidebar-perfil">
                    <div class="sidebar-avatar" id="sidebar-avatar">?</div>
                    <div>
                        <div class="sidebar-nome" id="sidebar-nome">Carregando...</div>
                        <div class="sidebar-email" id="sidebar-email"></div>
                    </div>
                </div>
                <button class="btn-logout" onclick="logout()">Sair</button>
            </div>
        </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', html);

    // Preenche dados do usuário na sidebar
    async function preencherPerfil() {
        const esperar = (ms) => new Promise(r => setTimeout(r, ms));
        let t = 0;
        while (!window.supabaseClient && t++ < 30) await esperar(100);
        if (!window.supabaseClient) return;

        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) { window.location.href = 'index.html'; return; }

        const user = session.user;
        const email = user.email || '';
        const nome = user.user_metadata?.nome || email.split('@')[0];
        const inicial = nome.charAt(0).toUpperCase();

        document.getElementById('sidebar-avatar').textContent = inicial;
        document.getElementById('sidebar-nome').textContent = nome;
        document.getElementById('sidebar-email').textContent = email;
    }

    preencherPerfil();
})();
