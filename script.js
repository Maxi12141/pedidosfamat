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

// ═══ ARTÍCULOS (Cantidad: 1, 2, 3...) ═══
const articulosDB = ordenarAlfabeticamente([
    "Aerosol ambar",
    "Aerosol para lampazo",
    "Difusor aromatico con varillas",
    "Aerosol saphirus",
    "Saphirus textil",
    "Aceite esencial ambar",
    "Saphirus touch repuesto + dispositivo",
    "Saphirus touch repuesto",
    "Dispenser analogico atomizador",
    "Pinitos Walker",
    "Pinitos k78",
    "Bolitas perfumadas",
    "Lata en gel mini k78",
    "Lata en gel mini glade",
    "Lubricante en aerosol Escudo",
    "Silicona aerosol k78",
    "Cepillo p/auto",
    "Alfombra baño 60x40 blanco oriental",
    "Alfombra de goma ventosa",
    "Alfombra doble base 35x50",
    "Balde centrifugo tambor acero",
    "Balde Mopero 16.5L",
    "Baldes x14",
    "Baldes x12",
    "Baldes x9",
    "Repuesto escurridor P/balde 16,5l",
    "Cabo P/balde centrifugo + Porta mopa 1,45m",
    "Comedero chico",
    "Comedero grande",
    "Palita sanitaria",
    "Barre Hojas Profesional (grande)",
    "barre hojas reforzado negro",
    "Bolsas de consorcio 60x90 Rosario",
    "Bolsas de consorcio 85x110 Rosario",
    "Bolsas de consorcio 90x120 Rosario",
    "Bolsas de residuos 45x60 Rosario",
    "Broches madera rayita",
    "Broches plasticos-madera Make",
    "Broches plasticos rayita",
    "Burletes doble de friselina",
    "Burletes doble de cuerina",
    "Burletes zocalo doble Premiun",
    "Cabo de madera 1,20",
    "Cabo de madera 1,50",
    "Cabo de madera 2,00",
    "Cabo de madera P/Barrendero",
    "Cabo extrensibles 3,00 mts",
    "Cabo extrensibles 1,50 mts",
    "Cabo metalico forrados 1,20",
    "Canasto P/broches",
    "Canasto redondo mediano",
    "canasto P/ropa cuadrado con tapa",
    "Canasto P/ropa redondo con tapa",
    "Cepillo limpia techo Hongo",
    "Cepillo uñas C/piedra pomez",
    "Cepillo uñas x2",
    "Cepillo uñas c/u",
    "cepillo lava-zapatilla",
    "Cepillo planchita y cerrado",
    "Cepillos limpia inodoro chico",
    "Cepillos limpia inodoro grande",
    "Cepillo limpia inodoro c/base extralimp",
    "Cepillos limpia inodoro c/base salzano",
    "Cepillos limpia inodoro c/base importado Chico",
    "Cesto de basura 12 l Grande",
    "Cesto de basura 5 l chico",
    "Cesto de basura c/pedal 13lts",
    "PROTECTOR C/ GANCHOS CORTINA BAÑO",
    "Cortina baño C/protector y ganchos",
    "Cortina plastica de tiras",
    "Desinfectante aerosol lysoform",
    "Desodorante de ambiente glade",
    "Desodorante de ambiente fraganss",
    "Desodorante de ambiente poett",
    "Desodorante en crema rexona 60gr",
    "Escarbadiente con dispenser",
    "Escoba de paja",
    "escobeta azteca",
    "Escobillon grande florinda/inca",
    "Escobillon mediano huarpe/pandi",
    "Escobillon laqueado simil madera",
    "Escobillon chico irizar",
    "Esponjas de acero Make 30grs",
    "Esponjas de acero Make 50grs",
    "Esponjas de acero make12g",
    "esponjas dorada de 12grs",
    "Esponjas dorada de 15grs",
    "Esponjas dorada Make 30grs",
    "Esponjas antiadherentes Make",
    "Esponja extralimp plus",
    "Esponja de baño chica",
    "Esponja de baño grande",
    "Esponja fibra verde make",
    "Rejillas Dorada doble cara",
    "Esponjas Amarillas salvauñas MORTINER",
    "Esponjas Amarillas salvauñas make",
    "Fosforos x220",
    "Fosforos x400",
    "Encendedor",
    "Franela",
    "Fuentos x 13lts",
    "fuenton 24lts",
    "Fuentos x20lts",
    "Fuenton x30lts",
    "Gatillos (Blanco)",
    "gatillos (profesional)",
    "Guantes pequeños P",
    "Guantes grandes G",
    "Guantes medianos M",
    "Insecticidas en aerosol raid comun",
    "Insecticidas en aerosol shelton",
    "Cebo en bloque raticida geltex",
    "Cebo cucarachas geltek 6 estaciones",
    "Granulado raticida ultra plus",
    "Cebo mosca granulado",
    "Naftalina",
    "NAFTALINA x 200",
    "Mata cucaracha acido borico",
    "Jabon detergente Quitamanchas",
    "Jabon en pan Blanco Ala 200",
    "Jabon en pan gigante 200",
    "Jabon en pan cosquin 200",
    "Jabonetas x 1 Qsens",
    "Jabonetas x 3 Qsens",
    "kit lampazo barrendero+armazon 35cm",
    "Kit Lampazo barrendero+Armazon 60cm",
    "Kit Lampazo barrendero+Armazon 80cm",
    "Kit Lampazo barrendero+Armazon 100cm",
    "Repuesto Lampazo Barrendero 35cm",
    "Repuesto Lampazo Barrendero 60cm",
    "Repuesto Lampazo Barrendero 80cm",
    "Repuesto Lampazo Barrendero 100cm",
    "Lampazo x80cm Barrendero MADERA",
    "Lampazo de hilo n°40",
    "Lampazo azul",
    "Lampazo pabilo n 40",
    "Limpia vidrios+esponjas make 20cm",
    "Limpia vidrios+esponjas make 30cm",
    "limpia vidrios M/corto",
    "Lustra muebles Ceramicol",
    "Lustra Muebles BLEM",
    "Mata mosca paleta",
    "Mata mosca manito",
    "Gillete prestobarba",
    "Mopa centrifugo repuesto",
    "Mopa paño",
    "Mopa algodón blanca-Gris MT",
    "Mopa microfibra",
    "Pala c/cabo Mapuche",
    "Pala cabo economica COLORES",
    "Pala c/cabo NEGRA",
    "Pala mano c/goma",
    "Pala de mano sin goma",
    "Palangana 4lts",
    "Palangana 6lts",
    "palangana 9LTS",
    "Papel Alumino 28cm",
    "Papel film 30mts",
    "Papel cocina maxi rollo",
    "Papel de cocina x3 Elegante",
    "Papel higienico x4 elegante",
    "Papel higienico x4 hiar",
    "papel higienico x6 Niraflor",
    "Papel higienico x6 elegante",
    "Papel higienco suelto cordial",
    "Papel higienico dispenser 8 x300",
    "Papel higienico dispenser 8 x 300 c/u",
    "Bobina Industrial 25x400 x2",
    "Bobina industral 25x400 C/U",
    "Toallas intercaladas C/U",
    "Tollas intercaladas 20X24 x 10",
    "Pasa cera Grande",
    "Pastillas p/inodoro Pato (canasta)",
    "Pastillas P/inodoro Pato Purific/glade adhesivo",
    "Pilas energizer AA",
    "Pilas energizer AAA",
    "Kit para analisis PH cloro",
    "Saca hoja P/pileta",
    "Saca hoja P/pileta bolsa",
    "Manguera flotante corrugada x metro 5mts o 10mts",
    "Cabo telescopico 3,6 mts",
    "Cabo aluminio p/saca hojas",
    "Barrefondo 8 ruedas",
    "Barrefondo media luna",
    "Boya hongo P/piletas (P/200)",
    "Boya hongo Pileta lona (P/50)",
    "Boya grande C/regulador (P/200)",
    "Boya grande satelital (P/200)",
    "Boya chica satelital (P/50)",
    "Plumero de pabilo blanco",
    "Plumero algodon hilo grueso",
    "Plumero algodon hilo super grueso",
    "Pulverizador multiuso 500cc",
    "Pulverizador multiuso 750cc",
    "Pulverizador multiuso 1L",
    "Repelente off",
    "repelente 911",
    "Tabletas P/mosquitos x12",
    "Tabletas P/mosquitos C/U",
    "Raid espiral x unidad",
    "Raid espiral x12",
    "Rejilla bar especial linea 10",
    "Rejillas microfibra 60x40",
    "Rejillas Esponjas linea 10",
    "Rejillas lava autos liviana linea 10",
    "Rejilla paños multiusos sueltos",
    "REPASADORES DE TOLLA Make",
    "Repasadores tollas fribran",
    "Repasadores Eco",
    "Repasadores toalla mister trapo",
    "Sapito riego",
    "Manguera 15 mts 1/2",
    "Manguera 25 mts 1/2",
    "Carbon neutro sagrada madre C/U (Caja de 24)",
    "Bomba humo sagrada madre x4",
    "Cono cascada x10",
    "sahumerios banglades x10 finos",
    "Sahumerios triple duracion x 5 gruesos",
    "Secador doble Salzano 41cm",
    "Secador doble Salzano 35 cm",
    "SECADOR DOBLE ECO house",
    "Secador de piso salzano",
    "Sopapa Grande20CM",
    "Sopapa Chica11CM",
    "Sopapa C/mango",
    "Trampa P/mosca",
    "Trapo de pisos blancos",
    "Trapo de pisos consorcios blanco MT",
    "Trapo de pisos consorcios gris MT",
    "Trapo de pisos gris MT",
    "Trapo de pisos rayados linea 10",
    "Trapo de pisos blanco linea 10",
    "Trapo de pisos gris linea 10",
    "Velas Cortas 10cm",
    "Velas Largas 20cm",
    "Virulana x10 (lana de acero)",
    "Toallas femeninas doncella x 8",
    "Protector diario doncella x20",
    "Algodón doncella"
]);

// ═══ LÍQUIDOS (Cantidad: ml, litros) ═══
const liquidosDBList = ordenarAlfabeticamente([
    "Abrillantador P/lavavajillas",
    "Alcohol de quemar",
    "Alcohol puro",
    "Alguicida",
    "Bombas blanqueadoras",
    "Bombas efervescentes",
    "Cera 8M incolora",
    "Cera blem",
    "Cera Echo incolora",
    "Cera Glo Cot",
    "Cera Negra-Roja 8M",
    "Cif en Crema",
    "Clarificante Precipitante",
    "Cloro",
    "Cloro granulado",
    "Cloro granulado multifuncion",
    "Composicion P/baños quimicos",
    "Crema enjuague canino",
    "Creolina",
    "Derribante",
    "Desengrasante cocina",
    "Desengrasante industrial",
    "Desinfectante P/piso",
    "Desodorante P/piso",
    "Detergente conc-neutro puro",
    "Detergente conc. Neutro",
    "Detergente de Glicerina",
    "Detergente industrial",
    "Detergente Nacarado",
    "Detergente T/Cif",
    "Doy Pack limpia vidrio",
    "Doy Pack lysoform",
    "Insecticida perfumado T/flit",
    "Jabon Ace",
    "Jabon en gel P/lavavajillas",
    "Jabon liquido ala/suav. premiun",
    "Jabon liquido Ala c/suavizante eco",
    "Jabon liquido ariel premiun",
    "Jabon liquido ARIEL Eco",
    "Jabon liquido desengrasante",
    "Jabon liquido extra c/suavizante",
    "Jabon liquido Famat/suav. Doble perfume",
    "Jabon liquido ropa fina",
    "Jabon liquido skip eco",
    "Jabon liquido skip premiun",
    "Jabon maravilla",
    "Jabon skip con suavizante",
    "Jabon Tocador",
    "Jabon ultra perfumado",
    "Lava Matic",
    "Lavandina",
    "Lavandina en gel",
    "Lavandina R/blanca",
    "Lavandina R/color",
    "Limpiador desengrasante para manos",
    "Limpiador desinfectante para baños",
    "Limpia Horno",
    "Limpia vidrios",
    "Liquido lampazo plus",
    "Liquido P/lampazo C/cera Fragancia frutilla",
    "Liquido P/lampazo siliconado y perfumado",
    "Lustra mueble cremoso",
    "Mata alacran",
    "Pastilla de cloro 50g",
    "Pastilla limpia lavarropas C/U",
    "Pastilla limpia lavarropas x12 (caja)",
    "Pastillas de cloro triple accion C/U 200g",
    "Pastillas de cloro triple accion x 5 200g",
    "Perfume P/ropa al agua",
    "Perfume P/ropa al alcohol",
    "Perfumina",
    "Porcelanato (CERA)",
    "Quita manchas oxi",
    "Quita manchas Trenet",
    "Quita Sarro",
    "Regulador pH",
    "Renovador Vinilico (silicona)",
    "Repelente P/mosquito",
    "Repelente para perRo y gato (NO Toxico)",
    "Sal P/lavavaijllas",
    "Shaapoo P/autos",
    "Shampoo canino",
    "Shampoo para autos sin frotar 850cc en 20l de auga",
    "Shampoo-enjuague sedal",
    "Silicona de vainilla y Transparente",
    "Suavizante Blanco Clasico",
    "Suavizante celeste Clasico",
    "Suavizante comfort",
    "Suavizante coniglio",
    "Suavizante Downy Doble Perfume",
    "Suavizante ultra perfumado",
    "Suavizante vivere",
    "Vinagre de limpieza"
]);

// ═══ A GRANEL (Por kilo) ═══
const granelDBList = ordenarAlfabeticamente([
    "Balanceado P/conejo",
    "Bicarbonato de sodio",
    "Comida P/cachorro Vagoneta",
    "Comida P/gato Vagoneta",
    "comida P/perro Vagoneta",
    "jabon en polvo",
    "jabon en polvo clorado",
    "Percarbonato",
    "Polvo limpiador tipo odex",
    "Soda Cautica granulado"
]);

// Cargar selects al iniciar
window.addEventListener('DOMContentLoaded', function() {
    cargarProductos();
    cargarLiquidos();
    cargarGranel();
    configurarSelectorLiquidos();
});

// ── FUNCIONES PARA CARGAR SELECTS ─────────────────────────

function cargarOpcionesSelect(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select) return;

    ordenarAlfabeticamente(items).forEach(nombre => {
        const option = document.createElement('option');
        option.value = nombre;
        option.textContent = nombre;
        select.appendChild(option);
    });
}

function cargarProductos() {
    cargarOpcionesSelect('productoSelect', articulosDB);
}

function cargarLiquidos() {
    cargarOpcionesSelect('liquidoSelect', liquidosDBList);
}

function cargarGranel() {
    cargarOpcionesSelect('granelSelect', granelDBList);
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
    select.value = '';
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
    select.value = '';
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
    select.value = '';
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
