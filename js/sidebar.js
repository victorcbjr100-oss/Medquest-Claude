// js/sidebar.js — MedQuest Pro
(async function(){
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';

  const userLinks=[
    {href:'dashboard.html',    icon:'🏠', label:'Página Inicial'},
    {href:'temas.html',        icon:'📚', label:'Temas'},
    {href:'simulado.html',     icon:'⏱️', label:'Simulados'},
    {href:'estatisticas.html', icon:'📊', label:'Estatísticas'},
    {href:'favoritas.html',    icon:'⭐', label:'Favoritas'},
    {href:'caderno.html',      icon:'📓', label:'Meu Caderno'},
    {href:'flashcards.html',   icon:'🃏', label:'Flashcards'},
  ];

  const adminLinks=[
    {href:'admin-questoes.html', icon:'📝', label:'Gerenciar Questões'},
    {href:'admin-usuarios.html', icon:'👥', label:'Gerenciar Usuários'},
  ];

  function link(l){
    const active = page===l.href ? 'active':'';
    return `<a href="${l.href}" class="sidebar-link ${active}">
      <span style="font-size:.95rem;width:18px;text-align:center">${l.icon}</span>
      <span>${l.label}</span>
    </a>`;
  }

  const css=`
  <style>
    .sidebar{position:fixed;top:0;left:0;width:220px;height:100vh;background:#fff;border-right:1px solid #e2e8f0;display:flex;flex-direction:column;z-index:200;overflow-y:auto;padding-bottom:1rem}
    .sb-brand{display:flex;align-items:center;gap:10px;padding:1.25rem 1rem 1rem;border-bottom:1px solid #f1f5f9;margin-bottom:.5rem}
    .sb-brand-icon{width:36px;height:36px;border-radius:10px;background:#2563eb;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.95rem;font-weight:800;flex-shrink:0}
    .sb-brand-name{font-weight:800;font-size:.95rem;color:#1e293b}
    .sb-brand-sub{font-size:.68rem;color:#64748b}
    .sb-section{padding:.75rem 1rem .25rem;font-size:.65rem;font-weight:700;letter-spacing:.08em;color:#94a3b8;text-transform:uppercase}
    .sidebar-link{display:flex;align-items:center;gap:10px;padding:.55rem .9rem;margin:1px .5rem;border-radius:8px;color:#64748b;text-decoration:none;font-size:.85rem;font-weight:500;transition:all .15s;font-family:'Inter',sans-serif}
    .sidebar-link:hover{background:#f8fafc;color:#1e293b}
    .sidebar-link.active{background:#eff6ff;color:#2563eb;font-weight:700}
    .sb-divider{height:1px;background:#f1f5f9;margin:.5rem 1rem}
    .sb-footer{margin-top:auto;border-top:1px solid #f1f5f9;padding:.75rem 1rem 0}
    .sb-user{display:flex;align-items:center;gap:10px;padding:.5rem .4rem;border-radius:8px;cursor:pointer;transition:background .15s}
    .sb-user:hover{background:#f8fafc}
    .sb-av{width:32px;height:32px;border-radius:50%;background:#2563eb;color:#fff;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;flex-shrink:0}
    .sb-nome{font-size:.82rem;font-weight:700;color:#1e293b}
    .sb-email{font-size:.7rem;color:#94a3b8;max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .sb-logout{margin-left:auto;color:#94a3b8;cursor:pointer;padding:4px;border-radius:4px;background:none;border:none;font-size:1rem;line-height:1}
    .sb-logout:hover{color:#ef4444}
    .main-content{margin-left:220px!important}
    @media(max-width:768px){.sidebar{display:none}.main-content{margin-left:0!important}}
  </style>`;

  const html=`${css}
  <aside class="sidebar">
    <div class="sb-brand">
      <div class="sb-brand-icon">MQ</div>
      <div><div class="sb-brand-name">MedQuest</div><div class="sb-brand-sub">Provas e Questões</div></div>
    </div>
    <div class="sb-section">Estudos</div>
    ${userLinks.map(link).join('')}
    <div id="sb-admin-wrap" style="display:none">
      <div class="sb-divider"></div>
      <div class="sb-section">Admin</div>
      ${adminLinks.map(link).join('')}
    </div>
    <div class="sb-footer">
      <div class="sb-user" onclick="window.location.href='perfil.html'">
        <div class="sb-av" id="sb-av">?</div>
        <div>
          <div class="sb-nome" id="sb-nome">...</div>
          <div class="sb-email" id="sb-email"></div>
        </div>
        <button class="sb-logout" title="Sair" onclick="event.stopPropagation();logout()">↪</button>
      </div>
    </div>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', html);

  // Preenche dados do usuário
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  let tries=0;
  while(!window.supabaseClient && tries++<40) await wait(80);
  if(!window.supabaseClient) return;

  const {data:{session}}=await window.supabaseClient.auth.getSession();
  if(!session){ window.location.href='index.html'; return; }

  const user=session.user;
  const nome=user.user_metadata?.nome||user.email.split('@')[0];
  document.getElementById('sb-av').textContent=nome.charAt(0).toUpperCase();
  document.getElementById('sb-nome').textContent=nome;
  document.getElementById('sb-email').textContent=user.email;

  // Verifica se é admin
  const {data:perfil}=await window.supabaseClient.from('perfis').select('role').eq('id',user.id).single();
  if(perfil?.role==='admin') document.getElementById('sb-admin-wrap').style.display='block';
})();
