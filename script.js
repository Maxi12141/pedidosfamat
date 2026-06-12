// ============================================================
//  PEDIDOS FAMAT - script.JS - VERSIÓN FINAL
// ============================================================

let productosAgregados = [];
let liquidosAgregados = [];
let granelAgregados = [];

// ── Fecha de entrega (iPhone no respeta siempre el min del calendario) ──
function obtenerFechaMinimaEntrega() {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
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
        alert('⚠️ La fecha de entrega no puede ser anterior a hoy.');
    }
    input.value = obtenerFechaMinimaEntrega();
    return false;
}

function configurarInputEntrega() {
    const input = document.getElementById('entrega');
    if (!input) return;

    const min = obtenerFechaMinimaEntrega();
    input.setAttribute('min', min);
    input.setAttribute('required', 'required');

    if (!input.value || input.value < min) {
        input.value = min;
    }

    input.addEventListener('change', function () {
        validarFechaEntrega(true);
    });

    input.addEventListener('input', function () {
        validarFechaEntrega(false);
    });

    input.addEventListener('blur', function () {
        validarFechaEntrega(true);
    });
}

// ── DATOS DEL CLIENTE (guardados en este teléfono) ────────────
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

window.addEventListener('DOMContentLoaded', function() {
    configurarInputEntrega();
    cargarDatosClienteLocal();
    configurarAutoguardadoCliente();
    ['productoQty', 'liquidoLitros', 'granelKilos'].forEach(actualizarDisplayStepper);
});

window.addEventListener('pageshow', function () {
    configurarInputEntrega();
    cargarDatosClienteLocal();
});

document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        configurarInputEntrega();
    }
});

// ── SELECTOR DE CANTIDAD (+ / −) ────────────────────────────
const STEPPER_CONFIG = {
    productoQty: {
        min: 1, step: 1, decimals: 0,
        singular: 'unidad', plural: 'unidades'
    },
    liquidoLitros: {
        min: 0.5, step: 0.5, decimals: 1,
        singular: 'litro', plural: 'litros'
    },
    granelKilos: {
        min: 0.1, step: 0.1, decimals: 1,
        singular: 'kilo', plural: 'kilos'
    }
};

// ── FRAGANCIAS POR LÍQUIDO ──────────────────────────────────
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
        filaAroma.style.display = 'none';
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
    filaAroma.style.display = 'block';
}

function configurarSelectorLiquidos() {
    const liquidoSelect = document.getElementById('liquidoSelect');
    if (!liquidoSelect) return;

    liquidoSelect.addEventListener('change', function () {
        actualizarSelectorFragancia(this.value);
    });
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

// ── BASE DE DATOS CATEGORIZADA ─────────────────────────────

function ordenarAlfabeticamente(lista) {
    return [...lista].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function obtenerLineasPorTipo(tipo) {
    return CATALOGO_LINEAS.filter(function (entrada) { return entrada.tipo === tipo; });
}

function obtenerListaPlana(tipo) {
    const vistos = new Map();
    obtenerLineasPorTipo(tipo).forEach(function (entrada) {
        entrada.items.forEach(function (nombre) {
            const clave = nombre.trim().toLowerCase();
            if (!vistos.has(clave)) vistos.set(clave, nombre);
        });
    });
    return ordenarAlfabeticamente([...vistos.values()]);
}

const articulosDB = obtenerListaPlana('producto');
const liquidosDBList = obtenerListaPlana('liquido');
const granelDBList = obtenerListaPlana('granel');

// Cargar selects al iniciar
window.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    cargarLiquidos();
    cargarGranel();
    configurarSelectorLiquidos();
});

// ── FUNCIONES PARA CARGAR SELECTS ─────────────────────────

function cargarLineasSelect(lineaSelectId, tipo) {
    const select = document.getElementById(lineaSelectId);
    if (!select) return;

    if (typeof CATALOGO_LINEAS === 'undefined') {
        console.error('No se cargó catalogo-famat.js');
        return;
    }

    obtenerLineasPorTipo(tipo).forEach(function (entrada) {
        const option = document.createElement('option');
        option.value = entrada.linea;
        option.textContent = entrada.linea;
        select.appendChild(option);
    });
}

function cargarItemsDeLinea(itemSelectId, tipo, lineaNombre) {
    const select = document.getElementById(itemSelectId);
    if (!select) return;

    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';

    if (!lineaNombre) {
        placeholder.textContent = '-- Primero elige una línea --';
        select.appendChild(placeholder);
        select.disabled = true;
        return;
    }

    const entrada = obtenerLineasPorTipo(tipo).find(function (e) { return e.linea === lineaNombre; });
    if (!entrada) return;

    placeholder.textContent = '-- Elige un producto --';
    select.appendChild(placeholder);
    select.disabled = false;

    ordenarAlfabeticamente(entrada.items).forEach(function (nombre) {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        select.appendChild(option);
    });
}

function configurarSelectorPorLinea(lineaSelectId, itemSelectId, tipo) {
    const lineaSelect = document.getElementById(lineaSelectId);
    if (!lineaSelect) return;

    lineaSelect.addEventListener('change', function () {
        cargarItemsDeLinea(itemSelectId, tipo, this.value);
        if (itemSelectId === 'liquidoSelect') {
            actualizarSelectorFragancia('');
        }
    });
}

function resetearSelectorCategoria(lineaSelectId, itemSelectId, tipo) {
    const lineaSelect = document.getElementById(lineaSelectId);
    if (lineaSelect) lineaSelect.value = '';
    cargarItemsDeLinea(itemSelectId, tipo, '');
}

function cargarProductos() {
    cargarLineasSelect('lineaProductoSelect', 'producto');
    configurarSelectorPorLinea('lineaProductoSelect', 'productoSelect', 'producto');
}

function cargarLiquidos() {
    cargarLineasSelect('lineaLiquidoSelect', 'liquido');
    configurarSelectorPorLinea('lineaLiquidoSelect', 'liquidoSelect', 'liquido');
}

function cargarGranel() {
    cargarLineasSelect('lineaGranelSelect', 'granel');
    configurarSelectorPorLinea('lineaGranelSelect', 'granelSelect', 'granel');
}

// ── FUNCIÓN PARA CAMBIAR CATEGORÍA ────────────────────────

function cambiarCategoria(categoria, elemento) {
    // Actualizar botones activos
    document.querySelectorAll('.btn-categoria').forEach(btn => {
        btn.classList.remove('btn-categoria--active');
    });
    elemento.classList.add('btn-categoria--active');
    
    // Mostrar/ocultar secciones
    document.querySelectorAll('.seccion-dinamica').forEach(seccion => {
        seccion.classList.remove('seccion-dinamica--visible');
    });
    
    const seccionId = `seccion-${categoria}`;
    const seccion = document.getElementById(seccionId);
    if (seccion) {
        seccion.classList.add('seccion-dinamica--visible');
    }
}

// ── AGREGAR PRODUCTO ──────────────────────────────────────

function agregarProductoSeleccionado() {
    const select = document.getElementById('productoSelect');
    const qty = parseInt(document.getElementById('productoQty').value);
    
    if (!select.value) {
        alert('Selecciona un producto');
        return;
    }
    
    if (qty < 1) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }
    
    productosAgregados.push({
        nombre: select.value,
        cantidad: qty,
        tipo: 'producto'
    });
    
    actualizarListaProductos();
    resetearSelectorCategoria('lineaProductoSelect', 'productoSelect', 'producto');
    resetearStepper('productoQty', 1);
}

function actualizarListaProductos() {
    const container = document.getElementById('productosAgregados');
    if (!container) return;
    
    if (productosAgregados.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Sin productos agregados</p>';
        return;
    }
    
    let html = '<div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">';
    productosAgregados.forEach((prod, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f5f5f5; margin: 5px 0; border-radius: 5px;">
                <span><strong>${prod.nombre}</strong> x${prod.cantidad}</span>
                <button onclick="eliminarProducto(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function eliminarProducto(index) {
    productosAgregados.splice(index, 1);
    actualizarListaProductos();
}

// ── AGREGAR LÍQUIDO ───────────────────────────────────────

function agregarLiquidoNuevo() {
    const select = document.getElementById('liquidoSelect');
    const litros = parseFloat(document.getElementById('liquidoLitros').value);
    let nombre = select.value;

    if (!nombre) {
        alert('Selecciona un líquido');
        return;
    }

    if (requiereFragancia(nombre)) {
        const fragancia = document.getElementById('aromaSelect').value;
        if (!fragancia) {
            alert('Seleccioná una fragancia');
            return;
        }
        nombre = `${nombre} - ${fragancia}`;
    }

    if (litros < 0.5) {
        alert('La cantidad mínima es 0,5 litros');
        return;
    }

    liquidosAgregados.push({
        nombre: nombre,
        litros: litros,
        tipo: 'liquido'
    });

    actualizarListaLiquidos();
    resetearSelectorCategoria('lineaLiquidoSelect', 'liquidoSelect', 'liquido');
    actualizarSelectorFragancia('');
    resetearStepper('liquidoLitros', 1);
}

function actualizarListaLiquidos() {
    const container = document.getElementById('liquidosAgregados');
    if (!container) return;
    
    if (liquidosAgregados.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Sin líquidos agregados</p>';
        return;
    }
    
    let html = '<div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">';
    liquidosAgregados.forEach((liq, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f5f5f5; margin: 5px 0; border-radius: 5px;">
                <span><strong>${liq.nombre}</strong> - ${liq.litros}L</span>
                <button onclick="eliminarLiquido(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function eliminarLiquido(index) {
    liquidosAgregados.splice(index, 1);
    actualizarListaLiquidos();
}

// ── AGREGAR A GRANEL ──────────────────────────────────────

function agregarGranelSeleccionado() {
    const select = document.getElementById('granelSelect');
    const kilos = parseFloat(document.getElementById('granelKilos').value);
    
    if (!select.value) {
        alert('Selecciona un producto');
        return;
    }
    
    if (kilos < 0.1) {
        alert('La cantidad mínima es 0,1 kilos');
        return;
    }
    
    granelAgregados.push({
        nombre: select.value,
        kilos: kilos,
        tipo: 'granel'
    });
    
    actualizarListaGranel();
    resetearSelectorCategoria('lineaGranelSelect', 'granelSelect', 'granel');
    resetearStepper('granelKilos', 1);
}

function actualizarListaGranel() {
    const container = document.getElementById('granelAgregados');
    if (!container) return;
    
    if (granelAgregados.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Sin productos a granel agregados</p>';
        return;
    }
    
    let html = '<div style="border-top: 1px solid #ddd; margin-top: 20px; padding-top: 20px;">';
    granelAgregados.forEach((gran, index) => {
        html += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #f5f5f5; margin: 5px 0; border-radius: 5px;">
                <span><strong>${gran.nombre}</strong> - ${gran.kilos}kg</span>
                <button onclick="eliminarGranel(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">✕</button>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function eliminarGranel(index) {
    granelAgregados.splice(index, 1);
    actualizarListaGranel();
}

// ── ENVIAR POR WHATSAPP ───────────────────────────────────

async function enviarPorWhatsApp() {
    const cliente = document.getElementById('cliente').value.trim();
    
    if (!cliente) {
        alert('Ingresa el nombre del cliente');
        return;
    }
    
    if (productosAgregados.length === 0 && liquidosAgregados.length === 0 && granelAgregados.length === 0) {
        alert('Agrega al menos un producto');
        return;
    }

    const entrega = document.getElementById('entrega').value;
    if (!entrega) {
        alert('⚠️ Seleccioná una fecha de entrega');
        return;
    }
    if (!esFechaEntregaValida(entrega)) {
        alert('⚠️ La fecha de entrega no puede ser anterior a hoy.');
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
    
    const pedidoPendiente = {
        id: Date.now(),
        cliente: cliente,
        telefono: telefono,
        entrega: entrega,
        metodoPago: metodoPago.value,
        productos: [...productosAgregados],
        liquidos: [...liquidosAgregados],
        granel: [...granelAgregados],
        notas: document.getElementById('notas').value,
        fechaCreacion: new Date().toLocaleDateString('es-AR'),
        estado: 'pendiente_confirmacion'
    };

    guardarDatosClienteLocal(cliente, telefono);
    
    // Respaldo local (mismo dispositivo / sin internet)
    let pedidosPendientes = JSON.parse(localStorage.getItem('famat_pendientes') || '[]');
    pedidosPendientes.push(pedidoPendiente);
    localStorage.setItem('famat_pendientes', JSON.stringify(pedidosPendientes));
    
    let todosPedidos = JSON.parse(localStorage.getItem('famat_pedidos') || '[]');
    todosPedidos.push(pedidoPendiente);
    localStorage.setItem('famat_pedidos', JSON.stringify(todosPedidos));
    
    // Sincronizar con Supabase (compartido con el Controlador)
    initSupabaseFamat();
    if (!window.supabase) {
        alert('⚠️ No se pudo cargar Supabase. Revisá que tengas internet y volvé a abrir la app.');
    } else {
        const resultado = await insertarPedidoSupabase(pedidoPendiente);
        if (!resultado.ok) {
            const esRls = /row-level security|42501|policy/i.test(resultado.error || '');
            const ayudaRls = esRls
                ? '\n\nSolución: en Supabase → SQL Editor, ejecutá las políticas de INSERT que te pasamos.'
                : '';
            alert('⚠️ El pedido quedó guardado solo en este celular.\n\nNo se pudo subir a Supabase:\n' + resultado.error + ayudaRls);
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

function limpiarFormularioPedido() {
    productosAgregados = [];
    liquidosAgregados = [];
    granelAgregados = [];
    document.getElementById('entrega').value = '';
    document.getElementById('notas').value = '';
    document.querySelectorAll('input[name="metodoPago"]').forEach(function (radio) {
        radio.checked = false;
    });
    actualizarSelectorFragancia('');
    actualizarListaProductos();
    actualizarListaLiquidos();
    actualizarListaGranel();
    cargarDatosClienteLocal();
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
    navigator.clipboard.writeText(texto).then(() => {
        alert('✓ Número copiado: ' + texto);
    }).catch(() => {
        alert('Número de Gabriela: ' + texto);
    });
}

function copiarAlias() {
    const alias = "Famat.limpieza";
    navigator.clipboard.writeText(alias).then(() => {
        alert('✓ Alias copiado: ' + alias);
    });
}
