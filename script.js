// ============================================================
//  PEDIDOS FAMAT — Catálogo visual
// ============================================================

let productosAgregados = [];
let liquidosAgregados = [];
let granelAgregados = [];

let categoriaActiva = 'producto';
let itemSeleccionado = null;

const UNIDAD_POR_TIPO = {
    producto: { stepper: 'panelQty', singular: 'unidad', plural: 'unidades', min: 1, step: 1, decimals: 0, labelCantidad: 'Se cuenta por unidad' },
    liquido: { stepper: 'panelQty', singular: 'litro', plural: 'litros', min: 0.5, step: 0.5, decimals: 1, labelCantidad: 'Se mide en litros — mínimo 0,5 L' },
    granel: { stepper: 'panelQty', singular: 'kilo', plural: 'kilos', min: 0.1, step: 0.1, decimals: 1, labelCantidad: 'Se vende por kilo — mínimo 0,1 kg' }
};

// ── Fecha de entrega (calendario Famat) ─────────────────────
const MESES_ES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

let calVistaAnio = null;
let calVistaMes = null; // 0-11

function obtenerFechaMinimaEntrega() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
}

function aFechaISO(anio, mes0, dia) {
    return anio + '-' + String(mes0 + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
}

function parseFechaISO(fechaStr) {
    if (!fechaStr) return null;
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return null;
    const año = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10) - 1;
    const dia = parseInt(partes[2], 10);
    const fecha = new Date(año, mes, dia);
    if (Number.isNaN(fecha.getTime())) return null;
    return fecha;
}

function esFechaEntregaValida(fechaStr) {
    if (!fechaStr) return false;
    return fechaStr >= obtenerFechaMinimaEntrega();
}

function validarFechaEntrega(mostrarAlerta) {
    const input = document.getElementById('entrega');
    if (!input || !input.value) return true;

    if (esFechaEntregaValida(input.value)) return true;

    if (mostrarAlerta) {
        alert('La fecha de entrega no puede ser anterior a hoy.');
    }
    setFechaEntrega(obtenerFechaMinimaEntrega(), false);
    return false;
}

function formatearFechaEntregaVisible(fechaStr) {
    if (!fechaStr) return 'Elegí una fecha';
    const fecha = parseFechaISO(fechaStr);
    if (!fecha) return fechaStr;

    return fecha.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function actualizarFormatoFechaEntrega() {
    const input = document.getElementById('entrega');
    const label = document.getElementById('entregaFormato');
    if (!input || !label) return;
    label.textContent = formatearFechaEntregaVisible(input.value);
}

function setFechaEntrega(fechaStr, cerrar) {
    const input = document.getElementById('entrega');
    if (!input) return;
    input.value = fechaStr || '';
    actualizarFormatoFechaEntrega();
    renderCalendarioFamat();
    if (cerrar) cerrarCalendarioFamat();
}

function calendarioAbierto() {
    const cal = document.getElementById('calendarioFamat');
    return cal && !cal.hidden;
}

function abrirCalendarioFamat() {
    const cal = document.getElementById('calendarioFamat');
    const trigger = document.getElementById('entregaTrigger');
    const input = document.getElementById('entrega');
    if (!cal) return;

    const base = parseFechaISO(input && input.value) || new Date();
    calVistaAnio = base.getFullYear();
    calVistaMes = base.getMonth();
    renderCalendarioFamat();
    cal.hidden = false;
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
}

function cerrarCalendarioFamat() {
    const cal = document.getElementById('calendarioFamat');
    const trigger = document.getElementById('entregaTrigger');
    if (cal) cal.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
}

function toggleCalendarioFamat() {
    if (calendarioAbierto()) cerrarCalendarioFamat();
    else abrirCalendarioFamat();
}

function renderCalendarioFamat() {
    const grid = document.getElementById('calGrid');
    const mesLabel = document.getElementById('calMesLabel');
    const input = document.getElementById('entrega');
    if (!grid || calVistaAnio == null || calVistaMes == null) return;

    if (mesLabel) {
        mesLabel.textContent = MESES_ES[calVistaMes] + ' de ' + calVistaAnio;
    }

    const hoyISO = obtenerFechaMinimaEntrega();
    const seleccionado = (input && input.value) || '';
    const primerDia = new Date(calVistaAnio, calVistaMes, 1);
    let inicioSemana = (primerDia.getDay() + 6) % 7; // lunes = 0
    const diasEnMes = new Date(calVistaAnio, calVistaMes + 1, 0).getDate();
    const diasMesAnterior = new Date(calVistaAnio, calVistaMes, 0).getDate();

    let html = '';
    // celdas del mes anterior
    for (let i = 0; i < inicioSemana; i++) {
        const dia = diasMesAnterior - inicioSemana + i + 1;
        const mesAnt = calVistaMes === 0 ? 11 : calVistaMes - 1;
        const anioAnt = calVistaMes === 0 ? calVistaAnio - 1 : calVistaAnio;
        const iso = aFechaISO(anioAnt, mesAnt, dia);
        const deshabilitado = iso < hoyISO;
        html += '<button type="button" class="cal-famat__dia cal-famat__dia--fuera' + (deshabilitado ? ' cal-famat__dia--off' : '') + '"' +
            (deshabilitado ? ' disabled' : ' data-fecha="' + iso + '"') + '>' + dia + '</button>';
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
        const iso = aFechaISO(calVistaAnio, calVistaMes, dia);
        const deshabilitado = iso < hoyISO;
        const esHoy = iso === hoyISO;
        const esSel = iso === seleccionado;
        let clases = 'cal-famat__dia';
        if (deshabilitado) clases += ' cal-famat__dia--off';
        if (esHoy) clases += ' cal-famat__dia--hoy';
        if (esSel) clases += ' cal-famat__dia--sel';
        html += '<button type="button" class="' + clases + '"' +
            (deshabilitado ? ' disabled' : ' data-fecha="' + iso + '"') +
            (esSel ? ' aria-current="date"' : '') + '>' + dia + '</button>';
    }

    const celdasUsadas = inicioSemana + diasEnMes;
    const resto = (7 - (celdasUsadas % 7)) % 7;
    for (let i = 1; i <= resto; i++) {
        const mesSig = calVistaMes === 11 ? 0 : calVistaMes + 1;
        const anioSig = calVistaMes === 11 ? calVistaAnio + 1 : calVistaAnio;
        const iso = aFechaISO(anioSig, mesSig, i);
        const deshabilitado = iso < hoyISO;
        html += '<button type="button" class="cal-famat__dia cal-famat__dia--fuera' + (deshabilitado ? ' cal-famat__dia--off' : '') + '"' +
            (deshabilitado ? ' disabled' : ' data-fecha="' + iso + '"') + '>' + i + '</button>';
    }

    grid.innerHTML = html;
}

function configurarInputEntrega() {
    const input = document.getElementById('entrega');
    if (!input) return;

    const min = obtenerFechaMinimaEntrega();
    if (!input.value || input.value < min) {
        input.value = min;
    }
    actualizarFormatoFechaEntrega();

    if (input.dataset.calConfigurado === '1') {
        if (calendarioAbierto()) renderCalendarioFamat();
        return;
    }
    input.dataset.calConfigurado = '1';

    const trigger = document.getElementById('entregaTrigger');
    const cal = document.getElementById('calendarioFamat');
    const btnPrev = document.getElementById('calMesAnterior');
    const btnNext = document.getElementById('calMesSiguiente');
    const btnHoy = document.getElementById('calHoy');
    const btnBorrar = document.getElementById('calBorrar');
    const grid = document.getElementById('calGrid');

    if (trigger) {
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleCalendarioFamat();
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', function (e) {
            e.stopPropagation();
            calVistaMes -= 1;
            if (calVistaMes < 0) {
                calVistaMes = 11;
                calVistaAnio -= 1;
            }
            renderCalendarioFamat();
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', function (e) {
            e.stopPropagation();
            calVistaMes += 1;
            if (calVistaMes > 11) {
                calVistaMes = 0;
                calVistaAnio += 1;
            }
            renderCalendarioFamat();
        });
    }

    if (btnHoy) {
        btnHoy.addEventListener('click', function (e) {
            e.stopPropagation();
            setFechaEntrega(obtenerFechaMinimaEntrega(), true);
        });
    }

    if (btnBorrar) {
        btnBorrar.addEventListener('click', function (e) {
            e.stopPropagation();
            setFechaEntrega('', false);
            const hoy = new Date();
            calVistaAnio = hoy.getFullYear();
            calVistaMes = hoy.getMonth();
            renderCalendarioFamat();
        });
    }

    if (grid) {
        grid.addEventListener('click', function (e) {
            const btn = e.target.closest('[data-fecha]');
            if (!btn || btn.disabled) return;
            setFechaEntrega(btn.getAttribute('data-fecha'), true);
        });
    }

    if (cal) {
        cal.addEventListener('click', function (e) {
            e.stopPropagation();
        });
    }

    document.addEventListener('click', function () {
        if (calendarioAbierto()) cerrarCalendarioFamat();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && calendarioAbierto()) cerrarCalendarioFamat();
    });
}

function actualizarVisibilidadAlias() {
    const bloque = document.getElementById('bloqueAliasTransferencia');
    if (!bloque) return;
    const metodo = document.querySelector('input[name="metodoPago"]:checked');
    const esTransferencia = metodo && metodo.value === 'transferencia';
    bloque.hidden = !esTransferencia;
}

// ── Datos del cliente (local) ───────────────────────────────
const CLIENTE_LOCAL_KEY = 'famat_datos_cliente';

function guardarDatosClienteLocal(nombre, telefono) {
    try {
        localStorage.setItem(CLIENTE_LOCAL_KEY, JSON.stringify({
            nombre: (nombre || '').trim(),
            telefono: (telefono || '').trim()
        }));
    } catch (e) {
        console.warn('No se pudieron guardar los datos del cliente:', e);
    }
}

function cargarDatosClienteLocal() {
    try {
        const raw = localStorage.getItem(CLIENTE_LOCAL_KEY);
        if (!raw) return;
        const datos = JSON.parse(raw);
        const inputCliente = document.getElementById('cliente');
        const inputTelefono = document.getElementById('telefono');
        if (inputCliente && datos.nombre) inputCliente.value = datos.nombre;
        if (inputTelefono && datos.telefono) inputTelefono.value = datos.telefono;
    } catch (e) {
        console.warn('No se pudieron cargar los datos del cliente:', e);
    }
}

function configurarAutoguardadoCliente() {
    const inputCliente = document.getElementById('cliente');
    const inputTelefono = document.getElementById('telefono');
    if (!inputCliente || !inputTelefono) return;

    function persistir() {
        guardarDatosClienteLocal(inputCliente.value, inputTelefono.value);
    }

    inputCliente.addEventListener('blur', persistir);
    inputTelefono.addEventListener('blur', persistir);
    inputTelefono.addEventListener('change', persistir);
}

// ── Fragancias ──────────────────────────────────────────────
const FRAGANCIAS_LIQUIDO = {
    'Perfume P/ropa al alcohol': [
        'Paula', 'Revivere', 'La vida es bella', 'Coco-vainilla', 'Deditos',
        'Uva', 'Marina', 'Bebe', 'Confort', 'Citrico'
    ],
    'Perfume P/ropa al agua': [
        'Bebe', 'Vivere', 'Coniglio', 'Flores Blancas', 'Sandalo', 'Bubble Gum', 'Paula'
    ],
    'Perfumina': [
        'Lavanda', 'Marina', 'Pino', 'Uva', 'Citronela', 'Bosque de bambu',
        'Chicle', 'Citrico', 'Floral', 'Lysoform', 'Espadol', 'Cony'
    ]
};

function requiereFragancia(nombreLiquido) {
    return Object.prototype.hasOwnProperty.call(FRAGANCIAS_LIQUIDO, nombreLiquido);
}

function actualizarSelectorFragancia(nombreLiquido) {
    const filaAroma = document.getElementById('filaAroma');
    const aromaSelect = document.getElementById('aromaSelect');
    if (!filaAroma || !aromaSelect) return;

    if (!requiereFragancia(nombreLiquido)) {
        filaAroma.hidden = true;
        aromaSelect.innerHTML = '<option value="">-- Elige una fragancia --</option>';
        return;
    }

    const fragancias = FRAGANCIAS_LIQUIDO[nombreLiquido];
    aromaSelect.innerHTML = '<option value="">-- Elige una fragancia --</option>';
    fragancias.forEach(function (frag) {
        const option = document.createElement('option');
        option.value = frag;
        option.textContent = frag;
        aromaSelect.appendChild(option);
    });
    filaAroma.hidden = false;
}

// ── Stepper ─────────────────────────────────────────────────
const STEPPER_CONFIG = {
    panelQty: {
        min: 1, step: 1, decimals: 0,
        singular: 'unidad', plural: 'unidades'
    }
};

function aplicarConfigStepperParaTipo(tipo) {
    const u = UNIDAD_POR_TIPO[tipo] || UNIDAD_POR_TIPO.producto;
    STEPPER_CONFIG.panelQty = {
        min: u.min,
        step: u.step,
        decimals: u.decimals,
        singular: u.singular,
        plural: u.plural
    };
}

function redondearStepper(valor, decimales) {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
}

function formatearStepper(valor, decimales) {
    if (decimales === 0) return String(Math.round(valor));
    const txt = valor.toFixed(decimales);
    return txt.endsWith('.0') ? String(Math.round(valor)) : txt.replace('.', ',');
}

function actualizarDisplayStepper(inputId) {
    const cfg = STEPPER_CONFIG[inputId];
    const input = document.getElementById(inputId);
    if (!cfg || !input) return;

    const valor = parseFloat(input.value) || cfg.min;
    const display = document.getElementById(inputId + 'Display');
    const unidad = document.getElementById(inputId + 'Unidad');

    if (display) display.textContent = formatearStepper(valor, cfg.decimals);
    if (unidad) unidad.textContent = valor === 1 ? cfg.singular : cfg.plural;
}

function ajustarCantidad(inputId, direccion) {
    const cfg = STEPPER_CONFIG[inputId];
    const input = document.getElementById(inputId);
    if (!cfg || !input) return;

    let valor = parseFloat(input.value) || cfg.min;
    valor = redondearStepper(valor + direccion * cfg.step, cfg.decimals);
    if (valor < cfg.min) valor = cfg.min;

    input.value = cfg.decimals === 0 ? String(Math.round(valor)) : String(valor);
    actualizarDisplayStepper(inputId);
}

function resetearStepper(inputId, valor) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.value = String(valor);
    actualizarDisplayStepper(inputId);
}

// ── Catálogo helpers ────────────────────────────────────────
function ordenarAlfabeticamentePorNombre(lista) {
    return [...lista].sort(function (a, b) {
        return a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' });
    });
}

function normalizarItem(item) {
    if (typeof item === 'string') {
        const slug = typeof slugifyNombre === 'function' ? slugifyNombre(item) : item;
        return { nombre: item, slug: slug };
    }
    return item;
}

function obtenerLineasPorTipo(tipo) {
    return CATALOGO_LINEAS.filter(function (entrada) {
        return entrada.tipo === tipo;
    });
}

const cacheItemsPlanos = Object.create(null);
const CATALOGO_LOTE = 48;
let catalogoRenderToken = 0;

function obtenerItemsPlanos(tipo) {
    if (cacheItemsPlanos[tipo]) return cacheItemsPlanos[tipo];

    const vistos = new Map();
    obtenerLineasPorTipo(tipo).forEach(function (entrada) {
        entrada.items.forEach(function (raw) {
            const item = normalizarItem(raw);
            const clave = item.nombre.trim().toLowerCase();
            if (!vistos.has(clave)) {
                vistos.set(clave, {
                    nombre: item.nombre,
                    slug: item.slug,
                    linea: entrada.linea,
                    tipo: tipo
                });
            }
        });
    });

    const planos = ordenarAlfabeticamentePorNombre([...vistos.values()]);
    cacheItemsPlanos[tipo] = planos;
    return planos;
}

function rutaImagen(slug) {
    if (typeof imagenProducto === 'function') return imagenProducto(slug);
    return 'images/productos/' + slug + '.jpg';
}

function placeholderSrc() {
    return typeof IMAGEN_PLACEHOLDER !== 'undefined' ? IMAGEN_PLACEHOLDER : 'images/placeholder.svg';
}

function onImgError(img) {
    if (img.dataset.fallback === '1') return;
    img.dataset.fallback = '1';
    img.src = placeholderSrc();
}

function escaparHtml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function etiquetaUnidadTipo(tipo) {
    if (tipo === 'liquido') return 'Líquido · litros';
    if (tipo === 'granel') return 'A granel · kilos';
    return 'Producto · unidad';
}

function nombreLineaCorto(linea) {
    return String(linea || '')
        .replace(/^LINEA\s+/i, '')
        .replace(/\s*\((LIQUIDO|GRANEL)\)\s*$/i, '')
        .trim();
}

// ── Render catálogo ─────────────────────────────────────────
function cargarFiltroLineas() {
    const select = document.getElementById('filtroLinea');
    if (!select) return;

    const actual = select.value;
    select.innerHTML = '<option value="">Todas las líneas</option>';

    obtenerLineasPorTipo(categoriaActiva).forEach(function (entrada) {
        const option = document.createElement('option');
        option.value = entrada.linea;
        option.textContent = nombreLineaCorto(entrada.linea);
        select.appendChild(option);
    });

    if ([...select.options].some(function (o) { return o.value === actual; })) {
        select.value = actual;
    } else {
        select.value = '';
    }
}

function obtenerFiltrosCatalogo() {
    const busqueda = (document.getElementById('busquedaCatalogo')?.value || '').trim().toLowerCase();
    const linea = document.getElementById('filtroLinea')?.value || '';
    return { busqueda, linea };
}

function htmlCardProducto(item, eager) {
    const src = rutaImagen(item.slug);
    const loading = eager ? 'eager' : 'lazy';
    return (
        '<button type="button" class="card-producto" data-slug="' + escaparHtml(item.slug) + '" data-tipo="' + escaparHtml(item.tipo) + '" onclick="abrirPanelAgregar(\'' + escaparHtml(item.slug) + '\', \'' + escaparHtml(item.tipo) + '\')">' +
            '<span class="card-producto__media">' +
                '<img src="' + escaparHtml(src) + '" alt="" loading="' + loading + '" decoding="async" onerror="onImgError(this)">' +
            '</span>' +
            '<span class="card-producto__body">' +
                '<span class="card-producto__linea">' + escaparHtml(nombreLineaCorto(item.linea)) + '</span>' +
                '<span class="card-producto__nombre">' + escaparHtml(item.nombre) + '</span>' +
                '<span class="card-producto__badge">' + escaparHtml(etiquetaUnidadTipo(item.tipo)) + '</span>' +
            '</span>' +
        '</button>'
    );
}

function renderizarCatalogo() {
    const grid = document.getElementById('catalogoGrid');
    const meta = document.getElementById('catalogoMeta');
    if (!grid) return;

    if (typeof CATALOGO_LINEAS === 'undefined') {
        grid.innerHTML = '<p class="catalogo-vacio">No se cargó el catálogo.</p>';
        return;
    }

    const { busqueda, linea } = obtenerFiltrosCatalogo();
    let items = obtenerItemsPlanos(categoriaActiva);

    if (linea) {
        items = items.filter(function (item) { return item.linea === linea; });
    }
    if (busqueda) {
        items = items.filter(function (item) {
            return item.nombre.toLowerCase().includes(busqueda)
                || item.linea.toLowerCase().includes(busqueda);
        });
    }

    if (meta) {
        const tipoLabel = categoriaActiva === 'liquido' ? 'líquidos' : (categoriaActiva === 'granel' ? 'a granel' : 'productos');
        meta.textContent = items.length + ' ' + tipoLabel + (busqueda || linea ? ' encontrados' : ' disponibles');
    }

    const token = ++catalogoRenderToken;

    if (items.length === 0) {
        grid.innerHTML = '<p class="catalogo-vacio">No hay resultados. Probá otra búsqueda o línea.</p>';
        return;
    }

    // Primer lote ya: la pantalla deja de “trabarse” esperando las 200+ cards.
    const primero = items.slice(0, CATALOGO_LOTE);
    grid.innerHTML = primero.map(function (item, i) {
        return htmlCardProducto(item, i < 12);
    }).join('');

    let offset = CATALOGO_LOTE;
    function appendLote() {
        if (token !== catalogoRenderToken || offset >= items.length) return;
        const lote = items.slice(offset, offset + CATALOGO_LOTE);
        offset += CATALOGO_LOTE;
        grid.insertAdjacentHTML('beforeend', lote.map(function (item) {
            return htmlCardProducto(item, false);
        }).join(''));
        if (offset < items.length) {
            window.requestAnimationFrame(appendLote);
        }
    }

    if (items.length > CATALOGO_LOTE) {
        window.requestAnimationFrame(appendLote);
    }
}

function configurarFiltrosCatalogo() {
    const busqueda = document.getElementById('busquedaCatalogo');
    const linea = document.getElementById('filtroLinea');
    if (busqueda) {
        busqueda.addEventListener('input', function () {
            renderizarCatalogo();
        });
    }
    if (linea) {
        linea.addEventListener('change', function () {
            renderizarCatalogo();
        });
    }
}

function cambiarCategoria(categoria, elemento) {
    categoriaActiva = categoria;

    document.querySelectorAll('.btn-categoria').forEach(function (btn) {
        btn.classList.remove('btn-categoria--active');
    });
    if (elemento) elemento.classList.add('btn-categoria--active');

    const busqueda = document.getElementById('busquedaCatalogo');
    if (busqueda) busqueda.value = '';

    cargarFiltroLineas();
    renderizarCatalogo();
}

// ── Panel agregar ───────────────────────────────────────────
function buscarItemPorSlug(slug, tipo) {
    return obtenerItemsPlanos(tipo).find(function (item) {
        return item.slug === slug;
    }) || null;
}

function abrirPanelAgregar(slug, tipo) {
    const item = buscarItemPorSlug(slug, tipo || categoriaActiva);
    if (!item) return;

    itemSeleccionado = item;
    aplicarConfigStepperParaTipo(item.tipo);

    const panel = document.getElementById('panelAgregar');
    const img = document.getElementById('panelAgregarImg');
    const titulo = document.getElementById('panelAgregarTitulo');
    const linea = document.getElementById('panelAgregarLinea');
    const hint = document.getElementById('panelAgregarUnidadHint');

    if (img) {
        img.dataset.fallback = '';
        img.src = rutaImagen(item.slug);
        img.alt = item.nombre;
    }
    if (titulo) titulo.textContent = item.nombre;
    if (linea) linea.textContent = nombreLineaCorto(item.linea);
    if (hint) hint.textContent = UNIDAD_POR_TIPO[item.tipo].labelCantidad;

    actualizarSelectorFragancia(item.tipo === 'liquido' ? item.nombre : '');
    resetearStepper('panelQty', UNIDAD_POR_TIPO[item.tipo].min);

    if (panel) {
        panel.classList.add('panel-agregar--visible');
        panel.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarPanelAgregar() {
    const panel = document.getElementById('panelAgregar');
    itemSeleccionado = null;
    actualizarSelectorFragancia('');
    if (panel) {
        panel.classList.remove('panel-agregar--visible');
        panel.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

function abrirPanelCarrito() {
    const panel = document.getElementById('panelCarrito');
    if (!panel) return;
    panel.classList.add('panel-carrito--visible');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function cerrarPanelCarrito() {
    const panel = document.getElementById('panelCarrito');
    if (!panel) return;
    panel.classList.remove('panel-carrito--visible');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function actualizarBadgeCarrito() {
    const badge = document.getElementById('badgeCarrito');
    const btn = document.getElementById('btnCarrito');
    const total = totalItemsPedido();

    if (badge) {
        if (total > 0) {
            badge.textContent = String(total);
            badge.hidden = false;
        } else {
            badge.textContent = '0';
            badge.hidden = true;
        }
    }

    if (btn) {
        btn.setAttribute(
            'aria-label',
            total === 0 ? 'Ver pedido' : ('Ver pedido (' + total + (total === 1 ? ' ítem' : ' ítems') + ')')
        );
    }
}

function confirmarAgregarDesdePanel() {
    if (!itemSeleccionado) return;

    const qty = parseFloat(document.getElementById('panelQty').value);
    const tipo = itemSeleccionado.tipo;
    const cfg = UNIDAD_POR_TIPO[tipo];

    if (!(qty >= cfg.min)) {
        alert('La cantidad mínima es ' + formatearStepper(cfg.min, cfg.decimals) + ' ' + cfg.plural);
        return;
    }

    let nombre = itemSeleccionado.nombre;
    const slug = itemSeleccionado.slug;

    if (tipo === 'liquido' && requiereFragancia(nombre)) {
        const fragancia = document.getElementById('aromaSelect').value;
        if (!fragancia) {
            alert('Seleccioná una fragancia');
            return;
        }
        nombre = nombre + ' - ' + fragancia;
    }

    if (tipo === 'producto') {
        productosAgregados.push({ nombre: nombre, cantidad: Math.round(qty), tipo: 'producto', slug: slug });
    } else if (tipo === 'liquido') {
        liquidosAgregados.push({ nombre: nombre, litros: qty, tipo: 'liquido', slug: slug });
    } else {
        granelAgregados.push({ nombre: nombre, kilos: qty, tipo: 'granel', slug: slug });
    }

    actualizarListaPedido();
    cerrarPanelAgregar();
}

// ── Lista del pedido ────────────────────────────────────────
function totalItemsPedido() {
    return productosAgregados.length + liquidosAgregados.length + granelAgregados.length;
}

function slugDesdeNombrePedido(nombre, tipo) {
    const base = String(nombre || '').split(' - ')[0].trim();
    const hallado = obtenerItemsPlanos(tipo).find(function (item) {
        return item.nombre.toLowerCase() === base.toLowerCase();
    });
    return hallado ? hallado.slug : (typeof slugifyNombre === 'function' ? slugifyNombre(base) : '');
}

function renderFilaPedido(item, index, tipo) {
    const slug = item.slug || slugDesdeNombrePedido(item.nombre, tipo);
    const src = rutaImagen(slug);
    let detalle = '';
    let eliminar = '';

    if (tipo === 'producto') {
        detalle = 'x' + item.cantidad + ' unidad' + (item.cantidad === 1 ? '' : 'es');
        eliminar = 'eliminarProducto(' + index + ')';
    } else if (tipo === 'liquido') {
        detalle = formatearStepper(item.litros, 1) + ' L';
        eliminar = 'eliminarLiquido(' + index + ')';
    } else {
        detalle = formatearStepper(item.kilos, 1) + ' kg';
        eliminar = 'eliminarGranel(' + index + ')';
    }

    return (
        '<div class="pedido-item">' +
            '<img class="pedido-item__img" src="' + escaparHtml(src) + '" alt="" loading="lazy" onerror="onImgError(this)">' +
            '<div class="pedido-item__info">' +
                '<p class="pedido-item__nombre">' + escaparHtml(item.nombre) + '</p>' +
                '<p class="pedido-item__cant">' + escaparHtml(detalle) + '</p>' +
            '</div>' +
            '<button type="button" class="pedido-item__borrar" onclick="' + eliminar + '" aria-label="Quitar">×</button>' +
        '</div>'
    );
}

function actualizarListaPedido() {
    const container = document.getElementById('pedidoAgregados');
    if (!container) return;

    if (totalItemsPedido() === 0) {
        container.innerHTML = '<p class="lista-pedido__vacio">Todavía no agregaste nada. Tocá un producto del catálogo.</p>';
        actualizarBadgeCarrito();
        return;
    }

    let html = '';
    if (productosAgregados.length) {
        html += '<h3 class="lista-pedido__grupo">Productos</h3>';
        productosAgregados.forEach(function (prod, index) {
            html += renderFilaPedido(prod, index, 'producto');
        });
    }
    if (liquidosAgregados.length) {
        html += '<h3 class="lista-pedido__grupo">Líquidos</h3>';
        liquidosAgregados.forEach(function (liq, index) {
            html += renderFilaPedido(liq, index, 'liquido');
        });
    }
    if (granelAgregados.length) {
        html += '<h3 class="lista-pedido__grupo">A granel</h3>';
        granelAgregados.forEach(function (gran, index) {
            html += renderFilaPedido(gran, index, 'granel');
        });
    }

    container.innerHTML = html;
    actualizarBadgeCarrito();
}

function eliminarProducto(index) {
    productosAgregados.splice(index, 1);
    actualizarListaPedido();
}

function eliminarLiquido(index) {
    liquidosAgregados.splice(index, 1);
    actualizarListaPedido();
}

function eliminarGranel(index) {
    granelAgregados.splice(index, 1);
    actualizarListaPedido();
}

// Compat: listas viejas (por si se llama desde otro lado)
function actualizarListaProductos() { actualizarListaPedido(); }
function actualizarListaLiquidos() { actualizarListaPedido(); }
function actualizarListaGranel() { actualizarListaPedido(); }

// ── Enviar ──────────────────────────────────────────────────
async function enviarPorWhatsApp() {
    const cliente = document.getElementById('cliente').value.trim();

    if (!cliente) {
        alert('Ingresá el nombre del cliente');
        return;
    }

    if (totalItemsPedido() === 0) {
        alert('Agregá al menos un producto');
        return;
    }

    const entrega = document.getElementById('entrega').value;
    if (!entrega) {
        alert('Seleccioná una fecha de entrega');
        return;
    }
    if (!esFechaEntregaValida(entrega)) {
        alert('La fecha de entrega no puede ser anterior a hoy.');
        document.getElementById('entrega').value = obtenerFechaMinimaEntrega();
        return;
    }

    const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
    if (!metodoPago) {
        alert('Seleccioná el método de pago (efectivo o transferencia)');
        return;
    }

    const telefono = document.getElementById('telefono').value.trim();
    if (!telefono || telefono.replace(/\D/g, '').length < 8) {
        alert('Ingresá un WhatsApp válido del cliente');
        return;
    }

    const productosPayload = productosAgregados.map(function (p) {
        return { nombre: p.nombre, cantidad: p.cantidad, tipo: 'producto' };
    });
    const liquidosPayload = liquidosAgregados.map(function (p) {
        return { nombre: p.nombre, litros: p.litros, tipo: 'liquido' };
    });
    const granelPayload = granelAgregados.map(function (p) {
        return { nombre: p.nombre, kilos: p.kilos, tipo: 'granel' };
    });

    const pedidoPendiente = {
        id: Date.now(),
        cliente: cliente,
        telefono: telefono,
        entrega: entrega,
        metodoPago: metodoPago.value,
        productos: productosPayload,
        liquidos: liquidosPayload,
        granel: granelPayload,
        notas: document.getElementById('notas').value,
        fechaCreacion: new Date().toLocaleDateString('es-AR'),
        estado: 'pendiente_confirmacion'
    };

    guardarDatosClienteLocal(cliente, telefono);

    let pedidosPendientes = JSON.parse(localStorage.getItem('famat_pendientes') || '[]');
    pedidosPendientes.push(pedidoPendiente);
    localStorage.setItem('famat_pendientes', JSON.stringify(pedidosPendientes));

    let todosPedidos = JSON.parse(localStorage.getItem('famat_pedidos') || '[]');
    todosPedidos.push(pedidoPendiente);
    localStorage.setItem('famat_pedidos', JSON.stringify(todosPedidos));

    const supabaseListo = await asegurarSupabaseCargado();
    if (!supabaseListo) {
        alert('No se pudo cargar Supabase. Revisá que tengas internet y volvé a abrir la app.');
    } else {
        initSupabaseFamat();
        const resultado = await insertarPedidoSupabase(pedidoPendiente);
        if (!resultado.ok) {
            const esRls = /row-level security|42501|policy/i.test(resultado.error || '');
            const ayudaRls = esRls
                ? '\n\nSolución: en Supabase → SQL Editor, ejecutá las políticas de INSERT que te pasamos.'
                : '';
            alert('El pedido quedó guardado solo en este celular.\n\nNo se pudo subir a Supabase:\n' + resultado.error + ayudaRls);
        }
    }

    if (esDispositivoIOS()) {
        mostrarPantallaExito(cliente);
        return;
    }

    const mensaje = `🔔 *NUEVO PEDIDO de ${cliente}*`;
    const url = `https://wa.me/5493534247019?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    confirmarLimpiar();
}

const TELEFONO_GABRIELA = '+5493534247019';

function esDispositivoIOS() {
    const ua = navigator.userAgent || '';
    return /iPad|iPhone|iPod/.test(ua)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function limpiaFormularioPedido() {
    productosAgregados = [];
    liquidosAgregados = [];
    granelAgregados = [];
    document.getElementById('notas').value = '';
    document.querySelectorAll('input[name="metodoPago"]').forEach(function (radio) {
        radio.checked = false;
    });
    actualizarVisibilidadAlias();
    actualizarSelectorFragancia('');
    actualizarListaPedido();
    cargarDatosClienteLocal();
    cerrarCalendarioFamat();
    setFechaEntrega(obtenerFechaMinimaEntrega(), false);
}

function limpiarFormularioPedido() {
    limpiaFormularioPedido();
}

function confirmarLimpiar() {
    if (confirm('¿Deseas limpiar todo el pedido?')) {
        limpiarFormularioPedido();
    }
}

function mostrarPantallaExito(nombreCliente) {
    const overlay = document.getElementById('pantallaExito');
    const btnWa = document.getElementById('btnWaGabriela');
    if (!overlay) return;

    const mensaje = encodeURIComponent(`🔔 NUEVO PEDIDO de ${nombreCliente}`);
    if (btnWa) {
        btnWa.href = `https://wa.me/5493534247019?text=${mensaje}`;
    }

    overlay.classList.add('pantalla-exito--visible');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function cerrarPantallaExito() {
    const overlay = document.getElementById('pantallaExito');
    if (!overlay) return;

    overlay.classList.remove('pantalla-exito--visible');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    limpiarFormularioPedido();
}

function copiarTelefonoGabriela() {
    const texto = TELEFONO_GABRIELA;
    navigator.clipboard.writeText(texto).then(function () {
        alert('Número copiado: ' + texto);
    }).catch(function () {
        alert('Número de Gabriela: ' + texto);
    });
}

function copiarAlias() {
    const alias = 'Famat.limpieza';
    navigator.clipboard.writeText(alias).then(function () {
        alert('Alias copiado: ' + alias);
    });
}

function cargarScriptUnaVez(src) {
    return new Promise(function (resolve, reject) {
        const ya = document.querySelector('script[data-src="' + src + '"]');
        if (ya) {
            if (ya.dataset.loaded === '1') {
                resolve();
                return;
            }
            ya.addEventListener('load', function () { resolve(); });
            ya.addEventListener('error', function () { reject(new Error('No se pudo cargar ' + src)); });
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.dataset.src = src;
        script.async = true;
        script.onload = function () {
            script.dataset.loaded = '1';
            resolve();
        };
        script.onerror = function () {
            reject(new Error('No se pudo cargar ' + src));
        };
        document.head.appendChild(script);
    });
}

let promesaSupabase = null;
function asegurarSupabaseCargado() {
    if (window.supabase && typeof insertarPedidoSupabase === 'function') {
        return Promise.resolve(true);
    }
    if (!promesaSupabase) {
        promesaSupabase = cargarScriptUnaVez('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2')
            .then(function () {
                return cargarScriptUnaVez('supabase-famat.js?v=5');
            })
            .then(function () {
                return !!(window.supabase && typeof insertarPedidoSupabase === 'function');
            })
            .catch(function () {
                promesaSupabase = null;
                return false;
            });
    }
    return promesaSupabase;
}

function actualizarHeaderCompacto() {
    const header = document.getElementById('siteHeader');
    if (!header) return;

    const y = window.scrollY || window.pageYOffset || 0;
    const compacto = header.classList.contains('site-header--compact');

    // Histéresis: evita titileo al achicar/agrandar el header sticky
    if (!compacto && y > 80) {
        header.classList.add('site-header--compact');
    } else if (compacto && y < 12) {
        header.classList.remove('site-header--compact');
    }
}

// ── Carga + bienvenida + tour ────────────────────────────────
const ONBOARDING_KEY = 'famat_onboarding_v1';
const CARGA_MIN_MS = 5000;

const TOUR_PASOS = [
    {
        target: '[data-tour="cliente"]',
        titulo: '1 · Datos del cliente (a quién le vendés)',
        texto: 'Empezá acá: escribí el nombre del cliente y su WhatsApp (su número de teléfono). El teléfono queda guardado en este celular para no tener que escribirlo de nuevo.'
    },
    {
        target: '[data-tour="catalogo"]',
        titulo: '2 · Elegí del catálogo (la lista de productos)',
        texto: 'Usá las pestañas —los botones de arriba— Producto, Líquido o A granel. Podés buscar por nombre o filtrar por línea (el rubro o grupo, por ejemplo “Baldes” o “Ceras”). Tocá un producto para elegir la cantidad y sumarlo al pedido.'
    },
    {
        target: '[data-tour="carrito"]',
        titulo: '3 · Revisá el carrito (tu pedido)',
        texto: 'El ícono del carrito muestra cuántos ítems (productos) llevás cargados. Al tocarlo se abre el panel (la ventana): ahí ves lo agregado, la fecha de entrega, el pago y el botón para enviar.'
    },
    {
        target: '[data-tour="carrito"]',
        titulo: '4 · Enviar el pedido',
        texto: 'Cuando esté todo listo, abrí el carrito, elegí la fecha y el método de pago (cómo va a pagar), y tocá “Enviar pedido”. Si te trabás, volvé a “¿Cómo se usa?” en el encabezado (la barra de arriba).'
    }
];

let tourIndice = 0;
let tourActivo = false;

function yaCompletoOnboarding() {
    try {
        return localStorage.getItem(ONBOARDING_KEY) === '1';
    } catch (e) {
        return false;
    }
}

function marcarOnboardingCompleto() {
    try {
        localStorage.setItem(ONBOARDING_KEY, '1');
    } catch (e) { /* ignore */ }
}

function ocultarPantallaCarga() {
    const carga = document.getElementById('pantallaCarga');
    if (!carga) return;
    carga.classList.add('pantalla-carga--oculta');
    window.setTimeout(function () {
        carga.setAttribute('hidden', '');
        carga.setAttribute('aria-hidden', 'true');
    }, 480);
}

function mostrarBienvenida() {
    const pantalla = document.getElementById('pantallaBienvenida');
    if (!pantalla) return;
    pantalla.hidden = false;
    pantalla.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function ocultarBienvenida() {
    const pantalla = document.getElementById('pantallaBienvenida');
    if (!pantalla) return;
    pantalla.hidden = true;
    pantalla.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function elegirPerfilUsuario(tipo) {
    ocultarBienvenida();
    if (tipo === 'nuevo') {
        iniciarTourGuiado();
        return;
    }
    marcarOnboardingCompleto();
}

function abrirAyudaUso() {
    cerrarPanelAgregar();
    cerrarPanelCarrito();
    ocultarBienvenida();
    iniciarTourGuiado();
}

function volverAlInicio() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

function iniciarTourGuiado() {
    tourIndice = 0;
    tourActivo = true;
    const tour = document.getElementById('tourGuiado');
    if (!tour) return;
    tour.hidden = false;
    tour.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mostrarPasoTour();
}

function cerrarTourGuiado(marcarCompleto) {
    tourActivo = false;
    limpiarResaltadoTour();
    const tour = document.getElementById('tourGuiado');
    if (tour) {
        tour.hidden = true;
        tour.setAttribute('aria-hidden', 'true');
    }
    const spotlight = document.getElementById('tourSpotlight');
    if (spotlight) spotlight.hidden = true;
    document.body.style.overflow = '';
    if (marcarCompleto) marcarOnboardingCompleto();
}

function limpiarResaltadoTour() {
    document.querySelectorAll('.tour-objetivo').forEach(function (el) {
        el.classList.remove('tour-objetivo');
    });
}

function mostrarPasoTour() {
    const paso = TOUR_PASOS[tourIndice];
    if (!paso) {
        cerrarTourGuiado(true);
        return;
    }

    const label = document.getElementById('tourPasoLabel');
    const titulo = document.getElementById('tourTitulo');
    const texto = document.getElementById('tourTexto');
    const btnSig = document.getElementById('tourSiguiente');

    if (label) label.textContent = 'Paso ' + (tourIndice + 1) + ' de ' + TOUR_PASOS.length;
    if (titulo) titulo.textContent = paso.titulo;
    if (texto) texto.textContent = paso.texto;
    if (btnSig) btnSig.textContent = tourIndice === TOUR_PASOS.length - 1 ? 'Empezar' : 'Siguiente';

    limpiarResaltadoTour();
    const target = document.querySelector(paso.target);
    const spotlight = document.getElementById('tourSpotlight');
    const backdrop = document.querySelector('.tour-guiado__backdrop');

    if (target && spotlight) {
        if (backdrop) backdrop.style.opacity = '0';
        target.classList.add('tour-objetivo');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        window.setTimeout(function () {
            posicionarSpotlight(target, spotlight);
        }, 280);
    } else if (spotlight) {
        if (backdrop) backdrop.style.opacity = '1';
        spotlight.hidden = true;
    }
}

function posicionarSpotlight(target, spotlight) {
    if (!tourActivo || !target || !spotlight) return;
    const rect = target.getBoundingClientRect();
    const pad = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const left = Math.max(8, Math.min(rect.left - pad, vw - 24));
    const top = Math.max(8, Math.min(rect.top - pad, vh - 24));
    const width = Math.max(24, Math.min(vw - left - 8, rect.width + pad * 2));
    const height = Math.max(24, Math.min(vh - top - 8, rect.height + pad * 2));
    spotlight.hidden = false;
    spotlight.style.top = top + 'px';
    spotlight.style.left = left + 'px';
    spotlight.style.width = width + 'px';
    spotlight.style.height = height + 'px';
}

function avanzarTourGuiado() {
    if (tourIndice >= TOUR_PASOS.length - 1) {
        cerrarTourGuiado(true);
        return;
    }
    tourIndice += 1;
    mostrarPasoTour();
}

function finalizarArranqueApp() {
    ocultarPantallaCarga();
    if (yaCompletoOnboarding()) return;
    window.setTimeout(mostrarBienvenida, 320);
}

// ── Init ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', function () {
    const inicio = Date.now();

    configurarInputEntrega();
    actualizarVisibilidadAlias();
    cargarDatosClienteLocal();
    configurarAutoguardadoCliente();
    configurarFiltrosCatalogo();
    cargarFiltroLineas();
    renderizarCatalogo();
    actualizarListaPedido();
    aplicarConfigStepperParaTipo('producto');
    actualizarDisplayStepper('panelQty');
    actualizarHeaderCompacto();

    // Mantener la pantalla de carga al menos 5s para que se vea bien.
    window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
            const restante = Math.max(0, CARGA_MIN_MS - (Date.now() - inicio));
            window.setTimeout(finalizarArranqueApp, restante);
        });
    });
});

window.addEventListener('scroll', function () {
    actualizarHeaderCompacto();
    if (!tourActivo) return;
    const paso = TOUR_PASOS[tourIndice];
    if (!paso) return;
    const target = document.querySelector(paso.target);
    const spotlight = document.getElementById('tourSpotlight');
    if (target && spotlight && !spotlight.hidden) posicionarSpotlight(target, spotlight);
}, { passive: true });

window.addEventListener('resize', function () {
    if (!tourActivo) return;
    const paso = TOUR_PASOS[tourIndice];
    if (!paso) return;
    const target = document.querySelector(paso.target);
    const spotlight = document.getElementById('tourSpotlight');
    if (target && spotlight && !spotlight.hidden) posicionarSpotlight(target, spotlight);
});

window.addEventListener('pageshow', function () {
    configurarInputEntrega();
    cargarDatosClienteLocal();
    actualizarHeaderCompacto();
});

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        configurarInputEntrega();
    }
});

document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (tourActivo) {
        cerrarTourGuiado(true);
        return;
    }
    const bienvenida = document.getElementById('pantallaBienvenida');
    if (bienvenida && !bienvenida.hidden) return;
    cerrarPanelAgregar();
    cerrarPanelCarrito();
});

