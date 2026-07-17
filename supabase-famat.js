// Configuración compartida de Supabase — Pedidos Famat + Control
// Proyecto: Famat-pedidos (tgwchfqajlqailjarvjz)
const SUPABASE_URL = 'https://tgwchfqajlqailjarvjz.supabase.co';
const SUPABASE_KEY = 'sb_publishable_c7ppDyLAr8AnR4W2rRQIdA_9ebAUNBK';
const TABLAS_PEDIDOS = ['pedidos'];

let supabaseClient = null;

function initSupabaseFamat() {
    if (supabaseClient) return supabaseClient;
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        }
    } catch (e) {
        console.warn('Supabase no disponible:', e);
    }
    return supabaseClient;
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    try {
        return new Date(fecha).toLocaleDateString('es-AR');
    } catch {
        return String(fecha);
    }
}

function empaquetarProductosJson(pedido) {
    return {
        productos: pedido.productos || [],
        liquidos: pedido.liquidos || [],
        granel: pedido.granel || [],
        entrega: pedido.entrega || '',
        telefono: pedido.telefono || '',
        metodoPago: pedido.metodoPago || '',
        notas: pedido.notas || '',
        estado: pedido.estado || 'pendiente',
        fechaCreacion: pedido.fechaCreacion || formatearFecha(new Date())
    };
}

function desempaquetarProductosJson(data, row) {
    if (Array.isArray(data)) {
        return {
            productos: data,
            liquidos: [],
            granel: [],
            entrega: '',
            telefono: '',
            metodoPago: '',
            notas: '',
            estado: 'pendiente',
            fechaCreacion: formatearFecha(row.fecha || row.created_at)
        };
    }

    if (data && typeof data === 'object') {
        return {
            productos: data.productos || [],
            liquidos: data.liquidos || [],
            granel: data.granel || [],
            entrega: data.entrega || '',
            telefono: data.telefono || '',
            metodoPago: data.metodoPago || '',
            notas: data.notas || '',
            estado: data.estado || 'pendiente',
            fechaCreacion: data.fechaCreacion || formatearFecha(row.fecha || row.created_at)
        };
    }

    return {
        productos: [],
        liquidos: [],
        granel: [],
        entrega: '',
        telefono: '',
        metodoPago: '',
        notas: '',
        estado: 'pendiente',
        fechaCreacion: formatearFecha(row.fecha || row.created_at)
    };
}

function contarItems(pedido) {
    return (pedido.productos?.length || 0)
        + (pedido.liquidos?.length || 0)
        + (pedido.granel?.length || 0);
}

function pedidoToRow(pedido) {
    return {
        id: pedido.id,
        cliente: pedido.cliente || '',
        telefono: pedido.telefono || '',
        productos: pedido.productos || [],
        liquidos: pedido.liquidos || [],
        granel: pedido.granel || [],
        fecha_creacion: pedido.fechaCreacion || formatearFecha(new Date()),
        fecha_entrega: pedido.entrega || '',
        notas: pedido.notas || '',
        metodo_pago: pedido.metodoPago || '',
        estado: pedido.estado || 'pendiente_confirmacion'
    };
}

function rowToPedido(row) {
    if (row.productos && typeof row.productos === 'object' && !Array.isArray(row.productos)
        && (row.productos.productos || row.productos.liquidos || row.productos.entrega)) {
        const detalle = desempaquetarProductosJson(row.productos, row);
        return {
            id: Number(row.id),
            cliente: row.cliente,
            productos: detalle.productos,
            liquidos: detalle.liquidos,
            granel: detalle.granel,
            entrega: detalle.entrega,
            telefono: detalle.telefono || row.telefono || '',
            metodoPago: detalle.metodoPago,
            notas: detalle.notas,
            fechaCreacion: detalle.fechaCreacion,
            estado: detalle.estado
        };
    }

    return {
        id: Number(row.id),
        cliente: row.cliente,
        telefono: row.telefono || '',
        productos: Array.isArray(row.productos) ? row.productos : [],
        liquidos: Array.isArray(row.liquidos) ? row.liquidos : [],
        granel: Array.isArray(row.granel) ? row.granel : [],
        entrega: row.fecha_entrega || '',
        metodoPago: row.metodo_pago || '',
        notas: row.notas || '',
        fechaCreacion: row.fecha_creacion || formatearFecha(row.created_at),
        estado: row.estado || 'pendiente'
    };
}

async function consultarTablaPedidos() {
    const client = initSupabaseFamat();
    if (!client) return { data: null, error: { message: 'Supabase no inicializado' } };

    let ultimoError = null;
    for (const tabla of TABLAS_PEDIDOS) {
        const { data, error } = await client.from(tabla).select('*').order('id', { ascending: false });
        if (!error) return { data, error: null, tabla };
        ultimoError = error;
    }
    return { data: null, error: ultimoError };
}

async function insertarPedidoSupabase(pedido) {
    const client = initSupabaseFamat();
    if (!client) return { ok: false, error: 'Supabase no disponible' };

    const fila = pedidoToRow(pedido);
    delete fila.id;

    let ultimoError = null;
    for (const tabla of TABLAS_PEDIDOS) {
        const { data, error } = await client
            .from(tabla)
            .insert([fila])
            .select('id')
            .single();

        if (!error) return { ok: true, tabla, id: data?.id };
        ultimoError = error.message || String(error);
    }

    return { ok: false, error: ultimoError };
}

async function actualizarPedidoSupabase(id, cambios) {
    const client = initSupabaseFamat();
    if (!client) return { ok: false, error: 'Supabase no disponible' };

    let ultimoError = null;

    for (const tabla of TABLAS_PEDIDOS) {
        const { data: rows, error: errGet } = await client
            .from(tabla)
            .select('*')
            .eq('id', id)
            .limit(1);

        if (errGet) {
            ultimoError = errGet.message || String(errGet);
            continue;
        }
        if (!rows || !rows.length) {
            return { ok: false, error: 'Pedido no encontrado' };
        }

        const pedidoActual = rowToPedido(rows[0]);
        const pedidoNuevo = { ...pedidoActual, ...cambios };
        const fila = pedidoToRow(pedidoNuevo);

        const { error } = await client
            .from(tabla)
            .update({
                cliente: fila.cliente,
                telefono: fila.telefono,
                productos: fila.productos,
                liquidos: fila.liquidos,
                granel: fila.granel,
                fecha_entrega: fila.fecha_entrega,
                notas: fila.notas,
                metodo_pago: fila.metodo_pago,
                estado: fila.estado
            })
            .eq('id', id);

        if (!error) return { ok: true, tabla };
        ultimoError = error.message || String(error);
    }

    return { ok: false, error: ultimoError };
}

async function eliminarPedidoSupabase(id) {
    const client = initSupabaseFamat();
    if (!client) return { ok: false, error: 'Supabase no disponible' };

    let ultimoError = null;
    for (const tabla of TABLAS_PEDIDOS) {
        const { error } = await client.from(tabla).delete().eq('id', id);
        if (!error) return { ok: true, tabla };
        ultimoError = error.message || String(error);
    }

    return { ok: false, error: ultimoError };
}

async function obtenerPedidosSupabase() {
    const { data, error } = await consultarTablaPedidos();
    if (error) return { pedidos: [], pendientes: [], error: error.message || String(error) };

    const todos = (data || []).map(rowToPedido);
    return {
        pedidos: todos.filter(p => p.estado !== 'pendiente_confirmacion'),
        pendientes: todos.filter(p => p.estado === 'pendiente_confirmacion'),
        error: null
    };
}
