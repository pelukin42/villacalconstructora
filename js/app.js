/* Villacal · comportamiento del sitio.
   Todo el contenido editable vive en js/config.js. */
(function () {
  'use strict';

  var C = window.VILLACAL || {};
  var R = C.ruta || function (p) { return p; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
  var reduce = mq('(prefers-reduced-motion: reduce)');
  var fine = mq('(hover: hover) and (pointer: fine)');
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var ico = function (n, fill) { return '<svg class="ic' + (fill ? ' fill' : '') + '"><use href="#i-' + n + '"/></svg>'; };

  var SERV = C.servicios || [];
  var OBRAS = C.obras || [];
  var OTRO = { id: 'otro', nombre: 'Otro trabajo', corto: 'Otro', icono: 'otro' };
  var byId = {};
  SERV.concat(OTRO).forEach(function (s) { byId[s.id] = s; });
  var tipoNombre = function (id) { return (byId[id] || {}).nombre || ''; };

  /* ============ aviso ============ */
  var toastT;
  function toast(msg, ms) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { t.classList.remove('show'); }, ms || 3600);
  }

  /* ============ canal de mensajes ============
     Con número: WhatsApp con el mensaje escrito.
     Sin número: Messenger de la página de Facebook, con el mensaje copiado para pegarlo. */
  var waUrl = function (msg) { return 'https://wa.me/' + C.whatsapp + (msg ? '?text=' + encodeURIComponent(msg) : ''); };

  function copiar(txt) {
    var viejo = function () {
      var ta = document.createElement('textarea');
      ta.value = txt;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* sin portapapeles */ }
      ta.remove();
      return ok;
    };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(txt).then(function () { return true; }, viejo);
    }
    return Promise.resolve(viejo());
  }

  function porMessenger(msg) {
    copiar(msg);
    toast('Copiamos tu mensaje: pegalo en el chat de Messenger de Villacal.', 5200);
  }

  function linkar(a, msg) {
    if (!a) return;
    a.dataset.msg = msg;
    a.href = C.whatsapp ? waUrl(msg) : (C.messenger || C.facebook || '#contacto');
    a.target = '_blank';
    a.rel = 'noopener';
  }

  $$('[data-wa]').forEach(function (a) { linkar(a, a.dataset.msg || 'Hola Villacal, quiero consultar por una obra.'); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-wa]');
    if (a && !C.whatsapp) porMessenger(a.dataset.msg || '');
  });

  $$('.wa-num').forEach(function (s) {
    if (C.whatsapp && C.telefonoIntl) s.textContent = C.telefonoIntl;
    else if (!C.whatsapp && C.demo) s.textContent = 'Número por confirmar';
  });

  /* enlaces a redes y teléfono */
  var HREF = {
    facebook: C.facebook,
    instagram: C.instagram,
    tel: C.telefonoIntl ? 'tel:' + C.telefonoIntl.replace(/\s+/g, '') : null
  };
  $$('[data-href]').forEach(function (a) {
    var h = HREF[a.dataset.href];
    if (h) {
      a.href = h;
      if (!/^tel:/.test(h)) { a.target = '_blank'; a.rel = 'noopener'; }
    } else if (a.hasAttribute('data-opt')) {
      a.hidden = true;
    } else {
      a.removeAttribute('href');
    }
  });
  $$('[data-neg]').forEach(function (s) { s.textContent = C[s.dataset.neg] || ''; });

  if (!C.demo) $$('[data-demo]').forEach(function (n) { n.remove(); });
  $('#yr').textContent = new Date().getFullYear();
  $('#legal').textContent = C.cedulaJuridica ? 'Cédula jurídica ' + C.cedulaJuridica : (C.demo ? 'Cédula jurídica: se publica aquí al confirmarla.' : '');

  /* ============ intro ============ */
  (function () {
    var intro = $('#intro');
    if (!intro) return;
    var visto = false;
    try { visto = sessionStorage.getItem('villacal-intro') === '1'; sessionStorage.setItem('villacal-intro', '1'); } catch (e) { /* sin almacenamiento */ }
    if (reduce || visto) { intro.remove(); return; }
    var fuera = function () {
      if (intro.classList.contains('out')) return;
      intro.classList.add('out');
      setTimeout(function () { intro.remove(); }, 1000);
    };
    var t0 = Date.now();
    window.addEventListener('load', function () { setTimeout(fuera, Math.max(0, 1300 - (Date.now() - t0))); });
    setTimeout(fuera, 2400);
  })();

  /* ============ encabezado, progreso y paralaje ============ */
  var nav = $('#nav'), bar = $('#bar');
  var plx = $$('[data-parallax]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    nav.classList.toggle('solid', y > 30);
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    if (!reduce) {
      plx.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + 'px,0)';
      });
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* menú móvil */
  var menu = $('#menu'), burger = $('#burger');
  function menuToggle(abrir) {
    menu.classList.toggle('open', abrir);
    burger.setAttribute('aria-expanded', abrir ? 'true' : 'false');
    burger.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    $('use', burger).setAttribute('href', abrir ? '#i-x' : '#i-menu');
  }
  burger.addEventListener('click', function () { menuToggle(!menu.classList.contains('open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) menuToggle(false); });
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('open') && !menu.contains(e.target) && !burger.contains(e.target)) menuToggle(false);
  });

  /* enlace activo del menú */
  if ('IntersectionObserver' in window) {
    var links = $$('.menu a[href^="#"]:not([data-sol])');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = $(l.getAttribute('href')); if (s) io.observe(s); });
  }

  /* ============ portada: palabra que cambia ============ */
  (function () {
    var sw = $('#swap');
    var W = ['casa', 'cocina', 'remodelación', 'ampliación', 'terraza', 'baño', 'techo'];
    var i = 0;
    if (!sw || reduce) return;
    setInterval(function () {
      sw.classList.add('out');
      setTimeout(function () { i = (i + 1) % W.length; sw.textContent = W[i]; sw.classList.remove('out'); }, 350);
    }, 2600);
  })();

  /* ============ portada: órbita de servicios ============ */
  (function () {
    var orb = $('#orb'), orbit = $('#orbit');
    if (!orb || !SERV.length) return;
    orbit.innerHTML = SERV.map(function (s) {
      return '<button class="ob" type="button" data-id="' + esc(s.id) + '" aria-label="' + esc(s.nombre) + ': ver qué incluye">' +
        '<span class="ph"><img src="' + esc(R(s.foto)) + '" alt="" width="96" height="96"></span>' +
        '<span class="ob-l">' + esc(s.corto) + '</span></button>';
    }).join('');
    var bs = $$('.ob', orbit);
    var ang = -90, last = 0, quieto = false, visible = true, size = {};
    function medir() {
      size.w = orb.clientWidth;
      size.r = size.w * 0.43;
      bs.forEach(function (b) { b._w = b.offsetWidth; b._h = b.firstChild.offsetHeight; });
    }
    function ubicar() {
      var c = size.w / 2;
      bs.forEach(function (b, i) {
        var a = (ang + i * 360 / bs.length) * Math.PI / 180;
        var x = c + size.r * Math.cos(a) - b._w / 2;
        var y = c + size.r * Math.sin(a) - b._h / 2;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
    }
    function tick(t) {
      var dt = last ? Math.min(60, t - last) : 0;
      last = t;
      if (!quieto && visible && !reduce) { ang += dt * 0.006; ubicar(); }
      requestAnimationFrame(tick);
    }
    medir(); ubicar();
    window.addEventListener('resize', function () { medir(); ubicar(); });
    window.addEventListener('load', function () { medir(); ubicar(); });
    orb.addEventListener('pointerenter', function () { quieto = true; });
    orb.addEventListener('pointerleave', function () { quieto = false; });
    orbit.addEventListener('focusin', function () { quieto = true; });
    orbit.addEventListener('focusout', function () { quieto = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(orb);
    }
    requestAnimationFrame(tick);
    orbit.addEventListener('click', function (e) { var b = e.target.closest('.ob'); if (b) abrirQV(b.dataset.id); });
  })();

  /* ============ marquesina ============ */
  (function () {
    var m = $('#marq');
    var items = SERV.map(function (s) { return s.corto; }).concat(['Planos y permisos', 'Obra gris', 'Pisos y enchapes', 'Pintura']);
    var html = items.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    m.innerHTML = html + html;
  })();

  /* ============ aparición al hacer scroll ============
     Al terminar la entrada se marca .done para que el hover y la inclinación respondan rápido. */
  var revelar = (function () {
    var mostrar = function (el) {
      el.classList.add('in');
      setTimeout(function () { el.classList.add('done'); }, 1300);
    };
    if (!('IntersectionObserver' in window) || reduce) return function (els) { els.forEach(mostrar); };
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { mostrar(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    return function (els) { els.forEach(function (e) { io.observe(e); }); };
  })();
  revelar($$('.rv'));

  /* tarjetas con inclinación */
  if (fine && !reduce) {
    $$('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(800px) rotateX(' + (-y * 7).toFixed(2) + 'deg) rotateY(' + (x * 7).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* contadores */
  (function () {
    var els = $$('[data-count]');
    var correr = function (el) {
      var n = +el.dataset.count, t0 = null;
      if (reduce) { el.textContent = n; return; }
      (function paso(t) {
        t0 = t0 || t;
        var p = Math.min(1, (t - t0) / 1200);
        el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(paso);
      })(performance.now());
    };
    if (!('IntersectionObserver' in window)) { els.forEach(correr); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { correr(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ============ modales ============ */
  var pila = [], foco = [];
  var abierto = function () { return pila.length > 0; };
  function abrirModal(id) {
    var m = $('#' + id);
    if (!m || m.classList.contains('open')) return;
    foco.push(document.activeElement);
    m.classList.add('open');
    pila.push(m);
    document.body.classList.add('locked');
    setTimeout(function () {
      var f = m.querySelector('[data-close]') || m.querySelector('button,[href],input,select,textarea');
      if (f) f.focus({ preventScroll: true });
    }, 80);
    barraSolicitud();
  }
  function cerrarModal(m) {
    m = m || pila[pila.length - 1];
    if (!m) return;
    m.classList.remove('open');
    pila = pila.filter(function (x) { return x !== m; });
    if (!pila.length) document.body.classList.remove('locked');
    var f = foco.pop();
    if (f && f.focus) f.focus({ preventScroll: true });
    barraSolicitud();
  }
  $$('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('[data-close]')) cerrarModal(m); });
  });
  function atrapar(e, cont) {
    var f = $$('button:not([disabled]),[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])', cont)
      .filter(function (el) { return el.offsetParent !== null && !el.closest('[hidden]'); });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }

  /* ============ servicios ============ */
  (function () {
    var cats = $('#cats');
    cats.innerHTML = SERV.map(function (s, i) {
      var cls = i === 0 ? ' big' : (i === 5 ? ' wide' : '');
      return '<a class="cat rv' + cls + '" href="#servicios" data-id="' + esc(s.id) + '" style="--d:' + (i % 3) * 0.08 + 's">' +
        '<img src="' + esc(R(s.foto)) + '" alt="" loading="lazy">' +
        (i === 0 ? '<span class="start">El más pedido</span>' : '') +
        '<span class="cico">' + ico(s.icono) + '</span>' +
        '<h3>' + esc(s.nombre) + '</h3><p>' + esc(s.desc) + '</p>' +
        '<span class="more">Ver qué incluye ' + ico('arrow') + '</span></a>';
    }).join('');
    cats.addEventListener('click', function (e) {
      var c = e.target.closest('.cat');
      if (!c) return;
      e.preventDefault();
      abrirQV(c.dataset.id);
    });
    revelar($$('.cat', cats));
  })();

  var qvTipo = null;
  function abrirQV(id) {
    var s = byId[id];
    if (!s || s === OTRO) return;
    qvTipo = id;
    $('#qvVis').style.backgroundImage = 'url("' + R(s.foto) + '")';
    $('#qvTitle').textContent = s.nombre;
    $('#qvDesc').textContent = s.desc;
    $('#qvFeat').innerHTML = (s.incluye || []).map(function (t) { return '<li>' + ico('check') + '<span>' + esc(t) + '</span></li>'; }).join('');
    linkar($('#qvWa'), 'Hola Villacal, quiero consultar por una obra de ' + s.nombre.toLowerCase() + '.');
    abrirModal('qv');
  }
  $('#qvCta').addEventListener('click', function () { cerrarModal($('#qv')); abrirSolicitud({ tipo: qvTipo }); });

  /* ============ visor de fotos ============ */
  var lb = $('#lb'), lbLista = [], lbI = 0, lbFoco = null;
  function lbMostrar() {
    var o = lbLista[lbI];
    var img = $('#lbImg');
    img.src = R(o.foto);
    img.alt = o.titulo;
    $('#lbCap').innerHTML = '<small>' + esc(tipoNombre(o.tipo)) + (o.referencial ? ' · Foto referencial' : (o.estado ? ' · ' + esc(o.estado) : '')) + '</small>' + esc(o.titulo) + ' <span style="opacity:.6">(' + (lbI + 1) + '/' + lbLista.length + ')</span>';
  }
  function lbAbrir(lista, i) {
    if (!lista.length) return;
    lbLista = lista; lbI = i; lbFoco = document.activeElement;
    lbMostrar();
    lb.classList.add('open');
    document.body.classList.add('locked');
    setTimeout(function () { $('.x', lb).focus({ preventScroll: true }); }, 60);
  }
  function lbCerrar() {
    lb.classList.remove('open');
    if (!abierto()) document.body.classList.remove('locked');
    if (lbFoco && lbFoco.focus) lbFoco.focus({ preventScroll: true });
  }
  function lbIr(d) { lbI = (lbI + d + lbLista.length) % lbLista.length; lbMostrar(); }
  $('.x', lb).addEventListener('click', lbCerrar);
  $('.p', lb).addEventListener('click', function () { lbIr(-1); });
  $('.n', lb).addEventListener('click', function () { lbIr(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbCerrar(); });
  (function () {
    var x0 = null;
    lb.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    lb.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) lbIr(dx < 0 ? 1 : -1);
    });
  })();

  /* ============ carrusel de obras ============ */
  (function () {
    var flow = $('#flow'), track = $('#flowTrack');
    var n = OBRAS.length;
    if (!flow || !n) return;
    track.innerHTML = OBRAS.map(function (o, i) {
      return '<figure class="fl" data-i="' + i + '">' +
        '<img src="' + esc(R(o.foto)) + '" alt="' + esc(o.titulo) + '" loading="lazy" draggable="false"' + (o.foco ? ' style="object-position:' + esc(o.foco) + '"' : '') + '>' +
        (o.referencial ? '<span class="tag">Referencial</span>' : (o.estado ? '<span class="tag">' + esc(o.estado) + '</span>' : '')) +
        '<figcaption><small>' + esc(tipoNombre(o.tipo)) + '</small>' + esc(o.titulo) + '</figcaption></figure>';
    }).join('');
    var fls = $$('.fl', track);
    var pos = 0, gap = 200, auto = !reduce, visible = false, sobre = false;
    var wrapD = function (d) { return ((d + n / 2) % n + n) % n - n / 2; };
    var actual = function () { return ((Math.round(pos) % n) + n) % n; };
    function pintar() {
      var w = flow.clientWidth;
      var cw = Math.round(Math.min(340, Math.max(210, w * (w < 640 ? 0.6 : 0.25))));
      flow.style.setProperty('--cw', cw + 'px');
      gap = cw * (w < 640 ? 0.58 : 0.66);
      fls.forEach(function (el, i) {
        var d = wrapD(i - pos), ad = Math.abs(d);
        el.style.transform = 'translate(-50%,-50%) translateX(' + (d * gap).toFixed(1) + 'px) translateZ(' + (-ad * 150).toFixed(0) + 'px) rotateY(' + Math.max(-55, Math.min(55, -d * 30)).toFixed(1) + 'deg)';
        el.style.opacity = ad > 3.2 ? 0 : 1;
        el.style.zIndex = 100 - Math.round(ad * 10);
        el.style.filter = 'brightness(' + (1 - Math.min(ad, 3) * 0.17).toFixed(2) + ')';
        el.style.pointerEvents = ad > 3 ? 'none' : '';
        el.setAttribute('aria-hidden', ad > 0.5 ? 'true' : 'false');
      });
      var o = OBRAS[actual()];
      $('#flowT').textContent = o.titulo;
      $('#flowS').textContent = tipoNombre(o.tipo) + (o.referencial ? ' · Foto referencial' : '') + ' · ' + (actual() + 1) + ' de ' + n;
    }
    function ir(k) { pos = k; pintar(); }
    $('#flowPrev').addEventListener('click', function () { ir(Math.round(pos) - 1); });
    $('#flowNext').addEventListener('click', function () { ir(Math.round(pos) + 1); });
    var play = $('#flowPlay');
    function marcarPlay() {
      play.innerHTML = ico(auto ? 'pause' : 'play');
      play.setAttribute('aria-label', auto ? 'Pausar carrusel' : 'Reproducir carrusel');
    }
    play.addEventListener('click', function () { auto = !auto; marcarPlay(); });
    marcarPlay();
    flow.tabIndex = 0;
    flow.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir(Math.round(pos) - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); ir(Math.round(pos) + 1); }
      if (e.key === 'Enter') lbAbrir(OBRAS, actual());
    });

    /* arrastre */
    var x0 = 0, p0 = 0, arr = false, abajo = false, objetivo = null;
    flow.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      abajo = true; arr = false; x0 = e.clientX; p0 = pos; objetivo = e.target.closest('.fl');
    });
    window.addEventListener('pointermove', function (e) {
      if (!abajo) return;
      var dx = e.clientX - x0;
      if (!arr && Math.abs(dx) > 8) { arr = true; flow.classList.add('drag'); }
      if (arr) { pos = p0 - dx / gap; pintar(); }
    });
    window.addEventListener('pointerup', function () {
      if (!abajo) return;
      abajo = false;
      if (arr) { flow.classList.remove('drag'); ir(Math.round(pos)); return; }
      if (objetivo) {
        var i = +objetivo.dataset.i;
        if (i === actual()) lbAbrir(OBRAS, i);
        else ir(Math.round(pos) + wrapD(i - pos));
      }
    });
    window.addEventListener('pointercancel', function () { if (abajo) { abajo = false; flow.classList.remove('drag'); ir(Math.round(pos)); } });

    flow.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') sobre = true; });
    flow.addEventListener('pointerleave', function () { sobre = false; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 }).observe(flow);
    }
    setInterval(function () {
      if (auto && visible && !sobre && !abajo && !abierto() && !lb.classList.contains('open') && !document.hidden) ir(Math.round(pos) + 1);
    }, 3800);
    window.addEventListener('resize', pintar);
    pintar();
  })();

  /* ============ galería con filtros ============ */
  (function () {
    var gal = $('#gallery'), fil = $('#filters');
    if (!gal) return;
    var filtro = 'todas';
    var cuenta = {};
    OBRAS.forEach(function (o) { cuenta[o.tipo] = (cuenta[o.tipo] || 0) + 1; });
    var tipos = SERV.filter(function (s) { return cuenta[s.id]; });
    fil.innerHTML = '<button class="chip" type="button" data-f="todas" aria-pressed="true">Todas<i>' + OBRAS.length + '</i></button>' +
      tipos.map(function (s) { return '<button class="chip" type="button" data-f="' + esc(s.id) + '" aria-pressed="false">' + esc(s.corto) + '<i>' + cuenta[s.id] + '</i></button>'; }).join('');
    var FORMA = ['w t', '', '', 't', '', 'w', '', ''];
    var lista = [];
    function pintar() {
      lista = OBRAS.filter(function (o) { return filtro === 'todas' || o.tipo === filtro; });
      gal.innerHTML = lista.map(function (o, i) {
        var f = lista.length > 3 ? FORMA[i % FORMA.length] : '';
        return '<figure class="gi ' + f + '" data-i="' + i + '" tabindex="0" role="button" aria-label="Ver foto: ' + esc(o.titulo) + '" style="animation-delay:' + Math.min(i, 8) * 0.05 + 's">' +
          '<img src="' + esc(R(o.foto)) + '" alt="' + esc(o.titulo) + '" loading="lazy"' + (o.foco ? ' style="object-position:' + esc(o.foco) + '"' : '') + '>' +
          (o.referencial ? '<span class="tag">Referencial</span>' : (o.estado ? '<span class="tag">' + esc(o.estado) + '</span>' : '')) +
          '<figcaption><small>' + esc(tipoNombre(o.tipo)) + '</small>' + esc(o.titulo) + '</figcaption></figure>';
      }).join('');
    }
    fil.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      filtro = b.dataset.f;
      $$('.chip', fil).forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      pintar();
    });
    gal.addEventListener('click', function (e) { var g = e.target.closest('.gi'); if (g) lbAbrir(lista, +g.dataset.i); });
    gal.addEventListener('keydown', function (e) {
      var g = e.target.closest('.gi');
      if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lbAbrir(lista, +g.dataset.i); }
    });
    pintar();
  })();

  /* ============ proceso: la casa se construye ============ */
  (function () {
    var house = $('#house'), steps = $$('#steps .step');
    if (!house || !steps.length) return;
    var nombres = steps.map(function (s) { return $('h3', s).textContent; });
    var etapa = 0;
    function poner(e) {
      if (e === etapa) return;
      etapa = e;
      for (var k = 1; k <= 5; k++) {
        house.classList.toggle('st' + k, k <= e);
        house.classList.toggle('c' + k, k === e);
      }
      steps.forEach(function (s) { s.classList.toggle('on', +s.dataset.e === e); });
      $('#stageN').textContent = 'Etapa ' + e + ' de ' + steps.length;
      $('#stageT').textContent = nombres[e - 1];
    }
    poner(1);
    if (!('IntersectionObserver' in window)) { poner(5); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) poner(+en.target.dataset.e); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { io.observe(s); });
  })();

  /* ============ contacto ============ */
  (function () {
    var cl = $('#clist');
    var item = function (icono, cls, etiqueta, valor, href, fill) {
      var pend = valor == null;
      if (pend && !C.demo) return '';
      var tag = href && !pend ? 'a' : 'div';
      var attrs = tag === 'a' ? ' href="' + esc(href) + '"' + (/^(https?:)/.test(href) ? ' target="_blank" rel="noopener"' : '') : '';
      return '<' + tag + ' class="ci"' + attrs + '><span class="ico ' + cls + '">' + ico(icono, fill) + '</span><span><small>' + esc(etiqueta) + '</small><b' + (pend ? ' class="pend"' : '') + '>' + (pend ? 'Por confirmar' : esc(valor)) + '</b></span></' + tag + '>';
    };
    cl.innerHTML = [
      item('wa', 'wa', 'WhatsApp', C.whatsapp ? (C.telefonoIntl || C.whatsapp) : null, C.whatsapp ? waUrl('Hola Villacal, quiero consultar por una obra.') : null, true),
      item('phone', '', 'Teléfono', C.telefonoIntl || C.telefono || null, HREF.tel),
      item('fb', 'fb', 'Facebook', C.facebookNombre || 'Facebook', C.facebook, true),
      C.instagram ? item('ig', '', 'Instagram', C.instagramUsuario || 'Instagram', C.instagram) : '',
      item('mail', '', 'Correo', C.correo || null, C.correo ? 'mailto:' + C.correo : null),
      item('pin', '', 'Ubicación', C.direccion || C.ciudad || null, null),
      item('clock', '', 'Horario', C.horario || null, null)
    ].join('');

    var form = $('#contactForm'), st = $('#cStatus');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var n = $('#cn').value.trim(), t = $('#ct').value.trim(), m = $('#cm').value.trim();
      if (!n || !m) { st.textContent = 'Completá tu nombre y el mensaje.'; return; }
      var msg = 'Hola Villacal, soy ' + n + (t ? ' (tel. ' + t + ')' : '') + '.\n' + m;
      if (C.whatsapp) {
        window.open(waUrl(msg), '_blank', 'noopener');
        st.textContent = 'Abrimos WhatsApp con tu mensaje listo para enviar.';
      } else {
        porMessenger(msg);
        window.open(C.messenger || C.facebook, '_blank', 'noopener');
        st.textContent = 'Copiamos tu mensaje y abrimos Messenger: pegalo en el chat para enviarlo.';
      }
    });
  })();

  /* ============ WhatsApp flotante ============ */
  (function () {
    var fab = $('#waFab'), pop = $('#waPop');
    function poner(abrir) {
      pop.hidden = !abrir;
      fab.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      if (abrir) fab.classList.remove('show-label');
    }
    fab.addEventListener('click', function () { poner(pop.hidden); });
    $('.wa-x', pop).addEventListener('click', function () { poner(false); fab.focus(); });
    pop.addEventListener('click', function (e) { if (e.target.closest('.wa-opt')) poner(false); });
    document.addEventListener('click', function (e) { if (!pop.hidden && !e.target.closest('#waWidget')) poner(false); });
    setTimeout(function () { if (pop.hidden) fab.classList.add('show-label'); }, 4000);
    setTimeout(function () { fab.classList.remove('show-label'); }, 11000);
    window.cerrarWa = function () { if (!pop.hidden) { poner(false); return true; } return false; };
  })();

  /* ============ solicitud de presupuesto ============ */
  var PROV = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];
  var OPC = {
    propiedad: ['Sí, es mía', 'Es de un familiar', 'La estoy comprando', 'Es alquilada'],
    planos: ['Sí, tengo planos', 'No tengo', 'Están en proceso'],
    acabados: ['Sencillos', 'Intermedios', 'De lujo', 'No sé aún'],
    plazo: ['Lo antes posible', 'En 1 a 3 meses', 'En 3 a 6 meses', 'Solo estoy cotizando']
  };
  var PASOS = ['Tipo de obra', 'Ubicación', 'Tamaño', 'Contacto'];
  var CLAVE = 'villacal-solicitud';
  var nueva = function () {
    return { tipo: null, provincia: 'Guanacaste', zona: '', propiedad: null, area: 60, areaNs: false, planos: null, acabados: null, plazo: null, nombre: '', notas: '' };
  };
  var S = (function () {
    try {
      var x = JSON.parse(localStorage.getItem(CLAVE));
      if (x && typeof x === 'object') { var s = nueva(); for (var k in s) if (k in x) s[k] = x[k]; return s; }
    } catch (e) { /* sin almacenamiento */ }
    return nueva();
  })();
  var guardar = function () { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* sin almacenamiento */ } };
  var paso = 1, tocada = !!S.tipo;

  var opcion = function (campo, v, html) {
    return '<button class="opt" type="button" data-f="' + campo + '" data-v="' + esc(v) + '" aria-pressed="false">' + (html || esc(v)) + '</button>';
  };
  $('#optTipo').innerHTML = SERV.concat(OTRO).map(function (s) { return opcion('tipo', s.id, ico(s.icono) + '<span>' + esc(s.nombre) + '</span>'); }).join('');
  $('#optPropiedad').innerHTML = OPC.propiedad.map(function (v) { return opcion('propiedad', v); }).join('');
  $('#optPlanos').innerHTML = OPC.planos.map(function (v) { return opcion('planos', v); }).join('');
  $('#optAcabados').innerHTML = OPC.acabados.map(function (v) { return opcion('acabados', v); }).join('');
  $('#optPlazo').innerHTML = OPC.plazo.map(function (v) { return opcion('plazo', v); }).join('');
  $('#provincia').innerHTML = PROV.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('');
  $('#solSteps').innerHTML = PASOS.map(function (p, i) { return '<li data-p="' + (i + 1) + '">' + (i + 1) + '. ' + esc(p) + '</li>'; }).join('');
  $('#tkFecha').textContent = new Date().toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });

  var area = $('#area'), areaNs = $('#areaNs');

  function lineas() {
    return [
      ['Obra', tipoNombre(S.tipo)],
      ['Ubicación', [S.zona.trim(), S.provincia].filter(Boolean).join(', ')],
      ['Propiedad', S.propiedad],
      ['Área', S.areaNs ? 'Por definir' : (S.area ? S.area + ' m²' : '')],
      ['Planos', S.planos],
      ['Acabados', S.acabados],
      ['Inicio', S.plazo],
      ['Nombre', S.nombre.trim()]
    ];
  }
  function llenos() {
    return [S.tipo, S.zona.trim(), S.propiedad, S.planos, S.acabados, S.plazo, S.nombre.trim()].filter(Boolean).length;
  }
  function faltan() {
    var f = [];
    if (!S.tipo) f.push({ p: 1, t: 'el tipo de obra' });
    if (!S.provincia) f.push({ p: 2, t: 'la provincia' });
    if (!S.nombre.trim()) f.push({ p: 4, t: 'tu nombre' });
    return f;
  }
  function mensaje() {
    var L = ['Hola Villacal, quiero solicitar un presupuesto.', ''];
    lineas().forEach(function (l) {
      if (!l[1]) return;
      var nombre = { Obra: 'Tipo de obra', Área: 'Área aproximada', Inicio: 'Inicio deseado' }[l[0]] || l[0];
      L.push('• ' + nombre + ': ' + l[1]);
    });
    if (S.notas.trim()) L.push('• Notas: ' + S.notas.trim());
    L.push('', 'Enviado desde el sitio web de Villacal.');
    return L.join('\n');
  }

  function sincronizar() {
    $$('#solForm .opt').forEach(function (b) { b.setAttribute('aria-pressed', S[b.dataset.f] === b.dataset.v ? 'true' : 'false'); });
    $('#provincia').value = S.provincia || 'Guanacaste';
    $('#zona').value = S.zona;
    area.value = S.area;
    areaNs.checked = !!S.areaNs;
    area.disabled = !!S.areaNs;
    $('#areaOut').textContent = S.areaNs ? '¿?' : S.area + ' m²';
    $('#nombre').value = S.nombre;
    $('#notas').value = S.notas;
    resumen();
  }
  function resumen() {
    $('#tkLines').innerHTML = lineas().map(function (l) {
      return '<div><dt>' + esc(l[0]) + '</dt><dd' + (l[1] ? '' : ' class="vacio"') + '>' + (l[1] ? esc(l[1]) : '—') + '</dd></div>';
    }).join('');
    var n = llenos();
    $('#tkBar').style.width = Math.round(n / 7 * 100) + '%';
    var f = faltan();
    $('#tkState').textContent = f.length ? 'Falta ' + f.map(function (x) { return x.t; }).join(' y ') + '.' : '¡Lista para enviar!';
    var msg = mensaje();
    $('#msgPrev').value = msg;
    [$('#tkWa'), $('#obWa')].forEach(function (a) {
      a.href = C.whatsapp ? waUrl(msg) : (C.messenger || C.facebook);
      a.setAttribute('aria-disabled', f.length ? 'true' : 'false');
    });
    var c = $('#solCount');
    if (c.textContent !== String(n)) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); }
    c.textContent = n;
    c.classList.toggle('zero', !n);
    $('#obCount').textContent = n;
    $('#obText').textContent = S.tipo ? 'Solicitud: ' + tipoNombre(S.tipo) : 'Tu solicitud';
    barraSolicitud();
  }
  function barraSolicitud() {
    var ob = $('#orderBar');
    if (ob) ob.classList.toggle('show', !!S.tipo && tocada && !abierto());
  }

  function irPaso(p) {
    paso = Math.max(1, Math.min(4, p));
    $$('#solForm .paso').forEach(function (s) { s.hidden = +s.dataset.paso !== paso; });
    $$('#solSteps li').forEach(function (li) {
      var k = +li.dataset.p;
      li.classList.toggle('on', k === paso);
      li.classList.toggle('done', k < paso);
    });
    $('#solPrev').style.visibility = paso === 1 ? 'hidden' : 'visible';
    $('#solNext').innerHTML = paso === 4 ? ico('wa', true) + 'Enviar solicitud' : 'Siguiente ' + ico('arrow');
    $('#solNext').className = 'btn ' + (paso === 4 ? 'wa' : 'primary');
    $('#solErr').textContent = '';
  }
  function validar(p) {
    var f = faltan().filter(function (x) { return x.p === p; });
    if (f.length) { $('#solErr').textContent = 'Indicá ' + f[0].t + ' para seguir.'; return false; }
    return true;
  }

  function abrirSolicitud(o) {
    o = o || {};
    tocada = true;
    if (o.tipo && byId[o.tipo]) S.tipo = o.tipo;
    if (o.nota && !S.notas.trim()) S.notas = o.nota;
    guardar();
    sincronizar();
    var f = faltan();
    irPaso(o.tipo ? 2 : (S.tipo ? (f.length ? f[0].p : 4) : 1));
    abrirModal('sol');
  }
  window.abrirSolicitud = abrirSolicitud;

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-sol]');
    if (!a) return;
    e.preventDefault();
    abrirSolicitud({ tipo: a.dataset.tipo, nota: a.dataset.nota });
  });
  $('#obOpen').addEventListener('click', function () { abrirSolicitud(); });

  $('#solForm').addEventListener('click', function (e) {
    var b = e.target.closest('.opt');
    if (!b) return;
    S[b.dataset.f] = b.dataset.v;
    guardar();
    sincronizar();
    $('#solErr').textContent = '';
    if (b.dataset.f === 'tipo') setTimeout(function () { if (paso === 1) irPaso(2); }, 260);
  });
  $('#provincia').addEventListener('change', function () { S.provincia = this.value; guardar(); resumen(); });
  $('#zona').addEventListener('input', function () { S.zona = this.value; guardar(); resumen(); });
  area.addEventListener('input', function () { S.area = +this.value; $('#areaOut').textContent = S.area + ' m²'; guardar(); resumen(); });
  areaNs.addEventListener('change', function () { S.areaNs = this.checked; guardar(); sincronizar(); });
  $('#nombre').addEventListener('input', function () { S.nombre = this.value; guardar(); resumen(); if (S.nombre.trim()) $('#solErr').textContent = ''; });
  $('#notas').addEventListener('input', function () { S.notas = this.value; guardar(); resumen(); });

  $('#solPrev').addEventListener('click', function () { irPaso(paso - 1); });
  $('#solNext').addEventListener('click', function () {
    if (!validar(paso)) return;
    if (paso < 4) { irPaso(paso + 1); return; }
    $('#tkWa').click();
  });
  $('#solSteps').addEventListener('click', function (e) {
    var li = e.target.closest('li');
    if (li && +li.dataset.p < paso) irPaso(+li.dataset.p);
  });
  $('#solForm').addEventListener('submit', function (e) { e.preventDefault(); });

  function enviarSolicitud(e) {
    var f = faltan();
    if (f.length) {
      e.preventDefault();
      if (!$('#sol').classList.contains('open')) abrirSolicitud();
      irPaso(f[0].p);
      $('#solErr').textContent = 'Indicá ' + f.map(function (x) { return x.t; }).join(' y ') + ' para enviar.';
      return;
    }
    if (!C.whatsapp) porMessenger(mensaje());
    else toast('Abrimos WhatsApp con tu solicitud lista. ¡Gracias!');
  }
  $('#tkWa').addEventListener('click', enviarSolicitud);
  $('#obWa').addEventListener('click', enviarSolicitud);
  $('#tkCopy').addEventListener('click', function () {
    copiar(mensaje()).then(function (ok) {
      $('#tkCopyTxt').textContent = ok ? '¡Mensaje copiado!' : 'No se pudo copiar';
      setTimeout(function () { $('#tkCopyTxt').textContent = 'Copiar el mensaje'; }, 2200);
    });
  });

  sincronizar();
  irPaso(1);

  /* ============ teclado ============ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (lb.classList.contains('open')) { lbCerrar(); return; }
      if (abierto()) { cerrarModal(); return; }
      if (window.cerrarWa && window.cerrarWa()) { $('#waFab').focus(); return; }
      if (menu.classList.contains('open')) { menuToggle(false); burger.focus(); }
      return;
    }
    if (lb.classList.contains('open')) {
      if (e.key === 'ArrowLeft') lbIr(-1);
      if (e.key === 'ArrowRight') lbIr(1);
      if (e.key === 'Tab') atrapar(e, lb);
      return;
    }
    if (e.key === 'Tab' && abierto()) atrapar(e, pila[pila.length - 1]);
  });
})();
