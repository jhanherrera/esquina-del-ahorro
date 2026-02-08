import {
  obtenerVentas,
  obtenerDetalleVenta,
  obtenerClientes
} from '../utils/api.js';
import { formatearMoneda } from '../utils/helpers.js';

const state = {
  initialized: false,
  escuchandoEventos: false,
  onVentaRegistrada: null,
  ventas: [],
  clientes: [],
  productosVendidosHoy: 0
};

const dom = {};

const asegurarArray = (valor) => (Array.isArray(valor) ? valor : []);

const escapeHtml = (texto = '') =>
  String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const fechaLocalISO = (fecha = new Date()) => {
  const f = new Date(fecha);
  if (Number.isNaN(f.getTime())) return '';

  const y = f.getFullYear();
  const m = String(f.getMonth() + 1).padStart(2, '0');
  const d = String(f.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatearFecha = (fecha) => {
  const f = new Date(fecha);
  if (Number.isNaN(f.getTime())) return '-';

  return f.toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const estadoClass = (estado = '') => {
  const valor = String(estado).toLowerCase();
  if (valor === 'anulada') return 'ventas-status ventas-status-anulada';
  if (valor === 'pendiente') return 'ventas-status ventas-status-pendiente';
  return 'ventas-status ventas-status-completada';
};

const capitalizar = (texto = '') => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const mostrarToast = (mensaje, tipo = 'success') => {
  if (!dom.toast) return;

  dom.toast.textContent = mensaje;
  dom.toast.className = `ventas-toast ${tipo}`;
  dom.toast.style.display = 'block';

  window.setTimeout(() => {
    dom.toast.style.display = 'none';
  }, 2500);
};

const abrirModal = (modal) => {
  if (!modal) return;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
};

const cerrarModal = (modal) => {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
};

const activarSeccion = (sectionId) => {
  const link = document.querySelector(`.menu a[data-section="${sectionId}"]`);
  if (link) {
    link.click();
    return;
  }

  const sections = document.querySelectorAll('main.content > .section');
  sections.forEach((n) => n.classList.toggle('active', n.id === sectionId));

  const links = document.querySelectorAll('.menu a[data-section]');
  links.forEach((a) => a.classList.toggle('active', a.dataset.section === sectionId));
};

const obtenerFiltrosApi = () => {
  const filtros = {};
  const inicio = dom.fechaInicio?.value;
  const fin = dom.fechaFin?.value;

  if (inicio) filtros.fecha_inicio = inicio;
  if (fin) filtros.fecha_fin = fin;

  return filtros;
};

const filtrarVentasLocal = () => {
  const texto = String(dom.buscar?.value || '').trim().toLowerCase();
  const metodo = String(dom.filtroMetodo?.value || '').toLowerCase();
  const cliente = String(dom.filtroCliente?.value || '');
  const estado = String(dom.filtroEstado?.value || '').toLowerCase();

  return state.ventas.filter((venta) => {
    const numero = String(venta?.numero_venta || `V-${venta?.id || ''}`).toLowerCase();
    const nombreCliente = String(venta?.cliente || '').toLowerCase();
    const metodoVenta = String(venta?.metodo_pago || '').toLowerCase();
    const estadoVenta = String(venta?.estado || '').toLowerCase();

    const okTexto = !texto || numero.includes(texto) || nombreCliente.includes(texto);
    const okMetodo = !metodo || metodoVenta === metodo;
    const okCliente = !cliente || String(venta?.cliente_id || '') === cliente;
    const okEstado = !estado || estadoVenta === estado;

    return okTexto && okMetodo && okCliente && okEstado;
  });
};

const renderizarClientesFiltro = () => {
  if (!dom.filtroCliente) return;

  const seleccionado = dom.filtroCliente.value;
  dom.filtroCliente.innerHTML = '<option value="">Todas las clientas</option>';

  state.clientes.forEach((cliente) => {
    const id = cliente?.id;
    const nombre = cliente?.nombre || 'Cliente';
    dom.filtroCliente.innerHTML += `<option value="${id}">${escapeHtml(nombre)}</option>`;
  });

  if (seleccionado) {
    dom.filtroCliente.value = seleccionado;
  }
};

const renderizarHistorialReciente = (ventasFiltradas) => {
  if (!dom.ventasRecientes) return;

  if (!ventasFiltradas.length) {
    dom.ventasRecientes.innerHTML = '<p class="empty-cart">Sin ventas registradas</p>';
    return;
  }

  const recientes = ventasFiltradas.slice(0, 12);

  dom.ventasRecientes.innerHTML = recientes
    .map((venta) => {
      const numero = venta?.numero_venta || `V-${venta?.id || '-'}`;
      const cliente = venta?.cliente || 'Cliente general';
      const metodo = capitalizar(venta?.metodo_pago || 'efectivo');
      const estado = capitalizar(venta?.estado || 'completada');
      const total = formatearMoneda(Number(venta?.total || 0));

      return `
        <article class="ventas-history-item">
          <div class="ventas-history-main">
            <span class="ventas-history-title">${escapeHtml(numero)} - ${escapeHtml(cliente)}</span>
            <span class="ventas-history-meta">${escapeHtml(formatearFecha(venta?.fecha))} | ${escapeHtml(metodo)}</span>
            <span class="${estadoClass(venta?.estado)}">${escapeHtml(estado)}</span>
          </div>
          <div class="ventas-history-total">${total}</div>
        </article>
      `;
    })
    .join('');
};

const renderizarTablaHistorial = (ventasFiltradas) => {
  if (!dom.tablaHistorial) return;

  if (!ventasFiltradas.length) {
    dom.tablaHistorial.innerHTML = `
      <tr>
        <td colspan="6" class="text-center">No hay ventas para mostrar</td>
      </tr>
    `;
    return;
  }

  dom.tablaHistorial.innerHTML = ventasFiltradas
    .map((venta) => {
      const numero = venta?.numero_venta || `V-${venta?.id || '-'}`;
      const cliente = venta?.cliente || 'Cliente general';
      const metodo = capitalizar(venta?.metodo_pago || 'efectivo');
      const estado = capitalizar(venta?.estado || 'completada');
      const total = formatearMoneda(Number(venta?.total || 0));

      return `
        <tr>
          <td>${escapeHtml(numero)}</td>
          <td>${escapeHtml(formatearFecha(venta?.fecha))}</td>
          <td>${escapeHtml(cliente)}</td>
          <td>${escapeHtml(metodo)}</td>
          <td><span class="${estadoClass(venta?.estado)}">${escapeHtml(estado)}</span></td>
          <td>${total}</td>
        </tr>
      `;
    })
    .join('');
};

const calcularProductosVendidos = async (ventas) => {
  if (!ventas.length) return 0;

  const detalles = await Promise.all(
    ventas.map(async (venta) => {
      try {
        return await obtenerDetalleVenta(venta.id);
      } catch (error) {
        console.error('Error al obtener detalle de venta:', error);
        return [];
      }
    })
  );

  return detalles
    .flat()
    .reduce((acc, item) => acc + Number(item?.cantidad || 0), 0);
};

const cargarEstadisticasHoy = async () => {
  const hoy = fechaLocalISO(new Date());
  const ventasHoyData = await obtenerVentas({ fecha_inicio: hoy, fecha_fin: hoy });
  const ventasHoy = asegurarArray(ventasHoyData).filter(
    (v) => String(v?.estado || '').toLowerCase() !== 'anulada'
  );

  const totalVentas = ventasHoy.length;
  const montoTotal = ventasHoy.reduce((acc, v) => acc + Number(v?.total || 0), 0);

  const clientas = new Set(
    ventasHoy
      .map((v) => v?.cliente_id || v?.cliente)
      .filter(Boolean)
  );

  const productosVendidos = await calcularProductosVendidos(ventasHoy);

  state.productosVendidosHoy = productosVendidos;

  if (dom.totalVentasHoy) dom.totalVentasHoy.textContent = String(totalVentas);
  if (dom.montoTotalHoy) dom.montoTotalHoy.textContent = formatearMoneda(montoTotal);
  if (dom.totalClientasHoy) dom.totalClientasHoy.textContent = String(clientas.size);
  if (dom.productosVendidosHoy) dom.productosVendidosHoy.textContent = String(productosVendidos);
};

const aplicarRender = () => {
  const filtradas = filtrarVentasLocal();
  renderizarHistorialReciente(filtradas);
  renderizarTablaHistorial(filtradas);
};

const recargarDatosVentas = async () => {
  const filtros = obtenerFiltrosApi();

  const [ventasData, clientesData] = await Promise.all([
    obtenerVentas(filtros),
    obtenerClientes()
  ]);

  state.ventas = asegurarArray(ventasData);
  state.clientes = asegurarArray(clientesData);

  renderizarClientesFiltro();
  aplicarRender();
  await cargarEstadisticasHoy();
};

const cachearDom = () => {
  dom.totalVentasHoy = document.getElementById('ventasTotalVentasHoy');
  dom.montoTotalHoy = document.getElementById('ventasMontoTotalHoy');
  dom.totalClientasHoy = document.getElementById('ventasTotalClientasHoy');
  dom.productosVendidosHoy = document.getElementById('ventasProductosVendidosHoy');

  dom.buscar = document.getElementById('ventasBuscar');
  dom.filtroMetodo = document.getElementById('ventasFiltroMetodo');
  dom.filtroCliente = document.getElementById('ventasFiltroCliente');
  dom.filtroEstado = document.getElementById('ventasFiltroEstado');
  dom.fechaInicio = document.getElementById('ventasFechaInicio');
  dom.fechaFin = document.getElementById('ventasFechaFin');

  dom.ventasRecientes = document.getElementById('ventasRecientes');
  dom.tablaHistorial = document.getElementById('ventasTablaHistorial');
  dom.modalHistorial = document.getElementById('ventasModalHistorial');
  dom.toast = document.getElementById('ventasToast');
};

const setFechasIniciales = () => {
  if (!dom.fechaInicio || !dom.fechaFin) return;

  const hoy = new Date();
  const hace7 = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (!dom.fechaFin.value) dom.fechaFin.value = fechaLocalISO(hoy);
  if (!dom.fechaInicio.value) dom.fechaInicio.value = fechaLocalISO(hace7);
};

const configurarEventos = () => {
  [dom.buscar, dom.filtroMetodo, dom.filtroCliente, dom.filtroEstado].forEach((input) => {
    input?.addEventListener('input', aplicarRender);
    input?.addEventListener('change', aplicarRender);
  });

  [dom.fechaInicio, dom.fechaFin].forEach((input) => {
    input?.addEventListener('change', () => {
      recargarDatosVentas().catch((error) => {
        console.error('Error al aplicar filtro de fechas:', error);
        mostrarToast('No se pudo cargar ventas', 'error');
      });
    });
  });

  dom.modalHistorial?.addEventListener('click', (event) => {
    if (event.target === dom.modalHistorial) {
      cerrarModal(dom.modalHistorial);
    }
  });
};

const asegurarInicializacionDom = () => {
  if (state.initialized) return;
  cachearDom();
  setFechasIniciales();
  configurarEventos();
  state.initialized = true;
};

const abrirHistorial = () => {
  asegurarInicializacionDom();
  aplicarRender();
  abrirModal(dom.modalHistorial);
};

const cerrarHistorial = () => {
  asegurarInicializacionDom();
  cerrarModal(dom.modalHistorial);
};

const irAPos = () => {
  activarSeccion('pos');
  mostrarToast('Abriendo Punto de Venta...', 'success');
};

const actualizarVentas = async () => {
  asegurarInicializacionDom();
  await recargarDatosVentas();
  if (typeof state.onVentaRegistrada === 'function') {
    state.onVentaRegistrada();
  }
  mostrarToast('Ventas actualizadas', 'success');
};

export const inicializarModuloVentasDashboard = async (options = {}) => {
  if (typeof options.onVentaRegistrada === 'function') {
    state.onVentaRegistrada = options.onVentaRegistrada;
  }

  asegurarInicializacionDom();

  if (!state.escuchandoEventos) {
    window.addEventListener('venta:registrada', async () => {
      await recargarDatosVentas();
      if (typeof state.onVentaRegistrada === 'function') {
        state.onVentaRegistrada();
      }
    });
    window.addEventListener('ventas:refresh-request', async () => {
      await actualizarVentas();
    });
    state.escuchandoEventos = true;
  }

  await recargarDatosVentas();
};

export const refrescarModuloVentasDashboard = async () => {
  asegurarInicializacionDom();
  await recargarDatosVentas();
};

window.ventasAbrirHistorial = abrirHistorial;
window.ventasCerrarHistorial = cerrarHistorial;
window.ventasIrPos = irAPos;
window.ventasActualizar = () => {
  actualizarVentas().catch((error) => {
    console.error('Error al actualizar ventas:', error);
    mostrarToast('No se pudo actualizar ventas', 'error');
  });
};
window.__ventasActualizarImpl = window.ventasActualizar;
