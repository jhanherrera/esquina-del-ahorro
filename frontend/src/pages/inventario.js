import { api, storage } from '../utils/helpers.js';

// =====================================================
// VARIABLES GLOBALES
// =====================================================

let inventario = [];
let movimientos = [];
let categorias = [];
let inventarioOriginal = [];
let usuarioActual = null;

// =====================================================
// INICIALIZACIÓN - FUNCIÓN EXPORTADA PARA EL DASHBOARD
// =====================================================
export async function inicializarInventario() {
  console.log(' Inicializando módulo de inventario...');
  
  // Verificar autenticación
  usuarioActual = storage.get('usuario');
  if (!usuarioActual) {
    console.error('❌ Usuario no autenticado');
    mostrarToast('Sesión no válida', 'error');
    return;
  }

  // Verificar que el HTML ya está cargado
  if (!document.getElementById('tablaInventario')) {
    console.error('❌ El contenedor #tablaInventario no existe aún');
    mostrarToast('Error: Contenedor no encontrado', 'error');
    return;
  }

  try {
    // Cargar datos iniciales
    await cargarDatosIniciales();
    
    // Configurar event listeners
    configurarEventListeners();
    
    console.log(' Inventario inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar inventario:', error);
    mostrarToast('Error al inicializar inventario', 'error');
  }
}

// =====================================================
// CARGAR DATOS
// =====================================================

async function cargarDatosIniciales() {
  try {
    mostrarToast('Cargando inventario...', 'info');
    
    console.log('📡 Cargando datos del servidor...');
    
    // Cargar datos en paralelo
    const [inventarioData, estadisticas, movimientosData, categoriasData] = await Promise.all([
      api.get('/inventario'),
      api.get('/inventario/valor-total'),
      api.get('/inventario/movimientos-recientes?limit=10'),
      api.get('/catalogos/categorias')
    ]);

    console.log('Respuestas recibidas:', {
      inventario: inventarioData,
      estadisticas,
      movimientos: movimientosData,
      categorias: categoriasData
    });

    // Guardar datos
    inventario = inventarioData.data || inventarioData || [];
    inventarioOriginal = [...inventario];
    movimientos = movimientosData.data || movimientosData || [];
    categorias = categoriasData.data || categoriasData || [];

    console.log('Datos guardados:', {
      productos: inventario.length,
      movimientos: movimientos.length,
      categorias: categorias.length
    });

    // Actualizar UI
    actualizarEstadisticas(estadisticas.data || estadisticas);
    renderizarInventario(inventario);
    renderizarMovimientos(movimientos);
    cargarCategoriasFiltro();
    cargarProductosModal();
    verificarStockBajo();

    mostrarToast('Inventario cargado exitosamente', 'success');

  } catch (error) {
    console.error('❌ Error al cargar datos:', error);
    mostrarToast('Error al cargar el inventario: ' + error.message, 'error');
    
    // Mostrar datos de ejemplo para debugging
    console.warn('⚠️ Mostrando vista con datos vacíos');
    actualizarEstadisticas({ 
      total_productos: 0, 
      total_unidades: 0, 
      productos_stock_bajo: 0, 
      valor_compra: 0 
    });
    renderizarInventario([]);
  }
}



// =====================================================
// REGISTRAR MOVIMIENTO DE STOCK
// =====================================================

async function registrarMovimientoStock(datos) {
  try {
    const response = await api.post('/inventario/movimiento', datos);
    return response;
  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    throw error;
  }
}



// =====================================================
// ACTUALIZAR ESTADÍSTICAS
// =====================================================

function actualizarEstadisticas(datos) {
  console.log('📊 Actualizando estadísticas:', datos);
  
  const totalProductos = document.getElementById('invTotalProductos');
  const totalUnidades = document.getElementById('invTotalUnidades');
  const stockBajo = document.getElementById('invStockBajo');
  const valorInventario = document.getElementById('invValorInventario');

  

  if (totalProductos) totalProductos.textContent = datos.total_productos || 0;
  if (totalUnidades) totalUnidades.textContent = formatearNumero(datos.total_unidades || 0);
  if (stockBajo) stockBajo.textContent = datos.productos_stock_bajo || 0;
  if (valorInventario) valorInventario.textContent = formatearMoneda(datos.valor_compra || 0);

  // Mostrar alerta si hay productos con stock bajo
  if (datos.productos_stock_bajo > 0) {
    const alertasSection = document.getElementById('alertasStockBajo');
    const alertaTexto = document.getElementById('alertaTexto');
    if (alertasSection) alertasSection.style.display = 'block';
    if (alertaTexto) {
      alertaTexto.textContent = `Hay ${datos.productos_stock_bajo} producto(s) que necesitan reabastecimiento.`;
    }
  }
}

// =====================================================
// RENDERIZAR INVENTARIO
// =====================================================

function renderizarInventario(productos) {
  console.log('Renderizando inventario con', productos.length, 'productos');
  
  const tbody = document.getElementById('tablaInventario');
  
  if (!tbody) {
    console.error('❌ No se encontró #tablaInventario');
    return;
  }
  
  if (!productos || productos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center">
          <p style="padding: 2rem; color: #95a5a6;">
            📦 No hay productos en el inventario
          </p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = productos.map(p => `
    <tr>
      <td><strong>${p.codigo || '-'}</strong></td>
      <td>${p.nombre}</td>
      <td>${p.categoria || '-'}</td>
      <td><strong>${p.stock}</strong></td>
      <td>${p.stock_minimo}</td>
      <td>${formatearMoneda(p.precio_compra)}</td>
      <td>${formatearMoneda(p.precio_venta)}</td>
      <td><strong>${formatearMoneda(p.valor_stock || (p.stock * p.precio_compra))}</strong></td>
      <td>
        <span class="badge badge-${getBadgeClass(p.estado_stock || calcularEstadoStock(p))}">
          ${getEstadoTexto(p.estado_stock || calcularEstadoStock(p))}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-primary" onclick="abrirModalMovimiento(${p.id})" title="Registrar movimiento">
          📝
        </button>
      </td>
    </tr>
  `).join('');
  
  console.log('✅ Tabla renderizada exitosamente');
}

// Calcular estado de stock si no viene del servidor
function calcularEstadoStock(producto) {
  if (producto.stock <= 0) return 'bajo';
  if (producto.stock <= producto.stock_minimo) return 'bajo';
  if (producto.stock <= producto.stock_minimo * 1.5) return 'medio';
  return 'normal';
}

// =====================================================
// RENDERIZAR MOVIMIENTOS
// =====================================================

function renderizarMovimientos(movs) {
  console.log(' Renderizando', movs.length, 'movimientos');
  
  const container = document.getElementById('movimientosRecientes');
  
  if (!container) {
    console.warn('⚠️ No se encontró #movimientosRecientes');
    return;
  }
  
  if (!movs || movs.length === 0) {
    container.innerHTML = `
      <p style="padding: 1rem; color: #95a5a6; text-align: center;">
        No hay movimientos recientes
      </p>
    `;
    return;
  }

  container.innerHTML = movs.map(m => `
    <div class="movement-item" style="padding: 15px; border-bottom: 1px solid #eee; display: flex; gap: 15px;">
      <div class="movement-icon ${m.tipo}" style="font-size: 24px;">
        ${getTipoIcon(m.tipo)}
      </div>
      <div class="movement-details" style="flex: 1;">
        <h4 style="margin: 0 0 5px 0; font-size: 14px;">${m.producto || 'Producto'} ${m.codigo_producto ? `(${m.codigo_producto})` : ''}</h4>
        <p style="margin: 0; font-size: 13px; color: #666;">
          ${getTipoTexto(m.tipo)} de ${m.cantidad} unidades
          ${m.motivo ? ` - ${m.motivo}` : ''}
        </p>
        <span class="movement-date" style="font-size: 12px; color: #999;">
          ${formatearFecha(m.fecha)} | ${m.usuario || 'Sistema'}
        </span>
      </div>
    </div>
  `).join('');
}

// =====================================================
// FILTROS Y BÚSQUEDA
// =====================================================

function configurarEventListeners() {
  console.log(' Configurando event listeners...');
  
  // Búsqueda
  const buscarInput = document.getElementById('buscarProductoInventario');
  if (buscarInput) {
    buscarInput.addEventListener('input', filtrarInventario);
    console.log(' Listener de búsqueda configurado');
  }

  // Filtros
  const filtroCategoria = document.getElementById('filtroCategoria');
  const filtroEstadoStock = document.getElementById('filtroEstadoStock');
  
  if (filtroCategoria) {
    filtroCategoria.addEventListener('change', filtrarInventario);
    console.log(' Listener de categoría configurado');
  }
  
  if (filtroEstadoStock) {
    filtroEstadoStock.addEventListener('change', filtrarInventario);
    console.log(' Listener de estado configurado');
  }

  // Modal de movimiento
  const formMovimiento = document.getElementById('formMovimiento');
  if (formMovimiento) {
    formMovimiento.addEventListener('submit', registrarMovimiento);
    console.log(' Listener de formulario configurado');
  }

  // Selector de producto en modal
  const movProducto = document.getElementById('movProducto');
  if (movProducto) {
    movProducto.addEventListener('change', actualizarStockActual);
    console.log(' Listener de selector configurado');
  }

  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      cerrarModales();
    }
  });
  
  console.log(' Todos los listeners configurados');
}

function filtrarInventario() {
  const buscarInput = document.getElementById('buscarProductoInventario');
  const filtroCategoriaSelect = document.getElementById('filtroCategoria');
  const filtroEstadoSelect = document.getElementById('filtroEstadoStock');
  
  const busqueda = buscarInput ? buscarInput.value.toLowerCase() : '';
  const categoriaSeleccionada = filtroCategoriaSelect ? filtroCategoriaSelect.value : '';
  const estadoSeleccionado = filtroEstadoSelect ? filtroEstadoSelect.value : '';

  let productosFiltrados = [...inventarioOriginal];

  // Filtro de búsqueda
  if (busqueda) {
    productosFiltrados = productosFiltrados.filter(p => 
      p.nombre.toLowerCase().includes(busqueda) ||
      (p.codigo && p.codigo.toLowerCase().includes(busqueda))
    );
  }

  // Filtro de categoría
  if (categoriaSeleccionada) {
    productosFiltrados = productosFiltrados.filter(p => 
      p.categoria === categoriaSeleccionada
    );
  }

  // Filtro de estado
  if (estadoSeleccionado) {
    productosFiltrados = productosFiltrados.filter(p => {
      const estado = p.estado_stock || calcularEstadoStock(p);
      return estado === estadoSeleccionado;
    });
  }

  console.log(' Filtros aplicados. Mostrando', productosFiltrados.length, 'de', inventarioOriginal.length);
  renderizarInventario(productosFiltrados);
}

function limpiarFiltros() {
  const buscarInput = document.getElementById('buscarProductoInventario');
  const filtroCategoria = document.getElementById('filtroCategoria');
  const filtroEstado = document.getElementById('filtroEstadoStock');
  
  if (buscarInput) buscarInput.value = '';
  if (filtroCategoria) filtroCategoria.value = '';
  if (filtroEstado) filtroEstado.value = '';
  
  renderizarInventario(inventarioOriginal);
}

function cargarCategoriasFiltro() {
  const select = document.getElementById('filtroCategoria');
  if (!select) return;
  
  select.innerHTML = '<option value="">Todas las categorías</option>';
  
  categorias.forEach(cat => {
    select.innerHTML += `<option value="${cat.nombre}">${cat.nombre}</option>`;
  });
}

// =====================================================
// MODAL: REGISTRAR MOVIMIENTO
// =====================================================

function abrirModalMovimiento(productoId = null) {
  const modal = document.getElementById('modalMovimiento');
  if (!modal) return;
  
  const selectProducto = document.getElementById('movProducto');
  
  // Limpiar formulario
  const form = document.getElementById('formMovimiento');
  if (form) form.reset();
  
  // Si se pasó un producto, pre-seleccionarlo
  if (productoId && selectProducto) {
    selectProducto.value = productoId;
    actualizarStockActual();
  }
  
  modal.style.display = 'flex';
}

function cerrarModalMovimiento() {
  const modal = document.getElementById('modalMovimiento');
  if (modal) modal.style.display = 'none';
  
  const form = document.getElementById('formMovimiento');
  if (form) form.reset();
}

function cargarProductosModal() {
  const select = document.getElementById('movProducto');
  if (!select) return;
  
  select.innerHTML = '<option value="">Seleccionar producto...</option>';
  
  inventarioOriginal.forEach(p => {
    select.innerHTML += `
      <option value="${p.id}" data-stock="${p.stock}">
        ${p.nombre} (Stock: ${p.stock})
      </option>
    `;
  });
}

function actualizarStockActual() {
  const select = document.getElementById('movProducto');
  const spanStock = document.getElementById('stockActual');
  
  if (!select || !spanStock) return;
  
  const selectedOption = select.options[select.selectedIndex];
  const stockActual = selectedOption ? selectedOption.dataset.stock : 0;
  
  spanStock.textContent = stockActual;
}

async function registrarMovimiento(e) {
  e.preventDefault();

  const productoId = document.getElementById('movProducto').value;
  const tipo = document.getElementById('movTipo').value;
  const cantidad = parseInt(document.getElementById('movCantidad').value);
  const motivo = document.getElementById('movMotivo').value;

  // Validaciones
  if (!productoId) {
    mostrarToast('Debe seleccionar un producto', 'error');
    return;
  }

  if (!cantidad || cantidad <= 0) {
    mostrarToast('La cantidad debe ser mayor a 0', 'error');
    return;
  }

  // Confirmar
  const producto = inventarioOriginal.find(p => p.id == productoId);
  const confirmar = confirm(
    `¿Confirmar ${tipo} de ${cantidad} unidades de ${producto.nombre}?`
  );

  if (!confirmar) return;

  try {
    // Deshabilitar botón
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Registrando...';
    }

    // Enviar al backend
    const response = await registrarMovimientoStock({
      producto_id: productoId,
      tipo,
      cantidad,
      motivo,
      usuario_id: usuarioActual.id
    });

    if (response.success) {
      mostrarToast(response.message, 'success');
      cerrarModalMovimiento();
      
      // Recargar datos
      await cargarDatosIniciales();
    } else {
      mostrarToast(response.message || 'Error al registrar movimiento', 'error');
    }

  } catch (error) {
    console.error('Error al registrar movimiento:', error);
    mostrarToast('Error al registrar movimiento', 'error');
  } finally {
    // Rehabilitar botón
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '✅ Registrar Movimiento';
    }
  }
}

// =====================================================
// MODAL: STOCK BAJO
// =====================================================

async function verStockBajo() {
  const modal = document.getElementById('modalStockBajo');
  const lista = document.getElementById('listaStockBajo');
  
  if (!modal || !lista) return;
  
  modal.style.display = 'flex';
  lista.innerHTML = '<div class="loading">Cargando...</div>';

  try {
    const response = await api.get('/inventario/stock-bajo');
    const productos = response.data || [];

    if (productos.length === 0) {
      lista.innerHTML = `
        <p style="padding: 2rem; text-align: center; color: #95a5a6;">
          ✅ No hay productos con stock bajo
        </p>
      `;
      return;
    }

    lista.innerHTML = productos.map(p => `
      <div style="padding: 15px; border: 1px solid #ffc107; border-radius: 8px; margin-bottom: 10px; background: #fff3cd;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="margin: 0 0 8px 0;">${p.nombre} (${p.codigo})</h4>
            <p style="margin: 0 0 5px 0; font-size: 14px;">
              <strong>Stock actual:</strong> ${p.stock} | 
              <strong>Stock mínimo:</strong> ${p.stock_minimo} | 
              <strong>Requiere:</strong> ${p.cantidad_requerida || (p.stock_minimo - p.stock)} unidades
            </p>
            <p style="margin: 0; font-size: 13px; color: #666;">
              <strong>Proveedor:</strong> ${p.proveedor || 'N/A'} 
              ${p.telefono_proveedor ? `| Tel: ${p.telefono_proveedor}` : ''}
            </p>
          </div>
          
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error al cargar stock bajo:', error);
    lista.innerHTML = '<p style="color: #e74c3c; padding: 2rem; text-align: center;">Error al cargar datos</p>';
  }
}

function cerrarModalStockBajo() {
  const modal = document.getElementById('modalStockBajo');
  if (modal) modal.style.display = 'none';
}

function verificarStockBajo() {
  const productosStockBajo = inventarioOriginal.filter(p => 
    p.stock <= p.stock_minimo
  );

  if (productosStockBajo.length > 0) {
    const alertasSection = document.getElementById('alertasStockBajo');
    const alertaTexto = document.getElementById('alertaTexto');
    if (alertasSection) alertasSection.style.display = 'block';
    if (alertaTexto) {
      alertaTexto.textContent = `Hay ${productosStockBajo.length} producto(s) que necesitan reabastecimiento.`;
    }
  }
}

// =====================================================
// MODAL: REPORTE
// =====================================================

async function verReporte() {
  const modal = document.getElementById('modalReporte');
  const contenido = document.getElementById('contenidoReporte');
  
  if (!modal || !contenido) return;
  
  modal.style.display = 'flex';
  contenido.innerHTML = '<div class="loading" style="text-align: center; padding: 40px;">Generando reporte...</div>';

  try {
    const response = await api.get('/inventario/reporte');
    const datos = response.data;

    contenido.innerHTML = `
      <div style="padding: 1rem;">
        <h3 style="margin-bottom: 1rem; color: #667eea;">📊 Resumen General</h3>
        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
            <div>
              <p style="color: #666; font-size: 0.875rem;">Total Productos</p>
              <p style="font-size: 1.5rem; font-weight: 700;">${datos.resumen.total_productos}</p>
            </div>
            <div>
              <p style="color: #666; font-size: 0.875rem;">Total Unidades</p>
              <p style="font-size: 1.5rem; font-weight: 700;">${formatearNumero(datos.resumen.total_unidades)}</p>
            </div>
            <div>
              <p style="color: #666; font-size: 0.875rem;">Valor Total</p>
              <p style="font-size: 1.5rem; font-weight: 700;">${formatearMoneda(datos.resumen.valor_total)}</p>
            </div>
          </div>
        </div>

        <p style="text-align: center; color: #999; margin-top: 2rem; font-size: 0.875rem;">
          Reporte generado el ${formatearFechaCompleta(datos.fecha_reporte || new Date())}
        </p>
      </div>
    `;

  } catch (error) {
    console.error('Error al generar reporte:', error);
    contenido.innerHTML = '<p style="color: #e74c3c; padding: 2rem; text-align: center;">Error al generar reporte</p>';
  }
}

function cerrarModalReporte() {
  const modal = document.getElementById('modalReporte');
  if (modal) modal.style.display = 'none';
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function cerrarModales() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

function verTodosMovimientos() {
  mostrarToast('Función en desarrollo', 'info');
}

function exportarInventario() {
  const headers = ['Código', 'Producto', 'Categoría', 'Stock', 'Stock Mín', 'P. Compra', 'P. Venta', 'Valor Stock'];
  const rows = inventarioOriginal.map(p => [
    p.codigo || '',
    p.nombre,
    p.categoria || '',
    p.stock,
    p.stock_minimo,
    p.precio_compra,
    p.precio_venta,
    p.valor_stock || (p.stock * p.precio_compra)
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  mostrarToast('Inventario exportado', 'success');
}

function imprimirInventario() {
  window.print();
}

function descargarReporte() {
  mostrarToast('Función de descarga PDF en desarrollo', 'info');
}

function generarOrdenCompra() {
  mostrarToast('Función en desarrollo', 'info');
}

function volverDashboard() {
  // No hacer nada, ya estamos en el dashboard
  console.log('Ya estamos en el dashboard');
}

// =====================================================
// HELPERS DE FORMATO
// =====================================================

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN'
  }).format(valor || 0);
}

function formatearNumero(valor) {
  return new Intl.NumberFormat('es-PE').format(valor || 0);
}

function formatearFecha(fecha) {
  const d = new Date(fecha);
  const opciones = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('es-PE', opciones);
}

function formatearFechaCompleta(fecha) {
  const d = new Date(fecha);
  const opciones = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('es-PE', opciones);
}

function getBadgeClass(estado) {
  switch (estado) {
    case 'bajo': return 'danger';
    case 'medio': return 'warning';
    case 'normal': return 'success';
    default: return 'success';
  }
}

function getEstadoTexto(estado) {
  switch (estado) {
    case 'bajo': return '⚠️ Bajo';
    case 'medio': return '⚡ Medio';
    case 'normal': return '✅ Normal';
    default: return 'Normal';
  }
}

function getTipoIcon(tipo) {
  switch (tipo) {
    case 'entrada': return '➕';
    case 'salida': return '➖';
    case 'ajuste': return '🔧';
    default: return '📦';
  }
}

function getTipoTexto(tipo) {
  switch (tipo) {
    case 'entrada': return 'Entrada';
    case 'salida': return 'Salida';
    case 'ajuste': return 'Ajuste';
    default: return tipo;
  }
}

// =====================================================
// TOAST NOTIFICATIONS
// =====================================================

function mostrarToast(mensaje, tipo = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.log('📢 Toast:', mensaje);
    return;
  }
  
  toast.textContent = mensaje;
  toast.className = `toast ${tipo}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// =====================================================
// EXPONER FUNCIONES GLOBALES
// =====================================================

window.abrirModalMovimiento = abrirModalMovimiento;
window.cerrarModalMovimiento = cerrarModalMovimiento;
window.verStockBajo = verStockBajo;
window.cerrarModalStockBajo = cerrarModalStockBajo;
window.verReporte = verReporte;
window.cerrarModalReporte = cerrarModalReporte;
window.limpiarFiltros = limpiarFiltros;
// window.verTodosMovimientos = verTodosMovimientos;
window.exportarInventario = exportarInventario;
window.imprimirInventario = imprimirInventario;
window.descargarReporte = descargarReporte;
window.generarOrdenCompra = generarOrdenCompra;
window.volverDashboard = volverDashboard;