(function () {
  var SUPABASE_URL = 'https://tgwchfqajlqailjarvjz.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_c7ppDyLAr8AnR4W2rRQIdA_9ebAUNBK';
  var CLIENTE_CATALOGO = 'FAMAT_CATALOGO';
  var INTERVALO_MS = 15000;

  var baseLineas = null;
  var firmaAplicada = '';
  var pedidoFetch = 0;
  var temporizador = 0;

  function clonarLineas(lineas) {
    return lineas.map(function (entrada) {
      return {
        linea: entrada.linea,
        tipo: entrada.tipo,
        items: (entrada.items || []).map(function (item) {
          if (!item || typeof item === 'string') return item;
          return { nombre: item.nombre, slug: item.slug };
        })
      };
    });
  }

  function restaurarCatalogoBase() {
    if (typeof CATALOGO_LINEAS === 'undefined') return;
    if (!baseLineas) baseLineas = clonarLineas(CATALOGO_LINEAS);
    CATALOGO_LINEAS.splice(0, CATALOGO_LINEAS.length);
    clonarLineas(baseLineas).forEach(function (grupo) {
      CATALOGO_LINEAS.push(grupo);
    });
  }

  function slugsDeLista(lista) {
    return (Array.isArray(lista) ? lista : []).map(function (item) {
      if (!item) return '';
      if (typeof item === 'string') return item;
      return item.slug || item.nombre || '';
    }).filter(Boolean);
  }

  function aplicarCatalogo(row) {
    var firma = JSON.stringify({
      productos: row.productos || [],
      liquidos: row.liquidos || [],
      granel: row.granel || []
    });
    if (firma === firmaAplicada) return;
    firmaAplicada = firma;

    var extras = Array.isArray(row.productos) ? row.productos : [];
    var ocultos = slugsDeLista(row.liquidos);
    var fotos = {};

    restaurarCatalogoBase();
    localStorage.setItem('famat_extras', JSON.stringify(extras));
    localStorage.setItem('famat_ocultos', JSON.stringify(ocultos));

    extras.forEach(function (extra) {
      if (!extra || !extra.slug) return;
      if (extra.foto) fotos[extra.slug] = extra.foto;
      if (ocultos.indexOf(extra.slug) !== -1) return;
      if (typeof CATALOGO_LINEAS === 'undefined') return;

      var grupo = CATALOGO_LINEAS.find(function (entrada) {
        return entrada.linea === extra.linea && entrada.tipo === extra.tipo;
      });
      if (!grupo) {
        grupo = { linea: extra.linea, tipo: extra.tipo, items: [] };
        CATALOGO_LINEAS.push(grupo);
      }
      if (!grupo.items.some(function (item) { return item && item.slug === extra.slug; })) {
        grupo.items.push({ nombre: extra.nombre, slug: extra.slug });
      }
    });

    (Array.isArray(row.granel) ? row.granel : []).forEach(function (item) {
      if (!item || item.tipo !== 'foto' || !item.slug || !item.foto) return;
      fotos[item.slug] = item.foto;
    });

    localStorage.setItem('famat_fotos', JSON.stringify(fotos));
    if (typeof invalidarCacheCatalogo === 'function') invalidarCacheCatalogo();
    if (typeof cargarFiltroLineas === 'function') cargarFiltroLineas();
    if (typeof renderizarCatalogo === 'function') renderizarCatalogo();
    if (typeof refrescarPanelAbierto === 'function') refrescarPanelAbierto();
  }

  function cargarCatalogo() {
    var id = ++pedidoFetch;
    return fetch(
      SUPABASE_URL + '/rest/v1/pedidos?cliente=eq.' + CLIENTE_CATALOGO + '&select=id,productos,liquidos,granel,notas,estado&order=id.desc&limit=1',
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: 'Bearer ' + SUPABASE_KEY
        }
      }
    )
      .then(function (response) { return response.ok ? response.json() : []; })
      .then(function (rows) {
        if (id !== pedidoFetch) return;
        if (rows && rows[0]) aplicarCatalogo(rows[0]);
      })
      .catch(function () {});
  }

  function programarConsulta() {
    window.clearTimeout(temporizador);
    if (document.hidden) return;
    temporizador = window.setTimeout(function () {
      cargarCatalogo().then(programarConsulta);
    }, INTERVALO_MS);
  }

  function escucharCambios(client) {
    client
      .channel('famat-catalogo')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pedidos',
          filter: 'cliente=eq.' + CLIENTE_CATALOGO
        },
        function () {
          cargarCatalogo();
        }
      )
      .subscribe();
  }

  function iniciarEscucha() {
    function conectar() {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') return;
      escucharCambios(window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
    }

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      conectar();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = conectar;
    document.head.appendChild(script);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      window.clearTimeout(temporizador);
      return;
    }
    cargarCatalogo().then(programarConsulta);
  });

  cargarCatalogo().then(programarConsulta);
  iniciarEscucha();
})();
