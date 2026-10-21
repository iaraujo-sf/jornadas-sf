/* ============================================================================
   Experiência interativa · Suzano + Salesforce
   Roda depois do shell da skill (carregado com defer). Usa as globais do shell:
   `slides` (array de .slide) e `go(i)`. Os dados (cenas, produtos, bastidores)
   vêm de app/dados.js, gerado por tools/gen_slides.py.

   Teclas próprias (livres no shell): J mapa · M mandala · B bastidores · N notas · I jornadas
   ============================================================================ */
(function () {
  const XP = window.XP;
  if (!XP || typeof slides === 'undefined') return;
  const frame = document.getElementById('frame');
  const PROD = Object.fromEntries(XP.produtos.map(p => [p.id, p]));
  const CENA = Object.fromEntries(XP.cenas.map(c => [c.id, c]));
  const SELO = { casa: 'Já na Suzano', novo: 'Novo no que já é seu', conecta: 'Conecta' };

  // Todo o markup montado aqui vem de dados.js e dos próprios slides (conteúdo
  // estático, escrito por nós), nunca de entrada de usuário.
  function setHTML(node, html) { node.replaceChildren(document.createRange().createContextualFragment(html)); }

  // cenas em que cada produto aparece (derivado dos bastidores)
  const prodCenas = {};
  Object.entries(XP.bastidores).forEach(([cid, b]) => (b.itens || []).forEach(it => {
    (prodCenas[it.p] = prodCenas[it.p] || []).includes(cid) || prodCenas[it.p].push(cid);
  }));

  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) setHTML(e, html); return e; };
  const ativo = () => document.querySelector('.slide.active');
  const editando = () => document.body.classList.contains('edit-on');

  const srcIcone = (f) => 'assets/lib/' + (f.includes('/') ? f : 'icon-library-2d/' + f);
  function icone(p) {
    if (p.icone) return `<img src="${srcIcone(p.icone)}" alt="">`;
    const ini = p.nome.replace(/[^A-Za-zÀ-ú ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('');
    return `<span style="width:34px;height:34px;border-radius:50%;background:#032D60;color:#fff;display:inline-flex;align-items:center;justify-content:center;font:700 12px var(--body)">${ini}</span>`;
  }
  const selo = (s) => `<span class="selo ${s}">${s === 'novo' ? '✨ ' : s === 'casa' ? '● ' : '🔗 '}${SELO[s]}</span>`;

  /* ---------- navegação por cena ---------- */
  function idxDe(ref) {
    const [cid, passo] = String(ref).split(':');
    let i = slides.findIndex(s => s.dataset.scene === cid && String(s.dataset.step || 1) === String(passo || 1));
    if (i < 0) i = slides.findIndex(s => s.dataset.scene === cid);
    return i;
  }
  // Saltos (cartões, botões de escolha, mapa, mandala) ficam numa pilha: o ← logo depois
  // de um salto volta para onde se estava, em vez de cair no slide anterior da sequência.
  const saltos = [];
  function irPara(ref) {
    const i = idxDe(ref); if (i < 0) return;
    const de = slides.indexOf(ativo());
    fecharOverlays();
    if (de >= 0 && de !== i && Math.abs(de - i) > 1) saltos.push({ de, para: i });
    go(i);
  }
  function voltarSalto() {
    const aqui = slides.indexOf(ativo()), t = saltos[saltos.length - 1];
    if (!t || t.para !== aqui) return false;
    saltos.pop(); go(t.de); return true;
  }
  frame.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (!b || editando()) return;
    e.preventDefault(); irPara(b.dataset.go);
  });

  /* ---------- tela real ou ilustrativa ---------- */
  document.querySelectorAll('.tela[data-t]').forEach(t => {
    const real = t.querySelector('.tela-real');
    if (!real) return;
    const src = real.dataset.src;
    const probe = new Image();
    probe.onload = () => { real.src = src; t.classList.add('is-real'); if (t.closest('.slide.active')) pontos(t.closest('.slide')); };
    probe.src = src;
  });

  /* ---------- caixinhas de explicação (subpassos) ----------
     Nada para clicar. A 1ª caixinha abre sozinha quando a tela termina de entrar;
     cada → / espaço abre a próxima, e só depois da última o slide avança. ← fecha
     a última aberta. Só a atual fica aberta; as anteriores voltam a ser só o número,
     para a tela de fundo continuar visível. */
  const HS_INICIO = 1100;
  const nPops = (slide) => slide.querySelectorAll('.hs-pop').length;
  function mostrar(slide) {
    const n = slide._hsN = Math.min(slide._hsN || 0, nPops(slide));
    Array.from(slide.querySelectorAll('.hs-pop')).forEach((p, k) => {
      p.classList.toggle('on', k === n - 1);           // só a caixinha atual fica aberta
      p._dot.classList.toggle('on', k < n); p._dot.classList.toggle('visto', k < n - 1);
    });
  }
  function posNoTela(a, tela) {
    let x = 0, y = 0, n = a;
    while (n && n !== tela) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return [x, y];
  }
  function pontos(slide) {
    slide.querySelectorAll('.tela').forEach(tela => {
      tela.querySelectorAll('.hs, .hs-pop').forEach(n => n.remove());
      const real = tela.classList.contains('is-real');
      Array.from(tela.querySelectorAll('.hs-a')).forEach((a, k) => {
        let x, y;
        if (real) {
          const r = (a.dataset.real || '').split(',').map(Number);
          if (r.length === 2 && !isNaN(r[0])) { x = r[0] / 100 * tela.offsetWidth; y = r[1] / 100 * tela.offsetHeight; }
          else { x = tela.offsetWidth - 18; y = 24 + k * 34; }
        } else { [x, y] = posNoTela(a, tela); }
        const dot = el('span', 'hs', a.dataset.n);
        dot.style.left = x + 'px'; dot.style.top = y + 'px';
        const pop = el('div', 'hs-pop', a.dataset.tip);
        const esq = x > tela.offsetWidth - 256;
        pop.style.left = (esq ? x - 244 : x + 18) + 'px';
        pop.style.top = Math.max(4, Math.min(y - 14, tela.offsetHeight - 90)) + 'px';
        pop._dot = dot;
        tela.appendChild(dot); tela.appendChild(pop);
      });
    });
    mostrar(slide);
  }
  // → abre a próxima caixinha antes de avançar; ← fecha a última. Captura: roda antes do shell.
  const livre = () => !editando() && !ovMapa.classList.contains('on') && !ovMand.classList.contains('on') && !document.body.classList.contains('overview-on');
  function subpasso(dir) {
    const s = ativo(); if (!s || !livre()) return false;
    const tot = nPops(s), n = Math.min(s._hsN || 0, tot);
    if (dir > 0 && n < tot) { s._hsN = n + 1; mostrar(s); return true; }
    if (dir < 0 && n > 1) { s._hsN = n - 1; mostrar(s); return true; }
    if (dir < 0) return voltarSalto();
    return false;
  }
  window.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const dir = ['ArrowRight', ' ', 'PageDown'].includes(e.key) ? 1 : ['ArrowLeft', 'PageUp'].includes(e.key) ? -1 : 0;
    if (dir && subpasso(dir)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  window.addEventListener('click', e => {
    const b = e.target.closest('#next, #prev'); if (!b) return;
    if (subpasso(b.id === 'next' ? 1 : -1)) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  /* ---------- Bastidores (B) ---------- */
  const bast = el('aside'); bast.id = 'xp-bast'; frame.appendChild(bast);
  function preencherBast(slide) {
    const cid = slide && slide.dataset.scene;
    const b = cid && XP.bastidores[cid];
    const c = cid && CENA[cid];
    if (!b) {
      setHTML(bast, `<div class="bt-eyebrow">Bastidores</div><div class="bt-title">Esta tela não tem bastidores</div><div class="bt-vazio">Abra o mapa da jornada (J) ou a mandala (M) para escolher uma cena.</div>`);
      return;
    }
    const itens = b.itens.map(it => {
      const p = PROD[it.p] || { nome: it.p };
      const selos = (it.selos || [p.selo]).map(selo).join('') + (p.evolucao ? '<span class="selo evolucao">em evolução</span>' : '');
      return `<div class="bt-item">${icone(p)}<div><div class="bt-nome">${it.nome || p.nome}</div><div class="bt-selos">${selos}</div><div class="bt-nota">${it.nota || ''}</div></div></div>`;
    }).join('');
    setHTML(bast, `<div class="bt-eyebrow">Bastidores · ${c ? c.codigo : cid}</div><div class="bt-title">${c ? c.titulo : ''}</div>${itens}` +
      (b.sap ? `<div class="bt-sap"><b>E o SAP?</b> ${b.sap}</div>` : '') +
      `<div class="bt-legenda">${selo('casa')}${selo('novo')}${selo('conecta')}</div>`);
  }
  function toggleBast(force) { document.body.classList.toggle('xp-bast-on', force); }

  /* ---------- mapa da jornada (J) ---------- */
  function htmlMapa(inline, curId) {
    const rows = XP.trilhas.map(t => {
      const nos = XP.cenas.filter(c => c.trilha === t.id).map(c =>
        `<button class="mapa-no${c.opcional ? ' opcional' : ''}${c.id === curId ? ' cur' : ''}" data-cena="${c.id}" data-go="${c.id}">` +
        `<span class="c">${c.codigo}</span>${c.tag ? `<span class="tag">${c.tag}</span>` : ''}<div class="t">${c.titulo}</div><div class="p">${c.pessoas}</div></button>`).join('');
      return `<div class="mapa-trilha"><div class="mapa-rot">${t.rotulo}<span>${t.nome}</span></div><div class="mapa-nos">${nos}</div></div>`;
    }).join('');
    const pe = XP.roteiros.map(r => `<span><b>${r.publico}:</b> ${r.rota}</span>`).join('');
    return `<div class="mapa${inline ? ' inline' : ''}">${rows}<div class="mapa-pe" style="flex-wrap:wrap;gap:6px 22px">${pe}</div></div>`;
  }
  const ovMapa = el('div', 'xp-ov'); ovMapa.id = 'xp-mapa'; frame.appendChild(ovMapa);
  const ovMand = el('div', 'xp-ov'); ovMand.id = 'xp-mandala'; frame.appendChild(ovMand);
  function abrirMapa() {
    const s = ativo();
    setHTML(ovMapa, `<div class="ov-head"><div class="ov-title">Mapa da jornada</div><div class="ov-sub">Clique numa cena para ir até ela · tracejado = opcional</div>` +
      `<button class="ov-switch" data-ov="m">Ver mandala (M)</button><button class="ov-close" data-ov="x">Fechar · J</button></div>` + htmlMapa(false, s && s.dataset.scene));
    ovMand.classList.remove('on'); ovMapa.classList.add('on');
  }

  /* ---------- mandala (M) ---------- */
  const ANEIS = [
    { id: 'contexto', r: 122, rot: 'Contexto e confiança', off: 56 },
    { id: 'apps', r: 205, rot: 'Apps Customer 360', off: 27 },
    { id: 'agentes', r: 284, rot: 'Agentes e interface', off: 14 },
  ];
  // anéis elípticos (SX): os nomes são horizontais, e com círculos os chips se sobrepunham
  const SX = 1.2;
  function htmlMandala() {
    const W = 780, H = 600, cx = W / 2, cy = H / 2;
    let chips = '';
    ANEIS.forEach(a => {
      const ps = XP.produtos.filter(p => p.anel === a.id);
      ps.forEach((p, k) => {
        const ang = (-90 + a.off + k * 360 / ps.length) * Math.PI / 180;
        const x = cx + a.r * SX * Math.cos(ang), y = cy + a.r * Math.sin(ang) * .97;
        chips += `<button class="mand-chip" data-prod="${p.id}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px">` +
          `${p.icone ? `<img src="${srcIcone(p.icone)}" alt="">` : ''}<i class="${p.selo}"></i>${p.curto || p.nome}</button>`;
      });
    });
    const circ = ANEIS.map(a => `<ellipse cx="${cx}" cy="${cy}" rx="${a.r * SX}" ry="${a.r * .97}" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="1.5" stroke-dasharray="3 6"/>`).join('');
    // os nomes dos anéis ficam na legenda ao lado (ver htmlLado): no círculo, colidiam com os chips
    return `<div class="mandala" style="width:${W}px;height:${H}px"><svg class="aneis" viewBox="0 0 ${W} ${H}">${circ}</svg>` +
      `<div class="centro">Suzano<span style="font:600 16px var(--display);color:#066AFE">+</span>Salesforce</div>${chips}</div>`;
  }
  function htmlLado(tudo) {
    const cenas = XP.cenas.filter(c => !/^R(A|B|TI)$/.test(c.id)).map(c => `<button class="mand-cena${tudo ? ' lit' : ''}" data-cena="${c.id}">${c.codigo} · ${c.titulo}</button>`).join('');
    return `<div class="mand-lado"><div class="ml-tit" data-ml-tit>${tudo ? 'Todas as jornadas, uma plataforma' : 'Clique num produto ou numa cena'}</div>` +
      `<div class="ml-sub" data-ml-sub>${tudo ? 'A maior parte já está na casa. O que falta é conectar.' : 'O produto acende as cenas em que aparece. A cena acende os produtos dela. Clique de novo na cena para ir até ela.'}</div>` +
      `<div class="mand-cenas">${cenas}</div>` +
      `<div class="mand-legenda"><span><i style="background:#00FA70"></i>Já na Suzano</span><span><i style="background:#90D0FE"></i>Novo no que já é seu (Dreamforce 2026)</span><span><i style="background:#04E1CB"></i>Conecta</span></div>` +
      `<div class="mand-aneis">Do centro para fora: ${ANEIS.map(a => `<b>${a.rot}</b>`).join(' · ')}</div></div>`;
  }
  function ligarMandala(root, tudo) {
    const chips = Array.from(root.querySelectorAll('.mand-chip'));
    const cenas = Array.from(root.querySelectorAll('.mand-cena'));
    const tit = root.querySelector('[data-ml-tit]'), sub = root.querySelector('[data-ml-sub]');
    let sel = null;
    const limpa = () => { chips.forEach(c => c.classList.remove('lit', 'dim')); cenas.forEach(c => c.classList.remove('lit', 'dim')); };
    if (tudo) chips.forEach(c => c.classList.add('lit'));
    chips.forEach(ch => ch.addEventListener('click', e => {
      e.stopPropagation();
      const p = PROD[ch.dataset.prod], cs = prodCenas[p.id] || [];
      limpa(); sel = 'p:' + p.id;
      chips.forEach(c => c.classList.add(c === ch ? 'lit' : 'dim'));
      cenas.forEach(c => c.classList.add(cs.includes(c.dataset.cena) ? 'lit' : 'dim'));
      if (tit) setHTML(tit, `${p.nome} ${selo(p.selo)}`);
      if (sub) sub.textContent = p.desc || '';
    }));
    cenas.forEach(cb => cb.addEventListener('click', e => {
      e.stopPropagation();
      const cid = cb.dataset.cena;
      if (sel === 'c:' + cid || (sel && sel.startsWith('p:') && cb.classList.contains('lit'))) { irPara(cid); return; }
      const ps = ((XP.bastidores[cid] || {}).itens || []).map(i => i.p);
      limpa(); sel = 'c:' + cid;
      cenas.forEach(c => c.classList.add(c === cb ? 'lit' : 'dim'));
      chips.forEach(c => c.classList.add(ps.includes(c.dataset.prod) ? 'lit' : 'dim'));
      const c = CENA[cid];
      if (tit) tit.textContent = `${c.codigo} · ${c.titulo}`;
      if (sub) sub.textContent = `${c.pessoas}. Clique de novo para ir até a cena.`;
    }));
  }
  function abrirMandala() {
    setHTML(ovMand, `<div class="ov-head"><div class="ov-title">Mandala</div><div class="ov-sub">O índice por produto</div>` +
      `<button class="ov-switch" data-ov="j">Ver mapa (J)</button><button class="ov-close" data-ov="x">Fechar · M</button></div>` +
      `<div class="mandala-wrap" style="grid-template-columns:630px 1fr;margin-top:0">${htmlMandala()}${htmlLado(false)}</div>`);
    const m = ovMand.querySelector('.mandala'); m.style.transform = 'scale(.8)'; m.style.transformOrigin = 'top left';
    ligarMandala(ovMand, false);
    ovMapa.classList.remove('on'); ovMand.classList.add('on');
  }
  [ovMapa, ovMand].forEach(ov => ov.addEventListener('click', e => {
    const b = e.target.closest('[data-ov]'); if (!b) return;
    if (b.dataset.ov === 'x') fecharOverlays(); else if (b.dataset.ov === 'm') abrirMandala(); else abrirMapa();
  }));
  function fecharOverlays() { ovMapa.classList.remove('on'); ovMand.classList.remove('on'); }

  // índices embutidos em slides (índice da abertura e fechamento)
  document.querySelectorAll('[data-xp-mapa]').forEach(c => setHTML(c, htmlMapa(true, null)));
  document.querySelectorAll('[data-xp-mandala^="cenas:"]').forEach(c => {
    const ids = c.dataset.xpMandala.slice(6).split(',');
    const ps = new Set(ids.flatMap(id => ((XP.bastidores[id] || {}).itens || []).map(i => i.p)));
    setHTML(c, htmlMandala());
    c.querySelectorAll('.mand-chip').forEach(ch => ch.classList.add(ps.has(ch.dataset.prod) ? 'lit' : 'dim'));
    c.querySelectorAll('.mand-chip').forEach(ch => ch.addEventListener('click', e => e.stopPropagation()));
  });
  document.querySelectorAll('[data-xp-mandala]:not([data-xp-mandala^="cenas:"])').forEach(c => {
    const tudo = c.dataset.xpMandala === 'tudo';
    setHTML(c, `<div class="mandala-wrap" style="grid-template-columns:560px 1fr">${htmlMandala()}${htmlLado(tudo)}</div>`);
    const m = c.querySelector('.mandala'); m.style.transform = 'scale(.72)'; m.style.transformOrigin = 'top left';
    ligarMandala(c, tudo);
  });

  /* ---------- notas (N) ---------- */
  const notas = el('div'); notas.id = 'xp-notas'; document.body.appendChild(notas);
  function preencherNotas(slide) {
    const itens = ((slide && slide.dataset.notes) || '').split('||').map(s => s.trim()).filter(Boolean);
    setHTML(notas, `<div class="nt-h">Notas do apresentador</div>` + (itens.length ? `<ul>${itens.map(i => `<li>${i}</li>`).join('')}</ul>` : 'Sem notas neste slide.'));
  }

  /* ---------- troca de slide ---------- */
  let ultimo = null;
  function aoTrocar() {
    const s = ativo();
    if (!s || s === ultimo) return;
    // voltando de um slide adiante: chega com todas as caixinhas abertas, para o ← ir desfazendo
    const voltou = ultimo && slides.indexOf(s) < slides.indexOf(ultimo);
    ultimo = s;
    clearTimeout(s._hsT);
    s._hsN = voltou ? 99 : 0;
    if (!voltou) s._hsT = setTimeout(() => { if (ativo() === s && !s._hsN) { s._hsN = 1; mostrar(s); } }, HS_INICIO);
    preencherBast(s); preencherNotas(s);
    requestAnimationFrame(() => pontos(s));
    setTimeout(() => pontos(s), 700);   // de novo, depois da animação de entrada
    if (ovMapa.classList.contains('on')) abrirMapa();
  }
  const mo = new MutationObserver(aoTrocar);
  slides.forEach(s => mo.observe(s, { attributes: true, attributeFilter: ['class'] }));
  aoTrocar();

  // botões de tecla dentro dos slides
  frame.addEventListener('click', e => {
    const k = e.target.closest('[data-k]'); if (!k || editando()) return;
    e.stopPropagation(); tecla(k.dataset.k);
  });
  function tecla(k) {
    if (k === 'j') { ovMapa.classList.contains('on') ? fecharOverlays() : abrirMapa(); }
    else if (k === 'm') { ovMand.classList.contains('on') ? fecharOverlays() : abrirMandala(); }
    else if (k === 'b') toggleBast();
    else if (k === 'n') document.body.classList.toggle('xp-notas-on');
  }
  window.addEventListener('keydown', e => {
    if (editando() || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    const k = e.key.toLowerCase();
    if (['j', 'm', 'b', 'n'].includes(k)) { e.preventDefault(); tecla(k); }
    else if (k === 'i' && !document.body.classList.contains('overview-on')) { e.preventDefault(); irPara('01'); }
    else if (k === 'escape') { fecharOverlays(); toggleBast(false); document.body.classList.remove('xp-notas-on'); }
  });
  window.addEventListener('resize', () => { const s = ativo(); if (s) pontos(s); });
})();
