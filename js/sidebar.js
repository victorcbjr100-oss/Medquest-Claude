// js/sidebar.js — MedQuest Pro (estética original)
(async function(){
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';

  const userLinks = [
    { href:'dashboard.html',    svg:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',          label:'Página Inicial' },
    { href:'temas.html',        svg:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>', label:'Temas' },
    { href:'simulado.html',     svg:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',                                             label:'Simulados' },
    { href:'estatisticas.html', svg:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',label:'Estatísticas' },
    { href:'favoritas.html',    svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',  label:'Favoritas' },
    { href:'caderno.html',      svg:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',         label:'Meu Caderno' },
    { href:'flashcards.html',   svg:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>',                            label:'Flashcards' },
  ];

  const adminLinks = [
    { href:'admin-questoes.html', svg:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',  label:'Gerenciar Questões' },
    { href:'admin-usuarios.html', svg:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',label:'Gerenciar Usuários' },
  ];

  function mkSvg(paths){
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
  }

  function mkLink(l){
    const active = page === l.href ? 'active' : '';
    return `<a href="${l.href}" class="sidebar-link ${active}">${mkSvg(l.svg)}<span>${l.label}</span></a>`;
  }

  const html = `
  <nav class="sidebar" id="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">M</div>
      <div>
        <div class="sidebar-brand-name">MedQuest</div>
        <div class="sidebar-brand-sub">Provas e Questões</div>
      </div>
    </div>

    <div class="sidebar-section">Navegação</div>
    ${userLinks.map(mkLink).join('')}

    <div id="sb-admin" style="display:none">
      <div class="sidebar-divider"></div>
      <div class="sidebar-section">Admin</div>
      ${adminLinks.map(mkLink).join('')}
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-user" onclick="window.location.href='perfil.html'">
        <div class="sidebar-avatar" id="sb-av">?</div>
        <div>
          <div class="sidebar-user-name" id="sb-nome">Carregando...</div>
          <div class="sidebar-user-email" id="sb-email"></div>
        </div>
        <button class="btn-logout-icon" title="Sair"
          onclick="event.stopPropagation(); logout()"
          aria-label="Sair">
          ${mkSvg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>')}
        </button>
      </div>
    </div>
  </nav>`;

  document.body.insertAdjacentHTML('afterbegin', html);

  // Aguarda supabase
  const wait = ms => new Promise(r => setTimeout(r, ms));
  let t = 0;
  while (!window.supabaseClient && t++ < 50) await wait(80);
  if (!window.supabaseClient) return;

  const { data:{ session } } = await window.supabaseClient.auth.getSession();
  if (!session){ window.location.href = 'index.html'; return; }

  const u = session.user;
  const nome = u.user_metadata?.nome || u.email.split('@')[0];
  document.getElementById('sb-av').textContent   = nome.charAt(0).toUpperCase();
  document.getElementById('sb-nome').textContent = nome;
  document.getElementById('sb-email').textContent = u.email;

  const { data: perfil } = await window.supabaseClient
    .from('perfis').select('role').eq('id', u.id).single();
  if (perfil?.role === 'admin')
    document.getElementById('sb-admin').style.display = 'block';
})();
