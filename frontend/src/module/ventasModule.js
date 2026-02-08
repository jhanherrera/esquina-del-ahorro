// ============================================
// MÓDULO DE VENTAS - COMPLETO
// ============================================

import * as API from '../utils/api.js'; 

// Variables globales del módulo
let ventasData = [];
let clientesData = [];
let productosVenta = [];

// ============================================
// INICIALIZACIÓN
// ============================================

export function inicializarModuloVentas() {
  console.log('📦 Inicializando módulo de ventas...');
  
  cargarVentas();
  cargarEstadisticasVentas();
  configurarFiltrosFechas();
  configurarEventListeners();
}

// ============================================
// CARGAR DATOS
// ============================================

async function cargarVentas(filtros = {}) {
  const tabla = document.getElementById('tablaVentas');
  
  try {
    tabla.innerHTML = '<tr><td colspan="8" class="text-center"><div class="loading">Cargando ventas...</div></td></tr>';
    
    const ventas = await API.obtenerVentas(filtros);
    ventasData = ventas;
    
    if (!ventas || ventas.length === 0) {
      tabla.innerHTML = '<tr><td colspan="8" class="text-center">No hay ventas registradas</td></tr>';
      return;
    }
    
    renderizarTablaVentas(ventas);
    
  } catch (error) {
    console.error('Error al cargar ventas:', error);
    tabla.innerHTML = '<tr><td colspan="8" class="text-center error">Error al cargar ventas</td></tr>';
  }
}

function renderizarTablaVentas(ventas) {
  const tabla = document.getElementById('tablaVentas');
  
  tabla.innerHTML = ventas.map(venta => `
    <tr>
      <td><strong>${venta.numero_venta}</strong></td>
      <td>${formatearFecha(venta.fecha)}</td>
      <td>${venta.cliente || 'Cliente General'}</td>
      <td>${venta.vendedor || 'N/A'}</td>
      <td><strong>S/ ${parseFloat(venta.total).toFixed(2)}</strong></td>
      <td>
        <span class="badge badge-${venta.metodo_pago}">
          ${obtenerIconoMetodoPago(venta.metodo_pago)} ${capitalizar(venta.metodo_pago)}
        </span>
      </td>
      <td>
        <span class="badge badge-${venta.estado}">
          ${capitalizar(venta.estado)}
        </span>
      </td>
      <td>
        <button class="btn-icon" onclick="verDetalleVenta(${venta.id})" title="Ver detalle">
          👁️
        </button>
        ${venta.estado === 'completada' ? `
          <button class="btn-icon btn-danger" onclick="confirmarAnularVenta(${venta.id})" title="Anular venta">
            ❌
          </button>
        ` : ''}
      </td>
    </tr>
  `).join('');
}

// ============================================
// ESTADÍSTICAS
// ============================================

async function cargarEstadisticasVentas() {
  try {
    const hoy = new Date().toISOString().split('T')[0];
    const ventas = await API.obtenerVentas({ 
      fecha_inicio: hoy, 
      fecha_fin: hoy 
    });
    
    if (!ventas) return;
    
    const ventasCompletadas = ventas.filter(v => v.estado === 'completada');
    
    // Total de ventas
    document.getElementById('totalVentasHoy').textContent = ventasCompletadas.length;
    
    // Total recaudado
    const totalRecaudado = ventasCompletadas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
    document.getElementById('montoTotalHoy').textContent = `S/ ${totalRecaudado.toFixed(2)}`;
    
    // Clientes únicos
    const clientesUnicos = new Set(ventasCompletadas.map(v => v.cliente_id).filter(Boolean));
    document.getElementById('totalClientesHoy').textContent = clientesUnicos.size;
    
    // Promedio por venta
    const promedio = ventasCompletadas.length > 0 ? totalRecaudado / ventasCompletadas.length : 0;
    document.getElementById('promedioVenta').textContent = `S/ ${promedio.toFixed(2)}`;
    
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  }
}

// ============================================
// VER DETALLE DE VENTA
// ============================================

window.verDetalleVenta = async function(ventaId) {
  try {
    const venta = ventasData.find(v => v.id === ventaId);
    
    if (!venta) {
      mostrarToast('❌ Venta no encontrada');
      return;
    }
    
    // Cargar detalle de productos
    const detalle = await API.obtenerDetalleVenta(ventaId);
    
    // Llenar modal con información
    document.getElementById('detalleNumero').textContent = venta.numero_venta;
    document.getElementById('detalleFecha').textContent = formatearFecha(venta.fecha);
    document.getElementById('detalleCliente').textContent = venta.cliente || 'Cliente General';
    document.getElementById('detalleVendedor').textContent = venta.vendedor || 'N/A';
    
    // Tabla de productos
    const tablaProductos = document.getElementById('detalleProductos');
    tablaProductos.innerHTML = detalle.map(item => `
      <tr>
        <td>${item.producto}</td>
        <td>${item.cantidad}</td>
        <td>S/ ${parseFloat(item.precio_unitario).toFixed(2)}</td>
        <td>S/ ${parseFloat(item.subtotal).toFixed(2)}</td>
      </tr>
    `).join('');
    
    // Totales
    document.getElementById('detalleSubtotal').textContent = `S/ ${parseFloat(venta.subtotal).toFixed(2)}`;
    document.getElementById('detalleDescuento').textContent = `S/ ${parseFloat(venta.descuento || 0).toFixed(2)}`;
    document.getElementById('detalleIGV').textContent = `S/ ${parseFloat(venta.impuesto).toFixed(2)}`;
    document.getElementById('detalleTotal').textContent = `S/ ${parseFloat(venta.total).toFixed(2)}`;
    
    // Mostrar modal
    document.getElementById('modalDetalleVenta').style.display = 'flex';
    
  } catch (error) {
    console.error('Error al ver detalle:', error);
    mostrarToast('❌ Error al cargar el detalle de la venta');
  }
};

window.cerrarModalDetalle = function() {
  document.getElementById('modalDetalleVenta').style.display = 'none';
};

// ============================================
// ANULAR VENTA
// ============================================

window.confirmarAnularVenta = function(ventaId) {
  const venta = ventasData.find(v => v.id === ventaId);
  
  if (!venta) {
    mostrarToast('❌ Venta no encontrada');
    return;
  }
  
  if (confirm(`¿Está seguro de anular la venta ${venta.numero_venta}?\n\nEsta acción devolverá el stock de los productos.`)) {
    anularVenta(ventaId);
  }
};

async function anularVenta(ventaId) {
  try {
    const resultado = await API.anularVenta(ventaId);
    
    if (resultado.success) {
      mostrarToast('✅ Venta anulada exitosamente');
      cargarVentas();
      cargarEstadisticasVentas();
    } else {
      mostrarToast(`❌ ${resultado.message || 'Error al anular venta'}`);
    }
    
  } catch (error) {
    console.error('Error al anular venta:', error);
    mostrarToast('❌ Error al anular la venta');
  }
}

// ============================================
// FILTROS
// ============================================

function configurarFiltrosFechas() {
  const hoy = new Date().toISOString().split('T')[0];
  const hace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  document.getElementById('fechaInicio').value = hace7Dias;
  document.getElementById('fechaFin').value = hoy;
}

window.filtrarVentas = function() {
  const fechaInicio = document.getElementById('fechaInicio').value;
  const fechaFin = document.getElementById('fechaFin').value;
  const estado = document.getElementById('filtroEstado').value;
  
  const filtros = {};
  
  if (fechaInicio) filtros.fecha_inicio = fechaInicio;
  if (fechaFin) filtros.fecha_fin = fechaFin;
  if (estado) filtros.estado = estado;
  
  cargarVentas(filtros);
};

window.limpiarFiltrosVentas = function() {
  configurarFiltrosFechas();
  document.getElementById('filtroEstado').value = '';
  cargarVentas();
};

// ============================================
// EXPORTAR VENTAS
// ============================================

window.exportarVentas = function() {
  if (!ventasData || ventasData.length === 0) {
    mostrarToast('⚠️ No hay ventas para exportar');
    return;
  }
  
  try {
    // Crear CSV
    let csv = 'N° Venta,Fecha,Cliente,Vendedor,Subtotal,Descuento,IGV,Total,Método Pago,Estado\n';
    
    ventasData.forEach(venta => {
      csv += `${venta.numero_venta},`;
      csv += `${formatearFecha(venta.fecha)},`;
      csv += `${venta.cliente || 'Cliente General'},`;
      csv += `${venta.vendedor || 'N/A'},`;
      csv += `${parseFloat(venta.subtotal).toFixed(2)},`;
      csv += `${parseFloat(venta.descuento || 0).toFixed(2)},`;
      csv += `${parseFloat(venta.impuesto).toFixed(2)},`;
      csv += `${parseFloat(venta.total).toFixed(2)},`;
      csv += `${venta.metodo_pago},`;
      csv += `${venta.estado}\n`;
    });
    
    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast('✅ Ventas exportadas exitosamente');
    
  } catch (error) {
    console.error('Error al exportar:', error);
    mostrarToast('❌ Error al exportar ventas');
  }
};

// ============================================
// NUEVA VENTA RÁPIDA
// ============================================

window.nuevaVentaRapida = function() {
  // Cambiar a la sección de POS
  const posSection = document.querySelector('[data-section="pos"]');
  if (posSection) {
    posSection.click();
  }
  mostrarToast('💡 Cambiando al punto de venta...');
};

// ============================================
// IMPRIMIR VENTA
// ============================================

window.imprimirVenta = function() {
  window.print();
};

// ============================================
// EVENT LISTENERS
// ============================================

function configurarEventListeners() {
  // Filtro en tiempo real por fecha
  document.getElementById('fechaInicio')?.addEventListener('change', filtrarVentas);
  document.getElementById('fechaFin')?.addEventListener('change', filtrarVentas);
  document.getElementById('filtroEstado')?.addEventListener('change', filtrarVentas);
}

// ============================================
// UTILIDADES
// ============================================

function formatearFecha(fecha) {
  const date = new Date(fecha);
  const opciones = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('es-PE', opciones);
}

function capitalizar(texto) {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function obtenerIconoMetodoPago(metodo) {
  const iconos = {
    'efectivo': '💵',
    'tarjeta': '💳',
    'transferencia': '📱',
    'credito': '📋'
  };
  return iconos[metodo] || '💰';
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.style.display = 'block';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}